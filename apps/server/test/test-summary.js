// Test file for Summary Generation API
// Run with: bun test-summary.js

const BASE_URL = 'http://localhost:8000';

// Test data
const testData = {
  studyMaterialId: 'cmbt8ar730001umt6lw75a8ty', // Use an existing study material ID
};

// Get API key from environment
const API_KEY = process.env.BACKEND_API_KEY || 'your-api-key';

async function testSummaryGeneration() {
  console.log('🧪 Testing Summary Generation API\n');

  try {
    // 1. Check summary status
    console.log('1. Checking summary status...');
    console.log('Request URL:', `${BASE_URL}/api/summary/status/${testData.studyMaterialId}`);
    console.log('Headers:', {
      'Authorization': `Bearer ${API_KEY}`,
      'x-user-id': 'test-user-789'
    });

    const statusResponse = await fetch(`${BASE_URL}/api/summary/status/${testData.studyMaterialId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'x-user-id': 'test-user-789'
      }
    });

    console.log('Status Response Status:', statusResponse.status);
    console.log('Status Response Headers:', Object.fromEntries(statusResponse.headers.entries()));
    
    const responseText = await statusResponse.text();
    console.log('Raw Response:', responseText);

    let statusResult;
    try {
      statusResult = JSON.parse(responseText);
      console.log('Status Response:', JSON.stringify(statusResult, null, 2));
    } catch (parseError) {
      console.error('Failed to parse JSON response:', parseError);
      throw new Error(`Failed to parse JSON response: ${responseText}`);
    }

    // 2. Generate summary
    console.log('\n2. Generating summary...');
    console.log('Request URL:', `${BASE_URL}/api/summary/generate`);
    console.log('Request Body:', JSON.stringify(testData, null, 2));

    const generateResponse = await fetch(`${BASE_URL}/api/summary/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
        'x-user-id': 'test-user-789'
      },
      body: JSON.stringify(testData),
    });

    console.log('Generate Response Status:', generateResponse.status);
    console.log('Generate Response Headers:', Object.fromEntries(generateResponse.headers.entries()));
    
    const generateText = await generateResponse.text();
    console.log('Raw Generate Response:', generateText);

    let generateResult;
    try {
      generateResult = JSON.parse(generateText);
      console.log('Generate Response:', JSON.stringify(generateResult, null, 2));
    } catch (parseError) {
      console.error('Failed to parse JSON response:', parseError);
      throw new Error(`Failed to parse JSON response: ${generateText}`);
    }

    if (!generateResult.success) {
      throw new Error(`Summary generation failed: ${generateResult.error}`);
    }

    // 3. Validate summary structure
    console.log('\n3. Validating summary structure...');
    const summary = generateResult.summary;
    
    console.log('Title:', summary.title);
    console.log('Main Summary:', summary.mainSummary);
    console.log('Key Points:', summary.keyPoints);
    console.log('Important Concepts:', summary.importantConcepts);
    console.log('Difficulty:', summary.difficulty);
    console.log('Estimated Reading Time:', summary.estimatedReadingTime, 'minutes');
    
    if (summary.sections) {
      console.log('\nSections:');
      summary.sections.forEach((section, index) => {
        console.log(`\nSection ${index + 1}:`);
        console.log('Title:', section.title);
        console.log('Summary:', section.summary);
        console.log('Key Points:', section.keyPoints);
      });
    }

    // 4. Test error handling
    console.log('\n4. Testing error handling...');
    const invalidData = {
      studyMaterialId: '' // Empty study material ID
    };

    console.log('Error Test Request URL:', `${BASE_URL}/api/summary/generate`);
    console.log('Error Test Request Body:', JSON.stringify(invalidData, null, 2));

    const errorResponse = await fetch(`${BASE_URL}/api/summary/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
        'x-user-id': 'test-user-789'
      },
      body: JSON.stringify(invalidData),
    });

    console.log('Error Response Status:', errorResponse.status);
    console.log('Error Response Headers:', Object.fromEntries(errorResponse.headers.entries()));
    
    const errorText = await errorResponse.text();
    console.log('Raw Error Response:', errorText);

    let errorResult;
    try {
      errorResult = JSON.parse(errorText);
      console.log('Error Response:', JSON.stringify(errorResult, null, 2));
    } catch (parseError) {
      console.error('Failed to parse JSON response:', parseError);
      throw new Error(`Failed to parse JSON response: ${errorText}`);
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.stack) {
      console.error('Stack trace:', error.stack);
    }
  }
}

// Run the test
testSummaryGeneration(); 