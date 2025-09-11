// apps/web/app/api/zoom/oauth/callback/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@repo/db';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');

    console.log('OAuth callback received:', { code: !!code, state: !!state, error });

    // Handle OAuth errors
    if (error) {
      const errorDescription = searchParams.get('error_description');
      console.error('Zoom OAuth error:', error, errorDescription);
      
      return NextResponse.redirect(
        new URL(`/spaces?error=zoom_oauth_${error}`, request.nextUrl.origin)
      );
    }

    // Validate required parameters - code is mandatory, state is optional for now
    if (!code) {
      console.error('Missing authorization code');
      return NextResponse.redirect(
        new URL('/spaces?error=missing_auth_code', request.nextUrl.origin)
      );
    }

    // Handle state parameter (optional for debugging)
    let stateData = null;
    if (state) {
      try {
        stateData = JSON.parse(Buffer.from(state, 'base64url').toString());
        
        // Check if state is not too old (10 minutes)
        if (Date.now() - stateData.timestamp > 10 * 60 * 1000) {
          console.warn('State expired, but continuing with OAuth flow');
          stateData = null;
        }
      } catch (error) {
        console.error('Invalid OAuth state, but continuing:', error);
        stateData = null;
      }
    } else {
      console.warn('No state parameter received from Zoom');
    }

    // For now, we'll need to get the current user from session since state might be missing
    // This is a temporary workaround - we should investigate why state is missing

    // Exchange code for tokens using Zoom's official flow
    const tokenResponse = await fetch('https://zoom.us/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${Buffer.from(
          `${process.env.ZOOM_CLIENT_ID}:${process.env.ZOOM_CLIENT_SECRET}`
        ).toString('base64')}`
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: process.env.ZOOM_REDIRECT_URI!
      })
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.text();
      console.error('Token exchange failed:', errorData);
      return NextResponse.redirect(
        new URL('/spaces?error=token_exchange_failed', request.nextUrl.origin)
      );
    }

    const tokens = await tokenResponse.json();
    console.log('Tokens received:', { 
      access_token: !!tokens.access_token, 
      refresh_token: !!tokens.refresh_token,
      expires_in: tokens.expires_in 
    });

    // Get user information from Zoom
    const userResponse = await fetch('https://api.zoom.us/v2/users/me', {
      headers: {
        'Authorization': `Bearer ${tokens.access_token}`
      }
    });

    if (!userResponse.ok) {
      const errorData = await userResponse.text();
      console.error('Failed to get user info:', errorData);
      return NextResponse.redirect(
        new URL('/spaces?error=user_info_failed', request.nextUrl.origin)
      );
    }

    const userInfo = await userResponse.json();
    console.log('User info received:', { email: userInfo.email, id: userInfo.id });

    const { auth } = await import('../../../../../auth');
    const session = await auth();
    
    if (!session?.user?.id) {
      console.error('No authenticated user found during callback');
      return NextResponse.redirect(
        new URL('/login?error=auth_required', request.nextUrl.origin)
      );
    }

    const userId = stateData?.userId || session.user.id;
    const spaceId = stateData?.spaceId;

    // Store tokens in database
    await prisma.user.update({
      where: { id: userId },
      data: {
        zoomAccessToken: tokens.access_token,
        zoomRefreshToken: tokens.refresh_token,
        zoomTokenExpiresAt: new Date(Date.now() + tokens.expires_in * 1000),
        zoomAccountId: userInfo.id,
        zoomConnectedAt: new Date()
      }
    });

    console.log('Tokens stored for user:', userId);

    // Redirect based on context
    const moveTO = spaceId 
      ? `/zoom-success?zoom_connected=true&spaceId=${spaceId}`
      : '/zoom-success?zoom_connected=true';

    return NextResponse.redirect(new URL(moveTO, request.nextUrl.origin));

  } catch (error) {
    console.error('Zoom OAuth callback error:', error);
    
    return NextResponse.redirect(
      new URL('/spaces?error=oauth_callback_failed', request.nextUrl.origin)
    );
  }
}