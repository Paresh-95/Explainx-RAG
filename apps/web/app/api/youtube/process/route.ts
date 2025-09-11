import { NextRequest, NextResponse } from "next/server";
import prisma from "@repo/db";
import { auth } from "../../../../auth";

export async function POST(request: NextRequest) {
  try {
    // Check for server-to-server authentication
    const serverAuthToken = request.headers.get("X-Server-Auth");
    const userId = request.headers.get("X-User-ID");

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
    const { studyMaterialId, spaceId, youtubeUrl, title, description } = body;

    // Validate that the study material exists and belongs to the user
    const studyMaterial = await prisma.studyMaterial.findFirst({
      where: {
        id: studyMaterialId,
        OR: [
          { uploadedById: authenticatedUserId },
          {
            space: {
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
          },
        ],
      },
      include: {
        space: true,
      },
    });

    if (!studyMaterial) {
      return NextResponse.json(
        { error: "Study material not found or access denied" },
        { status: 404 },
      );
    }

    // Only process videos that haven't been processed yet
    if (studyMaterial.isProcessed) {
      return NextResponse.json({
        success: true,
        message: "Video already processed",
        studyMaterial,
      });
    }

    // Update status to processing
    await prisma.studyMaterial.update({
      where: { id: studyMaterialId },
      data: {
        processingStatus: "queued",
        metadata: {
          ...(studyMaterial.metadata as any),
          queuedAt: new Date().toISOString(),
        },
      },
    });

    // Prepare backend request data
    const backendRequestData = {
      studyMaterialId: studyMaterial.id,
      spaceId: spaceId || studyMaterial.spaceId,
      youtubeUrl,
      userId: authenticatedUserId,
      title: title || studyMaterial.title,
      description: description || studyMaterial.description,
    };

    // Get backend URL
    const backendUrl = process.env.BACKEND_URL || "http://localhost:8000";

    try {
      // Trigger backend processing
      const backendResponse = await fetch(
        `${backendUrl}/api/youtube/process`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.BACKEND_API_KEY}`,
            "X-User-ID": authenticatedUserId,
          },
          body: JSON.stringify(backendRequestData),
        },
      );

      if (!backendResponse.ok) {
        const errorData = await backendResponse.json().catch(() => ({}));
        console.error("Backend processing failed:", errorData);

        // Update status to failed
        await prisma.studyMaterial.update({
          where: { id: studyMaterialId },
          data: {
            processingStatus: "failed",
            metadata: {
              ...(studyMaterial.metadata as any),
              error: errorData.error || "Backend processing failed",
              failedAt: new Date().toISOString(),
            },
          },
        });

        return NextResponse.json(
          {
            error: "Backend processing failed",
            details: errorData.error || "Unknown error",
          },
          { status: 500 },
        );
      }

      const backendResult = await backendResponse.json();

      return NextResponse.json({
        success: true,
        message: "YouTube video processing started",
        studyMaterialId,
        processingJobId: backendResult.jobId || null,
        estimatedTime: backendResult.estimatedTime || "2-5 minutes",
      });
    } catch (backendError) {
      console.error("Backend communication error:", backendError);

      // Update status to failed
      await prisma.studyMaterial.update({
        where: { id: studyMaterialId },
        data: {
          processingStatus: "failed",
          metadata: {
            ...(studyMaterial.metadata as any),
            error: "Backend communication failed",
            failedAt: new Date().toISOString(),
          },
        },
      });

      return NextResponse.json(
        {
          error: "Failed to communicate with processing backend",
          details:
            backendError instanceof Error
              ? backendError.message
              : "Unknown error",
        },
        { status: 500 },
      );
    }
  } catch (error) {
    console.error("Backend trigger error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
} 