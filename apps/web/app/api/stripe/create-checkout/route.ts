// app/api/stripe/create-checkout/route.ts
import { NextResponse } from "next/server";
import { stripe } from "../../../../lib/stripe";
import { auth } from "../../../../auth";
import prisma from "@repo/db/client";
import { getPlanConfig } from "../../../../lib/stripe/config";

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { price, quantity = 1, successUrl, cancelUrl } = await request.json();
    if (!price) {
      return NextResponse.json({ error: "Price is required" }, { status: 400 });
    }

    const planConfig = getPlanConfig(price);
    if (!planConfig) {
      return NextResponse.json(
        { error: "Invalid price ID for current environment" },
        { status: 400 },
      );
    }

    const userOrg = await prisma.userOrganization.findFirst({
      where: { userId: session.user.id },
      include: { organization: true },
    });

    if (!userOrg?.organization) {
      return NextResponse.json(
        { error: "No organization found for user" },
        { status: 404 },
      );
    }

    const { organization } = userOrg;
    const environmentPrefix =
      process.env.NODE_ENV !== "production"
        ? `[${process.env.NODE_ENV?.toUpperCase()}] `
        : "";

    // Check if organization is eligible for trial
    const isTrialEligible = !organization.hasUsedTrial;

    const checkoutSession = await stripe.checkout.sessions.create({
      line_items: [{ price, quantity }],
      mode: "subscription",
      success_url:
        successUrl ||
        `${process.env.NEXT_PUBLIC_APP_URL}/plans/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url:
        cancelUrl ||
        `${process.env.NEXT_PUBLIC_APP_URL}/plans/payment/canceled`,
      metadata: {
        organizationId: organization.id,
        priceId: price,
        quantity: quantity.toString(),
        environment: process.env.NODE_ENV,
      },
      customer_email: session.user.email || undefined,
      billing_address_collection: "auto",
      custom_text: {
        submit: {
          message: isTrialEligible
            ? `Start your 7-day free trial of the ${planConfig.name} plan. After the trial, you will be charged monthly.`
            : `You will be charged monthly for the ${planConfig.name} plan.`,
        },
      },
      payment_method_collection: "always",
      subscription_data: {
        ...(isTrialEligible && {
          trial_period_days: 7,
          trial_settings: {
            end_behavior: {
              missing_payment_method: "cancel",
            },
          },
        }),
        description: `${environmentPrefix}${organization.name} - ${planConfig.name}`,
        metadata: {
          organizationId: organization.id,
          priceId: price,
          quantity: quantity.toString(),
          environment: process.env.NODE_ENV,
        },
      },
    });

    return NextResponse.json({
      sessionId: checkoutSession.id,
      url: checkoutSession.url,
    });
  } catch (err) {
    const errorMessage =
      err instanceof Error ? err.message : "Internal server error";
    console.log("Error creating checkout session:", errorMessage);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
