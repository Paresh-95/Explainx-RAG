// data/pricing.ts
import { type } from "os";

export interface PricingPlan {
  name: string;
  price: string;
  yearlyPrice: string;
  period: string;
  features: string[];
  description: string;
  buttonText: string;
  href: string;
  isPopular: boolean;
}

export interface InfluencerTier {
  name: string;
  minCPC: number;
  maxCPC: number;
  averageEngagement: number;
}

export interface Feature {
  title: string;
  description: string;
  items: string[];
}

export interface FAQ {
  question: string;
  answer: string;
}

export const plans: PricingPlan[] = [
  {
    name: "Free",
    price: "0",
    yearlyPrice: "0",
    period: "per month",
    features: [
      "Find nano influencers",
      "1 campaign per month",
      "View up to 5 applications",
      "Pay based on influencer performance",
      "Verified influencers only"
    ],
    description: "Perfect for trying out our platform",
    buttonText: "Get Started",
    href: "/waitlist",
    isPopular: false
  },
  {
    name: "Starter",
    price: "19",
    yearlyPrice: "15",
    period: "per month",
    features: [
      "Access all influencer tiers (nano to mega)",
      "Up to 5 campaigns per month",
      "View up to 20 applications",
      "Pay based on influencer performance",
      "Verified influencers only",
      "2 platforms support"
    ],
    description: "For small businesses and startups",
    buttonText: "Start Free Trial",
    href: "/waitlist",
    isPopular: false
  },
  {
    name: "Growth",
    price: "49",
    yearlyPrice: "39",
    period: "per month",
    features: [
      "All Starter features",
      "Up to 20 campaigns per month",
      "AI-powered influencer matching",
      "Advanced analytics dashboard",
      "Pay based on influencer performance",
      "Verified influencers only",
      "6 platforms support"
    ],
    description: "For growing brands",
    buttonText: "Start Free Trial",
    href: "/waitlist",
    isPopular: true
  },
  
];

export const influencerTiers: InfluencerTier[] = [
  {
    name: "Nano (1k-10k followers)",
    minCPC: 0.02,
    maxCPC: 0.05,
    averageEngagement: 0.08 // 8%
  },
  {
    name: "Micro (10k-50k followers)",
    minCPC: 0.05,
    maxCPC: 0.15,
    averageEngagement: 0.05 // 5%
  },
  {
    name: "Mid-Tier (50k-500k followers)",
    minCPC: 0.15,
    maxCPC: 0.50,
    averageEngagement: 0.035 // 3.5%
  },
  {
    name: "Macro (500k-1M followers)",
    minCPC: 0.50,
    maxCPC: 1.50,
    averageEngagement: 0.025 // 2.5%
  }
];

export const features: Feature[] = [
  {
    title: "Performance-Based Pricing",
    description: "Pay only for actual engagement and results",
    items: [
      "Credits based on influencer views",
      "Refunds for overperforming content",
      "Transparent pricing per platform",
      "No hidden fees"
    ]
  },
  {
    title: "Platform Features",
    description: "Everything you need to run successful campaigns",
    items: [
      "Verified influencers only",
      "AI-powered matching",
      "Real-time analytics",
      "Multi-platform support"
    ]
  },
  {
    title: "Campaign Management",
    description: "Tools to maximize your ROI",
    items: [
      "Easy campaign creation",
      "Automated payments",
      "Performance tracking",
      "Content approval system"
    ]
  }
];

export const faqs: FAQ[] = [
  {
    question: "How does the pay-per-performance model work?",
    answer: "You purchase platform credits and pay influencers based on their average view count. If content outperforms expectations, you're eligible for a refund of the difference. This ensures you only pay for actual performance."
  },
  {
    question: "What platforms are supported?",
    answer: "Different plans support different platforms. Free tier includes Instagram only, Starter adds LinkedIn, Growth tier includes major platforms (Instagram, LinkedIn, Twitter, Facebook, TikTok, YouTube), and Professional supports all platforms without limits."
  },
  {
    question: "How are influencers verified?",
    answer: "All influencers on our platform go through a verification process that checks their identity, engagement authenticity, and content quality. This ensures you're working with legitimate creators who can deliver real results."
  },
  {
    question: "What happens if I need more applications or campaigns?",
    answer: "You can upgrade your plan at any time to increase your campaign and application limits. The Professional plan offers unlimited campaigns and applications for maximum flexibility."
  }
];