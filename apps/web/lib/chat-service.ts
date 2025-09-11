import {
  saveChatToRedis,
  getChatFromRedis,
  getChatHistoryFromRedis,
  deleteChatFromRedis,
  type ChatEntry,
} from "./redis-chat";
import {
  getChatFromDatabase,
  getChatHistoryFromDatabase,
  syncChatsFromDatabaseToRedis,
  batchSaveChatsToDatabase,
} from "./db-chat";
import prisma from "@repo/db";
import redis from "./redis-config";

export type { ChatEntry };

// Redis keys for sync management
const PENDING_SYNC_KEY = "chat:pending_sync";
const SYNC_LOCK_KEY = "chat:sync_lock";
const SYNC_LOCK_TIMEOUT = 300; // 5 minutes

// Generate unique chat ID
export function generateChatId(): string {
  return `chat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Add chat to pending sync queue
async function addToPendingSync(chatId: string): Promise<void> {
  try {
    await redis.sadd(PENDING_SYNC_KEY, chatId);
  } catch (error) {
    console.error("Failed to add chat to pending sync queue:", error);
  }
}

// Remove chat from pending sync queue
async function removeFromPendingSync(chatId: string): Promise<void> {
  try {
    await redis.srem(PENDING_SYNC_KEY, chatId);
  } catch (error) {
    console.error("Failed to remove chat from pending sync queue:", error);
  }
}

// Get all pending sync chat IDs
async function getPendingSyncChatIds(): Promise<string[]> {
  try {
    return await redis.smembers(PENDING_SYNC_KEY);
  } catch (error) {
    console.error("Failed to get pending sync chat IDs:", error);
    return [];
  }
}
// File: apps/web/lib/chat-service.ts
// Location: In the saveChat function

export async function saveChat(
  userId: string,
  query: string,
  response: string,
  options: {
    spaceId?: string;
    studyMaterialId?: string;
    studyMaterialIds?: string[];
    sources?: any;
    confidence?: number;
    ragMetadata?: any;
  } = {}
): Promise<ChatEntry> {
  const chatId = generateChatId();
  const now = new Date().toISOString();

  const chatEntry: ChatEntry = {
    id: chatId,
    userId,
    query,
    response,
    spaceId: options.spaceId,
    studyMaterialId: options.studyMaterialId,
    studyMaterialIds: options.studyMaterialIds || [],
    chatType: options.studyMaterialId ? "MATERIAL" : "SPACE",
    createdAt: now,
    updatedAt: now,
  };

  try {
    // Save chat only in Redis. Do not write to DB immediately.
    await saveChatToRedis(chatEntry);
    
    await addToPendingSync(chatId);

    triggerManualSync().catch(error => {
      console.error('Background sync failed:', error);
    });

    return chatEntry;
  } catch (error) {
    console.error("Failed to save chat:", error);
    throw error;
  }
}
// Get a specific chat entry
export async function getChat(chatId: string): Promise<ChatEntry | null> {
  try {
    // Try Redis first
    let chat = await getChatFromRedis(chatId);
    if (chat) {
    } else {
      // Fallback to database
      chat = await getChatFromDatabase(chatId);
      if (chat) {
        // Save back to Redis for future access
        await saveChatToRedis(chat);
      }
    }
    return chat;
  } catch (error) {
    console.error("Failed to get chat:", error);
    return null;
  }
}

// Get chat history with automatic fallback to database
export async function getChatHistory(
  userId: string,
  options: {
    spaceId?: string;
    studyMaterialId?: string;
    limit?: number;
    offset?: number;
  } = {}
): Promise<ChatEntry[]> {
  const { spaceId, studyMaterialId, limit = 50, offset = 0 } = options;
  try {
    if (offset > 0) {
      return await getChatHistoryFromDatabase(
        userId,
        spaceId,
        studyMaterialId,
        limit,
        offset
      );
    }

    let chats = await getChatHistoryFromRedis(
      userId,
      spaceId,
      studyMaterialId,
      limit
    );
    if (chats.length === 0) {
      chats = await syncChatsFromDatabaseToRedis(
        userId,
        spaceId,
        studyMaterialId,
        limit
      );
      if (chats.length > 0) {
      }
    }
    return chats;
  } catch (error) {
    console.error("Failed to get chat history:", error);
    return [];
  }
}

// Delete a chat entry
export async function deleteChat(
  chatId: string,
  userId: string,
  options: {
    spaceId?: string;
    studyMaterialId?: string;
  } = {}
): Promise<void> {
  try {
    // Delete from Redis
    await deleteChatFromRedis(
      chatId,
      userId,
      options.spaceId,
      options.studyMaterialId
    );

    // Remove from pending sync queue if it exists
    await removeFromPendingSync(chatId);

    // Delete from database (fire and forget)
    import("./db-chat").then(({ deleteChatFromDatabase }) => {
      deleteChatFromDatabase(chatId).catch((error) => {
        console.error("Background database delete failed:", error);
      });
    });
  } catch (error) {
    console.error("Failed to delete chat:", error);
    throw error;
  }
}

// Acquire sync lock with timeout
async function acquireSyncLock(): Promise<boolean> {
  try {
    const result = await redis.set(
      SYNC_LOCK_KEY,
      "1",
      "EX",
      SYNC_LOCK_TIMEOUT,
      "NX"
    );
    return result === "OK";
  } catch (error) {
    console.error("Failed to acquire sync lock:", error);
    return false;
  }
}

// Release sync lock
async function releaseSyncLock(): Promise<void> {
  try {
    await redis.del(SYNC_LOCK_KEY);
  } catch (error) {
    console.error("Failed to release sync lock:", error);
  }
}

// Get chat entry from Redis
async function getChatEntryFromRedis(
  chatId: string
): Promise<ChatEntry | null> {
  try {
    const chatKey = `chat:entry:${chatId}`;
    const chatData = await redis.get(chatKey);

    if (!chatData) {
      return null;
    }

    return JSON.parse(chatData) as ChatEntry;
  } catch (error) {
    console.error(`Failed to get chat ${chatId} from Redis:`, error);
    return null;
  }
}

// Background sync function to sync Redis chats to database
export async function syncPendingChatsToDatabase(): Promise<{
  success: boolean;
  synced: number;
  failed: number;
  errors: string[];
}> {
  const result = {
    success: false,
    synced: 0,
    failed: 0,
    errors: [] as string[],
  };

  // Try to acquire lock
  const lockAcquired = await acquireSyncLock();
  if (!lockAcquired) {
    result.errors.push(
      "Could not acquire sync lock - another sync might be in progress"
    );
    return result;
  }

  try {
    // Get all pending chat IDs
    const pendingChatIds = await getPendingSyncChatIds();

    if (pendingChatIds.length === 0) {
      result.success = true;
      console.log("No pending chats to sync");
      return result;
    }

    console.log(`Starting sync of ${pendingChatIds.length} pending chats...`);

    // Fetch chat entries from Redis in batches
    const batchSize = 50;
    const chatEntries: ChatEntry[] = [];
    const failedIds: string[] = [];

    for (let i = 0; i < pendingChatIds.length; i += batchSize) {
      const batch = pendingChatIds.slice(i, i + batchSize);

      const batchPromises = batch.map(async (chatId) => {
        const chatEntry = await getChatEntryFromRedis(chatId);
        if (chatEntry) {
          return { chatId, chatEntry };
        } else {
          failedIds.push(chatId);
          return null;
        }
      });

      const batchResults = await Promise.all(batchPromises);

      for (const result of batchResults) {
        if (result) {
          chatEntries.push(result.chatEntry);
        }
      }
    }

    // Save to database in batches
    if (chatEntries.length > 0) {
      try {
        await batchSaveChatsToDatabase(chatEntries);
        result.synced = chatEntries.length;

        // Remove successfully synced chats from pending queue
        const syncedIds = chatEntries.map((entry) => entry.id);
        if (syncedIds.length > 0) {
          await redis.srem(PENDING_SYNC_KEY, ...syncedIds);
        }

        console.log(`Successfully synced ${result.synced} chats to database`);
      } catch (error) {
        result.errors.push(
          `Database save failed: ${error instanceof Error ? error.message : "Unknown error"}`
        );
        result.failed = chatEntries.length;
      }
    }

    // Handle failed fetches
    if (failedIds.length > 0) {
      result.failed += failedIds.length;
      result.errors.push(
        `Failed to fetch ${failedIds.length} chats from Redis`
      );

      // Remove failed IDs from pending queue (they're probably expired)
      await redis.srem(PENDING_SYNC_KEY, ...failedIds);
    }

    result.success = result.errors.length === 0;

    return result;
  } catch (error) {
    result.errors.push(
      `Sync process failed: ${error instanceof Error ? error.message : "Unknown error"}`
    );
    return result;
  } finally {
    await releaseSyncLock();
  }
}

// Get sync status for monitoring
export async function getSyncStatus(): Promise<{
  pendingCount: number;
  lockExists: boolean;
  lastSyncTime?: string;
}> {
  try {
    const [pendingCount, lockExists] = await Promise.all([
      redis.scard(PENDING_SYNC_KEY),
      redis.exists(SYNC_LOCK_KEY),
    ]);

    return {
      pendingCount,
      lockExists: lockExists === 1,
    };
  } catch (error) {
    console.error("Failed to get sync status:", error);
    return {
      pendingCount: 0,
      lockExists: false,
    };
  }
}

// Manual trigger for sync (useful for admin endpoints)
export async function triggerManualSync(): Promise<{
  success: boolean;
  message: string;
  result?: any;
}> {
  try {
    const status = await getSyncStatus();

    if (status.lockExists) {
      return {
        success: false,
        message: "Sync is already in progress",
      };
    }

    if (status.pendingCount === 0) {
      return {
        success: true,
        message: "No pending chats to sync",
      };
    }

    const result = await syncPendingChatsToDatabase();

    return {
      success: result.success,
      message: result.success
        ? `Successfully synced ${result.synced} chats`
        : `Sync failed: ${result.errors.join(", ")}`,
      result,
    };
  } catch (error) {
    return {
      success: false,
      message: `Manual sync failed: ${error instanceof Error ? error.message : "Unknown error"}`,
    };
  }
}

// Get chat statistics
export async function getChatStats(
  userId: string,
  options: {
    spaceId?: string;
    studyMaterialId?: string;
  } = {}
): Promise<{
  totalChats: number;
  todayChats: number;
}> {
  try {
    // Get from database for accurate counts
    const { spaceId, studyMaterialId } = options;

    const whereClause: any = { userId };
    if (studyMaterialId) {
      whereClause.studyMaterialId = studyMaterialId;
    } else if (spaceId) {
      whereClause.spaceId = spaceId;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [totalChats, todayChats, avgResult] = await Promise.all([
      prisma.chat.count({ where: whereClause }),
      prisma.chat.count({
        where: {
          ...whereClause,
          createdAt: { gte: today },
        },
      }),
      prisma.chat.aggregate({
        where: {
          ...whereClause,
          confidence: { not: null },
        },
      }),
    ]);

    return {
      totalChats,
      todayChats,
    };
  } catch (error) {
    console.error("Failed to get chat stats:", error);
    return {
      totalChats: 0,
      todayChats: 0,
    };
  }
}
