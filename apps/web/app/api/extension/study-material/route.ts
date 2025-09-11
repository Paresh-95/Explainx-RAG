// app/api/extension/content/route.ts
import { NextRequest, NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import prisma from "@repo/db";
import { auth } from "../../../../auth";
import jwt from "jsonwebtoken";

// Configure AWS S3 Client
const s3Client = new S3Client({
  region: process.env.AWS_REGION_NAME,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

// Function to generate 6-character alphanumeric ID (same as study-material route)
const generateDocId = () => {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

// Helper function to verify JWT token from extension
async function verifyExtensionToken(authHeader: string | null) {
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }

  const token = authHeader.substring(7);

  try {
    // Verify the JWT token (assuming you have a JWT_SECRET in your env)
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { id: decoded.sub },
    });

    return user;
  } catch (error) {
    console.error("Token verification failed:", error);
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verify authentication - try extension token first, then session
    const authHeader = request.headers.get("authorization");
    let user = null;

    if (authHeader) {
      // Extension authentication
      user = await verifyExtensionToken(authHeader);
    } else {
      // Web session authentication
      const session = await auth();
      user = session?.user
        ? await prisma.user.findUnique({ where: { id: session.user.id } })
        : null;
    }

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      spaceId,
      title,
      content,
      type = "page", // 'page', 'youtube', etc.
      sourceUrl,
      description,
    } = body;

    // Validate required fields
    if (!spaceId || !title || !content) {
      return NextResponse.json(
        {
          error:
            "Missing required fields: spaceId, title, and content are required",
        },
        { status: 400 },
      );
    }

    // Verify user has access to the space
    const space = await prisma.space.findFirst({
      where: {
        id: spaceId,
        OR: [
          { ownerId: user.id },
          {
            memberships: {
              some: {
                userId: user.id,
                status: "ACTIVE",
              },
            },
          },
        ],
      },
    });

    if (!space) {
      return NextResponse.json(
        { error: "Access denied to space or space not found" },
        { status: 403 },
      );
    }

    // Generate unique identifiers using the same convention as study-material route
    const docId = generateDocId();

    // Create filename for the text file (same convention as study-material route)
    const sanitizedTitle = title
      .replace(/[^a-zA-Z0-9\s-]/g, "")
      .replace(/\s+/g, "_");
    const fileName = `${sanitizedTitle}_${Date.now()}.txt`;
    const s3Key = `study-materials/${spaceId}/${fileName}`;

    // Create text file content with metadata
    const textFileContent = `Title: ${title}
${description ? `Description: ${description}\n` : ""}${sourceUrl ? `Source URL: ${sourceUrl}\n` : ""}Type: ${type}
Extracted At: ${new Date().toISOString()}
Content Type: Text Notes

---

${content}`;

    // Upload text file to S3
    const uploadCommand = new PutObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: s3Key,
      Body: Buffer.from(textFileContent, "utf-8"),
      ContentType: "text/plain",
      ACL: "private",
    });

    await s3Client.send(uploadCommand);

    // Generate file URL
    const fileUrl = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION_NAME}.amazonaws.com/${s3Key}`;

    // Create study material entry in database
    const studyMaterial = await prisma.studyMaterial.create({
      data: {
        title,
        youtubeUrl: sourceUrl,
        description:
          description ||
          `Content extracted from ${type === "youtube" ? "YouTube video" : "web page"}${sourceUrl ? `: ${sourceUrl}` : ""}`,
        type: "DOC_DOCUMENT",
        docid: docId,
        fileName,
        fileUrl,
        fileSize: Buffer.byteLength(textFileContent, "utf-8"),
        mimeType: "text/plain",
        isProcessed: false,
        processingStatus: "pending",
        isPublic: false,
        spaceId,
        uploadedById: user.id,
        metadata: {
          extractedFrom: type,
          sourceUrl: sourceUrl || null,
          extractedAt: new Date().toISOString(),
          contentLength: content.length,
          extractionMethod: "extension",
        },
      },
    });

    // Trigger backend processing (same as study-material route)
    try {
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL;
      const serverAuthToken = process.env.BACKEND_API_KEY;

      const response = await fetch(
        `${baseUrl}/api/trigger-backend-processing`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-User-ID": user.id,
            "X-Server-Auth": serverAuthToken || "12233",
          },
          body: JSON.stringify({
            studyMaterialId: studyMaterial.id,
            spaceId: spaceId,
          }),
        },
      );

      const processingResult = await response.json();
      console.log("Document processing triggered:", processingResult);

      // Return success response with processing info
      return NextResponse.json({
        ...studyMaterial,
        processingStatus: processingResult.processingStatus || "queued",
        processingJobId: processingResult.processingJobId,
        estimatedTime: processingResult.estimatedTime,
      });
    } catch (processingError) {
      // Log the error but don't fail the study material creation
      console.error("Processing trigger error:", processingError);

      // Return success response even if processing trigger fails
      return NextResponse.json(studyMaterial);
    }
  } catch (error) {
    console.error("Extension content save error:", error);

    // Handle specific errors
    if (error instanceof Error) {
      if (error.message.includes("JWT")) {
        return NextResponse.json(
          { error: "Invalid authentication token" },
          { status: 401 },
        );
      }

      if (error.message.includes("S3") || error.message.includes("AWS")) {
        return NextResponse.json(
          { error: "File upload failed" },
          { status: 500 },
        );
      }

      if (
        error.message.includes("Prisma") ||
        error.message.includes("database")
      ) {
        return NextResponse.json({ error: "Database error" }, { status: 500 });
      }
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
