import { ChatOpenAI } from "@langchain/openai";
import { z } from "zod";
import { discordNotifier } from "./discordNotifier";
import { qdrantService } from "./qdrantService";

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
    spaceId: string,
    count: number = 5,
    questionType?: string,
    examLength?: number,
  ): Promise<QuizQuestion[]> {
    try {
      console.log(
        `🔄 Generating quiz for space: ${spaceId} with ${count} questions`,
      );

      // 1. Fetch vectors related to the space's content from Qdrant
      const vectorStore = await initializeVectorStore();

      // Build Qdrant filter
      const filter: any = { must: [] };
      if (spaceId) {
        filter.must.push({
          key: "metadata.spaceId",
          match: { value: spaceId },
        });
      }

      console.log(`🔍 Searching for content with filter:`, filter);

      // Use a dummy query to get all docs with filter (since we want all content for the space)
      const results = await vectorStore.similaritySearchWithScore(
        "comprehensive quiz content",
        100,
        filter,
      );

      console.log(
        `📚 Found ${results.length} content chunks for quiz generation`,
      );

      if (!results.length) {
        throw new Error("No content found in the specified space/materials");
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

        // Build question type prompt
        let questionTypePrompt = "multiple-choice quiz questions";
        if (questionType === "mcq") {
          questionTypePrompt = "multiple-choice quiz questions";
        } else if (questionType === "text") {
          questionTypePrompt =
            "short answer (text) quiz questions (no options, just a short answer)";
        } else if (questionType === "mixed") {
          questionTypePrompt =
            "a mix of multiple-choice and short answer quiz questions";
        }

        // Add exam length to prompt if provided
        let examLengthPrompt = "";
        if (examLength) {
          examLengthPrompt = `\nThe exam should be designed to take about ${examLength} minutes.`;
        }

        const prompt = `Based on the following chapter content, generate exactly ${questionsPerChapter} ${questionTypePrompt} that cover the most important concepts.${examLengthPrompt}

Each question should have:
- A clear, concise question that tests understanding
${questionType === "text" ? "- A short answer (no options)" : "- Four options (A, B, C, D) with one correct answer"}
- An explanation of why the correct answer is right

Chapter: ${chapter.title}

Content:
${chapter.content}

Please generate ${questionsPerChapter} quiz questions that test comprehension of the key concepts from this chapter.`;

        try {
          // Generate questions using structured output
          const response = await structuredModel.invoke(prompt);

          // Validate and add questions
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
          "Failed to generate any quiz questions from the content",
        );
      }

      // 4. Shuffle and limit the number of questions
      const shuffledQuestions = allQuestions
        .sort(() => Math.random() - 0.5)
        .slice(0, count);

      console.log(
        `✅ Successfully generated ${shuffledQuestions.length} quiz questions`,
      );

      return shuffledQuestions;
    } catch (error) {
      await discordNotifier.sendErrorNotification(error as Error, {
        operation: "generateQuiz",
        spaceId,
        count,
        questionType,
        examLength,
      });
      console.error("❌ Quiz generation failed:", error);

      // Improve error message to be more specific about space-related issues
      const errorMessage =
        error instanceof Error && error.message.includes("No content found")
          ? "Failed to generate quiz: The space/materials either have no content or the content hasn't been processed yet"
          : `Failed to generate quiz: ${error instanceof Error ? error.message : error}`;
      throw new Error(errorMessage);
    }
  }

  /**
   * Test the Qdrant connection for quiz generation
   */
  async testConnection(): Promise<boolean> {
    try {
      const healthCheck = await qdrantService.healthCheck();
      console.log(
        `✅ QuizGenerator: Qdrant connection test - ${healthCheck.status}`,
      );
      return healthCheck.connection;
    } catch (error) {
      console.error("❌ QuizGenerator: Qdrant connection test failed:", error);
      return false;
    }
  }

  /**
   * Get content statistics for a specific space
   */
  async getSpaceContentStats(spaceId: string) {
    try {
      const vectorStore = await initializeVectorStore();

      // Build filter for the space
      const filter: any = { must: [] };
      if (spaceId) {
        filter.must.push({
          key: "metadata.spaceId",
          match: { value: spaceId },
        });
      }

      // Get all content for the space
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

      return {
        spaceId,
        totalChunks: matches.length,
        chaptersGenerated: chapters.length,
        averageChunkLength:
          matches.length > 0
            ? Math.round(
                matches.reduce(
                  (sum, match) =>
                    sum +
                    (match.pageContent?.length ||
                      match.metadata?.text?.length ||
                      0),
                  0,
                ) / matches.length,
              )
            : 0,
        studyMaterials: [
          ...new Set(
            matches.map((m) => m.metadata?.studyMaterialId).filter(Boolean),
          ),
        ],
        qdrantConfig: qdrantService.getStatus().config,
      };
    } catch (error) {
      await discordNotifier.sendErrorNotification(error as Error, {
        operation: "getSpaceContentStats - QuizGenerator",
        spaceId,
      });
      console.error("❌ Failed to get space content stats:", error);
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
        qdrantConfig: qdrantService.getStatus().config,
        model: process.env.LLM_MODEL || "gpt-3.5-turbo",
        embeddingModel: "text-embedding-ada-002",
        supportedQuestionTypes: ["mcq", "text", "mixed"],
        chapterOrganization: {
          chunkThreshold: 5,
          dynamicChapterGeneration: true,
        },
        features: [
          "Space-based content filtering",
          "Chapter-based question organization",
          "Multiple question types support",
          "Configurable exam length",
          "Question shuffling and limiting",
          "Structured output with Zod validation",
          "HTTPS Qdrant connection",
          "Error handling and Discord notifications",
          "Content statistics and analysis",
        ],
      };
    } catch (error) {
      await discordNotifier.sendErrorNotification(error as Error, {
        operation: "getGenerationStats - QuizGenerator",
      });
      console.error("❌ Failed to get quiz generation stats:", error);
      throw error;
    }
  }
}
