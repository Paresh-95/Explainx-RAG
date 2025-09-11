import { NextRequest, NextResponse } from "next/server";
import { auth } from "../../../../auth";
import prisma from "@repo/db";

type Params = Promise<{ fileId: string }>;

export async function GET(
  request: NextRequest,
  segmentData: { params: Params },
) {
  try {
    const params = await segmentData.params;
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          error: "Unauthorized",
          code: "UNAUTHORIZED",
        },
        { status: 401 },
      );
    }

    const fileId = params.fileId;

    // Get the file from the database
    const file = await prisma.studyMaterial.findFirst({
      where: {
        id: fileId,
        space: {
          ownerId: session.user.id,
        },
      },
      select: {
        fileUrl: true,
        mimeType: true,
      },
    });

    if (!file || !file.fileUrl) {
      return NextResponse.json(
        {
          error: "File not found",
          code: "NOT_FOUND",
        },
        { status: 404 },
      );
    }

    // For now, we'll just return the file URL
    // In a production environment, you would want to:
    // 1. Get the actual file from your storage (S3, etc.)
    // 2. Stream the file to the client
    // 3. Set proper cache headers
    return NextResponse.json({
      success: true,
      fileUrl: file.fileUrl,
      mimeType: file.mimeType,
    });
  } catch (error) {
    console.error("Error fetching file:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        code: "INTERNAL_ERROR",
      },
      { status: 500 },
    );
  }
}

