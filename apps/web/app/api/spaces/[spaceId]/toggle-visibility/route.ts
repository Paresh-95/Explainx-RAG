import { NextRequest, NextResponse } from "next/server";
import prisma from "@repo/db";
import { auth } from "../../../../../auth";

type Params = Promise<{ spaceId: string }>;

export async function PATCH(
  request: NextRequest,

  segmentData: { params: Params },
) {
  try {
    // Get the authenticated user session
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { params } = segmentData;
    const { spaceId } = await params;
    const { isPublic } = await request.json();

    // Validate input
    if (typeof isPublic !== "boolean") {
      return NextResponse.json(
        { error: "isPublic must be a boolean value" },
        { status: 400 },
      );
    }

    // First, check if the space exists and get current state
    const space = await prisma.space.findUnique({
      where: { id: spaceId },
      include: {
        memberships: {
          where: {
            userId: session.user.id,
            status: "ACTIVE",
          },
        },
      },
    });

    if (!space) {
      return NextResponse.json({ error: "Space not found" }, { status: 404 });
    }

    // Check if user is the owner or admin
    const isOwner = space.ownerId === session.user.id;
    const isAdmin = space.memberships.some(
      (membership) => membership.role === "ADMIN",
    );

    if (!isOwner && !isAdmin) {
      return NextResponse.json(
        {
          error:
            "Insufficient permissions. Only space owners and admins can toggle visibility.",
        },
        { status: 403 },
      );
    }

    // Determine the new visibility state
    const newVisibility = isPublic ? "PUBLIC" : "PRIVATE";

    // Use a transaction to update both space and study materials atomically
    const result = await prisma.$transaction(async (tx) => {
      // Update the space visibility
      const updatedSpace = await tx.space.update({
        where: { id: spaceId },
        data: {
          isPublic,
          visibility: newVisibility,
        },
      });

      // Update study materials that belong to the space owner
      const updatedStudyMaterials = await tx.studyMaterial.updateMany({
        where: {
          spaceId: spaceId,
          uploadedById: space.ownerId, // Only update materials uploaded by the space owner
        },
        data: {
          isPublic,
        },
      });

      return {
        space: updatedSpace,
        updatedMaterialsCount: updatedStudyMaterials.count,
      };
    });

    // Return success response with updated data
    return NextResponse.json({
      success: true,
      message: `Space visibility updated to ${isPublic ? "public" : "private"}`,
      data: {
        space: {
          id: result.space.id,
          name: result.space.name,
          isPublic: result.space.isPublic,
          visibility: result.space.visibility,
        },
        updatedStudyMaterials: result.updatedMaterialsCount,
      },
    });
  } catch (error) {
    console.error("Error toggling space visibility:", error);

    return NextResponse.json(
      {
        error: "Internal server error",
        message: "Failed to update space visibility",
      },
      { status: 500 },
    );
  }
}

// Optional: Add GET method to check current visibility status
export async function GET(
  request: NextRequest,
  segmentData: { params: Params },
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { params } = segmentData;
    const { spaceId } = await params;

    const space = await prisma.space.findUnique({
      where: { id: spaceId },
      select: {
        id: true,
        name: true,
        isPublic: true,
        visibility: true,
        ownerId: true,
        memberships: {
          where: {
            userId: session.user.id,
            status: "ACTIVE",
          },
          select: {
            role: true,
          },
        },
      },
    });

    if (!space) {
      return NextResponse.json({ error: "Space not found" }, { status: 404 });
    }

    // Check if user has access to view this information
    const isOwner = space.ownerId === session.user.id;
    const isAdmin = space.memberships.some(
      (membership) => membership.role === "ADMIN",
    );
    const isMember = space.memberships.length > 0;

    if (!isOwner && !isAdmin && !isMember && !space.isPublic) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    return NextResponse.json({
      space: {
        id: space.id,
        name: space.name,
        isPublic: space.isPublic,
        visibility: space.visibility,
        canToggleVisibility: isOwner || isAdmin,
      },
    });
  } catch (error) {
    console.error("Error fetching space visibility:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
