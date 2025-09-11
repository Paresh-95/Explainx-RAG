// app/api/auth/extension/verify/route.ts
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import prisma from "@repo/db";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        {
          error: "unauthorized",
          error_description: "Missing or invalid authorization header",
        },
        { status: 401 },
      );
    }

    const token = authHeader.substring(7);

    // Verify JWT token
    const decoded = jwt.verify(token, JWT_SECRET) as any;

    if (decoded.type !== "extension_access") {
      return NextResponse.json(
        { error: "invalid_token", error_description: "Invalid token type" },
        { status: 401 },
      );
    }

    // Get user info
    const user = await prisma.user.findUnique({
      where: { id: decoded.sub },
      select: {
        id: true,
        email: true,
        name: true,
        image: true,
        isAdmin: true,
        isBetaTester: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "invalid_token", error_description: "User not found" },
        { status: 401 },
      );
    }

    return NextResponse.json({
      valid: true,
      user,
      scope: decoded.scope,
      expires_at: decoded.exp,
    });
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return NextResponse.json(
        {
          error: "invalid_token",
          error_description: "Invalid or expired token",
        },
        { status: 401 },
      );
    }

    console.error("Token verification error:", error);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
