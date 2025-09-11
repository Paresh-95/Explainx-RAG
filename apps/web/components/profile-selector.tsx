"use client";

import React, { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/components/ui/select";
import { Button } from "@repo/ui/components/ui/button";
import { RefreshCw } from "lucide-react";

interface Profile {
  profileId: number;
  profileName: string;
  countryCode: string;
  currencyCode: string;
  isConnected?: boolean;
  accountInfo: {
    name: string;
    type: string;
  };
}

interface ProfileSelectorProps {
  profiles: Profile[];
  selectedProfileId: string;
  setSelectedProfileId: (id: string) => void;
  onRefresh?: () => void;
}

export function ProfileSelector({
  profiles,
  selectedProfileId,
  setSelectedProfileId,
  onRefresh,
}: ProfileSelectorProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleConnect = async (profileId: number) => {
    try {
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - 3);
      const endDate = new Date();

      const response = await fetch("/api/reports/historical", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          profileId: String(profileId),
          startDate: startDate.toISOString().split("T")[0],
          endDate: endDate.toISOString().split("T")[0],
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to initiate historical data fetch");
      }
    } catch (error) {
      console.error("Error connecting profile:", error);
    }
  };

  const handleRefreshProfiles = async () => {
    try {
      setIsRefreshing(true);
      const response = await fetch("/api/profiles/refresh", {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Failed to refresh profiles");
      }

      const updatedProfiles = await response.json();
      onRefresh?.();
    } catch (error) {
      console.error("Error refreshing profiles:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      <div className="flex items-center justify-between mb-2">
        <label className="block text-sm font-medium">Select Profile</label>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefreshProfiles}
          disabled={isRefreshing}
        >
          <RefreshCw
            className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`}
          />
          Refresh Profiles
        </Button>
      </div>
      <Select value={selectedProfileId} onValueChange={setSelectedProfileId}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select a profile" />
        </SelectTrigger>
        <SelectContent>
          {profiles.map((profile) => (
            <div
              key={profile.profileId}
              className="flex items-center justify-between p-2"
            >
              <SelectItem value={String(profile.profileId)} className="flex-1">
                {profile.profileName} ({profile.countryCode}) -{" "}
                {profile.accountInfo.type}
              </SelectItem>
              <Button
                variant={profile.isConnected ? "secondary" : "default"}
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleConnect(profile.profileId);
                }}
                className="ml-2"
              >
                {profile.isConnected ? "Refresh" : "Connect"}
              </Button>
            </div>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

