import { QdrantClient } from '@qdrant/js-client-rest';

const qdrantUrl = process.env.QDRANT_URL || "http://127.0.0.1:6333";
const qdrantApiKey = process.env.QDRANT_API_KEY;
const qdrantCollectionName = process.env.QDRANT_COLLECTION_NAME || "study-materials";

const qdrantClient = new QdrantClient({
  url: qdrantUrl,
  ...(qdrantApiKey && { apiKey: qdrantApiKey }),
});

async function testQdrant() {
  try {
    console.log('🔍 Testing Qdrant connection...');
    
    // Test 1: Get collections
    console.log('📋 Getting collections...');
    const collections = await qdrantClient.getCollections();
    console.log('✅ Collections:', collections.collections.map(c => c.name));
    
    // Test 2: Check if our collection exists
    const collectionExists = collections.collections.some(
      (col) => col.name === qdrantCollectionName
    );
    
    if (!collectionExists) {
      console.log(`📦 Creating collection: ${qdrantCollectionName}`);
      await qdrantClient.createCollection(qdrantCollectionName, {
        vectors: {
          size: 1536,
          distance: "Cosine",
        },
      });
      console.log('✅ Collection created successfully');
    } else {
      console.log(`✅ Collection already exists: ${qdrantCollectionName}`);
    }
    
    // Test 3: Create a test vector
    console.log('🧪 Creating test vector...');
    const testVector = new Array(1536).fill(0.1); // Dummy vector
    const testPoint = {
      id: "test-point-1",
      vector: testVector,
      payload: {
        test: true,
        message: "Hello Qdrant!",
        timestamp: new Date().toISOString(),
      },
    };
    
    await qdrantClient.upsert(qdrantCollectionName, {
      wait: true,
      points: [testPoint],
    });
    console.log('✅ Test vector created successfully');
    
    // Test 4: Search for the test vector
    console.log('🔍 Testing search...');
    const searchResults = await qdrantClient.search(qdrantCollectionName, {
      vector: testVector,
      limit: 5,
      with_payload: true,
    });
    
    console.log('✅ Search results:', searchResults.length, 'matches');
    if (searchResults.length > 0) {
      console.log('📊 Top match score:', searchResults[0].score);
      console.log('📊 Top match payload:', searchResults[0].payload);
    }
    
    console.log('🎉 All tests passed! Qdrant is working correctly.');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
    });
    process.exit(1);
  }
}

testQdrant(); 