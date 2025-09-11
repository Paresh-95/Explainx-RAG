import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign Up - ExplainX | AI Learning Platform",
  description:
    "Create your ExplainX account to master AI with hands-on projects, intelligent tutors, and interactive content.",
  keywords: [
    "sign up",
    "create account",
    "AI learning",
    "AI education",
    "LangChain",
    "CrewAI",
    "interactive AI content",
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
    canonical: "https://www.explainx.ai/signup",
  },
  openGraph: {
    title: "Sign Up - ExplainX | AI Learning Platform",
    description:
      "Join ExplainX and master AI with hands-on projects, intelligent tutors, and interactive content.",
    url: "https://www.explainx.ai/signup",
    siteName: "ExplainX",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "ExplainX - AI Learning Platform",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Sign Up - ExplainX | AI Learning Platform",
    description:
      "Join ExplainX and master AI with hands-on projects, intelligent tutors, and interactive content.",
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
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

import { use } from "react";
import { AuthSearchParams } from "../../../types/index";
import AuthForm from "../../../components/auth/AuthForm";
import { handleEmailSignIn, handleGoogleSignIn } from "../../../actions/action";

interface PageProps {
  searchParams: Promise<AuthSearchParams>;
}

export default function SignupPage({ searchParams }: PageProps) {
  const resolvedSearchParams = use(searchParams);

  return (
    <AuthForm
      mode="signup"
      title="Create your account"
      description="Join the Revns community"
      handleEmailAuth={handleEmailSignIn}
      handleGoogleAuth={handleGoogleSignIn}
      searchParams={resolvedSearchParams}
      alternateAuthLink={{
        text: "Already have an account? Sign in",
        href: "/login",
      }}
    />
  );
}