// app/api/stripe/verify-session/route.ts
import { NextRequest, NextResponse } from "next/server";
import { stripe } from "../../../../lib/stripe";
import { auth } from "../../../../auth";
import prisma from "@repo/db/client";
import { getPlanConfig } from "../../../../lib/stripe/config";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { sessionId } = await request.json();

    if (!sessionId) {
      return NextResponse.json(
        { error: "Session ID is required" },
        { status: 400 },
      );
    }

    // Retrieve the checkout session from Stripe
    const checkoutSession = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["subscription", "customer"],
    });

    if (!checkoutSession) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    // Verify the session was completed
    if (checkoutSession.payment_status !== "paid") {
      return NextResponse.json(
        { error: "Payment not completed" },
        { status: 400 },
      );
    }

    // Get subscription details if it exists - fetch fresh data from Stripe
    let subscriptionData = null;
    if (checkoutSession.subscription) {
      try {
        subscriptionData = (await stripe.subscriptions.retrieve(
          checkoutSession.subscription as string,
        )) as any;

        console.log("📋 Verify-session subscription data:", {
          id: subscriptionData.id,
          status: subscriptionData.status,
          start_date: subscriptionData.start_date,
          created: subscriptionData.created,
          trial_end: subscriptionData.trial_end,
          billing_interval: subscriptionData.plan?.interval,
        });
      } catch (err) {
        console.error("Failed to fetch subscription data:", err);
      }
    }

    // Get customer details
    const customer = checkoutSession.customer;
    const customerEmail =
      typeof customer === "object" && customer && "email" in customer
        ? customer.email
        : checkoutSession.customer_email;

    // Get plan information
    const priceId =
      checkoutSession.metadata?.priceId ||
      subscriptionData?.items?.data?.[0]?.price?.id;

    const planConfig = priceId ? getPlanConfig(priceId) : null;

    // Prepare response data
    const responseData: any = {
      customerEmail: customerEmail || session.user.email,
      planName: planConfig?.name || "Unknown Plan",
      amount: checkoutSession.amount_total || 0,
      currency: checkoutSession.currency || "usd",
      subscriptionId:
        typeof checkoutSession.subscription === "string"
          ? checkoutSession.subscription
          : subscriptionData?.id,
      sessionId: checkoutSession.id,
      paymentStatus: checkoutSession.payment_status,
    };

    // Add subscription timing information
    if (subscriptionData) {
      if (subscriptionData.trial_end) {
        responseData.trialEnd = new Date(
          subscriptionData.trial_end * 1000,
        ).toISOString();
      }

      // Calculate next billing date from start_date and billing interval
      if (subscriptionData.start_date) {
        const interval = subscriptionData.plan?.interval || "month";
        const intervalCount = subscriptionData.plan?.interval_count || 1;

        const nextBilling = new Date(subscriptionData.start_date * 1000);

        if (interval === "month") {
          nextBilling.setMonth(nextBilling.getMonth() + intervalCount);
        } else if (interval === "year") {
          nextBilling.setFullYear(nextBilling.getFullYear() + intervalCount);
        } else if (interval === "week") {
          nextBilling.setDate(nextBilling.getDate() + 7 * intervalCount);
        } else if (interval === "day") {
          nextBilling.setDate(nextBilling.getDate() + intervalCount);
        } else {
          nextBilling.setMonth(nextBilling.getMonth() + 1); // default monthly
        }

        responseData.nextBillingDate = nextBilling.toISOString();
      }
    }

    // Optional: Update user's organization subscription status in database
    // This might also be handled by your webhook, but doing it here ensures immediate update
    try {
      const organizationId = checkoutSession.metadata?.organizationId;
      if (organizationId && subscriptionData) {
        console.log("🔄 Updating organization from verify-session");

        // Calculate dates using the same logic as webhook
        let subscriptionStartDate: Date;
        let subscriptionEndDate: Date;
        let subscriptionStatus: "ACTIVE" | "TRIALING";

        if (
          subscriptionData.trial_end &&
          subscriptionData.status === "trialing"
        ) {
          // Trial subscription
          subscriptionStatus = "TRIALING";
          subscriptionStartDate = new Date(
            subscriptionData.trial_start! * 1000,
          );
          subscriptionEndDate = new Date(subscriptionData.trial_end * 1000);
        } else {
          // Active subscription (your case)
          subscriptionStatus = "ACTIVE";
          subscriptionStartDate = new Date(subscriptionData.start_date * 1000);

          // Calculate end date based on billing interval from plan
          const interval = subscriptionData.plan?.interval || "month";
          const intervalCount = subscriptionData.plan?.interval_count || 1;

          subscriptionEndDate = new Date(subscriptionData.start_date * 1000);

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
            subscriptionEndDate.setMonth(subscriptionEndDate.getMonth() + 1);
          }
        }

        // Validate dates
        if (
          isNaN(subscriptionStartDate.getTime()) ||
          isNaN(subscriptionEndDate.getTime())
        ) {
          console.error("❌ Invalid dates in verify-session:", {
            start_date: subscriptionData.start_date,
            calculated_start: subscriptionStartDate,
            calculated_end: subscriptionEndDate,
          });
          throw new Error("Invalid date calculation in verify-session");
        }

        await prisma.organization.update({
          where: { id: organizationId },
          data: {
            stripeSubscriptionId: subscriptionData.id,
            stripeCustomerId:
              typeof customer === "string" ? customer : customer?.id,
            subscriptionStatus: subscriptionStatus,
            subscriptionPlan: mapStripePlanToEnum(priceId || ""),
            subscriptionStartDate: subscriptionStartDate,
            subscriptionEndDate: subscriptionEndDate,
            hasUsedTrial: subscriptionData.trial_end ? true : false,
          },
        });

        console.log("✅ Organization updated from verify-session successfully");
      }
    } catch (dbError) {
      console.error("❌ Database update error in verify-session:", dbError);
      // Don't fail the response - webhook should handle it as primary source
    }

    return NextResponse.json(responseData);
  } catch (error) {
    console.error("Session verification error:", error);
    return NextResponse.json(
      { error: "Failed to verify session" },
      { status: 500 },
    );
  }
}

// Helper function to map Stripe price ID to your enum
function mapStripePlanToEnum(
  priceId: string,
): "BASIC" | "PRO" | "ENTERPRISE" | "FREE" {
  const planConfig = getPlanConfig(priceId);
  if (!planConfig) return "FREE";

  // This should match your plan mapping logic
  if (planConfig.name.includes("Basic") || planConfig.name.includes("BASIC"))
    return "BASIC";
  if (planConfig.name.includes("Pro") || planConfig.name.includes("PRO"))
    return "PRO";
  if (
    planConfig.name.includes("Enterprise") ||
    planConfig.name.includes("ENTERPRISE")
  )
    return "ENTERPRISE";

  return "FREE";
}
