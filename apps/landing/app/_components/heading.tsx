'use client';

import { useState } from 'react';
import Image from "next/image";
import { CTAButtons } from "./cta-ab";
import { cn } from "@repo/ui/lib/utils";
import { Bot, DollarSign, Clock, Zap, CheckCircle2, Users, ArrowRight, Calculator } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { SummaryTable } from '../(marketing)/compare/_components/summaryTable';

const CostCalculator = () => {
  const [employees, setEmployees] = useState(5);
  const [workload, setWorkload] = useState(40);
  
  const traditionalCost = employees * 4000;
  const aiCost = Math.round((employees * workload / 168) * 800);
  const savings = traditionalCost - aiCost;
  const savingsPercentage = Math.round((savings / traditionalCost) * 100);
  
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-gradient-to-br from-blue-50 to-white rounded-2xl p-8 shadow-xl max-w-2xl mx-auto border border-blue-100"
    >
      <div className="flex items-center gap-3 mb-8">
        <div className="p-2 bg-blue-600 rounded-lg">
          <Calculator className="w-6 h-6 text-white" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900">ROI Calculator</h3>
      </div>
      
      <div className="space-y-8">
        <div>
          <div className="flex justify-between mb-2">
            <label className="font-medium text-gray-900">Team Size</label>
            <span className="text-blue-600 font-medium">{employees} employees</span>
          </div>
          <input
            type="range"
            min="1"
            max="20"
            value={employees}
            onChange={(e) => setEmployees(Number(e.target.value))}
            className="w-full h-2 bg-blue-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />
        </div>
        
        <div>
          <div className="flex justify-between mb-2">
            <label className="font-medium text-gray-900">Weekly Hours</label>
            <span className="text-blue-600 font-medium">{workload}h / week</span>
          </div>
          <input
            type="range"
            min="10"
            max="80"
            value={workload}
            onChange={(e) => setWorkload(Number(e.target.value))}
            className="w-full h-2 bg-blue-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white p-4 rounded-xl border border-gray-200">
            <div className="text-sm text-gray-500 mb-1">Current Cost</div>
            <div className="text-2xl font-bold text-gray-900">${traditionalCost.toLocaleString()}</div>
            <div className="text-sm text-gray-500">per month</div>
          </div>
          <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
            <div className="text-sm text-gray-500 mb-1">AI Cost</div>
            <div className="text-2xl font-bold text-blue-600">${aiCost.toLocaleString()}</div>
            <div className="text-sm text-gray-500">per month</div>
          </div>
        </div>
        
        <div className="bg-green-50 p-6 rounded-xl border border-green-100">
          <div className="flex items-center justify-between mb-2">
            <div className="text-lg font-medium text-gray-900">Your Savings</div>
            <div className="px-3 py-1 bg-green-100 rounded-full text-green-700 font-medium">
              {savingsPercentage}% saved
            </div>
          </div>
          <div className="text-4xl font-bold text-green-600">${savings.toLocaleString()}</div>
          <div className="text-sm text-gray-500 mt-1">per month</div>
        </div>
      </div>
    </motion.div>
  );
};

export const Heading = (props: {
  title?: string;
  subtitle?: string;
  image?: string;
  summaryTable: { ExplainX: string[]; competitor: string[] };
  logo: string
  name:string
}) => {
  return (
    <div className="relative">
      <div className="absolute inset-0 z-0 h-full w-full bg-white dark:bg-[#1F1328] bg-[radial-gradient(ellipse_20%_80%_at_50%_-20%,rgba(120,119,198,0.1),rgba(255,255,255,0))] dark:bg-[radial-gradient(ellipse_20%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))]" />
      <div className="relative">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          <div className="flex flex-col lg:flex-row gap-16 items-start lg:items-center">
            <div className="flex-1 text-left">
              <motion.h1
                className="text-sm text-gray-600 dark:text-gray-400 group font-geist px-5 py-2 bg-gradient-to-tr from-zinc-300/30 via-gray-400/30 to-transparent dark:from-zinc-300/5 dark:via-gray-400/5 border-[2px] border-black/10 dark:border-white/5 rounded-3xl w-fit mb-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                {props.title || "Future of Work"}
              </motion.h1>
              <motion.h2
                className="text-4xl tracking-tighter font-geist bg-clip-text text-transparent md:text-6xl bg-[linear-gradient(180deg,_#000_0%,_rgba(0,_0,_0,_0.75)_100%)] dark:bg-[linear-gradient(180deg,_#FFF_0%,_rgba(255,_255,_255,_0.00)_202.08%)]"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                The Future of Communities Is {" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-500 dark:from-purple-300 dark:to-orange-200">
                AI-Powered
                </span>
              </motion.h2>
              <motion.p
                className="max-w-2xl text-gray-600 dark:text-gray-300 mt-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                {props.subtitle ||
                  "Side-by-side feature comparison to help you pick the best solution for your business."}
              </motion.p>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="flex gap-4 justify-start mt-8"
              >
                <Link
                  href="#compare"
                  className="inline-flex items-center px-6 py-3 text-lg font-medium text-white bg-gradient-to-r from-purple-600 to-pink-500 dark:from-purple-500 dark:to-pink-400 rounded-xl shadow-lg shadow-purple-500/25 dark:shadow-purple-500/20 hover:shadow-xl hover:shadow-purple-500/35 dark:hover:shadow-purple-500/30 hover:scale-[1.02] active:scale-[0.98] border border-purple-500/20 dark:border-purple-400/20"
                >
                  Compare Platforms


                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </motion.div>
            </div>
            <div className="flex-1 pt-10">
              <SummaryTable
                summaryTable={props.summaryTable}
                competitorLogo={props.logo}
                competitorName={props.name}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export function HeroText(props: { children: React.ReactNode; className?: string; }) {
  const { className, ...rest } = props;
  return (
    <h1
      className={cn(
        "font-cal text-4xl lg:text-5xl font-bold text-gray-900 leading-tight",
        className
      )}
      {...rest}
    />
  );
}

export function HeroSubtitle(props: { children: React.ReactNode }) {
  return (
    <p
      className="text-xl text-gray-600"
      {...props}
    />
  );
}