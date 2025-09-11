import { NextRequest, NextResponse } from "next/server";
import prisma from "@repo/db";
import { auth } from "../../../../auth";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp?: string;
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    // Check for server-to-server authentication
    const serverAuthToken = request.headers.get("X-Server-Auth");

    let isAuthenticated = false;
    let authenticatedUserId: string | undefined = undefined;

    // Option 1: Check if it's a server-to-server call with valid token
    if (
      serverAuthToken &&
      serverAuthToken === process.env.BACKEND_API_KEY &&
      userId
    ) {
      isAuthenticated = true;
      authenticatedUserId = userId;
    }
    // Option 2: Regular user session authentication
    else {
      const session = await auth();
      if (session?.user?.id) {
        isAuthenticated = true;
        authenticatedUserId = session.user.id;
      }
    }

    // Handle unauthorized access
    if (!isAuthenticated || !authenticatedUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      spaceId,
      count = 5,
      questionType,
      examLength,
    } = body;

    // Validate that the space exists and user has access
    const space = await prisma.space.findFirst({
      where: {
        slug: spaceId,
        OR: [
          { ownerId: authenticatedUserId },
          {
            memberships: {
              some: {
                userId: authenticatedUserId,
                status: "ACTIVE",
              },
            },
          },
        ],
      },
    });

    if (!space) {
      return NextResponse.json(
        { error: "Space not found or access denied" },
        { status: 404 }
      );
    }

    // Get backend URL
    const backendUrl = process.env.BACKEND_URL;
    if (!backendUrl) {
      return NextResponse.json(
        { error: "Backend URL not configured" },
        { status: 500 }
      );
    }

    try {
      const backendResponse = await fetch(`${backendUrl}/api/exam/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.BACKEND_API_KEY}`,
          "X-User-ID": userId!,
        },
        body: JSON.stringify({
          spaceId: space.id,
          count,
          questionType,
          examLength,
        }),
      });

      if (!backendResponse.ok) {
        const errorData = await backendResponse.json().catch(() => ({}));
        console.error("Backend exam generation failed:", errorData);

        return NextResponse.json(
          {
            error: "Backend exam generation failed",
            details: errorData.error || "Unknown error",
          },
          { status: 500 }
        );
      }

      const backendResult = await backendResponse.json();

      console.log("EXAM BACKEDN RESPINSE",backendResult)

      return NextResponse.json({
        success: true,
        ...backendResult,
      });
    } catch (backendError) {
      console.error("Backend communication error:", backendError);

      return NextResponse.json(
        {
          error: "Failed to communicate with exam generation backend",
          details:
            backendError instanceof Error
              ? backendError.message
              : "Unknown error",
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Exam generation error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
