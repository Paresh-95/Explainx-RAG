// Test file for YouTube processing API
// Run with: node test-youtube.js

const BASE_URL = 'http://localhost:8000';

// Test data
const testData = {
  studyMaterialId: 'test-youtube-123',
  spaceId: 'test-space-456',
  youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', // Rick Roll video
  userId: 'test-user-789',
  title: 'Test YouTube Video',
  description: 'A test video for processing'
};

async function testYouTubeProcessing() {
  console.log('🧪 Testing YouTube Processing API\n');

  try {
    // 1. Start processing
    console.log('1. Starting YouTube video processing...');
    const processResponse = await fetch(`${BASE_URL}/api/youtube/process`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData),
    });

    const processResult = await processResponse.json();
    console.log('Process Response:', processResult);

    if (!processResult.success) {
      throw new Error(`Processing failed: ${processResult.error}`);
    }

    // 2. Check status
    console.log('\n2. Checking processing status...');
    const statusResponse = await fetch(`${BASE_URL}/api/youtube/status/${testData.studyMaterialId}`);
    const statusResult = await statusResponse.json();
    console.log('Status Response:', statusResult);

    // 3. Test query (after processing completes)
    console.log('\n3. Testing query functionality...');
    const queryData = {
      query: 'What is this video about?',
      studyMaterialId: testData.studyMaterialId,
      spaceId: testData.spaceId,
      topK: 3,
      includeMetadata: true,
      userId: testData.userId,
    };

    const queryResponse = await fetch(`${BASE_URL}/api/youtube/query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(queryData),
    });

    const queryResult = await queryResponse.json();
    console.log('Query Response:', queryResult);

    // 4. Debug vector database
    console.log('\n4. Debugging vector database...');
    const debugResponse = await fetch(`${BASE_URL}/api/youtube/debug?studyMaterialId=${testData.studyMaterialId}`);
    const debugResult = await debugResponse.json();
    console.log('Debug Response:', debugResult);

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testYouTubeProcessing(); 