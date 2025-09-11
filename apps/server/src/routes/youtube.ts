import { Router } from "express";
import { z } from "zod";
import { YouTubeProcessor } from "../services/youtubeProcessor";
import { broadcastProgress } from "../services/websocketService";
import { authMiddleware } from "../middlware/auth";

const router = Router();
const youtubeProcessor = new YouTubeProcessor();

// Process YouTube video schema
const ProcessYouTubeSchema = z.object({
  studyMaterialId: z.string(),
  spaceId: z.string(),
  youtubeUrl: z.string().url("Invalid YouTube URL"),
  userId: z.string(),
  title: z.string().optional(),
  description: z.string().optional(),
});

// POST /api/youtube/process
router.post("/process", authMiddleware, async (req, res) => {
  try {
    const validatedData = ProcessYouTubeSchema.parse(req.body);

    // Broadcast initial status
    broadcastProgress(validatedData.userId, {
      studyMaterialId: validatedData.studyMaterialId,
      status: "queued",
      progress: 0,
      message: "YouTube video queued for processing",
    });

    // Process YouTube video directly (for testing)
    // Don't await this - let it run in background
    youtubeProcessor.processYouTubeVideo(validatedData).catch((error) => {
      console.error("Background YouTube processing failed:", error);
    });

    res.json({
      success: true,
      jobId: `youtube-${validatedData.studyMaterialId}`, // Mock job ID
      message: "YouTube video processing started",
      estimatedTime: "2-5 minutes",
    });
  } catch (error) {
    console.error("YouTube processing error:", error);

    if (error instanceof z.ZodError) {
      res.status(400).json({
        error: "Validation error",
        details: error.errors,
      });
      return;
    }

    res.status(500).json({
      error: "Failed to start YouTube video processing",
    });
  }
});

// GET /api/youtube/status/:studyMaterialId
router.get("/status/:studyMaterialId", async (req, res) => {
  try {
    const { studyMaterialId } = req.params;
    const status = await youtubeProcessor.getProcessingStatus(studyMaterialId);

    res.json({
      success: true,
      status,
    });
  } catch (error) {
    console.error("Status check error:", error);
    res.status(500).json({
      error: "Failed to check processing status",
    });
  }
});

// POST /api/youtube/query
router.post("/query", async (req, res) => {
  try {
    const QuerySchema = z.object({
      query: z.string().min(1, "Query cannot be empty"),
      studyMaterialId: z.string().optional(),
      spaceId: z.string().optional(),
      topK: z.number().min(1).max(20).default(5),
      includeMetadata: z.boolean().default(true),
      userId: z.string(),
    });

    const validatedData = QuerySchema.parse(req.body);

    const results = await youtubeProcessor.queryDocuments(validatedData);

    res.json(results);
  } catch (error) {
    console.error("Query error:", error);

    if (error instanceof z.ZodError) {
      res.status(400).json({
        error: "Validation error",
        details: error.errors,
      });
      return;
    }

    res.status(500).json({
      error: "Failed to query YouTube video content",
    });
  }
});

// GET /api/youtube/debug
router.get("/debug", async (req, res) => {
  try {
    const { spaceId, studyMaterialId } = req.query;
    
    const debugData = await youtubeProcessor.debugVectorDatabase({
      spaceId: spaceId as string,
      studyMaterialId: studyMaterialId as string,
    });

    res.json(debugData);
  } catch (error) {
    console.error("Debug error:", error);
    res.status(500).json({
      error: "Failed to debug vector database",
    });
  }
});

export { router as youtubeRoutes }; 