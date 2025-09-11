import { Router } from "express";
import type { Request, Response } from "express";
import { z } from "zod";
import { FlashcardGenerator } from "../services/flashcardProcessor";
import { authMiddleware } from "../middlware/auth";

const router = Router();
const flashcardGenerator = new FlashcardGenerator();

// Generate flashcards schema
const GenerateFlashcardsSchema = z.object({
  studyMaterialId: z.string(),
});

// POST /api/flashcards/generate
router.post("/generate", authMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const validatedData = GenerateFlashcardsSchema.parse(req.body);

    const flashcards = await flashcardGenerator.generateFlashcards(
      validatedData.studyMaterialId
    );

    res.json({
      success: true,
      flashcards,
    });
  } catch (error) {
    console.error("Flashcard generation error:", error);

    if (error instanceof z.ZodError) {
      res.status(400).json({
        error: "Validation error",
        details: error.errors,
      });
      return;
    }

    res.status(500).json({
      error: "Failed to generate flashcards",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

export default router; 