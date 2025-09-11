// app/api/spaces/[slug]/join/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "../../../../../auth";
import prisma from "@repo/db";

type Params = Promise<{ spaceId: string }>;

export async function POST(
  request: NextRequest,
  segmentData: { params: Params },
) {
  try {
    const { params } = segmentData;
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      );
    }

    const { spaceId } = await params;

    // Find the space (try by ID first, then by slug)
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

    // Check if space is joinable
    if (!space.isPublic && space.visibility !== "PUBLIC") {
      return NextResponse.json(
        {
          error: "This space is not public and cannot be joined",
          code: "ACCESS_DENIED",
        },
        { status: 403 },
      );
    }

    // Check if user is already the owner
    if (space.ownerId === session.user.id) {
      return NextResponse.json(
        {
          error: "You are already the owner of this space",
          code: "ALREADY_OWNER",
        },
        { status: 400 },
      );
    }

    // Check if user is already a member
    if (space.memberships.length > 0) {
      return NextResponse.json(
        {
          error: "You are already a member of this space",
          code: "ALREADY_MEMBER",
        },
        { status: 400 },
      );
    }

    // Create membership
    const membership = await prisma.spaceMembership.create({
      data: {
        spaceId: space.id,
        userId: session.user.id,
        role: "MEMBER", // Default role for new joiners
        status: "ACTIVE",
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: "Successfully joined the space",
      membership,
    });
  } catch (error) {
    console.error("Error joining space:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
