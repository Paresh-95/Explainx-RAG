import { NextRequest, NextResponse } from "next/server";
import prisma from "@repo/db";
import { auth } from "../../../../auth";

// GET - Retrieve quiz progress
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const studyMaterialId = searchParams.get('studyMaterialId');

    if (!studyMaterialId) {
      return NextResponse.json({ error: "studyMaterialId is required" }, { status: 400 });
    }

    // Verify user has access to the study material
    const studyMaterial = await prisma.studyMaterial.findFirst({
      where: {
        id: studyMaterialId,
        OR: [
          { uploadedById: userId },
          {
            space: {
              OR: [
                { ownerId: userId },
                {
                  memberships: {
                    some: {
                      userId: userId,
                      status: "ACTIVE",
                    },
                  },
                },
              ],
            },
          },
        ],
      },
    });

    if (!studyMaterial) {
      return NextResponse.json({ error: "Study material not found or access denied" }, { status: 404 });
    }

    // Get quiz progress
    const quiz = await prisma.quiz.findUnique({
      where: {
        studyMaterialId_userId: {
          studyMaterialId,
          userId,
        },
      },
    });

    if (!quiz) {
      return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
    }

    const progress = {
      studyMaterialId: quiz.studyMaterialId,
      userId: quiz.userId,
      currentQuestionIndex: quiz.currentQuestionIndex,
      totalQuestions: quiz.totalQuestions,
      userAnswers: quiz.userAnswers,
      showFeedback: quiz.showFeedback,
      showScoreReport: quiz.showScoreReport,
      answeredCount: quiz.answeredCount,
      correctAnswers: quiz.correctAnswers,
      isCompleted: quiz.isCompleted,
      completedAt: quiz.completedAt,
      lastAttempted: quiz.lastAttempted,
      quizSetVersion: quiz.quizSetVersion,
    };

    return NextResponse.json({ progress });
  } catch (error) {
    console.error("Error fetching quiz progress:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST - Save/Update quiz progress
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { 
      studyMaterialId, 
      currentQuestionIndex, 
      userAnswers, 
      showFeedback, 
      showScoreReport, 
      quizSetVersion 
    } = body;

    if (!studyMaterialId) {
      return NextResponse.json({ error: "studyMaterialId is required" }, { status: 400 });
    }

    // Verify user has access to the study material
    const studyMaterial = await prisma.studyMaterial.findFirst({
      where: {
        id: studyMaterialId,
        OR: [
          { uploadedById: userId },
          {
            space: {
              OR: [
                { ownerId: userId },
                {
                  memberships: {
                    some: {
                      userId: userId,
                      status: "ACTIVE",
                    },
                  },
                },
              ],
            },
          },
        ],
      },
    });

    if (!studyMaterial) {
      return NextResponse.json({ error: "Study material not found or access denied" }, { status: 404 });
    }

    // Get existing quiz
    const existingQuiz = await prisma.quiz.findUnique({
      where: {
        studyMaterialId_userId: {
          studyMaterialId,
          userId,
        },
      },
    });

    if (!existingQuiz) {
      return NextResponse.json({ error: "Quiz not found for progress update" }, { status: 404 });
    }

    // Calculate completion stats
    const answeredCount = Object.keys(userAnswers || {}).length;
    const isCompleted = answeredCount === existingQuiz.totalQuestions;
    
    let correctAnswers = 0;
    if (isCompleted && existingQuiz.questions) {
      const questions = existingQuiz.questions as any[];
      correctAnswers = Object.entries(userAnswers || {}).reduce((count, [qIdx, answer]) => {
        const question = questions[Number(qIdx)];
        return question && question.correctOptionId === answer ? count + 1 : count;
      }, 0);
    }

    // Update progress
    const updatedQuiz = await prisma.quiz.update({
      where: {
        studyMaterialId_userId: {
          studyMaterialId,
          userId,
        },
      },
      data: {
        currentQuestionIndex: currentQuestionIndex ?? existingQuiz.currentQuestionIndex,
        userAnswers: userAnswers ?? existingQuiz.userAnswers,
        showFeedback: showFeedback ?? existingQuiz.showFeedback,
        showScoreReport: showScoreReport ?? existingQuiz.showScoreReport,
        answeredCount,
        correctAnswers: isCompleted ? correctAnswers : existingQuiz.correctAnswers,
        isCompleted,
        completedAt: isCompleted && !existingQuiz.isCompleted ? new Date() : existingQuiz.completedAt,
        lastAttempted: new Date(),
        quizSetVersion: quizSetVersion ?? existingQuiz.quizSetVersion,
      },
    });

    return NextResponse.json({ 
      success: true, 
      progress: {
        studyMaterialId: updatedQuiz.studyMaterialId,
        userId: updatedQuiz.userId,
        currentQuestionIndex: updatedQuiz.currentQuestionIndex,
        totalQuestions: updatedQuiz.totalQuestions,
        userAnswers: updatedQuiz.userAnswers,
        showFeedback: updatedQuiz.showFeedback,
        showScoreReport: updatedQuiz.showScoreReport,
        answeredCount: updatedQuiz.answeredCount,
        correctAnswers: updatedQuiz.correctAnswers,
        isCompleted: updatedQuiz.isCompleted,
        completedAt: updatedQuiz.completedAt,
        lastAttempted: updatedQuiz.lastAttempted,
        quizSetVersion: updatedQuiz.quizSetVersion,
      },
      message: isCompleted ? "Quiz completed successfully" : "Progress saved successfully"
    });
  } catch (error) {
    console.error("Error saving quiz progress:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE - Reset quiz progress
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const studyMaterialId = searchParams.get('studyMaterialId');

    if (!studyMaterialId) {
      return NextResponse.json({ error: "studyMaterialId is required" }, { status: 400 });
    }

    // Reset progress while keeping questions
    const updatedQuiz = await prisma.quiz.update({
      where: {
        studyMaterialId_userId: {
          studyMaterialId,
          userId,
        },
      },
      data: {
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
      message: "Quiz progress reset successfully",
      progress: {
        studyMaterialId: updatedQuiz.studyMaterialId,
        userId: updatedQuiz.userId,
        currentQuestionIndex: updatedQuiz.currentQuestionIndex,
        totalQuestions: updatedQuiz.totalQuestions,
        userAnswers: updatedQuiz.userAnswers,
        showFeedback: updatedQuiz.showFeedback,
        showScoreReport: updatedQuiz.showScoreReport,
        answeredCount: updatedQuiz.answeredCount,
        correctAnswers: updatedQuiz.correctAnswers,
        isCompleted: updatedQuiz.isCompleted,
        completedAt: updatedQuiz.completedAt,
        lastAttempted: updatedQuiz.lastAttempted,
        quizSetVersion: updatedQuiz.quizSetVersion,
      }
    });
  } catch (error) {
    console.error("Error resetting quiz progress:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}