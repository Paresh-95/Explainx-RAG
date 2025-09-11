// app/api/onboarding/route.ts
import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { onboardingSchema } from "../../../lib/validation";
import { auth } from "../../../auth";
import prisma from "@repo/db/client";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Validate request body
    const body = await req.json();
    const validatedData = onboardingSchema.parse(body);

    // Check if organization slug is already taken
    const existingOrg = await prisma.organization.findUnique({
      where: { slug: validatedData.organizationSlug },
    });
    if (existingOrg) {
      return NextResponse.json(
        { error: "Organization URL already taken" },
        { status: 400 },
      );
    }

    const existingUsername = await prisma.user.findUnique({
      where: { username: validatedData.username },
    });
    if (existingUsername) {
      return NextResponse.json(
        { error: "Username already taken" },
        { status: 400 },
      );
    }

    // Create organization and update user in a single transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create organization and link it to the user
      const organization = await tx.organization.create({
        data: {
          name: validatedData.organizationName,
          slug: validatedData.organizationSlug,
          users: {
            create: {
              user: {
                connect: {
                  email: session.user.email,
                },
              },
            },
          },
          // Set default subscription values
          subscriptionPlan: "FREE",
          subscriptionStatus: "ACTIVE",
        },
      });

      // Update user with username
      const userNameAdded = await tx.user.update({
        where: {
          email: session.user.email,
        },
        data: {
          username: validatedData.username,
        },
      });

      return { organization, user: userNameAdded };
    });

    return NextResponse.json({
      success: true,
      organization: result.organization,
      message: "Organization created successfully",
    });
  } catch (error) {
    if (error instanceof ZodError) {
      console.error("[Onboarding] Validation error:", {
        errors: error.errors,
        userEmail: await auth().then((session) => session?.user?.email),
      });
      return NextResponse.json(
        { error: "Invalid data", details: error.errors },
        { status: 400 },
      );
    }

    console.error("[Onboarding] Unexpected error:", {
      error: error instanceof Error ? error.message : error,
      userEmail: await auth().then((session) => session?.user?.email),
      stack: error instanceof Error ? error.stack : undefined,
    });
    return NextResponse.json(
      { error: "Failed to complete onboarding" },
      { status: 500 },
    );
  }
}
