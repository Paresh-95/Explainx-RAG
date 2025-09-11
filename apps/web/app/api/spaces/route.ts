// web/app/api/spaces/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "../../../auth";
import prisma from "@repo/db";
import { z } from "zod";
import { SpaceQuerySchema, SlugSchema } from "../../../lib/validation";

// Schema for space creation
const CreateSpaceSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  isPublic: z.boolean().default(false),
  visibility: z.enum(["PUBLIC", "PRIVATE", "SHARED"]).default("PRIVATE"),
  slug: z
    .string()
    .min(1, "Slug is required")
    .regex(
      /^[a-z0-9-]+$/,
      "Slug can only contain lowercase letters, numbers, and hyphens",
    )
    .min(3, "Slug must be at least 3 characters")
    .max(50, "Slug must be less than 50 characters"),
});

// Function to generate random alphanumeric slug
const generateRandomSlug = (length: number = 8) => {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

export async function POST(request: NextRequest) {
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

    const body = await request.json();

    // Validate the request body
    try {
      const validatedData = CreateSpaceSchema.parse(body);

      // Check if slug already exists
      const existingSlug = await prisma.space.findUnique({
        where: {
          slug: validatedData.slug,
        },
      });

      if (existingSlug) {
        return NextResponse.json(
          {
            error:
              "A space with this slug already exists. Please choose a different one.",
            code: "SLUG_EXISTS",
          },
          { status: 400 },
        );
      }

      // Create space
      const space = await prisma.space.create({
        data: {
          name: validatedData.name,
          description: validatedData.description,
          slug: validatedData.slug,
          isPublic: validatedData.isPublic,
          visibility: validatedData.isPublic ? "PUBLIC" : "PRIVATE",
          ownerId: session.user.id,
        },
        include: {
          owner: {
            select: {
              username: true,
              name: true,
            },
          },
        },
      });

      return NextResponse.json({
        success: true,
        space,
        message: "Space created successfully",
      });
    } catch (validationError) {
      if (validationError instanceof z.ZodError) {
        return NextResponse.json(
          {
            error: "Validation failed",
            code: "VALIDATION_ERROR",
            details: validationError.flatten().fieldErrors,
            message: validationError.errors[0]?.message || "Invalid input data",
          },
          { status: 400 },
        );
      }
      throw validationError;
    }
  } catch (error: any) {
    console.error("Error creating space:", error);

    // Handle Prisma errors
    if (error.code === "P2002") {
      return NextResponse.json(
        {
          error: "A space with this information already exists",
          code: "DUPLICATE_ERROR",
        },
        { status: 400 },
      );
    }

    return NextResponse.json(
      {
        error: "Internal server error",
        code: "INTERNAL_ERROR",
      },
      { status: 500 },
    );
  }
}

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

    // Validate query parameters with defaults
    const queryValidation = SpaceQuerySchema.safeParse({
      isPublic: searchParams.get("isPublic") || "false",
      visibility: searchParams.get("visibility") || "PRIVATE",
      page: searchParams.get("page") || "1",
      limit: searchParams.get("limit") || "50",
    });

    if (!queryValidation.success) {
      return NextResponse.json(
        {
          error: "Invalid query parameters",
          code: "VALIDATION_ERROR",
          details: queryValidation.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    const { isPublic, visibility, page, limit } = queryValidation.data;

    // Build where clause using session user ID
    const whereClause: any = {
      ownerId: session.user.id,
    };
    // if (isPublic !== undefined) {
    //   whereClause.isPublic = isPublic === true;
    // }

    // if (visibility) {
    //   whereClause.visibility = visibility;
    // }

    const spaces = await prisma.space.findMany({
      where: whereClause,
      include: {
        studyMaterials: {
          select: {
            id: true,
            title: true,
            description: true,
            type: true,
            youtubeUrl: true,
            fileUrl: true,
            fileName: true,
            fileSize: true,
            mimeType: true,
            createdAt: true,
            updatedAt: true,
          },
        },
        owner: {
          select: {
            id: true,
            username: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      skip: (page - 1) * limit,
      take: limit,
    });

    // Get total count for pagination
    const totalCount = await prisma.space.count({
      where: whereClause,
    });

    return NextResponse.json({
      success: true,
      spaces: spaces.map((space) => ({
        ...space,
        contents: space.studyMaterials.length, // Add contents count
      })),
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching spaces:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        code: "INTERNAL_ERROR",
      },
      { status: 500 },
    );
  }
}
