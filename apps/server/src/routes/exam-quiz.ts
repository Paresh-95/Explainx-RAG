import { Router } from "express";
import type { Request, Response } from "express";
import { z } from "zod";
import { QuizGenerator } from "../services/examQuizProcessor";
import { authMiddleware } from "../middlware/auth";

const router = Router();
const quizGenerator = new QuizGenerator();

// Generate quiz schema
const GenerateQuizSchema = z.object({
  spaceId: z.string(),
  count: z.number().min(1).max(20).optional().default(5),
  questionType: z.string().optional(),
  examLength: z.number().optional(),
  selectedMaterialIds: z.array(z.string()).optional(),
});

// POST /api/quiz/generate
router.post("/generate", authMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const validatedData = GenerateQuizSchema.parse(req.body);

    // You can pass these to your quiz generator if needed
    const { spaceId, count, questionType, examLength, selectedMaterialIds } = validatedData;

    const questions = await quizGenerator.generateQuiz(
      spaceId,
      count,
      questionType,
      examLength,
    );

    res.json({
      success: true,
      questions,
      questionType,
      examLength,
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