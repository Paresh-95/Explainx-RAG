"use client";

import { Button } from "@repo/ui/components/ui/button";

interface MarketplaceButtonProps {
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  marketplace: "amazon" | "flipkart" | "walmart" | "shopify" | "noon";
  isComingSoon?: boolean;
}

export function MarketplaceButton({
  isLoading,
  setIsLoading,
  marketplace,
  isComingSoon = false,
}: MarketplaceButtonProps) {
  const handleLogin = () => {
    if (isComingSoon) return;
    
    setIsLoading(true);
    if (marketplace === "amazon") {
      const params = new URLSearchParams({
        client_id: process.env.NEXT_PUBLIC_AMAZON_CLIENT_ID || "",
        redirect_uri: process.env.NEXT_PUBLIC_REDIRECT_URI || "http://localhost:3000/callback",
        response_type: "code",
        scope: "advertising::campaign_management",
        state: Math.random().toString(36).substring(7),
      });

      window.location.href = `https://eu.account.amazon.com/ap/oa?${params.toString()}`;
    }
  };

  // Marketplace-specific configurations
  const configs = {
    amazon: {
      bgColor: "bg-[#FF9900] hover:bg-[#e68a00] dark:bg-[#FF9900] dark:hover:bg-[#e68a00]",
      icon: (
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M.045 18.02c.072-.116.187-.124.348-.022 3.636 2.11 7.594 3.166 11.87 3.166 2.852 0 5.668-.533 8.447-1.595l.315-.14c.138-.06.234-.1.293-.13.226-.088.39-.046.525.13.12.174.09.336-.12.48-.256.19-.6.41-1.006.654-1.244.743-2.64 1.316-4.185 1.726a17.617 17.617 0 01-10.951-.577 17.12 17.12 0 01-5.43-2.85A.338.338 0 010 18.315c0-.092.015-.171.045-.235zm6.565-6.218c0-1.005.247-1.863.743-2.577.495-.71 1.17-1.25 2.04-1.615.796-.335 1.756-.575 2.912-.72.39-.046 1.033-.103 1.92-.174v-.37c0-.93-.105-1.558-.3-1.875-.302-.43-.78-.65-1.44-.65h-.182c-.48.046-.896.196-1.246.46-.35.27-.575.63-.675 1.096-.06.3-.206.465-.435.51l-2.52-.315c-.248-.06-.372-.18-.372-.39 0-.046.007-.09.022-.15.247-1.29.855-2.25 1.82-2.88.976-.616 2.1-.975 3.39-1.05h.54c1.65 0 2.957.434 3.888 1.29.135.15.27.3.405.48.12.165.224.314.283.45.075.134.15.33.195.57.06.254.105.42.135.51.03.104.062.3.076.615.01.313.02.493.02.553v5.28c0 .376.06.72.165 1.036.105.313.21.54.315.674l.51.674c.09.136.136.256.136.36 0 .12-.06.226-.18.314-1.2 1.05-1.86 1.62-1.963 1.71-.165.135-.375.15-.63.045a6.062 6.062 0 01-.526-.496l-.31-.347a9.391 9.391 0 01-.317-.42l-.3-.435c-.81.886-1.603 1.44-2.4 1.665-.494.15-1.093.227-1.83.227-1.11 0-2.04-.343-2.76-1.034-.72-.69-1.08-1.665-1.08-2.94l-.05-.076zm3.753-.438c0 .566.14 1.02.425 1.364.285.34.675.512 1.155.512.045 0 .106-.007.195-.02.09-.016.134-.023.166-.023.614-.16 1.08-.553 1.424-1.178.165-.28.285-.58.36-.91.09-.32.12-.59.135-.8.015-.195.015-.54.015-1.005v-.54c-.84 0-1.484.06-1.92.18-1.275.36-1.92 1.17-1.92 2.43l-.035-.02zm9.162 7.027c.03-.06.075-.11.132-.17.362-.243.714-.41 1.05-.5a8.094 8.094 0 011.612-.24c.14-.012.28 0 .41.03.65.06 1.05.168 1.172.33.063.09.099.228.099.39v.15c0 .51-.149 1.11-.424 1.8-.278.69-.664 1.248-1.156 1.68-.073.06-.14.09-.197.09-.03 0-.06 0-.09-.012-.09-.044-.107-.12-.064-.24.54-1.26.806-2.143.806-2.64 0-.15-.03-.27-.087-.344-.145-.166-.55-.257-1.224-.257-.243 0-.533.016-.87.046-.363.045-.7.09-1 .135-.09 0-.148-.014-.18-.044-.03-.03-.036-.047-.02-.077 0-.017.006-.03.02-.063v-.06z"/>
        </svg>
      ),
      text: "Connect Amazon Account"
    },
    flipkart: {
      bgColor: "bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700",
      icon: (
        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M2.5 10.2h4.2v1.5H4.4v1.2h2v1.5h-2v2.9H2.5v-7.1zm5.8 0h1.9v5.6h2v1.5h-3.9v-7.1zm5.2 0h4v1.5h-2.1v1.2h1.9v1.5h-1.9v1.4h2.1v1.5h-4v-7.1z"/>
        </svg>
      ),
      text: "Flipkart Ads (Soon)"
    },
    walmart: {
      bgColor: "bg-blue-500 hover:bg-blue-600 dark:bg-blue-500 dark:hover:bg-blue-600",
      icon: (
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M20.9 17c-2.4 2.8-5.9 4.5-9 4.5-3.1 0-6.6-1.7-9-4.5l.8-.9C5.6 18.7 8.6 20 11.9 20c3.3 0 6.3-1.3 8.3-3.9l.7.9zM11.9 4c3.1 0 6.6 1.7 9 4.5l-.8.9C18.2 7.3 15.2 6 11.9 6 8.6 6 5.6 7.3 3.6 9.4l-.7-.9C5.3 5.7 8.8 4 11.9 4z"/>
        </svg>
      ),
      text: "Walmart Ads (Soon)"
    },
    shopify: {
      bgColor: "bg-green-600 hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-700",
      icon: (
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M15.5 1.5c-.1-.3-.3-.4-.5-.4s-4.3-.3-4.3-.3L7.9 1C7.8 1 7.7 1.1 7.6 1.2L7 2.3.9 3.7c-.2.1-.3.2-.3.4l-.5 12.5c0 .2.1.3.2.4l7.9 4.3c.1.1.3.1.4 0l7.9-4.3c.1-.1.2-.2.2-.4l.5-12.5c0-.2-.1-.3-.3-.4L15.5 1.5z"/>
        </svg>
      ),
      text: "Shopify Ads (Soon)"
    },
    noon: {
      bgColor: "bg-yellow-500 hover:bg-yellow-600 dark:bg-yellow-500 dark:hover:bg-yellow-600",
      icon: (
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 4c4.4 0 8 3.6 8 8s-3.6 8-8 8-8-3.6-8-8 3.6-8 8-8zm0-2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2z"/>
        </svg>
      ),
      text: "Noon Ads (Soon)"
    }
  };

  const config = configs[marketplace];

  return (
    <div className={`relative rounded-lg ${isComingSoon ? 'overflow-hidden' : ''}`}>
      <Button
        onClick={handleLogin}
        disabled={isLoading || isComingSoon}
        className={`w-full h-20 px-6 font-medium text-white ${config.bgColor} ${isComingSoon ? 'opacity-60' : ''}`}
      >
        <div className="flex flex-col items-center gap-2">
          {isLoading ? (
            <>
              <svg 
                className="animate-spin h-5 w-5" 
                xmlns="http://www.w3.org/2000/svg" 
                fill="none" 
                viewBox="0 0 24 24"
              >
                <circle 
                  className="opacity-25" 
                  cx="12" 
                  cy="12" 
                  r="10" 
                  stroke="currentColor" 
                  strokeWidth="4"
                />
                <path 
                  className="opacity-75" 
                  fill="currentColor" 
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              <span>Connecting...</span>
            </>
          ) : (
            <>
              {config.icon}
              <span>{config.text}</span>
            </>
          )}
        </div>
      </Button>
      {isComingSoon && (
        <div className="absolute inset-0 bg-black/5 dark:bg-black/20 backdrop-blur-[1px] flex items-center justify-center">
          <span className="bg-black/60 dark:bg-white/60 text-white dark:text-black text-sm px-3 py-1 rounded-full">
            Coming Soon
          </span>
        </div>
      )}
    </div>
  );
}