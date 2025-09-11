import { ChatOpenAI } from "@langchain/openai";
import { z } from "zod";
import { discordNotifier } from "./discordNotifier";
import { qdrantService } from "./qdrantService";

async function initializeVectorStore() {
  return await qdrantService.getDefaultVectorStore();
}

// Define the section summary schema for longer content
const SectionSummarySchema = z.object({
  title: z.string(),
  summary: z.string(),
  keyPoints: z.array(z.string()),
});

// FIXED: Define the main summary schema using Zod - sections is now required
const SummarySchema = z.object({
  title: z.string(),
  mainSummary: z.string(),
  keyPoints: z.array(z.string()),
  importantConcepts: z.array(z.string()),
  difficulty: z.enum(["beginner", "intermediate", "advanced"]),
  estimatedReadingTime: z.number(),
  sections: z.array(SectionSummarySchema), // FIXED: Removed .optional() - now required
});

// Define the schema wrapper
const SummaryResponseSchema = z.object({
  summary: SummarySchema,
});

type Summary = z.infer<typeof SummarySchema>;
type SectionSummary = z.infer<typeof SectionSummarySchema>;

interface ContentChunk {
  text: string;
  chunkIndex: number;
  wordCount: number;
}

export class SummaryGenerator {
  private model: ChatOpenAI;
  private readonly MAX_CONTENT_LENGTH = 50000; // Character limit for single summary
  private readonly WORDS_PER_MINUTE = 200; // Average reading speed

  constructor() {
    this.model = new ChatOpenAI({
      model: process.env.LLM_MODEL!,
      temperature: 0.3, // Lower temperature for more consistent summaries
      openAIApiKey: process.env.OPENAI_API_KEY,
    });
  }

  private organizeContent(matches: any[]): ContentChunk[] {
    // Sort matches by chunkIndex to maintain logical flow
    const sortedMatches = matches.sort(
      (a, b) => a.metadata.chunkIndex - b.metadata.chunkIndex,
    );

    return sortedMatches.map((match) => ({
      text: match.metadata.text || match.pageContent,
      chunkIndex: match.metadata.chunkIndex,
      wordCount:
        match.metadata.wordCount ||
        (match.metadata.text || match.pageContent || "").split(" ").length,
    }));
  }

  private createSections(content: string): string[] {
    // Split content into manageable sections if it's too long
    const sections: string[] = [];
    const maxSectionLength = 10000; // Characters per section

    if (content.length <= maxSectionLength) {
      return [content];
    }

    // Split by paragraphs first, then group into sections
    const paragraphs = content.split("\n\n");
    let currentSection = "";

    for (const paragraph of paragraphs) {
      if (
        currentSection.length + paragraph.length > maxSectionLength &&
        currentSection.length > 0
      ) {
        sections.push(currentSection.trim());
        currentSection = paragraph;
      } else {
        currentSection += (currentSection ? "\n\n" : "") + paragraph;
      }
    }

    if (currentSection.trim()) {
      sections.push(currentSection.trim());
    }

    return sections;
  }

  private calculateReadingTime(wordCount: number): number {
    return Math.ceil(wordCount / this.WORDS_PER_MINUTE);
  }

  private determineDifficulty(
    content: string,
  ): "beginner" | "intermediate" | "advanced" {
    // Simple heuristic based on content characteristics
    const sentences = content
      .split(/[.!?]+/)
      .filter((s) => s.trim().length > 0);
    const avgSentenceLength = content.split(" ").length / sentences.length;

    // Count complex indicators
    const complexWords = content.match(/\b\w{10,}\b/g)?.length || 0;
    const technicalPhrases =
      content.match(
        /\b(algorithm|methodology|implementation|infrastructure|optimization)\b/gi,
      )?.length || 0;

    const complexity =
      avgSentenceLength / 20 + complexWords / 100 + technicalPhrases / 10;

    if (complexity > 2) return "advanced";
    if (complexity > 1) return "intermediate";
    return "beginner";
  }

  async generateSummary(studyMaterialId: string): Promise<Summary> {
    try {
      console.log(
        `🔄 Starting summary generation for material: ${studyMaterialId}`,
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
        "comprehensive summary content",
        200,
        filter,
      );

      console.log(
        `📚 Found ${results.length} content chunks for summary generation`,
      );

      if (!results.length) {
        const errorMessage =
          "No content found for the specified study material";
        const error = new Error(errorMessage);

        // Send Discord notification for this specific error
        await discordNotifier.sendErrorNotification(error, {
          studyMaterialId,
          operation: "generateSummary",
          errorType: "NO_CONTENT_FOUND",
          searchResultsCount: 0,
          qdrantConfig: qdrantService.getStatus().config,
        });
        throw error;
      }

      // Convert to compatible match format
      const matches = results.map(([doc, score]) => ({
        metadata: doc.metadata,
        pageContent: doc.pageContent,
        score,
      }));

      // 2. Organize content chronologically
      const contentChunks = this.organizeContent(matches);
      const fullContent = contentChunks.map((chunk) => chunk.text).join("\n\n");
      const totalWordCount = contentChunks.reduce(
        (sum, chunk) => sum + chunk.wordCount,
        0,
      );

      console.log(
        `📝 Processing ${contentChunks.length} chunks, ${totalWordCount} words total`,
      );

      // 3. Determine if we need sectioned summary
      const needsSections = fullContent.length > this.MAX_CONTENT_LENGTH;
      let summary: Summary;

      if (needsSections) {
        console.log(
          `📖 Generating sectioned summary due to content length (${fullContent.length} chars)`,
        );
        summary = await this.generateSectionedSummary(
          fullContent,
          totalWordCount,
        );
      } else {
        console.log(
          `📄 Generating comprehensive summary for manageable content`,
        );
        summary = await this.generateComprehensiveSummary(
          fullContent,
          totalWordCount,
        );
      }

      // Send success notification
      await discordNotifier.sendSuccessNotification(
        `Summary generated successfully for study material`,
        {
          studyMaterialId,
          summaryType: needsSections ? "sectioned" : "comprehensive",
          contentLength: fullContent.length,
          wordCount: totalWordCount,
          estimatedReadingTime: summary.estimatedReadingTime,
          difficulty: summary.difficulty,
          sectionsCount: summary.sections.length, // FIXED: Removed optional chaining
          qdrantConfig: qdrantService.getStatus().config,
        },
      );

      console.log(
        `✅ Summary generation completed for material: ${studyMaterialId}`,
      );
      return summary;
    } catch (error) {
      console.error("❌ Summary generation failed:", error);

      // Send detailed Discord notification
      await discordNotifier.sendErrorNotification(error as Error, {
        studyMaterialId,
        operation: "generateSummary",
        errorType: this.categorizeError(error as Error),
        additionalInfo: {
          qdrantConfig: qdrantService.getStatus().config,
          modelUsed: process.env.LLM_MODEL,
          timestamp: new Date().toISOString(),
        },
      });
      throw new Error(`Failed to generate summary: ${error}`);
    }
  }

  private categorizeError(error: Error): string {
    if (error.message.includes("Unexpected end of JSON input")) {
      return "QDRANT_JSON_PARSING_ERROR";
    }
    if (error.message.includes("No content found")) {
      return "NO_CONTENT_FOUND";
    }
    if (error.message.includes("API key")) {
      return "API_KEY_ERROR";
    }
    if (error.message.includes("timeout")) {
      return "TIMEOUT_ERROR";
    }
    if (error.message.includes("rate limit")) {
      return "RATE_LIMIT_ERROR";
    }
    if (error.message.includes("Qdrant")) {
      return "QDRANT_CONNECTION_ERROR";
    }
    return "UNKNOWN_ERROR";
  }

  // FIXED: Updated generateComprehensiveSummary to always provide sections array
  private async generateComprehensiveSummary(
    content: string,
    wordCount: number,
  ): Promise<Summary> {
    try {
      console.log(`📝 Generating comprehensive summary...`);

      const structuredModel = this.model.withStructuredOutput(
        SummaryResponseSchema,
      );

      const prompt = `Create a comprehensive summary of the following study material. Provide:

1. A descriptive title for the material
2. A main summary that captures the essential content and key themes
3. A list of key points (5-8 bullet points) highlighting the most important information
4. A list of important concepts or terms that students should understand
5. Assess the difficulty level based on complexity and technical depth
6. Estimate reading time based on content length

NOTE: Since this is a comprehensive summary (not sectioned), provide an empty array for sections.

Study Material Content:
${content}

Please create a well-structured summary that would help a student understand the main concepts and prepare for studying this material.`;

      const response = await structuredModel.invoke(prompt);
      const validatedResponse = SummaryResponseSchema.parse(response);

      console.log(`✅ Comprehensive summary generated successfully`);

      return {
        ...validatedResponse.summary,
        estimatedReadingTime: this.calculateReadingTime(wordCount),
        difficulty: this.determineDifficulty(content),
        sections: [], // FIXED: Always provide empty array for comprehensive summaries
      };
    } catch (error) {
      // Send specific notification for LLM errors
      await discordNotifier.sendErrorNotification(error as Error, {
        operation: "generateComprehensiveSummary",
        errorType: "LLM_PROCESSING_ERROR",
        contentLength: content.length,
        wordCount,
      });
      throw error;
    }
  }

  private async generateSectionedSummary(
    content: string,
    wordCount: number,
  ): Promise<Summary> {
    try {
      console.log(`📖 Generating sectioned summary...`);

      const sections = this.createSections(content);
      const sectionSummaries: SectionSummary[] = [];

      console.log(`📚 Processing ${sections.length} sections`);

      // Generate summary for each section
      for (let i = 0; i < sections.length; i++) {
        try {
          console.log(`🔄 Processing section ${i + 1}/${sections.length}`);

          const sectionModel = this.model.withStructuredOutput(
            z.object({
              section: SectionSummarySchema,
            }),
          );

          const sectionPrompt = `Summarize this section of the study material:

Section ${i + 1} Content:
${sections[i]}

Provide:
- A descriptive title for this section
- A concise summary of the section's content
- Key points from this section (3-5 points)`;

          const sectionResponse = await sectionModel.invoke(sectionPrompt);
          sectionSummaries.push(sectionResponse.section);

          console.log(
            `✅ Section ${i + 1} processed: "${sectionResponse.section.title}"`,
          );
        } catch (sectionError) {
          // Send notification for section-specific errors
          await discordNotifier.sendErrorNotification(sectionError as Error, {
            operation: "generateSectionedSummary",
            errorType: "SECTION_PROCESSING_ERROR",
            sectionIndex: i,
            totalSections: sections.length,
            sectionLength: sections[i].length,
          });
          throw sectionError;
        }
      }

      // Generate overall summary
      console.log(
        `🔄 Generating overall summary from ${sectionSummaries.length} sections`,
      );

      const overallModel = this.model.withStructuredOutput(
        SummaryResponseSchema,
      );
      const overallPrompt = `Based on the following section summaries, create an overall summary of the study material:

${sectionSummaries
  .map(
    (section, i) =>
      `Section ${i + 1}: ${section.title}\n${section.summary}\nKey Points: ${section.keyPoints.join(", ")}`,
  )
  .join("\n\n")}

Provide:
1. An overall title for the entire material
2. A comprehensive main summary that ties together all sections
3. Overall key points (6-10 points) from across all sections
4. Important concepts that span the entire material
5. Assess overall difficulty level

NOTE: The sections array will be populated separately with the detailed section summaries.`;

      const overallResponse = await overallModel.invoke(overallPrompt);
      const validatedResponse = SummaryResponseSchema.parse(overallResponse);

      console.log(
        `✅ Sectioned summary generated successfully with ${sectionSummaries.length} sections`,
      );

      return {
        ...validatedResponse.summary,
        estimatedReadingTime: this.calculateReadingTime(wordCount),
        difficulty: this.determineDifficulty(content),
        sections: sectionSummaries, // Populated array for sectioned summaries
      };
    } catch (error) {
      // Send notification for overall sectioned summary errors
      await discordNotifier.sendErrorNotification(error as Error, {
        operation: "generateSectionedSummary",
        errorType: "SECTIONED_SUMMARY_ERROR",
        contentLength: content.length,
        wordCount,
      });
      throw error;
    }
  }

  /**
   * Test the Qdrant connection for summary generation
   */
  async testConnection(): Promise<boolean> {
    try {
      const healthCheck = await qdrantService.healthCheck();
      console.log(
        `✅ SummaryGenerator: Qdrant connection test - ${healthCheck.status}`,
      );
      return healthCheck.connection;
    } catch (error) {
      console.error(
        "❌ SummaryGenerator: Qdrant connection test failed:",
        error,
      );
      return false;
    }
  }

  /**
   * Get content statistics for summary generation
   */
  async getContentStats(studyMaterialId: string) {
    try {
      console.log(
        `🔍 Getting content stats for summary of material: ${studyMaterialId}`,
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
        "content analysis for summary",
        1000, // Large number to get all content
        filter,
      );

      const matches = results.map(([doc, score]) => ({
        metadata: doc.metadata,
        pageContent: doc.pageContent,
        score,
      }));

      // Organize content to get stats
      const contentChunks = this.organizeContent(matches);
      const fullContent = contentChunks.map((chunk) => chunk.text).join("\n\n");
      const totalWordCount = contentChunks.reduce(
        (sum, chunk) => sum + chunk.wordCount,
        0,
      );

      const needsSections = fullContent.length > this.MAX_CONTENT_LENGTH;
      const sections = needsSections ? this.createSections(fullContent) : [];

      const stats = {
        studyMaterialId,
        totalChunks: contentChunks.length,
        totalContentLength: fullContent.length,
        totalWordCount,
        estimatedReadingTime: this.calculateReadingTime(totalWordCount),
        difficulty: fullContent
          ? this.determineDifficulty(fullContent)
          : "beginner",
        needsSectioning: needsSections,
        estimatedSections: needsSections ? sections.length : 1,
        averageChunkLength:
          contentChunks.length > 0
            ? Math.round(fullContent.length / contentChunks.length)
            : 0,
        summaryType: needsSections ? "sectioned" : "comprehensive",
        qdrantConfig: qdrantService.getStatus().config,
      };

      console.log(`📊 Summary content stats:`, stats);
      return stats;
    } catch (error) {
      await discordNotifier.sendErrorNotification(error as Error, {
        operation: "getContentStats - SummaryGenerator",
        studyMaterialId,
      });
      console.error("❌ Failed to get summary content stats:", error);
      throw error;
    }
  }

  /**
   * Get summary generation capabilities and configuration
   */
  async getGenerationStats() {
    try {
      const connectionOk = await this.testConnection();

      return {
        connectionStatus: connectionOk ? "Connected" : "Disconnected",
        qdrantConfig: qdrantService.getStatus().config,
        model: process.env.LLM_MODEL || "gpt-3.5-turbo",
        embeddingModel: "text-embedding-ada-002",
        temperature: 0.3,
        maxContentLength: this.MAX_CONTENT_LENGTH,
        wordsPerMinute: this.WORDS_PER_MINUTE,
        sectioningConfig: {
          maxSectionLength: 10000,
          automaticSectioning: true,
        },
        features: [
          "Study material-based content filtering",
          "Automatic content organization by chunk index",
          "Intelligent sectioning for long content",
          "Reading time estimation",
          "Automatic difficulty assessment",
          "Comprehensive and sectioned summary types",
          "Structured output with Zod validation",
          "HTTPS Qdrant connection",
          "Error handling and Discord notifications",
          "Content statistics and analysis",
        ],
      };
    } catch (error) {
      await discordNotifier.sendErrorNotification(error as Error, {
        operation: "getGenerationStats - SummaryGenerator",
      });
      console.error("❌ Failed to get summary generation stats:", error);
      throw error;
    }
  }
}