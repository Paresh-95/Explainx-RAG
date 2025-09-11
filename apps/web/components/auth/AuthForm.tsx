"use client";

import { z } from "zod";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@repo/ui/components/ui/button";
import { Input } from "@repo/ui/components/ui/input";
import { Alert, AlertDescription } from "@repo/ui/components/ui/alert";
import { Separator } from "@repo/ui/components/ui/separator";
import RevNSLogo from "../revns-logo";
import { useSearchParams } from "next/navigation";

const formSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
});

type FormValues = z.infer<typeof formSchema>;

interface AuthFormProps {
  mode: "login" | "signup";
  title: string;
  description: string;
  handleEmailAuth: (email: string, redirectPath: string) => Promise<void>;
  handleGoogleAuth: (redirectPath: string) => Promise<void>;
  searchParams: { invite?: string; next?: string };
  alternateAuthLink?: {
    text: string;
    href: string;
  };
  defaultEmail?: string;
}

export default function AuthForm({
  mode,
  title,
  description,
  handleEmailAuth,
  handleGoogleAuth,
  searchParams,
  alternateAuthLink,
  defaultEmail,
}: AuthFormProps) {
  const [emailLoading, setEmailLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const redirectPath = searchParams.next || "/dashboard";

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: defaultEmail || "",
    },
  });

  const onSubmit = async (values: FormValues) => {
    setError(null);
    setEmailLoading(true);
    try {
      await handleEmailAuth(values.email, redirectPath);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setEmailLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    try {
      await handleGoogleAuth(redirectPath);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Google authentication failed",
      );
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-zinc-950 flex items-center justify-center py-16">
      <div className="w-full max-w-md space-y-8">
        {/* Logo */}
        <div className="text-center">
          <RevNSLogo size="extra" />
        </div>

        {/* Title and Description */}
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-semibold text-zinc-900 dark:text-white">
            {mode === "login" ? "Welcome back" : "Create an account"}
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400">
            {mode === "login"
              ? "Let's continue your learning journey."
              : "Let's get you learning journey started."}
          </p>
        </div>

        {/* Auth Form */}
        <div className="space-y-6">
          {/* Google Sign In Button */}
          <Button
            type="button"
            onClick={handleGoogleSignIn}
            variant="outline"
            className="w-full h-12 bg-zinc-100 dark:bg-zinc-900 border-zinc-300 dark:border-zinc-800 text-zinc-900 dark:text-white hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
            disabled={googleLoading}
          >
            {googleLoading ? (
              <div className="flex items-center">
                <div className="animate-spin w-4 h-4 border-2 border-zinc-400 border-t-zinc-900 dark:border-t-white rounded-full mr-2"></div>
                Signing in...
              </div>
            ) : (
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                {mode === "login"
                  ? "Continue with Google"
                  : "Sign up with Google"}
              </div>
            )}
          </Button>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <Separator className="bg-zinc-200 dark:bg-zinc-800" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-white dark:bg-zinc-950 px-2 text-zinc-400 dark:text-zinc-500">
                or continue with
              </span>
            </div>
          </div>

          {/* Email Form */}
          <div className="space-y-4">
            <div>
              <Input
                placeholder="Enter your email"
                type="email"
                value={form.watch("email")}
                onChange={(e) => form.setValue("email", e.target.value)}
                className="h-12 bg-zinc-100 dark:bg-zinc-900 border-zinc-300 dark:border-zinc-800 text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:border-zinc-400 dark:focus:border-zinc-600"
                disabled={emailLoading}
              />
              {form.formState.errors.email && (
                <p className="text-red-600 dark:text-red-400 text-sm mt-1">
                  {form.formState.errors.email.message}
                </p>
              )}
            </div>

            {error && (
              <Alert className="bg-red-100 dark:bg-red-900/50 border-red-300 dark:border-red-800">
                <AlertDescription className="text-red-700 dark:text-red-200">
                  {error}
                </AlertDescription>
              </Alert>
            )}

            <Button
              type="button"
              onClick={() => form.handleSubmit(onSubmit)()}
              className="w-full h-12 bg-zinc-900 dark:bg-zinc-400 text-zinc-100 dark:text-zinc-950 hover:bg-zinc-700 dark:hover:bg-zinc-300 font-medium"
              disabled={emailLoading}
            >
              {emailLoading ? (
                <div className="flex items-center">
                  <div className="animate-spin w-4 h-4 border-2 border-zinc-200 dark:border-zinc-700 border-t-zinc-100 dark:border-t-zinc-950 rounded-full mr-2"></div>
                  Sending link...
                </div>
              ) : (
                "Continue with Email"
              )}
            </Button>
          </div>

          {/* Alternate Auth Link */}
          {alternateAuthLink && (
            <div className="text-center">
              <span className="text-zinc-500 dark:text-zinc-400 text-sm">
                {mode === "login"
                  ? "Don't have an account? "
                  : "Already have an account? "}
                <button
                  type="button"
                  onClick={() =>
                    (window.location.href = alternateAuthLink.href)
                  }
                  className="text-zinc-900 dark:text-white hover:text-zinc-700 dark:hover:text-zinc-300 underline"
                >
                  {mode === "login" ? "Sign up" : "Sign in"}
                </button>
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
