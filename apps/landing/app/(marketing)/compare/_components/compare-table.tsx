"use client"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@repo/ui/components/ui/table";
import { Check, X, Star, Zap } from "lucide-react";
import { Competitor } from "../../../../data/competitors";
import { motion } from 'framer-motion';

export function ComparisonTable({ competitor }: { competitor: Competitor }) {
  return (
    <div className="relative">
      {/* Background gradient similar to heading */}
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
            Feature Comparison
          </div>
          <h1 className="text-4xl tracking-tighter font-geist bg-clip-text text-transparent md:text-5xl bg-[linear-gradient(180deg,_#000_0%,_rgba(0,_0,_0,_0.75)_100%)] dark:bg-[linear-gradient(180deg,_#FFF_0%,_rgba(255,_255,_255,_0.00)_202.08%)]">
            ExplainX.ai vs {" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-500 dark:from-purple-300 dark:to-orange-200">
              {competitor.name}
            </span>
          </h1>
        </motion.div>

        <div className="space-y-12">
          {competitor.features.map((category, categoryIndex) => (
            <motion.div 
              key={category.category}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: categoryIndex * 0.1 }}
              className="bg-gradient-to-br from-white/80 to-gray-50/80 dark:from-gray-900/80 dark:to-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 overflow-hidden"
            >
              {/* Category Header */}
              <div className="bg-gradient-to-r from-purple-600/10 to-pink-500/10 dark:from-purple-400/20 dark:to-pink-400/20 px-8 py-6 border-b border-gray-200/50 dark:border-gray-700/50">
                <h2 className="text-2xl font-bold font-geist bg-clip-text text-transparent bg-[linear-gradient(180deg,_#000_0%,_rgba(0,_0,_0,_0.75)_100%)] dark:bg-[linear-gradient(180deg,_#FFF_0%,_rgba(255,_255,_255,_0.00)_202.08%)] flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-r from-purple-600 to-pink-500 rounded-lg">
                    <Zap className="w-5 h-5 text-white" />
                  </div>
                  {category.category}
                </h2>
              </div>

              {/* Table Content */}
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-b border-gray-200/50 dark:border-gray-700/50 hover:bg-transparent">
                      <TableHead className="w-1/3 font-geist font-semibold text-gray-900 dark:text-gray-100 px-8 py-4">
                        Feature
                      </TableHead>
                      <TableHead className="font-geist font-semibold px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 bg-gradient-to-r from-purple-600 to-pink-500 rounded-md">
                            <Star className="w-4 h-4 text-white" />
                          </div>
                          <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-500 dark:from-purple-300 dark:to-orange-200">
                            ExplainX.ai
                          </span>
                        </div>
                      </TableHead>
                      <TableHead className="font-geist font-semibold text-gray-900 dark:text-gray-100 px-6 py-4">
                        {competitor.name}
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {category.features.map((feature, featureIndex) => (
                      <TableRow 
                        key={feature.name} 
                        className="border-b border-gray-200/30 dark:border-gray-700/30 hover:bg-gradient-to-r hover:from-purple-50/50 hover:to-pink-50/50 dark:hover:from-purple-900/20 dark:hover:to-pink-900/20 transition-all duration-200"
                      >
                        <TableCell className="font-medium px-8 py-6">
                          <div className="font-geist text-gray-900 dark:text-gray-100 font-medium">
                            {feature.name}
                          </div>
                          {feature.description && (
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 font-geist">
                              {feature.description}
                            </p>
                          )}
                        </TableCell>
                        <TableCell className="px-6 py-6">
                          <div className="flex items-center">
                            {renderFeatureValue(feature.ExplainX, true)}
                          </div>
                        </TableCell>
                        <TableCell className="px-6 py-6">
                          <div className="flex items-center">
                            {renderFeatureValue(feature.competitor, false)}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </motion.div>
          ))}
        </div>

 
      </div>
    </div>
  );
}

function renderFeatureValue(value: boolean | string | string[], isExplainX: boolean = false) {
  if (typeof value === "boolean") {
    return value ? (
      <div className={`flex items-center gap-2 ${isExplainX ? 'text-purple-600 dark:text-purple-400' : 'text-green-500'}`}>
        <div className={`p-1 rounded-full ${isExplainX ? 'bg-purple-100 dark:bg-purple-900/30' : 'bg-green-100 dark:bg-green-900/30'}`}>
          <Check className="w-4 h-4" />
        </div>
        <span className="font-geist font-medium">Yes</span>
      </div>
    ) : (
      <div className="flex items-center gap-2 text-red-500">
        <div className="p-1 rounded-full bg-red-100 dark:bg-red-900/30">
          <X className="w-4 h-4" />
        </div>
        <span className="font-geist font-medium">No</span>
      </div>
    );
  }
  
  if (Array.isArray(value)) {
    return (
      <div className="flex flex-wrap gap-1">
        {value.map((item, index) => (
          <span 
            key={index}
            className={`px-2 py-1 text-xs font-medium rounded-md font-geist ${
              isExplainX 
                ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300' 
                : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
            }`}
          >
            {item}
          </span>
        ))}
      </div>
    );
  }
  
  return (
    <span className={`font-geist font-medium ${
      isExplainX 
        ? 'text-purple-600 dark:text-purple-400' 
        : 'text-gray-700 dark:text-gray-300'
    }`}>
      {value}
    </span>
  );
}