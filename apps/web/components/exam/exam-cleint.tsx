import React, { useState, useEffect } from "react";
import { Button } from "@repo/ui/components/ui/button";
import { Progress } from "@repo/ui/components/ui/progress";
import { Share, SkipForward, Trophy, Clock } from "lucide-react";

export interface ExamOption {
  id: string;
  text: string;
}

export interface ExamQuestion {
  question: string;
  options?: ExamOption[];
  correctOptionId?: string;
  explanation: string;
  type?: 'mcq' | 'text';
}

export interface ExamData {
  success: boolean;
  questions: ExamQuestion[];
  questionType: string;
  examLength: number; // in minutes
}

export interface ExamPageProps {
  examData: ExamData;
  onSubmit?: (answers: { [qIdx: number]: string }) => void;
}

export default function ExamPage({ examData, onSubmit }: ExamPageProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<{ [qIdx: number]: string }>({});
  const [timeLeft, setTimeLeft] = useState(examData.examLength * 60); // Convert minutes to seconds
  const [isExamCompleted, setIsExamCompleted] = useState(false);
  const [showResults, setShowResults] = useState(false);

  // Timer effect
  useEffect(() => {
    if (timeLeft > 0 && !isExamCompleted) {
      const timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !isExamCompleted) {
      // Auto-submit when time runs out
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

  const handleTextAnswer = (qIdx: number, text: string) => {
    setUserAnswers(prev => ({ ...prev, [qIdx]: text }));
  };

  const handleSkip = () => {
    if (currentQuestionIndex < examData.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handleNext = () => {
    if (currentQuestionIndex < examData.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSubmitExam = () => {
    setIsExamCompleted(true);
    setShowResults(true);
    if (onSubmit) {
      onSubmit(userAnswers);
    }
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

  const getAnsweredCount = () => Object.keys(userAnswers).length;
  const getProgressPercentage = () => {
    return ((currentQuestionIndex + 1) / examData.questions.length) * 100;
  };

  const currentQuestion = examData.questions[currentQuestionIndex];
  const isTextQuestion = !currentQuestion!.options || currentQuestion!.options.length === 0;

  if (showResults) {
    const score = calculateScore();
    return (
      <div className="min-h-screen bg-zinc-900 text-white flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center">
          <Trophy className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-6">Exam Complete!</h2>
          
          <div className="bg-zinc-800 rounded-lg p-6 mb-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-zinc-400">Score</span>
                <span className="text-xl font-bold">{score.percentage}%</span>
              </div>
              <Progress value={score.percentage} className="h-2" />
              <div className="flex justify-between items-center text-sm text-zinc-400">
                <span>Correct: {score.correct}</span>
                <span>Total: {score.total}</span>
              </div>
            </div>
          </div>

          <Button 
            className="bg-purple-600 hover:bg-purple-700 text-white"
            onClick={() => window.location.reload()}
          >
            Take Another Exam
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-900 text-white">
      {/* Header with timer and progress */}
      <div className="bg-zinc-800 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-4">
              <Button variant="ghost" className="text-white hover:bg-zinc-700">
                <Share className="w-4 h-4 mr-2" />
                Share exam
              </Button>
              <span className="text-zinc-400">{getAnsweredCount()}</span>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-zinc-400" />
                <span className="text-lg font-mono">{formatTime(timeLeft)}</span>
              </div>
            </div>
          </div>
          
          <Progress 
            value={getProgressPercentage()} 
            className="h-1 bg-zinc-700"
          />
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-8">
          <div className="flex justify-between items-start mb-6">
            <div className="flex-1">
              <div className="text-lg font-medium mb-4">
                {currentQuestionIndex + 1}.
              </div>
              <h2 className="text-xl leading-relaxed">
                {currentQuestion!.question}
              </h2>
            </div>
            
            <Button
              variant="ghost"
              onClick={handleSkip}
              className="text-zinc-400 hover:text-white hover:bg-zinc-800 ml-4"
              disabled={currentQuestionIndex === examData.questions.length - 1}
            >
              <SkipForward className="w-4 h-4 mr-2" />
              Skip
            </Button>
          </div>
        </div>

        {/* Answer section */}
        <div className="mb-8">
          {isTextQuestion ? (
            // Text input for open-ended questions
            <textarea
              className="w-full h-32 p-4 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-400 resize-none focus:outline-none focus:border-purple-500"
              placeholder="Type your answer here..."
              value={userAnswers[currentQuestionIndex] || ''}
              onChange={(e) => handleTextAnswer(currentQuestionIndex, e.target.value)}
            />
          ) : (
            // Multiple choice options
            <div className="space-y-3">
              {currentQuestion!.options?.map((option) => {
                const isSelected = userAnswers[currentQuestionIndex] === option.id;
                
                return (
                  <button
                    key={option.id}
                    className={`w-full text-left p-4 rounded-lg border transition-colors ${
                      isSelected
                        ? 'bg-purple-600 border-purple-500 text-white'
                        : 'bg-zinc-800 border-zinc-700 text-white hover:bg-zinc-700'
                    }`}
                    onClick={() => handleAnswer(currentQuestionIndex, option.id)}
                  >
                    <span className="font-medium text-zinc-300 mr-3">
                      {option.id}.
                    </span>
                    {option.text}
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
            onClick={handlePrevious}
            disabled={currentQuestionIndex === 0}
            className="text-zinc-400 hover:text-white hover:bg-zinc-800 disabled:opacity-50"
          >
            Previous
          </Button>

          <div className="flex gap-3">
            {currentQuestionIndex === examData.questions.length - 1 ? (
              <Button
                onClick={handleSubmitExam}
                className="bg-green-600 hover:bg-green-700 text-white px-6"
              >
                Submit Exam
              </Button>
            ) : (
              <Button
                onClick={handleNext}
                className="bg-purple-600 hover:bg-purple-700 text-white px-6"
              >
                Next
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}


