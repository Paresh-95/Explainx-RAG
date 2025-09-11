import { QuizProgress, QuizQuestion } from "../../types/quiz/quiz";

// Unified Quiz Storage Utilities
export const quizStorageUtils = {
  // Get complete quiz with progress
  async getQuiz(studyMaterialId: string, userId: string): Promise<{
    questions: QuizQuestion[];
    progress: QuizProgress;
    lastUpdated: string;
  } | null> {
    try {
      const response = await fetch(`/api/quizz?studyMaterialId=${studyMaterialId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 404) return null;
        throw new Error('Failed to fetch quiz');
      }

      const data = await response.json();
      
      if (data.quiz) {
        return {
          questions: data.quiz.questions,
          progress: {
            studyMaterialId,
            userId,
            currentQuestionIndex: data.quiz.progress.currentQuestionIndex,
            totalQuestions: data.quiz.totalQuestions,
            userAnswers: data.quiz.progress.userAnswers || {},
            showFeedback: data.quiz.progress.showFeedback || {},
            showScoreReport: data.quiz.progress.showScoreReport || false,
            lastAttempted: data.quiz.progress.lastAttempted,
            quizSetVersion: data.quiz.progress.quizSetVersion || "1.0",
          },
          lastUpdated: data.quiz.lastUpdated,
        };
      }

      return null;
    } catch (error) {
      console.error('Failed to get quiz:', error);
      return null;
    }
  },

  // Generate or get existing quiz
  async generateQuiz(
    studyMaterialId: string, 
    userId: string, 
    count: number = 20, 
    forceRegenerate: boolean = false
  ): Promise<{
    questions: QuizQuestion[];
    progress: QuizProgress;
    lastUpdated: string;
    cached: boolean;
  } | null> {
    try {
      const response = await fetch('/api/quizz/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          studyMaterialId,
          count,
          forceRegenerate,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate quiz');
      }

      const data = await response.json();
      
      if (data.questions) {
        return {
          questions: data.questions,
          progress: {
            studyMaterialId,
            userId,
            currentQuestionIndex: 0,
            totalQuestions: data.questions.length,
            userAnswers: {},
            showFeedback: {},
            showScoreReport: false,
            lastAttempted: new Date().toISOString(),
            quizSetVersion: data.lastUpdated || "1.0",
          },
          lastUpdated: data.lastUpdated,
          cached: data.cached || false,
        };
      }

      return null;
    } catch (error) {
      console.error('Failed to generate quiz:', error);
      throw error;
    }
  },

  // Save quiz progress
  async saveProgress(progress: QuizProgress): Promise<void> {
    try {
      const response = await fetch('/api/quizz/progress', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          studyMaterialId: progress.studyMaterialId,
          currentQuestionIndex: progress.currentQuestionIndex,
          userAnswers: progress.userAnswers,
          showFeedback: progress.showFeedback,
          showScoreReport: progress.showScoreReport,
          quizSetVersion: progress.quizSetVersion,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save quiz progress');
      }
    } catch (error) {
      console.error('Failed to save quiz progress:', error);
      throw error;
    }
  },

  // Reset quiz progress
  async resetProgress(
    studyMaterialId: string, 
    userId: string, 
    totalQuestions: number, 
    quizSetVersion: string
  ): Promise<QuizProgress> {
    try {
      const response = await fetch(`/api/quizz/progress?studyMaterialId=${studyMaterialId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to reset quiz progress');
      }

      return {
        studyMaterialId,
        userId,
        currentQuestionIndex: 0,
        totalQuestions,
        userAnswers: {},
        showFeedback: {},
        showScoreReport: false,
        lastAttempted: new Date().toISOString(),
        quizSetVersion,
      };
    } catch (error) {
      console.error('Failed to reset quiz progress:', error);
      throw error;
    }
  },

  // Cache questions in localStorage (without correct answers for security)
  async cacheQuestions(
    studyMaterialId: string, 
    userId: string, 
    questions: QuizQuestion[], 
    version: string
  ): Promise<void> {
    try {
      // Only cache questions without correct answers for security
      const sanitizedQuestions = questions.map(q => ({
        question: q.question,
        options: q.options,
        explanation: q.explanation,
        // Don't cache correctOptionId to prevent exposure
      }));

      const cacheData = { 
        questions: sanitizedQuestions, 
        version, 
        cachedAt: new Date().toISOString() 
      };
      
      const key = `cached_quiz_${studyMaterialId}`;
      localStorage.setItem(key, JSON.stringify(cacheData));
    } catch (error) {
      console.error('Failed to cache quiz questions:', error);
    }
  },

  // Get cached questions from localStorage
  async getCachedQuestions(
    studyMaterialId: string, 
    userId: string
  ): Promise<{ questions: QuizQuestion[]; version: string } | null> {
    try {
      const key = `cached_quiz_${studyMaterialId}`;
      const cached = localStorage.getItem(key);
      if (!cached) return null;
      
      const cacheData = JSON.parse(cached);
      
      // Check if cache is still valid (24 hours)
      const cacheAge = Date.now() - new Date(cacheData.cachedAt).getTime();
      const maxAge = 24 * 60 * 60 * 1000; // 24 hours
      
      if (cacheAge > maxAge) {
        localStorage.removeItem(key);
        return null;
      }
      
      return { 
        questions: cacheData.questions || [], 
        version: cacheData.version || 'unknown' 
      };
    } catch (error) {
      console.error('Failed to get cached questions:', error);
      return null;
    }
  },

  // Clear cache for a study material
  async clearCache(studyMaterialId: string): Promise<void> {
    try {
      const key = `cached_quiz_${studyMaterialId}`;
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Failed to clear cache:', error);
    }
  },

  // Get quiz statistics
  async getQuizStats(studyMaterialId?: string, spaceId?: string): Promise<any> {
    try {
      let url = '/api/quizz/stats';
      const params = new URLSearchParams();
      
      if (studyMaterialId) params.append('studyMaterialId', studyMaterialId);
      if (spaceId) params.append('spaceId', spaceId);
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const response = await fetch(url, {
        method: 'GET',
      });

      if (!response.ok) {
        return null;
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to get quiz stats:', error);
      return null;
    }
  },

  // Utility: Calculate score from progress
  calculateScore(userAnswers: { [key: number]: string }, questions: QuizQuestion[]): {
    correct: number;
    total: number;
    percentage: number;
  } {
    let correct = 0;
    Object.entries(userAnswers).forEach(([idx, answer]) => {
      const question = questions[Number(idx)];
      if (question && question.correctOptionId === answer) {
        correct++;
      }
    });
    
    return {
      correct,
      total: questions.length,
      percentage: questions.length > 0 ? Math.round((correct / questions.length) * 100) : 0,
    };
  },

  // Utility: Check if quiz is completed
  isQuizCompleted(userAnswers: { [key: number]: string }, totalQuestions: number): boolean {
    return Object.keys(userAnswers).length === totalQuestions;
  },

  // Initialize progress for existing implementation compatibility
  async initializeProgress(
    studyMaterialId: string, 
    userId: string, 
    totalQuestions: number, 
    version: string
  ): Promise<QuizProgress> {
    // For compatibility with existing code - this creates a local progress object
    // The actual initialization happens when the quiz is first generated via generateQuiz
    return {
      studyMaterialId,
      userId,
      currentQuestionIndex: 0,
      totalQuestions,
      userAnswers: {},
      showFeedback: {},
      showScoreReport: false,
      lastAttempted: new Date().toISOString(),
      quizSetVersion: version,
    };
  },

  // Get progress only (for compatibility)
  async getProgress(studyMaterialId: string, userId: string): Promise<QuizProgress | null> {
    const quiz = await this.getQuiz(studyMaterialId, userId);
    return quiz ? quiz.progress : null;
  }
};