// app/plans/payment/canceled/page.tsx
import Link from "next/link";

export default function PaymentCanceledPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-red-50 flex items-center justify-center">
      <div className="max-w-md mx-auto text-center bg-white p-8 rounded-2xl shadow-lg">
        {/* Canceled Icon */}
        <div className="bg-red-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
          <svg
            className="w-8 h-8 text-red-600"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </div>

        {/* Message */}
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Payment Canceled
        </h1>

        <p className="text-gray-600 mb-8">
          No worries! You can try again anytime. Your subscription has not been
          activated.
        </p>

        {/* Reasons */}
        <div className="bg-gray-50 rounded-xl p-6 mb-8 text-left">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Common reasons for cancellation:
          </h2>
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex items-center">
              <span className="w-2 h-2 bg-gray-400 rounded-full mr-3"></span>
              Changed your mind about the plan
            </li>
            <li className="flex items-center">
              <span className="w-2 h-2 bg-gray-400 rounded-full mr-3"></span>
              Need to check with your team first
            </li>
            <li className="flex items-center">
              <span className="w-2 h-2 bg-gray-400 rounded-full mr-3"></span>
              Technical issues during checkout
            </li>
            <li className="flex items-center">
              <span className="w-2 h-2 bg-gray-400 rounded-full mr-3"></span>
              Want to explore the free version first
            </li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="space-y-4">
          <Link
            href="/pricing"
            className="block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-semibold transition-colors"
          >
            Try Again
          </Link>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/dashboard"
              className="text-gray-600 hover:text-gray-800 font-medium"
            >
              Go to Dashboard
            </Link>
            <span className="hidden sm:inline text-gray-400">•</span>
            <Link
              href="/help"
              className="text-gray-600 hover:text-gray-800 font-medium"
            >
              Need Help?
            </Link>
          </div>
        </div>

        {/* Support Note */}
        <div className="mt-8 text-sm text-gray-500">
          <p>
            Having trouble?{" "}
            <Link href="/contact" className="text-blue-600 hover:text-blue-800">
              Contact our support team
            </Link>{" "}
            for assistance.
          </p>
        </div>
      </div>
    </div>
  );
}
