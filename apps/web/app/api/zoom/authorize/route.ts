// apps/web/app/api/zoom/oauth/authorize/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '../../../../auth';
import { getZoomAuthorizationUrl } from '../../../../lib/zoom-oauth';

export async function GET(request: NextRequest) {
  try {
    // Check if user is authenticated
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get optional spaceId from query params
    const searchParams = request.nextUrl.searchParams;
    const spaceId = searchParams.get('spaceId');

    // Generate authorization URL
    const authUrl = getZoomAuthorizationUrl(session.user.id, spaceId || undefined);

    // Redirect to Zoom OAuth
    return NextResponse.redirect(authUrl);

  } catch (error) {
    console.error('Zoom OAuth authorization error:', error);
    return NextResponse.json(
      { error: 'Failed to initiate Zoom authorization' }, 
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check if user is authenticated
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { spaceId } = await request.json();

    // Generate authorization URL
    const authUrl = getZoomAuthorizationUrl(session.user.id, spaceId);

    return NextResponse.json({ authUrl });

  } catch (error) {
    console.error('Zoom OAuth authorization error:', error);
    return NextResponse.json(
      { error: 'Failed to generate authorization URL' }, 
      { status: 500 }
    );
  }
}