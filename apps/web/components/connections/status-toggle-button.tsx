"use client";

import { useState } from "react";
import { Badge } from "@repo/ui/components/ui/badge";
import { Button } from "@repo/ui/components/ui/button";
import { useToast } from "@repo/ui/hooks/use-toast";
import { Loader2 } from "lucide-react";

interface StatusToggleButtonProps {
  profileId: string;
  initialStatus: "ACTIVE" | "PAUSED" | "ARCHIVED";
}

export function StatusToggleButton({
  profileId,
  initialStatus,
}: StatusToggleButtonProps) {
  const [status, setStatus] = useState(initialStatus);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleStatusToggle = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/profiles/${profileId}/activate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to update status");
      }

      const data = await response.json();
      setStatus(data.profile.status);

      toast({
        title: "Success",
        description: data.message || "Profile status updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to update profile status",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getButtonText = () => {
    if (isLoading) return <Loader2 className="h-4 w-4 animate-spin" />;
    return status === "ACTIVE" ? "Pause" : "Activate";
  };

  return (
    <div className="flex items-center gap-2">
      <Badge
        variant="secondary"
        className={
          status === "ACTIVE"
            ? "bg-green-100 text-green-800 hover:bg-green-100"
            : status === "PAUSED"
              ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
              : "bg-gray-100 text-gray-800 hover:bg-gray-100"
        }
      >
        {status}
      </Badge>
      <Button
        variant="outline"
        size="sm"
        onClick={handleStatusToggle}
        disabled={isLoading || status === "ARCHIVED"}
      >
        {getButtonText()}
      </Button>
    </div>
  );
}
