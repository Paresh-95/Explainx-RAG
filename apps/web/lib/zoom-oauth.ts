// apps/web/lib/zoom-oauth.ts
import { randomBytes } from 'crypto';
import prisma from '@repo/db';
import { 
  ZoomTokenResponse, 
  ZoomUserInfo, 
  ZoomMeetingRequest, 
  ZoomMeetingResponse,
  ZoomConnectionStatus 
} from '../types/meeting/zoom-oauth';

const ZOOM_BASE_URL = 'https://zoom.us';
const ZOOM_API_BASE_URL = 'https://api.zoom.us/v2';

export class ZoomOAuthError extends Error {
  constructor(message: string, public code?: string) {
    super(message);
    this.name = 'ZoomOAuthError';
  }
}

/**
 * Generate secure state for OAuth flow
 */
export function generateOAuthState(userId: string, spaceId?: string): string {
  return Buffer.from(
    JSON.stringify({
      userId,
      spaceId,
      timestamp: Date.now(),
      nonce: randomBytes(16).toString('hex')
    })
  ).toString('base64url');
}

/**
 * Verify and decode OAuth state
 */
export function verifyOAuthState(state: string): { userId: string; spaceId?: string } {
  try {
    const decoded = JSON.parse(Buffer.from(state, 'base64url').toString());
    
    // Check if state is not too old (10 minutes)
    if (Date.now() - decoded.timestamp > 10 * 60 * 1000) {
      throw new Error('State expired');
    }
    
    return {
      userId: decoded.userId,
      spaceId: decoded.spaceId
    };
  } catch (error) {
    throw new ZoomOAuthError('Invalid state parameter');
  }
}

/**
 * Generate Zoom OAuth authorization URL
 */
export function getZoomAuthorizationUrl(userId: string, spaceId?: string): string {
  const state = generateOAuthState(userId, spaceId);
  
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: process.env.ZOOM_CLIENT_ID!,
    redirect_uri: process.env.ZOOM_REDIRECT_URI!,
    scope: 'meeting:write user:read',
    state
  });

  return `${ZOOM_BASE_URL}/oauth/authorize?${params.toString()}`;
}

/**
 * Exchange authorization code for access tokens
 */
export async function exchangeCodeForTokens(code: string): Promise<ZoomTokenResponse> {
  const response = await fetch(`${ZOOM_BASE_URL}/oauth/token`, {
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

  if (!response.ok) {
    const error = await response.json();
    throw new ZoomOAuthError(`Token exchange failed: ${error.error_description || error.error}`);
  }

  return response.json();
}

/**
 * Refresh access token using refresh token
 */
export async function refreshZoomToken(refreshToken: string): Promise<ZoomTokenResponse> {
  const response = await fetch(`${ZOOM_BASE_URL}/oauth/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Basic ${Buffer.from(
        `${process.env.ZOOM_CLIENT_ID}:${process.env.ZOOM_CLIENT_SECRET}`
      ).toString('base64')}`
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new ZoomOAuthError(`Token refresh failed: ${error.error_description || error.error}`);
  }

  return response.json();
}

/**
 * Get user's Zoom account information
 */
export async function getZoomUserInfo(accessToken: string): Promise<ZoomUserInfo> {
  const response = await fetch(`${ZOOM_API_BASE_URL}/users/me`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  });

  if (!response.ok) {
    const error = await response.json();
    throw new ZoomOAuthError(`Failed to get user info: ${error.message}`);
  }

  return response.json();
}

/**
 * Get valid access token for user (refresh if needed)
 */
export async function getValidAccessToken(userId: string): Promise<string> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      zoomAccessToken: true,
      zoomRefreshToken: true,
      zoomTokenExpiresAt: true
    }
  });

  if (!user?.zoomAccessToken) {
    throw new ZoomOAuthError('User not connected to Zoom');
  }

  // Check if token is expired or will expire in next 5 minutes
  const now = new Date();
  const expiryBuffer = new Date(now.getTime() + 5 * 60 * 1000); // 5 minutes buffer

  if (user.zoomTokenExpiresAt && user.zoomTokenExpiresAt <= expiryBuffer) {
    if (!user.zoomRefreshToken) {
      throw new ZoomOAuthError('Token expired and no refresh token available');
    }

    // Refresh the token
    const newTokens = await refreshZoomToken(user.zoomRefreshToken);
    
    // Update user with new tokens
    await prisma.user.update({
      where: { id: userId },
      data: {
        zoomAccessToken: newTokens.access_token,
        zoomRefreshToken: newTokens.refresh_token,
        zoomTokenExpiresAt: new Date(Date.now() + newTokens.expires_in * 1000)
      }
    });

    return newTokens.access_token;
  }

  return user.zoomAccessToken;
}

/**
 * Create Zoom meeting using user's account
 */
export async function createZoomMeetingForUser(
  userId: string, 
  meetingData: ZoomMeetingRequest
): Promise<ZoomMeetingResponse> {
  const accessToken = await getValidAccessToken(userId);

  const response = await fetch(`${ZOOM_API_BASE_URL}/users/me/meetings`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(meetingData)
  });

  if (!response.ok) {
    const error = await response.json();
    throw new ZoomOAuthError(`Meeting creation failed: ${error.message}`);
  }

  return response.json();
}

/**
 * Store user's Zoom OAuth tokens
 */
export async function storeZoomTokens(
  userId: string, 
  tokens: ZoomTokenResponse, 
  userInfo: ZoomUserInfo
): Promise<void> {
  await prisma.user.update({
    where: { id: userId },
    data: {
      zoomAccessToken: tokens.access_token,
      zoomRefreshToken: tokens.refresh_token,
      zoomTokenExpiresAt: new Date(Date.now() + tokens.expires_in * 1000),
      zoomAccountId: userInfo.account_id,
      zoomConnectedAt: new Date()
    }
  });
}

/**
 * Check user's Zoom connection status
 */
export async function getZoomConnectionStatus(userId: string): Promise<ZoomConnectionStatus> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
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
    return { connected: false };
  }

  // Check if token is still valid
  const now = new Date();
  const isExpired = user.zoomTokenExpiresAt && user.zoomTokenExpiresAt <= now;

  return {
    connected: !isExpired,
    email: user.email || undefined,
    name: user.name || undefined,
    accountId: user.zoomAccountId || undefined,
    connectedAt: user.zoomConnectedAt?.toISOString()
  };
}

/**
 * Disconnect user's Zoom account
 */
export async function disconnectZoomAccount(userId: string): Promise<void> {
  await prisma.user.update({
    where: { id: userId },
    data: {
      zoomAccessToken: null,
      zoomRefreshToken: null,
      zoomTokenExpiresAt: null,
      zoomAccountId: null,
      zoomConnectedAt: null
    }
  });
}