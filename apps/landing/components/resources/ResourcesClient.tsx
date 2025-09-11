"use client";
import { useState, useEffect } from "react";
import { EmailGate } from "./EmailGate";
import { ResourcesList } from "./ResourcesList";
import { ResourceType } from "../../types/resources";

interface ResourcesClientProps {
  resources: ResourceType[];
  heading: string;
  emailGate?: boolean;
}

export function ResourcesClient({
  resources,
  heading,
  emailGate,
}: ResourcesClientProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const hasSkipped = localStorage.getItem("resources_skipped") === "true";
    const hasSubscribed =
      localStorage.getItem("resources_subscribed") === "true";

    // If emailGate is true, only allow access if user has subscribed
    if (emailGate) {
      setIsAuthenticated(hasSubscribed);
    } else {
      // If emailGate is false or undefined, allow access if either skipped or subscribed
      setIsAuthenticated(hasSkipped || hasSubscribed);
    }

    setIsLoading(false);
  }, [emailGate]);

  if (isLoading) {
    return null; // Or a loading spinner
  }

  return (
    <>
      {!isAuthenticated ? (
        <EmailGate
          onSuccess={() => setIsAuthenticated(true)}
          emailGate={emailGate}
        />
      ) : (
        <ResourcesList
          resources={resources}
          heading={heading}
          emailGate={emailGate}
        />
      )}
    </>
  );
}
