import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import prisma from "@repo/db";

const JWT_SECRET = process.env.JWT_SECRET!;

export async function GET(request: NextRequest) {
  try {
    // Check for JWT token in Authorization header
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }

    const token = authHeader.split("Bearer ")[1]!;

    // Verify JWT token
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    if (decoded.type !== "extension_access") {
      console.log("invalid_token", decoded);
      return NextResponse.json({ error: "invalid_token" }, { status: 401 });
    }

    const userId = decoded.sub;

    if (!userId) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }

    const spaces = await prisma.space.findMany({
      where: {
        OR: [
          { ownerId: userId },
          {
            memberships: {
              some: {
                userId,
                status: "ACTIVE",
              },
            },
          },
        ],
      },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
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
    });

    return NextResponse.json({ spaces });
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      console.log("invalid_token", error);
      return NextResponse.json({ error: "invalid_token" }, { status: 401 });
    }
    console.error("Get spaces error:", error);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
