import { SubscriptionPlan } from "@prisma/client";

export const DEMO_PROFILE_ID = "209210807930034";

export const SUBSCRIPTION_PLANS = {
  FREE: "FREE",
  BASIC: "BASIC",
  PRO: "PRO",
  ENTERPRISE: "ENTERPRISE",
} as const;

export const SUBSCRIPTION_STATUS = {
  ACTIVE: "ACTIVE",
  CANCELLED: "CANCELLED",
  TRIALING: "TRIALING",
} as const;

export const PROFILE_LIMITS: Record<SubscriptionPlan, number> = {
  FREE: 10,
  BASIC: 1,
  PRO: 5,
  ENTERPRISE: Infinity,
};

export type BillingPeriod = "monthly" | "yearly";

export const BILLING_PERIODS: Record<
  Uppercase<BillingPeriod>,
  BillingPeriod
> = {
  MONTHLY: "monthly",
  YEARLY: "yearly",
} as const;

export const PLAN_FEATURES = {
  BASIC: {
    name: "Basic",
    monthlyPrice: 29,
    yearlyPrice: 290, // 10 months worth - 2 months free
    features: [
      "1 Profile",
      "Basic Analytics",
      "Email Support",
      "7-day Data History",
    ],
    description: "Perfect for getting started",
    accentColor: "zinc",
  },
  PRO: {
    name: "Pro",
    monthlyPrice: 89,
    yearlyPrice: 890, // 10 months worth - 2 months free
    features: [
      "5 Profiles",
      "Advanced Analytics",
      "Priority Support",
      "30-day Data History",
      "Custom Reports",
    ],
    description: "For growing businesses",
    accentColor: "blue",
    popular: true,
  },
  ENTERPRISE: {
    name: "Enterprise",
    monthlyPrice: 129,
    yearlyPrice: 1290, // 10 months worth - 2 months free
    features: [
      "Unlimited Profiles",
      "Enterprise Analytics",
      "24/7 Phone Support",
      "90-day Data History",
      "Custom Reports",
      "API Access",
    ],
    description: "For large organizations",
    accentColor: "purple",
  },
} as const;

export const STRIPE_CONFIG = {
  development: {
    STARTER: {
      monthly: process.env.LOCAL_STARTER,
      yearly: process.env.LOCAL_STARTER_YEARLY,
    },
    PRO: {
      monthly: process.env.LOCAL_PRO,
      yearly: process.env.LOCAL_PRO_YEARLY,
    },
    ENTERPRISE: {
      monthly: process.env.LOCAL_ENTERPRISE,
      yearly: process.env.LOCAL_ENTERPRISE_YEARLY,
    },
  },
  production: {
    STARTER: {
      monthly: process.env.PROD_STARTER,
      yearly: process.env.PROD_STARTER_YEARLY,
    },
    PRO: {
      monthly: process.env.PROD_PRO,
      yearly: process.env.PROD_PRO_YEARLY,
    },
    ENTERPRISE: {
      monthly: process.env.PROD_ENTERPRISE,
      yearly: process.env.PROD_ENTERPRISE_YEARLY,
    },
  },
} as const;

export const getPriceIds = (billingPeriod: BillingPeriod = "monthly") => {
  const nodeEnv = process.env.NODE_ENV || "development";
  const config =
    nodeEnv === "production"
      ? STRIPE_CONFIG.production
      : STRIPE_CONFIG.development;

  return {
    STARTER: config.STARTER[billingPeriod] || "",
    PRO: config.PRO[billingPeriod] || "",
    ENTERPRISE: config.ENTERPRISE[billingPeriod] || "",
  };
};
