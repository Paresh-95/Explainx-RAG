// ==========================================
// YOUTUBE PROCESSOR SERVICE - src/services/youtubeProcessor.ts
// ==========================================
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { broadcastProgress } from "./websocketService";
import prisma from "@repo/db";
import { YoutubeLoader } from "@langchain/community/document_loaders/web/youtube";
import { discordNotifier } from "./discordNotifier";
import { qdrantService } from "./qdrantService";

async function initializeVectorStore() {
  return await qdrantService.getDefaultVectorStore();
}

interface YouTubeProcessingData {
  studyMaterialId: string;
  spaceId: string;
  youtubeUrl: string;
  userId: string;
  title?: string;
  description?: string;
}

interface QueryData {
  query: string;
  studyMaterialId?: string;
  spaceId?: string;
  topK: number;
  includeMetadata: boolean;
  userId: string;
}

export class YouTubeProcessor {
  private textSplitter: RecursiveCharacterTextSplitter;

  constructor() {
    this.textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
      separators: ["\n\n", "\n", ". ", " ", ""],
    });
  }

  async extractTranscript(youtubeUrl: string): Promise<string> {
    try {
      console.log(`🎥 Extracting transcript from YouTube URL: ${youtubeUrl}`);

      // Use YoutubeLoader to extract transcript
      const loader = YoutubeLoader.createFromUrl(youtubeUrl, {
        language: "en",
        addVideoInfo: true,
      });

      const docs = await loader.load();

      if (docs.length === 0) {
        throw new Error("No transcript available for this video");
      }

      // Combine all transcript segments into a single text
      const transcriptText = docs.map((doc) => doc.pageContent).join(" ");

      console.log(
        `📝 Extracted transcript: ${transcriptText.length} characters`,
      );

      return transcriptText;
    } catch (error) {
      await discordNotifier.sendErrorNotification(error as Error, {
        operation: "extractTranscript",
        youtubeUrl,
      });
      console.error(
        `❌ Failed to extract transcript from ${youtubeUrl}:`,
        error,
      );
      throw new Error(`Failed to extract transcript: ${error}`);
    }
  }

  async processYouTubeVideo(data: YouTubeProcessingData): Promise<void> {
    const { studyMaterialId, userId, youtubeUrl, spaceId } = data;

    try {
      console.log(`🔄 Processing YouTube video: ${studyMaterialId}`);
      console.log(`🎥 YouTube URL: ${youtubeUrl}`);

      // Test Qdrant connection first
      const connectionOk = await this.testConnection();
      if (!connectionOk) {
        throw new Error(
          "Qdrant connection failed. Please check Qdrant configuration and ensure it's running.",
        );
      }

      // Update status to processing
      await this.updateProcessingStatus(studyMaterialId, "processing", 5);
      broadcastProgress(userId, {
        studyMaterialId,
        status: "processing",
        progress: 5,
        message: "Starting YouTube video processing...",
      });

      // 1. Extract transcript from YouTube video
      broadcastProgress(userId, {
        studyMaterialId,
        status: "processing",
        progress: 20,
        message: "Extracting transcript from YouTube video...",
      });

      const transcriptText = await this.extractTranscript(youtubeUrl);

      if (!transcriptText.trim()) {
        throw new Error("No transcript content found in video");
      }

      console.log(
        `📝 Transcript extracted successfully: ${transcriptText.length} characters`,
      );

      // 2. Chunk transcript text
      broadcastProgress(userId, {
        studyMaterialId,
        status: "processing",
        progress: 50,
        message: "Chunking transcript...",
      });

      console.log(`✂️ Chunking transcript text...`);
      const documents = await this.textSplitter.createDocuments([
        transcriptText,
      ]);
      console.log(`📚 Created ${documents.length} text chunks`);

      // 3. Store in vector database (using LangChain embeddings integration)
      broadcastProgress(userId, {
        studyMaterialId,
        status: "processing",
        progress: 70,
        message: "Generating embeddings and storing in vector database...",
      });

      console.log(
        `🧠 Generating embeddings and storing ${documents.length} chunks...`,
      );
      await this.storeInVectorDB(
        studyMaterialId,
        spaceId,
        documents,
        youtubeUrl,
      );
      console.log(`✅ Stored ${documents.length} chunks in Qdrant`);

      // 4. Update completion status
      await this.updateProcessingStatus(studyMaterialId, "completed", 100);

      broadcastProgress(userId, {
        studyMaterialId,
        status: "completed",
        progress: 100,
        message: "YouTube video processing completed successfully!",
      });

      console.log(
        `✅ YouTube video processed successfully: ${studyMaterialId}`,
      );
    } catch (error: any) {
      await discordNotifier.sendErrorNotification(error as Error, {
        operation: "processYouTubeVideo",
        studyMaterialId,
        userId,
        youtubeUrl,
        spaceId,
      });
      console.error(`❌ YouTube video processing failed: ${error}`);

      await this.updateProcessingStatus(
        studyMaterialId,
        "failed",
        0,
        error.message,
      );

      broadcastProgress(userId, {
        studyMaterialId,
        status: "failed",
        progress: 0,
        message: `Processing failed: ${error.message}`,
        error: error.message,
      });

      throw error;
    }
  }

  // Removed separate generateEmbeddings method since LangChain handles this automatically

  async storeInVectorDB(
    studyMaterialId: string,
    spaceId: string,
    documents: any[],
    youtubeUrl: string,
  ): Promise<void> {
    try {
      console.log(`💾 Preparing ${documents.length} vectors for storage...`);

      const vectorStore = await initializeVectorStore();

      // Convert to LangChainDocument format and add metadata
      const docs = documents.map((doc, i) => ({
        pageContent: doc.pageContent,
        metadata: {
          studyMaterialId,
          spaceId,
          chunkIndex: i,
          text: doc.pageContent,
          chunkId: `youtube-chunk-${i}`,
          wordCount: doc.pageContent.split(" ").length,
          source: "youtube",
          youtubeUrl,
          createdAt: new Date().toISOString(),
        },
      }));

      // Add to Qdrant (LangChain handles embeddings automatically)
      await vectorStore.addDocuments(docs);

      console.log(
        `📊 Stored ${docs.length} vectors for YouTube video ${studyMaterialId} in space ${spaceId}`,
      );
    } catch (error) {
      await discordNotifier.sendErrorNotification(error as Error, {
        operation: "storeInVectorDB - YouTubeProcessor",
        studyMaterialId,
        spaceId,
        youtubeUrl,
      });
      console.error(`❌ Vector storage failed:`, error);
      throw new Error(`Vector storage failed: ${error}`);
    }
  }

  async queryDocuments(data: QueryData) {
    try {
      const {
        query,
        studyMaterialId,
        spaceId,
        topK = 5,
        includeMetadata = true,
      } = data;

      console.log(`🔍 Querying YouTube documents with:`, {
        query: query.substring(0, 50) + "...",
        studyMaterialId,
        spaceId,
        topK,
        includeMetadata,
      });

      const vectorStore = await initializeVectorStore();

      // Build Qdrant filter
      const filter: any = { must: [] };

      if (studyMaterialId) {
        filter.must.push({
          key: "metadata.studyMaterialId",
          match: { value: studyMaterialId },
        });
      }

      if (spaceId) {
        filter.must.push({
          key: "metadata.spaceId",
          match: { value: spaceId },
        });
      }

      // Add filter for YouTube source
      filter.must.push({
        key: "metadata.source",
        match: { value: "youtube" },
      });

      const finalFilter = filter.must.length > 0 ? filter : undefined;

      console.log(`🔍 Searching Qdrant with filter:`, finalFilter);

      // Search in vector database
      const results = await vectorStore.similaritySearchWithScore(
        query,
        topK,
        finalFilter,
      );

      console.log(`🔍 Found ${results.length} YouTube matches`);

      // Format results
      const formattedResults = results.map(([doc, score]) => ({
        id: doc.metadata?.chunkId,
        score,
        text: doc.metadata?.text || doc.pageContent || "",
        metadata: includeMetadata ? doc.metadata : undefined,
      }));

      return {
        success: true,
        results: formattedResults,
        totalResults: formattedResults.length,
        query,
        source: "youtube",
      };
    } catch (error) {
      await discordNotifier.sendErrorNotification(error as Error, {
        operation: "queryDocuments - YouTubeProcessor",
      });
      console.error("❌ YouTube query failed:", error);
      throw new Error(`YouTube query failed: ${error}`);
    }
  }

  async updateProcessingStatus(
    studyMaterialId: string,
    status: string,
    progress: number,
    error?: string,
  ): Promise<void> {
    try {
      await prisma.studyMaterial.update({
        where: { id: studyMaterialId },
        data: {
          processingStatus: status,
          isProcessed: status === "completed",
          metadata: {
            progress,
            lastUpdated: new Date().toISOString(),
            source: "youtube",
            ...(error && { error }),
          },
          updatedAt: new Date(),
        },
      });
      console.log(
        `📊 Updated YouTube processing status: ${status} (${progress}%)`,
      );
    } catch (err: any) {
      await discordNotifier.sendErrorNotification(err as Error, {
        operation: "updateProcessingStatus - YouTubeProcessor",
        studyMaterialId,
        status,
        progress,
        error: err.message,
      });
      console.error("❌ Failed to update YouTube processing status:", err);
    }
  }

  async getProcessingStatus(studyMaterialId: string) {
    try {
      const studyMaterial = await prisma.studyMaterial.findUnique({
        where: { id: studyMaterialId },
        select: {
          id: true,
          isProcessed: true,
          processingStatus: true,
          metadata: true,
          updatedAt: true,
        },
      });

      return studyMaterial || null;
    } catch (error) {
      await discordNotifier.sendErrorNotification(error as Error, {
        operation: "getProcessingStatus - YouTubeProcessor",
        studyMaterialId,
      });
      console.error("❌ Failed to get YouTube processing status:", error);
      throw error;
    }
  }

  async debugVectorDatabase(data: {
    spaceId?: string;
    studyMaterialId?: string;
  }) {
    try {
      const { spaceId, studyMaterialId } = data;

      console.log(`🔍 Debug YouTube vectors with filters:`, {
        spaceId,
        studyMaterialId,
      });

      const vectorStore = await initializeVectorStore();

      const filter: any = { must: [] };

      if (spaceId) {
        filter.must.push({
          key: "metadata.spaceId",
          match: { value: spaceId },
        });
      }

      if (studyMaterialId) {
        filter.must.push({
          key: "metadata.studyMaterialId",
          match: { value: studyMaterialId },
        });
      }

      // Add filter for YouTube source
      filter.must.push({
        key: "metadata.source",
        match: { value: "youtube" },
      });

      const finalFilter = filter.must.length > 0 ? filter : undefined;

      const results = await vectorStore.similaritySearchWithScore(
        "dummy query",
        1000,
        finalFilter,
      );

      const vectors =
        results?.map(([doc, score]) => ({
          id: doc.metadata?.chunkId,
          score,
          metadata: doc.metadata,
        })) || [];

      console.log(`🔍 Debug found ${vectors.length} YouTube vectors`);

      return {
        success: true,
        totalVectors: vectors.length,
        vectors: vectors.slice(0, 10), // Show first 10 for debugging
        filter: finalFilter,
        spaceId,
        studyMaterialId,
        source: "youtube",
      };
    } catch (error) {
      console.error("❌ Debug YouTube vector database error:", error);
      throw new Error(`YouTube debug failed: ${error}`);
    }
  }

  /**
   * Test the Qdrant connection for YouTube processing
   */
  async testConnection(): Promise<boolean> {
    try {
      const healthCheck = await qdrantService.healthCheck();
      console.log(
        `✅ YouTubeProcessor: Qdrant connection test - ${healthCheck.status}`,
      );
      return healthCheck.connection;
    } catch (error) {
      console.error(
        "❌ YouTubeProcessor: Qdrant connection test failed:",
        error,
      );
      return false;
    }
  }

  /**
   * Get YouTube content statistics
   */
  async getYouTubeContentStats(filter?: {
    spaceId?: string;
    studyMaterialId?: string;
  }) {
    try {
      console.log(`🔍 Getting YouTube content stats with filter:`, filter);

      const vectorStore = await initializeVectorStore();

      // Build filter for YouTube content
      const qdrantFilter: any = { must: [] };

      if (filter?.spaceId) {
        qdrantFilter.must.push({
          key: "metadata.spaceId",
          match: { value: filter.spaceId },
        });
      }

      if (filter?.studyMaterialId) {
        qdrantFilter.must.push({
          key: "metadata.studyMaterialId",
          match: { value: filter.studyMaterialId },
        });
      }

      // Add filter for YouTube source
      qdrantFilter.must.push({
        key: "metadata.source",
        match: { value: "youtube" },
      });

      const finalFilter =
        qdrantFilter.must.length > 0 ? qdrantFilter : undefined;

      // Get all YouTube content
      const results = await vectorStore.similaritySearchWithScore(
        "content analysis",
        1000, // Large number to get all content
        finalFilter,
      );

      const matches = results.map(([doc, score]) => ({
        metadata: doc.metadata,
        pageContent: doc.pageContent,
        score,
      }));

      const totalContentLength = matches.reduce(
        (sum, match) =>
          sum +
          (match.pageContent?.length || match.metadata?.text?.length || 0),
        0,
      );

      const uniqueVideos = [
        ...new Set(matches.map((m) => m.metadata?.youtubeUrl).filter(Boolean)),
      ];
      const uniqueStudyMaterials = [
        ...new Set(
          matches.map((m) => m.metadata?.studyMaterialId).filter(Boolean),
        ),
      ];

      const stats = {
        source: "youtube",
        totalChunks: matches.length,
        uniqueVideos: uniqueVideos.length,
        uniqueStudyMaterials: uniqueStudyMaterials.length,
        totalContentLength,
        averageChunkLength:
          matches.length > 0
            ? Math.round(totalContentLength / matches.length)
            : 0,
        videoUrls: uniqueVideos,
        studyMaterialIds: uniqueStudyMaterials,
        filter: filter,
        qdrantConfig: qdrantService.getStatus().config,
      };

      console.log(`📊 YouTube content stats:`, stats);
      return stats;
    } catch (error) {
      await discordNotifier.sendErrorNotification(error as Error, {
        operation: "getYouTubeContentStats",
        filter,
      });
      console.error("❌ Failed to get YouTube content stats:", error);
      throw error;
    }
  }

  /**
   * Get YouTube processing capabilities and configuration
   */
  async getProcessingStats() {
    try {
      const connectionOk = await this.testConnection();

      return {
        connectionStatus: connectionOk ? "Connected" : "Disconnected",
        qdrantConfig: qdrantService.getStatus().config,
        embeddingModel: "text-embedding-ada-002",
        textSplitter: {
          chunkSize: 1000,
          chunkOverlap: 200,
          separators: ["\n\n", "\n", ". ", " ", ""],
        },
        youtubeLoader: {
          language: "en",
          addVideoInfo: true,
        },
        features: [
          "YouTube transcript extraction",
          "Automatic text chunking",
          "Embedding generation with OpenAI",
          "Qdrant vector storage with HTTPS",
          "Real-time progress tracking",
          "Error handling and Discord notifications",
          "YouTube-specific content filtering",
          "Content statistics and analysis",
          "Debug capabilities for YouTube vectors",
        ],
      };
    } catch (error) {
      await discordNotifier.sendErrorNotification(error as Error, {
        operation: "getProcessingStats - YouTubeProcessor",
      });
      console.error("❌ Failed to get YouTube processing stats:", error);
      throw error;
    }
  }
}

