import { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Lightbulb,
  Sparkles,
  RotateCcw,
} from "lucide-react";

interface Flashcard {
  question: string;
  answer: string;
  hint?: string;
}

interface FlashcardsInteractiveProps {
  cards: Flashcard[];
}

const FlashcardsInteractive = ({ cards }: FlashcardsInteractiveProps) => {
  const [current, setCurrent] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);

  const filteredCards = Array.isArray(cards) && cards.length > 0 && (cards[0] as any).type ? cards.slice(1) : (Array.isArray(cards) ? cards : []);

  // Early return if no cards
  if (!filteredCards || filteredCards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center w-full min-h-[400px] border rounded bg-white dark:bg-black text-gray-900 dark:text-white">
        <div className="flex items-center gap-2">
          <Sparkles className="animate-pulse" size={24} />
          <span className="text-lg">No flashcards available.</span>
        </div>
      </div>
    );
  }

  const currentCard = filteredCards[current];
  if (!currentCard) {
    return (
      <div className="flex flex-col items-center justify-center w-full min-h-[400px] border rounded bg-white dark:bg-black text-gray-900 dark:text-white">
        <div className="flex items-center gap-2">
          <Sparkles className="animate-pulse" size={24} />
          <span className="text-lg">Invalid flashcard data.</span>
        </div>
      </div>
    );
  }

  const handleFlip = () => {
    setFlipped(!flipped);
  };

  const handlePrev = () => {
    setFlipped(false);
    setShowHint(false);
    setCurrent((c) => Math.max(0, c - 1));
  };

  const handleNext = () => {
    setFlipped(false);
    setShowHint(false);
    setCurrent((c) => Math.min(filteredCards.length - 1, c + 1));
  };

  const regenerateCards = () => {
    setIsRegenerating(true);
    // Simulate regeneration delay
    setTimeout(() => {
      setCurrent(0);
      setFlipped(false);
      setShowHint(false);
      setIsRegenerating(false);
    }, 1000);
  };

  // Calculate progress (simplified - just completed cards count)
  const completedCards = new Set(); // In real implementation, this would track completed cards
  const progressPercentage = filteredCards.length > 0 ? (completedCards.size / filteredCards.length) * 100 : 0;

  return (
    <div className="flex flex-col items-center min-w-[400px] min-h-[400px] ">
      {/* Header with regenerate button and progress */}
      <div className="w-full mb-4 flex justify-between items-center">
        <div className="flex flex-col">
          <h2 className="text-lg font-semibold">Flashcards</h2>
          <div className="text-xs text-gray-500 dark:text-white/60">
            Progress: {completedCards.size}/{filteredCards.length} completed
          </div>
        </div>
       
      </div>

      {/* Progress bar */}
      <div className="w-full mb-4">
        <div className="w-full bg-gray-200 dark:bg-white/10 rounded-full h-2">
          <div
            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
            style={{
              width: `${progressPercentage}%`,
            }}
          />
        </div>
      </div>

      <div className="relative w-full h-[300px] mb-10 rounded-lg overflow-hidden">
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
                disabled={!currentCard.hint}
              >
                <Lightbulb
                  size={18}
                  className={currentCard.hint ? "text-yellow-500 dark:text-white" : "text-gray-400 dark:text-white/40"}
                />
                <span className="ml-1">Hint</span>
              </button>
              <div className="flex items-center gap-2">
                <div
                  className={`w-3 h-3 rounded-full ${flipped ? "bg-green-500" : "bg-gray-400 dark:bg-gray-500"}`}
                ></div>
              </div>
            </div>
            <div className="flex-1 flex items-center justify-center px-8">
              <p className="text-center text-2xl font-medium">
                {currentCard.question}
              </p>
            </div>
          </div>

          {/* Back (Answer) */}
          <div
            className={`absolute inset-0 p-4 rounded-lg flex flex-col transition-all duration-500 ease-in-out bg-white dark:bg-zinc-900 ${!flipped ? "opacity-0 pointer-events-none" : "opacity-100"}`}
          >
            <div className="flex-1 flex items-center justify-center px-8">
              <p className="text-center text-xl">{currentCard.answer}</p>
            </div>
          </div>
        </div>
      </div>

      {showHint && currentCard.hint && (
        <div className="mt-4 p-3 bg-yellow-100 dark:bg-yellow-500/10 rounded-lg">
          <p className="text-yellow-700 dark:text-yellow-500 text-sm">{currentCard.hint}</p>
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
          {current + 1} / {filteredCards.length}
        </span>
        <button
          className="w-12 h-12 flex items-center justify-center rounded-full text-gray-700 dark:text-white border border-gray-300 dark:border-white/10 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors disabled:opacity-50"
          onClick={handleNext}
          disabled={current === filteredCards.length - 1}
        >
          <ChevronRight size={24} />
        </button>
      </div>
    </div>
  );
};

export default FlashcardsInteractive; 