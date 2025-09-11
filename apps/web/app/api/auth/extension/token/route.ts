// app/api/auth/extension/token/route.ts
import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";
import jwt from "jsonwebtoken";
import prisma from "@repo/db";

const JWT_SECRET = process.env.JWT_SECRET!;
const EXTENSION_CLIENT_SECRET =
  process.env.EXTENSION_CLIENT_SECRET || "your-extension-secret";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { client_id, code, redirect_uri, grant_type, refresh_token } = body;

    // Validate required parameters
    if (!client_id || !grant_type) {
      return NextResponse.json(
        {
          error: "invalid_request",
          error_description: "Missing required parameters",
        },
        { status: 400 },
      );
    }

    // Validate client
    if (client_id !== "explainx-extension") {
      return NextResponse.json({ error: "invalid_client" }, { status: 401 });
    }

    if (grant_type === "authorization_code") {
      // Authorization code flow
      if (!code || !redirect_uri) {
        return NextResponse.json(
          {
            error: "invalid_request",
            error_description: "Missing code or redirect_uri",
          },
          { status: 400 },
        );
      }

      // Find and validate authorization code
      const authCodeRecord = await prisma.extensionAuthCode.findFirst({
        where: {
          code,
          clientId: client_id,
          redirectUri: redirect_uri,
          used: false,
          expiresAt: {
            gt: new Date(),
          },
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
              image: true,
            },
          },
        },
      });

      if (!authCodeRecord) {
        return NextResponse.json(
          {
            error: "invalid_grant",
            error_description: "Invalid or expired authorization code",
          },
          { status: 400 },
        );
      }

      // Mark code as used
      await prisma.extensionAuthCode.update({
        where: { id: authCodeRecord.id },
        data: { used: true },
      });

      // Generate tokens
      const accessToken = jwt.sign(
        {
          sub: authCodeRecord.user.id,
          email: authCodeRecord.user.email,
          scope: authCodeRecord.scope,
          type: "extension_access",
        },
        JWT_SECRET,
        { expiresIn: "1h" },
      );

      const refreshTokenValue = randomBytes(32).toString("hex");

      // Store refresh token
      await prisma.extensionRefreshToken.create({
        data: {
          token: refreshTokenValue,
          userId: authCodeRecord.user.id,
          clientId: client_id,
          scope: authCodeRecord.scope,
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        },
      });

      return NextResponse.json({
        access_token: accessToken,
        refresh_token: refreshTokenValue,
        token_type: "Bearer",
        expires_in: 3600,
        scope: authCodeRecord.scope,
        user: {
          id: authCodeRecord.user.id,
          email: authCodeRecord.user.email,
          name: authCodeRecord.user.name,
          image: authCodeRecord.user.image,
        },
      });
    } else if (grant_type === "refresh_token") {
      // Refresh token flow
      if (!refresh_token) {
        return NextResponse.json(
          {
            error: "invalid_request",
            error_description: "Missing refresh_token",
          },
          { status: 400 },
        );
      }

      // Find and validate refresh token
      const refreshTokenRecord = await prisma.extensionRefreshToken.findFirst({
        where: {
          token: refresh_token,
          clientId: client_id,
          expiresAt: {
            gt: new Date(),
          },
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
              image: true,
            },
          },
        },
      });

      if (!refreshTokenRecord) {
        return NextResponse.json(
          {
            error: "invalid_grant",
            error_description: "Invalid or expired refresh token",
          },
          { status: 400 },
        );
      }

      // Generate new access token
      const accessToken = jwt.sign(
        {
          sub: refreshTokenRecord.user.id,
          email: refreshTokenRecord.user.email,
          scope: refreshTokenRecord.scope,
          type: "extension_access",
        },
        JWT_SECRET,
        { expiresIn: "1h" },
      );

      return NextResponse.json({
        access_token: accessToken,
        token_type: "Bearer",
        expires_in: 3600,
        scope: refreshTokenRecord.scope,
      });
    } else {
      return NextResponse.json(
        { error: "unsupported_grant_type" },
        { status: 400 },
      );
    }
  } catch (error) {
    console.error("Token exchange error:", error);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
