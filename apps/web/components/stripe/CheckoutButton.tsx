"use client";

import { useState } from "react";
import { useOrganization } from "../../hooks/useOrganization";

interface CheckoutButtonProps {
  priceId: string;
  quantity?: number;
  className?: string;
  children?: React.ReactNode;
  disabled?: boolean;
}

export function CheckoutButton({
  priceId,
  quantity = 1,
  className = "",
  children = "Get Started",
  disabled = false,
}: CheckoutButtonProps) {
  const [loading, setLoading] = useState(false);
  const { organization } = useOrganization();

  const handleCheckout = async () => {
    try {
      setLoading(true);

      // Create a checkout session
      const response = await fetch("/api/stripe/create-checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          price: priceId,
          quantity,
        }),
      });

      const { url } = await response.json();

      // Redirect to checkout
      if (url) {
        window.location.href = url;
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleCheckout}
      disabled={loading || disabled}
      className={`inline-flex items-center justify-center transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
      {loading ? (
        <span className="flex items-center">
          <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Processing...
        </span>
      ) : (
        children
      )}
    </button>
  );
}
