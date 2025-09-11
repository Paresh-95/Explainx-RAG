import { Router } from "express";
import { z } from "zod";
import { DocumentProcessor } from "../services/documentProcessor";
import type { Request, Response } from "express";
// import { queueManager } from '../services/queueService';
import { broadcastProgress } from "../services/websocketService";
import { authMiddleware } from "../middlware/auth";

const router = Router();
const documentProcessor = new DocumentProcessor();

// Process document schema
const ProcessDocumentSchema = z.object({
  studyMaterialId: z.string(),
  spaceId: z.string(),
  fileKey: z.string(),
  s3Bucket: z.string(),
  fileName: z.string(),
  fileSize: z.number(),
  mimeType: z.string(),
  userId: z.string(),
  title: z.string().optional(),
  description: z.string().optional(),
});

// POST /api/documents/process
router.post("/process", authMiddleware, async (req: Request, res: Response): Promise<void> =>{
  try {
    const validatedData = ProcessDocumentSchema.parse(req.body);

    // TESTING: Process directly instead of using queue
    // Add to processing queue
    // const job = await queueManager.addProcessingJob({
    //   ...validatedData,
    //   priority: 1 // Higher priority for immediate processing
    // });

    // Broadcast initial status
    broadcastProgress(validatedData.userId, {
      studyMaterialId: validatedData.studyMaterialId,
      status: "queued",
      progress: 0,
      message: "Document queued for processing",
    });

    // For testing: Process document directly
    // Don't await this - let it run in background
    documentProcessor.processDocument(validatedData).catch((error) => {
      console.error("Background processing failed:", error);
    });

    res.json({
      success: true,
      jobId: `direct-${validatedData.studyMaterialId}`, // Mock job ID
      message: "Document processing started",
      estimatedTime: "5-10 minutes",
    });
  } catch (error) {
    console.error("Document processing error:", error);

    if (error instanceof z.ZodError) {
      res.status(400).json({
        error: "Validation error",
        details: error.errors,
      });
      return;
    }

    res.status(500).json({
      error: "Failed to start document processing",
    });
  }
});

// GET /api/documents/status/:studyMaterialId
router.get("/status/:studyMaterialId", async (req, res) => {
  try {
    const { studyMaterialId } = req.params;
    const status = await documentProcessor.getProcessingStatus(studyMaterialId);

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

export { router as documentRoutes };

// ==========================================
// 3. DOCUMENT PROCESSING ROUTES - src/routes/documents.ts
// ==========================================
// import { Router } from "express";
// import { z } from "zod";
// import { DocumentProcessor } from "../services/documentProcessor";
// import { queueManager } from "../services/queueService";
// import { broadcastProgress } from "../services/websocketService";

// const router = Router();
// const documentProcessor = new DocumentProcessor();

// // Process document schema
// const ProcessDocumentSchema = z.object({
//   studyMaterialId: z.string(),
//   spaceId: z.string(),
//   fileKey: z.string(),
//   s3Bucket: z.string(),
//   fileName: z.string(),
//   fileSize: z.number(),
//   mimeType: z.string(),
//   userId: z.string(),
//   title: z.string().optional(),
//   description: z.string().optional(),
// });

// // POST /api/documents/process
// router.post("/process", async (req, res) => {
//   try {
//     const validatedData = ProcessDocumentSchema.parse(req.body);

//     // Add to processing queue
//     const job = await queueManager.addProcessingJob({
//       ...validatedData,
//       priority: 1, // Higher priority for immediate processing
//     });

//     // Broadcast initial status
//     broadcastProgress(validatedData.userId, {
//       studyMaterialId: validatedData.studyMaterialId,
//       status: "queued",
//       progress: 0,
//       message: "Document queued for processing",
//     });

//     res.json({
//       success: true,
//       jobId: job.id,
//       message: "Document processing started",
//       estimatedTime: "5-10 minutes",
//     });
//   } catch (error) {
//     console.error("Document processing error:", error);

//     if (error instanceof z.ZodError) {
//       return res.status(400).json({
//         error: "Validation error",
//         details: error.errors,
//       });
//     }

//     res.status(500).json({
//       error: "Failed to start document processing",
//     });
//   }
// });

// // GET /api/documents/status/:studyMaterialId
// router.get("/status/:studyMaterialId", async (req, res) => {
//   try {
//     const { studyMaterialId } = req.params;
//     const status = await documentProcessor.getProcessingStatus(studyMaterialId);

//     res.json({
//       success: true,
//       status,
//     });
//   } catch (error) {
//     console.error("Status check error:", error);
//     res.status(500).json({
//       error: "Failed to check processing status",
//     });
//   }
// });

// export { router as documentRoutes };
