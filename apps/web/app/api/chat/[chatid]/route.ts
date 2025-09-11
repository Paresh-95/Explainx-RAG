// api/chat/[chatId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "../../../../auth";
import { getChat, deleteChat } from "../../../../lib/chat-service";

type Params = Promise<{ chatId: string }>;

export async function GET(
  request: NextRequest,
  segmentData: { params: Params },
) {
  try {
    const params = await segmentData.params;
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const chat = await getChat(params.chatId);

    if (!chat) {
      return NextResponse.json({ error: "Chat not found" }, { status: 404 });
    }

    // Verify the user owns this chat
    if (chat.userId !== session.user.id) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    return NextResponse.json({
      success: true,
      chat,
    });
  } catch (error) {
    console.error("Failed to get chat:", error);
    return NextResponse.json({ error: "Failed to get chat" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  segmentData: { params: Params },
) {
  try {
    const params = await segmentData.params;
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // First verify the user owns this chat
    const chat = await getChat(params.chatId);

    if (!chat) {
      return NextResponse.json({ error: "Chat not found" }, { status: 404 });
    }

    if (chat.userId !== session.user.id) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    await deleteChat(params.chatId, session.user.id, {
      spaceId: chat.spaceId,
      studyMaterialId: chat.studyMaterialId,
    });

    return NextResponse.json({
      success: true,
      message: "Chat deleted successfully",
    });
  } catch (error) {
    console.error("Failed to delete chat:", error);
    return NextResponse.json(
      { error: "Failed to delete chat" },
      { status: 500 },
    );
  }
}

