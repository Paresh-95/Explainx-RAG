// Test file for Flashcard Generation API
// Run with: bun test-flashcards.js

const BASE_URL = 'http://localhost:8000';
const API_KEY = process.env.API_KEY || 'test-api-key'; // Add your actual API key here

// Test data
const testData = {
  studyMaterialId: 'cmbt8ar730001umt6lw75a8ty', // Use an existing study material ID
  count: 5, // Generate 5 flashcards
};

// Get API key from environment
async function testFlashcardGeneration() {
  console.log('🧪 Testing Flashcard Generation API\n');

  try {
    // 1. Generate flashcards
    console.log('1. Generating flashcards...');
    const generateResponse = await fetch(`${BASE_URL}/api/flashcards/generate`, {
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
      throw new Error(`Flashcard generation failed: ${generateResult.error}`);
    }

    // 2. Validate flashcard structure
    console.log('\n2. Validating flashcard structure...');
    const flashcards = generateResult.flashcards;
    
    if (!Array.isArray(flashcards)) {
      throw new Error('Flashcards should be an array');
    }

    flashcards.forEach((card, index) => {
      console.log(`\nFlashcard ${index + 1}:`);
      console.log('Question:', card.question);
      console.log('Answer:', card.answer);
      console.log('Hint:', card.hint);
    });

    // 3. Test with different count
    console.log('\n3. Testing with different count...');
    const differentCountData = {
      ...testData,
      count: 3 // Request 3 flashcards
    };

    const differentCountResponse = await fetch(`${BASE_URL}/api/flashcards/generate`, {
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

    const errorResponse = await fetch(`${BASE_URL}/api/flashcards/generate`, {
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
testFlashcardGeneration(); 