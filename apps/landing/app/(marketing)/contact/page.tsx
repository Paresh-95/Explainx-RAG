import { Metadata } from "next";
import ContactForm from "./_components/contact-form";

export const metadata: Metadata = {
  title: "ExplainX: AI Learning Platform for the Next Generation",
  description: "Master AI with hands-on projects, intelligent tutors, and interactive content. Learn how to build with LangChain, CrewAI, and other cutting-edge tools. Empower your career with real-world AI skills and personalized learning paths.",
  alternates: {
    canonical: "/contact",
  },
  keywords: [
    "ai agents support",
    "custom ai agent development",
    "langchain development help",
    "crewai implementation",
    "ai automation consultation",
    "ai agent consulting",
    "openai integration support",
    "ai development assistance",
    "business automation help",
    "ai agents for seo contact",
    "ai marketing automation support",
    "ai agent marketplace support",
    "custom ai solutions",
    "ai development agency contact",
    "enterprise ai support",
    "free ai agents help",
    "ai implementation assistance",
    "business process automation",
    "ai consultation services",
    "technical support ai agents"
  ].join(", "),
  openGraph: {
    title: "ExplainX: AI Learning Platform for the Next Generation",
    description: "Master AI with hands-on projects, intelligent tutors, and interactive content. Learn how to build with LangChain, CrewAI, and other cutting-edge tools. Empower your career with real-world AI skills and personalized learning paths.",
    url: "https://explainx.ai/contact",
    siteName: "ExplainX",
    images: [
      {
        url: "/images/main/landing.png",
        width: 1200,
        height: 630,
        alt: "Contact ExplainX AI Development Team",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ExplainX: AI Learning Platform for the Next Generation",
    description: "Master AI with hands-on projects, intelligent tutors, and interactive content. Learn how to build with LangChain, CrewAI, and other cutting-edge tools. Empower your career with real-world AI skills and personalized learning paths.",
    images: ["/images/main/landing.png"],
    site: "@ExplainX",
    creator: "@ExplainX"
  },
  robots: {
    index: true,
    follow: true,
    nocache: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
  authors: [
    {
      name: "ExplainX AI Development Team",
      url: "https://explainx.ai/team",
    },
  ],
  category: "AI Development",
  verification: {
    google: "your-google-verification-code",
  },
};

export default function ContactPage() {
  return (
    <div className="bg-white dark:bg-[#0A0A0A]">
       <div className="bg-white dark:bg-[#0A0A0A] container mx-auto py-12 px-4">
      <div className="max-w-4xl mx-auto mt-20">
        <h1 className="text-4xl font-bold mb-8 text-center text-gray-900 dark:text-white">Contact ExplainX AI Solutions</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <div className="bg-gray-50 dark:bg-gray-900 p-6 rounded-lg shadow border border-gray-200 dark:border-gray-800">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">For Businesses</h2>
            <ul className="space-y-2 mb-4 text-gray-600 dark:text-gray-300">
              <li>• Custom AI agent development</li>
              <li>• Process automation solutions</li>
              <li>• LangChain & CrewAI implementation</li>
              <li>• Technical integration support</li>
            </ul>
          </div>
          
          <div className="bg-gray-50 dark:bg-gray-900 p-6 rounded-lg shadow border border-gray-200 dark:border-gray-800">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">For Developers</h2>
            <ul className="space-y-2 mb-4 text-gray-600 dark:text-gray-300">
              <li>• API integration assistance</li>
              <li>• AI agent optimization</li>
              <li>• Technical documentation</li>
              <li>• Development support</li>
            </ul>
          </div>
        </div>

        <ContactForm />

        <div className="mt-12 text-center text-gray-600 dark:text-gray-400">
          <p className="mb-2">Email us directly: support@explainx.ai</p>
          <p>Response time: Within 24 hours</p>
        </div>
      </div>
    </div>
    </div>
   
  );
}