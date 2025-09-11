// app/api/invitations/route.ts
import { auth } from "../../../auth";
import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import prisma from "@repo/db/client";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { email, organizationId } = await req.json();

    // Check if user has permission to invite - simplified to any member of org
    const userOrg = await prisma.userOrganization.findFirst({
      where: {
        userId: session.user.id,
        organizationId,
      },
    });

    if (!userOrg) {
      return new NextResponse("Forbidden - Must be member to invite", {
        status: 403,
      });
    }

    // Check if the email is associated with an existing user
    const existingUser = await prisma.user.findUnique({
      where: { email },
      include: {
        organizations: true,
      },
    });

    if (existingUser) {
      if (existingUser?.organizations.length > 0) {
        return new NextResponse(
          "User already belongs to an organization. Users can only be part of one organization.",
          { status: 400 },
        );
      }
    }

    // Check if invitation already exists
    const existingInvitation = await prisma.invitation.findFirst({
      where: {
        email,
        status: "PENDING",
      },
      include: {
        organization: true,
      },
    });

    if (existingInvitation) {
      return new NextResponse(
        `User already has a pending invitation${
          existingInvitation.organizationId === organizationId
            ? " to this organization"
            : ` to ${existingInvitation.organization.name}`
        }`,
        { status: 400 },
      );
    }

    // Create new invitation - no role needed in simplified system
    const invitation = await prisma.invitation.create({
      data: {
        email,
        organizationId,
        token: randomUUID(),
        invitedById: session.user.id,
        status: "PENDING",
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      },
      include: {
        organization: true,
        invitedBy: true,
      },
    });

    // Send invitation email (implement your email service)
    console.log(
      "inviteUrl",
      `${process.env.NEXT_PUBLIC_APP_URL}/invite/${invitation.token}`,
    );

    // Send invitation email
    const emailResponse = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL}/api/invitations/email`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: invitation.email,
          inviteToken: invitation.token,
          organizationName: invitation.organization.name,
          invitedByName: invitation.invitedBy.name,
        }),
      },
    );

    if (!emailResponse.ok) {
      console.error("[EMAIL_SEND_ERROR]", await emailResponse.json());
      await prisma.invitation.delete({ where: { id: invitation.id } });
      return new NextResponse("Failed to send invitation email", {
        status: 500,
      });
    }

    return NextResponse.json(invitation);
  } catch (error) {
    console.error("[INVITATION_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
