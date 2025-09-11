"use client";
import { useState } from "react";
import { useOrganization } from "../../hooks/useOrganization";
import { useRouter } from "next/navigation";
import { Progress } from "@repo/ui/components/ui/progress";
import { Button } from "@repo/ui/components/ui/button";
import { cn } from "@repo/ui/lib/utils";
import { Sparkles } from "lucide-react";
import { useCheckLimit } from "../../hooks/useCheckLimit";

function UpgradeSection() {
  const { organization, isLoading: isOrgLoading } = useOrganization();
  const { limitData, isLoading: isLimitLoading } = useCheckLimit();
  const [isHovered, setIsHovered] = useState(false);
  const router = useRouter();

  const isLoading = isOrgLoading || isLimitLoading;

  if (isLoading) {
    return (
      <div className="px-4 py-3 space-y-3">
        <div className="flex items-center justify-between mb-1">
          <div className="h-4 w-20 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
          <div className="h-4 w-16 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
        </div>
        <Progress value={0} className="h-1 animate-pulse" />
      </div>
    );
  }

  if (!limitData) return null;

  const progressPercentage = Math.min(
    (limitData.current / limitData.limit) * 100,
    100,
  );

  return (
    <div className="px-4 py-3 space-y-3">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
          {organization?.subscriptionPlan} Plan
        </span>
        <span className="text-xs font-medium text-zinc-600 dark:text-zinc-300">
          {limitData.current}/
          {limitData.limit === Infinity ? "∞" : limitData.limit}
        </span>
      </div>
      <Progress
        value={progressPercentage}
        className={cn(
          "h-1",
          progressPercentage >= 100 ? "bg-red-100 dark:bg-red-900/20" : "",
          "[&>div]:bg-blue-500",
          progressPercentage >= 100 ? "[&>div]:bg-red-500" : "",
        )}
      />
      {!(organization?.subscriptionPlan == "ENTERPRISE") && (
        <Button
          variant="outline"
          size="sm"
          className={cn(
            "w-full transition-all duration-300 group",
            isHovered ? "bg-blue-50 dark:bg-blue-900/20" : "",
          )}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onClick={() => router.push("/plans")}
        >
          <Sparkles
            className={cn(
              "h-4 w-4 mr-2 transition-all duration-300",
              isHovered ? "text-blue-500 animate-pulse" : "text-zinc-500",
            )}
          />
          <span
            className={cn(
              "transition-all duration-300",
              isHovered ? "text-blue-500" : "text-zinc-500",
            )}
          >
            {limitData.current >= limitData.limit
              ? "Upgrade Required"
              : "Upgrade Plan"}
          </span>
        </Button>
      )}
    </div>
  );
}

export default UpgradeSection;
