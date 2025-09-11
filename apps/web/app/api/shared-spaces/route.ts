import { NextRequest, NextResponse } from "next/server";
import { auth } from "../../../auth";
import prisma from "@repo/db";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;
    // Find all active memberships for the user
    const memberships = await prisma.spaceMembership.findMany({
      where: {
        userId,
        status: "ACTIVE",
      },
      include: {
        space: {
          include: {
            studyMaterials: true,
            owner: true,
          },
        },
      },
    });
    // Return memberships with space included
    return NextResponse.json({ success: true, spaces: memberships });
  } catch (err) {
    console.error("Error fetching shared spaces:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
} 