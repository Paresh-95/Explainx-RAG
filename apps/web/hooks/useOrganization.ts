"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";

interface Organization {
  id: string;
  name: string;
  slug: string;
  subscriptionPlan: string;
  subscriptionStatus: string;
}

async function getOrganization(): Promise<Organization> {
  const response = await fetch(`/api/organizations/`);
  if (!response.ok) {
    throw new Error("Failed to fetch organization");
  }
  return response.json();
}

export function useOrganization() {
  const {
    data: organization,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["organization"],
    queryFn: () => getOrganization(),
  });

  return {
    organization,
    isLoading,
    error,
  };
}
