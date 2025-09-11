// ==========================================
// 9. ERROR HANDLER - src/middleware/errorHandler.ts
// ==========================================
import { Request, Response, NextFunction } from "express";

export const errorHandler = (
  error: any,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  console.error("❌ Error:", error);

  // Handle specific error types
  if (error.name === "ValidationError") {
    return res.status(400).json({
      error: "Validation failed",
      details: error.message,
    });
  }

  if (error.code === "ENOENT") {
    return res.status(404).json({
      error: "File not found",
    });
  }

  if (error.message.includes("S3")) {
    return res.status(500).json({
      error: "File storage error",
      details: "Failed to access file storage",
    });
  }

  // Default error response
  res.status(500).json({
    error: "Internal server error",
    message:
      process.env.NODE_ENV === "development"
        ? error.message
        : "Something went wrong",
  });
};
