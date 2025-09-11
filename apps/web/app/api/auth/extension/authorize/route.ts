// app/api/auth/extension/authorize/route.ts
import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { auth } from "../../../../../auth";
import prisma from "@repo/db";
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const clientId = searchParams.get("client_id");
    const redirectUri = searchParams.get("redirect_uri");
    const responseType = searchParams.get("response_type");
    const state = searchParams.get("state");
    const scope = searchParams.get("scope");

    console.log("client", clientId);

    // Validate required parameters
    if (!clientId || !redirectUri || !responseType || !state) {
      return NextResponse.json(
        { error: "missing_required_parameters" },
        { status: 400 },
      );
    }

    // Validate client_id (should match your extension)
    if (clientId !== "explainx-extension") {
      return NextResponse.json({ error: "invalid_client" }, { status: 400 });
    }

    // Validate redirect_uri format (should be chrome-extension://)
    if (!redirectUri) {
      return NextResponse.json(
        { error: "invalid_redirect_uri" },
        { status: 400 },
      );
    }

    // Validate response_type
    if (responseType !== "code") {
      return NextResponse.json(
        { error: "unsupported_response_type" },
        { status: 400 },
      );
    }

    // Check if user is authenticated
    const session = await auth();
    if (!session?.user) {
      // Store auth request and redirect to login using NextResponse.redirect
      const authUrl = new URL("/login", request.nextUrl.origin);
      authUrl.searchParams.set("next", request.url);

      return NextResponse.redirect(authUrl.toString());
    }

    // Generate authorization code
    const authCode = randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Store authorization code in database
    await prisma.extensionAuthCode.create({
      data: {
        code: authCode,
        userId: session.user.id,
        clientId,
        redirectUri,
        state,
        scope: scope || "profile",
        expiresAt,
      },
    });

    // Instead of redirecting to extension directly, redirect to our success page
    // The extension will monitor this URL and extract the code
    const successUrl = new URL(
      "/extension-auth-success",
      request.nextUrl.origin,
    );
    successUrl.searchParams.set("code", authCode);
    successUrl.searchParams.set("state", state);

    return NextResponse.redirect(successUrl.toString());
  } catch (error) {
    console.error("Extension authorization error:", error);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
