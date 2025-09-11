// apps/web/app/api/zoom/oauth/callback/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { 
  verifyOAuthState, 
  exchangeCodeForTokens, 
  getZoomUserInfo, 
  storeZoomTokens,
  ZoomOAuthError 
} from '../../../../lib/zoom-oauth';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');

    // Handle OAuth errors
    if (error) {
      const errorDescription = searchParams.get('error_description');
      console.error('Zoom OAuth error:', error, errorDescription);
      
      return NextResponse.redirect(
        new URL(`/spaces?error=zoom_oauth_${error}`, request.nextUrl.origin)
      );
    }

    // Validate required parameters
    if (!code || !state) {
      return NextResponse.redirect(
        new URL('/spaces?error=missing_oauth_params', request.nextUrl.origin)
      );
    }

    // Verify state and extract user information
    let stateData;
    try {
      stateData = verifyOAuthState(state);
    } catch (error) {
      console.error('Invalid OAuth state:', error);
      return NextResponse.redirect(
        new URL('/spaces?error=invalid_oauth_state', request.nextUrl.origin)
      );
    }

    // Exchange code for tokens
    const tokens = await exchangeCodeForTokens(code);

    // Get user information from Zoom
    const userInfo = await getZoomUserInfo(tokens.access_token);

    // Store tokens in database
    await storeZoomTokens(stateData.userId, tokens, userInfo);

    // Redirect based on context
    const redirectUrl = stateData.spaceId 
      ? `/zoom-success?zoom_connected=true&spaceId=${stateData.spaceId}`
      : '/zoom-success?zoom_connected=true';

    return NextResponse.redirect(new URL(redirectUrl, request.nextUrl.origin));

  } catch (error) {
    console.error('Zoom OAuth callback error:', error);
    
    const errorMessage = error instanceof ZoomOAuthError 
      ? error.message 
      : 'Unknown OAuth error';

    return NextResponse.redirect(
      new URL(`/spaces?error=${encodeURIComponent(errorMessage)}`, request.nextUrl.origin)
    );
  }
}