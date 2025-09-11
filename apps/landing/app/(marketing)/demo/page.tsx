// app/demo/page.tsx
import type { Metadata } from "next";
import { DemoBookingForm } from "./_components/demo-booking-form";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.explainx.ai"),
  title: "ExplainX: AI Learning Platform for the Next Generation",
  description: "Master AI with hands-on projects, intelligent tutors, and interactive content. Learn how to build with LangChain, CrewAI, and other cutting-edge tools. Empower your career with real-world AI skills and personalized learning paths.",
  keywords: [
    "ai agents demo",
    "custom ai development",
    "langchain demo",
    "crewai implementation",
    "business automation demo",
    "ai agent development",
    "free ai agents demo",
    "ai agents for seo",
    "ai agents for marketing",
    "enterprise ai demo",
    "ai automation platform",
    "ai consultation",
    "custom ai solutions",
    "openai integration demo"
  ].join(", "),
  openGraph: {
    title: "ExplainX: AI Learning Platform for the Next Generation",
    description: "Master AI with hands-on projects, intelligent tutors, and interactive content. Learn how to build with LangChain, CrewAI, and other cutting-edge tools. Empower your career with real-world AI skills and personalized learning paths.",
    url: "https://www.explainx.ai/demo",
    siteName: "ExplainX - AI Agents Development Agency",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Book an AI Solution Demo with ExplainX"
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
  }
};

export default function DemoPage() {
  return (
    <main className="min-h-screen bg-background py-5">
      <div className="container max-w-6xl mx-auto px-4 py-12 mt-16">
        <div className="grid md:grid-cols-2 gap-12">
          {/* Left Column - Information */}
          <div className="space-y-6">
            <h1 className="font-cal text-4xl md:text-5xl mb-4">
              Book Your AI Solutions Demo
            </h1>
            <p className="text-muted-foreground text-lg">
              Learn how ExplainX can transform your business operations with custom AI agents, intelligent automation, and advanced integration capabilities.
            </p>
            
            <div className="space-y-4 mt-8">
              <h2 className="font-cal text-2xl">What you'll learn:</h2>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center mt-1">
                    <CheckIcon className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium">Custom AI Agent Development</h3>
                    <p className="text-muted-foreground">See how we create tailored AI agents for your specific business needs</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center mt-1">
                    <CheckIcon className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium">Intelligent Process Automation</h3>
                    <p className="text-muted-foreground">Explore our LangChain and CrewAI implementation capabilities</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center mt-1">
                    <CheckIcon className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium">Integration & Deployment</h3>
                    <p className="text-muted-foreground">Learn about our seamless integration process and deployment strategies</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center mt-1">
                    <CheckIcon className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium">Performance Monitoring</h3>
                    <p className="text-muted-foreground">Discover our advanced analytics and AI agent performance tracking</p>
                  </div>
                </li>
              </ul>
            </div>
          </div>
          
          {/* Right Column - Booking Form */}
          <div className="bg-card rounded-lg border p-6">
            <DemoBookingForm />
          </div>
        </div>
      </div>
    </main>
  );
}

function CheckIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}