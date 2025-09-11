"use client";

import { useState } from "react";
import { Button } from "@repo/ui/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/components/ui/card";
import { Badge } from "@repo/ui/components/ui/badge";
import { 
  Check, 
  Clock, 
  Users, 
  BookOpen, 
  Award, 
  Infinity,
  Calendar,
  ArrowRight,
  Zap
} from "lucide-react";
import BootcampRegistrationForm from "./BootcampRegistrationForm";

const pricingFeatures = [
  {
    icon: BookOpen,
    title: "20 Hours of Live Training",
    description: "Comprehensive weekend sessions covering all AI fundamentals"
  },
  {
    icon: Users,
    title: "Cohort-Based Learning",
    description: "Learn alongside peers and build lasting professional connections"
  },
  {
    icon: Infinity,
    title: "Lifetime Community Access",
    description: "Exclusive ExplainX AI community with ongoing support and updates"
  },
  {
    icon: Award,
    title: "Certificate of Completion",
    description: "Industry-recognized certificate to showcase your AI expertise"
  },
  {
    icon: Calendar,
    title: "Flexible Weekend Schedule",
    description: "Saturday & Sunday sessions that fit your busy lifestyle"
  },
  {
    icon: Zap,
    title: "Hands-on Projects",
    description: "Build real AI applications and tools you can use immediately"
  }
];

export default function BootcampPricing() {
  const [isRegistrationOpen, setIsRegistrationOpen] = useState(false);

  return (
    <section className="py-20 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Invest in your AI future today. Early bird pricing available until June 30, 2025.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Early Bird Pricing */}
          <Card className="bg-gradient-to-b from-purple-100 to-blue-100 dark:from-purple-900/50 dark:to-blue-900/50 border-purple-200 dark:border-purple-500/50 relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-gradient-to-l from-orange-500 to-red-500 text-white px-4 py-2 text-sm font-semibold">
              EARLY BIRD 🔥
            </div>
            <CardHeader className="pt-12">
              <div className="text-center">
                <CardTitle className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  Early Bird Pricing
                </CardTitle>
                <div className="mb-4">
                  <span className="text-5xl font-bold text-gray-900 dark:text-white">₹4,999</span>
                  <span className="text-gray-500 dark:text-gray-400 line-through ml-2 text-xl">₹6,999</span>
                </div>
                <Badge className="bg-orange-600 text-white mb-4">
                  Save ₹2,000 - Limited Time Only
                </Badge>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  Available until June 30, 2025
                </p>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 mb-8">
                {pricingFeatures.map((feature, index) => {
                  const IconComponent = feature.icon;
                  return (
                    <div key={index} className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-purple-200 dark:bg-purple-600/20">
                        <IconComponent className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white text-sm">{feature.title}</h4>
                        <p className="text-gray-600 dark:text-gray-400 text-xs">{feature.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
              
              <Button 
                onClick={() => setIsRegistrationOpen(true)}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white py-3 font-semibold rounded-xl dark:from-purple-500 dark:to-blue-500 dark:hover:from-purple-600 dark:hover:to-blue-600"
              >
                Apply Now for Interview
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              
              <div className="mt-4 text-center">
                <div className="flex items-center justify-center gap-2 text-green-600 dark:text-green-400 text-sm">
                  <Check className="w-4 h-4" />
                  <span>Secure Payment • Instant Access</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Regular Pricing */}
          <Card className="bg-white/50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 relative">
            <CardHeader>
              <div className="text-center">
                <CardTitle className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  Regular Pricing
                </CardTitle>
                <div className="mb-4">
                  <span className="text-5xl font-bold text-gray-900 dark:text-white">₹6,999</span>
                </div>
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  Available after June 30, 2025
                </p>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 mb-8">
                {pricingFeatures.map((feature, index) => {
                  const IconComponent = feature.icon;
                  return (
                    <div key={index} className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700">
                        <IconComponent className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white text-sm">{feature.title}</h4>
                        <p className="text-gray-500 dark:text-gray-400 text-xs">{feature.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
              
              <Button 
                disabled
                className="w-full bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 py-3 font-semibold rounded-xl cursor-not-allowed"
              >
                Available Later
                <Clock className="w-5 h-5 ml-2" />
              </Button>
              
              <div className="mt-4 text-center">
                <p className="text-gray-500 dark:text-gray-500 text-sm">
                  Regular pricing starts July 1, 2025
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Value Proposition */}
        <div className="mt-16 text-center">
          <div className="bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 rounded-2xl p-8 border border-gray-200 dark:border-gray-700">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Why This Investment Pays Off
            </h3>
            <div className="grid md:grid-cols-3 gap-6 text-left">
              <div>
                <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">5x ROI</div>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  Average salary increase reported by our AI bootcamp graduates
                </p>
              </div>
              <div>
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">100+</div>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  AI tools and techniques you'll master in just 5 weeks
                </p>
              </div>
              <div>
                <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-2">∞</div>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  Lifetime access to updates, community, and new AI developments
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ Teaser */}
        <div className="mt-12 text-center">
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            Questions about the bootcamp? Check our FAQ below or
          </p>
          <Button 
            variant="outline"
            className="border-purple-500 text-purple-600 hover:bg-purple-500 hover:text-white dark:text-purple-400 dark:hover:bg-purple-500 dark:hover:text-white"
            onClick={() => window.open('https://calendly.com/explainx/discussion', '_blank')}
          >
            Schedule a Discussion Call
          </Button>
        </div>
      </div>

      {/* Registration Modal */}
      <BootcampRegistrationForm 
        isOpen={isRegistrationOpen}
        onClose={() => setIsRegistrationOpen(false)}
      />
    </section>
  );
} 