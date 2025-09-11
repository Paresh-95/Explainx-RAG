// app/api/spaces/[spaceId]/route.ts
import { NextRequest, NextResponse } from "next/server";

import prisma from "@repo/db";
import { z } from "zod";
import { UpdateSpaceSchema } from "../../../../lib/validation";
import { auth } from "../../../../auth";

type Params = Promise<{ spaceId: string }>;

// Validation schema for spaceId parameter
const SpaceIdSchema = z.object({
  spaceId: z.string(),
});

export async function GET(
  request: NextRequest,
  segmentData: { params: Params },
) {
  try {
    const session = await auth();
    console.log(session?.user);

    if (!session?.user) {
      return NextResponse.json(
        {
          error: "Unauthorized",
          code: "UNAUTHORIZED",
        },
        { status: 401 },
      );
    }

    const params = await segmentData.params;

    // Validate spaceId parameter
    const paramValidation = SpaceIdSchema.safeParse(params);
    if (!paramValidation.success) {
      return NextResponse.json(
        {
          error: "Invalid space ID",
          code: "VALIDATION_ERROR",
          details: paramValidation.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    const { spaceId } = paramValidation.data;

    // Try to find space by ID first, then by slug
    const space = await prisma.space.findFirst({
      where: {
        OR: [{ id: spaceId }, { slug: spaceId }],
      },
      include: {
        studyMaterials: {
          orderBy: {
            createdAt: "desc",
          },
          include: {
            uploadedBy: {
              select: {
                username: true,
                name: true,
                id: true,
              },
            },
          },
        },
        owner: {
          select: {
            username: true,
            name: true,
            id: true,
          },
        },
        // Include user's membership if it exists
        memberships: {
          where: { userId: session.user.id },
          select: {
            id: true,
            status: true,
            joinedAt: true,
          },
        },
        // Count total members
        _count: {
          select: {
            memberships: true,
            studyMaterials: true,
          },
        },
      },
    });

    if (!space) {
      return NextResponse.json(
        {
          error: "Space not found",
          code: "NOT_FOUND",
        },
        { status: 404 },
      );
    }

    // Determine user's relationship to the space
    const isOwner = session.user.id === space.ownerId;
    const userMembership = space.memberships[0]; // Only one membership per user per space
    const isMember = !!userMembership;

    // Check access permissions
    const canAccess = space.isPublic || isOwner || isMember;

    if (!canAccess) {
      return NextResponse.json(
        {
          error: "Access denied. This space is private.",
          code: "ACCESS_DENIED",
        },
        { status: 403 },
      );
    }

    // Determine user's membership status in the space
    const membershipStatus = isOwner ? "OWNER" : isMember ? "MEMBER" : null;

    // Determine permissions based on membership
    const permissions = {
      canEdit: isOwner,
      canDelete: isOwner,
      canManageMembers: isOwner,
      canUpload: isOwner || isMember,
      canView: true, // If they can access, they can view
      canJoin: !isOwner && !isMember && space.isPublic,
      canLeave: isMember,
    };

    // Serialize dates in the response
    const serializedSpace = {
      ...space,
      createdAt: space.createdAt.toISOString(),
      updatedAt: space.updatedAt.toISOString(),
      studyMaterials: space.studyMaterials.map((material: { createdAt: { toISOString: () => any; }; updatedAt: { toISOString: () => any; }; }) => ({
        ...material,
        createdAt: material.createdAt.toISOString(),
        updatedAt: material.updatedAt.toISOString(),
      })),
      // Add membership-related data
      membershipStatus,
      userMembership: userMembership
        ? {
            ...userMembership,
            joinedAt: userMembership.joinedAt.toISOString(),
          }
        : null,
      permissions,
      memberCount: space._count.memberships + 1, // +1 for owner
      materialCount: space._count.studyMaterials,
    };

    return NextResponse.json(serializedSpace);
  } catch (error: any) {
    console.error("[SPACE_GET]", error);

    // Handle Prisma errors
    if (error.code === "P2025") {
      return NextResponse.json(
        {
          error: "Space not found",
          code: "NOT_FOUND",
        },
        { status: 404 },
      );
    }

    return NextResponse.json(
      {
        error: "Internal server error",
        code: "INTERNAL_ERROR",
      },
      { status: 500 },
    );
  }
}

export async function PATCH(
  request: NextRequest,
  segmentData: { params: Params },
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        {
          error: "Unauthorized",
          code: "UNAUTHORIZED",
        },
        { status: 401 },
      );
    }

    const params = await segmentData.params;

    // Validate spaceId parameter
    const paramValidation = SpaceIdSchema.safeParse(params);
    if (!paramValidation.success) {
      return NextResponse.json(
        {
          error: "Invalid space ID",
          code: "VALIDATION_ERROR",
          details: paramValidation.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    const { spaceId } = paramValidation.data;

    const body = await request.json();

    // Validate request body
    const bodyValidation = UpdateSpaceSchema.safeParse(body);
    if (!bodyValidation.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          code: "VALIDATION_ERROR",
          details: bodyValidation.error.flatten().fieldErrors,
          message:
            bodyValidation.error.errors[0]?.message || "Invalid input data",
        },
        { status: 400 },
      );
    }

    const validatedData = bodyValidation.data;

    // Check if space exists and user has permission (include membership check)
    const space = await prisma.space.findUnique({
      where: { id: spaceId },
      select: {
        id: true,
        ownerId: true,
        name: true,
      },
    });

    if (!space) {
      return NextResponse.json(
        {
          error: "Space not found",
          code: "NOT_FOUND",
        },
        { status: 404 },
      );
    }

    // Only owners can edit space details
    if (space.ownerId !== session.user.id) {
      return NextResponse.json(
        {
          error: "Access denied. You can only edit your own spaces.",
          code: "ACCESS_DENIED",
        },
        { status: 403 },
      );
    }

    // Update the space
    const updatedSpace = await prisma.space.update({
      where: { id: spaceId },
      data: {
        ...validatedData,
        updatedAt: new Date(),
      },
      include: {
        studyMaterials: true,
        owner: {
          select: {
            username: true,
            name: true,
            id: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      space: updatedSpace,
      message: "Space updated successfully",
    });
  } catch (error: any) {
    console.error("Error updating space:", error);

    // Handle Prisma errors
    if (error.code === "P2025") {
      return NextResponse.json(
        {
          error: "Space not found",
          code: "NOT_FOUND",
        },
        { status: 404 },
      );
    }

    if (error.code === "P2002") {
      return NextResponse.json(
        {
          error: "A space with this information already exists",
          code: "DUPLICATE_ERROR",
        },
        { status: 400 },
      );
    }

    return NextResponse.json(
      {
        error: "Internal server error",
        code: "INTERNAL_ERROR",
      },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: NextRequest,
  segmentData: { params: Params },
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        {
          error: "Unauthorized",
          code: "UNAUTHORIZED",
        },
        { status: 401 },
      );
    }

    const params = await segmentData.params;

    // Validate spaceId parameter
    const paramValidation = SpaceIdSchema.safeParse(params);
    if (!paramValidation.success) {
      return NextResponse.json(
        {
          error: "Invalid space ID",
          code: "VALIDATION_ERROR",
          details: paramValidation.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    const { spaceId } = paramValidation.data;

    // Check if space exists and user has permission
    const space = await prisma.space.findUnique({
      where: { id: spaceId },
      select: {
        id: true,
        ownerId: true,
        name: true,
      },
    });

    if (!space) {
      return NextResponse.json(
        {
          error: "Space not found",
          code: "NOT_FOUND",
        },
        { status: 404 },
      );
    }

    if (space.ownerId !== session.user.id) {
      return NextResponse.json(
        {
          error: "Access denied. You can only delete your own spaces.",
          code: "ACCESS_DENIED",
        },
        { status: 403 },
      );
    }

    // Delete the space (this will cascade delete study materials and memberships due to onDelete: Cascade)
    await prisma.space.delete({
      where: { id: spaceId },
    });

    return NextResponse.json({
      success: true,
      message: `Space "${space.name}" deleted successfully`,
    });
  } catch (error: any) {
    console.error("Error deleting space:", error);

    // Handle Prisma errors
    if (error.code === "P2025") {
      return NextResponse.json(
        {
          error: "Space not found",
          code: "NOT_FOUND",
        },
        { status: 404 },
      );
    }

    return NextResponse.json(
      {
        error: "Internal server error",
        code: "INTERNAL_ERROR",
      },
      { status: 500 },
    );
  }
}
