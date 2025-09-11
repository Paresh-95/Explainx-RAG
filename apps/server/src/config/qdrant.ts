// ==========================================
// QDRANT CLIENT CONFIGURATION - src/config/qdrant.ts
// ==========================================

import { QdrantClient } from "@qdrant/js-client-rest";

// Configuration with environment variables support
const railwayHost = process.env.QDRANT_HOST || "localhost";
const port = parseInt(process.env.QDRANT_PORT || "6333");
const useHttps = process.env.QDRANT_HTTPS === "true" || process.env.NODE_ENV === "production";

const config = {
  host: railwayHost,
  port: port,
  https: useHttps,
  checkCompatibility: false,
  apiKey: process.env.QDRANT__SERVICE__API_KEY,
};

// Create and export the client instance
export const client = new QdrantClient(config);

// Export config object for use in notifications and debugging
export const qdrantConfig = config;

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
    console.log(`✅ Qdrant connection successful (${config.https ? 'https' : 'http'}://${config.host}:${config.port})`);
    return true;
  } catch (error) {
    console.error(`❌ Qdrant connection failed (${config.https ? 'https' : 'http'}://${config.host}:${config.port}):`, error);
    return false;
  }
}

// Export default client for backward compatibility
export default client;
