import React from 'react';
import { Metadata } from 'next';
import PrivacyPolicy from '../../_components/privacy-policy';

export const metadata: Metadata = {
  title: 'ExplainX: AI Learning Platform for the Next Generation',
  description: 'Master AI with hands-on projects, intelligent tutors, and interactive content. Learn how to build with LangChain, CrewAI, and other cutting-edge tools. Empower your career with real-world AI skills and personalized learning paths.',
  alternates: {
    canonical: "/privacy-policy",
  },
  openGraph: {
    title: 'ExplainX: AI Learning Platform for the Next Generation',
    description: 'Master AI with hands-on projects, intelligent tutors, and interactive content. Learn how to build with LangChain, CrewAI, and other cutting-edge tools. Empower your career with real-world AI skills and personalized learning paths.',
    url: 'https://explainx.ai/privacy-policy',
    siteName: 'ExplainX',
    type: 'website',
    images: [
      {
        url: "/images/main/landing.png",
        width: 1200,
        height: 630,
        alt: 'ExplainX Privacy Policy',
      },
    ],
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ExplainX: AI Learning Platform for the Next Generation',
    description: 'Master AI with hands-on projects, intelligent tutors, and interactive content. Learn how to build with LangChain, CrewAI, and other cutting-edge tools. Empower your career with real-world AI skills and personalized learning paths.',
    site: '@ExplainX',
    creator: '@ExplainX',
    images: ["/images/main/landing.png"],
  },
  keywords: [
    'ExplainX privacy policy',
    'influencer marketing privacy',
    'creator data protection',
    'brand collaboration privacy',
    'data security influencer platform',
    'AI matchmaking privacy',
    'secure influencer marketing'
  ],
  authors: [
    {
      name: 'ExplainX Team',
      url: 'https://explainx.ai/team',
    },
  ],
  robots: {
    index: true,
    follow: true,
    nocache: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
  viewport: 'width-device-width, initial-scale=1',
  verification: {
    google: 'your-google-verification-code',
  },
}

export default function PrivacyPage() {
  return (
    <div className="bg-white dark:bg-[#0A0A0A] py-8">
      <PrivacyPolicy />
    </div>
  );
};