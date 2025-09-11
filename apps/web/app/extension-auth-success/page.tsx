// app/extension-auth-success/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

export default function ExtensionAuthSuccess() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading",
  );
  const [message, setMessage] = useState("");

  useEffect(() => {
    const code = searchParams.get("code");
    const state = searchParams.get("state");
    const error = searchParams.get("error");

    if (error) {
      setStatus("error");
      setMessage(`Authorization failed: ${error}`);
    } else if (code && state) {
      setStatus("success");
      setMessage("Authorization successful! Redirecting to onboarding...");

      // Redirect to onboarding after 2 seconds
      setTimeout(() => {
        window.location.replace("/extension/onboarding");
      }, 2000);
    } else {
      setStatus("error");
      setMessage("Invalid authorization response.");
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="mb-6">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
            {status === "loading" && (
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
            )}
            {status === "success" && (
              <svg
                className="w-8 h-8 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            )}
            {status === "error" && (
              <svg
                className="w-8 h-8 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            )}
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            ExplainX Extension
          </h1>

          <p className="text-gray-600">
            {status === "loading" && "Processing authorization..."}
            {status === "success" && "Successfully connected!"}
            {status === "error" && "Authorization failed"}
          </p>
        </div>

        <div className="mb-6">
          <p className="text-sm text-gray-700">{message}</p>
        </div>

        {status === "success" && (
          <div className="space-y-3">
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <p className="text-sm text-green-800">
                ✅ Your extension is now connected to your ExplainX account
              </p>
            </div>
            <p className="text-xs text-gray-500">
              Redirecting you to onboarding in a moment...
            </p>
          </div>
        )}

        {status === "error" && (
          <div className="space-y-3">
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-800">
                ❌ Something went wrong during authorization
              </p>
            </div>
            <button
              onClick={() => window.close()}
              className="w-full bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              Close Tab
            </button>
          </div>
        )}

        {status !== "error" && (
          <button
            onClick={() => window.location.replace("/extension/onboarding")}
            className="text-sm text-gray-500 hover:text-gray-700 underline"
          >
            Go to onboarding manually
          </button>
        )}
      </div>
    </div>
  );
}
