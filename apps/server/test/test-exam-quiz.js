// Test file for Exam Quiz API
// Run with: bun test-exam-quiz.js

const BASE_URL = 'http://localhost:8000';

// Test data
const testData = {
  spaceId: 'cmbt6i8220007um82ni2wbubr', // Use an existing space ID
  message: 'What are the key concepts in this material?',
  conversationHistory: []
};

const studyQuestionsData = {
  spaceId: 'cmbt6i8220007um82ni2wbubr',
  topic: 'General concepts',
  count: 5
};

// Get API key from environment or use test key
const API_KEY = process.env.BACKEND_API_KEY || 'test-api-key-123';

async function testExamQuiz() {
  console.log('🧪 Testing Exam Quiz API\n');
  console.log('Using API Key:', API_KEY);

  try {
    // 1. Test chat endpoint
    console.log('1. Testing chat endpoint...');
    const chatResponse = await fetch(`${BASE_URL}/api/exam-chat/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
        'x-user-id': 'test-user-789'
      },
      body: JSON.stringify(testData),
    });

    console.log('Chat Response Status:', chatResponse.status);
    console.log('Chat Response Headers:', Object.fromEntries(chatResponse.headers.entries()));
    
    const responseText = await chatResponse.text();
    console.log('Raw Response:', responseText);

    let chatResult;
    try {
      chatResult = JSON.parse(responseText);
    } catch (parseError) {
      console.error('Failed to parse response:', parseError);
      throw new Error(`Failed to parse response: ${responseText}`);
    }

    console.log('Chat Response:', JSON.stringify(chatResult, null, 2));

    if (!chatResult.success) {
      throw new Error(`Chat failed: ${chatResult.error}`);
    }

    // 2. Test study questions endpoint
    console.log('\n2. Testing study questions generation...');
    const questionsResponse = await fetch(`${BASE_URL}/api/exam-chat/study-questions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
        'x-user-id': 'test-user-789'
      },
      body: JSON.stringify(studyQuestionsData),
    });

    console.log('Questions Response Status:', questionsResponse.status);
    const questionsText = await questionsResponse.text();
    console.log('Raw Questions Response:', questionsText);

    let questionsResult;
    try {
      questionsResult = JSON.parse(questionsText);
    } catch (parseError) {
      console.error('Failed to parse questions response:', parseError);
      throw new Error(`Failed to parse questions response: ${questionsText}`);
    }

    console.log('Study Questions Response:', JSON.stringify(questionsResult, null, 2));

    if (!questionsResult.success) {
      throw new Error(`Study questions generation failed: ${questionsResult.error}`);
    }

    // 3. Test space summary endpoint
    console.log('\n3. Testing space summary...');
    const summaryResponse = await fetch(`${BASE_URL}/api/exam-chat/spaces/${testData.spaceId}/summary`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'x-user-id': 'test-user-789'
      }
    });

    console.log('Summary Response Status:', summaryResponse.status);
    const summaryText = await summaryResponse.text();
    console.log('Raw Summary Response:', summaryText);

    let summaryResult;
    try {
      summaryResult = JSON.parse(summaryText);
    } catch (parseError) {
      console.error('Failed to parse summary response:', parseError);
      throw new Error(`Failed to parse summary response: ${summaryText}`);
    }

    console.log('Space Summary Response:', JSON.stringify(summaryResult, null, 2));

    if (!summaryResult.success) {
      throw new Error(`Space summary failed: ${summaryResult.error}`);
    }

    // 4. Test error handling
    console.log('\n4. Testing error handling...');
    
    // Test invalid space ID
    const invalidSpaceData = {
      spaceId: 'non-existent-id',
      message: 'Test message'
    };

    const errorResponse = await fetch(`${BASE_URL}/api/exam-chat/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
        'x-user-id': 'test-user-789'
      },
      body: JSON.stringify(invalidSpaceData),
    });

    console.log('Error Response Status:', errorResponse.status);
    const errorText = await errorResponse.text();
    console.log('Raw Error Response:', errorText);

    let errorResult;
    try {
      errorResult = JSON.parse(errorText);
    } catch (parseError) {
      console.error('Failed to parse error response:', parseError);
      throw new Error(`Failed to parse error response: ${errorText}`);
    }

    console.log('Error Response:', JSON.stringify(errorResult, null, 2));

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testExamQuiz(); 