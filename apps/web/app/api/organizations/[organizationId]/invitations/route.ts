import { NextResponse } from "next/server";
import { auth } from "../../../../../auth";
import prisma from "@repo/db/client";

type Params = Promise<{ organizationId: string }>;

export async function GET(request: Request, segmentData: { params: Params }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const params = await segmentData.params;
    const organizationId = params.organizationId;

    // Check if user is part of the organization
    const userOrg = await prisma.userOrganization.findFirst({
      where: {
        userId: session.user.id,
        organizationId,
      },
    });

    if (!userOrg) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    // Fetch pending invitations
    const invitations = await prisma.invitation.findMany({
      where: {
        organizationId,
        status: "PENDING",
        expiresAt: {
          gt: new Date(),
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(invitations);
  } catch (error) {
    console.error("[FETCH_INVITATIONS_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
