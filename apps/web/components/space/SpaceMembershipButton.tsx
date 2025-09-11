// components/space/SpaceMembershipButton.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@repo/ui/lib/utils";

interface SpaceMembershipButtonProps {
  spaceSlug: string;
  permissions: {
    canJoin: boolean;
    canLeave: boolean;
  };
  userRole?: string;
}

export default function SpaceMembershipButton({
  spaceSlug,
  permissions,
  userRole,
}: SpaceMembershipButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleJoin = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/spaces/${spaceSlug}/join`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (data.success) {
        router.refresh();
      } else {
        alert(data.error || "Failed to join space");
      }
    } catch (error) {
      console.error("Error joining space:", error);
      alert("Failed to join space");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLeave = async () => {
    if (!confirm("Are you sure you want to leave this space?")) {
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/spaces/${spaceSlug}/leave`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (data.success) {
        router.push("/spaces");
      } else {
        alert(data.error || "Failed to leave space");
      }
    } catch (error) {
      console.error("Error leaving space:", error);
      alert("Failed to leave space");
    } finally {
      setIsLoading(false);
    }
  };

  if (permissions.canJoin) {
    return (
      <button
        onClick={handleJoin}
        disabled={isLoading}
        className={cn(
          "flex items-center gap-2 px-6 py-2 rounded-2xl font-medium transition-colors",
          "bg-blue-600 hover:bg-blue-700 text-white",
          "disabled:opacity-50 disabled:cursor-not-allowed",
        )}
      >
        {isLoading ? "Joining..." : "Join Space"}
      </button>
    );
  }

  if (permissions.canLeave) {
    return (
      <div className="flex items-center gap-2">
        <span
          className={cn(
            "px-3 py-1 rounded-full text-sm font-medium",
            userRole === "ADMIN" && "bg-blue-100 text-blue-800",
            userRole === "MEMBER" && "bg-gray-100 text-gray-800",
            userRole === "VIEWER" && "bg-yellow-100 text-yellow-800",
          )}
        >
          {userRole?.toLowerCase()}
        </span>
        <button
          onClick={handleLeave}
          disabled={isLoading}
          className={cn(
            "px-3 py-1 rounded text-sm transition-colors",
            "bg-red-100 hover:bg-red-200 text-red-700",
            "disabled:opacity-50",
          )}
        >
          {isLoading ? "Leaving..." : "Leave"}
        </button>
      </div>
    );
  }

  if (userRole === "OWNER") {
    return (
      <span className="px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
        Owner
      </span>
    );
  }

  return null;
}
