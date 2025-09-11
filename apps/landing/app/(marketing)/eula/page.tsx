import React from 'react';
import { Metadata } from 'next';
import EULA from '../../_components/eula';

export const metadata: Metadata = {
  title: 'End User License Agreement | ExplainX',
  description: 'Review the End User License Agreement (EULA) for ExplainX. Understand the terms and conditions for using our AI-powered learning platform and related services.',
  alternates: {
    canonical: "/eula",
  },
  openGraph: {
    title: 'End User License Agreement | ExplainX - AI Learning Platform',
    description: 'Explore the terms of use for ExplainX’s AI-powered platform. Our EULA outlines user rights, responsibilities, and restrictions.',
    url: 'https://explainx.ai/eula',
    siteName: 'ExplainX',
    type: 'website',
    images: [
      {
        url: "/images/main/landing.png",
        width: 1200,
        height: 630,
        alt: 'ExplainX EULA',
      },
    ],
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'End User License Agreement | ExplainX - AI Learning Platform',
    description: 'Understand the terms and conditions for using ExplainX’s AI-powered platform. Our EULA ensures clarity on user rights and obligations.',
    site: '@ExplainX',
    creator: '@ExplainX',
    images: ["/images/main/landing.png"],
  },
  keywords: [
    'ExplainX EULA',
    'end user license agreement',
    'AI platform terms',
    'software license agreement',
    'user rights and responsibilities',
    'AI learning platform terms'
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

export default function EULAPage() {
  return (
    <div className="bg-white dark:bg-[#0A0A0A] py-8">
      <EULA />
    </div>
  );
};