// api/chat/query/route.ts - Updated version
import { NextRequest, NextResponse } from "next/server";
import prisma from "@repo/db";
import { auth } from "../../../../auth";
import { saveChat } from "../../../../lib/chat-service";
import OpenAI from "openai";
const RAG_BACKEND_URL = process.env.RAG_BACKEND_URL || "http://localhost:8000";

// Initialize OpenAI client
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(request: NextRequest) {
  try {
    // Check for server-to-server authentication
    const serverAuthToken = request.headers.get("X-Server-Auth");
    const userId = request.headers.get("X-User-ID");

    let isAuthenticated = false;
    let authenticatedUserId: string | undefined = undefined;

    // Option 1: Check if it's a server-to-server call with valid token
    if (
      serverAuthToken &&
      serverAuthToken === process.env.BACKEND_API_KEY &&
      userId
    ) {
      console.log("serverAuthToken", serverAuthToken);
      isAuthenticated = true;
      console.log("isAuthenticated", isAuthenticated);
      authenticatedUserId = userId;
    }
    //
    else {
      const session = await auth();
      if (session?.user?.id) {
        isAuthenticated = true;
        authenticatedUserId = session.user.id;
      }
    }

    // Handle unauthorized access
    if (!isAuthenticated || !authenticatedUserId) {
      console.log("Unauthorized");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      query,
      studyMaterialId,
      studyMaterialIds,
      spaceId,
      topK = 5,
      includeMetadata = true,
      useChunks = true, // Default to true to maintain existing behavior
    } = body;

    if (!query) {
      return NextResponse.json({ error: "Query is required" }, { status: 400 });
    }

    // If useChunks is false, query OpenAI directly
    if (useChunks === false) {
      try {
        console.log("Querying OpenAI directly (useChunks = false)");
        
        const response = await openai.chat.completions.create({
          model: process.env.LLM_MODEL || "gpt-4o-mini",
          messages: [
            {
              "role": "system",
              "content": "You are a helpful assistant that answers questions.\n\nGeneral Rules:\n- Answer based on the provided context by user\n- If the context doesn't contain relevant information, you can still answer the user.\n- If asked about something not in the context, You can answer it simple\n\nResponse Format:\n- If the user message contains any special '@' triggers (e.g., @quiz, @flashcards, @mindmap, @timeline), respond **only** with a valid JSON array or object — no extra text or markdown, and no explanations outside the array/object.\n- If there are **no '@' triggers**, respond in normal plain text format.\n- If **multiple '@' triggers** are present, return one combined JSON array, where each section begins with an object containing the \"type\" key as described below.\n\nSpecial Instructions Based on '@' Triggers:\n\n1. If the message contains '@quiz':\n  - Respond with a JSON array where:\n    - First item: { \"type\": \"quiz\" }\n    - Followed by 3 question objects with keys:\n      - \"question\": The multiple-choice question\n      - \"options\": An array of 4 possible answers\n      - \"answer\": The correct option\n      - \"hint\": A brief clue\n      - \"explanation\": Why the answer is correct\n\n2. If the message contains '@flashcards':\n  - Respond with a JSON array where:\n    - First item: { \"type\": \"flashcards\" }\n    - Followed by 3 flashcard objects with keys:\n      - \"question\": The front of the flashcard\n      - \"answer\": The correct answer\n      - \"hint\": A helpful memory aid\n\n3. If the message contains '@mindmap':\n  - Respond with a JSON object with the following structure:\n    { \"type\": \"mindmap\", \"nodes\": [...], \"edges\": [...] }\n  - Each node should be an object: { id: string, label: string, position: { x: number, y: number } }\n  - Each edge should be an object: { id: string, source: string, target: string }\n  - The mindmap MUST be simple and easy to understand:\n    - Only ONE root node.\n    - The root node should have exactly THREE direct subtopics.\n    - Each subtopic can have up to THREE subtopics (children), but NO more than that.\n    - Do NOT create more than two levels (root -> subtopic -> sub-subtopic).\n    - Do NOT add any extra nodes or deeper nesting.\n    - Make the structure clear and minimal.\n  - The nodes and edges should represent this simple mindmap structure from the context.\n  - Do NOT use Markmap markdown.\n  - Only output the JSON object, no extra text.\n\n4. If the message contains '@timeline':\n  - Respond with a JSON array where:\n    - First item: { \"type\": \"timeline\" }\n    - Followed by 3 or more event objects with keys:\n      - \"year\" (or \"date\"): A point in time\n      - \"event\": What happened\n      - \"note\": Optional brief context\n\nSTRICTLY ENFORCED:\n- If '@' triggers are used, output JSON **only** (no extra text).\n- If '@' triggers are not used, respond in normal, well-structured plain text.\n- Never change the required JSON format."
            } ,    
            {
              role: "user",
              content: query
            }
          ],
          temperature: 0.7,
          max_tokens: 5000,
        });

        const answer = response.choices?.[0]?.message?.content ?? "";

        console.log("answer", answer);

        const chatEntry = await saveChat(
          authenticatedUserId,
          query,
          answer,
          {
            spaceId,
            studyMaterialId,
            studyMaterialIds,
            sources: [],
            confidence: 1.0,
            ragMetadata: {
              topK, 
              includeMetadata,
              backendResponseTime: (response as any)?.headers?.get?.('X-Response-Time'),
              useChunks: true,
            },
          }
        );

        return NextResponse.json({
          answer,
          sources: [],
          confidence: 1.0,
          useChunks: false,
        });
          
        
        
      } catch (openaiError) {
        console.error("OpenAI API error:", openaiError);
        return NextResponse.json(
          {
            error: "Failed to query OpenAI",
            details: openaiError instanceof Error ? openaiError.message : "Unknown error",
          },
          { status: 500 }
        );
      }
    }

    // If studyMaterialId is provided, validate access to it
    if (studyMaterialId) {
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
      });

      if (!studyMaterial) {
        return NextResponse.json(
          { error: "Study material not found or access denied" },
          { status: 404 }
        );
      }
    }

    // If studyMaterialIds is provided, validate access to all of them
    if (studyMaterialIds && Array.isArray(studyMaterialIds)) {
      const studyMaterials = await prisma.studyMaterial.findMany({
        where: {
          id: { in: studyMaterialIds },
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
      });

      if (studyMaterials.length !== studyMaterialIds.length) {
        return NextResponse.json(
          { error: "One or more study materials not found or access denied" },
          { status: 404 }
        );
      }
    }

    // If spaceId is provided, validate access to it
    if (spaceId) {
      const space = await prisma.space.findFirst({
        where: {
          id: spaceId,
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
      });

      if (!space) {
        return NextResponse.json(
          { error: "Space not found or access denied" },
          { status: 404 }
        );
      }
    }

    try {
      const response = await fetch(`${RAG_BACKEND_URL}/api/query`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.BACKEND_API_KEY}`,
          "X-User-ID": authenticatedUserId,
        },
        body: JSON.stringify({
          query,
          studyMaterialId,
          studyMaterialIds,
          spaceId,
          topK,
          includeMetadata,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("RAG backend error:", errorData);
        return NextResponse.json(
          {
            error: "Failed to query RAG backend",
            details: errorData.error || "Unknown error",
          },
          { status: response.status }
        );
      }

      const data = await response.json();
      
      // Save the chat to Redis and DB
      try {
        const chatEntry = await saveChat(
          authenticatedUserId,
          query,
          data.answer,
          {
            spaceId,
            studyMaterialId,
            studyMaterialIds,
            sources: data.sources,
            confidence: data.confidence,
            ragMetadata: {
              topK,
              includeMetadata,
              backendResponseTime: response.headers.get('X-Response-Time'),
              useChunks: true,
            },
          }
        );
        
        // Add chat ID to the response
        data.chatId = chatEntry.id;
        
      } catch (saveError) {
        console.error('Failed to save chat, but returning response anyway:', saveError);
        // Don't fail the whole request if saving fails
      }
      
      return NextResponse.json(data);
    } catch (backendError) {
      console.error("RAG backend communication error:", backendError);
      return NextResponse.json(
        {
          error: "Failed to communicate with RAG backend",
          details:
            backendError instanceof Error
              ? backendError.message
              : "Unknown error",
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("RAG query error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}