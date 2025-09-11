// app/api/spaces/onboarding/complete/route.ts

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@repo/db";
import { auth } from "../../../../../auth";

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
              where: { userId: session.user.id },
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
      onboarding.space.ownerId === session.user.id ||
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
          userId: session.user.id,
        },
      },
      update: {
        status: "COMPLETED",
        completedAt: new Date(),
        lastActiveAt: new Date(),
        completedSteps: onboarding.totalSteps,
        currentStepNumber: onboarding.totalSteps,
      },
      create: {
        onboardingId: validatedData.onboardingId,
        userId: session.user.id,
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
  } catch (error) {
    console.error("Error completing onboarding:", error);

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
