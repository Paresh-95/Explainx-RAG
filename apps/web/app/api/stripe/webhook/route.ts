import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { stripe } from "../../../../lib/stripe";
import type Stripe from "stripe";
import { sendDiscordNotification } from "../../../../services/discord-notify";
import prisma from "@repo/db/client";
import {
  getSubscriptionPlan,
  updateSubscriptionInDatabase,
} from "../../../../lib/stripe/utils";

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export const config = {
  api: {
    bodyParser: false,
  },
};

async function handler(request: Request) {
  const body = await request.text();
  const headersList = await headers();
  const signature = headersList.get("stripe-signature") as string;

  let event: Stripe.Event;

  if (!signature) {
    return NextResponse.json(
      { message: "Missing Stripe signature" },
      { status: 400 },
    );
  }

  try {
    if (!webhookSecret) {
      throw new Error("Missing Stripe webhook secret");
    }
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    console.log(`❌ Error message: ${errorMessage}`);
    return NextResponse.json(
      { message: `Webhook Error: ${errorMessage}` },
      { status: 400 },
    );
  }

  try {
    switch (event.type) {
      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const priceId = subscription.items.data[0]?.price?.id;
        if (!priceId) {
          throw new Error("Missing priceId in subscription");
        }

        if (subscription.metadata?.organizationId) {
          // If this is a new subscription with trial, mark the organization as having used their trial
          if (
            event.type === "customer.subscription.created" &&
            subscription.trial_end
          ) {
            await prisma.organization.update({
              where: { id: subscription.metadata.organizationId },
              data: { hasUsedTrial: true },
            });
          }

          // Determine the correct subscription status based on Stripe's status
          let status: "ACTIVE" | "PAST_DUE" | "CANCELLED" | "TRIALING";
          if (subscription.status === "trialing") {
            status = "TRIALING";
          } else if (subscription.status === "active") {
            status = "ACTIVE";
          } else if (subscription.status === "past_due") {
            status = "PAST_DUE";
          } else {
            status = "CANCELLED";
          }

          // Calculate dates using start_date instead of current_period_start
          const subscriptionAny = subscription as any;
          const startDate = subscriptionAny.start_date
            ? new Date(subscriptionAny.start_date * 1000)
            : new Date(subscription.created * 1000);

          let endDate: Date;
          if (subscriptionAny.start_date) {
            const interval = subscriptionAny.plan?.interval || "month";
            const intervalCount = subscriptionAny.plan?.interval_count || 1;

            endDate = new Date(subscriptionAny.start_date * 1000);

            if (interval === "month") {
              endDate.setMonth(endDate.getMonth() + intervalCount);
            } else if (interval === "year") {
              endDate.setFullYear(endDate.getFullYear() + intervalCount);
            } else if (interval === "week") {
              endDate.setDate(endDate.getDate() + 7 * intervalCount);
            } else if (interval === "day") {
              endDate.setDate(endDate.getDate() + intervalCount);
            } else {
              endDate.setMonth(endDate.getMonth() + 1);
            }
          } else {
            endDate = new Date(startDate);
            endDate.setMonth(endDate.getMonth() + 1);
          }

          await updateSubscriptionInDatabase(
            subscription.metadata.organizationId,
            {
              plan: getSubscriptionPlan(priceId),
              status: status,
              startDate: startDate,
              endDate: endDate,
            },
          );

          // Notify about subscription changes
          const action =
            event.type === "customer.subscription.created" ? "New" : "Updated";
          await sendDiscordNotification(
            `${action} Subscription\n` +
              `Plan: ${getSubscriptionPlan(priceId)}\n` +
              `Status: ${subscription.status}\n` +
              `Organization: ${subscription.metadata.organizationId}` +
              (subscription.trial_end
                ? `\nTrial End: ${new Date(subscription.trial_end * 1000).toISOString()}`
                : ""),
          );
        }
        break;
      }
      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;

        if (subscription.metadata?.organizationId) {
          // If subscription was cancelled during trial, use trial_end as the end date
          const endDate =
            subscription.status === "trialing" && subscription.trial_end
              ? new Date(subscription.trial_end * 1000)
              : new Date(subscription.canceled_at! * 1000);

          await updateSubscriptionInDatabase(
            subscription.metadata.organizationId,
            {
              plan: "FREE",
              status: "CANCELLED",
              endDate,
            },
          );

          await sendDiscordNotification(
            `❌ Subscription Cancelled\n` +
              `Organization: ${subscription.metadata.organizationId}\n` +
              `Cancelled At: ${new Date(subscription.canceled_at! * 1000).toISOString()}\n` +
              `End Date: ${endDate.toISOString()}\n` +
              (subscription.status === "trialing"
                ? "Cancelled during trial period"
                : ""),
          );
        }
        break;
      }

      case "customer.subscription.trial_will_end": {
        const subscription = event.data.object as Stripe.Subscription;
        if (subscription.metadata?.organizationId) {
          await sendDiscordNotification(
            `⚠️ Trial Ending Soon\n` +
              `Organization: ${subscription.metadata.organizationId}\n` +
              `Trial End: ${new Date(subscription.trial_end! * 1000).toISOString()}`,
          );
        }
        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;
        const invoiceAny = invoice as any;
        if (invoiceAny.subscription && invoice.metadata?.organizationId) {
          await sendDiscordNotification(
            `💰 Payment Successful\n` +
              `Amount: ${(invoice.amount_paid / 100).toFixed(2)} ${invoice.currency.toUpperCase()}\n` +
              `Organization: ${invoice.metadata.organizationId}`,
          );
        }
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const invoiceAny = invoice as any;
        if (invoiceAny.subscription && invoice.metadata?.organizationId) {
          const priceId = invoiceAny.lines?.data?.[0]?.price?.id || "";
          await updateSubscriptionInDatabase(invoice.metadata.organizationId, {
            plan: getSubscriptionPlan(priceId),
            status: "PAST_DUE",
          });

          await sendDiscordNotification(
            `❌ Payment Failed\n` +
              `Amount: ${(invoice.amount_due / 100).toFixed(2)} ${invoice.currency.toUpperCase()}\n` +
              `Organization: ${invoice.metadata.organizationId}`,
          );
        }
        break;
      }

      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const customer = session.customer_details;

        if (session.metadata?.organizationId && session.subscription) {
          try {
            // Fetch subscription details directly from Stripe
            const subscription = (await stripe.subscriptions.retrieve(
              session.subscription as string,
            )) as any;

            const priceId = subscription.items.data[0]?.price?.id;
            if (!priceId) {
              throw new Error("Missing priceId in subscription");
            }

            // Calculate dates based on your actual subscription structure
            let subscriptionStartDate: Date;
            let subscriptionEndDate: Date;
            let subscriptionStatus: "ACTIVE" | "TRIALING";

            if (subscription.trial_end && subscription.status === "trialing") {
              // Trial subscription
              subscriptionStatus = "TRIALING";
              subscriptionStartDate = new Date(
                subscription.trial_start! * 1000,
              );
              subscriptionEndDate = new Date(subscription.trial_end * 1000);
            } else {
              // Active subscription (your case)
              subscriptionStatus = "ACTIVE";

              // Use start_date as the primary source for start date
              subscriptionStartDate = new Date(subscription.start_date * 1000);

              // Calculate end date based on billing interval from plan
              const interval = subscription.plan?.interval || "month";
              const intervalCount = subscription.plan?.interval_count || 1;

              subscriptionEndDate = new Date(subscription.start_date * 1000);

              // Add the billing period to get the end date
              if (interval === "month") {
                subscriptionEndDate.setMonth(
                  subscriptionEndDate.getMonth() + intervalCount,
                );
              } else if (interval === "year") {
                subscriptionEndDate.setFullYear(
                  subscriptionEndDate.getFullYear() + intervalCount,
                );
              } else if (interval === "week") {
                subscriptionEndDate.setDate(
                  subscriptionEndDate.getDate() + 7 * intervalCount,
                );
              } else if (interval === "day") {
                subscriptionEndDate.setDate(
                  subscriptionEndDate.getDate() + intervalCount,
                );
              } else {
                // Default fallback to monthly
                subscriptionEndDate.setMonth(
                  subscriptionEndDate.getMonth() + 1,
                );
              }
            }

            // Validate dates
            if (isNaN(subscriptionStartDate.getTime())) {
              throw new Error(
                `Invalid subscription start date. start_date: ${subscription.start_date}`,
              );
            }

            if (isNaN(subscriptionEndDate.getTime())) {
              throw new Error(
                `Invalid subscription end date calculated from start_date: ${subscription.start_date}`,
              );
            }

            // Update organization in database
            const updatedOrg = await prisma.organization.update({
              where: {
                id: session.metadata.organizationId,
              },
              data: {
                subscriptionPlan: getSubscriptionPlan(priceId),
                subscriptionStatus: subscriptionStatus,
                subscriptionStartDate: subscriptionStartDate,
                subscriptionEndDate: subscriptionEndDate,
                stripeSubscriptionId: session.subscription as string,
                stripeCustomerId: session.customer as string,
                hasUsedTrial: subscription.trial_end ? true : false, // false in your case
              },
            });

            // Send Discord notification
            const message =
              `🎉 New Subscription!\n` +
              `Plan: ${getSubscriptionPlan(priceId)}\n` +
              `Status: ${subscriptionStatus}\n` +
              `Amount: ${(session.amount_total! / 100).toFixed(2)} ${session.currency?.toUpperCase()}\n` +
              `Customer: ${customer?.name || "N/A"}\n` +
              `Email: ${customer?.email || "N/A"}\n` +
              `Organization: ${session.metadata.organizationId}\n` +
              `Subscription ID: ${session.subscription}\n` +
              `Period: ${subscriptionStartDate.toLocaleDateString()} - ${subscriptionEndDate.toLocaleDateString()}`;

            await sendDiscordNotification(message);
          } catch (error) {
            console.error("❌ Error in checkout.session.completed:", error);
            console.error("Session details for debugging:", {
              sessionId: session.id,
              organizationId: session.metadata?.organizationId,
              subscriptionId: session.subscription,
            });

            // Don't throw - let the webhook complete successfully
            // Stripe will retry failed webhooks automatically
          }
        } else {
          console.warn("⚠️ Missing required data in checkout session:", {
            hasOrgId: !!session.metadata?.organizationId,
            hasSubscription: !!session.subscription,
          });
        }
        break;
      }

      case "payment_intent.created": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;

        const message =
          `💫 New Payment Initiated\n` +
          `Amount: ${(paymentIntent.amount / 100).toFixed(2)} ${paymentIntent.currency.toUpperCase()}\n` +
          `Payment ID: ${paymentIntent.id}\n` +
          `Status: ${paymentIntent.status}`;

        await sendDiscordNotification(message);
        break;
      }

      case "payment_intent.requires_action": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;

        const message =
          `⚠️ Payment Requires Additional Action\n` +
          `Amount: ${(paymentIntent.amount / 100).toFixed(2)} ${paymentIntent.currency.toUpperCase()}\n` +
          `Payment ID: ${paymentIntent.id}\n` +
          `Required Action: ${paymentIntent.next_action?.type || "Unknown"}\n` +
          `Status: ${paymentIntent.status}`;

        await sendDiscordNotification(message);
        break;
      }

      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;

        const message =
          `💰 Payment Successfully Processed!\n` +
          `Amount: ${(paymentIntent.amount / 100).toFixed(2)} ${paymentIntent.currency.toUpperCase()}\n` +
          `Payment ID: ${paymentIntent.id}\n` +
          `Status: ${paymentIntent.status}`;

        await sendDiscordNotification(message);
        break;
      }

      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;

        const message =
          `❌ Payment Failed!\n` +
          `Amount: ${(paymentIntent.amount / 100).toFixed(2)} ${paymentIntent.currency.toUpperCase()}\n` +
          `Payment ID: ${paymentIntent.id}\n` +
          `Status: ${paymentIntent.status}\n` +
          `Error: ${paymentIntent.last_payment_error?.message || "Unknown error"}`;

        await sendDiscordNotification(message);
        break;
      }

      default: {
        // Log unhandled event types but don't send notification
      }
    }
  } catch (error) {
    console.error("Error processing webhook:", error);
    // Still return 200 to Stripe
  }

  return NextResponse.json({ received: true }, { status: 200 });
}

export { handler as POST };
