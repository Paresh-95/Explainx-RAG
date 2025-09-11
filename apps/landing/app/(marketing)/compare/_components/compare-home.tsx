"use client";

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, CheckCircle2, XCircle } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@repo/ui/components/ui/card'
import { competitors } from '../../../../data/competitors'
import { Badge } from '@repo/ui/components/ui/badge'
import { motion } from 'framer-motion'

export default function CompareHome() {
  return (
    <div className="relative">
      {/* Background gradient overlay for light/dark mode */}
      <div className="absolute inset-0 z-0 h-full w-full bg-white dark:bg-[#1F1328] bg-[radial-gradient(ellipse_20%_80%_at_50%_-20%,rgba(120,119,198,0.1),rgba(255,255,255,0))] dark:bg-[radial-gradient(ellipse_20%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))] pt-10" />
      <div className="container relative z-10 space-y-12 py-16">
        {/* Header section styled like testimonials/header/compare-table */}
        <motion.div 
          className="text-center mb-12 pt-20"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="text-sm text-gray-600 dark:text-gray-400 font-geist px-5 py-2 bg-gradient-to-tr from-zinc-300/30 via-gray-400/30 to-transparent dark:from-zinc-300/5 dark:via-gray-400/5 border-[2px] border-black/10 dark:border-white/5 rounded-3xl w-fit mx-auto mb-4">
            Comparison
          </div>
          <h1 className="text-4xl tracking-tighter font-geist bg-clip-text text-transparent md:text-5xl bg-[linear-gradient(180deg,_#000_0%,_rgba(0,_0,_0,_0.75)_100%)] dark:bg-[linear-gradient(180deg,_#FFF_0%,_rgba(255,_255,_255,_0.00)_202.08%)] font-bold mb-4">
            Compare <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-500 dark:from-purple-300 dark:to-orange-200">explainx.ai</span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-xl mx-auto">
            See how ExplainX stacks up against other platforms across features, pricing, and capabilities
          </p>
        </motion.div>
        {/* Card grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {Object.entries(competitors).map(([slug, competitor]) => (
            <Link key={slug} href={`/compare/${slug}`} className="group">
              <Card className="relative h-full transition-all duration-300 bg-white/60 dark:bg-gray-900/60 backdrop-blur-md border border-gray-200/40 dark:border-gray-700/40 shadow-xl hover:shadow-2xl hover:scale-[1.03] hover:border-purple-400/60 dark:hover:border-purple-400/40 overflow-hidden group">
                {/* Gradient accent bar */}
                <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-purple-500 via-pink-400 to-orange-300 dark:from-purple-300 dark:via-pink-300 dark:to-orange-200" />
                <CardHeader className="pb-2 pt-6 pl-6 pr-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <Image
                        src={competitor.logo}
                        alt={competitor.name + ' logo'}
                        width={32}
                        height={32}
                        className="object-contain w-8 h-8 rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900"
                      />
                      <CardTitle className="text-2xl font-semibold text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-300 transition-colors">
                        Explainx vs {competitor.name}
                      </CardTitle>
                    </div>
                    <Badge 
                      variant="outline" 
                      className="bg-purple-100/30 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 border-purple-200/40 dark:border-purple-400/20 font-medium text-xs px-3 py-1 rounded-xl"
                    >
                      {competitor.category}
                    </Badge>
                  </div>
                  <CardDescription className="text-gray-600 dark:text-gray-300 text-base">
                    {competitor.shortDescription}
                  </CardDescription>
                </CardHeader>

                <CardContent className="px-6 pb-4">
                  <div className="space-y-5">
                    {competitor.features.slice(0, 2).map((category, idx) => (
                      <div key={idx} className="space-y-2">
                        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-400 tracking-wide">
                          {category.category}
                        </h3>
                        <div className="space-y-1">
                          {category.features.slice(0, 3).map((feature, fidx) => (
                            <div key={fidx} className="flex items-center gap-2 text-sm">
                              {typeof feature.competitor === 'boolean' ? (
                                feature.competitor ? 
                                  <CheckCircle2 className="h-4 w-4 text-purple-600 dark:text-purple-400" /> : 
                                  <XCircle className="h-4 w-4 text-red-500" />
                              ) : null}
                              <span className="text-gray-900 dark:text-gray-300 font-medium">{feature.name}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>

                <CardFooter className="px-6 pb-6 pt-2">
                  <div className="w-full flex items-center justify-between text-purple-600 dark:text-purple-300">
                    <span className="text-sm font-semibold tracking-wide">View full comparison</span>
                    <ArrowRight className="h-5 w-5 transition-transform duration-200 group-hover:translate-x-2 group-hover:scale-110" />
                  </div>
                </CardFooter>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}