import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';


const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get('content-type') || '';
    let extractedText = '';
    if (contentType.includes('application/json')) {
      const { text } = await req.json();
      if (!text || typeof text !== 'string' || text.length < 100) {
        return NextResponse.json({ error: 'No or insufficient text provided' }, { status: 400 });
      }
      extractedText = text;
    } else {
      const formData = await req.formData();
      const file = formData.get('file') as File;
      if (!file) {
        return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
      }
      if (file.type !== 'application/pdf') {
        return NextResponse.json({ error: 'Only PDF files are supported' }, { status: 400 });
      }
      // Check file size (limit to 10MB)
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        return NextResponse.json({ error: 'File size too large. Maximum size is 10MB' }, { status: 400 });
      }
      // Convert file to text (simplified - in production you'd use a PDF parser)
      const arrayBuffer = await file.arrayBuffer();
      extractedText = extractTextFromPDF(arrayBuffer);
    }
    if (!extractedText || extractedText.length < 100) {
      return NextResponse.json({ error: 'Could not extract sufficient text from PDF. Please ensure the PDF contains readable text.' }, { status: 400 });
    }
    // Only send the extracted content to OpenAI
    const prompt = `You are given the extracted content from a PDF file. Ignore anything about what a PDF is or how to use PDFs. Focus ONLY on the actual subject matter and information contained within the PDF content below.\n\nBased on the following PDF content, generate exactly 10 flashcards. Each flashcard should have:\n- A clear, concise question that tests understanding of the material\n- A detailed answer or explanation\n- A helpful hint that guides without giving away the answer\n\nPDF Content:\n${extractedText.substring(0, 3000)} // Limit to first 3000 characters\n\nPlease generate 10 flashcards covering the most important concepts from this material. Return ONLY a valid JSON object with no explanation, markdown, or code fences. Format: {"flashcards": [{"question": "...", "answer": "...", "hint": "..."}]}\n\nIMPORTANT: The flashcards should be educational, engaging, and cover different aspects of the content. Do NOT generate flashcards about what a PDF is, how to use PDFs, or anything unrelated to the actual content. Make sure questions are clear and answers are comprehensive.`;
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You are an expert educational content creator. Generate high-quality flashcards that help students learn effectively. Always return valid JSON with no additional text.' },
        { role: 'user', content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 2000,
      response_format: { type: 'text' },
    });
    let content = completion.choices?.[0]?.message?.content?.trim() || '';
    if (content.startsWith('```')) {
      content = content.replace(/```(json)?/g, '').replace(/```/g, '').trim();
    }
    let result;
    try {
      result = JSON.parse(content);
    } catch {
      // Try to extract the first JSON object from the content using regex
      const match = content.match(/\{[\s\S]*\}/);
      if (match) {
        try {
          result = JSON.parse(match[0]);
        } catch {
          return NextResponse.json({ error: 'Failed to parse OpenAI response (regex fallback)', raw: content }, { status: 500 });
        }
      } else {
        return NextResponse.json({ error: 'Failed to parse OpenAI response', raw: content }, { status: 500 });
      }
    }
    if (!result || !result.flashcards || !Array.isArray(result.flashcards)) {
      return NextResponse.json({ error: 'Flashcard generation failed. Invalid format.', raw: content }, { status: 500 });
    }
    // Validate flashcard structure
    const validatedFlashcards = result.flashcards.map((card: any, index: number) => ({
      question: card.question || `Question ${index + 1}`,
      answer: card.answer || 'Answer not provided',
      hint: card.hint || null,
    })).slice(0, 10); // Ensure maximum 10 flashcards
    // Prepare response
    const responsePayload = {
      flashcards: validatedFlashcards,
      totalCards: validatedFlashcards.length,
      message: 'Flashcards generated successfully'
    };
    return NextResponse.json(responsePayload);
  } catch (err) {
    console.error('PDF Flashcard generation error:', err);
    return NextResponse.json({ error: 'Internal server error', details: String(err) }, { status: 500 });
  }
}

// Simplified PDF text extraction function
function extractTextFromPDF(arrayBuffer: ArrayBuffer): string {
  try {
    // This is a simplified approach - in production you'd use a proper PDF parser like pdf-parse
    const uint8Array = new Uint8Array(arrayBuffer);
    const textDecoder = new TextDecoder('utf-8');
    let text = textDecoder.decode(uint8Array);
    
    // Remove binary data and extract readable text
    text = text.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F]/g, '');
    
    // Extract text between PDF content markers (simplified)
    const textMatches = text.match(/BT[\s\S]*?ET/g);
    if (textMatches) {
      return textMatches.join(' ').replace(/[^\w\s.,!?;:()\-]/g, ' ').replace(/\s+/g, ' ').trim();
    }
    
    // Fallback: extract any readable text
    return text.replace(/[^\w\s.,!?;:()\-]/g, ' ').replace(/\s+/g, ' ').trim();
  } catch (error) {
    console.error('PDF text extraction error:', error);
    return '';
  }
} 