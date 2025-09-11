"use client";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";

interface LimitResponse {
  canAddMore: boolean;
  current: number;
  limit: number;
}

async function getLimit(): Promise<LimitResponse> {
  const response = await fetch(`/api/organizations/profile-limit`);
  if (!response.ok) {
    throw new Error("Failed to fetch organization limit");
  }
  return response.json();
}

export function useCheckLimit() {
  const {
    data: limitData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["checkLimit"],
    queryFn: () => getLimit(),
  });

  return {
    limitData,
    isLoading,
    error,
  };
}
