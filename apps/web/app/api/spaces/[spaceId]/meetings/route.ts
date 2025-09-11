// apps/web/app/api/spaces/[spaceId]/meetings/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "../../../../../auth";
import prisma from "@repo/db";
import { createZoomMeetingForUser, getZoomConnectionStatus } from "../../../../../lib/zoom-oauth";
import { sendMeetingInvitations } from "../../../../../lib/zoom-meeting/email";
import { ZoomMeetingRequest } from "../../../../../types/meeting/zoom-oauth";

type Params = Promise<{ spaceId: string }>;

// GET - Get all meetings for a space
export async function GET(
  request: NextRequest,
  segmentData: { params: Params },
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const params = await segmentData.params;
    const spaceId = params.spaceId;

    // Check if user has access to the space
    const space = await prisma.space.findFirst({
      where: {
        id: spaceId,
        OR: [
          { ownerId: session.user.id },
          {
            memberships: {
              some: {
                userId: session.user.id,
                status: "ACTIVE",
              },
            },
          },
        ],
      },
      include: {
        Meeting: {
          include: {
            createdBy: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
          orderBy: {
            scheduledAt: "asc",
          },
        },
      },
    });

    if (!space) {
      return NextResponse.json({ error: "Space not found" }, { status: 404 });
    }

    return NextResponse.json({ meetings: space.Meeting });
  } catch (error) {
    console.error("Error fetching meetings:", error);
    return NextResponse.json(
      { error: "Failed to fetch meetings" },
      { status: 500 },
    );
  }
}

// POST - Create a new meeting
export async function POST(
  request: NextRequest,
  segmentData: { params: Params },
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const params = await segmentData.params;
    const spaceId = params.spaceId;
    const { title, description, scheduledAt, duration } = await request.json();

    // Validate required fields
    if (!title || !scheduledAt) {
      return NextResponse.json(
        { error: "Title and scheduled time are required" },
        { status: 400 },
      );
    }

    // Check if user owns the space (only space owners can create meetings)
    const space = await prisma.space.findFirst({
      where: {
        id: spaceId,
        ownerId: session.user.id, // Only space owners can create meetings
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        memberships: {
          where: {
            status: "ACTIVE",
          },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    if (!space) {
      return NextResponse.json(
        { error: "Space not found or you don't have permission to create meetings" },
        { status: 404 },
      );
    }

    // Check if user has Zoom connected
    const zoomStatus = await getZoomConnectionStatus(session.user.id);
    if (!zoomStatus.connected) {
      return NextResponse.json(
        { 
          error: "Zoom account not connected", 
          requiresAuth: true,
          authUrl: `/api/oauth/authorize?spaceId=${spaceId}`
        },
        { status: 400 },
      );
    }

    // Get space members for meeting access control
    const allMembers = [
      space.owner,
      ...space.memberships.map((m) => m.user),
    ].filter(
      (user, index, self) => index === self.findIndex((u) => u.id === user.id),
    );

    // Prepare member emails for registration
    const memberEmails = allMembers
      .filter(member => member.email)
      .map(member => member.email!);

    // Create Zoom meeting data with enhanced security settings
    const zoomMeetingData: ZoomMeetingRequest = {
      topic: title,
      type: 2, // Scheduled meeting
      start_time: new Date(scheduledAt).toISOString(),
      duration: duration || 60,
      agenda: description || "",
      settings: {
        host_video: true,
        participant_video: true,
        join_before_host: false,
        mute_upon_entry: true,
        waiting_room: true, // Enable waiting room for control
        auto_recording: "cloud",
        approval_type: 1, // Manual approval required
        registration_type: 2, // Attendees register once and can attend any occurrence
        meeting_authentication: false, // Set to true if you want to require Zoom account
        registrants_confirmation_email: true,
        registrants_email_notification: true,
        // Restrict to specific domains if needed
        // enforce_login: true,
        // enforce_login_domains: "yourdomain.com",
      },
    };

    // Create meeting using space owner's Zoom account
    const zoomMeeting = await createZoomMeetingForUser(session.user.id, zoomMeetingData);

    // Save meeting to database
    const meeting = await prisma.meeting.create({
      data: {
        spaceId,
        title,
        description,
        zoomMeetingId: zoomMeeting.id.toString(),
        zoomJoinUrl: zoomMeeting.join_url,
        zoomStartUrl: zoomMeeting.start_url,
        zoomPassword: zoomMeeting.password,
        scheduledAt: new Date(scheduledAt),
        duration: duration || 60,
        createdById: session.user.id,
      },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // Send email invitations to all space members
    await sendMeetingInvitations({
      members: allMembers,
      meetingDetails: { 
        title, 
        description, 
        scheduledAt, 
        duration: duration || 60 
      },
      space: { name: space.name },
      sessionUser: { 
        name: session.user.name, 
        email: session.user.email 
      },
      zoomMeeting: {
        id: zoomMeeting.id,
        join_url: zoomMeeting.join_url,
        password: zoomMeeting.password
      },
    });

    return NextResponse.json({ 
      meeting,
      zoomConnected: true 
    });

  } catch (error) {
    console.error("Error creating meeting:", error);
    
    // Handle specific Zoom OAuth errors
    if ((error as any).name === 'ZoomOAuthError') {
      return NextResponse.json(
        { 
          error: (error as any).message,
          requiresAuth: (error as any).message.includes('not connected')
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to create meeting" },
      { status: 500 },
    );
  }
}