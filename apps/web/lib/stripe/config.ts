export type PlanType = "BASIC" | "PRO" | "ENTERPRISE";

export interface PlanConfig {
  name: string;
  priceId: string;
}

export const getStripePriceId = (plan: PlanType): string => {
  const nodeEnv = process.env.NODE_ENV || "development";

  const prices = {
    development: {
      BASIC: process.env.LOCAL_STARTER,
      PRO: process.env.LOCAL_PRO,
      ENTERPRISE: process.env.LOCAL_ENTERPRISE,
    },
    production: {
      BASIC: process.env.PROD_STARTER,
      PRO: process.env.PROD_PRO,
      ENTERPRISE: process.env.PROD_ENTERPRISE,
    },
  };
  //@ts-ignore
  return prices[nodeEnv === "production" ? "production" : "development"][plan];
};

export const getPlanConfig = (priceId: string): PlanConfig | undefined => {
  const configs: Record<PlanType, PlanConfig> = {
    BASIC: {
      name: "Basic Plan",
      priceId: getStripePriceId("BASIC"),
    },
    PRO: {
      name: "Pro Plan",
      priceId: getStripePriceId("PRO"),
    },
    ENTERPRISE: {
      name: "Enterprise Plan",
      priceId: getStripePriceId("ENTERPRISE"),
    },
  };

  return Object.values(configs).find((config) => config.priceId === priceId);
};
