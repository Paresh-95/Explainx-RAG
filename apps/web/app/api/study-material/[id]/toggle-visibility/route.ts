// File: /api/study-material/[id]/toggle-visibility/route.ts

import { NextRequest, NextResponse } from "next/server";
import { auth } from "../../../../../auth";
import prisma from "@repo/db";

type Params = Promise<{ id: string }>;

export async function PATCH(
  request: NextRequest,
  segementData: { params: Params },
) {
  try {
    // Get the authenticated user session
    const session = await auth();
    const { params } = segementData;

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const { isPublic } = await request.json();

    // Validate input
    if (typeof isPublic !== "boolean") {
      return NextResponse.json(
        { error: "isPublic must be a boolean value" },
        { status: 400 },
      );
    }

    // First, check if the study material exists and get space membership info
    const studyMaterial = await prisma.studyMaterial.findUnique({
      where: { id },
      include: {
        space: {
          select: {
            id: true,
            name: true,
            isPublic: true,
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
        },
      },
    });

    if (!studyMaterial) {
      return NextResponse.json(
        { error: "Study material not found" },
        { status: 404 },
      );
    }

    // Check if the user is the uploader of this study material
    if (studyMaterial.uploadedById !== session.user.id) {
      return NextResponse.json(
        {
          error:
            "Forbidden. You can only modify study materials that you uploaded.",
        },
        { status: 403 },
      );
    }

    if (!studyMaterial.space) {
      return NextResponse.json(
        {
          error: "Study material not found in space.",
        },
        { status: 404 },
      );
    }

    // Check user's role in the space
    const isSpaceOwner = studyMaterial.space.ownerId === session.user.id;

    // If user is trying to make material public, check permissions
    if (isPublic) {
      // Only space owners can make materials public
      if (!isSpaceOwner) {
        return NextResponse.json(
          {
            error:
              "Forbidden. Only space owners can make study materials public.",
          },
          { status: 403 },
        );
      }
    }

    // Update the study material visibility
    const updatedStudyMaterial = await prisma.studyMaterial.update({
      where: { id },
      data: { isPublic },
      select: {
        id: true,
        title: true,
        isPublic: true,
        type: true,
        space: {
          select: {
            id: true,
            name: true,
            isPublic: true,
          },
        },
      },
    });

    // Return success response
    return NextResponse.json({
      success: true,
      message: `Study material visibility updated to ${isPublic ? "public" : "private"}`,
      data: {
        studyMaterial: updatedStudyMaterial,
      },
    });
  } catch (error) {
    console.error("Error toggling study material visibility:", error);

    return NextResponse.json(
      {
        error: "Internal server error",
        message: "Failed to update study material visibility",
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

    const params = segmentData.params;
    const { id } = await params;

    const studyMaterial = await prisma.studyMaterial.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        isPublic: true,
        type: true,
        uploadedById: true,
        space: {
          select: {
            id: true,
            name: true,
            isPublic: true,
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
        },
      },
    });

    if (!studyMaterial) {
      return NextResponse.json(
        { error: "Study material not found" },
        { status: 404 },
      );
    }

    if (!studyMaterial.space) {
      return NextResponse.json(
        {
          error: "Study material not found in space",
        },
        { status: 404 },
      );
    }

    // Check if user can view this study material
    const isOwner = studyMaterial.uploadedById === session.user.id;
    const isPublicMaterial = studyMaterial.isPublic;
    const isPublicSpace = studyMaterial.space.isPublic;

    if (!isOwner && !isPublicMaterial && !isPublicSpace) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Determine if user can toggle visibility to public
    const isSpaceOwner = studyMaterial.space.ownerId === session.user.id;
    const userMembership = studyMaterial.space.memberships[0];

    // Only space owners can make materials public
    const canMakePublic = isOwner && isSpaceOwner;
    // Anyone who owns the material can make it private
    const canMakePrivate = isOwner;

    return NextResponse.json({
      studyMaterial: {
        id: studyMaterial.id,
        title: studyMaterial.title,
        isPublic: studyMaterial.isPublic,
        type: studyMaterial.type,
        canToggleVisibility: isOwner,
        canMakePublic: canMakePublic,
        canMakePrivate: canMakePrivate,
        space: studyMaterial.space,
        isSpaceOwner: isSpaceOwner,
      },
    });
  } catch (error) {
    console.error("Error fetching study material visibility:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
