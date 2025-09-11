// ==========================================
// 4. QUERY ROUTES - src/routes/query.ts
// ==========================================
import { Router } from "express";
import type { Request, Response } from "express";
import { z } from "zod";
import { DocumentProcessor } from "../services/documentProcessor";
import { authMiddleware } from "../middlware/auth";

// Extend Request interface to include user property
interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email?: string;
  };
}

const router = Router();
const documentProcessor = new DocumentProcessor();

// Query schema
const QuerySchema = z.object({
  query: z.string().min(1),
  studyMaterialId: z.string().optional(),
  spaceId: z.string().optional(),
  topK: z.number().min(1).max(20).default(5),
  includeMetadata: z.boolean().default(true),
});

// Space query schema (requires spaceId)
const SpaceQuerySchema = z.object({
  query: z.string().min(1),
  spaceId: z.string(),
  topK: z.number().min(1).max(20).default(5),
  includeMetadata: z.boolean().default(true),
});

// POST /api/query - Document query (single document)
router.post("/", authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const validatedData = QuerySchema.parse(req.body);
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    const result = await documentProcessor.queryDocuments({
      ...validatedData,
      userId,
    });

    res.json({
      success: true,
      queryType: "document",
      ...result,
    });
  } catch (error) {
    console.error("Query error:", error);

    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: "Validation error",
        details: error.errors,
      });
    }

    res.status(500).json({
      error: "Failed to process query",
    });
  }
});

// POST /api/query/space - Space query (all documents in a space)
router.post("/space", authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const validatedData = SpaceQuerySchema.parse(req.body);
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    const result = await documentProcessor.queryDocuments({
      ...validatedData,
      userId,
    });

    res.json({
      success: true,
      queryType: "space",
      spaceId: validatedData.spaceId,
      ...result,
    });
  } catch (error) {
    console.error("Space query error:", error);

    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: "Validation error",
        details: error.errors,
      });
    }

    res.status(500).json({
      error: "Failed to process space query",
    });
  }
});

// GET /api/query/debug - Debug route to check vector database
router.get("/debug", authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { spaceId, studyMaterialId } = req.query;

    if (!userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    const debugInfo = await documentProcessor.debugVectorDatabase({
      spaceId: spaceId as string,
      studyMaterialId: studyMaterialId as string,
    });

    res.json({
      success: true,
      debugInfo,
    });
  } catch (error) {
    console.error("Debug error:", error);
    res.status(500).json({
      error: "Failed to get debug info",
    });
  }
});

export { router as queryRoutes };
