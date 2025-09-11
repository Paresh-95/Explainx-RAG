// lib/sync-service.ts
import Redis from 'ioredis';
import { batchSaveChatsToDatabase } from './db-chat';
import type { ChatEntry } from './redis-chat';
import redis from './redis-config';

// Redis key for tracking pending sync entries
const PENDING_SYNC_KEY = 'chat:pending_sync';
const SYNC_LOCK_KEY = 'chat:sync_lock';
const SYNC_LOCK_TIMEOUT = 300; // 5 minutes

// Add chat ID to pending sync queue
export async function addToPendingSync(chatId: string): Promise<void> {
  try {
    await redis.sadd(PENDING_SYNC_KEY, chatId);
  } catch (error) {
    console.error('Failed to add chat to pending sync queue:', error);
  }
}

// Remove chat ID from pending sync queue
export async function removeFromPendingSync(chatId: string): Promise<void> {
  try {
    await redis.srem(PENDING_SYNC_KEY, chatId);
  } catch (error) {
    console.error('Failed to remove chat from pending sync queue:', error);
  }
}

// Get all pending sync chat IDs
export async function getPendingSyncChatIds(): Promise<string[]> {
  try {
    return await redis.smembers(PENDING_SYNC_KEY);
  } catch (error) {
    console.error('Failed to get pending sync chat IDs:', error);
    return [];
  }
}

// Get chat entry from Redis
async function getChatEntryFromRedis(chatId: string): Promise<ChatEntry | null> {
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

// Acquire sync lock with timeout
async function acquireSyncLock(): Promise<boolean> {
  try {
    const result = await redis.set(SYNC_LOCK_KEY, '1', 'EX', SYNC_LOCK_TIMEOUT, 'NX');
    return result === 'OK';
  } catch (error) {
    console.error('Failed to acquire sync lock:', error);
    return false;
  }
}

// Release sync lock
async function releaseSyncLock(): Promise<void> {
  try {
    await redis.del(SYNC_LOCK_KEY);
  } catch (error) {
    console.error('Failed to release sync lock:', error);
  }
}

// Main sync function - syncs pending chats from Redis to database
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
    result.errors.push('Could not acquire sync lock - another sync might be in progress');
    return result;
  }

  try {
    // Get all pending chat IDs
    const pendingChatIds = await getPendingSyncChatIds();
    
    if (pendingChatIds.length === 0) {
      result.success = true;
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
        const syncedIds = chatEntries.map(entry => entry.id);
        if (syncedIds.length > 0) {
          await redis.srem(PENDING_SYNC_KEY, ...syncedIds);
        }
        
        console.log(`Successfully synced ${result.synced} chats to database`);
      } catch (error) {
        result.errors.push(`Database save failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        result.failed = chatEntries.length;
      }
    }

    // Handle failed fetches
    if (failedIds.length > 0) {
      result.failed += failedIds.length;
      result.errors.push(`Failed to fetch ${failedIds.length} chats from Redis`);
      
      // Remove failed IDs from pending queue (they're probably expired)
      await redis.srem(PENDING_SYNC_KEY, ...failedIds);
    }

    result.success = result.errors.length === 0;
    
    return result;
  } catch (error) {
    result.errors.push(`Sync process failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return result;
  } finally {
    await releaseSyncLock();
  }
}

// Background sync job that can be called by a cron job or scheduler
export async function runBackgroundSync(): Promise<void> {
  try {
    console.log('Starting background chat sync...');
    const result = await syncPendingChatsToDatabase();
    
    if (result.success) {
      console.log(`Background sync completed successfully. Synced: ${result.synced}, Failed: ${result.failed}`);
    } else {
      console.error('Background sync completed with errors:', result.errors);
    }
  } catch (error) {
    console.error('Background sync process failed:', error);
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
      redis.exists(SYNC_LOCK_KEY)
    ]);

    return {
      pendingCount,
      lockExists: lockExists === 1,
    };
  } catch (error) {
    console.error('Failed to get sync status:', error);
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
        message: 'Sync is already in progress',
      };
    }

    if (status.pendingCount === 0) {
      return {
        success: true,
        message: 'No pending chats to sync',
      };
    }

    const result = await syncPendingChatsToDatabase();
    
    return {
      success: result.success,
      message: result.success 
        ? `Successfully synced ${result.synced} chats`
        : `Sync failed: ${result.errors.join(', ')}`,
      result,
    };
  } catch (error) {
    return {
      success: false,
      message: `Manual sync failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}