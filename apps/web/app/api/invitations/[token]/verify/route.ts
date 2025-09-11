// app/api/invitations/[token]/verify/route.ts
import { NextResponse } from "next/server";

import { auth } from "../../../../../auth";
import prisma from "@repo/db/client";

type Params = Promise<{ token: string }>;

export async function GET(request: Request, segmentData: { params: Params }) {
  try {
    const params = await segmentData.params;
    const token = params.token;

    const invitation = await prisma.invitation.findUnique({
      where: {
        token,
        status: "PENDING",
        expiresAt: {
          gt: new Date(),
        },
      },
      include: {
        organization: true,
      },
    });

    if (!invitation) {
      return new NextResponse("Invalid or expired invitation", { status: 400 });
    }

    return NextResponse.json({
      email: invitation.email,
      organizationName: invitation.organization.name,
      role: invitation.role,
    });
  } catch (error) {
    console.error("[VERIFY_INVITATION_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
