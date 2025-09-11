"use client"
import { Star } from "lucide-react";
import { motion } from "framer-motion";

interface UserReviewsProps {
  userComparisons: {
    explainxStar: number;
    competitorStar: number;
    reviews: { user: string; text: string }[];
  };
  competitorName: string;
}

export function UserReviews({ userComparisons, competitorName }: UserReviewsProps) {
  return (
    <div className="relative ">
      {/* Background gradient similar to compare table */}
      <div className="absolute inset-0 z-0 h-full w-full bg-white dark:bg-[#1F1328]" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        {/* Header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="text-sm text-gray-600 dark:text-gray-400 font-geist px-5 py-2 bg-gradient-to-tr from-zinc-300/30 via-gray-400/30 to-transparent dark:from-zinc-300/5 dark:via-gray-400/5 border-[2px] border-black/10 dark:border-white/5 rounded-3xl w-fit mx-auto mb-4">
            User Reviews & Ratings
          </div>
          <h2 className="text-4xl tracking-tighter font-geist bg-clip-text text-transparent md:text-5xl bg-[linear-gradient(180deg,_#000_0%,_rgba(0,_0,_0,_0.75)_100%)] dark:bg-[linear-gradient(180deg,_#FFF_0%,_rgba(255,_255,_255,_0.00)_202.08%)]">
            What users say about <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-500 dark:from-purple-300 dark:to-orange-200">ExplainX.ai</span> vs <span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-600 to-gray-400 dark:from-gray-200 dark:to-gray-400">{competitorName}</span>
          </h2>
        </motion.div>

        {/* Ratings Table */}
        <div className="flex flex-col md:flex-row gap-8 justify-center items-center mb-12">
          <div className="flex-1 flex flex-col items-center gap-2 bg-gradient-to-br from-purple-50/60 to-pink-50/60 dark:from-purple-900/30 dark:to-pink-900/30 rounded-2xl p-8 shadow border border-purple-200/40 dark:border-purple-400/20">
            <span className="font-geist text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-500 dark:from-purple-300 dark:to-orange-200">ExplainX.ai</span>
            <div className="flex items-center gap-2 mt-2">
              <Star className="w-6 h-6 text-purple-500 dark:text-purple-300" />
              <span className="text-2xl font-bold text-purple-800 dark:text-purple-200">{userComparisons.explainxStar.toFixed(1)}</span>
              <span className="text-gray-500 dark:text-gray-400">/ 5</span>
            </div>
          </div>
          <div className="flex-1 flex flex-col items-center gap-2 bg-gradient-to-br from-gray-100/60 to-gray-50/60 dark:from-gray-800/30 dark:to-gray-700/30 rounded-2xl p-8 shadow border border-gray-200/40 dark:border-gray-400/20">
            <span className="font-geist text-lg font-bold text-gray-800 dark:text-gray-100">{competitorName}</span>
            <div className="flex items-center gap-2 mt-2">
              <Star className="w-6 h-6 text-gray-400 dark:text-gray-300" />
              <span className="text-2xl font-bold text-gray-800 dark:text-gray-200">{userComparisons.competitorStar.toFixed(1)}</span>
              <span className="text-gray-500 dark:text-gray-400">/ 5</span>
            </div>
          </div>
        </div>

        {/* User Reviews List */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {userComparisons.reviews.map((review, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: idx * 0.1 }}
              className="bg-gradient-to-br from-white/80 to-gray-50/80 dark:from-gray-900/80 dark:to-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 p-6 flex flex-col gap-4"
            >
              <div className="font-geist text-lg font-semibold text-purple-700 dark:text-purple-300 flex items-center gap-2">
                <Star className="w-4 h-4 text-purple-500 dark:text-purple-300" />
                {review.user}
              </div>
              <div className="text-gray-700 dark:text-gray-200 font-geist text-base">
                {review.text}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
