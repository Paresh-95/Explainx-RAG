import React from "react";
import { ChevronsUp, Star } from "lucide-react";
import Image from "next/image";

interface SummaryTableProps {
  summaryTable: {
    ExplainX: string[];
    competitor: string[];
  };
  competitorLogo: string;
  competitorName: string;
}

export const SummaryTable: React.FC<SummaryTableProps> = ({ summaryTable, competitorLogo, competitorName }) => {
  return (
    <div id="compare" className="w-full max-w-3xl mx-auto my-12 rounded-2xl shadow-xl bg-gradient-to-br from-white/90 to-gray-50/90 dark:from-gray-900/80 dark:to-gray-800/80 border border-gray-200/50 dark:border-gray-700/50 p-8 flex flex-col md:flex-row items-center gap-8">
      {/* ExplainX Side */}
      <div className="flex-1 flex flex-col items-center gap-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="">
          <span className="p-2 bg-gray-200 dark:bg-gray-700 rounded-full">
            <img
              src="/assets/logo-light.png"
              alt="ExplainX logo"
              width={32}
              height={32}
              className="rounded block dark:hidden"
            />
            <img
              src="/assets/logo-dark.png"
              alt="ExplainX logo"
              width={32}
              height={32}
              className="rounded hidden dark:block"
            />
          </span>

          </span>
          <span className="font-geist text-lg font-bold">
            ExplainX.ai
          </span>
        </div>
        <ul className="space-y-2 w-full">
          {summaryTable.ExplainX.map((point, idx) => (
            <li key={idx} className="flex items-start gap-2 text-purple-800 dark:text-purple-200 font-geist text-base">
              <span className="mt-1">
                <Star className="w-4 h-4 text-purple-500 dark:text-purple-300" />
              </span>
              <span>{point}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Divider */}
      <div className="hidden md:block w-px h-40 bg-gradient-to-b from-purple-200 via-gray-300 to-pink-200 dark:from-purple-700 dark:via-gray-700 dark:to-pink-700 mx-6" />

      {/* Competitor Side */}
      <div className="flex-1 flex flex-col items-center gap-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="p-2 bg-gray-200 dark:bg-gray-700 rounded-full">
            <img
              src={competitorLogo}
              alt={competitorName + " logo"}
              width={32}
              height={32}
              className="rounded"

            />
          </span>
          <span className="font-geist text-lg font-bold text-gray-800 dark:text-gray-100">
            {competitorName}
          </span>
        </div>
        <ul className="space-y-2 w-full">
          {summaryTable.competitor.map((point, idx) => (
            <li key={idx} className="flex items-start gap-2 text-gray-700 dark:text-gray-200 font-geist text-base">
              <span className="mt-1">
                <Star className="w-4 h-4 text-gray-400 dark:text-gray-500" />
              </span>
              <span>{point}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}; 