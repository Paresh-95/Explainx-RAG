import { ChatOpenAI } from "@langchain/openai";
import { z } from "zod";
import { discordNotifier } from "./discordNotifier";
import { qdrantService } from "./qdrantService";

async function initializeVectorStore() {
  return await qdrantService.getDefaultVectorStore();
}

// Define the flashcard schema using Zod
const FlashcardSchema = z.object({
  question: z.string(),
  answer: z.string(),
  hint: z.string(),
});

// Define the schema for multiple flashcards
const FlashcardsArraySchema = z.object({
  flashcards: z.array(FlashcardSchema),
});

type Flashcard = z.infer<typeof FlashcardSchema>;

export class FlashcardGenerator {
  private readonly FLASHCARD_COUNT = 20;
  private model: ChatOpenAI;

  constructor() {
    this.model = new ChatOpenAI({
      model: process.env.LLM_MODEL!,
      temperature: 0.7,
      openAIApiKey: process.env.OPENAI_API_KEY,
    });
  }

  async generateFlashcards(studyMaterialId: string): Promise<Flashcard[]> {
    try {
      console.log(
        `🔄 Generating flashcards for study material: ${studyMaterialId}`,
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
        "comprehensive content summary",
        100,
        filter,
      );

      console.log(
        `📚 Found ${results.length} content chunks for flashcard generation`,
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

      // 2. Combine all relevant text chunks
      const context = matches
        .map((match: any) => match.pageContent || match.metadata?.text)
        .filter(Boolean)
        .join("\n\n");

      console.log(
        `📝 Prepared context of ${context.length} characters for flashcard generation`,
      );

      if (!context.trim()) {
        throw new Error("No valid content found in the study material");
      }

      // 3. Generate flashcards using LangChain with structured output
      console.log(
        `🤖 Generating ${this.FLASHCARD_COUNT} flashcards using LLM...`,
      );

      const structuredModel = this.model.withStructuredOutput(
        FlashcardsArraySchema,
      );

      const prompt = `Based on the following study material, generate exactly ${this.FLASHCARD_COUNT} flashcards. Each flashcard should have:
- A clear, concise question that tests understanding of the material
- A detailed answer or explanation
- A helpful hint that guides without giving away the answer

Focus on the most important concepts, key terms, processes, and relationships described in the material. Make sure the flashcards cover different aspects and difficulty levels.

Study Material:
${context}

Please generate the flashcards covering the most important concepts from this material.`;

      const response = await structuredModel.invoke(prompt);

      // 4. Validate and return the flashcards
      const validatedResponse = FlashcardsArraySchema.parse(response);

      console.log(
        `✅ Successfully generated ${validatedResponse.flashcards.length} flashcards`,
      );

      return validatedResponse.flashcards;
    } catch (error) {
      await discordNotifier.sendErrorNotification(error as Error, {
        operation: "generateFlashcards",
        studyMaterialId,
      });
      console.error("❌ Flashcard generation failed:", error);
      throw new Error(`Failed to generate flashcards: ${error}`);
    }
  }

  /**
   * Test the Qdrant connection for flashcard generation
   */
  async testConnection(): Promise<boolean> {
    try {
      // Test connection using centralized service
      const connectionOk = await qdrantService.testConnection();
      if (connectionOk) {
        console.log("✅ FlashcardGenerator: Qdrant connection successful");
        
        // Test vector store connection
        await initializeVectorStore();
        console.log("✅ FlashcardGenerator: Vector store connection successful");
      }

      return connectionOk;
    } catch (error) {
      console.error(
        "❌ FlashcardGenerator: Qdrant connection test failed:",
        error,
      );
      return false;
    }
  }

  /**
   * Get statistics about the flashcard generation capabilities
   */
  async getGenerationStats() {
    try {
      const connectionOk = await this.testConnection();
      const serviceStatus = qdrantService.getStatus();

      return {
        connectionStatus: connectionOk ? "Connected" : "Disconnected",
        qdrantConfig: serviceStatus.config,
        flashcardCount: this.FLASHCARD_COUNT,
        model: process.env.LLM_MODEL || "gpt-3.5-turbo",
        embeddingModel: "text-embedding-ada-002",
        features: [
          "Automatic content extraction from vector database",
          "Structured output with Zod validation",
          "Configurable flashcard count",
          "Context-aware question generation",
          "Multi-level difficulty coverage",
          "Centralized Qdrant service integration",
          "Error handling and Discord notifications",
        ],
      };
    } catch (error) {
      await discordNotifier.sendErrorNotification(error as Error, {
        operation: "getGenerationStats - FlashcardGenerator",
      });
      console.error("❌ Failed to get flashcard generation stats:", error);
      throw error;
    }
  }
}

