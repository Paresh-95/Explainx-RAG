"use client"

import React, { useState, useRef } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { Button } from "@repo/ui/components/ui/button";
import { ChevronDown, ChevronUp, ChevronRight } from "lucide-react";
import FAQDataMain from "../../data/faq-data";
import { FAQsProps } from "../../types/faq";
import FAQItem from "./faq-items";
import { cn } from "@repo/ui/lib/utils";

const RetroGrid = ({
  angle = 65,
  cellSize = 60,
  opacity = 0.3,
  lightLineColor = "gray",
  darkLineColor = "gray",
}) => {
  const gridStyles = {
    "--grid-angle": `${angle}deg`,
    "--cell-size": `${cellSize}px`,
    "--opacity": opacity,
    "--light-line": lightLineColor,
    "--dark-line": darkLineColor,
  } as React.CSSProperties

  return (
    <div
      className={cn(
        "pointer-events-none absolute size-full overflow-hidden [perspective:200px]",
        `opacity-[var(--opacity)]`,
      )}
      style={gridStyles}
    >
      <div className="absolute inset-0 [transform:rotateX(var(--grid-angle))]">
        <div className="animate-grid [background-image:linear-gradient(to_right,var(--light-line)_1px,transparent_0),linear-gradient(to_bottom,var(--light-line)_1px,transparent_0)] [background-repeat:repeat] [background-size:var(--cell-size)_var(--cell-size)] [height:300vh] [inset:0%_0px] [margin-left:-200%] [transform-origin:100%_0_0] [width:600vw] dark:[background-image:linear-gradient(to_right,var(--dark-line)_1px,transparent_0),linear-gradient(to_bottom,var(--dark-line)_1px,transparent_0)]" />
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-white to-transparent to-90% dark:from-black" />
    </div>
  )
}

export default function FAQs({ faqs }: FAQsProps) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [showAll, setShowAll] = useState(false);
  const initiallyShown = 5;

  // Create refs for each section to track when they're in view
  const headerRef = useRef(null);
  const isHeaderInView = useInView(headerRef, {
    once: true,
    amount: 0.3
  });

  const faqListRef = useRef(null);
  const isFaqListInView = useInView(faqListRef, {
    once: true,
    amount: 0.1
  });

  const showMoreBtnRef = useRef(null);
  const isShowMoreBtnInView = useInView(showMoreBtnRef, {
    once: true,
    amount: 0.8
  });

  // Use provided FAQs or fallback to main FAQ data
  const faqData = faqs || FAQDataMain;

  const toggleFAQ = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  const toggleShowAll = () => {
    setShowAll(!showAll);
  };

  return (
    <div className="relative bg-white dark:bg-[#1F1328]">
      <div className="absolute top-0 z-[0] h-screen w-screen bg-white dark:bg-purple-950/10 bg-[radial-gradient(ellipse_20%_80%_at_50%_-20%,rgba(120,119,198,0.1),rgba(255,255,255,0))] dark:bg-[radial-gradient(ellipse_20%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))]" />
      <section className="relative max-w-full mx-auto z-1">
        <div className="max-w-screen-xl z-10 mx-auto px-4 py-28 gap-12 md:px-8">
          {/* Section Header */}
          <div className="space-y-5 max-w-3xl leading-0 lg:leading-5 mx-auto text-center mb-16" ref={headerRef}>
            <motion.h1
              className="text-sm text-gray-600 dark:text-gray-400 group font-geist mx-auto px-5 py-2 bg-gradient-to-tr from-zinc-300/30 via-gray-400/30 to-transparent dark:from-zinc-300/5 dark:via-gray-400/5 border-[2px] border-black/10 dark:border-white/5 rounded-3xl w-fit"
              initial={{ y: 20, opacity: 0 }}
              animate={isHeaderInView ? { y: 0, opacity: 1 } : { y: 20, opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              QUESTIONS & ANSWERS
              <ChevronRight className="inline w-4 h-4 ml-2 group-hover:translate-x-1 duration-300" />
            </motion.h1>

            <motion.h2
              className="text-4xl tracking-tighter font-cal font-geist bg-clip-text text-transparent mx-auto md:text-6xl bg-[linear-gradient(180deg,_#000_0%,_rgba(0,_0,_0,_0.75)_100%)] dark:bg-[linear-gradient(180deg,_#FFF_0%,_rgba(255,_255,_255,_0.00)_202.08%)]"
              initial={{ y: 20, opacity: 0 }}
              animate={isHeaderInView ? { y: 0, opacity: 1 } : { y: 20, opacity: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              Frequently asked{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-500 dark:from-purple-300 dark:to-orange-200">
                questions
              </span>
            </motion.h2>

            <motion.p
              className="max-w-2xl mx-auto text-gray-600 dark:text-gray-300"
              initial={{ y: 20, opacity: 0 }}
              animate={isHeaderInView ? { y: 0, opacity: 1 } : { y: 20, opacity: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              Find answers to common questions about our enterprise AI training platform,
              implementation process, and organizational benefits.
            </motion.p>
          </div>

          {/* FAQ Container */}
          <div className="relative mx-auto max-w-3xl">
            {/* FAQ Items */}
            <div
              ref={faqListRef}
              className="space-y-4"
            >
              {faqData.slice(0, showAll ? faqData.length : initiallyShown).map((faq, index) => (
                <motion.div
                  key={index}
                  initial={{ y: 50, opacity: 0 }}
                  animate={isFaqListInView ? { y: 0, opacity: 1 } : { y: 50, opacity: 0 }}
                  transition={{
                    duration: 1.6,
                    type: "spring",
                    stiffness: 100,
                    damping: 30,
                    delay: index * 0.1,
                    opacity: { duration: 0.5 },
                  }}
                  className={cn(
                    "relative rounded-2xl p-6 text-left",
                    "bg-white dark:bg-[#261831] dark:border text-gray-600 dark:text-gray-300",
                    "hover:shadow-xl hover:shadow-purple-100/50 dark:hover:shadow-purple-500/5 transition-all duration-300"
                  )}
                >
                  <FAQItem
                    faq={faq}
                    isOpen={expandedIndex === index}
                    onToggle={() => toggleFAQ(index)}
                    index={index}
                    isVisible={isFaqListInView}
                  />
                </motion.div>
              ))}
            </div>

            {/* Show More Button */}
            {faqData.length > initiallyShown && (
              <motion.div
                ref={showMoreBtnRef}
                className="flex justify-center mt-12"
                initial={{ opacity: 0, y: 20 }}
                animate={isShowMoreBtnInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={{ duration: 0.5 }}
              >
                <Button
                  onClick={toggleShowAll}
                  className={cn(
                    "inline-flex justify-center items-center rounded-xl px-8 py-4 font-geist font-semibold text-base transition-all duration-300",
                    "bg-gradient-to-r from-purple-600 to-pink-500 dark:from-purple-500 dark:to-pink-400",
                    "text-white shadow-lg shadow-purple-500/25 dark:shadow-purple-500/20",
                    "hover:shadow-xl hover:shadow-purple-500/35 dark:hover:shadow-purple-500/30",
                    "hover:scale-[1.02] active:scale-[0.98]",
                    "border border-purple-500/20 dark:border-purple-400/20"
                  )}
                >
                  {showAll ? "Show Less Questions" : "Show More Questions"}
                </Button>
              </motion.div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}