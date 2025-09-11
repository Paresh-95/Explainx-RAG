export interface QuizQuestion {
  question: string;
  options: {
    id: string;
    text: string;
  }[];
  correctOptionId: string;
  explanation: string;
}


export interface QuizProgress {
  studyMaterialId: string;
  userId: string;
  currentQuestionIndex: number;
  totalQuestions: number;
  userAnswers: { [qIdx: number]: string };
  showFeedback: { [qIdx: number]: boolean };
  showScoreReport: boolean;
  lastAttempted: string;
  quizSetVersion: string;
}

export interface QuizUIProps {
  studyMaterialId: string;
  userId: string;
  count?: number;
}