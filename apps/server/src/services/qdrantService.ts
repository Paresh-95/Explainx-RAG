// ==========================================
// CENTRALIZED QDRANT SERVICE - src/services/qdrantService.ts
// ==========================================

import { QdrantVectorStore } from "@langchain/qdrant";
import { OpenAIEmbeddings } from "@langchain/openai";
import {
  client as qdrantClient,
  COLLECTION_NAME,
  VECTOR_CONFIG,
  initializeCollection,
  checkConnection,
  qdrantConfig,
} from "../config/qdrant";
import { discordNotifier } from "./discordNotifier";

interface VectorStoreInstance {
  instance: QdrantVectorStore | null;
  lastInitialized: Date | null;
}

class QdrantService {
  private vectorStores: Map<string, VectorStoreInstance> = new Map();
  private embeddings: OpenAIEmbeddings;
  private connectionTested = false;

  constructor() {
    this.embeddings = new OpenAIEmbeddings({
      openAIApiKey: process.env.OPENAI_API_KEY,
      modelName: "text-embedding-ada-002",
    });
  }

  /**
   * Test Qdrant connection - only runs once per service instance
   */
  async testConnection(): Promise<boolean> {
    if (this.connectionTested) return true;

    try {
      const result = await checkConnection();
      this.connectionTested = result;
      return result;
    } catch (error) {
      console.error("❌ Qdrant connection test failed:", error);
      return false;
    }
  }

  /**
   * Get or create a vector store for a specific collection
   */
  async getVectorStore(collectionName: string = COLLECTION_NAME): Promise<QdrantVectorStore> {
    // Check if we already have a vector store for this collection
    const existing = this.vectorStores.get(collectionName);
    if (existing?.instance) {
      return existing.instance;
    }

    // Test connection first
    const connectionOk = await this.testConnection();
    if (!connectionOk) {
      throw new Error(
        "Qdrant connection failed. Please check Qdrant configuration and ensure it's running.",
      );
    }

    try {
      console.log(`🔄 Initializing Qdrant vector store for collection: ${collectionName}`);

      // Ensure the collection exists
      await initializeCollection(collectionName);

      // Create vector store instance
      const vectorStore = new QdrantVectorStore(this.embeddings, {
        client: qdrantClient,
        collectionName,
        collectionConfig: {
          vectors: {
            size: VECTOR_CONFIG.size,
            distance: VECTOR_CONFIG.distance,
          },
        },
      });

      // Store the instance
      this.vectorStores.set(collectionName, {
        instance: vectorStore,
        lastInitialized: new Date(),
      });

      console.log(`✅ Vector store initialized for collection: ${collectionName}`);
      
      // Send success notification
      await discordNotifier.sendSuccessNotification(
        `Vector store initialized successfully for collection: ${collectionName}`,
        {
          collectionName,
          host: qdrantConfig.host,
          port: qdrantConfig.port,
        }
      );

      return vectorStore;
    } catch (error) {
      console.error(`❌ Failed to initialize vector store for ${collectionName}:`, error);
      
      // Send error notification
      await discordNotifier.sendErrorNotification(error as Error, {
        operation: "Vector store initialization",
        collectionName,
        host: qdrantConfig.host,
        port: qdrantConfig.port,
      });

      throw new Error(`Failed to initialize vector store: ${error}`);
    }
  }

  /**
   * Get the default vector store (uses COLLECTION_NAME from config)
   */
  async getDefaultVectorStore(): Promise<QdrantVectorStore> {
    return this.getVectorStore(COLLECTION_NAME);
  }

  /**
   * Reset connection state - useful for testing or reconnecting
   */
  resetConnection(): void {
    this.connectionTested = false;
    this.vectorStores.clear();
  }

  /**
   * Get service status
   */
  getStatus() {
    return {
      connectionTested: this.connectionTested,
      activeCollections: Array.from(this.vectorStores.keys()),
      config: qdrantConfig,
    };
  }

  /**
   * Health check - tests connection and returns detailed status
   */
  async healthCheck(): Promise<{
    status: 'healthy' | 'unhealthy';
    connection: boolean;
    collections: string[];
    config: typeof qdrantConfig;
    error?: string;
  }> {
    try {
      const connectionOk = await checkConnection();
      return {
        status: connectionOk ? 'healthy' : 'unhealthy',
        connection: connectionOk,
        collections: Array.from(this.vectorStores.keys()),
        config: qdrantConfig,
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        connection: false,
        collections: [],
        config: qdrantConfig,
        error: String(error),
      };
    }
  }
}

// Export singleton instance
export const qdrantService = new QdrantService();

// Export for backward compatibility
export {
  COLLECTION_NAME,
  VECTOR_CONFIG,
  qdrantConfig,
} from "../config/qdrant";