import { NextRequest, NextResponse } from "next/server";
import { auth } from "../../../../auth";
import prisma from "@repo/db";

export async function GET(request: NextRequest) {
  try {
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

    const { searchParams } = new URL(request.url);
    const limit = searchParams.get("limit") ? parseInt(searchParams.get("limit")!) : undefined;

    // Get study materials for the user
    const studyMaterials = await prisma.studyMaterial.findMany({
      where: {
        uploadedById: session.user.id,
      },
      select: {
        id: true,
        title: true,
        description: true,
        type: true,
        docid: true,
        youtubeUrl: true,
        fileUrl: true,
        fileName: true,
        fileSize: true,
        mimeType: true,
        createdAt: true,
        updatedAt: true,
        space: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: limit, // Will be undefined if no limit is provided, meaning no limit
    });

    // Transform the data to include full file URLs
    const transformedStudyMaterials = studyMaterials.map((material: { fileUrl: any; }) => ({
      ...material,
      fileUrl: material.fileUrl ? `${process.env.NEXT_PUBLIC_APP_URL}/api/files/${material.fileUrl}` : null,
    }));

    return NextResponse.json({
      success: true,
      studyMaterials: transformedStudyMaterials,
    });
  } catch (error) {
    console.error("Error fetching study materials:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        code: "INTERNAL_ERROR",
      },
      { status: 500 },
    );
  }
} 