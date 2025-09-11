// ==========================================
// 8. AUTH MIDDLEWARE - src/middleware/auth.ts
// ==========================================
import type { Request, Response, NextFunction } from "express";

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email?: string;
  };
}

export const authMiddleware = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const authHeader = req.headers.authorization;
    const apiKey = process.env.BACKEND_API_KEY;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({ error: "No authorization token provided" });
      return;
    }

    const token = authHeader.substring(7);

    if (token !== apiKey) {
      res.status(401).json({ error: "Invalid authorization token" });
      return;
    }

    // Extract user ID from headers
    const userId = req.headers["x-user-id"] as string;

    if (!userId) {
      res.status(401).json({ error: "User ID required" });
      return;
    }

    req.user = { id: userId };
    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    res.status(401).json({ error: "Authentication failed" });
  }
};
