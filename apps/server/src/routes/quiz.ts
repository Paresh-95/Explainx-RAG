import { Router } from "express";
import type { Request, Response } from "express";
import { z } from "zod";
import { QuizGenerator } from "../services/quizProcessor";
import { authMiddleware } from "../middlware/auth";

const router = Router();
const quizGenerator = new QuizGenerator();

// Generate quiz schema
const GenerateQuizSchema = z.object({
  studyMaterialId: z.string(),
  count: z.number().min(1).max(20).optional().default(5),
});

// POST /api/quiz/generate
router.post("/generate", authMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const validatedData = GenerateQuizSchema.parse(req.body);

    const questions = await quizGenerator.generateQuiz(
      validatedData.studyMaterialId,
      validatedData.count
    );

    res.json({
      success: true,
      questions,
    });
  } catch (error) {
    console.error("Quiz generation error:", error);

    if (error instanceof z.ZodError) {
      // Create a more user-friendly error message
      const errorDetails = error.errors.map(err => {
        if (err.code === "too_big" && err.path[0] === "count") {
          return "The number of questions must be between 1 and 20";
        }
        if (err.code === "too_small" && err.path[0] === "count") {
          return "The number of questions must be at least 1";
        }
        return err.message;
      });

      res.status(400).json({
        success: false,
        error: "Validation error",
        message: errorDetails[0], // Send the first error message
        details: error.errors
      });
      return;
    }

    res.status(500).json({
      success: false,
      error: "Failed to generate quiz",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

export default router; 