import { useState } from "react";
import { Button } from "@repo/ui/components/ui/button";
import { Progress } from "@repo/ui/components/ui/progress";
import { RotateCcw, Sparkles, Trash2, Trophy } from "lucide-react";

interface QuizData {
  question: string;
  options: string[];
  answer: string;
  hint?: string;
  explanation?: string;
  type?: string;
}

interface QuizInteractiveProps {
  quizData: QuizData[];
}

const QuizInteractive = ({ quizData = [] }: QuizInteractiveProps) => {
  const [current, setCurrent] = useState(0);
  const filteredQuizData: QuizData[] = Array.isArray(quizData) && quizData.length > 0 && (quizData[0] as any).type ? quizData.slice(1) : (Array.isArray(quizData) ? quizData : []);
  const [answers, setAnswers] = useState<(string | null)[]>(Array(filteredQuizData.length).fill(null));
  const [showResult, setShowResult] = useState(false);
  const [showHint, setShowHint] = useState<{ [qIdx: number]: boolean }>({});
  const [isRegenerating, setIsRegenerating] = useState(false);

  // Early return if no quiz data
  if (!filteredQuizData || filteredQuizData.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center w-full min-h-[400px] border rounded text-zinc-900 dark:text-white bg-white dark:bg-zinc-900">
        <div className="flex items-center gap-2">
          <Sparkles className="animate-pulse" size={24} />
          <span className="text-lg">No quiz data available.</span>
        </div>
      </div>
    );
  }

  const handleSelect = (option: string) => {
    if (answers[current] !== null) return;
    setAnswers((prev) => {
      const copy = [...prev];
      copy[current] = option;
      return copy;
    });
  };

  const handleNext = () => {
    if (current < filteredQuizData.length - 1) setCurrent(current + 1);
    else setShowResult(true);
  };

  const handlePrev = () => {
    if (current > 0) setCurrent(current - 1);
  };

  const resetQuiz = () => {
    setShowResult(false);
    setCurrent(0);
    setAnswers(Array(filteredQuizData.length).fill(null));
    setShowHint({});
  };

  const regenerateQuiz = () => {
    setIsRegenerating(true);
    // Simulate regeneration delay
    setTimeout(() => {
      resetQuiz();
      setIsRegenerating(false);
    }, 1000);
  };

  const correctCount = answers.filter((a, i) => a === filteredQuizData[i]?.answer).length;
  const percentage = Math.round((correctCount / filteredQuizData.length) * 100);

  const getAnsweredCount = () => {
    return answers.filter(answer => answer !== null).length;
  };

  const getProgressPercentage = () => {
    return filteredQuizData.length > 0 ? (getAnsweredCount() / filteredQuizData.length) * 100 : 0;
  };

  if (showResult) {
    return (
      <div className="flex flex-col items-center justify-center w-full min-h-[400px] border rounded text-zinc-900 dark:text-white bg-white dark:bg-zinc-900 p-8">
        <div className="flex flex-col items-center gap-4 max-w-md text-center">
          <Trophy className="w-16 h-16 text-yellow-500" />
          <h2 className="text-2xl font-bold">Quiz Complete!</h2>

          <div className="w-full bg-zinc-100 dark:bg-zinc-800 rounded-lg p-6 mt-4">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-zinc-500 dark:text-zinc-400">Score</span>
                <span className="text-xl font-bold">{percentage}%</span>
              </div>
              <Progress value={percentage} className="h-2 bg-zinc-200 dark:bg-zinc-700" />
              <div className="flex justify-between items-center text-sm text-zinc-500 dark:text-zinc-400">
                <span>Correct answers: {correctCount}</span>
                <span>Total questions: {filteredQuizData.length}</span>
              </div>
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <Button
              variant="outline"
              onClick={resetQuiz}
              className="text-zinc-900 dark:text-white border-zinc-900 dark:border-white hover:bg-zinc-200 dark:hover:bg-zinc-800"
            >
              Try Again
            </Button>
           
          </div>
        </div>
      </div>
    );
  }

  const q = filteredQuizData[current];
  if (!q) {
    return (
      <div className="flex flex-col items-center justify-center w-full min-h-[400px] border rounded text-zinc-900 dark:text-white bg-white dark:bg-zinc-900">
        <div className="flex items-center gap-2">
          <Sparkles className="animate-pulse" size={24} />
          <span className="text-lg">Invalid question data.</span>
        </div>
      </div>
    );
  }

  return (
    <div className=" py-6">
      <div className="">
        {/* Header */}
       

        {/* Progress */}
        <div className="flex justify-between items-center mb-8">
          <span className="text-sm text-zinc-500 dark:text-zinc-400">{getAnsweredCount()}</span>
          <Progress
            value={getProgressPercentage()}
            className="flex-1 mx-4 h-2 bg-zinc-200 dark:bg-zinc-700"
          />
          <span className="text-sm text-zinc-500 dark:text-zinc-400">{filteredQuizData.length}</span>
        </div>

        {/* Question */}
        <div className="mb-8">
          <div className="flex justify-between items-start mb-6">
            <h2 className="text-xl font-medium leading-relaxed flex-1">
              {q.question}
            </h2>
            <Button
              variant="ghost"
              size="icon"
              className="text-zinc-500 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800 ml-4"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Answer Options */}
        <div className="space-y-3">
          {q.options.map((option, index) => {
            const answered = answers[current] !== null;
            const isCorrect = option === q.answer;
            const isSelected = answers[current] === option;
            let buttonClass =
              "w-full text-left p-4 rounded-lg border transition-colors ";

            if (answered) {
              if (isSelected && isCorrect) {
                buttonClass += "bg-green-600 border-green-500 text-white";
              } else if (isSelected && !isCorrect) {
                buttonClass += "bg-red-600 border-red-500 text-white";
              } else if (isCorrect && !isSelected) {
                buttonClass +=
                  "bg-green-600 border-green-500 text-white border-dashed";
              } else {
                buttonClass += "bg-zinc-100 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-500 dark:text-zinc-400";
              }
            } else {
              buttonClass +=
                "bg-zinc-100 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white hover:bg-zinc-200 dark:hover:bg-zinc-700";
            }

            return (
              <button
                key={option}
                className={buttonClass}
                disabled={answered}
                onClick={() => handleSelect(option)}
              >
                <span className="font-medium text-zinc-500 dark:text-zinc-300 mr-2">
                  {String.fromCharCode(65 + index)}.
                </span>
                {option}
              </button>
            );
          })}
        </div>

        {/* Feedback */}
        {answers[current] && answers[current] !== q.answer && (
          <div className="mt-6 p-4 bg-red-100 dark:bg-red-900/20 border border-red-300 dark:border-red-800 rounded-lg">
            <div className="flex items-center gap-2 text-red-600 dark:text-red-400 mb-2">
              <div className="w-5 h-5 rounded-full bg-red-600 flex items-center justify-center">
                <span className="text-white text-xs">✕</span>
              </div>
              <span className="font-medium">Incorrect</span>
            </div>
            <p className="text-red-500 dark:text-red-300 text-sm">
              {q.explanation}
            </p>
            {q.hint && (
              <div className="mt-2">
                <button 
                  className="text-xs underline text-blue-600 dark:text-blue-400" 
                  onClick={() => setShowHint(prev => ({ ...prev, [current]: !prev[current] }))}
                >
                  Show Hint
                </button>
                {showHint[current] && (
                  <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                    Hint: {q.hint}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Navigation */}
        <div className="mt-8 flex justify-between">
          <Button
            variant="ghost"
            onClick={handlePrev}
            disabled={current === 0}
            className="text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-200 dark:hover:bg-zinc-800"
          >
            Previous Question
          </Button>
          <Button
            variant="ghost"
            onClick={handleNext}
            disabled={!answers[current]}
            className="text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-200 dark:hover:bg-zinc-800"
          >
            Next Question
          </Button>
        </div>
      </div>
    </div>
  );
};

export default QuizInteractive; 