import type { Metadata } from "next";
import { Separator } from "@repo/ui/components/ui/separator";
import { CultureSection } from "./_components/culture";
import { PerksSection } from "./_components/perks";
import { OpenPositions } from "./_components/open-positions";
import { ContactCTA } from "./_components/contact-cta";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.explainx.ai"),
  title: "ExplainX: AI Learning Platform for the Next Generation",
  description: "Master AI with hands-on projects, intelligent tutors, and interactive content. Learn how to build with LangChain, CrewAI, and other cutting-edge tools. Empower your career with real-world AI skills and personalized learning paths.",
  keywords: [
    "ai agent developer jobs",
    "ai development careers",
    "langchain developer positions",
    "crewai engineering jobs",
    "ai automation jobs",
    "openai integration developer",
    "ai agent architect",
    "remote ai jobs",
    "ai agency careers",
    "machine learning jobs",
    "ai solutions engineer",
    "startup jobs india",
    "tech jobs mumbai",
    "remote jobs india"
  ].join(", "),
  appLinks: {
    web: {
      url: "https://www.explainx.ai/careers",
      should_fallback: false,
    },
  },
  openGraph: {
    title: "ExplainX: AI Learning Platform for the Next Generation",
    description: "Master AI with hands-on projects, intelligent tutors, and interactive content. Learn how to build with LangChain, CrewAI, and other cutting-edge tools. Empower your career with real-world AI skills and personalized learning paths.",
    url: "https://www.explainx.ai/careers",
    siteName: "ExplainX - AI Agents Development Agency",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
      }
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ExplainX: AI Learning Platform for the Next Generation",
    description: "Master AI with hands-on projects, intelligent tutors, and interactive content. Learn how to build with LangChain, CrewAI, and other cutting-edge tools. Empower your career with real-world AI skills and personalized learning paths.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  }
};

export default function CareersPage() {
  return (
    <div className="container max-w-7xl mx-auto px-6 py-12 mt-16">
      {/* Hero Section */}
      <div className="flex flex-col items-center text-center space-y-4 mb-16">
        <h1 className="font-cal text-4xl md:text-5xl">Build the Future of AI</h1>
        <p className="text-muted-foreground max-w-[700px]">
          Join our mission to revolutionize business automation through innovative AI agents and intelligent solutions.
        </p>
      </div>

      <CultureSection />
      <PerksSection />
      <Separator className="my-16" />
      <OpenPositions />
      <ContactCTA />
    </div>
  );
}