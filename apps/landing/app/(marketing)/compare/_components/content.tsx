"use client"

import { motion } from "framer-motion";

interface ContentSectionProps {
  whatMakeDifferent: { header: string; para: string };
  rightChoise: { header: string; para: string };
}

export function ContentSection({ whatMakeDifferent, rightChoise }: ContentSectionProps) {
  return (
    <div className="relative py-16">
      {/* Background gradient */}
      <div className="absolute inset-0 z-0 h-full w-full bg-white dark:bg-[#1F1328]" />
      <div className="relative mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        {[whatMakeDifferent, rightChoise].map((section, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: idx * 0.1 }}
            className={idx !== 0 ? "mt-16" : ""}
          >
            <h2 className="text-3xl md:text-4xl font-bold font-geist mb-6 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-500 dark:from-purple-300 dark:to-orange-200">
              {section.header}
            </h2>
            <p className="text-lg font-geist text-gray-800 dark:text-gray-200 leading-relaxed">
              {section.para}
            </p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
