// apps/web/app/api/user/zoom/status/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '../../../../auth';
import prisma from '@repo/db';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        zoomAccessToken: true,
        zoomTokenExpiresAt: true,
        zoomAccountId: true,
        zoomConnectedAt: true,
        email: true,
        name: true
      }
    });

    if (!user?.zoomAccessToken) {
      return NextResponse.json({ connected: false });
    }

    // Check if token is still valid
    const now = new Date();
    const isExpired = user.zoomTokenExpiresAt && user.zoomTokenExpiresAt <= now;

    return NextResponse.json({
      connected: !isExpired,
      email: user.email || undefined,
      name: user.name || undefined,
      accountId: user.zoomAccountId || undefined,
      connectedAt: user.zoomConnectedAt?.toISOString()
    });

  } catch (error) {
    console.error('Error checking Zoom status:', error);
    return NextResponse.json(
      { error: 'Failed to check Zoom connection status' }, 
      { status: 500 }
    );
  }
}

// Disconnect Zoom account
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        zoomAccessToken: null,
        zoomRefreshToken: null,
        zoomTokenExpiresAt: null,
        zoomAccountId: null,
        zoomConnectedAt: null
      }
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Error disconnecting Zoom account:', error);
    return NextResponse.json(
      { error: 'Failed to disconnect Zoom account' }, 
      { status: 500 }
    );
  }
}