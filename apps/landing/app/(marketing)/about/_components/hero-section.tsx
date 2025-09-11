'use client';

import { Button } from "@repo/ui/components/ui/button";
import Link from "next/link";
import { Badge } from "@repo/ui/components/ui/badge";
import { ArrowRight } from "lucide-react";

export function HeroSection() {
  return (
    <div className="container max-w-7xl mx-auto px-4 py-24 md:py-32 text-center space-y-8">
      <Badge 
        variant="outline" 
        className="mb-4 bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/50 dark:text-yellow-300 dark:border-yellow-400/30"
      >
        AI Innovation
      </Badge>
      
      <h1 className="font-cal text-4xl md:text-5xl lg:text-6xl text-foreground">
        Pioneering <span className=" ">AI Agents</span>
      </h1>
      
      <p className="text-muted-foreground max-w-[700px] mx-auto text-lg">
        Building the future of AI agents for businesses and developers. From custom AI solutions 
        to open-source tools, we're revolutionizing how teams interact with artificial intelligence.
      </p>
      
      <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
        <Link href="/waitlist">
          <Button 
            size="lg" 
            className="bg-yellow-500 hover:bg-yellow-600 text-black font-medium px-8 py-6 h-auto"
          >
            Explore AI Agents
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </Link>
        
        <Link href="/waitlist">
          <Button 
            variant="outline" 
            size="lg"
            className="border-yellow-500/50 hover:border-yellow-500 text-foreground hover:bg-yellow-500/10 dark:border-yellow-400/50 dark:hover:border-yellow-400 dark:hover:bg-yellow-400/10 px-8 py-6 h-auto"
          >
            Build With Us
          </Button>
        </Link>
      </div>
    </div>
  );
}