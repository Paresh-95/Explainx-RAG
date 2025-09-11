// api/admin/sync-chats/route.ts - Background sync endpoint
import { NextRequest, NextResponse } from "next/server";
import { syncPendingChatsToDatabase, getSyncStatus, triggerManualSync } from "../../../../lib/sync-service";

// Simple API key authentication for cron jobs
const CRON_API_KEY = process.env.CRON_API_KEY || 'your-secret-cron-key';

function authenticateCronRequest(request: NextRequest): boolean {
  const authHeader = request.headers.get('Authorization');
  const providedKey = authHeader?.replace('Bearer ', '');
  return providedKey === CRON_API_KEY;
}

// GET - Get sync status
export async function GET(request: NextRequest) {
  try {
    // Basic authentication for monitoring
    if (!authenticateCronRequest(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const status = await getSyncStatus();
    
    return NextResponse.json({
      success: true,
      status,
    });
  } catch (error) {
    console.error('Failed to get sync status:', error);
    return NextResponse.json(
      { error: 'Failed to get sync status' },
      { status: 500 }
    );
  }
}

// POST - Trigger background sync
export async function POST(request: NextRequest) {
  try {
    // Authentication for cron jobs or manual triggers
    if (!authenticateCronRequest(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const { manual = false } = body;

    let result : {
      success: boolean;
      synced?: number;
    };
    
    if (manual) {
      // Manual trigger with additional checks
      result = await triggerManualSync();
    } else {
      // Regular background sync
      result = await syncPendingChatsToDatabase();
    }

    return NextResponse.json({
      success: result.success,
      message: manual ? 'Manual sync completed' : 'Background sync completed',
      ...(result.synced !== undefined && { synced: result.synced }),
    });
  } catch (error) {
    console.error('Background sync failed:', error);
    return NextResponse.json(
      { error: 'Background sync failed' },
      { status: 500 }
    );
  }
}