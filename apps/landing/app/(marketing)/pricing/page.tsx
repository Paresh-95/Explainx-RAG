import type { Metadata } from "next";
import { PricingHeader } from "./_components/pricing-header";
import { PricingCalculator } from "./_components/pricing-calculator";
import { PricingFAQ } from "./_components/pricing-faq";
import { PricingFeatures } from "./_components/pricing-features";
import { ContactCTA } from "./_components/contact-cta";
import { Pricing, Pricing as PricingSection } from "../../_components/explainx-pricing";
import { PricingStructuredData } from "./structured-data";
import { faqs, influencerTiers, plans } from "../../../data/plans/pricing";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.explainx.ai"),
  title: "ExplainX: AI Learning Platform for the Next Generation",
  description: "Master AI with hands-on projects, intelligent tutors, and interactive content. Learn how to build with LangChain, CrewAI, and other cutting-edge tools. Empower your career with real-world AI skills and personalized learning paths.",
  keywords: "influencer marketing pricing, performance marketing pricing, pay per click marketing, influencer campaign costs",
  openGraph: {
    title: "Transparent, Performance-Based Pricing | ExplainX",
    description: "Only pay for real results with our credit-based system. Simple onboarding, no hidden fees.",
    url: "https://www.explainx.ai/pricing",
    siteName: "ExplainX - Performance-Based Influencer Marketing",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
      }
    ],
    locale: "en_US",
    type: "website",
  }
};

export default function PricingPage() {
  return (
    <div className="container max-w-7xl mx-auto px-6 py-12">
      <PricingStructuredData
        plans={plans as any} // Type assertion to bypass type error
        influencerTiers={influencerTiers}
        faqs={faqs}
      />      
      <PricingHeader />
      <Pricing
        plans={plans}
        title="Simple, Transparent Pricing"
        description="Choose the plan that works for you\nAll plans include access to our platform, lead generation tools, and dedicated support."
      />
      <PricingFeatures />
      {/* <PricingCalculator /> */}
      <PricingFAQ />
      <ContactCTA />
      
    </div>
  );
}