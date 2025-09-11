// ==========================================
// 7. WEBSOCKET SERVICE - src/services/websocketService.ts
// ==========================================
import { WebSocketServer, WebSocket } from "ws";

interface ProgressUpdate {
  studyMaterialId: string;
  status: string;
  progress: number;
  message: string;
  error?: string;
}

const userConnections = new Map<string, Set<WebSocket>>();

export const setupWebSocket = (wss: WebSocketServer) => {
  wss.on("connection", (ws: WebSocket, request) => {
    console.log("📡 New WebSocket connection");

    // Extract user ID from query params or headers
    const url = new URL(request.url!, `http://${request.headers.host}`);
    const userId = url.searchParams.get("userId");

    if (userId) {
      // Add connection to user's set
      if (!userConnections.has(userId)) {
        userConnections.set(userId, new Set());
      }
      userConnections.get(userId)!.add(ws);

      console.log(`👤 User ${userId} connected via WebSocket`);
    }

    ws.on("close", () => {
      // Remove connection
      if (userId) {
        const userWs = userConnections.get(userId);
        if (userWs) {
          userWs.delete(ws);
          if (userWs.size === 0) {
            userConnections.delete(userId);
          }
        }
        console.log(`👤 User ${userId} disconnected from WebSocket`);
      }
    });

    ws.on("error", (error) => {
      console.error("WebSocket error:", error);
    });

    // Send welcome message
    ws.send(
      JSON.stringify({
        type: "connection",
        message: "Connected to RAG processing server",
      }),
    );
  });

  console.log("🔗 WebSocket server initialized");
};

export const broadcastProgress = (userId: string, update: ProgressUpdate) => {
  const userWs = userConnections.get(userId);

  if (userWs && userWs.size > 0) {
    const message = JSON.stringify({
      type: "progress",
      data: update,
    });

    userWs.forEach((ws) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(message);
      }
    });

    console.log(`📤 Progress broadcast to user ${userId}:`, update.message);
  }
};
