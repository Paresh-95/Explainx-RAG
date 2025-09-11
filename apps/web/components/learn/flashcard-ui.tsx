import React, { useState, useEffect } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Lightbulb,
  Sparkles,
  RotateCcw,
} from "lucide-react";
import {
  Flashcard,
  FlashcardUIProps,
} from "../../types/flashcard/flashcard";
import { storageUtils } from "../../lib/flashcards/storage";

export default function FlashcardUI({
  studyMaterialId,
  spaceId,
  userId,
}: FlashcardUIProps) {
  const [current, setCurrent] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRegenerating, setIsRegenerating] = useState(false);

  useEffect(() => {
    generateFlashcards();
  }, [studyMaterialId, spaceId, userId]);

  const generateFlashcards = async (forceRegenerate = false) => {
    try {
      setIsLoading(true);
      setError(null);

      if (forceRegenerate) {
        setIsRegenerating(true);
      }

      // Try cache first if not regenerating
      if (!forceRegenerate) {
        const cached = await storageUtils.getCachedFlashcards(
          studyMaterialId,
          userId
        );
        if (cached) {
          setCards(cached.flashcards);
          setIsLoading(false);
          return;
        }
      }

      const response = await fetch("/api/flashcard/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          studyMaterialId,
          spaceId,
          forceRegenerate,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate flashcards");
      }

      const data = await response.json();
      if (data.flashcards) {
        setCards(data.flashcards);

        const version = data.lastUpdated || new Date().toISOString();
        await storageUtils.cacheFlashcards(
          studyMaterialId,
          userId,
          data.flashcards,
          version
        );
        setCurrent(0);
      }
    } catch (error) {
      console.error("Error generating flashcards:", error);
      setError("Failed to generate flashcards. Please try again later.");
    } finally {
      setIsLoading(false);
      setIsRegenerating(false);
    }
  };

  const handleFlip = async () => {
    setFlipped(!flipped);
  };

  const handlePrev = () => {
    setFlipped(false);
    setShowHint(false);
    const newIndex = current > 0 ? current - 1 : current;
    setCurrent(newIndex);
  };

  const handleNext = () => {
    setFlipped(false);
    setShowHint(false);
    const newIndex = current < cards.length - 1 ? current + 1 : current;
    setCurrent(newIndex);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center w-full min-h-[400px] border rounded bg-white dark:bg-black text-gray-900 dark:text-white">
        <div className="flex items-center gap-2">
          <Sparkles className="animate-pulse" size={24} />
          <span className="text-lg">
            {isRegenerating
              ? "Regenerating flashcards..."
              : "Generating flashcards..."}
          </span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center w-full min-h-[400px] bg-white dark:bg-black text-gray-900 dark:text-white">
        <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
        <button
          onClick={() => generateFlashcards(false)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!cards || cards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center w-full min-h-[400px] bg-white dark:bg-black text-gray-900 dark:text-white">
        <p className="text-gray-500 dark:text-white/60 mb-4">No flashcards available.</p>
        <button
          onClick={() => generateFlashcards(true)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          Generate Flashcards
        </button>
      </div>
    );
  }

  const card = cards[current];

  if (!card)
    return <div className="text-center text-white/60">No flashcard found.</div>;

  return (
    <div className="flex flex-col items-center w-full min-h-[400px] bg-white dark:bg-[#161616] text-gray-900 dark:text-white">
      {/* Header with regenerate button */}
      <div className="w-full max-w-4xl mb-4 flex justify-between items-center">
        <div className="flex flex-col">
          <h2 className="text-lg font-semibold">Flashcards</h2>
        </div>
        <button
          onClick={() => generateFlashcards(true)}
          disabled={isRegenerating}
          className="flex items-center gap-2 px-3 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white disabled:bg-blue-600/50 rounded-lg transition-colors"
        >
          <RotateCcw
            size={16}
            className={isRegenerating ? "animate-spin" : ""}
          />
          {isRegenerating ? "Regenerating..." : "Regenerate"}
        </button>
      </div>
      <div className="relative w-full max-w-[750px] h-[250px] mb-10 rounded-lg overflow-hidden ">
        {/* Card container */}
        <div className="relative h-full w-full border bg-white dark:bg-zinc-900" onClick={handleFlip}>
          {/* Front (Question) */}
          <div
            className={`absolute inset-0 p-4 h-[300px] border rounded-lg flex flex-col transition-all duration-500 ease-in-out bg-white dark:bg-zinc-900 ${flipped ? "opacity-0 pointer-events-none" : "opacity-100"}`}
          >
            <div className="flex justify-between items-center mb-4">
              <button
                className="flex items-center gap-1 text-gray-700 dark:text-white/80 px-3 py-1 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 transition-colors disabled:opacity-50"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowHint(!showHint);
                }}
                disabled={!card.hint}
              >
                <Lightbulb
                  size={18}
                  className={card.hint ? "text-yellow-500 dark:text-white" : "text-gray-400 dark:text-white/40"}
                />
                <span className="ml-1">Hint</span>
              </button>
            </div>
            <div className="flex-1 flex items-center justify-center px-8">
              <p className="text-center text-2xl font-medium">
                {card.question}
              </p>
            </div>
          </div>
          {/* Back (Answer) */}
          <div
            className={`absolute inset-0 p-4 rounded-lg flex flex-col transition-all duration-500 ease-in-out bg-white dark:bg-zinc-900 ${!flipped ? "opacity-0 pointer-events-none" : "opacity-100"}`}
          >
            <div className="flex-1 flex items-center justify-center px-8">
              <p className="text-center text-xl">{card.answer}</p>
            </div>
          </div>
        </div>
      </div>
      {showHint && card.hint && (
        <div className="mt-4 p-3 bg-yellow-100 dark:bg-yellow-500/10 rounded-lg">
          <p className="text-yellow-700 dark:text-yellow-500 text-sm">{card.hint}</p>
        </div>
      )}
      {/* Navigation controls */}
      <div className="flex justify-between w-full items-center gap-4 mt-6">
        <button
          className="w-12 h-12 flex items-center justify-center rounded-full text-gray-700 dark:text-white border border-gray-300 dark:border-white/10 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors disabled:opacity-50"
          onClick={handlePrev}
          disabled={current === 0}
        >
          <ChevronLeft size={24} />
        </button>
        <span className="text-gray-500 dark:text-white/60 text-base">
          {current + 1} / {cards.length}
        </span>
        <button
          className="w-12 h-12 flex items-center justify-center rounded-full text-gray-700 dark:text-white border border-gray-300 dark:border-white/10 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors disabled:opacity-50"
          onClick={handleNext}
          disabled={current === cards.length - 1}
        >
          <ChevronRight size={24} />
        </button>
      </div>
    </div>
  );
}
