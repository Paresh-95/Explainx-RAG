import { NextResponse } from "next/server";
import { auth } from "../../../auth";
import prisma from "@repo/db";

// Function to generate 6-character alphanumeric ID
const generateDocId = () => {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

export async function POST(req: Request) {
  const session = await auth();
  try {
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      fileUrl,
      spaceId,
      title,
      description,
      fileName,
      fileSize,
      mimeType,
      youtubeUrl,
      isChunk,
    } = body;

    if (!title) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // Validate that either fileUrl or youtubeUrl is provided
    if(isChunk === true) {
      if (!fileUrl && !youtubeUrl) {
        return NextResponse.json(
          { error: "Either fileUrl or youtubeUrl must be provided" },
          { status: 400 },
        );
      }
    }

    const docId = generateDocId();

    // Create study material with appropriate type
    const studyMaterial = await prisma.studyMaterial.create({
      data: {
        title,
        description,
        type: isChunk === false ? "OTHER" : (youtubeUrl ? "YOUTUBE_VIDEO" : "PDF_DOCUMENT"),
        fileUrl,
        fileName,
        fileSize,
        mimeType,
        youtubeUrl,
        uploadedById: session.user.id,
        docid: docId,
        isChunk, // Add the isChunk field
        // Only include spaceId if it's provided
        ...(spaceId && { spaceId }),
      },
    });

    // If isChunk is false, skip processing and return immediately
    if (isChunk === false) {
      console.log("Skipping processing for non-chunked material (isChunk = false)");
      return NextResponse.json({
        ...studyMaterial,
        type: "OTHER",
        processingStatus: 'completed',
        isChunk: false,
        isProcessing: true,
      });
    }

    // Trigger backend processing only if isChunk is true
    try {
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL;
      const serverAuthToken = process.env.BACKEND_API_KEY;

      if (youtubeUrl) {
        // Trigger YouTube processing
        const response = await fetch(`${baseUrl}/api/youtube/process`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-User-ID": session.user.id,
            "X-Server-Auth": serverAuthToken || "12233",
          },
          body: JSON.stringify({
            studyMaterialId: studyMaterial.id,
            spaceId: spaceId,
            youtubeUrl,
            title,
            description,
          }),
        });

        const processingResult = await response.json();
        console.log("YouTube processing triggered:", processingResult);

        return NextResponse.json({
          ...studyMaterial,
          processingStatus: processingResult.processingStatus || "queued",
          processingJobId: processingResult.processingJobId,
          estimatedTime: processingResult.estimatedTime,
          isChunk: true,
        });
      } else if (
        ["PDF_DOCUMENT", "DOC_DOCUMENT"].includes(studyMaterial.type)
      ) {
        // Trigger document processing
        const response = await fetch(
          `${baseUrl}/api/trigger-backend-processing`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "X-User-ID": session.user.id,
              "X-Server-Auth": serverAuthToken!,
            },
            body: JSON.stringify({
              studyMaterialId: studyMaterial.id,
              spaceId: spaceId,
            }),
          },
        );

        const processingResult = await response.json();
        console.log("Document processing triggered:", processingResult);

        return NextResponse.json({
          ...studyMaterial,
          processingStatus: processingResult.processingStatus || "queued",
          processingJobId: processingResult.processingJobId,
          estimatedTime: processingResult.estimatedTime,
          isChunk: true,
        });
      }
    } catch (processingError) {
      // Log the error but don't fail the study material creation
      console.error("Processing trigger error:", processingError);
      // Continue with the response - the processing can be triggered later
    }

    return NextResponse.json({
      ...studyMaterial,
      isChunk: true,
    });
  } catch (error) {
    console.error("Error creating study material:", error);
    return NextResponse.json(
      { error: "Failed to create study material" },
      { status: 500 },
    );
  }
}

