// app/plans/payment/success/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

interface PaymentSuccessData {
  customerEmail: string;
  planName: string;
  amount: number;
  currency: string;
  subscriptionId: string;
  trialEnd?: string;
  nextBillingDate?: string;
}

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paymentData, setPaymentData] = useState<PaymentSuccessData | null>(
    null,
  );

  useEffect(() => {
    if (!sessionId) {
      setError("No session ID found");
      setLoading(false);
      return;
    }

    // Verify the payment session
    const verifyPayment = async () => {
      try {
        const response = await fetch("/api/stripe/verify-session", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ sessionId }),
        });

        if (!response.ok) {
          throw new Error("Failed to verify payment");
        }

        const data = await response.json();
        setPaymentData(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Payment verification failed",
        );
      } finally {
        setLoading(false);
      }
    };

    verifyPayment();
  }, [sessionId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-700">
            Verifying your payment...
          </h2>
          <p className="text-gray-500 mt-2">
            Please wait while we confirm your subscription
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center bg-white p-8 rounded-2xl shadow-lg">
          <div className="bg-red-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
            <svg
              className="w-8 h-8 text-red-600"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Payment Verification Failed
          </h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="space-y-3">
            <Link
              href="/pricing"
              className="block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-semibold"
            >
              Try Again
            </Link>
            <Link
              href="/dashboard"
              className="block text-gray-600 hover:text-gray-800"
            >
              Go to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
      <div className="max-w-2xl mx-auto text-center bg-white p-8 rounded-2xl shadow-lg">
        {/* Success Icon */}
        <div className="bg-green-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
          <svg
            className="w-10 h-10 text-green-600"
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

        {/* Success Message */}
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          🎉 Payment Successful!
        </h1>

        <p className="text-xl text-gray-600 mb-8">
          Welcome to your new {paymentData?.planName || "subscription"}!
        </p>

        {/* Payment Details */}
        {paymentData && (
          <div className="bg-gray-50 rounded-xl p-6 mb-8 text-left">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Payment Details
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Plan:</span>
                <span className="font-semibold">{paymentData.planName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Amount:</span>
                <span className="font-semibold">
                  {paymentData.currency.toUpperCase()} $
                  {(paymentData.amount / 100).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Email:</span>
                <span className="font-semibold">
                  {paymentData.customerEmail}
                </span>
              </div>
              {paymentData.trialEnd && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Trial Ends:</span>
                  <span className="font-semibold text-blue-600">
                    {new Date(paymentData.trialEnd).toLocaleDateString()}
                  </span>
                </div>
              )}
              {paymentData.nextBillingDate && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Next Billing:</span>
                  <span className="font-semibold">
                    {new Date(paymentData.nextBillingDate).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Trial Info */}
        {paymentData?.trialEnd && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8">
            <h3 className="text-lg font-semibold text-blue-900 mb-2">
              🚀 Your Free Trial Has Started!
            </h3>
            <p className="text-blue-700">
              You have full access to all features until{" "}
              {new Date(paymentData.trialEnd).toLocaleDateString()}. No charges
              will be made during your trial period.
            </p>
          </div>
        )}

        {/* Next Steps */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            What's Next?
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="text-left">
              <div className="flex items-center mb-2">
                <div className="bg-blue-100 rounded-full w-6 h-6 flex items-center justify-center mr-3">
                  <span className="text-blue-600 font-bold text-xs">1</span>
                </div>
                <span className="font-semibold">Set up your workspace</span>
              </div>
              <p className="text-gray-600 ml-9">
                Configure your account and invite team members
              </p>
            </div>

            <div className="text-left">
              <div className="flex items-center mb-2">
                <div className="bg-purple-100 rounded-full w-6 h-6 flex items-center justify-center mr-3">
                  <span className="text-purple-600 font-bold text-xs">2</span>
                </div>
                <span className="font-semibold">Explore features</span>
              </div>
              <p className="text-gray-600 ml-9">
                Check out our guides and tutorials
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-4">
          <Link
            href="/dashboard"
            className="block bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl hover:from-blue-700 hover:to-purple-700 font-semibold text-lg transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            Go to Dashboard
          </Link>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/help"
              className="text-gray-600 hover:text-gray-800 font-medium"
            >
              Need Help?
            </Link>
            <span className="hidden sm:inline text-gray-400">•</span>
            <Link
              href="/billing"
              className="text-gray-600 hover:text-gray-800 font-medium"
            >
              Manage Billing
            </Link>
          </div>
        </div>

        {/* Confirmation Note */}
        <div className="mt-8 text-sm text-gray-500">
          <p>
            A confirmation email has been sent to{" "}
            {paymentData?.customerEmail || "your email address"}.
            <br />
            Session ID:{" "}
            <code className="bg-gray-100 px-2 py-1 rounded text-xs">
              {sessionId}
            </code>
          </p>
        </div>
      </div>
    </div>
  );
}
