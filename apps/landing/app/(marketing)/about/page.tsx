// app/about/page.tsx
import type { Metadata } from "next";
import { HeroSection } from "./_components/hero-section";
import { Timeline } from "./_components/timeline";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.explainx.ai"),
  title: "ExplainX: AI Learning Platform for the Next Generation",
  description: "Master AI with hands-on projects, intelligent tutors, and interactive content. Learn how to build with LangChain, CrewAI, and other cutting-edge tools. Empower your career with real-world AI skills and personalized learning paths.",
  keywords: [
    "ai agents",
    "free ai agents",
    "ai agents for seo",
    "ai agents for marketing",
    "ai agents marketplace",
    "langchain ai agents",
    "crewai agents",
    "how to build ai agents",
    "what are ai agents",
    "top ai agents",
    "ai agents for coding",
    "how to hire ai agent",
    "openai ai agents",
    "openai agents",
    "custom ai agents",
    "enterprise ai solutions",
    "ai development agency",
    "ai automation tools"
  ],
  openGraph: {
    title: "ExplainX: AI Learning Platform for the Next Generation",
    description: "Master AI with hands-on projects, intelligent tutors, and interactive content. Learn how to build with LangChain, CrewAI, and other cutting-edge tools. Empower your career with real-world AI skills and personalized learning paths.",
    url: "https://www.explainx.ai/about",
    siteName: "ExplainX",
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

export default function AboutPage() {
  return (
    <div className="bg-white dark:bg-[#0A0A0A]">
      <div className="container max-w-5xl mx-auto px-6 py-12 space-y-16 mt-16">
        <HeroSection />
        <Timeline />
        
        {/* Present & Future Section */}
        <div className="text-center space-y-4">
          <h2 className="font-cal text-3xl text-gray-900 dark:text-white">Building the Future</h2>
          <p className="text-muted-foreground max-w-[600px] mx-auto">
            Today, we're building ExplainX with a clear mission: to make influencer marketing 
            accessible, measurable, and effective for both creators and brands. Join us in 
            shaping the future of digital marketing.
          </p>
        </div>
      </div>
    </div>
  );
}