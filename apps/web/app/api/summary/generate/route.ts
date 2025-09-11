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
        if (serverAuthToken && serverAuthToken === process.env.BACKEND_API_KEY && userId) {
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
        const { studyMaterialId, forceRegenerate = false } = body;

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

        // Check for existing summary in database (unless force regenerating)
        if (!forceRegenerate) {
            const existingSummarySet = await prisma.summarySet.findUnique({
                where: {
                    studyMaterialId_userId: {
                        studyMaterialId,
                        userId: authenticatedUserId,
                    },
                },
            });

            if (existingSummarySet) {
                return NextResponse.json({
                    success: true,
                    message: "Retrieved existing summary",
                    summary: existingSummarySet.summary,
                    lastUpdated: existingSummarySet.updatedAt,
                    cached: true,
                });
            }
        }

        // Get backend URL
        const backendUrl = process.env.BACKEND_URL || "http://localhost:8000";

        try {
            // Trigger backend summary generation
            const backendResponse = await fetch(
                `${backendUrl}/api/summary/generate`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${process.env.BACKEND_API_KEY}`,
                        "X-User-ID": authenticatedUserId,
                    },
                    body: JSON.stringify({
                        studyMaterialId,
                        forceRegenerate,
                    }),
                },
            );

            if (!backendResponse.ok) {
                const errorData = await backendResponse.json().catch(() => ({}));
                console.error("Backend summary generation failed:", errorData);

                return NextResponse.json(
                    {
                        error: "Backend summary generation failed",
                        details: errorData.error || "Unknown error",
                    },
                    { status: 500 },
                );
            }

            const backendResult = await backendResponse.json();

            // Save or update summary set in database
            const savedSummarySet = await prisma.summarySet.upsert({
                where: {
                    studyMaterialId_userId: {
                        studyMaterialId,
                        userId: authenticatedUserId,
                    },
                },
                update: {
                    summary: backendResult.summary,
                    updatedAt: new Date(),
                },
                create: {
                    studyMaterialId,
                    userId: authenticatedUserId,
                    spaceId: studyMaterial.spaceId,
                    summary: backendResult.summary,
                },
            });

            return NextResponse.json({
                success: true,
                message: forceRegenerate ? "Summary regenerated successfully" : "Summary generated successfully",
                summary: savedSummarySet.summary,
                lastUpdated: savedSummarySet.updatedAt,
                cached: false,
            });

        } catch (backendError) {
            console.error("Backend communication error:", backendError);

            // Fallback: Try to return cached summary if backend fails
            if (!forceRegenerate) {
                const fallbackSummarySet = await prisma.summarySet.findUnique({
                    where: {
                        studyMaterialId_userId: {
                            studyMaterialId,
                            userId: authenticatedUserId,
                        },
                    },
                });

                if (fallbackSummarySet) {
                    return NextResponse.json({
                        success: true,
                        message: "Retrieved cached summary (backend unavailable)",
                        summary: fallbackSummarySet.summary,
                        lastUpdated: fallbackSummarySet.updatedAt,
                        cached: true,
                        warning: "Using cached summary due to backend unavailability",
                    });
                }
            }

            return NextResponse.json(
                {
                    error: "Failed to communicate with summary generation backend",
                    details:
                        backendError instanceof Error ? backendError.message : "Unknown error",
                },
                { status: 500 },
            );
        }
    } catch (error) {
        console.error("Summary generation error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}