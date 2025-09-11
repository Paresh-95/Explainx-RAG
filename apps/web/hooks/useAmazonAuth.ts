// hooks/useAmazonAuth.ts
import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";

export const useAmazonAuth = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const logout = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Clear client-side storage
      sessionStorage.removeItem("amazonTokens");

      // Call API to invalidate tokens in database
      const response = await fetch("/api/auth/amazon/logout", {
        method: "POST",
        credentials: "include",
      });
      signOut();

      if (!response.ok) {
        throw new Error("Failed to logout");
      }

      router.push("/connect");
    } catch (error) {
      console.error("Logout error:", error);
      setError("Failed to logout. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  return {
    logout,
    isLoading,
    error,
  };
};
