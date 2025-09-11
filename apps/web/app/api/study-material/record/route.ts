import { NextResponse } from "next/server";
import { auth } from "../../../../auth";
import prisma from "@repo/db";


export async function POST(req: Request) {
  const session = await auth();
  try {
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    console.log(body)
    const { fileUrl, spaceSlug, title, description, fileName, fileSize, mimeType, recordingUrl , docId } = body;


    if (!spaceSlug || !title) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate that either fileUrl or youtubeUrl is provided
    if (!fileUrl && !recordingUrl) {
      return NextResponse.json(
        { error: "Either fileUrl or youtubeUrl must be provided" },
        { status: 400 }
      );
    }

    const getSpaceId  = await prisma.space.findUnique({
        where:{
            slug:spaceSlug
        }
    });

    if (!getSpaceId) {
        return NextResponse.json(
          { error: "Space not found" },
          { status: 400 }
        );
      }
    const studyMaterial = await prisma.studyMaterial.create({
      data: {
        title,
        description,
        type: "AUDIO_RECORDING", // Using proper enum value from StudyMaterialType
        fileUrl,
        fileName,
        fileSize,
        mimeType : "text/plain",
        recordingUrl,
        spaceId : getSpaceId?.id!,
        uploadedById: session.user.id,
        docid: docId,
      },
    });

    // Trigger backend processing
    try {
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
      const serverAuthToken = process.env.BACKEND_API_KEY;

      if (recordingUrl) {
        // Trigger YouTube processing
        const response = await fetch(
            `${baseUrl}/api/trigger-backend-processing`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "X-User-ID": session.user.id,
                "X-Server-Auth": serverAuthToken || "12233",
              },
              body: JSON.stringify({
                studyMaterialId: studyMaterial.id,
                spaceId: getSpaceId.id,
              }),
            }
          );

        const processingResult = await response.json();
        console.log("YouTube processing triggered:", processingResult);

        return NextResponse.json({
          ...studyMaterial,
          processingStatus: processingResult.processingStatus || 'queued',
          processingJobId: processingResult.processingJobId,
          estimatedTime: processingResult.estimatedTime,
        });
      } else if (["PDF_DOCUMENT", "DOC_DOCUMENT"].includes(studyMaterial.type)) {
        // Trigger document processing
        const response = await fetch(
          `${baseUrl}/api/trigger-backend-processing`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "X-User-ID": session.user.id,
              "X-Server-Auth": serverAuthToken || "12233",
            },
            body: JSON.stringify({
              studyMaterialId: studyMaterial.id,
              spaceId: getSpaceId.id,
            }),
          }
        );

        const processingResult = await response.json();
        console.log("Document processing triggered:", processingResult);

        return NextResponse.json({
          ...studyMaterial,
          processingStatus: processingResult.processingStatus || 'queued',
          processingJobId: processingResult.processingJobId,
          estimatedTime: processingResult.estimatedTime,
        });
      }
    } catch (processingError) {
      // Log the error but don't fail the study material creation
      console.error("Processing trigger error:", processingError);
      // Continue with the response - the processing can be triggered later
    }

    return NextResponse.json(studyMaterial);
  } catch (error) {
    console.error("Error creating study material:", error);
    return NextResponse.json(
      { error: "Failed to create study material" },
      { status: 500 }
    );
  }
} 