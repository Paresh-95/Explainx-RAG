import { NextRequest, NextResponse } from "next/server";
import prisma from "@repo/db";
import { auth } from "../../../../auth";

// GET - Retrieve quiz statistics
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const studyMaterialId = searchParams.get('studyMaterialId');
    const spaceId = searchParams.get('spaceId');

    // Single study material stats
    if (studyMaterialId) {
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

      // Get quiz for this study material
      const quiz = await prisma.quiz.findUnique({
        where: {
          studyMaterialId_userId: {
            studyMaterialId,
            userId,
          },
        },
      });

      // Calculate stats
      const stats = {
        hasQuiz: !!quiz,
        totalQuestions: quiz?.totalQuestions || 0,
        hasAttempted: quiz ? Object.keys(quiz.userAnswers as any || {}).length > 0 : false,
        isCompleted: quiz?.isCompleted || false,
        currentProgress: {
          answeredCount: quiz?.answeredCount || 0,
          currentQuestionIndex: quiz?.currentQuestionIndex || 0,
          showScoreReport: quiz?.showScoreReport || false,
          progressPercentage: quiz?.totalQuestions 
            ? Math.round(((quiz.answeredCount || 0) / quiz.totalQuestions) * 100)
            : 0,
        },
        lastAttempted: quiz?.lastAttempted,
        completedAt: quiz?.completedAt,
        score: quiz?.isCompleted ? {
          correct: quiz.correctAnswers || 0,
          total: quiz.totalQuestions,
          percentage: quiz.totalQuestions > 0 
            ? Math.round(((quiz.correctAnswers || 0) / quiz.totalQuestions) * 100)
            : 0,
        } : null,
        quizVersion: quiz?.quizSetVersion,
      };

      return NextResponse.json({ stats });
    }

    // Space-wide stats (if spaceId provided)
    if (spaceId) {
      // Verify user has access to the space
      const space = await prisma.space.findFirst({
        where: {
          id: spaceId,
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
      });

      if (!space) {
        return NextResponse.json({ error: "Space not found or access denied" }, { status: 404 });
      }

      // Get aggregated stats for all study materials in the space
      const [totalMaterials, userQuizzes] = await Promise.all([
        prisma.studyMaterial.count({
          where: { spaceId },
        }),
        prisma.quiz.findMany({
          where: { spaceId, userId },
          select: {
            isCompleted: true,
            correctAnswers: true,
            totalQuestions: true,
            completedAt: true,
            answeredCount: true,
            studyMaterial: {
              select: {
                title: true,
              },
            },
          },
        }),
      ]);

      const completedQuizzes = userQuizzes.filter(q => q.isCompleted);
      const attemptedQuizzes = userQuizzes.filter(q => q.answeredCount > 0);
      const totalScore = completedQuizzes.reduce((sum, q) => sum + (q.correctAnswers || 0), 0);
      const totalPossible = completedQuizzes.reduce((sum, q) => sum + q.totalQuestions, 0);

      const spaceStats = {
        totalStudyMaterials: totalMaterials,
        materialsWithQuizzes: userQuizzes.length,
        userProgress: {
          totalAttempted: attemptedQuizzes.length,
          totalCompleted: completedQuizzes.length,
          completionRate: userQuizzes.length > 0 
            ? Math.round((completedQuizzes.length / userQuizzes.length) * 100)
            : 0,
          averageScore: totalPossible > 0 
            ? Math.round((totalScore / totalPossible) * 100)
            : 0,
          overallProgress: totalMaterials > 0 
            ? Math.round((userQuizzes.length / totalMaterials) * 100)
            : 0,
        },
        recentActivity: userQuizzes
          .filter(q => q.completedAt)
          .sort((a, b) => new Date(b.completedAt!).getTime() - new Date(a.completedAt!).getTime())
          .slice(0, 5)
          .map(q => ({
            completedAt: q.completedAt,
            score: q.totalQuestions > 0 
              ? Math.round(((q.correctAnswers || 0) / q.totalQuestions) * 100)
              : 0,
            studyMaterial: q.studyMaterial.title,
          })),
      };

      return NextResponse.json({ spaceStats });
    }

    // User-wide stats (all spaces)
    const userQuizzes = await prisma.quiz.findMany({
      where: { userId },
      select: {
        isCompleted: true,
        correctAnswers: true,
        totalQuestions: true,
        completedAt: true,
        answeredCount: true,
        studyMaterial: {
          select: {
            title: true,
            space: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    const completedQuizzes = userQuizzes.filter(q => q.isCompleted);
    const attemptedQuizzes = userQuizzes.filter(q => q.answeredCount > 0);
    const totalScore = completedQuizzes.reduce((sum, q) => sum + (q.correctAnswers || 0), 0);
    const totalPossible = completedQuizzes.reduce((sum, q) => sum + q.totalQuestions, 0);

    // Calculate performance trends (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentCompletions = completedQuizzes.filter(q => 
      q.completedAt && new Date(q.completedAt) >= thirtyDaysAgo
    );

    const userStats = {
      totalQuizzes: userQuizzes.length,
      totalAttempted: attemptedQuizzes.length,
      totalCompleted: completedQuizzes.length,
      completionRate: userQuizzes.length > 0 
        ? Math.round((completedQuizzes.length / userQuizzes.length) * 100)
        : 0,
      overallScore: totalPossible > 0 
        ? Math.round((totalScore / totalPossible) * 100)
        : 0,
      performance: {
        totalCorrectAnswers: totalScore,
        totalPossibleAnswers: totalPossible,
        averageQuizScore: completedQuizzes.length > 0
          ? Math.round(completedQuizzes.reduce((sum, q) => {
              return sum + (q.totalQuestions > 0 ? ((q.correctAnswers || 0) / q.totalQuestions) * 100 : 0);
            }, 0) / completedQuizzes.length)
          : 0,
        recentActivity: {
          last30Days: recentCompletions.length,
          averageRecentScore: recentCompletions.length > 0
            ? Math.round(recentCompletions.reduce((sum, q) => {
                return sum + (q.totalQuestions > 0 ? ((q.correctAnswers || 0) / q.totalQuestions) * 100 : 0);
              }, 0) / recentCompletions.length)
            : 0,
        },
      },
      recentActivity: userQuizzes
        .filter(q => q.completedAt)
        .sort((a, b) => new Date(b.completedAt!).getTime() - new Date(a.completedAt!).getTime())
        .slice(0, 10)
        .map(q => ({
          completedAt: q.completedAt,
          score: q.totalQuestions > 0 
            ? Math.round(((q.correctAnswers || 0) / q.totalQuestions) * 100)
            : 0,
          studyMaterial: q.studyMaterial.title,
          space: q.studyMaterial.space?.name,
        })),
    };

    return NextResponse.json({ userStats });
  } catch (error) {
    console.error("Error fetching quiz statistics:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}