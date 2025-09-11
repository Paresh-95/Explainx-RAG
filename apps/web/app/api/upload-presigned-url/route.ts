// app/api/upload-presigned-url/route.ts
import { NextRequest, NextResponse } from "next/server";
import { S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl as getS3SignedUrl } from "@aws-sdk/s3-request-presigner";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import prisma from "@repo/db";
import { auth } from "../../../auth";

// Configure AWS S3 Client
const s3Client = new S3Client({
  region: process.env.AWS_REGION_NAME,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

// Helper function to format file size
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      fileName,
      fileSize,
      mimeType,
      spaceId,
      title,
      description,
      isTemporary = false,
    } = body;

    // Validate file size (100MB limit)
    const maxSize = 100 * 1024 * 1024; // 100MB in bytes
    if (fileSize > maxSize) {
      return NextResponse.json(
        {
          error: `File size (${formatFileSize(fileSize)}) exceeds the maximum limit of ${formatFileSize(maxSize)}`,
        },
        { status: 413 }, // 413 Payload Too Large
      );
    }

    // Validate file type
    const allowedTypes = [
      // Documents
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "text/plain",
      "application/vnd.ms-powerpoint",
      "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      // Images
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/webp",
      "image/svg+xml",
      "image/bmp",
      "image/tiff",

      // audio
      "audio/wav",
      "audio/webm",
    ];

    if (!allowedTypes.includes(mimeType)) {
      return NextResponse.json(
        {
          error:
            "File type not supported. Please upload PDF, Word, PowerPoint, text files, or images (JPEG, PNG, GIF, WebP, SVG, BMP, TIFF).",
        },
        { status: 400 },
      );
    }

    // If spaceId is provided, verify access
    if (spaceId && !isTemporary) {
      const space = await prisma.space.findFirst({
        where: {
          id: spaceId,
          OR: [
            { ownerId: session.user.id },
            {
              memberships: {
                some: {
                  userId: session.user.id,
                  status: "ACTIVE",
                },
              },
            },
          ],
        },
      });

      if (!space) {
        return NextResponse.json(
          { error: "Access denied to space" },
          { status: 403 },
        );
      }
    }

    // Generate unique file key
    const fileExtension = fileName.split(".").pop();
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(7);

    // Use temporary folder for space creation uploads
    const folderPath = isTemporary
      ? `spaces/${session.user.id}`
      : `study-materials/${spaceId}`;

    const uniqueKey = `${folderPath}/${timestamp}-${randomString}.${fileExtension}`;

    // Create presigned URL for upload using AWS SDK v3
    const command = new PutObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: uniqueKey,
      ContentType: mimeType,
      ACL: "private",
    });

    const presignedUrl = await getS3SignedUrl(s3Client, command, {
      expiresIn: 300, // 5 minutes
    });

    // Determine study material type
    const getStudyMaterialType = (mimeType: string) => {
      switch (mimeType) {
        case "application/pdf":
          return "PDF_DOCUMENT";
        case "application/msword":
        case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
          return "DOC_DOCUMENT";
        case "text/plain":
          return "TEXT_NOTES";
        case "application/vnd.ms-powerpoint":
        case "application/vnd.openxmlformats-officedocument.presentationml.presentation":
          return "OTHER";
        case "image/jpeg":
        case "image/png":
        case "image/gif":
        case "image/webp":
        case "image/svg+xml":
        case "image/bmp":
        case "image/tiff":
          return "IMAGE";
        default:
          return "OTHER";
      }
    };

    const fileUrl = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION_NAME}.amazonaws.com/${uniqueKey}`;

    return NextResponse.json({
      presignedUrl,
      fileKey: uniqueKey,
      fileUrl: fileUrl,
    });
  } catch (error) {
    console.error("Upload URL generation error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
