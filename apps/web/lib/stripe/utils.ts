import prisma from "@repo/db/client";
import { SubscriptionPlan } from "@prisma/client";

export const getSubscriptionPlan = (priceId: string): SubscriptionPlan => {
  const nodeEnv = process.env.NODE_ENV || "development";

  const planMap: Record<string, SubscriptionPlan> =
    nodeEnv === "production"
      ? {
          // Production prices only
          [process.env.PROD_STARTER || ""]: "BASIC",
          [process.env.PROD_PRO || ""]: "PRO",
          [process.env.PROD_ENTERPRISE || ""]: "ENTERPRISE",
        }
      : {
          // Development prices only
          [process.env.LOCAL_STARTER || ""]: "BASIC",
          [process.env.LOCAL_PRO || ""]: "PRO",
          [process.env.LOCAL_ENTERPRISE || ""]: "ENTERPRISE",
        };

  // Remove any empty keys from undefined env vars
  Object.keys(planMap).forEach((key) => {
    if (!key) delete planMap[key];
  });

  if (!priceId || !(priceId in planMap)) {
    console.warn(`Unknown price ID: ${priceId} in ${nodeEnv} environment`);
    return "FREE";
  }
  //@ts-ignore
  return planMap[priceId];
};

export async function updateSubscriptionInDatabase(
  organizationId: string,
  subscriptionData: {
    plan: string;
    status: "ACTIVE" | "PAST_DUE" | "CANCELLED" | "TRIALING";
    startDate?: Date;
    endDate?: Date;
  },
) {
  await prisma.organization.update({
    where: { id: organizationId },
    data: {
      subscriptionPlan: subscriptionData.plan as SubscriptionPlan,
      subscriptionStatus: subscriptionData.status,
      ...(subscriptionData.startDate && {
        subscriptionStartDate: subscriptionData.startDate,
      }),
      ...(subscriptionData.endDate && {
        subscriptionEndDate: subscriptionData.endDate,
      }),
    },
  });
}
