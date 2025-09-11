import { Metadata } from 'next';
import TermsOfService from '../../_components/terms-content';

export const metadata: Metadata = {
  title: 'ExplainX: AI Learning Platform for the Next Generation',
  description: 'Master AI with hands-on projects, intelligent tutors, and interactive content. Learn how to build with LangChain, CrewAI, and other cutting-edge tools. Empower your career with real-world AI skills and personalized learning paths.',
  alternates: {
    canonical: "/terms",
  },
  openGraph: {
    title: 'ExplainX: AI Learning Platform for the Next Generation',
    description: 'Master AI with hands-on projects, intelligent tutors, and interactive content. Learn how to build with LangChain, CrewAI, and other cutting-edge tools. Empower your career with real-world AI skills and personalized learning paths.',
    url: 'https://explainx.ai/terms',
    siteName: 'ExplainX',
    type: 'website',
    images: [
      {
        url: "/images/main/landing-og.png",
        width: 1200,
        height: 630,
        alt: 'ExplainX AI Platform Terms of Service',
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
    images: ["/images/main/landing-og.png"],
  },
  keywords: [
    'ai agent development terms',
    'custom ai solutions agreement',
    'langchain implementation terms',
    'crewai development terms',
    'ai automation platform terms',
    'enterprise ai policies',
    'ai development agreement',
    'business automation terms',
    'ai integration policies',
    'data processing agreement',
    'ai security compliance',
    'api usage terms',
    'ai agent marketplace terms',
    'technical service agreement',
    'automation platform policies'
  ].join(', '),
  authors: [
    {
      name: 'ExplainX Legal & Compliance Team',
      url: 'https://explainx.ai/legal',
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
  viewport: 'width=device-width, initial-scale=1',
  verification: {
    google: 'your-google-verification-code',
  },
  category: 'Legal'
}

export default function TermsPage() {
    return (
      <div className="bg-white dark:bg-[#0A0A0A] py-8">
        <TermsOfService />
      </div>
    );
};