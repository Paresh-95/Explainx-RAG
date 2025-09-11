// apps/web/app/api/zoom/oauth/authorize/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '../../../../../auth';
import { randomBytes } from 'crypto';

export async function POST(request: NextRequest) {
  try {
    // Check if user is authenticated
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if environment variables are set
    if (!process.env.ZOOM_CLIENT_ID || !process.env.ZOOM_REDIRECT_URI) {
      console.error('Missing Zoom environment variables');
      return NextResponse.json(
        { error: 'Zoom configuration missing' }, 
        { status: 500 }
      );
    }

    const { spaceId, returnUrl } = await request.json().catch(() => ({}));

    // Generate state parameter for security
    const state = Buffer.from(JSON.stringify({
      userId: session.user.id,
      spaceId: spaceId || null,
      returnUrl: returnUrl || null,
      timestamp: Date.now(),
      nonce: randomBytes(16).toString('hex')
    })).toString('base64url');

    // Construct Zoom OAuth URL exactly as per documentation
    const authUrl = `https://zoom.us/oauth/authorize?` +
      `response_type=code&` +
      `client_id=${process.env.ZOOM_CLIENT_ID}&` +
      `redirect_uri=${encodeURIComponent(process.env.ZOOM_REDIRECT_URI)}`;

    console.log('Generated auth URL:', authUrl);
    

    return NextResponse.json({ authUrl });

  } catch (error) {
    console.error('Zoom OAuth authorization error:', error);
    return NextResponse.json(
      { error: 'Failed to generate authorization URL' }, 
      { status: 500 }
    );
  }
}

// Also support GET requests for direct browser navigation
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      // Redirect to login first
      const loginUrl = new URL('/login', request.nextUrl.origin);
      loginUrl.searchParams.set('next', request.url);
      return NextResponse.redirect(loginUrl);
    }

    if (!process.env.ZOOM_CLIENT_ID || !process.env.ZOOM_REDIRECT_URI) {
      console.error('Missing Zoom environment variables');
      return NextResponse.json(
        { error: 'Zoom configuration missing' }, 
        { status: 500 }
      );
    }

    // Get spaceId from query params
    const searchParams = request.nextUrl.searchParams;
    const spaceId = searchParams.get('spaceId');

    // Generate state parameter
    const state = Buffer.from(JSON.stringify({
      userId: session.user.id,
      spaceId: spaceId || null,
      returnUrl: spaceId ? request.url : null,
      timestamp: Date.now(),
      nonce: randomBytes(16).toString('hex')
    })).toString('base64url');

    // Redirect directly to Zoom OAuth
    const authUrl = `https://zoom.us/oauth/authorize?` +
      `response_type=code&` +
      `client_id=${process.env.ZOOM_CLIENT_ID}&` +
      `redirect_uri=${encodeURIComponent(process.env.ZOOM_REDIRECT_URI)}`;



    return NextResponse.redirect(authUrl);

  } catch (error) {
    console.error('Zoom OAuth authorization error:', error);
    return NextResponse.redirect(
      new URL('/dashboard', request.nextUrl.origin)
    );
  }
}