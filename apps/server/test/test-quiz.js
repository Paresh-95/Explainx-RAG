// Test file for Quiz Generation API
// Run with: bun test-quiz.js

const BASE_URL = 'http://localhost:8000';

// Test data
const testData = {
  studyMaterialId: 'cmbt8ar730001umt6lw75a8ty', // Use an existing study material ID
  count: 5, // Generate 5 questions
};

// Get API key from environment
const API_KEY = process.env.BACKEND_API_KEY || 'your-api-key';

async function testQuizGeneration() {
  console.log('🧪 Testing Quiz Generation API\n');

  try {
    // 1. Generate quiz questions
    console.log('1. Generating quiz questions...');
    const generateResponse = await fetch(`${BASE_URL}/api/quiz/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
        'x-user-id': 'test-user-789'
      },
      body: JSON.stringify(testData),
    });

    const generateResult = await generateResponse.json();
    console.log('Generate Response:', JSON.stringify(generateResult, null, 2));

    if (!generateResult.success) {
      throw new Error(`Quiz generation failed: ${generateResult.error}`);
    }

    // 2. Validate question structure
    console.log('\n2. Validating question structure...');
    const questions = generateResult.questions;
    
    if (!Array.isArray(questions)) {
      throw new Error('Questions should be an array');
    }

    questions.forEach((question, index) => {
      console.log(`\nQuestion ${index + 1}:`);
      console.log('Question:', question.question);
      console.log('Options:');
      question.options.forEach(option => {
        console.log(`  ${option.id}: ${option.text}`);
      });
      console.log('Correct Answer:', question.correctOptionId);
      console.log('Explanation:', question.explanation);
    });

    // 3. Test with different count
    console.log('\n3. Testing with different count...');
    const differentCountData = {
      ...testData,
      count: 3 // Request 3 questions
    };

    const differentCountResponse = await fetch(`${BASE_URL}/api/quiz/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
        'x-user-id': 'test-user-789'
      },
      body: JSON.stringify(differentCountData),
    });

    const differentCountResult = await differentCountResponse.json();
    console.log('Different Count Response:', JSON.stringify(differentCountResult, null, 2));

    // 4. Test error handling
    console.log('\n4. Testing error handling...');
    const invalidData = {
      studyMaterialId: 'non-existent-id',
      count: 25 // Exceeds maximum limit
    };

    const errorResponse = await fetch(`${BASE_URL}/api/quiz/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
        'x-user-id': 'test-user-789'
      },
      body: JSON.stringify(invalidData),
    });

    const errorResult = await errorResponse.json();
    console.log('Error Response:', JSON.stringify(errorResult, null, 2));

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testQuizGeneration(); 