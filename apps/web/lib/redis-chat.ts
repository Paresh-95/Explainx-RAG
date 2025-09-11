// lib/redis-chat.ts
import Redis from "ioredis";
import redis from './redis-config';

export interface ChatEntry {
  id: string;
  spaceId?: string;
  userId: string;
  chatType: "MATERIAL" | "SPACE";
  studyMaterialId?: string;
  studyMaterialIds?: string[];
  query: string;
  response: string;
  createdAt: string;
  updatedAt: string;
}

// Redis key patterns
const getChatListKey = (
  userId: string,
  spaceId?: string,
  studyMaterialId?: string
): string => {
  if (studyMaterialId) {
    return `chat:material:${userId}:${studyMaterialId}`;
  }
  if (spaceId) {
    return `chat:space:${userId}:${spaceId}`;
  }
  return `chat:user:${userId}`;
};

const getChatKey = (chatId: string): string => `chat:entry:${chatId}`;

export async function saveChatToRedis(chatEntry: ChatEntry): Promise<void> {
  try {
    console.log("GOOD MORNING");

    const chatKey = getChatKey(chatEntry.id);
    const listKey = getChatListKey(
      chatEntry.userId,
      chatEntry.spaceId,
      chatEntry.studyMaterialId
    );

    // Save individual chat entry (without confidence, ragMetadata, sources)
    await redis.setex(chatKey, 3600 * 24 * 7, JSON.stringify(chatEntry)); // 7 days TTL

    // Add to user's chat list (most recent first)
    await redis.lpush(listKey, chatEntry.id);

    // Keep only last 100 chats in the list
    await redis.ltrim(listKey, 0, 99);

    // Set TTL on the list
    await redis.expire(listKey, 3600 * 24 * 7); // 7 days TTL
  } catch (error) {
    console.error("Failed to save chat to Redis:", error);
    throw error;
  }
}

export async function getChatFromRedis(
  chatId: string
): Promise<ChatEntry | null> {
  try {
    const chatKey = getChatKey(chatId);
    const chatData = await redis.get(chatKey);

    if (!chatData) {
      return null;
    }

    return JSON.parse(chatData) as ChatEntry;
  } catch (error) {
    console.error("Failed to get chat from Redis:", error);
    return null;
  }
}

export async function getChatHistoryFromRedis(
  userId: string,
  spaceId?: string,
  studyMaterialId?: string,
  limit = 50
): Promise<ChatEntry[]> {
  try {
    const listKey = getChatListKey(userId, spaceId, studyMaterialId);

    // Get chat IDs from the list
    const chatIds = await redis.lrange(listKey, 0, limit - 1);

    if (chatIds.length === 0) {
      return [];
    }

    // Get all chat entries in a batch
    const pipeline = redis.pipeline();
    chatIds.forEach((chatId) => {
      pipeline.get(getChatKey(chatId));
    });

    const results = await pipeline.exec();

    if (!results) {
      return [];
    }

    const chats: ChatEntry[] = [];
    for (const [error, result] of results) {
      if (!error && result) {
        try {
          chats.push(JSON.parse(result as string));
        } catch (parseError) {
          console.error("Failed to parse chat data:", parseError);
        }
      }
    }

    return chats;
  } catch (error) {
    console.error("Failed to get chat history from Redis:", error);
    return [];
  }
}

export async function deleteChatFromRedis(
  chatId: string,
  userId: string,
  spaceId?: string,
  studyMaterialId?: string
): Promise<void> {
  try {
    const chatKey = getChatKey(chatId);
    const listKey = getChatListKey(userId, spaceId, studyMaterialId);

    // Remove from individual storage
    await redis.del(chatKey);

    // Remove from list
    await redis.lrem(listKey, 0, chatId);
  } catch (error) {
    console.error("Failed to delete chat from Redis:", error);
    throw error;
  }
}

export async function clearChatHistoryFromRedis(
  userId: string,
  spaceId?: string,
  studyMaterialId?: string
): Promise<void> {
  try {
    const listKey = getChatListKey(userId, spaceId, studyMaterialId);

    // Get all chat IDs first
    const chatIds = await redis.lrange(listKey, 0, -1);

    // Delete all individual chat entries
    if (chatIds.length > 0) {
      const pipeline = redis.pipeline();
      chatIds.forEach((chatId) => {
        pipeline.del(getChatKey(chatId));
      });
      await pipeline.exec();
    }

    // Delete the list
    await redis.del(listKey);
  } catch (error) {
    console.error("Failed to clear chat history from Redis:", error);
    throw error;
  }
}
