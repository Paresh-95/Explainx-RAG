// app/api/invitations/[token]/accept/route.ts
import { auth } from "../../../../../auth";
import prisma from "@repo/db/client";
import { NextResponse } from "next/server";

type Params = Promise<{ token: string }>;

export async function POST(request: Request, segmentData: { params: Params }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const params = await segmentData.params;
    const token = params.token;

    // Find the invitation
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

    // Verify email matches
    if (invitation.email !== session.user.email) {
      return new NextResponse(
        "This invitation was sent to a different email address",
        { status: 403 },
      );
    }

    // Check if already a member
    const existingMembership = await prisma.userOrganization.findFirst({
      where: {
        userId: session.user.id,
        organizationId: invitation.organizationId,
      },
    });

    if (existingMembership) {
      return new NextResponse("Already a member of this organization", {
        status: 400,
      });
    }

    // Create organization membership
    await prisma.userOrganization.create({
      data: {
        userId: session.user.id,
        organizationId: invitation.organizationId,
        role: invitation.role,
      },
    });

    // Update invitation status
    await prisma.invitation.update({
      where: { id: invitation.id },
      data: { status: "ACCEPTED" },
    });

    return NextResponse.json({
      success: true,
      organization: invitation.organization,
    });
  } catch (error) {
    console.error("[ACCEPT_INVITATION_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
