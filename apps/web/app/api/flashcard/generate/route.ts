import { NextRequest, NextResponse } from "next/server";
import prisma from "@repo/db";
import { auth } from "../../../../auth";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    // Check for server-to-server authentication
    const serverAuthToken = request.headers.get("X-Server-Auth");

    let isAuthenticated = false;
    let authenticatedUserId: string | undefined = undefined;

    console.log("serverAuthToken", serverAuthToken);
    console.log("userId", userId);

    // Option 1: Check if it's a server-to-server call with valid token
    if (
      serverAuthToken &&
      serverAuthToken === process.env.BACKEND_API_KEY &&
      userId
    ) {
      isAuthenticated = true;
      authenticatedUserId = userId;
    }
    // Option 2: Regular user session authentication
    else {
      const session = await auth();
      if (session?.user?.id) {
        isAuthenticated = true;
        authenticatedUserId = session.user.id;
      }
    }

    // Handle unauthorized access
    if (!isAuthenticated || !authenticatedUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { studyMaterialId, spaceId, forceRegenerate = false } = body;

    // Check if flashcard set already exists for this study material and user
    const existingFlashcardSet = await prisma.flashcardSet.findUnique({
      where: {
        studyMaterialId_userId: {
          studyMaterialId,
          userId: authenticatedUserId,
        },
      },
      select: {
        flashcards: true,
        totalCards: true,
        updatedAt: true,
      },
    });

    // If flashcard set already exists and not forcing regeneration, return it
    if (existingFlashcardSet && !forceRegenerate) {
      return NextResponse.json({
        success: true,
        message: "Flashcards retrieved from database",
        flashcards: existingFlashcardSet.flashcards,
        totalCards: existingFlashcardSet.totalCards,
        lastUpdated: existingFlashcardSet.updatedAt,
      });
    }

    // Validate that the study material exists and belongs to the user
    const studyMaterial = await prisma.studyMaterial.findFirst({
      where: {
        id: studyMaterialId,
        OR: [
          { uploadedById: authenticatedUserId },
          {
            space: {
              OR: [
                { ownerId: authenticatedUserId },
                {
                  memberships: {
                    some: {
                      userId: authenticatedUserId,
                      status: "ACTIVE",
                    },
                  },
                },
              ],
            },
          },
        ],
      },
      include: {
        space: true,
      },
    });

    if (!studyMaterial) {
      return NextResponse.json(
        { error: "Study material not found or access denied" },
        { status: 404 },
      );
    }

    // Get backend URL
    const backendUrl = process.env.BACKEND_URL || "http://localhost:8000";

    try {
      // Trigger backend flashcard generation
      const backendResponse = await fetch(
        `${backendUrl}/api/flashcards/generate`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.BACKEND_API_KEY}`,
            "X-User-ID": userId!,
          },
          body: JSON.stringify({
            studyMaterialId,
            spaceId: spaceId || studyMaterial.spaceId,
          }),
        },
      );

      if (!backendResponse.ok) {
        const errorData = await backendResponse.json().catch(() => ({}));
        console.error("Backend flashcard generation failed:", errorData);

        return NextResponse.json(
          {
            error: "Backend flashcard generation failed",
            details: errorData.error || "Unknown error",
          },
          { status: 500 },
        );
      }

      const backendResult = await backendResponse.json();

      // Save flashcards as JSON to database
      if (backendResult.flashcards && Array.isArray(backendResult.flashcards)) {
        // Prepare flashcard data with proper structure
        const flashcardsData = backendResult.flashcards.map((card: any, index: number) => ({
          id: `card_${index + 1}`, // Add unique ID for frontend use
          question: card.question,
          answer: card.answer,
          hint: card.hint || null,
          order: index + 1,
        }));

        // Use upsert to create or update the flashcard set
        const flashcardSet = await prisma.flashcardSet.upsert({
          where: {
            studyMaterialId_userId: {
              studyMaterialId,
              userId: authenticatedUserId,
            },
          },
          update: {
            flashcards: flashcardsData,
            totalCards: flashcardsData.length,
            spaceId: spaceId || studyMaterial.spaceId || null,
            updatedAt: new Date(),
          },
          create: {
            flashcards: flashcardsData,
            totalCards: flashcardsData.length,
            studyMaterialId,
            userId: authenticatedUserId,
            spaceId: spaceId || studyMaterial.spaceId || null,
          },
          select: {
            flashcards: true,
            totalCards: true,
            updatedAt: true,
          },
        });

        console.log(`Saved ${flashcardsData.length} flashcards as JSON to database`);

        return NextResponse.json({
          success: true,
          message: existingFlashcardSet 
            ? "Flashcards regenerated and saved successfully" 
            : "Flashcards generated and saved successfully",
          flashcards: flashcardSet.flashcards,
          totalCards: flashcardSet.totalCards,
          lastUpdated: flashcardSet.updatedAt,
        });
      }

      return NextResponse.json({
        success: false,
        error: "No flashcards generated by backend",
      }, { status: 500 });

    } catch (backendError) {
      console.error("Backend communication error:", backendError);

      return NextResponse.json(
        {
          error: "Failed to communicate with flashcard generation backend",
          details:
            backendError instanceof Error
              ? backendError.message
              : "Unknown error",
        },
        { status: 500 },
      );
    }
  } catch (error) {
    console.error("Flashcard generation error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// GET endpoint to retrieve existing flashcards
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const studyMaterialId = searchParams.get("studyMaterialId");

    if (!studyMaterialId) {
      return NextResponse.json(
        { error: "studyMaterialId is required" },
        { status: 400 }
      );
    }

    const flashcardSet = await prisma.flashcardSet.findUnique({
      where: {
        studyMaterialId_userId: {
          studyMaterialId,
          userId: session.user.id,
        },
      },
      select: {
        flashcards: true,
        totalCards: true,
        updatedAt: true,
      },
    });

    if (!flashcardSet) {
      return NextResponse.json(
        { error: "Flashcard set not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      flashcards: flashcardSet.flashcards,
      totalCards: flashcardSet.totalCards,
      lastUpdated: flashcardSet.updatedAt,
    });

  } catch (error) {
    console.error("Error retrieving flashcards:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}