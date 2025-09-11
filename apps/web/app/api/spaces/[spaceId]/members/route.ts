// app/api/spaces/[slug]/members/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "../../../../../auth";
import prisma from "@repo/db";

type Params = Promise<{ spaceId: string }>;
// Get all members of a space
export async function GET(
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

    // Find the space and check user's access
    const space = await prisma.space.findFirst({
      where: {
        OR: [{ id: spaceId }, { slug: spaceId }],
      },
      include: {
        memberships: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true,
                username: true,
              },
            },
          },
          orderBy: {
            joinedAt: "asc",
          },
        },
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            username: true,
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

    // Check if user has access to view members
    const isOwner = space.ownerId === session.user.id;
    const userMembership = space.memberships.find(
      (m) => m.userId === session.user.id,
    );
    const hasAccess = isOwner || userMembership;

    if (!hasAccess && !space.isPublic) {
      return NextResponse.json(
        { error: "Access denied", code: "ACCESS_DENIED" },
        { status: 403 },
      );
    }

    // Include owner in the members list - no role distinction
    const members = [
      {
        id: `owner-${space.owner.id}`,
        spaceId: space.id,
        userId: space.owner.id,
        status: "ACTIVE",
        joinedAt: space.createdAt.toISOString(),
        user: space.owner,
        isOwner: true,
      },
      ...space.memberships.map((membership) => ({
        ...membership,
        joinedAt: membership.joinedAt.toISOString(),
        isOwner: false,
      })),
    ];

    return NextResponse.json({
      success: true,
      members,
      total: members.length,
    });
  } catch (error) {
    console.error("Error fetching space members:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

