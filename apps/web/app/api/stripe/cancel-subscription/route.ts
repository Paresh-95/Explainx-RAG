// app/api/stripe/cancel-subscription/route.ts
import { NextResponse } from "next/server";
import { stripe } from "../../../../lib/stripe";
import { auth } from "../../../../auth";
import prisma from "@repo/db/client";

export async function POST() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userOrg = await prisma.userOrganization.findFirst({
      where: {
        userId: session.user.id,
      },
      include: {
        organization: {
          select: {
            id: true,
            stripeSubscriptionId: true,
            subscriptionPlan: true,
            subscriptionStatus: true,
            subscriptionEndDate: true,
          },
        },
      },
    });

    if (!userOrg?.organization) {
      return NextResponse.json(
        { error: "No organization found for user" },
        { status: 404 },
      );
    }

    if (!userOrg.organization.stripeSubscriptionId) {
      if (
        userOrg.organization.subscriptionPlan &&
        userOrg.organization.subscriptionPlan !== "FREE"
      ) {
        await prisma.organization.update({
          where: { id: userOrg.organization.id },
          data: {
            subscriptionPlan: "FREE",
            subscriptionStatus: "CANCELLED",
            subscriptionEndDate: new Date(),
            stripeSubscriptionId: null,
          },
        });

        return NextResponse.json({
          message:
            "Subscription reset to free plan (no active Stripe subscription found)",
          endDate: new Date(),
          wasTrialing: false,
        });
      }

      return NextResponse.json(
        { error: "No active subscription found" },
        { status: 404 },
      );
    }

    let currentSubscription;
    try {
      currentSubscription = (await stripe.subscriptions.retrieve(
        userOrg.organization.stripeSubscriptionId,
      )) as any; // Type assertion to access plan property
    } catch (stripeError) {
      await prisma.organization.update({
        where: { id: userOrg.organization.id },
        data: {
          subscriptionPlan: "FREE",
          subscriptionStatus: "CANCELLED",
          subscriptionEndDate: new Date(),
          stripeSubscriptionId: null,
        },
      });

      return NextResponse.json({
        message: "Subscription not found in Stripe, reset to free plan",
        endDate: new Date(),
        wasTrialing: false,
      });
    }

    const isInTrialPeriod = currentSubscription.status === "trialing";
    let subscription;
    let endDate: Date;

    if (isInTrialPeriod) {
      subscription = await stripe.subscriptions.cancel(
        userOrg.organization.stripeSubscriptionId,
      );

      endDate = new Date();

      await prisma.organization.update({
        where: { id: userOrg.organization.id },
        data: {
          subscriptionPlan: "FREE",
          subscriptionStatus: "CANCELLED",
          subscriptionEndDate: endDate,
        },
      });
    } else {
      subscription = await stripe.subscriptions.update(
        userOrg.organization.stripeSubscriptionId,
        {
          cancel_at_period_end: true,
        },
      );

      if (currentSubscription.start_date) {
        const interval = currentSubscription.plan?.interval || "month";
        const intervalCount = currentSubscription.plan?.interval_count || 1;

        endDate = new Date(currentSubscription.start_date * 1000);

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
      } else if (currentSubscription.billing_cycle_anchor) {
        endDate = new Date(currentSubscription.billing_cycle_anchor * 1000);
        const interval = currentSubscription.plan?.interval || "month";
        if (interval === "month") {
          endDate.setMonth(endDate.getMonth() + 1);
        } else {
          endDate.setMonth(endDate.getMonth() + 1);
        }
      } else {
        endDate = new Date();
        endDate.setMonth(endDate.getMonth() + 1);
      }
    }

    console.log(endDate, isInTrialPeriod);

    return NextResponse.json({
      message: "Subscription cancelled",
      endDate: endDate,
      wasTrialing: isInTrialPeriod,
    });
  } catch (err) {
    const errorMessage =
      err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
