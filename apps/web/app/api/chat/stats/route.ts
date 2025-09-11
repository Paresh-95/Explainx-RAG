// api/admin/chat-stats/route.ts - Chat statistics endpoint
import { NextRequest, NextResponse } from "next/server";
import { auth } from "../../../../auth";
import { getChatStats } from "../../../../lib/chat-service";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin (you can implement your own admin check)
    if (!session.user.isAdmin) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const spaceId = searchParams.get('spaceId') || undefined;
    const studyMaterialId = searchParams.get('studyMaterialId') || undefined;
    const userId = searchParams.get('userId') || session.user.id;

    const stats = await getChatStats(userId, {
      spaceId,
      studyMaterialId,
    });

    return NextResponse.json({
      success: true,
      stats,
    });
  } catch (error) {
    console.error('Failed to get chat stats:', error);
    return NextResponse.json(
      { error: "Failed to get chat statistics" },
      { status: 500 }
    );
  }
}