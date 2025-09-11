// app/api/spaces/[slug]/leave/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "../../../../../auth";
import prisma from "@repo/db";

type Params = Promise<{ spaceId: string }>;

export async function DELETE(
  request: NextRequest,
  segmentData: { params: Params },
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      );
    }

    const { spaceId } = await segmentData.params;

    // Find the space and user's membership
    const space = await prisma.space.findFirst({
      where: {
        OR: [{ id: spaceId }, { slug: spaceId }],
      },
      include: {
        memberships: {
          where: { userId: session.user.id },
        },
      },
    });

    if (!space) {
      return NextResponse.json(
        { error: "Space not found", code: "NOT_FOUND" },
        { status: 404 },
      );
    }

    // Check if user is the owner (owners cannot leave their own space)
    if (space.ownerId === session.user.id) {
      return NextResponse.json(
        {
          error: "Space owners cannot leave their own space",
          code: "OWNER_CANNOT_LEAVE",
        },
        { status: 400 },
      );
    }

    // Check if user is a member
    if (space.memberships.length === 0) {
      return NextResponse.json(
        { error: "You are not a member of this space", code: "NOT_A_MEMBER" },
        { status: 400 },
      );
    }

    // Delete membership
    await prisma.spaceMembership.delete({
      where: {
        spaceId_userId: {
          spaceId: space.id,
          userId: session.user.id,
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: "Successfully left the space",
    });
  } catch (error) {
    console.error("Error leaving space:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
