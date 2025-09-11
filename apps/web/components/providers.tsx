"use client";

import { ThemeProvider } from "../components/theme-provider";
import posthog from "posthog-js";
import { PostHogProvider as PHProvider, usePostHog } from "posthog-js/react";
import { ExamSettingsProvider } from "../contexts/examSettingsContext";
import { FirstMessageProvider } from "../contexts/first-message-provider";
import { SharedSpacesProvider } from "../contexts/shared-space-provider";
import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { TourProvider } from "@repo/ui/components/ui/tour";


export function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
      api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST!,
      defaults: "2025-05-24",
      person_profiles: "always", // or 'always' to create profiles for anonymous users as well
      capture_pageview: true,
    });
  }, []);
  return (
    <PHProvider client={posthog}>
      <PostHogPageView />
      <TourProvider>
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
        <FirstMessageProvider>
          <SharedSpacesProvider>
            <ExamSettingsProvider>{children}</ExamSettingsProvider>
          </SharedSpacesProvider>
        </FirstMessageProvider>
      </ThemeProvider>
      </TourProvider>
    </PHProvider>
  );
}

function PostHogPageView() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const posthog = usePostHog();

  // Track pageviews
  useEffect(() => {
    if (pathname && posthog) {
      let url = window.origin + pathname;
      if (searchParams.toString()) {
        url = url + "?" + searchParams.toString();
      }

      posthog.capture("$pageview", { $current_url: url });
    }
  }, [pathname, searchParams, posthog]);

  return null;
}
