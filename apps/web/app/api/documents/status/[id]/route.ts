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
    // Await the params to get the id
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

    console.log(studyMaterial);
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