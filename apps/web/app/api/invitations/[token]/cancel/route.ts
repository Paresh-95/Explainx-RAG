import { NextResponse } from "next/server";
import { auth } from "../../../../../auth";
import prisma from "@repo/db/client";

type Params = Promise<{ token: string }>;

export async function DELETE(
  request: Request,
  segmentData: { params: Params },
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const params = await segmentData.params;
    const token = params.token;

    // Get the invitation
    const invitation = await prisma.invitation.findUnique({
      where: { token },
      include: {
        organization: {
          include: {
            users: {
              where: {
                userId: session.user.id,
              },
            },
          },
        },
      },
    });

    if (!invitation) {
      return new NextResponse("Invitation not found", { status: 404 });
    }

    // Check if user has permission (must be owner or admin)
    const userRole = invitation.organization.users[0]?.role;
    if (!userRole || !["OWNER", "ADMIN"].includes(userRole)) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    // Cancel the invitation
    await prisma.invitation.update({
      where: { token },
      data: { status: "CANCELLED" },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[CANCEL_INVITATION_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
