// 4. Updated Summary Component: components/summary/SummaryUI.tsx
import React, { useState, useEffect } from "react";
import { Button } from "@repo/ui/components/ui/button";
import { Progress } from "@repo/ui/components/ui/progress";
import {
  BookOpen,
  Clock,
  Settings,
  Sparkles,
  BookMarked,
  RotateCcw,
} from "lucide-react";
import {
  Summary,
  SummaryUIProps,
  SectionSummary,
} from "../../types/summary/summary";
import { summaryStorageUtils } from "../../lib/summary/storage";

export default function SummaryUI({ studyMaterialId, userId }: SummaryUIProps) {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<"main" | number>("main");
  const [isRegenerating, setIsRegenerating] = useState(false);

  useEffect(() => {
    fetchSummary();
  }, [studyMaterialId, userId]);

  const fetchSummary = async (forceRegenerate = false) => {
    try {
      setIsLoading(true);
      setError(null);

      if (forceRegenerate) {
        setIsRegenerating(true);
      }

      // Try cache first if not regenerating
      if (!forceRegenerate) {
        const cached = await summaryStorageUtils.getCachedSummary(
          studyMaterialId,
          userId,
        );
        if (cached) {
          setSummary(cached.summary);
          setIsLoading(false);
          return;
        }
      }

      const response = await fetch("/api/summary/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          studyMaterialId,
          forceRegenerate,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch summary");
      }

      const data = await response.json();
      setSummary(data.summary);

      const version = data.lastUpdated || new Date().toISOString();
      await summaryStorageUtils.cacheSummary(
        studyMaterialId,
        userId,
        data.summary,
        version,
      );
      setActiveSection("main");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load summary");
    } finally {
      setIsLoading(false);
      setIsRegenerating(false);
    }
  };

  const handleSectionChange = (section: "main" | number) => {
    setActiveSection(section);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center w-full min-h-[400px] border rounded bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white">
        <div className="flex items-center gap-2">
          <Sparkles className="animate-pulse" size={24} />
          <span className="text-lg">
            {isRegenerating
              ? "Regenerating summary..."
              : "Generating summary..."}
          </span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white p-6 flex items-center justify-center ">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
          <div className="flex gap-2 justify-center">
            <Button
              variant="outline"
              onClick={() => fetchSummary(false)}
              className="text-zinc-900 dark:text-white border-zinc-900 dark:border-white hover:bg-zinc-100 dark:hover:bg-zinc-800"
            >
              Retry
            </Button>
            <Button
              onClick={() => fetchSummary(true)}
              className="bg-purple-600 text-white hover:bg-purple-700"
            >
              Generate New Summary
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!summary) return null;

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "beginner":
        return "text-green-500";
      case "intermediate":
        return "text-yellow-500";
      case "advanced":
        return "text-red-500";
      default:
        return "text-white";
    }
  };

  const renderSection = (section: SectionSummary, index: number) => (
    <div key={index} className="space-y-4">
      <h3 className="text-xl font-semibold">{section.title}</h3>
      <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed">
        {section.summary}
      </p>
      <div className="mt-4">
        <h4 className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-2">
          Key Points:
        </h4>
        <ul className="list-disc list-inside space-y-2">
          {section.keyPoints.map((point, idx) => (
            <li key={idx} className="text-zinc-700 dark:text-zinc-300">
              {point}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white p-6">
      <div className="max-w-xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="text-2xl font-bold">{summary.title}</div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => fetchSummary(true)}
              disabled={isRegenerating}
              className="text-zinc-900 dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-50"
            >
              <RotateCcw
                className={`h-5 w-5 ${isRegenerating ? "animate-spin" : ""}`}
              />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-zinc-900 dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800"
            >
              <Settings className="h-5 w-5" />
            </Button>
          </div>
        </div>
        {/* Meta Information */}
        <div className="flex items-center gap-6 mb-8 text-sm">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-zinc-400" />
            <span className="text-zinc-600 dark:text-zinc-300">
              {summary.estimatedReadingTime} min read
            </span>
          </div>
          <div className="flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-zinc-400" />
            <span className={getDifficultyColor(summary.difficulty)}>
              {summary.difficulty.charAt(0).toUpperCase() +
                summary.difficulty.slice(1)}
            </span>
          </div>
        </div>
        {/* Navigation */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          <Button
            variant={activeSection === "main" ? "default" : "ghost"}
            onClick={() => handleSectionChange("main")}
            className={
              activeSection === "main"
                ? "bg-purple-600 text-white"
                : "text-zinc-900 dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800"
            }
          >
            Main Summary
          </Button>
          {summary.sections?.map((_, index) => (
            <Button
              key={index}
              variant={activeSection === index ? "default" : "ghost"}
              onClick={() => handleSectionChange(index)}
              className={
                activeSection === index
                  ? "bg-purple-600 text-white"
                  : "text-zinc-900 dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800"
              }
            >
              Section {index + 1}
            </Button>
          ))}
        </div>
        {/* Content */}
        <div className="space-y-6">
          {activeSection === "main" ? (
            <>
              {/* Main Summary */}
              <div className="bg-zinc-100 dark:bg-zinc-800/50 rounded-lg p-6 space-y-4">
                <h2 className="text-xl font-semibold">Overview</h2>
                <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed">
                  {summary.mainSummary}
                </p>
              </div>
              {/* Key Points */}
              <div className="bg-zinc-100 dark:bg-zinc-800/50 rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-4">Key Points</h2>
                <ul className="list-disc list-inside space-y-2">
                  {summary.keyPoints.map((point, idx) => (
                    <li key={idx} className="text-zinc-700 dark:text-zinc-300">
                      {point}
                    </li>
                  ))}
                </ul>
              </div>
              {/* Important Concepts */}
              <div className="bg-zinc-100 dark:bg-zinc-800/50 rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-4">
                  Important Concepts
                </h2>
                <div className="flex flex-wrap gap-2">
                  {summary.importantConcepts.map((concept, idx) => (
                    <div
                      key={idx}
                      className="bg-zinc-200 dark:bg-zinc-700 px-3 py-1 rounded-full text-sm text-zinc-800 dark:text-zinc-200"
                    >
                      {concept}
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            // Section Content
            <div className="bg-zinc-100 dark:bg-zinc-800/50 rounded-lg p-6">
              {summary.sections &&
                summary.sections[activeSection as number] &&
                renderSection(
                  summary.sections[activeSection as number] as SectionSummary,
                  activeSection as number,
                )}
            </div>
          )}
        </div>
        {/* Reading Progress */}
        {/* Progress bar removed as per request */}
      </div>
    </div>
  );
}

