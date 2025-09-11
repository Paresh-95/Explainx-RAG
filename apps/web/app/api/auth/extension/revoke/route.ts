// app/api/auth/extension/revoke/route.ts
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import prisma from "@repo/db";

const JWT_SECRET = process.env.JWT_SECRET!;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, token_type_hint } = body;

    if (!token) {
      return NextResponse.json(
        { error: "invalid_request", error_description: "Missing token" },
        { status: 400 },
      );
    }

    let userId: string | null = null;

    // Try to decode JWT to get user ID
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      userId = decoded.sub;
    } catch (error) {
      // Token might be a refresh token, we'll handle it below
    }

    // If it's a refresh token or we couldn't decode JWT
    if (!userId || token_type_hint === "refresh_token") {
      const refreshTokenRecord = await prisma.extensionRefreshToken.findFirst({
        where: { token },
      });

      if (refreshTokenRecord) {
        userId = refreshTokenRecord.userId;
        // Delete the refresh token
        await prisma.extensionRefreshToken.delete({
          where: { id: refreshTokenRecord.id },
        });
      }
    }

    // Revoke all extension tokens for the user
    if (userId) {
      await prisma.extensionRefreshToken.deleteMany({
        where: {
          userId,
          clientId: "explainx-extension",
        },
      });

      // Also clean up expired auth codes
      await prisma.extensionAuthCode.deleteMany({
        where: {
          userId,
          OR: [{ expiresAt: { lt: new Date() } }, { used: true }],
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Token revocation error:", error);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
