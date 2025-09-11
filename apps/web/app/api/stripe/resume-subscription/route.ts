// app/api/stripe/resume-subscription/route.ts
import { NextResponse } from "next/server";
import { stripe } from "../../../../lib/stripe";
import { auth } from "../../../../auth";
import prisma from "@repo/db/client";

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user's organization
    const userOrg = await prisma.userOrganization.findFirst({
      where: {
        userId: session.user.id,
      },
      include: {
        organization: {
          select: {
            id: true,
            stripeSubscriptionId: true,
          },
        },
      },
    });

    if (!userOrg?.organization?.stripeSubscriptionId) {
      return NextResponse.json(
        { error: "No subscription found" },
        { status: 404 },
      );
    }

    // Resume the subscription by removing cancel_at_period_end
    const subscription = await stripe.subscriptions.update(
      userOrg.organization.stripeSubscriptionId,
      {
        cancel_at_period_end: false,
      },
    );

    // Update the organization's subscription status
    await prisma.organization.update({
      where: { id: userOrg.organization.id },
      data: {
        subscriptionStatus: "ACTIVE",
        subscriptionEndDate: null,
      },
    });

    return NextResponse.json({
      message: "Subscription resumed",
    });
  } catch (err) {
    const errorMessage =
      err instanceof Error ? err.message : "Internal server error";
    console.error("Error resuming subscription:", errorMessage);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

