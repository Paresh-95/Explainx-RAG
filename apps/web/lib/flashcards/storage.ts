import { Flashcard } from "../../types/flashcard/flashcard";

// Simple storage utilities
export const storageUtils = {
  getStorageKey: (baseKey: string, userId: string, studyMaterialId: string) =>
    `${baseKey}_${studyMaterialId}`,

  async cacheFlashcards(
    studyMaterialId: string,
    userId: string,
    flashcards: Flashcard[],
    version: string
  ): Promise<void> {
    try {
      const cacheData = {
        flashcards,
        version,
        cachedAt: new Date().toISOString(),
      };
      const key = this.getStorageKey(
        "cached_flashcards",
        userId,
        studyMaterialId
      );
      localStorage.setItem(key, JSON.stringify(cacheData));
    } catch (error) {
      console.error("Failed to cache flashcards:", error);
    }
  },

  async getCachedFlashcards(
    studyMaterialId: string,
    userId: string
  ): Promise<{ flashcards: Flashcard[]; version: string } | null> {
    try {
      const key = this.getStorageKey(
        "cached_flashcards",
        userId,
        studyMaterialId
      );
      const cached = localStorage.getItem(key);
      if (!cached) return null;

      const cacheData = JSON.parse(cached);
      return {
        flashcards: cacheData.flashcards || [],
        version: cacheData.version || "unknown",
      };
    } catch (error) {
      return null;
    }
  },
};