// ==========================================
// QDRANT CLIENT CONFIGURATION - src/config/qdrant.ts
// ==========================================

import { QdrantClient } from "@qdrant/js-client-rest";

// Configuration with environment variables support
const railwayHost = "qdrant-production-de67.up.railway.app";
const config = {
  host: railwayHost,
  port: 443, // Explicit HTTPS port
  https: true, // Force HTTPS
  checkCompatibility: false,
};

// Create and export the client instance
export const client = new QdrantClient(config);

// Export collection name for consistency
export const COLLECTION_NAME =
  process.env.QDRANT_COLLECTION_NAME || "study-materials";

// Export vector configuration for dense vectors
export const VECTOR_CONFIG = {
  size: 1536, // OpenAI ada-002 embedding size
  distance: "Cosine" as const,
};

// Utility function to initialize collection with dense vectors
export async function initializeCollection(
  collectionName: string = COLLECTION_NAME,
): Promise<void> {
  try {
    console.log(`🔄 Checking if Qdrant collection exists: ${collectionName}`);

    // Check if collection exists
    try {
      await client.getCollection(collectionName);
      console.log(`✅ Collection already exists: ${collectionName}`);
      return;
    } catch (error) {
      // Collection doesn't exist, create it
      console.log(`🔄 Creating Qdrant collection: ${collectionName}`);
    }

    // Create collection with dense vectors (not sparse)
    await client.createCollection(collectionName, {
      vectors: {
        size: VECTOR_CONFIG.size,
        distance: VECTOR_CONFIG.distance,
      },
      optimizers_config: {
        default_segment_number: 2,
      },
      replication_factor: 1,
    });

    console.log(`✅ Collection created successfully: ${collectionName}`);
  } catch (error) {
    console.error(`❌ Failed to initialize Qdrant collection:`, error);
    throw new Error(`Failed to initialize collection: ${error}`);
  }
}

// Utility function to check connection
export async function checkConnection(): Promise<boolean> {
  try {
    await client.getCollections();
    console.log("client", client);
    console.log("✅ Qdrant connection successful");
    return true;
  } catch (error) {
    console.error("❌ Qdrant connection failed:", error);
    console.error("error path", error);
    return false;
  }
}

checkConnection();
