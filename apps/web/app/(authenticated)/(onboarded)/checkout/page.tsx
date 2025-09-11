// app/pricing/page.tsx
import { CheckoutButton } from "../../../../components/stripe/CheckoutButton";
import { CancelSubscriptionButton } from "../../../../components/stripe/CancelSubscriptionButton";
import { getStripePriceId, PlanType } from "../../../../lib/stripe/config";
import { auth } from "../../../../auth";
import prisma from "@repo/db/client";

// Define your plan details
const planDetails = {
  BASIC: {
    name: "Basic Plan",
    price: 9.99,
    description: "Perfect for individuals getting started",
    features: [
      "Up to 10 projects",
      "Basic analytics",
      "Email support",
      "5GB storage",
      "Community access",
    ],
  },
  PRO: {
    name: "Pro Plan",
    price: 29.99,
    description: "Best for growing teams and businesses",
    features: [
      "Unlimited projects",
      "Advanced analytics",
      "Priority support",
      "100GB storage",
      "Team collaboration",
      "API access",
      "Custom integrations",
    ],
  },
  ENTERPRISE: {
    name: "Enterprise Plan",
    price: 99.99,
    description: "For large organizations with advanced needs",
    features: [
      "Everything in Pro",
      "Custom integrations",
      "Dedicated support",
      "Unlimited storage",
      "SSO & advanced security",
      "Custom contracts",
      "SLA guarantee",
    ],
  },
};

export default async function PricingPage() {
  const session = await auth();

  // Get user's organization and subscription details
  const userOrg = session?.user?.id
    ? await prisma.userOrganization.findFirst({
        where: {
          userId: session.user.id,
        },
        include: {
          organization: {
            select: {
              id: true,
              subscriptionPlan: true,
              subscriptionStatus: true,
              subscriptionEndDate: true,
              stripeSubscriptionId: true,
            },
          },
        },
      })
    : null;

  const currentPlan = userOrg?.organization?.subscriptionPlan;
  const subscriptionStatus = userOrg?.organization?.subscriptionStatus;
  const subscriptionEndDate = userOrg?.organization?.subscriptionEndDate;
  const hasActiveSubscription =
    subscriptionStatus === "ACTIVE" || subscriptionStatus === "TRIALING";

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Choose Your Plan
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Start your 7-day free trial. No credit card required during trial
            period.
          </p>

          {/* Current Subscription Status */}
          {hasActiveSubscription && currentPlan && currentPlan !== "FREE" && (
            <div className="mt-8 max-w-2xl mx-auto">
              <div className="bg-gradient-to-r from-blue-50 to-green-50 border border-blue-200 rounded-xl p-6">
                <div className="flex items-center justify-center mb-3">
                  <div className="bg-green-100 rounded-full p-2 mr-3">
                    <svg
                      className="w-5 h-5 text-green-600"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Currently subscribed to {currentPlan} Plan
                  </h3>
                </div>
                <div className="text-center">
                  <p className="text-gray-600 mb-2">
                    Status:{" "}
                    <span className="font-semibold text-green-600">
                      {subscriptionStatus === "TRIALING"
                        ? "Free Trial"
                        : "Active"}
                    </span>
                  </p>
                  {subscriptionEndDate && (
                    <p className="text-gray-600 mb-4">
                      {subscriptionStatus === "TRIALING"
                        ? "Trial ends"
                        : "Next billing"}
                      :{" "}
                      <span className="font-semibold">
                        {new Date(subscriptionEndDate).toLocaleDateString()}
                      </span>
                    </p>
                  )}
                  <CancelSubscriptionButton />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {(Object.keys(planDetails) as PlanType[]).map((planKey) => {
            const plan = planDetails[planKey];
            const priceId = getStripePriceId(planKey);
            const isPopular = planKey === "PRO";
            const isCurrentPlan = currentPlan === planKey;
            const canUpgrade =
              hasActiveSubscription &&
              ((currentPlan === "BASIC" &&
                (planKey === "PRO" || planKey === "ENTERPRISE")) ||
                (currentPlan === "PRO" && planKey === "ENTERPRISE"));

            return (
              <div
                key={planKey}
                className={`relative bg-white rounded-2xl shadow-lg border-2 transition-all duration-300 hover:shadow-xl ${
                  isCurrentPlan
                    ? "border-green-500 ring-2 ring-green-200"
                    : isPopular
                      ? "border-blue-500 transform scale-105"
                      : "border-gray-200 hover:border-gray-300"
                }`}
              >
                {/* Current Plan Badge */}
                {isCurrentPlan && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-2 rounded-full text-sm font-semibold shadow-lg">
                      Current Plan
                    </span>
                  </div>
                )}

                {/* Popular badge */}
                {isPopular && !isCurrentPlan && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-2 rounded-full text-sm font-semibold shadow-lg">
                      Most Popular
                    </span>
                  </div>
                )}

                <div className="p-8">
                  {/* Plan Header */}
                  <div className="text-center mb-8">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                      {plan.name}
                    </h3>
                    <p className="text-gray-600 mb-4">{plan.description}</p>
                    <div className="flex items-baseline justify-center">
                      <span className="text-5xl font-bold text-gray-900">
                        ${plan.price}
                      </span>
                      <span className="text-gray-500 ml-2">/month</span>
                    </div>
                  </div>

                  {/* Features */}
                  <ul className="space-y-4 mb-8">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start">
                        <svg
                          className="w-6 h-6 text-green-500 mr-3 mt-0.5 flex-shrink-0"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Action Button */}
                  {isCurrentPlan ? (
                    <div className="w-full py-4 px-6 rounded-xl font-semibold text-lg bg-green-100 text-green-800 text-center border-2 border-green-200">
                      ✓ Your Current Plan
                    </div>
                  ) : (
                    <CheckoutButton
                      priceId={priceId}
                      className={`w-full py-4 px-6 rounded-xl font-semibold text-lg transition-all duration-200 ${
                        canUpgrade
                          ? "bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl"
                          : isPopular
                            ? "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg hover:shadow-xl"
                            : "bg-gray-900 hover:bg-gray-800 text-white shadow-md hover:shadow-lg"
                      }`}
                    >
                      {canUpgrade
                        ? `Upgrade to ${planKey}`
                        : hasActiveSubscription
                          ? `Switch to ${planKey}`
                          : "Start Free Trial"}
                    </CheckoutButton>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Subscription Management Section */}
        {hasActiveSubscription && (
          <div className="mt-16 text-center">
            <div className="bg-white rounded-2xl shadow-lg p-8 max-w-4xl mx-auto">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Subscription Management
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="text-left">
                  <h3 className="font-semibold text-gray-900 mb-3">
                    Current Subscription
                  </h3>
                  <div className="space-y-2 text-sm">
                    <p>
                      <span className="text-gray-600">Plan:</span>{" "}
                      <span className="font-semibold">{currentPlan}</span>
                    </p>
                    <p>
                      <span className="text-gray-600">Status:</span>{" "}
                      <span className="font-semibold text-green-600">
                        {subscriptionStatus}
                      </span>
                    </p>
                    {subscriptionEndDate && (
                      <p>
                        <span className="text-gray-600">
                          {subscriptionStatus === "TRIALING"
                            ? "Trial ends:"
                            : "Next billing:"}
                        </span>{" "}
                        <span className="font-semibold">
                          {new Date(subscriptionEndDate).toLocaleDateString()}
                        </span>
                      </p>
                    )}
                  </div>
                </div>

                <div className="text-left">
                  <h3 className="font-semibold text-gray-900 mb-3">
                    Quick Actions
                  </h3>
                  <div className="space-y-3">
                    <a
                      href="/billing"
                      className="block text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      → Manage billing details
                    </a>
                    <a
                      href="/usage"
                      className="block text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      → View usage & limits
                    </a>
                    <a
                      href="/invoices"
                      className="block text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      → Download invoices
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* FAQ Section */}
        <div className="mt-16 text-center">
          <div className="bg-white rounded-2xl shadow-lg p-8 max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Frequently Asked Questions
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  What happens during the free trial?
                </h3>
                <p className="text-gray-600">
                  You get full access to all features for 7 days. No credit card
                  required to start.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  Can I change plans anytime?
                </h3>
                <p className="text-gray-600">
                  Yes! You can upgrade or downgrade your plan at any time from
                  your dashboard.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  What happens when I cancel?
                </h3>
                <p className="text-gray-600">
                  You'll continue to have access until your current billing
                  period ends. Trial cancellations take effect immediately.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  Is there a cancellation fee?
                </h3>
                <p className="text-gray-600">
                  No cancellation fees. You can cancel anytime and continue
                  using the service until your billing period ends.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Simple Test Section (for development) */}
        {process.env.NODE_ENV === "development" && (
          <div className="mt-16 bg-gray-800 rounded-2xl p-8 text-center">
            <h2 className="text-2xl font-bold text-white mb-6">
              Quick Test Checkout
            </h2>
            <p className="text-gray-300 mb-6">
              For testing purposes - direct checkout buttons
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <CheckoutButton
                priceId={getStripePriceId("BASIC")}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold"
              >
                Test Basic Plan
              </CheckoutButton>

              <CheckoutButton
                priceId={getStripePriceId("PRO")}
                className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-semibold"
              >
                Test Pro Plan
              </CheckoutButton>

              <CheckoutButton
                priceId={getStripePriceId("ENTERPRISE")}
                className="bg-yellow-600 hover:bg-yellow-700 text-white px-6 py-3 rounded-lg font-semibold"
              >
                Test Enterprise Plan
              </CheckoutButton>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
