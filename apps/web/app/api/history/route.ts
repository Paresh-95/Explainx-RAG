// api/chat/history/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "../../../auth";
import { getChatHistory, deleteChat } from "../../../lib/chat-service";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const spaceId = searchParams.get('spaceId') || undefined;
    const studyMaterialId = searchParams.get('studyMaterialId') || undefined;
    const limit = parseInt(searchParams.get('limit') || '50');

    const chats = await getChatHistory(session.user.id, {
      spaceId,
      studyMaterialId,
      limit,
    });

    console.log("chats", chats);

    return NextResponse.json({
      success: true,
      chats,
      count: chats.length,
    });
  } catch (error) {
    console.error('Failed to get chat history:', error);
    return NextResponse.json(
      { error: "Failed to get chat history" },
      { status: 500 }
    );
  }
}