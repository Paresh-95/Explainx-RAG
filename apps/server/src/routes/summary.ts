import { Router } from "express";
import type { Request, Response } from "express";
import { z } from "zod";
import { SummaryGenerator } from "../services/summaryProcessor";
import { authMiddleware } from "../middlware/auth";


const router = Router();
const summaryGenerator = new SummaryGenerator();

// Generate summary schema
const GenerateSummarySchema = z.object({
  studyMaterialId: z.string().min(1, "Study material ID is required"),
});

// POST /api/summary/generate
router.post("/generate", authMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const validatedData = GenerateSummarySchema.parse(req.body);

    const summary = await summaryGenerator.generateSummary(
      validatedData.studyMaterialId
    );

    res.json({
      success: true,
      summary,
    });
  } catch (error) {
    console.error("Summary generation error:", error);

    if (error instanceof z.ZodError) {
      // Create a more user-friendly error message
      const errorDetails = error.errors.map(err => {
        if (err.code === "too_big" && err.path[0] === "maxSectionLength") {
          return "Section length must be at most 15,000 characters";
        }
        if (err.code === "too_small" && err.path[0] === "maxSectionLength") {
          return "Section length must be at least 1,000 characters";
        }
        if (err.path[0] === "studyMaterialId" && err.code === "too_small") {
          return "Study material ID is required";
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
      error: "Failed to generate summary",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

// GET /api/summary/status/:studyMaterialId - Check if summary exists or get cached summary
router.get("/status/:studyMaterialId", async (req: Request, res: Response): Promise<void> => {
  try {
    const { studyMaterialId } = req.params;

    if (!studyMaterialId) {
      res.status(400).json({
        success: false,
        error: "Study material ID is required",
      });
      return;
    }

    // You could implement caching logic here
    // For now, just return that summary needs to be generated
    res.json({
      success: true,
      exists: false,
      message: "Summary needs to be generated",
      studyMaterialId,
    });
  } catch (error) {
    console.error("Summary status check error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to check summary status",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

export default router;