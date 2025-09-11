import Stripe from "stripe";

// Use a placeholder key if the actual key is not set.
// This is primarily to allow build/lint processes to pass when env vars aren't fully configured.
// Ensure the actual STRIPE_SECRET_KEY is set in your deployment environment.
const stripeApiKey =
  process.env.STRIPE_SECRET_KEY ||
  "sk_test_placeholder sympathiqueBuildProcess";

export const stripe = new Stripe(stripeApiKey, {
  typescript: true,
});

export const getStripeInstance = () => {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error("Missing Stripe secret key");
  }
  return stripe;
};
