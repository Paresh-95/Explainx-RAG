import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { auth } from "../auth";
import { Providers } from "../components/providers";
import { QueryProvider } from "../providers/query-provider";

import { SessionProvider } from "next-auth/react";
import { FirstMessageProvider } from "../contexts/first-message-provider";
import { ExamSettingsProvider } from "../contexts/examSettingsContext";
import { Toaster } from "@repo/ui/components/ui/toast";
const inter = Inter({ subsets: ["latin"] });
export const metadata: Metadata = {
  title: "ExplainX | AI Learning Platform for the Next Generation",
  description:
    "Master AI with hands-on projects, intelligent tutors, and interactive content. Learn how to build with LangChain, CrewAI, and other cutting-edge tools. Empower your career with real-world AI skills and personalized learning paths.",
  keywords: [
    "AI learning platform",
    "AI education",
    "LangChain",
    "CrewAI",
    "AI projects",
    "intelligent tutors",
    "interactive AI content",
    "personalized learning",
    "real-world AI skills",
    "AI career",
    "ExplainX",
  ].join(", "),
  openGraph: {
    title: "ExplainX | AI Learning Platform for the Next Generation",
    description:
      "Master AI with hands-on projects, intelligent tutors, and interactive content. Learn how to build with LangChain, CrewAI, and more.",
    type: "website",
    url: "https://www.explainx.ai",
    images: [
      {
        url: "https://www.explainx.ai/og-image.png",
        width: 1200,
        height: 630,
        alt: "ExplainX - AI Learning Platform",
      },
    ],
    siteName: "ExplainX",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "ExplainX | AI Learning Platform for the Next Generation",
    description:
      "Master AI with hands-on projects, intelligent tutors, and interactive content. Learn how to build with LangChain, CrewAI, and more.",
    images: ["https://www.explainx.ai/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      { url: "/icon.png", media: "(prefers-color-scheme: light)" },
      { url: "/icon-dark.png", media: "(prefers-color-scheme: dark)" },
    ],
    apple: [{ url: "/apple-icon.png" }],
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <SessionProvider session={session}>
          <QueryProvider>
            <Providers>
              <div className="relative flex min-h-screen ">
                <main className="flex-1 ">
                  <div className=" ">{children}</div>
                </main>
              </div>

            </Providers>
          </QueryProvider>
        </SessionProvider>
        <Toaster />
      </body>
    </html>
  );
}
