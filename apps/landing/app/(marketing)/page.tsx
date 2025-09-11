"use client";

import { Suspense, useEffect, useState } from "react";
import FAQSection from "../_components/faq-section";
import { Heading } from "../_components/heading";
import { Testimonials } from "../_components/testimonials";
import { CTA } from "../_components/cta";
import { HomePageStructuredData } from './StructuredData';
import ServicesPage from "../_components/explainx-services";
import DeliveryStats from "../_components/impact2";
import GuaranteesSection from "../_components/guarantees";
import { plans } from "../../data/plans/pricing";
import { useRouter } from 'next/navigation';
import corporateFaqData from "../../data/corporate-faq-data";

import { HeroSection } from "../_components/hero2";
import ServicesSection from "../_components/service2";
import TeamSection from "../_components/team";
import TemplateSlider from "../_components/agentCard";
import Services2 from "../_components/service2";
import { HeroHeader } from "../_components/hero5-header";
import { FeaturesSectionWithHoverEffects } from "../_components/guarantees2";
import Features from "../_components/feature-8";
import { Pricing } from "../_components/explainx-pricing";
import SecurityCompliance from "../_components/security-compliance";

// shadcn/ui imports
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@repo/ui/components/ui/dialog";
import { Button } from "@repo/ui/components/ui/button";
import { Input } from "@repo/ui/components/ui/input";
import { Clock, Gift, Star, Mail, User } from "lucide-react";
import CategorySection from "../_components/category";

// Popup Dialog Component using shadcn/ui
const PopupDialog = ({
  isOpen,
  onClose,
  onEmailSubmit
}: {
  isOpen: boolean;
  onClose: () => void;
  onEmailSubmit: (email: string, name: string) => void;
}) => {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !name) return;

    setIsSubmitting(true);
    try {
      await onEmailSubmit(email, name);
      // Save to Chrome storage to prevent showing again
      localStorage.setItem("popupShown", "true");
      // Close dialog after successful submission
      onClose();
    } catch (error) {
      console.error("Failed to submit email and name:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg border-0 shadow-2xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
        <DialogHeader className="text-center space-y-6 pb-2">
          {/* Illustration/Icon */}
          <div className="mx-auto w-20 h-20 bg-gradient-to-br from-purple-500 via-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
            <div className="relative">
              <Star className="w-10 h-10 text-white" fill="currentColor" />
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full flex items-center justify-center">
                <span className="text-xs">✨</span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-white">
              Get Organization Intelligence Guide!
            </DialogTitle>
            <DialogDescription className="text-base text-gray-600 dark:text-gray-300 leading-relaxed">
              Download our comprehensive guide on implementing AI-powered intelligence solutions in your organization.
              Includes strategic frameworks, ROI calculations, and implementation roadmaps.
            </DialogDescription>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />
            <Input
              type="text"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="pl-11 py-3 text-base border-2 border-gray-200 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              required
            />
          </div>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />
            <Input
              type="email"
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-11 py-3 text-base border-2 border-gray-200 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              required
            />
          </div>

          <Button
            type="submit"
            disabled={isSubmitting || !email || !name}
            className="w-full py-3 bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 hover:from-purple-700 hover:via-blue-700 hover:to-indigo-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
          >
            {isSubmitting ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Getting your guide...
              </div>
            ) : (
              "Get Intelligence Guide"
            )}
          </Button>
        </form>

        {/* Benefits/Features */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300">
            <div className="w-2 h-2 bg-green-500 rounded-full" />
            <span>Complete organizational intelligence strategy guide</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300">
            <div className="w-2 h-2 bg-green-500 rounded-full" />
            <span>Intelligence ROI calculator and implementation roadmap</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300">
            <div className="w-2 h-2 bg-green-500 rounded-full" />
            <span>Case studies from leading organizations</span>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center pt-2">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            No spam, unsubscribe anytime. We respect your privacy.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const MarketingPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [discountActivated, setDiscountActivated] = useState(false);
  const [showStickyButton, setShowStickyButton] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const router = useRouter();

  const handleBuyClick = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ discountCode: discountActivated ? 'I2MDM5MG' : undefined }),
      });
      const data = await response.json();
      if (data.checkoutUrl) window.location.href = data.checkoutUrl;
      else console.error('Error creating checkout:', data.error);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (!isChatOpen && event.key.toLowerCase() === 'b') {
        setDiscountActivated(true);
        handleBuyClick();
      }
    };

    const handleScroll = () => {
      const headingElement = document.querySelector('.heading');
      if (headingElement) {
        const headingRect = headingElement.getBoundingClientRect();
        setShowStickyButton(headingRect.bottom <= 0);
      }
    };

    const popupShown = localStorage.getItem("popupShown");
    if (!popupShown) {
      // Popup timer - show after 10 seconds
      const popupTimer = setTimeout(() => {
        setShowPopup(true);
      }, 6000); // 5 seconds

      return () => clearTimeout(popupTimer);
    }

    document.addEventListener('keydown', handleKeyPress);
    window.addEventListener('scroll', handleScroll);

    return () => {
      document.removeEventListener('keydown', handleKeyPress);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [isChatOpen]);

  const handleClosePopup = () => {
    setShowPopup(false);
    localStorage.setItem("popupShown", "true"); // Prevent showing again
  };

  const handlePopupEmailSubmit = async (email: string, name: string) => {
    try {
      // Replace this with your actual email collection API
      const response = await fetch('/api/free-resource', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          name,
          source: 'popup',
        }),
      });

      if (response.ok) {
        console.log('Email and name submitted successfully:', { email, name });
        // Redirect to the desired page after successful submission
        router.push('/r/prompt-engineering');
      } else {
        throw new Error('Failed to submit email and name');
      }
    } catch (error) {
      console.error('Error submitting email and name:', error);
      // You could show an error toast here
      // toast.error("Something went wrong. Please try again.");
      throw error; // Re-throw to handle in component
    }
  };

  return (
    <div className="min-h-full flex flex-col">
      <HomePageStructuredData />
      <HeroSection />
      <Features />
      <CategorySection />
      <SecurityCompliance />
      {/* <CTA /> */}
      <Suspense>
        <div className="bg-background dark:bg-dark text-foreground">
          <Pricing
            plans={plans}
            title="Simple, Transparent Pricing"
            description="Choose the plan that works for you All plans include access to our platform, lead generation tools, and dedicated support."
          />
        </div>
      </Suspense>
      <FAQSection faqs={corporateFaqData} />
      {/* <CTA /> */}

      {/* Popup Dialog */}
      <PopupDialog
        isOpen={showPopup}
        onClose={handleClosePopup}
        onEmailSubmit={handlePopupEmailSubmit}
      />
    </div>
  );
}

export default MarketingPage;