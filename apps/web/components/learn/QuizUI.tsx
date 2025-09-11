import React, { useState, useEffect } from "react";
import { Button } from "@repo/ui/components/ui/button";
import { Progress } from "@repo/ui/components/ui/progress";
import { RotateCcw, Sparkles, Trash2, Trophy } from "lucide-react";
import { quizStorageUtils } from "../../lib/quiz/storage";
import { QuizProgress, QuizQuestion, QuizUIProps } from "../../types/quiz/quiz";

export default function QuizUI({
  studyMaterialId,
  userId,
  count = 20,
}: QuizUIProps) {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [userAnswers, setUserAnswers] = useState<{ [qIdx: number]: string }>({});
  const [showFeedback, setShowFeedback] = useState<{ [qIdx: number]: boolean }>({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showScoreReport, setShowScoreReport] = useState(false);
  const [progress, setProgress] = useState<QuizProgress | null>(null);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadQuiz();
  }, [studyMaterialId, userId, count]);

  const loadQuiz = async (forceRegenerate = false) => {
    try {
      setIsLoading(true);
      setError(null);

      if (forceRegenerate) {
        setIsRegenerating(true);
        await quizStorageUtils.clearCache(studyMaterialId);
      }

      // Try to get existing quiz first (unless force regenerating)
      if (!forceRegenerate) {
        const existingQuiz = await quizStorageUtils.getQuiz(studyMaterialId, userId);
        if (existingQuiz) {
          setQuestions(existingQuiz.questions);
          loadProgressState(existingQuiz.progress);
          setIsLoading(false);
          return;
        }
      }

      // Generate new quiz or regenerate
      const quizData = await quizStorageUtils.generateQuiz(
        studyMaterialId, 
        userId, 
        count, 
        forceRegenerate
      );

      if (quizData) {
        setQuestions(quizData.questions);
        loadProgressState(quizData.progress);
        
        // Cache questions for faster loading (without correct answers)
        await quizStorageUtils.cacheQuestions(
          studyMaterialId, 
          userId, 
          quizData.questions, 
          quizData.progress.quizSetVersion
        );
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load quiz");
    } finally {
      setIsLoading(false);
      setIsRegenerating(false);
    }
  };
  const loadProgressState = (progressData: QuizProgress) => {
    setProgress(progressData);
    setUserAnswers(progressData.userAnswers);
    setShowFeedback(progressData.showFeedback);
    setCurrentQuestionIndex(progressData.currentQuestionIndex);
    setShowScoreReport(progressData.showScoreReport);
  };

  const saveProgress = async (updatedProgress: QuizProgress) => {
    try {
      setIsSaving(true);
      await quizStorageUtils.saveProgress(updatedProgress);
      setProgress(updatedProgress);
    } catch (error) {
      console.error('Failed to save progress:', error);
      // Continue with local state even if save fails
    } finally {
      setIsSaving(false);
    }
  };

  const handleAnswer = async (qIdx: number, optionId: string) => {
    if (userAnswers[qIdx] !== undefined) return;

    const newAnswers = { ...userAnswers, [qIdx]: optionId };
    const newFeedback = { ...showFeedback, [qIdx]: true };

    setUserAnswers(newAnswers);
    setShowFeedback(newFeedback);

    // Check if all questions are answered
    const shouldShowScore = quizStorageUtils.isQuizCompleted(newAnswers, questions.length);
    if (shouldShowScore) {
      setShowScoreReport(true);
    }

    // Save progress
    if (progress) {
      const updatedProgress: QuizProgress = {
        ...progress,
        userAnswers: newAnswers,
        showFeedback: newFeedback,
        showScoreReport: shouldShowScore,
        lastAttempted: new Date().toISOString(),
      };
      
      // Save asynchronously to keep UI responsive
      saveProgress(updatedProgress);
    }
  };

  const updateCurrentQuestion = async (newIndex: number) => {
    setCurrentQuestionIndex(newIndex);

    if (progress) {
      const updatedProgress: QuizProgress = {
        ...progress,
        currentQuestionIndex: newIndex,
      };
      
      // Save asynchronously
      saveProgress(updatedProgress);
    }
  };

  const resetQuiz = async () => {
    try {
      const newProgress = await quizStorageUtils.resetProgress(
        studyMaterialId,
        userId,
        questions.length,
        progress?.quizSetVersion || "1.0"
      );

      setProgress(newProgress);
      setUserAnswers({});
      setShowFeedback({});
      setCurrentQuestionIndex(0);
      setShowScoreReport(false);
    } catch (error) {
      console.error('Failed to reset quiz:', error);
      // Fallback to local reset
      setUserAnswers({});
      setShowFeedback({});
      setCurrentQuestionIndex(0);
      setShowScoreReport(false);
    }
  };

  const calculateScore = () => {
    return quizStorageUtils.calculateScore(userAnswers, questions);
  };

  const getAnsweredCount = () => Object.keys(userAnswers).length;
  const getTotalQuestions = () => questions.length;
  const getProgressPercentage = () => {
    const total = getTotalQuestions();
    const answered = getAnsweredCount();
    return total > 0 ? (answered / total) * 100 : 0;
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center w-full min-h-[400px] border rounded text-zinc-900 dark:text-white bg-white dark:bg-zinc-900">
        <div className="flex items-center gap-2">
          <Sparkles className="animate-pulse" size={24} />
          <span className="text-lg">
            {isRegenerating ? "Regenerating quiz..." : "Loading quiz..."}
          </span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white p-6 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
          <div className="flex gap-2 justify-center">
            <Button
              variant="outline"
              onClick={() => loadQuiz(false)}
              className="text-zinc-900 dark:text-white border-zinc-900 dark:border-white hover:bg-zinc-200 dark:hover:bg-zinc-800"
            >
              Retry
            </Button>
            <Button
              onClick={() => loadQuiz(true)}
              className="bg-purple-600 text-white hover:bg-purple-700"
            >
              Generate New Quiz
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];

  if (showScoreReport) {
    const score = calculateScore();
    return (
      <div className="flex flex-col items-center justify-center w-full min-h-[400px] border rounded text-zinc-900 dark:text-white bg-white dark:bg-zinc-900 p-8">
        <div className="flex flex-col items-center gap-4 max-w-md text-center">
          <Trophy className="w-16 h-16 text-yellow-500" />
          <h2 className="text-2xl font-bold">Quiz Complete!</h2>

          <div className="w-full bg-zinc-100 dark:bg-zinc-800 rounded-lg p-6 mt-4">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-zinc-500 dark:text-zinc-400">Score</span>
                <span className="text-xl font-bold">{score.percentage}%</span>
              </div>
              <Progress value={score.percentage} className="h-2 bg-zinc-200 dark:bg-zinc-700" />
              <div className="flex justify-between items-center text-sm text-zinc-500 dark:text-zinc-400">
                <span>Correct answers: {score.correct}</span>
                <span>Total questions: {score.total}</span>
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
            <Button
              onClick={() => loadQuiz(true)}
              disabled={isRegenerating}
              className="bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-50"
            >
              {isRegenerating ? "Generating..." : "New Quiz"}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="text-xl font-bold">Quiz</div>
          <div className="flex items-center gap-2">
            {isSaving && (
              <span className="text-xs text-zinc-500 dark:text-zinc-400">Saving...</span>
            )}
            <button
              onClick={() => loadQuiz(true)}
              disabled={isRegenerating}
              className="flex items-center gap-2 px-3 py-2 text-sm bg-purple-600 hover:bg-purple-700 disabled:bg-purple-600/50 text-white rounded-lg transition-colors"
            >
              <RotateCcw
                size={16}
                className={isRegenerating ? "animate-spin" : ""}
              />
              {isRegenerating ? "Regenerating..." : "Regenerate"}
            </button>
          </div>
        </div>

        {/* Progress */}
        <div className="flex justify-between items-center mb-8">
          <span className="text-sm text-zinc-500 dark:text-zinc-400">{getAnsweredCount()}</span>
          <Progress
            value={getProgressPercentage()}
            className="flex-1 mx-4 h-2 bg-zinc-200 dark:bg-zinc-700"
          />
          <span className="text-sm text-zinc-500 dark:text-zinc-400">{getTotalQuestions()}</span>
        </div>

        {/* Question */}
        <div className="mb-8">
          <div className="flex justify-between items-start mb-6">
            <h2 className="text-xl font-medium leading-relaxed flex-1">
              {currentQuestion?.question}
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
          {currentQuestion?.options.map((option) => {
            const answered = userAnswers[currentQuestionIndex] !== undefined;
            const isCorrect = option.id === currentQuestion?.correctOptionId;
            const isSelected = userAnswers[currentQuestionIndex] === option.id;
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
                key={option.id}
                className={buttonClass}
                disabled={answered}
                onClick={() => handleAnswer(currentQuestionIndex, option.id)}
              >
                <span className="font-medium text-zinc-500 dark:text-zinc-300 mr-2">
                  {option.id}.
                </span>
                {option.text}
              </button>
            );
          })}
        </div>

        {/* Feedback */}
        {showFeedback[currentQuestionIndex] &&
          userAnswers[currentQuestionIndex] !==
          currentQuestion?.correctOptionId && (
            <div className="mt-6 p-4 bg-red-100 dark:bg-red-900/20 border border-red-300 dark:border-red-800 rounded-lg">
              <div className="flex items-center gap-2 text-red-600 dark:text-red-400 mb-2">
                <div className="w-5 h-5 rounded-full bg-red-600 flex items-center justify-center">
                  <span className="text-white text-xs">✕</span>
                </div>
                <span className="font-medium">Incorrect</span>
              </div>
              <p className="text-red-500 dark:text-red-300 text-sm">
                {currentQuestion?.explanation}
              </p>
            </div>
          )}

        {/* Navigation */}
        <div className="mt-8 flex justify-between">
          <Button
            variant="ghost"
            onClick={() =>
              updateCurrentQuestion(Math.max(0, currentQuestionIndex - 1))
            }
            disabled={currentQuestionIndex === 0}
            className="text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-200 dark:hover:bg-zinc-800"
          >
            Previous Question
          </Button>
          <Button
            variant="ghost"
            onClick={() =>
              updateCurrentQuestion(
                Math.min(questions.length - 1, currentQuestionIndex + 1)
              )
            }
            disabled={currentQuestionIndex === questions.length - 1}
            className="text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-200 dark:hover:bg-zinc-800"
          >
            Next Question
          </Button>
        </div>
      </div>
    </div>
  );
}