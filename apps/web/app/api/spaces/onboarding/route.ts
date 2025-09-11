// app/api/spaces/onboarding/route.ts

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl as getS3SignedUrl } from "@aws-sdk/s3-request-presigner";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import prisma from "@repo/db";
import { auth } from "../../../../auth";

// Configure AWS S3 Client (same as your existing API)
const s3Client = new S3Client({
  region: process.env.AWS_REGION_NAME,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

// Utility function to upload files to S3
const uploadFileToS3 = async (
  file: File,
  folder: string,
): Promise<{ url: string; key: string }> => {
  const fileExtension = file.name.split(".").pop();
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(7);
  const uniqueKey = `${folder}/${timestamp}-${randomString}.${fileExtension}`;

  // Create presigned URL for upload
  const command = new PutObjectCommand({
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: uniqueKey,
    ContentType: file.type,
    ACL: "private",
  });

  const presignedUrl = await getS3SignedUrl(s3Client, command, {
    expiresIn: 300, // 5 minutes
  });

  // Upload file to S3
  const uploadResponse = await fetch(presignedUrl, {
    method: "PUT",
    body: file,
    headers: {
      "Content-Type": file.type,
    },
  });

  if (!uploadResponse.ok) {
    throw new Error("Failed to upload file to S3");
  }

  const fileUrl = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION_NAME}.amazonaws.com/${uniqueKey}`;

  return { url: fileUrl, key: uniqueKey };
};

// Validation schema
const createOnboardingSchema = z.object({
  spaceId: z.string().min(1, "Space ID is required"),
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  isRequired: z.boolean().default(false),
  estimatedMinutes: z.number().optional(),
  steps: z
    .array(
      z.object({
        stepNumber: z.number().min(1),
        title: z.string().min(1, "Step title is required"),
        description: z.string().optional(),
        stepType: z.enum(["TEXT", "AUDIO", "VIDEO", "MIXED"]),
        textContent: z.string().optional(),
        estimatedMinutes: z.number().optional().default(5),
        isRequired: z.boolean().default(true),
      }),
    )
    .min(1, "At least one step is required"),
});

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse form data
    const formData = await request.formData();
    console.log(formData);

    // Extract basic data
    const rawData = {
      spaceId: formData.get("spaceId") as string,
      title: formData.get("title") as string,
      description: (formData.get("description") as string) || "",
      isRequired: formData.get("isRequired") === "true",
      estimatedMinutes: formData.get("estimatedMinutes")
        ? parseInt(formData.get("estimatedMinutes") as string)
        : undefined,
      steps: JSON.parse((formData.get("steps") as string) || "[]"),
    };

    // Validate data
    const validatedData = createOnboardingSchema.parse(rawData);
    console.log(rawData.spaceId);

    // Check if user has permission to create onboarding for this space
    const space = await prisma.space.findUnique({
      where: { id: rawData.spaceId },
      select: {
        id: true,
        ownerId: true,
        memberships: {
          where: {
            userId: session.user.id,
            role: { in: ["OWNER", "ADMIN"] },
          },
        },
      },
    });
    console.log("space", space);

    if (!space) {
      return NextResponse.json({ error: "Space not found" }, { status: 404 });
    }

    // Check if user is owner or admin
    const isOwner = space.ownerId === session.user.id;
    const isAdmin = space.memberships.length > 0;

    if (!isOwner && !isAdmin) {
      return NextResponse.json(
        {
          error:
            "You do not have permission to create onboarding for this space",
        },
        { status: 403 },
      );
    }

    // Check if onboarding already exists for this space
    const existingOnboarding = await prisma.spaceOnboarding.findUnique({
      where: { spaceId: validatedData.spaceId },
    });

    if (existingOnboarding) {
      return NextResponse.json(
        {
          error: "Onboarding already exists for this space",
        },
        { status: 400 },
      );
    }

    // Process file uploads
    const processedSteps = await Promise.all(
      validatedData.steps.map(async (step, index) => {
        let audioUrl: string | undefined;
        let videoUrl: string | undefined;
        let audioFileName: string | undefined;
        let videoFileName: string | undefined;
        let audioFileSize: number | undefined;
        let videoFileSize: number | undefined;
        let audioDuration: number | undefined;
        let videoDuration: number | undefined;

        // Handle audio file upload
        const audioFile = formData.get(`step-${index}-audio`) as File;
        if (audioFile && audioFile.size > 0) {
          try {
            const audioUploadResult = await uploadFileToS3(
              audioFile,
              `onboarding/${validatedData.spaceId}/audio`,
            );
            audioUrl = audioUploadResult.url;
            audioFileName = audioFile.name;
            audioFileSize = audioFile.size;
            // You might want to extract audio duration here using a library like ffprobe
          } catch (error) {
            console.error("Audio upload failed:", error);
            throw new Error(`Failed to upload audio for step ${index + 1}`);
          }
        }

        // Handle video file upload
        const videoFile = formData.get(`step-${index}-video`) as File;
        if (videoFile && videoFile.size > 0) {
          try {
            const videoUploadResult = await uploadFileToS3(
              videoFile,
              `onboarding/${validatedData.spaceId}/video`,
            );
            videoUrl = videoUploadResult.url;
            videoFileName = videoFile.name;
            videoFileSize = videoFile.size;
            // You might want to extract video duration here using a library like ffprobe
          } catch (error) {
            console.error("Video upload failed:", error);
            throw new Error(`Failed to upload video for step ${index + 1}`);
          }
        }

        return {
          ...step,
          audioUrl,
          videoUrl,
          audioFileName,
          videoFileName,
          audioFileSize,
          videoFileSize,
          audioDuration,
          videoDuration,
        };
      }),
    );

    // Calculate total estimated minutes
    const totalEstimatedMinutes = processedSteps.reduce(
      (total, step) => total + (step.estimatedMinutes || 0),
      0,
    );

    // Create onboarding in database
    const onboarding = await prisma.spaceOnboarding.create({
      data: {
        spaceId: validatedData.spaceId,
        title: validatedData.title,
        description: validatedData.description,
        status: "ACTIVE",
        totalSteps: processedSteps.length,
        estimatedMinutes:
          totalEstimatedMinutes > 0
            ? totalEstimatedMinutes
            : validatedData.estimatedMinutes,
        isRequired: validatedData.isRequired,
        createdById: session.user.id,
        steps: {
          create: processedSteps.map((step) => ({
            title: step.title,
            description: step.description || "",
            stepNumber: step.stepNumber,
            stepType: step.stepType,
            textContent: step.textContent,
            audioUrl: step.audioUrl,
            videoUrl: step.videoUrl,
            audioFileName: step.audioFileName,
            videoFileName: step.videoFileName,
            audioFileSize: step.audioFileSize,
            videoFileSize: step.videoFileSize,
            audioDuration: step.audioDuration,
            videoDuration: step.videoDuration,
            estimatedMinutes: step.estimatedMinutes,
            isRequired: step.isRequired,
          })),
        },
      },
      include: {
        steps: {
          orderBy: { stepNumber: "asc" },
        },
      },
    });

    return NextResponse.json({
      success: true,
      onboarding: {
        id: onboarding.id,
        title: onboarding.title,
        totalSteps: onboarding.totalSteps,
        estimatedMinutes: onboarding.estimatedMinutes,
      },
    });
  } catch (error) {
    console.error("Error creating space onboarding:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: error.errors,
        },
        { status: 400 },
      );
    }

    if (error instanceof Error) {
      return NextResponse.json(
        {
          error: error.message,
        },
        { status: 500 },
      );
    }

    return NextResponse.json(
      {
        error: "Internal server error",
      },
      { status: 500 },
    );
  }
}

// GET method to retrieve onboarding for a space
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const spaceId = searchParams.get("spaceId");

    if (!spaceId) {
      return NextResponse.json(
        { error: "spaceId is required" },
        { status: 400 },
      );
    }

    // Check if user has access to this space
    const space = await prisma.space.findUnique({
      where: { id: spaceId },
      select: {
        id: true,
        ownerId: true,
        isPublic: true,
        memberships: {
          where: { userId: session.user.id },
        },
      },
    });

    if (!space) {
      return NextResponse.json({ error: "Space not found" }, { status: 404 });
    }

    // Check access permissions
    const hasAccess =
      space.ownerId === session.user.id ||
      space.isPublic ||
      space.memberships.length > 0;

    if (!hasAccess) {
      return NextResponse.json(
        {
          error: "You do not have access to this space",
        },
        { status: 403 },
      );
    }

    // Get onboarding with steps
    const onboarding = await prisma.spaceOnboarding.findUnique({
      where: { spaceId },
      include: {
        steps: {
          orderBy: { stepNumber: "asc" },
        },
        userProgress: {
          where: { userId: session.user.id },
          include: {
            stepProgress: true,
          },
        },
      },
    });

    if (!onboarding) {
      return NextResponse.json(
        {
          error: "No onboarding found for this space",
        },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      onboarding: {
        id: onboarding.id,
        title: onboarding.title,
        description: onboarding.description,
        status: onboarding.status,
        totalSteps: onboarding.totalSteps,
        estimatedMinutes: onboarding.estimatedMinutes,
        isRequired: onboarding.isRequired,
        steps: onboarding.steps.map((step: any) => ({
          id: step.id,
          title: step.title,
          description: step.description,
          stepNumber: step.stepNumber,
          stepType: step.stepType,
          textContent: step.textContent,
          audioUrl: step.audioUrl,
          videoUrl: step.videoUrl,
          estimatedMinutes: step.estimatedMinutes,
          isRequired: step.isRequired,
        })),
        userProgress: onboarding.userProgress[0] || null,
      },
    });
  } catch (error) {
    console.error("Error fetching space onboarding:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
      },
      { status: 500 },
    );
  }
}

// PUT method to update onboarding
export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const onboardingId = searchParams.get("id");

    if (!onboardingId) {
      return NextResponse.json(
        { error: "onboardingId is required" },
        { status: 400 },
      );
    }

    // Check if user has permission to update this onboarding
    const existingOnboarding = await prisma.spaceOnboarding.findUnique({
      where: { id: onboardingId },
      include: {
        space: {
          select: {
            ownerId: true,
            memberships: {
              where: {
                userId: session.user.id,
                role: { in: ["OWNER", "ADMIN"] },
              },
            },
          },
        },
      },
    });

    if (!existingOnboarding) {
      return NextResponse.json(
        { error: "Onboarding not found" },
        { status: 404 },
      );
    }

    const isOwner = existingOnboarding.space.ownerId === session.user.id;
    const isAdmin = existingOnboarding.space.memberships.length > 0;

    if (!isOwner && !isAdmin) {
      return NextResponse.json(
        {
          error: "You do not have permission to update this onboarding",
        },
        { status: 403 },
      );
    }

    const body = await request.json();
    const { status, title, description, isRequired } = body;

    // Update onboarding
    const updatedOnboarding = await prisma.spaceOnboarding.update({
      where: { id: onboardingId },
      data: {
        ...(status && { status }),
        ...(title && { title }),
        ...(description !== undefined && { description }),
        ...(isRequired !== undefined && { isRequired }),
      },
    });

    return NextResponse.json({
      success: true,
      onboarding: updatedOnboarding,
    });
  } catch (error) {
    console.error("Error updating space onboarding:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
      },
      { status: 500 },
    );
  }
}

// DELETE method to delete onboarding
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const onboardingId = searchParams.get("id");

    if (!onboardingId) {
      return NextResponse.json(
        { error: "onboardingId is required" },
        { status: 400 },
      );
    }

    // Check if user has permission to delete this onboarding
    const existingOnboarding = await prisma.spaceOnboarding.findUnique({
      where: { id: onboardingId },
      include: {
        space: {
          select: {
            ownerId: true,
            memberships: {
              where: {
                userId: session.user.id,
                role: { in: ["OWNER", "ADMIN"] },
              },
            },
          },
        },
      },
    });

    if (!existingOnboarding) {
      return NextResponse.json(
        { error: "Onboarding not found" },
        { status: 404 },
      );
    }

    const isOwner = existingOnboarding.space.ownerId === session.user.id;
    const isAdmin = existingOnboarding.space.memberships.length > 0;

    if (!isOwner && !isAdmin) {
      return NextResponse.json(
        {
          error: "You do not have permission to delete this onboarding",
        },
        { status: 403 },
      );
    }

    // Delete onboarding (cascade will handle steps and progress)
    await prisma.spaceOnboarding.delete({
      where: { id: onboardingId },
    });

    return NextResponse.json({
      success: true,
      message: "Onboarding deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting space onboarding:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
      },
      { status: 500 },
    );
  }
}
