"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { MarketplaceButton } from "./marketplace-login-button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@repo/ui/components/ui/card";
import { Shield, LineChart, Lock, Database } from "lucide-react";

export default function ConnectClient() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkAndRefreshToken = async () => {
      try {
        const response = await fetch("/api/auth/amazon/refresh", {
          method: "POST",
        });

        if (response.ok) {
          router.push("/dashboard");
        }
      } catch (error) {
        console.error("Error refreshing token:", error);
      }
    };

    checkAndRefreshToken();
  }, [router]);

  useEffect(() => {
    const tokens = sessionStorage.getItem("amazonTokens");
    if (tokens) {
      router.push("/dashboard");
    }
  }, [router]);

  return (
    <main className="min-h-screen w-full dark:bg-zinc-950">
      <div className="container mx-auto px-4 py-16 flex flex-col items-center justify-center min-h-screen">
        <div className="w-full max-w-4xl mb-8 text-center space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-zinc-900 to-zinc-500 dark:from-zinc-100 dark:to-zinc-400 bg-clip-text text-transparent">
            Connect Marketplace Account
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            Access your advertising insights securely
          </p>
        </div>

        <Card className="w-full max-w-4xl border-zinc-200 dark:border-zinc-800 shadow-lg bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl">
          <CardHeader className="space-y-2">
            <CardTitle className="text-2xl text-center dark:text-white">
              Marketplace Integrations
            </CardTitle>
            <CardDescription className="text-center dark:text-zinc-400">
              Connect your marketplace advertising accounts to unlock powerful
              analytics
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-8">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
                  <Shield className="h-5 w-5 text-blue-500" />
                  <span className="text-sm">Secure OAuth2 connection</span>
                </div>
                <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
                  <Lock className="h-5 w-5 text-green-500" />
                  <span className="text-sm">End-to-end encryption</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
                  <Database className="h-5 w-5 text-purple-500" />
                  <span className="text-sm">SOC2 compliant storage</span>
                </div>
                <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
                  <LineChart className="h-5 w-5 text-orange-500" />
                  <span className="text-sm">Real-time analytics</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <MarketplaceButton
                marketplace="amazon"
                isLoading={isLoading}
                setIsLoading={setIsLoading}
              />
              <MarketplaceButton
                marketplace="flipkart"
                isLoading={false}
                setIsLoading={setIsLoading}
                isComingSoon
              />
              <MarketplaceButton
                marketplace="walmart"
                isLoading={false}
                setIsLoading={setIsLoading}
                isComingSoon
              />
              <MarketplaceButton
                marketplace="shopify"
                isLoading={false}
                setIsLoading={setIsLoading}
                isComingSoon
              />
              <MarketplaceButton
                marketplace="noon"
                isLoading={false}
                setIsLoading={setIsLoading}
                isComingSoon
              />
            </div>

            <p className="text-sm text-zinc-500 dark:text-zinc-400 text-center">
              We only request read-only access to your advertising data. Your
              credentials are never stored on our servers.
            </p>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

