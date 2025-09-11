"use client";
import React, { useState, useEffect } from "react";
import { Sparkles, AlertCircle, RotateCcw } from "lucide-react";
import { Button } from "@repo/ui/components/ui/button";

// Import the ExamPage component (assuming it's in the same directory or adjust path)
// import ExamPage from "./ExamPage";

// For demo purposes, I'll include a simplified ExamPage component
// In your actual implementation, import from the separate file
import { Progress } from "@repo/ui/components/ui/progress";
import { Share, SkipForward, Trophy, Clock } from "lucide-react";
import { useExamSettings } from "../../contexts/examSettingsContext";

interface ExamOption {
  id: string;
  text: string;
}

interface ExamQuestion {
  id: number;
  type: 'mcq' | 'text';
  topic: string;
  question: string;
  options?: ExamOption[];
  correctAnswer?: string;
  correctOptionId?: string;
  explanation: string;
}

interface ExamData {
  success: boolean;
  questions: ExamQuestion[];
  questionType: string;
  examLength: number;
}

interface ExamSettings {
  count?: number;
  questionType?: string;
  examLength?: number;
}

interface ExamClientProps {
  spaceId: string;
  examSettings: ExamSettings;
}



// Simplified ExamPage component for demo
const ExamPage = ({ examData, onSubmit }: { examData: ExamData; onSubmit?: (answers: any) => void }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<{ [qIdx: number]: string }>({});
  const [timeLeft, setTimeLeft] = useState(examData.examLength * 60);
  const [isExamCompleted, setIsExamCompleted] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [reviewIdx, setReviewIdx] = useState<number | null>(null);

  useEffect(() => {
    if (timeLeft > 0 && !isExamCompleted) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !isExamCompleted) {
      handleSubmitExam();
    }
  }, [timeLeft, isExamCompleted]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswer = (qIdx: number, answer: string) => {
    setUserAnswers(prev => ({ ...prev, [qIdx]: answer }));
  };

  const handleSubmitExam = () => {
    setIsExamCompleted(true);
    setShowResults(true);
    if (onSubmit) onSubmit(userAnswers);
  };

  const calculateScore = () => {
    let correct = 0;
    examData.questions.forEach((question, index) => {
      if (question.correctOptionId && userAnswers[index] === question.correctOptionId) {
        correct++;
      }
    });
    return {
      correct,
      total: examData.questions.length,
      percentage: Math.round((correct / examData.questions.length) * 100)
    };
  };

  const currentQuestion = examData.questions[currentQuestionIndex];
  const getProgressPercentage = () => ((currentQuestionIndex + 1) / examData.questions.length) * 100;
  const getAnsweredCount = () => Object.keys(userAnswers).length;

  // Enhanced Donut chart SVG for score with red color
  const Donut = ({ value }: { value: number }) => {
    const radius = 45;
    const stroke = 6;
    const norm = 2 * Math.PI * radius;
    const pct = Math.max(0, Math.min(100, value));
    return (
      <svg width="120" height="120" className="transform -rotate-90">
        <circle
          cx="60" cy="60" r={radius}
          stroke="currentColor" strokeWidth={stroke}
          fill="none"
          className="text-gray-700 dark:text-gray-600"
        />
        <circle
          cx="60" cy="60" r={radius}
          stroke="#ef4444"
          strokeWidth={stroke}
          fill="none"
          strokeDasharray={norm}
          strokeDashoffset={norm - (pct / 100) * norm}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.5s ease-in-out' }}
        />
        <text 
          x="60" 
          y="68" 
          textAnchor="middle" 
          fontSize="1.5rem" 
          fill="#ef4444" 
          fontWeight="bold"
          className="transform rotate-90"
          style={{ transformOrigin: '60px 60px' }}
        >
          {value}%
        </text>
      </svg>
    );
  };

  if (showResults) {
    const score = calculateScore();
    const totalQuestions = examData.questions.length;
    const attempted = Object.keys(userAnswers).length;
    const skipped = totalQuestions - attempted;
    const timeTaken = (examData.examLength * 60 - timeLeft);
    const formatTaken = () => {
      const mins = Math.floor(timeTaken / 60);
      const secs = timeTaken % 60;
      return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
        <div className="max-w-4xl mx-auto p-6">
          {/* Top result card */}
          <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl p-8 mb-6">
            <div className="text-center mb-8">
              <h2 className="text-xl font-medium text-gray-900 dark:text-white mb-8">
                Don't give up, every attempt counts!
              </h2>
              
              <div className="flex items-center justify-center gap-16 mb-8">
                <div className="flex flex-col items-center">
                  <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{skipped}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Skipped</div>
                </div>
                
                <div className="flex flex-col items-center">
                  <Donut value={score.percentage} />
                  <div className="text-sm text-gray-500 dark:text-gray-400 mt-2">Score</div>
                </div>
                
                <div className="flex flex-col items-center">
                  <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{formatTaken()}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Time Taken</div>
                </div>
              </div>
              
              <Button 
                variant="link" 
                className="text-gray-600 dark:text-gray-300 underline hover:text-gray-900 dark:hover:text-white"
              >
                Preview Exam 2
              </Button>
            </div>
          </div>

          {/* Question review section */}
          <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                {examData.questions[0]?.topic || 'Review your exam'}
              </h3>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {examData.questions.length} questions
              </div>
            </div>
            
            <div className="space-y-4">
              {examData.questions.map((q, idx) => {
                const userAns = userAnswers[idx];
                const attempted = typeof userAns !== 'undefined' && userAns !== '';
                const correct = attempted && q.correctOptionId === userAns;
                const isExpanded = reviewIdx === idx;
                
                return (
                  <React.Fragment key={q.id}>
                    <div className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700 last:border-b-0">
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                          Question  {idx + 1}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                          {q.question}
                        </div>
                      </div>
                      <div className="flex items-center gap-3 ml-4">
                        <Button
                          size="sm"
                          className="bg-[#ffe4484b]   text-[#d5bb23] border border-[#d5bb23] px-4 py-1 rounded-full text-sm transition-all duration-300 hover:bg-[#d5bb23] hover:text-[#ffe3486f] "
                          onClick={() => setReviewIdx(isExpanded ? null : idx)}
                        >
                          {isExpanded ? 'Hide' : 'Review'}
                        </Button>
                       
                      </div>
                    </div>
                    
                    {isExpanded && (
                      <div className="bg-gray-50 dark:bg-gray-900/60 rounded-xl p-6 mb-4 border border-gray-200 dark:border-gray-700">
                        <div className="mb-6">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                              <div className="text-2xl font-medium text-gray-900 dark:text-white mb-4">
                                {idx + 1}.
                              </div>
                              <h3 className="text-xl text-gray-900 dark:text-white leading-relaxed">
                                {q.question}
                              </h3>
                            </div>
                            <Button
                              variant="ghost"
                              className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-800 ml-4"
                            >
                              Ask chat →
                            </Button>
                          </div>
                        </div>

                        {q.options && (
                          <div className="space-y-3 mb-6">
                            {q.options.map(opt => {
                              const isCorrect = q.correctOptionId === opt.id;
                              const isUser = userAns === opt.id;
                              return (
                                <div
                                  key={opt.id}
                                  className={`p-4 rounded-lg border transition-colors ${
                                    isCorrect 
                                      ? 'border-green-500 bg-green-50 dark:bg-green-900/20' 
                                      : isUser 
                                      ? 'border-red-500 bg-red-50 dark:bg-red-900/20' 
                                      : 'border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800'
                                  }`}
                                >
                                  <div className="flex items-start gap-3">
                                    <span className={`font-medium ${
                                      isCorrect 
                                        ? 'text-green-700 dark:text-green-400' 
                                        : isUser 
                                        ? 'text-red-700 dark:text-red-400' 
                                        : 'text-gray-600 dark:text-gray-400'
                                    }`}>
                                      {opt.id}.
                                    </span>
                                    <span className={`flex-1 ${
                                      isCorrect 
                                        ? 'text-green-700 dark:text-green-400' 
                                        : isUser 
                                        ? 'text-red-700 dark:text-red-400' 
                                        : 'text-gray-900 dark:text-white'
                                    }`}>
                                      {opt.text}
                                    </span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}

                        <div className={`rounded-lg p-4 ${
                          correct 
                            ? 'bg-green-100 dark:bg-green-900/30' 
                            : 'bg-red-100 dark:bg-red-900/30'
                        }`}>
                          <div className="flex items-center gap-2 mb-2">
                            <span className={`text-sm font-medium ${
                              correct 
                                ? 'text-green-700 dark:text-green-400' 
                                : 'text-red-700 dark:text-red-400'
                            }`}>
                              {correct ? 'Correct' : 'Incorrect'}
                            </span>
                          </div>
                          <div className={`text-sm ${
                            correct 
                              ? 'text-green-700 dark:text-green-400' 
                              : 'text-red-700 dark:text-red-400'
                          }`}>
                            {q.explanation}
                          </div>
                          <div className="mt-3 pt-3 border-t border-gray-300 dark:border-gray-600">
                            
                          </div>
                        </div>
                      </div>
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
      {/* Header */}
      <div className="bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                className="text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
              >
                <Share className="w-4 h-4 mr-2" />
                Share exam
              </Button>
              <span className="text-gray-500 dark:text-gray-400 text-sm">
                {getAnsweredCount()}/{examData.questions.length}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <Clock className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              <span className="text-lg font-mono font-medium text-gray-900 dark:text-white">
                {formatTime(timeLeft)}
              </span>
            </div>
          </div>
          <Progress 
            value={getProgressPercentage()} 
            className="h-2 bg-zinc-200 dark:bg-zinc-700"
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="mb-8">
          <div className="flex justify-between items-start mb-8">
            <div className="flex-1">
              <div className="text-2xl font-medium text-gray-900 dark:text-white mb-6">
                {currentQuestionIndex + 1}.
              </div>
              <h2 className="text-2xl text-gray-900 dark:text-white leading-relaxed mb-4">
                {currentQuestion!.question}
              </h2>
            </div>
            <div className="flex items-center gap-4 ml-8">
              <Button
                variant="ghost"
                className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                Ask chat →
              </Button>
              <Button
                variant="ghost"
                onClick={() => setCurrentQuestionIndex(Math.min(examData.questions.length - 1, currentQuestionIndex + 1))}
                className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
                disabled={currentQuestionIndex === examData.questions.length - 1}
              >
                <SkipForward className="w-4 h-4 mr-2" />
                Skip
              </Button>
            </div>
          </div>
        </div>

        <div className="mb-12">
          {currentQuestion!.type === 'text' ? (
            <textarea
              className="w-full h-32 p-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Type your answer here..."
              value={userAnswers[currentQuestionIndex] || ''}
              onChange={(e) => handleAnswer(currentQuestionIndex, e.target.value)}
            />
          ) : (
            <div className="space-y-4">
              {currentQuestion!.options?.map((option) => {
                const isSelected = userAnswers[currentQuestionIndex] === option.id;
                return (
                  <button
                    key={option.id}
                    className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 ${
                      isSelected
                        ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                        : 'border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-500'
                    }`}
                    onClick={() => handleAnswer(currentQuestionIndex, option.id)}
                  >
                    <div className="flex items-start gap-3">
                      <span className={`font-medium ${
                        isSelected 
                          ? 'text-purple-700 dark:text-purple-400' 
                          : 'text-gray-600 dark:text-gray-400'
                      }`}>
                        {option.id}.
                      </span>
                      <span className={`flex-1 ${
                        isSelected 
                          ? 'text-purple-700 dark:text-purple-400' 
                          : 'text-gray-900 dark:text-white'
                      }`}>
                        {option.text}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <Button
            variant="ghost"
            onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
            disabled={currentQuestionIndex === 0}
            className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50"
          >
            Previous
          </Button>
          <div className="flex gap-3">
            {currentQuestionIndex === examData.questions.length - 1 ? (
              <Button 
                onClick={handleSubmitExam} 
                className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-2 rounded-lg font-medium"
              >
                Submit Exam
              </Button>
            ) : (
              <Button
                onClick={() => setCurrentQuestionIndex(currentQuestionIndex + 1)}
                className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-2 rounded-lg font-medium"
              >
                Next
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Main ExamClient component
export default function ExamClient({ spaceId }: { spaceId: string }) {
  const { examSettings } = useExamSettings();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [questions, setQuestions] = useState<ExamQuestion[]>([]);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [examData, setExamData] = useState<ExamData | null>(null);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/exam/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          spaceId,
          count: examSettings.count || 2,
          questionType: examSettings.questionType || 'mixed',
          examLength: examSettings.examLength || 45,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch questions');
      }

      const data = await response.json();
      console.log("EXAM DATA", data);

      if (data.questions) {
        // Map the API response to the component's expected format
        const mappedQuestions = data.questions.map((q: any, idx: number) => ({
          id: idx + 1,
          type: q.options && q.options.length > 0 ? 'mcq' : 'text',
          topic: q.topic || 'General',
          question: q.question,
          options: q.options ? q.options.map((opt: any, optIdx: number) => ({
            id: String.fromCharCode(65 + optIdx), // Convert to A, B, C, D format
            text: typeof opt === 'string' ? opt : opt.text || ''
          })) : undefined,
          correctAnswer: q.correctOptionId,
          correctOptionId: q.correctOptionId,
          explanation: q.explanation
        }));

        setQuestions(mappedQuestions);
        
        // Create exam data object for the ExamPage component
        const examDataObj: ExamData = {
          success: true,
          questions: mappedQuestions,
          questionType: data.questionType || examSettings.questionType || 'mixed',
          examLength: data.examLength || examSettings.examLength || 45
        };
        
        setExamData(examDataObj);
        
        if (data.examLength) {
          setTimeRemaining(data.examLength * 60);
        }
      } else {
        setError('No questions available');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load exam');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (spaceId) {
      fetchQuestions();
    }
  }, [spaceId]);

  const handleExamSubmit = (answers: { [qIdx: number]: string }) => {
    console.log('Exam submitted with answers:', answers);
    // Handle exam submission logic here
    // You might want to send the results to your backend
  };

  const handleRetry = () => {
    setError(null);
    setExamData(null);
    setQuestions([]);
    fetchQuestions();
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-center">
          <Sparkles className="w-12 h-12 animate-pulse text-purple-500" />
          <div className="space-y-2">
            <h2 className="text-xl font-semibold">Generating Your Exam</h2>
            <p className="text-gray-500 dark:text-gray-400">
              Creating {examSettings.count || 10} questions for your {examSettings.examLength || 45}-minute exam...
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <div className="animate-spin w-4 h-4 border-2 border-purple-500 border-t-transparent rounded-full"></div>
            This may take a few moments
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-white flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center">
          <AlertCircle className="w-12 h-12 text-red-600 dark:text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Failed to Load Exam</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-6">{error}</p>
          <div className="flex gap-3 justify-center">
            <Button
              variant="outline"
              onClick={handleRetry}
              className="text-zinc-900 dark:text-white border-zinc-900 dark:border-white hover:bg-zinc-200 dark:hover:bg-zinc-800"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
            <Button
              onClick={() => window.location.reload()}
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              Reload Page
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Render exam if data is loaded
  if (examData && questions.length > 0) {
    return <ExamPage examData={examData} onSubmit={handleExamSubmit} />;
  }

  // Fallback state
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-white flex items-center justify-center">
      <div className="text-center">
        <p className="text-gray-500 dark:text-gray-400">No exam data available</p>
        <Button
          onClick={handleRetry}
          className="mt-4 bg-purple-600 hover:bg-purple-700 text-white"
        >
          Load Exam
        </Button>
      </div>
    </div>
  );
}