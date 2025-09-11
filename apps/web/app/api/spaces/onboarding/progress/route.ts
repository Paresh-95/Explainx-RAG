// app/api/spaces/onboarding/progress/route.ts
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@repo/db";
import { auth } from "../../../../../auth";

// Validation schemas
const updateProgressSchema = z.object({
  onboardingId: z.string(),
  stepId: z.string(),
  status: z.enum(["PENDING", "COMPLETED", "SKIPPED"]),
  timeSpentSeconds: z.number().optional(),
  currentStepNumber: z.number(),
  userNotes: z.string().optional(),
});

const completeOnboardingSchema = z.object({
  onboardingId: z.string(),
});

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    // Check if this is a completion request
    if ("onboardingId" in body && !("stepId" in body)) {
      return handleCompleteOnboarding(body, session.user.id);
    }

    // Otherwise handle step progress update
    return handleUpdateStepProgress(body, session.user.id);
  } catch (error) {
    console.error("Error updating onboarding progress:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: error.errors,
        },
        { status: 400 },
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

async function handleUpdateStepProgress(body: any, userId: string) {
  const validatedData = updateProgressSchema.parse(body);

  // Check if user has access to this onboarding
  const onboarding = await prisma.spaceOnboarding.findUnique({
    where: { id: validatedData.onboardingId },
    include: {
      space: {
        select: {
          id: true,
          ownerId: true,
          isPublic: true,
          memberships: {
            where: { userId },
          },
        },
      },
      steps: {
        where: { id: validatedData.stepId },
      },
    },
  });

  if (!onboarding) {
    return NextResponse.json(
      { error: "Onboarding not found" },
      { status: 404 },
    );
  }

  if (onboarding.steps.length === 0) {
    return NextResponse.json({ error: "Step not found" }, { status: 404 });
  }

  // Check access permissions
  const hasAccess =
    onboarding.space.ownerId === userId ||
    onboarding.space.isPublic ||
    onboarding.space.memberships.length > 0;

  if (!hasAccess) {
    return NextResponse.json(
      {
        error: "You do not have access to this onboarding",
      },
      { status: 403 },
    );
  }

  // Create or update overall progress
  const overallProgress = await prisma.spaceOnboardingProgress.upsert({
    where: {
      onboardingId_userId: {
        onboardingId: validatedData.onboardingId,
        userId,
      },
    },
    update: {
      currentStepNumber: validatedData.currentStepNumber,
      status: "IN_PROGRESS",
      lastActiveAt: new Date(),
    },
    create: {
      onboardingId: validatedData.onboardingId,
      userId,
      status: "IN_PROGRESS",
      currentStepNumber: validatedData.currentStepNumber,
      totalSteps: onboarding.totalSteps,
      startedAt: new Date(),
    },
  });

  // Create or update step progress
  const stepProgress = await prisma.spaceOnboardingStepProgress.upsert({
    where: {
      onboardingProgressId_stepId: {
        onboardingProgressId: overallProgress.id,
        stepId: validatedData.stepId,
      },
    },
    update: {
      status: validatedData.status,
      timeSpentSeconds: validatedData.timeSpentSeconds,
      userNotes: validatedData.userNotes,
      completedAt: validatedData.status === "COMPLETED" ? new Date() : null,
    },
    create: {
      onboardingProgressId: overallProgress.id,
      stepId: validatedData.stepId,
      userId,
      status: validatedData.status,
      timeSpentSeconds: validatedData.timeSpentSeconds,
      userNotes: validatedData.userNotes,
      startedAt: new Date(),
      completedAt: validatedData.status === "COMPLETED" ? new Date() : null,
    },
  });

  // Update completed steps count
  const completedStepsCount = await prisma.spaceOnboardingStepProgress.count({
    where: {
      onboardingProgressId: overallProgress.id,
      status: { in: ["COMPLETED", "SKIPPED"] },
    },
  });

  await prisma.spaceOnboardingProgress.update({
    where: { id: overallProgress.id },
    data: { completedSteps: completedStepsCount },
  });

  return NextResponse.json({
    success: true,
    progress: {
      id: overallProgress.id,
      completedSteps: completedStepsCount,
      totalSteps: onboarding.totalSteps,
    },
  });
}

async function handleCompleteOnboarding(body: any, userId: string) {
  const validatedData = completeOnboardingSchema.parse(body);

  // Check if user has access to this onboarding
  const onboarding = await prisma.spaceOnboarding.findUnique({
    where: { id: validatedData.onboardingId },
    include: {
      space: {
        select: {
          id: true,
          ownerId: true,
          isPublic: true,
          memberships: {
            where: { userId },
          },
        },
      },
    },
  });

  if (!onboarding) {
    return NextResponse.json(
      { error: "Onboarding not found" },
      { status: 404 },
    );
  }

  // Check access permissions
  const hasAccess =
    onboarding.space.ownerId === userId ||
    onboarding.space.isPublic ||
    onboarding.space.memberships.length > 0;

  if (!hasAccess) {
    return NextResponse.json(
      {
        error: "You do not have access to this onboarding",
      },
      { status: 403 },
    );
  }

  // Update progress to completed
  const progress = await prisma.spaceOnboardingProgress.upsert({
    where: {
      onboardingId_userId: {
        onboardingId: validatedData.onboardingId,
        userId,
      },
    },
    update: {
      status: "COMPLETED",
      completedAt: new Date(),
      lastActiveAt: new Date(),
    },
    create: {
      onboardingId: validatedData.onboardingId,
      userId,
      status: "COMPLETED",
      currentStepNumber: onboarding.totalSteps,
      completedSteps: onboarding.totalSteps,
      totalSteps: onboarding.totalSteps,
      startedAt: new Date(),
      completedAt: new Date(),
    },
  });

  return NextResponse.json({
    success: true,
    message: "Onboarding completed successfully",
    progress,
  });
}

// GET method to retrieve user's progress
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const onboardingId = searchParams.get("onboardingId");

    if (!onboardingId) {
      return NextResponse.json(
        {
          error: "onboardingId is required",
        },
        { status: 400 },
      );
    }

    // Get user's progress
    const progress = await prisma.spaceOnboardingProgress.findUnique({
      where: {
        onboardingId_userId: {
          onboardingId,
          userId: session.user.id,
        },
      },
      include: {
        stepProgress: {
          include: {
            step: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      progress,
    });
  } catch (error) {
    console.error("Error fetching onboarding progress:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
      },
      { status: 500 },
    );
  }
}
