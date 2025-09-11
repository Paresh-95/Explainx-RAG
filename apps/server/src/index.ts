import express from "express";
import type { ErrorRequestHandler } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";
import { createServer } from "http";
import { WebSocketServer } from "ws";

// Import routes
import { documentRoutes } from "./routes/documents";
import { queryRoutes } from "./routes/query";
import { youtubeRoutes } from "./routes/youtube";
import flashcardRoutes from "./routes/flashcards";
import quizRoutes from "./routes/quiz";
import summaryRoutes from "./routes/summary";
import examQuizRoutes from "./routes/exam-quiz";

// Import middleware
import { authMiddleware } from "./middlware/auth";
import { errorHandler } from "./middlware/errorHandler";

// Import services
// import { setupQueue } from "./services/queueService";
import { setupWebSocket } from "./services/websocketService";

dotenv.config();

const app = express();
const server = createServer(app);
const PORT = process.env.PORT || 8000;

// Middleware
app.use(helmet());
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  }),
);
app.use(morgan("combined"));
app.use(express.json({ limit: "50mb" }));

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Routes
// app.use("/api/documents", authMiddleware, documentRoutes);
// app.use("/api/query", authMiddleware, queryRoutes);

app.use("/api/documents", documentRoutes);
app.use("/api/query", queryRoutes);
app.use("/api/youtube", youtubeRoutes);
app.use("/api/flashcards", flashcardRoutes);
app.use("/api/quiz", quizRoutes);
app.use("/api/summary", summaryRoutes);
app.use("/api/exam", examQuizRoutes);

// Error handling
app.use(errorHandler as ErrorRequestHandler);

// Setup WebSocket for real-time updates
const wss = new WebSocketServer({ server });
setupWebSocket(wss);

// Setup background job queue
// setupQueue();

server.listen(PORT, () => {
  console.log(`🚀 RAG Backend server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
});
