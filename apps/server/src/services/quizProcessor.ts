import { ChatOpenAI } from "@langchain/openai";
import { z } from "zod";
import { discordNotifier } from "./discordNotifier";
import { qdrantService, qdrantConfig, COLLECTION_NAME } from "./qdrantService";

async function initializeVectorStore() {
  return await qdrantService.getDefaultVectorStore();
}

// Define the quiz schema using Zod
const QuizOptionSchema = z.object({
  id: z.string(),
  text: z.string(),
});

const QuizQuestionSchema = z.object({
  question: z.string(),
  options: z.array(QuizOptionSchema).length(4),
  correctOptionId: z.string(),
  explanation: z.string(),
});

// Define the schema for multiple quiz questions
const QuizQuestionsArraySchema = z.object({
  questions: z.array(QuizQuestionSchema),
});

type QuizQuestion = z.infer<typeof QuizQuestionSchema>;
type QuizQuestionsArray = z.infer<typeof QuizQuestionsArraySchema>;

interface Chapter {
  title: string;
  content: string;
  startIndex: number;
  endIndex: number;
}

export class QuizGenerator {
  private model: ChatOpenAI;

  constructor() {
    this.model = new ChatOpenAI({
      model: process.env.LLM_MODEL!,
      temperature: 0.7,
      openAIApiKey: process.env.OPENAI_API_KEY,
    });
  }

  private organizeIntoChapters(matches: any[]): Chapter[] {
    // Sort matches by chunkIndex
    const sortedMatches = matches.sort(
      (a, b) => a.metadata.chunkIndex - b.metadata.chunkIndex,
    );

    const chapters: Chapter[] = [];
    let currentChapter: Chapter | null = null;
    const CHUNK_THRESHOLD = 5; // Number of chunks to consider as a chapter

    sortedMatches.forEach((match, index) => {
      if (!currentChapter || index % CHUNK_THRESHOLD === 0) {
        // Start a new chapter
        currentChapter = {
          title: `Chapter ${chapters.length + 1}`,
          content: match.metadata.text || match.pageContent,
          startIndex: match.metadata.chunkIndex,
          endIndex: match.metadata.chunkIndex,
        };
        chapters.push(currentChapter);
      } else {
        // Add to current chapter
        currentChapter.content +=
          "\n\n" + (match.metadata.text || match.pageContent);
        currentChapter.endIndex = match.metadata.chunkIndex;
      }
    });

    return chapters;
  }

  async generateQuiz(
    studyMaterialId: string,
    count: number = 5,
  ): Promise<QuizQuestion[]> {
    try {
      console.log(
        `🔄 Generating quiz for study material: ${studyMaterialId} with ${count} questions`,
      );

      // 1. Fetch vectors related to the study material from Qdrant
      const vectorStore = await initializeVectorStore();

      // Build Qdrant filter
      const filter: any = { must: [] };
      if (studyMaterialId) {
        filter.must.push({
          key: "metadata.studyMaterialId",
          match: { value: studyMaterialId },
        });
      }

      console.log(`🔍 Searching for content with filter:`, filter);

      // Use a dummy query to get all docs with filter (since we want all content for the study material)
      const results = await vectorStore.similaritySearchWithScore(
        "comprehensive study material content",
        100,
        filter,
      );

      console.log(
        `📚 Found ${results.length} content chunks for quiz generation`,
      );

      if (!results.length) {
        throw new Error("No content found for the specified study material");
      }

      // Convert to compatible match format
      const matches = results.map(([doc, score]) => ({
        metadata: doc.metadata,
        pageContent: doc.pageContent,
        score,
      }));

      // 2. Organize content into chapters
      console.log(`📖 Organizing content into chapters...`);
      const chapters = this.organizeIntoChapters(matches);
      console.log(`📖 Created ${chapters.length} chapters`);

      // 3. Generate quiz questions for each chapter
      const allQuestions: QuizQuestion[] = [];

      for (const [index, chapter] of chapters.entries()) {
        console.log(
          `🤖 Generating questions for ${chapter.title} (${index + 1}/${chapters.length})`,
        );

        const questionsPerChapter = Math.ceil(count / chapters.length);
        const structuredModel = this.model.withStructuredOutput(
          QuizQuestionsArraySchema,
        );

        const prompt = `Based on the following chapter content, generate exactly ${questionsPerChapter} multiple-choice quiz questions that cover the most important concepts.

Each question should have:
- A clear, concise question that tests understanding
- Four options (A, B, C, D) with one correct answer
- An explanation of why the correct answer is right

Chapter: ${chapter.title}

Content:
${chapter.content}

Please generate ${questionsPerChapter} quiz questions that test comprehension of the key concepts from this chapter.`;

        try {
          const response = await structuredModel.invoke(prompt);
          const validatedResponse = QuizQuestionsArraySchema.parse(response);
          allQuestions.push(...validatedResponse.questions);

          console.log(
            `✅ Generated ${validatedResponse.questions.length} questions for ${chapter.title}`,
          );
        } catch (chapterError) {
          console.error(
            `❌ Failed to generate questions for ${chapter.title}:`,
            chapterError,
          );
          // Continue with other chapters even if one fails
        }
      }

      if (allQuestions.length === 0) {
        throw new Error(
          "Failed to generate any quiz questions from the study material content",
        );
      }

      // 4. Shuffle and limit the number of questions
      const shuffledQuestions = allQuestions
        .sort(() => Math.random() - 0.5)
        .slice(0, count);

      console.log(
        `✅ Successfully generated ${shuffledQuestions.length} quiz questions for study material`,
      );

      return shuffledQuestions;
    } catch (error) {
      await discordNotifier.sendErrorNotification(error as Error, {
        operation: "generateQuiz - Study Material",
        studyMaterialId,
        count,
      });
      console.error("❌ Quiz generation failed:", error);

      // Improve error message to be more specific about study material issues
      const errorMessage =
        error instanceof Error && error.message.includes("No content found")
          ? "Failed to generate quiz: The study material either has no content or hasn't been processed yet"
          : `Failed to generate quiz: ${error instanceof Error ? error.message : error}`;
      throw new Error(errorMessage);
    }
  }

  /**
   * Test the Qdrant connection for study material quiz generation
   */
  async testConnection(): Promise<boolean> {
    try {
      // Test connection through the centralized service
      const healthCheck = await qdrantService.healthCheck();
      console.log(
        `✅ Study Material QuizGenerator: Qdrant connection status: ${healthCheck.status}`,
      );

      if (healthCheck.status === 'healthy') {
        // Test vector store connection
        const vectorStore = await initializeVectorStore();
        console.log(
          "✅ Study Material QuizGenerator: Vector store connection successful",
        );
        return true;
      } else {
        console.error(
          "❌ Study Material QuizGenerator: Qdrant service unhealthy:",
          healthCheck.error,
        );
        return false;
      }
    } catch (error) {
      console.error(
        "❌ Study Material QuizGenerator: Qdrant connection test failed:",
        error,
      );
      return false;
    }
  }

  /**
   * Get content statistics for a specific study material
   */
  async getStudyMaterialContentStats(studyMaterialId: string) {
    try {
      console.log(
        `🔍 Getting content stats for study material: ${studyMaterialId}`,
      );

      const vectorStore = await initializeVectorStore();

      // Build filter for the study material
      const filter: any = { must: [] };
      if (studyMaterialId) {
        filter.must.push({
          key: "metadata.studyMaterialId",
          match: { value: studyMaterialId },
        });
      }

      // Get all content for the study material
      const results = await vectorStore.similaritySearchWithScore(
        "content analysis",
        1000, // Large number to get all content
        filter,
      );

      const matches = results.map(([doc, score]) => ({
        metadata: doc.metadata,
        pageContent: doc.pageContent,
        score,
      }));

      // Organize into chapters to get stats
      const chapters = this.organizeIntoChapters(matches);

      const totalContentLength = matches.reduce(
        (sum, match) =>
          sum +
          (match.pageContent?.length || match.metadata?.text?.length || 0),
        0,
      );

      const stats = {
        studyMaterialId,
        totalChunks: matches.length,
        chaptersGenerated: chapters.length,
        totalContentLength,
        averageChunkLength:
          matches.length > 0
            ? Math.round(totalContentLength / matches.length)
            : 0,
        chunkIndexRange:
          matches.length > 0
            ? {
                min: Math.min(
                  ...matches.map((m) => m.metadata?.chunkIndex || 0),
                ),
                max: Math.max(
                  ...matches.map((m) => m.metadata?.chunkIndex || 0),
                ),
              }
            : null,
        qdrantConfig: {
          host: qdrantConfig.host,
          port: qdrantConfig.port,
          https: qdrantConfig.https,
          collectionName: COLLECTION_NAME,
        },
      };

      console.log(`📊 Study material stats:`, stats);
      return stats;
    } catch (error) {
      await discordNotifier.sendErrorNotification(error as Error, {
        operation: "getStudyMaterialContentStats",
        studyMaterialId,
      });
      console.error("❌ Failed to get study material content stats:", error);
      throw error;
    }
  }

  /**
   * Get quiz generation capabilities and configuration
   */
  async getGenerationStats() {
    try {
      const connectionOk = await this.testConnection();

      return {
        connectionStatus: connectionOk ? "Connected" : "Disconnected",
        qdrantConfig: {
          host: qdrantConfig.host,
          port: qdrantConfig.port,
          https: qdrantConfig.https,
          collectionName: COLLECTION_NAME,
        },
        model: process.env.LLM_MODEL || "gpt-3.5-turbo",
        embeddingModel: "text-embedding-ada-002",
        defaultQuestionCount: 5,
        chapterOrganization: {
          chunkThreshold: 5,
          dynamicChapterGeneration: true,
        },
        features: [
          "Study material-based content filtering",
          "Chapter-based question organization",
          "Multiple-choice question generation",
          "Question shuffling and limiting",
          "Structured output with Zod validation",
          "HTTPS Qdrant connection",
          "Error handling and Discord notifications",
          "Content statistics and analysis",
          "Individual chapter error handling",
        ],
      };
    } catch (error) {
      await discordNotifier.sendErrorNotification(error as Error, {
        operation: "getGenerationStats - Study Material QuizGenerator",
      });
      console.error(
        "❌ Failed to get study material quiz generation stats:",
        error,
      );
      throw error;
    }
  }

  /**
   * Preview content organization for a study material (useful for debugging)
   */
  async previewContentOrganization(studyMaterialId: string) {
    try {
      console.log(
        `🔍 Previewing content organization for study material: ${studyMaterialId}`,
      );

      const vectorStore = await initializeVectorStore();

      // Build filter for the study material
      const filter: any = { must: [] };
      if (studyMaterialId) {
        filter.must.push({
          key: "metadata.studyMaterialId",
          match: { value: studyMaterialId },
        });
      }

      // Get content
      const results = await vectorStore.similaritySearchWithScore(
        "content preview",
        50, // Limit for preview
        filter,
      );

      const matches = results.map(([doc, score]) => ({
        metadata: doc.metadata,
        pageContent: doc.pageContent,
        score,
      }));

      // Organize into chapters
      const chapters = this.organizeIntoChapters(matches);

      // Create preview with truncated content
      const preview = {
        studyMaterialId,
        totalChunks: matches.length,
        chaptersPreview: chapters.map((chapter, index) => ({
          title: chapter.title,
          startIndex: chapter.startIndex,
          endIndex: chapter.endIndex,
          contentPreview: chapter.content.substring(0, 200) + "...",
          estimatedQuestions: Math.ceil(5 / chapters.length), // Based on default count of 5
        })),
        organizationMethod: "Sequential chunks grouped by threshold of 5",
      };

      console.log(`📖 Content organization preview:`, preview);
      return preview;
    } catch (error) {
      await discordNotifier.sendErrorNotification(error as Error, {
        operation: "previewContentOrganization",
        studyMaterialId,
      });
      console.error("❌ Failed to preview content organization:", error);
      throw error;
    }
  }
}

