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
    const { studyMaterialId, count = 5, forceRegenerate = false } = body;

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
        { status: 404 }
      );
    }

    // Check for existing quiz in database (unless force regenerating)
    if (!forceRegenerate) {
      const existingQuiz = await prisma.quiz.findUnique({
        where: {
          studyMaterialId_userId: {
            studyMaterialId,
            userId: authenticatedUserId,
          },
        },
      });

      if (existingQuiz) {
        return NextResponse.json({
          success: true,
          message: "Retrieved existing quiz",
          questions: existingQuiz.questions,
          lastUpdated: existingQuiz.updatedAt,
          cached: true,
          progress: {
            currentQuestionIndex: existingQuiz.currentQuestionIndex,
            userAnswers: existingQuiz.userAnswers,
            showFeedback: existingQuiz.showFeedback,
            showScoreReport: existingQuiz.showScoreReport,
            answeredCount: existingQuiz.answeredCount,
            correctAnswers: existingQuiz.correctAnswers,
            isCompleted: existingQuiz.isCompleted,
            completedAt: existingQuiz.completedAt,
            lastAttempted: existingQuiz.lastAttempted,
          },
        });
      }
    }

    // Get backend URL
    const backendUrl = process.env.BACKEND_URL || "http://localhost:8000";

    try {
      // Trigger backend quiz generation
      const backendResponse = await fetch(`${backendUrl}/api/quiz/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.BACKEND_API_KEY}`,
          "X-User-ID": authenticatedUserId,
        },
        body: JSON.stringify({
          studyMaterialId,
          count,
          forceRegenerate,
        }),
      });

      if (!backendResponse.ok) {
        const errorData = await backendResponse.json().catch(() => ({}));
        console.error("Backend quiz generation failed:", errorData);

        return NextResponse.json(
          {
            error: "Backend quiz generation failed",
            details: errorData.error || "Unknown error",
          },
          { status: 500 }
        );
      }

      const backendResult = await backendResponse.json();

      // Save or update quiz in unified table
      const savedQuiz = await prisma.quiz.upsert({
        where: {
          studyMaterialId_userId: {
            studyMaterialId,
            userId: authenticatedUserId,
          },
        },
        update: {
          questions: backendResult.questions,
          totalQuestions: backendResult.questions.length,
          quizSetVersion: new Date().toISOString(),
          updatedAt: new Date(),
          // Reset progress on regenerate
          ...(forceRegenerate && {
            currentQuestionIndex: 0,
            userAnswers: {},
            showFeedback: {},
            showScoreReport: false,
            answeredCount: 0,
            correctAnswers: null,
            isCompleted: false,
            completedAt: null,
            lastAttempted: new Date(),
          }),
        },
        create: {
          studyMaterialId,
          userId: authenticatedUserId,
          spaceId: studyMaterial.spaceId,
          questions: backendResult.questions,
          totalQuestions: backendResult.questions.length,
          quizSetVersion: new Date().toISOString(),
          // Initial progress state
          currentQuestionIndex: 0,
          userAnswers: {},
          showFeedback: {},
          showScoreReport: false,
          answeredCount: 0,
          correctAnswers: null,
          isCompleted: false,
          completedAt: null,
          lastAttempted: new Date(),
        },
      });

      return NextResponse.json({
        success: true,
        message: forceRegenerate
          ? "Quiz regenerated successfully"
          : "Quiz generated successfully",
        questions: savedQuiz.questions,
        lastUpdated: savedQuiz.updatedAt,
        cached: false,
        progress: {
          currentQuestionIndex: savedQuiz.currentQuestionIndex,
          userAnswers: savedQuiz.userAnswers,
          showFeedback: savedQuiz.showFeedback,
          showScoreReport: savedQuiz.showScoreReport,
          answeredCount: savedQuiz.answeredCount,
          correctAnswers: savedQuiz.correctAnswers,
          isCompleted: savedQuiz.isCompleted,
          completedAt: savedQuiz.completedAt,
          lastAttempted: savedQuiz.lastAttempted,
        },
      });
    } catch (backendError) {
      console.error("Backend communication error:", backendError);

      // Fallback: Try to return cached quiz if backend fails
      if (!forceRegenerate) {
        const fallbackQuiz = await prisma.quiz.findUnique({
          where: {
            studyMaterialId_userId: {
              studyMaterialId,
              userId: authenticatedUserId,
            },
          },
        });

        if (fallbackQuiz) {
          return NextResponse.json({
            success: true,
            message: "Retrieved cached quiz (backend unavailable)",
            questions: fallbackQuiz.questions,
            lastUpdated: fallbackQuiz.updatedAt,
            cached: true,
            warning: "Using cached quiz due to backend unavailability",
            progress: {
              currentQuestionIndex: fallbackQuiz.currentQuestionIndex,
              userAnswers: fallbackQuiz.userAnswers,
              showFeedback: fallbackQuiz.showFeedback,
              showScoreReport: fallbackQuiz.showScoreReport,
              answeredCount: fallbackQuiz.answeredCount,
              correctAnswers: fallbackQuiz.correctAnswers,
              isCompleted: fallbackQuiz.isCompleted,
              completedAt: fallbackQuiz.completedAt,
              lastAttempted: fallbackQuiz.lastAttempted,
            },
          });
        }
      }

      return NextResponse.json(
        {
          error: "Failed to communicate with quiz generation backend",
          details:
            backendError instanceof Error
              ? backendError.message
              : "Unknown error",
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Quiz generation error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
