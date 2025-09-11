// app/(authenticated)/layout.tsx
import type { Metadata } from "next";
import { auth } from "../../auth";
import { redirect } from "next/navigation";
import type { Session } from "next-auth";

type LayoutProps = {
  children: React.ReactNode;
  params: Promise<Record<string, string>>;
};

export async function generateMetadata({
  params,
}: {
  params: Promise<Record<string, string>>;
}): Promise<Metadata> {
  const resolvedParams = await params;

  return {
    title: "Dashboard - ExplainX | AI Learning Platform",
    description: "Access your ExplainX dashboard for hands-on AI projects, intelligent tutors, and interactive learning.",
    keywords: [
      "AI dashboard",
      "AI learning",
      "AI education",
      "LangChain",
      "CrewAI",
      "AI projects",
      "ExplainX",
    ],
    authors: [{ name: "ExplainX" }],
    creator: "ExplainX",
    publisher: "ExplainX",
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    metadataBase: new URL("https://www.explainx.ai"),
    alternates: {
      canonical: "https://www.explainx.ai/dashboard",
    },
    openGraph: {
      title: "ExplainX Dashboard - AI Learning Platform",
      description: "Monitor your AI learning progress and access hands-on projects with ExplainX.",
      url: "https://www.explainx.ai/dashboard",
      siteName: "ExplainX",
      images: [
        {
          url: "/og-image.png",
          width: 1200,
          height: 630,
          alt: "ExplainX Dashboard Interface",
        },
      ],
      locale: "en_US",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: "ExplainX Dashboard - AI Learning Platform",
      description: "Monitor your AI learning progress and access hands-on projects with ExplainX.",
      images: ["/og-image.png"],
      creator: "@explainxai",
      site: "@explainxai",
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
      },
    },
  };
}

export default async function AuthenticatedLayout({
  children,
  params,
}: LayoutProps) {


  return <div className="min-h-screen dark:bg-zinc-950">{children}</div>;
}