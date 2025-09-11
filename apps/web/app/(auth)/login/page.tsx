import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In - ExplainX | AI Learning Platform",
  description:
    "Sign in to ExplainX to access your personalized AI learning dashboard, hands-on projects, and intelligent tutors.",
  keywords: [
    "sign in",
    "login",
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
    canonical: "https://www.explainx.ai/login",
  },
  openGraph: {
    title: "Sign In - ExplainX | AI Learning Platform",
    description:
      "Access your ExplainX dashboard for hands-on AI projects and personalized learning.",
    url: "https://www.explainx.ai/login",
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
    title: "Sign In - ExplainX | AI Learning Platform",
    description:
      "Access your ExplainX dashboard for hands-on AI projects and personalized learning.",
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

type Props = {
  searchParams: Promise<AuthSearchParams>;
};

export default function SignIn({ searchParams }: Props) {
  const resolvedSearchParams = use(searchParams);

  return (
    <AuthForm
      mode="login"
      title="Welcome Back"
      description="Sign in to your account"
      handleEmailAuth={handleEmailSignIn}
      handleGoogleAuth={handleGoogleSignIn}
      searchParams={resolvedSearchParams}
      alternateAuthLink={{
        text: "Don't have an account? Sign up",
        href: "/signup",
      }}
    />
  );
}