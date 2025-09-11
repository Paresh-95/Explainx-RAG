import { NextRequest, NextResponse } from "next/server";
import { auth } from "../../../../../auth";
import prisma from "@repo/db";

type Params = Promise<{ id: string }>;

export async function GET(
  request: NextRequest,
  segmentData: { params: Params }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const params = await segmentData.params;
    const { id: studyMaterialId } = params;
    
    if (!studyMaterialId) {
      return NextResponse.json(
        { error: "Study material ID is required" },
        { status: 400 }
      );
    }

    // Get the study material and check permissions
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
        { status: 404 }
      );
    }

    // If the video is still being processed, check with the backend
    if (studyMaterial.processingStatus === "processing" || studyMaterial.processingStatus === "queued") {
      try {
        const backendUrl = process.env.BACKEND_URL || "http://localhost:8000";
        const backendResponse = await fetch(
          `${backendUrl}/api/youtube/status/${studyMaterialId}`,
          {
            headers: {
              Authorization: `Bearer ${process.env.BACKEND_API_KEY}`,
              "X-User-ID": session.user.id,
            },
          }
        );

        if (backendResponse.ok) {
          const backendStatus = await backendResponse.json();
          if (backendStatus.success && backendStatus.status) {
            // Update local status if it's different
            if (
              backendStatus.status.isProcessed !== studyMaterial.isProcessed ||
              backendStatus.status.processingStatus !== studyMaterial.processingStatus
            ) {
              await prisma.studyMaterial.update({
                where: { id: studyMaterialId },
                data: {
                  isProcessed: backendStatus.status.isProcessed,
                  processingStatus: backendStatus.status.processingStatus,
                  metadata: {
                    ...(studyMaterial.metadata as any),
                    ...backendStatus.status.metadata,
                  },
                },
              });

              // Update the local status object
              studyMaterial.isProcessed = backendStatus.status.isProcessed;
              studyMaterial.processingStatus = backendStatus.status.processingStatus;
              studyMaterial.metadata = {
                ...(studyMaterial.metadata as any),
                ...backendStatus.status.metadata,
              };
            }
          }
        }
      } catch (error) {
        console.error("Error checking backend status:", error);
        // Continue with local status if backend check fails
      }
    }

    return NextResponse.json({
      success: true,
      status: {
        isProcessed: studyMaterial.isProcessed,
        processingStatus: studyMaterial.processingStatus || "pending",
        metadata: studyMaterial.metadata,
        lastUpdated: studyMaterial.updatedAt,
      },
    });
  } catch (error) {
    console.error("Error checking study material status:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 