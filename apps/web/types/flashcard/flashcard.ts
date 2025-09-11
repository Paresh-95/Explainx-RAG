export interface Flashcard {
  question: string;
  answer: string;
  hint?: string;
}

export interface FlashcardProgress {
  studyMaterialId: string;
  userId: string;
  currentIndex: number;
  totalCards: number;
  completedCards: Set<number>;
  lastStudied: string;
  totalStudyTime: number;
  flashcardSetVersion: string;
}

export interface FlashcardUIProps {
  studyMaterialId: string;
  spaceId?: string;
  userId: string;
}