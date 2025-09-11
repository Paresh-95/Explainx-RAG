// ==========================================
// 5. DOCUMENT PROCESSOR SERVICE - src/services/documentProcessor.ts
// ==========================================
import {
  S3Client,
  GetObjectCommand,
  PutObjectCommand,
} from "@aws-sdk/client-s3";
import pdf from "pdf-parse";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import OpenAI from "openai";
import { QdrantVectorStore } from "@langchain/qdrant";
import { OpenAIEmbeddings } from "@langchain/openai";
import type { Document as LangChainDocument } from "@langchain/core/documents";
import { broadcastProgress } from "./websocketService";
import { UniversalPdfConverter } from "../config/pdfConverter";
import type { ConversionResult } from "../config/pdfConverter";
import { discordNotifier } from "./discordNotifier";
import { qdrantService, qdrantConfig, COLLECTION_NAME } from "./qdrantService";

import prisma from "@repo/db";
import { PromptManager } from "./promptService";

// Configure AWS S3 Client
const region = (
  process.env.AWS_REGION_NAME ||
  process.env.AWS_REGION ||
  "ap-south-1"
)
  .trim()
  .replace(/_/g, "-"); // Replace underscores with hyphens

const s3Client = new S3Client({
  region: region,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const embeddings = new OpenAIEmbeddings({
  model: "text-embedding-ada-002",
  openAIApiKey: process.env.OPENAI_API_KEY,
});

interface ProcessingData {
  studyMaterialId: string;
  spaceId: string;
  fileKey: string;
  s3Bucket: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
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

export class DocumentProcessor {
  private textSplitter: RecursiveCharacterTextSplitter;
  private pdfConverter: UniversalPdfConverter;
  private vectorStore: QdrantVectorStore | null = null;

  constructor() {
    this.textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
      separators: ["\n\n", "\n", ". ", " ", ""],
    });
    this.pdfConverter = new UniversalPdfConverter();
  }

  /**
   * Initialize Qdrant vector store using centralized service
   */
  async initializeVectorStore(): Promise<QdrantVectorStore> {
    if (this.vectorStore) {
      return this.vectorStore;
    }
    
    this.vectorStore = await qdrantService.getDefaultVectorStore();
    return this.vectorStore;
  }

  /**
   * Test Qdrant connection using centralized service
   */
  async testConnection(): Promise<boolean> {
    return await qdrantService.testConnection();
  }

  async downloadFromS3(bucket: string, key: string): Promise<Buffer> {
    try {
      const command = new GetObjectCommand({
        Bucket: bucket,
        Key: key,
      });

      const response = await s3Client.send(command);

      // Convert the response body stream to buffer
      const chunks: Uint8Array[] = [];
      const stream = response.Body as any;

      for await (const chunk of stream) {
        chunks.push(chunk);
      }

      return Buffer.concat(chunks);
    } catch (error) {
      await discordNotifier.sendErrorNotification(error as Error, {
        operation: "downloadFromS3",
        bucket,
        key,
      });
      throw new Error(`Failed to download from S3: ${error}`);
    }
  }

  async uploadToS3(
    bucket: string,
    key: string,
    buffer: Buffer,
    contentType: string,
  ): Promise<string> {
    try {
      const command = new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: buffer,
        ContentType: contentType,
      });

      await s3Client.send(command);

      return `https://${bucket}.s3.${region}.amazonaws.com/${key}`;
    } catch (error) {
      await discordNotifier.sendErrorNotification(error as Error, {
        operation: "uploadToS3",
        bucket,
        key,
      });
      throw new Error(`Failed to upload to S3: ${error}`);
    }
  }

  /**
   * Universal function to convert any supported file to PDF and upload to S3
   */
  async convertAndUploadToPdf(
    buffer: Buffer,
    originalFileName: string,
    originalMimeType: string,
    s3Bucket: string,
    originalFileKey: string,
  ): Promise<{
    pdfBuffer: Buffer;
    newFileKey: string;
    newFileUrl: string;
    wasConverted: boolean;
    originalMimeType: string;
  }> {
    try {
      // Check if conversion is needed and supported
      if (!this.pdfConverter.isSupportedMimeType(originalMimeType)) {
        throw new Error(
          `Unsupported file type for conversion: ${originalMimeType}`,
        );
      }

      // Convert to PDF
      const conversionResult: ConversionResult =
        await this.pdfConverter.convertToPdf(
          buffer,
          originalMimeType,
          originalFileName,
        );

      if (!conversionResult.success) {
        throw new Error(`Conversion failed: ${conversionResult.error}`);
      }

      const wasConverted = originalMimeType !== "application/pdf";

      // Use the same file key for replacement
      const newFileKey = originalFileKey;

      // Upload PDF to S3 (replaces original file)
      const newFileUrl = await this.uploadToS3(
        s3Bucket,
        newFileKey,
        conversionResult.pdfBuffer,
        "application/pdf",
      );

      return {
        pdfBuffer: conversionResult.pdfBuffer,
        newFileKey,
        newFileUrl,
        wasConverted,
        originalMimeType,
      };
    } catch (error) {
      await discordNotifier.sendErrorNotification(error as Error, {
        operation: "convertAndUploadToPdf",
        originalFileName,
        originalMimeType,
        s3Bucket,
        originalFileKey,
      });
      throw new Error(`File conversion and upload failed: ${error}`);
    }
  }

  async extractText(buffer: Buffer, mimeType: string): Promise<string> {
    try {
      // Since we're now converting everything to PDF, we only need to handle PDF extraction
      if (mimeType === "application/pdf") {
        const data = await pdf(buffer);
        return data.text;
      } else {
        throw new Error(
          `Unexpected file type for text extraction: ${mimeType}`,
        );
      }
    } catch (error) {
      await discordNotifier.sendErrorNotification(error as Error, {
        operation: "extractText",
        mimeType,
      });
      console.error(`❌ Text extraction failed:`, error);
      throw new Error(`Text extraction failed: ${error}`);
    }
  }

  async processDocument(data: ProcessingData): Promise<void> {
    const { studyMaterialId, userId, fileKey, s3Bucket, mimeType, fileName } =
      data;

    try {
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
        message: "Starting document processing...",
      });

      // 1. Download file from S3
      broadcastProgress(userId, {
        studyMaterialId,
        status: "processing",
        progress: 10,
        message: "Downloading file from S3...",
      });

      const fileBuffer = await this.downloadFromS3(s3Bucket, fileKey);

      // 2. Convert to PDF if needed
      let pdfBuffer: Buffer;
      let newFileKey: string | undefined;
      let newFileUrl: string | undefined;
      let wasConverted = false;

      if (mimeType === "application/pdf") {
        // Already PDF, no conversion needed
        pdfBuffer = fileBuffer;
        broadcastProgress(userId, {
          studyMaterialId,
          status: "processing",
          progress: 25,
          message: "File is already PDF, proceeding with text extraction...",
        });
      } else {
        // Convert to PDF
        broadcastProgress(userId, {
          studyMaterialId,
          status: "processing",
          progress: 20,
          message: `Converting ${this.getFileTypeDescription(mimeType)} to PDF...`,
        });

        const conversionResult = await this.convertAndUploadToPdf(
          fileBuffer,
          fileName,
          mimeType,
          s3Bucket,
          fileKey,
        );

        pdfBuffer = conversionResult.pdfBuffer;
        newFileKey = conversionResult.newFileKey;
        newFileUrl = conversionResult.newFileUrl;
        wasConverted = conversionResult.wasConverted;

        broadcastProgress(userId, {
          studyMaterialId,
          status: "processing",
          progress: 30,
          message: "File converted to PDF successfully",
        });
      }

      // 3. Extract text from PDF
      broadcastProgress(userId, {
        studyMaterialId,
        status: "processing",
        progress: 40,
        message: "Extracting text from PDF...",
      });

      const text = await this.extractText(pdfBuffer, "application/pdf");

      if (!text.trim()) {
        throw new Error("No text content found in document");
      }

      // 4. Chunk text
      broadcastProgress(userId, {
        studyMaterialId,
        status: "processing",
        progress: 60,
        message: "Chunking document...",
      });

      const documents = await this.textSplitter.createDocuments([text]);

      console.log(`📊 Document chunked into ${documents.length} pieces`);

      // 5. Generate embeddings and store in Qdrant
      broadcastProgress(userId, {
        studyMaterialId,
        status: "processing",
        progress: 75,
        message: `Generating embeddings for ${documents.length} chunks and storing in Qdrant...`,
      });

      await this.storeInVectorDB(studyMaterialId, data.spaceId, documents);

      // 6. Update database with converted file info if file was converted
      if (wasConverted && newFileKey && newFileUrl) {
        await this.updateStudyMaterialFile(
          studyMaterialId,
          newFileKey,
          newFileUrl,
          "application/pdf",
          mimeType, // Store original MIME type in metadata
        );
      }

      // 7. Update completion status
      await this.updateProcessingStatus(studyMaterialId, "completed", 100);

      const successMessage = wasConverted
        ? "Document converted to PDF and processed successfully!"
        : "Document processing completed successfully!";

      broadcastProgress(userId, {
        studyMaterialId,
        status: "completed",
        progress: 100,
        message: successMessage,
      });
    } catch (error: any) {
      await discordNotifier.sendErrorNotification(error as Error, {
        operation: "processDocument",
        studyMaterialId,
        userId,
        fileKey,
        s3Bucket,
        mimeType,
        fileName,
      });
      console.error(`❌ Document processing failed: ${error}`);

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

  /**
   * Get user-friendly description of file type
   */
  private getFileTypeDescription(mimeType: string): string {
    if (mimeType.includes("powerpoint") || mimeType.includes("presentation")) {
      return "PowerPoint presentation";
    } else if (mimeType.includes("word") || mimeType.includes("document")) {
      return "Word document";
    } else if (mimeType.includes("excel") || mimeType.includes("spreadsheet")) {
      return "Excel spreadsheet";
    } else if (mimeType === "text/plain") {
      return "text file";
    } else {
      return "document";
    }
  }

  // Updated storeInVectorDB method with batch processing
  async storeInVectorDB(
    studyMaterialId: string,
    spaceId: string,
    documents: any[],
  ): Promise<void> {
    try {
      const vectorStore = await this.initializeVectorStore();

      // Convert to LangChainDocument format and add metadata
      const docs: LangChainDocument[] = documents.map((doc, i) => ({
        pageContent: doc.pageContent,
        metadata: {
          studyMaterialId,
          spaceId,
          chunkIndex: i,
          text: doc.pageContent,
          chunkId: `chunk-${i}`,
          wordCount: doc.pageContent.split(" ").length,
          createdAt: new Date().toISOString(),
        },
      }));

      // Calculate batch size based on estimated payload size
      const BATCH_SIZE = 50; // Conservative batch size
      const MAX_PAYLOAD_SIZE = 30 * 1024 * 1024; // 30MB to be safe (under 32MB limit)

      console.log(
        `📊 Processing ${docs.length} documents in batches of ${BATCH_SIZE}`,
      );

      // Process documents in batches
      for (let i = 0; i < docs.length; i += BATCH_SIZE) {
        const batch = docs.slice(i, i + BATCH_SIZE);

        // Estimate batch payload size
        const estimatedSize = this.estimatePayloadSize(batch);
        console.log(
          `📦 Processing batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(docs.length / BATCH_SIZE)}: ${batch.length} docs (~${(estimatedSize / 1024 / 1024).toFixed(2)}MB)`,
        );

        // If batch is still too large, process smaller sub-batches
        if (estimatedSize > MAX_PAYLOAD_SIZE) {
          const smallerBatchSize = Math.max(1, Math.floor(BATCH_SIZE / 2));
          console.log(
            `⚠️ Batch too large, splitting into smaller batches of ${smallerBatchSize}`,
          );

          for (let j = 0; j < batch.length; j += smallerBatchSize) {
            const subBatch = batch.slice(j, j + smallerBatchSize);
            await this.addDocumentsBatch(vectorStore, subBatch, i + j);

            // Small delay between sub-batches to avoid overwhelming Qdrant
            await new Promise((resolve) => setTimeout(resolve, 100));
          }
        } else {
          await this.addDocumentsBatch(vectorStore, batch, i);

          // Small delay between batches to avoid overwhelming Qdrant
          await new Promise((resolve) => setTimeout(resolve, 200));
        }
      }

      console.log(`✅ Successfully stored ${docs.length} documents in Qdrant`);
    } catch (error) {
      await discordNotifier.sendErrorNotification(error as Error, {
        operation: "storeInVectorDB",
        studyMaterialId,
        spaceId,
        documentCount: documents.length,
      });
      console.error(`❌ Vector storage failed:`, error);
      throw new Error(`Vector storage failed: ${error}`);
    }
  }

  /**
   * Helper method to add a batch of documents with retry logic
   */
  private async addDocumentsBatch(
    vectorStore: QdrantVectorStore,
    batch: LangChainDocument[],
    startIndex: number,
    retries: number = 3,
  ): Promise<void> {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        await vectorStore.addDocuments(batch);
        console.log(
          `✅ Batch ${Math.floor(startIndex / 50) + 1} stored successfully (${batch.length} docs)`,
        );
        return;
      } catch (error: any) {
        console.error(
          `❌ Batch ${Math.floor(startIndex / 50) + 1} failed (attempt ${attempt}/${retries}):`,
          error.message,
        );

        if (attempt === retries) {
          throw error;
        }

        // If it's still a payload size error, try with smaller batch
        if (
          error.message?.includes("payload") ||
          error.message?.includes("larger than allowed")
        ) {
          const halfBatch = Math.ceil(batch.length / 2);
          console.log(`🔄 Retrying with smaller batch size: ${halfBatch}`);

          // Process first half
          await this.addDocumentsBatch(
            vectorStore,
            batch.slice(0, halfBatch),
            startIndex,
            1,
          );
          // Process second half
          await this.addDocumentsBatch(
            vectorStore,
            batch.slice(halfBatch),
            startIndex + halfBatch,
            1,
          );
          return;
        }

        // Exponential backoff for other errors
        const delay = Math.pow(2, attempt) * 1000;
        console.log(`⏳ Waiting ${delay}ms before retry...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  /**
   * Estimate payload size for a batch of documents
   */
  private estimatePayloadSize(docs: LangChainDocument[]): number {
    try {
      // Create a sample payload structure similar to what Qdrant expects
      const samplePayload = {
        points: docs.map((doc, i) => ({
          id: i,
          vector: new Array(1536).fill(0.1), // Simulate embedding vector
          payload: doc.metadata,
        })),
      };

      const jsonString = JSON.stringify(samplePayload);
      return Buffer.byteLength(jsonString, "utf8");
    } catch (error) {
      // Fallback estimation: roughly 2KB per document
      return docs.length * 2048;
    }
  }

  async queryDocuments(data: QueryData) {
    try {
      const { query, studyMaterialId, spaceId, topK, includeMetadata } = data;

      console.log(`🔍 Querying documents with:`, {
        query: query.substring(0, 50) + "...",
        studyMaterialId,
        spaceId,
        topK,
        includeMetadata,
      });

      const vectorStore = await this.initializeVectorStore();

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

      const finalFilter = filter.must.length > 0 ? filter : undefined;

      console.log(`🔍 Searching Qdrant with filter:`, finalFilter);
      const similaritySearchWithScoreResults =
        await vectorStore.similaritySearchWithScore(query, topK, finalFilter);

      console.log(
        `🔍 Found ${similaritySearchWithScoreResults?.length || 0} matches`,
      );

      // Log all scores for debugging
      similaritySearchWithScoreResults?.forEach(([doc, score], i) => {
        console.log(
          `📊 Result ${i + 1}: Score ${score}, Content: ${doc.pageContent.substring(0, 100)}...`,
        );
      });

      // FIXED: Lower threshold from 0.7 to 0.5 and always include at least top result
      const context = similaritySearchWithScoreResults
        ?.filter(([doc, score]: [LangChainDocument, number], index) => {
          // Always include the top result, even if score is low
          if (index === 0) return true;
          // For other results, use a lower threshold
          return score && score > 0.5;
        })
        .map(([doc]) => doc.pageContent)
        .filter(Boolean)
        .join("\n\n");

      console.log(
        `🔍 Context length: ${context ? context.length : 0} characters`,
      );

      // IMPROVED: Don't rely only on context length
      if (!context || context.trim().length === 0) {
        console.log(`⚠️ No context found for query: ${query}`);
        return {
          answer:
            "I couldn't find relevant information in the document to answer your question.",
          sources: [],
          confidence: 0,
          debug: {
            totalResults: similaritySearchWithScoreResults?.length || 0,
            scores:
              similaritySearchWithScoreResults?.map(([, score]) => score) || [],
            query,
            filter: finalFilter,
          },
        };
      }

      // Get appropriate prompt configuration based on query
      const promptConfig = PromptManager.getPromptConfig(query);
      console.log(`🔍 Using prompt type: ${this.getPromptTypeName(query)}`);

      // IMPROVED: Better context formatting
      const formattedContext = `Study Material Content:\n\n${context}`;

      console.log(`🤖 Generating response with LLM...`);
      const response = await openai.chat.completions.create({
        model: process.env.LLM_MODEL!,
        messages: [
          {
            role: "system",
            content: promptConfig.system,
          },
          {
            role: "user",
            content: `${formattedContext}\n\nUser Question: ${query}`,
          },
        ],
        max_tokens: promptConfig.maxTokens,
        temperature: promptConfig.temperature,
      });

      console.log(`✅ Generated answer successfully`);

      return {
        answer: response.choices[0].message.content,
        sources:
          similaritySearchWithScoreResults?.map(
            ([doc, score]: [LangChainDocument, number], i: number) => ({
              chunkId: doc.metadata?.chunkId,
              studyMaterialId: doc.metadata?.studyMaterialId,
              spaceId: doc.metadata?.spaceId,
              score,
              text: doc.pageContent?.substring(0, 200) + "...",
            }),
          ) || [],
        confidence: similaritySearchWithScoreResults?.[0]?.[1] || 0,
        context: context.substring(0, 500) + "...",
        promptType: this.getPromptTypeName(query),
        debug: {
          totalResults: similaritySearchWithScoreResults?.length || 0,
          scores:
            similaritySearchWithScoreResults?.map(([, score]) => score) || [],
          contextLength: context.length,
          threshold: "0.5 (lowered from 0.7)",
        },
      };
    } catch (error) {
      await discordNotifier.sendErrorNotification(error as Error, {
        operation: "queryDocuments",
      });
      console.error("❌ Query processing error:", error);
      throw new Error(`Query failed: ${error}`);
    }
  }

  // Helper method to get prompt type name for debugging
  private getPromptTypeName(query: string): string {
    if (query.includes("@quiz")) return "quiz";
    if (query.includes("@flashcards")) return "flashcards";
    if (query.includes("@mindmap")) return "mindmap";
    if (query.includes("@timeline")) return "timeline";

    const lowerQuery = query.toLowerCase();
    if (lowerQuery.includes("explain") || lowerQuery.includes("how does"))
      return "explanation";
    if (lowerQuery.includes("summarize") || lowerQuery.includes("summary"))
      return "summary";
    if (lowerQuery.includes("what is") || lowerQuery.includes("define"))
      return "definition";

    return "conversational";
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
            ...(error && { error }),
          },
        },
      });
    } catch (err: any) {
      await discordNotifier.sendErrorNotification(err as Error, {
        operation: "updateProcessingStatus",
        studyMaterialId,
        status,
        progress,
        error: err.message,
      });
      console.error("❌ Failed to update processing status:", err);
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

      return studyMaterial;
    } catch (error) {
      await discordNotifier.sendErrorNotification(error as Error, {
        operation: "getProcessingStatus",
        studyMaterialId,
      });
      console.error("❌ Failed to get processing status:", error);
      throw error;
    }
  }

  async updateStudyMaterialFile(
    studyMaterialId: string,
    newFileKey: string,
    newFileUrl: string,
    newMimeType: string,
    originalMimeType?: string,
  ): Promise<void> {
    try {
      await prisma.studyMaterial.update({
        where: { id: studyMaterialId },
        data: {
          fileUrl: newFileUrl,
          mimeType: newMimeType,
          metadata: {
            originalFileKey: newFileKey,
            convertedToPdf: true,
            originalMimeType: originalMimeType,
            convertedAt: new Date().toISOString(),
          },
        },
      });
    } catch (error) {
      await discordNotifier.sendErrorNotification(error as Error, {
        operation: "updateStudyMaterialFile",
        studyMaterialId,
        newFileKey,
        newFileUrl,
        newMimeType,
        originalMimeType,
      });
      console.error("❌ Failed to update study material file:", error);
      throw error;
    }
  }

  async debugVectorDatabase(data: {
    spaceId?: string;
    studyMaterialId?: string;
  }) {
    try {
      const { spaceId, studyMaterialId } = data;

      console.log(`🔍 Debug query with filters:`, { spaceId, studyMaterialId });

      const vectorStore = await this.initializeVectorStore();

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

      const finalFilter = filter.must.length > 0 ? filter : undefined;

      // Use a dummy query to get all docs with filter
      const results = await vectorStore.similaritySearchWithScore(
        "dummy query",
        100,
        finalFilter,
      );

      const vectors =
        results?.map(([doc, score]: [LangChainDocument, number]) => ({
          id: doc.metadata?.chunkId,
          score,
          metadata: doc.metadata,
        })) || [];

      return {
        totalVectors: vectors.length,
        vectors: vectors.slice(0, 10), // Show first 10 for debugging
        filter: finalFilter,
        spaceId,
        studyMaterialId,
      };
    } catch (error) {
      console.error("❌ Debug vector database error:", error);
      throw new Error(`Debug failed: ${error}`);
    }
  }

  /**
   * Get list of supported file types for conversion
   */
  getSupportedFileTypes(): string[] {
    return this.pdfConverter.getSupportedMimeTypes();
  }

  /**
   * Check if a file type is supported for processing
   */
  isFileTypeSupported(mimeType: string): boolean {
    return this.pdfConverter.isSupportedMimeType(mimeType);
  }

  /**
   * Get conversion statistics
   */
  async getConversionStats() {
    try {
      const supportedTypes = this.getSupportedFileTypes();
      return {
        supportedMimeTypes: supportedTypes,
        totalSupportedTypes: supportedTypes.length,
        conversionEnabled: true,
        vectorDatabase: "Qdrant",
        qdrantConfig: {
          host: qdrantConfig.host,
          port: qdrantConfig.port,
          https: qdrantConfig.https,
          collectionName: COLLECTION_NAME,
        },
        features: [
          "PowerPoint to PDF conversion",
          "Word document to PDF conversion",
          "Excel spreadsheet to PDF conversion",
          "Text file to PDF conversion",
          "Automatic S3 file replacement",
          "Original file type preservation in metadata",
          "Progress tracking via WebSocket",
          "Error handling and cleanup",
          "Qdrant vector database integration with HTTPS",
          "Advanced filtering and search capabilities",
          "Direct Qdrant client integration",
          "Automatic collection initialization",
        ],
      };
    } catch (error) {
      await discordNotifier.sendErrorNotification(error as Error, {
        operation: "getConversionStats",
      });
      console.error("❌ Failed to get conversion stats:", error);
      throw error;
    }
  }
}
