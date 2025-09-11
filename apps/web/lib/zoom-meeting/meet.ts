// apps/web/lib/zoom-meeting/meet.ts
import { createZoomMeetingForUser } from '../zoom-oauth';
import { ZoomMeetingRequest } from '../../types/meeting/zoom-oauth';

// Keep this for backward compatibility or remove if not needed
export async function getZoomAccessToken() {
  console.warn('getZoomAccessToken is deprecated. Use user-level OAuth instead.');
  throw new Error('Server-to-Server OAuth is deprecated. Please use user-level OAuth.');
}

// Updated function that uses user's personal Zoom account
export async function createZoomMeeting(userId: string, meetingData: ZoomMeetingRequest) {
  return createZoomMeetingForUser(userId, meetingData);
}

// Enhanced meeting creation with space member restrictions
export async function createSecureZoomMeeting(
  userId: string, 
  meetingData: ZoomMeetingRequest,
  spaceMemberEmails: string[] = []
) {
  // Enhanced security settings for space-restricted meetings
  const secureSettings = {
    ...meetingData.settings,
    waiting_room: true,
    approval_type: 1, // Manual approval
    registration_type: 2, // Register once, attend any occurrence
    meeting_authentication: false, // Can be enabled for additional security
    registrants_confirmation_email: true,
    registrants_email_notification: true,
    // Add more restrictions as needed
  };

  const secureRequest: ZoomMeetingRequest = {
    ...meetingData,
    settings: secureSettings
  };

  const meeting = await createZoomMeetingForUser(userId, secureRequest);

  // TODO: If you want to pre-register space members, you can add logic here
  // This would require additional API calls to register each member
  // For now, we rely on waiting room and manual approval

  return meeting;
}