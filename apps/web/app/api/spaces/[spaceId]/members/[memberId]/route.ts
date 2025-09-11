import { NextRequest, NextResponse } from "next/server";
import { auth } from "../../../../../../auth";
import prisma from "@repo/db";
type MemberParams = Promise<{ spaceId: string; memberId: string }>;

// Update member role (only for owners and admins)
// PATCH method removed - no longer needed without role system

// Remove member from space (only for owners)
export async function DELETE(
  request: NextRequest,
  { params }: { params: MemberParams },
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required", code: "UNAUTHORIZED" },
        { status: 401 },
      );
    }

    const { spaceId, memberId } = await params;

    // Find the space and check permissions
    const space = await prisma.space.findFirst({
      where: {
        OR: [{ id: spaceId }, { slug: spaceId }],
      },
      include: {
        memberships: {
          where: {
            OR: [{ userId: session.user.id }, { id: memberId }],
          },
        },
      },
    });

    if (!space) {
      return NextResponse.json(
        { error: "Space not found", code: "NOT_FOUND" },
        { status: 404 },
      );
    }

    // Check if user is owner - only owners can remove members
    const isOwner = space.ownerId === session.user.id;

    if (!isOwner) {
      return NextResponse.json(
        { error: "Only space owners can remove members", code: "ACCESS_DENIED" },
        { status: 403 },
      );
    }

    // Find the target membership
    const targetMembership = space.memberships.find((m) => m.id === memberId);
    if (!targetMembership) {
      return NextResponse.json(
        { error: "Member not found", code: "NOT_FOUND" },
        { status: 404 },
      );
    }

    // Delete the membership
    await prisma.spaceMembership.delete({
      where: { id: memberId },
    });

    return NextResponse.json({
      success: true,
      message: "Member removed successfully",
    });
  } catch (error: any) {
    console.error("Error removing member:", error);
    return NextResponse.json(
      { error: "Internal server error", code: "INTERNAL_ERROR" },
      { status: 500 },
    );
  }
}
