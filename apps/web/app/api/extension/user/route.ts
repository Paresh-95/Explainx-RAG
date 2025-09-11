// app/api/user/extension-profile/route.ts
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import prisma from "@repo/db";

const JWT_SECRET = process.env.JWT_SECRET!;

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }

    const token = authHeader.substring(7);

    // Verify JWT token
    const decoded = jwt.verify(token, JWT_SECRET) as any;

    if (decoded.type !== "extension_access") {
      return NextResponse.json({ error: "invalid_token" }, { status: 401 });
    }

    // Get user profile with spaces and recent activity
    const user = await prisma.user.findUnique({
      where: { id: decoded.sub },
      select: {
        id: true,
        email: true,
        name: true,
        image: true,
        isAdmin: true,
        isBetaTester: true,
        spaces: {
          select: {
            id: true,
            name: true,
            slug: true,
            isPublic: true,
            _count: {
              select: {
                studyMaterials: true,
              },
            },
          },
          orderBy: {
            updatedAt: "desc",
          },
          take: 5,
        },
        studyMaterials: {
          select: {
            id: true,
            title: true,
            type: true,
            space: {
              select: {
                name: true,
                slug: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
          take: 5,
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "user_not_found" }, { status: 404 });
    }

    return NextResponse.json({
      user: {
        ...user,
        totalSpaces: user.spaces.length,
        totalStudyMaterials: user.studyMaterials.length,
      },
    });
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return NextResponse.json({ error: "invalid_token" }, { status: 401 });
    }

    console.error("Extension profile error:", error);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
