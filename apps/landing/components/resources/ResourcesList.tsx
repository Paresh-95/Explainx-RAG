"use client";
import { useEffect, useState } from "react";
import { ResourceType } from "../../types/resources";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@repo/ui/components/ui/card";
import { Button } from "@repo/ui/components/ui/button";
import { NewsletterBanner } from "./NewsletterBanner";

interface ResourcesListProps {
  resources: ResourceType[];
  heading: string;
  emailGate?: boolean;
}

export const ResourcesList = ({
  resources,
  heading,
  emailGate,
}: ResourcesListProps) => {
  const [showNewsletter, setShowNewsletter] = useState(false);
  const [hasAccess, setHasAccess] = useState(false);

  useEffect(() => {
    const hasSkipped = localStorage.getItem("resources_skipped") === "true";
    const hasSubscribed =
      localStorage.getItem("resources_subscribed") === "true";

    setShowNewsletter(hasSkipped && !hasSubscribed);

    // If emailGate is true, only allow access if user has subscribed
    if (emailGate) {
      setHasAccess(hasSubscribed);
    } else {
      // If emailGate is false or undefined, allow access if either skipped or subscribed
      setHasAccess(hasSkipped || hasSubscribed);
    }
  }, [emailGate]);

  // If emailGate is true and user doesn't have access, don't render anything
  // This should not happen in normal flow, but it's a safety check
  if (emailGate && !hasAccess) {
    return null;
  }

  return (
    <div className="p-8 bg-white dark:bg-gray-900">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold pb-5 text-center">{heading}</h1>
        {showNewsletter && <NewsletterBanner />}
        <div className="grid gap-8 h-full">
          {resources.map((resource, index) => (
            <Card key={index} className="border">
              <CardHeader>
                <CardTitle>{resource.title}</CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-300">
                  {resource.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  asChild
                  variant="link"
                  className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 p-0"
                >
                  <a
                    href={resource.link}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {resource.type === "external"
                      ? "Visit Repository →"
                      : "Download PDF →"}
                  </a>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};
