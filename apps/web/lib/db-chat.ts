// lib/db-chat.ts

import  prisma  from '@repo/db';
import type { ChatEntry } from './redis-chat';

export async function saveChatToDatabase(chatEntry: ChatEntry): Promise<void> {
  try {
    await prisma.chat.create({
      data: {
        id: chatEntry.id,
        spaceId: chatEntry.spaceId,
        userId: chatEntry.userId,
        chatType: chatEntry.chatType,
        studyMaterialId: chatEntry.studyMaterialId,
        studyMaterialIds: chatEntry.studyMaterialIds || [],
        query: chatEntry.query,
        response: chatEntry.response,
        createdAt: new Date(chatEntry.createdAt),
        updatedAt: new Date(chatEntry.updatedAt),
      },
    });
  } catch (error) {
    console.error('Failed to save chat to database:', error);
    throw error;
  }
}

export async function getChatFromDatabase(chatId: string): Promise<ChatEntry | null> {
  try {
    const chat = await prisma.chat.findUnique({
      where: { id: chatId },
    });

    if (!chat) {
      return null;
    }

    return {
      id: chat.id,
      spaceId: chat.spaceId || undefined,
      userId: chat.userId,
      chatType: chat.chatType as 'MATERIAL' | 'SPACE',
      studyMaterialId: chat.studyMaterialId || undefined,
      studyMaterialIds: chat.studyMaterialIds,
      query: chat.query,
      response: chat.response,
      createdAt: chat.createdAt.toISOString(),
      updatedAt: chat.updatedAt.toISOString(),
    };
  } catch (error) {
    console.error('Failed to get chat from database:', error);
    return null;
  }
}

export async function getChatHistoryFromDatabase(
  userId: string,
  spaceId?: string,
  studyMaterialId?: string,
  limit = 50,
  offset = 0
): Promise<ChatEntry[]> {
  try {
    const whereClause: any = {
      userId,
    };

    if (studyMaterialId) {
      whereClause.studyMaterialId = studyMaterialId;
    } else if (spaceId) {
      whereClause.spaceId = spaceId;
    }

    const chats = await prisma.chat.findMany({
      where: whereClause,
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
      skip: offset,
    });

    return chats.map(chat => ({
      id: chat.id,
      spaceId: chat.spaceId || undefined,
      userId: chat.userId,
      chatType: chat.chatType as 'MATERIAL' | 'SPACE',
      studyMaterialId: chat.studyMaterialId || undefined,
      studyMaterialIds: chat.studyMaterialIds,
      query: chat.query,
      response: chat.response,
      createdAt: chat.createdAt.toISOString(),
      updatedAt: chat.updatedAt.toISOString(),
    }));
  } catch (error) {
    console.error('Failed to get chat history from database:', error);
    return [];
  }
}

export async function deleteChatFromDatabase(chatId: string): Promise<void> {
  try {
    await prisma.chat.delete({
      where: { id: chatId },
    });
  } catch (error) {
    console.error('Failed to delete chat from database:', error);
    throw error;
  }
}

export async function batchSaveChatsToDatabase(chatEntries: ChatEntry[]): Promise<void> {
  try {
    // Use createMany for batch insert
    await prisma.chat.createMany({
      data: chatEntries.map(chatEntry => ({
        id: chatEntry.id,
        spaceId: chatEntry.spaceId,
        userId: chatEntry.userId,
        chatType: chatEntry.chatType,
        studyMaterialId: chatEntry.studyMaterialId,
        studyMaterialIds: chatEntry.studyMaterialIds || [],
        query: chatEntry.query,
        response: chatEntry.response,
        createdAt: new Date(chatEntry.createdAt),
        updatedAt: new Date(chatEntry.updatedAt),
      })),
      skipDuplicates: true, // Skip if ID already exists
    });
  } catch (error) {
    console.error('Failed to batch save chats to database:', error);
    throw error;
  }
}

export async function syncChatsFromDatabaseToRedis(
  userId: string,
  spaceId?: string,
  studyMaterialId?: string,
  limit = 50
): Promise<ChatEntry[]> {
  try {
    const chats = await getChatHistoryFromDatabase(userId, spaceId, studyMaterialId, limit);
    
    // Import the Redis functions dynamically to avoid circular dependencies
    const { saveChatToRedis } = await import('./redis-chat');
    
    // Save each chat to Redis
    for (const chat of chats) {
      await saveChatToRedis(chat);
    }
    
    return chats;
  } catch (error) {
    console.error('Failed to sync chats from database to Redis:', error);
    return [];
  }
}