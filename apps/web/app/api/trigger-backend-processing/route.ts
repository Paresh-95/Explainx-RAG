// app/api/trigger-backend-processing/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@repo/db";
import { auth } from "../../../auth";

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
    const { studyMaterialId, spaceId } = body;

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

    // Only process files that haven't been processed yet
    if (studyMaterial.isProcessed) {
      return NextResponse.json({
        success: true,
        message: "Document already processed",
        studyMaterial,
      });
    }

    // Only process PDF and DOC files
    if (
      !["PDF_DOCUMENT", "DOC_DOCUMENT", "AUDIO_RECORDING"].includes(
        studyMaterial.type,
      )
    ) {
      return NextResponse.json(
        { error: "File type not supported for processing" },
        { status: 400 },
      );
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

    // Extract S3 key from fileUrl
    const fileUrl = studyMaterial.fileUrl;
    if (!fileUrl) {
      return NextResponse.json({ error: "No file URL found" }, { status: 400 });
    }

    // Parse S3 key from URL
    // URL format: https://bucket-name.s3.region.amazonaws.com/key
    const urlParts = fileUrl.split("/");
    const fileKey = urlParts.slice(3).join("/"); // Everything after the domain

    // Prepare backend request data
    const backendRequestData = {
      studyMaterialId: studyMaterial.id,
      spaceId: spaceId || studyMaterial.spaceId,
      fileKey,
      s3Bucket: process.env.AWS_BUCKET_NAME,
      fileName: studyMaterial.fileName,
      fileSize: studyMaterial.fileSize,
      mimeType: studyMaterial.mimeType,
      userId: userId,
      title: studyMaterial.title,
      description: studyMaterial.description,
    };

    // Get backend URL
    const backendUrl = process.env.BACKEND_URL || "http://localhost:8000";

    try {
      // Trigger backend processing
      const backendResponse = await fetch(
        `${backendUrl}/api/documents/process`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.BACKEND_API_KEY}`,
            "X-User-ID": userId!,
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
        message: "Document processing started",
        studyMaterialId,
        processingJobId: backendResult.jobId || null,
        estimatedTime: backendResult.estimatedTime || "5-10 minutes",
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

// GET endpoint to check processing status
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const studyMaterialId = searchParams.get("studyMaterialId");

    if (!studyMaterialId) {
      return NextResponse.json(
        { error: "studyMaterialId is required" },
        { status: 400 },
      );
    }

    // Get processing status
    const studyMaterial = await prisma.studyMaterial.findFirst({
      where: {
        id: studyMaterialId,
        OR: [
          { uploadedById: session.user.id },
          {
            space: {
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
          },
        ],
      },
      select: {
        id: true,
        title: true,
        isProcessed: true,
        processingStatus: true,
        metadata: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!studyMaterial) {
      return NextResponse.json(
        { error: "Study material not found or access denied" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      studyMaterial,
    });
  } catch (error) {
    console.error("Status check error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
