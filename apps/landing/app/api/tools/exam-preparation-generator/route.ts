import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get('content-type') || '';
    let extractedText = '';
    let questionTypes = '';
    let totalMarks = '';
    if (contentType.includes('application/json')) {
      const body = await req.json();
      const { text, questionTypes: qt, totalMarks: tm } = body;
      if (!text || typeof text !== 'string' || text.length < 100) {
        return NextResponse.json({ error: 'No or insufficient text provided' }, { status: 400 });
      }
      extractedText = text;
      questionTypes = qt;
      totalMarks = tm;
    } else {
      const formData = await req.formData();
      const file = formData.get('file') as File;
      questionTypes = formData.get('questionTypes') as string;
      totalMarks = formData.get('totalMarks') as string;
      if (!file) {
        return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
      }
      if (file.type !== 'application/pdf') {
        return NextResponse.json({ error: 'Only PDF files are supported' }, { status: 400 });
      }
      const maxSize = 10 * 1024 * 1024;
      if (file.size > maxSize) {
        return NextResponse.json({ error: 'File size too large. Maximum size is 10MB' }, { status: 400 });
      }
      const arrayBuffer = await file.arrayBuffer();
      extractedText = extractTextFromPDF(arrayBuffer);
    }
    if (!extractedText || extractedText.length < 100) {
      return NextResponse.json({ error: 'Could not extract sufficient text from PDF. Please ensure the PDF contains readable text.' }, { status: 400 });
    }
    // 1. Summarize notes
    const notesPrompt = `Summarize the following PDF content into clear, concise study notes. Focus on the most important concepts, definitions, and explanations.\n\nPDF Content:\n${extractedText.substring(0, 3000)}\n\nReturn ONLY the notes as plain text, no extra explanation or formatting.`;
    const notesCompletion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You are an expert educator. Summarize educational content into clear, concise notes.' },
        { role: 'user', content: notesPrompt },
      ],
      temperature: 0.5,
      max_tokens: 800,
      response_format: { type: 'text' },
    });
    const notes = notesCompletion.choices?.[0]?.message?.content?.trim() || '';
    // 2. Generate exam questions
    const examPrompt = `Based on the following PDF content, generate an exam paper with questions totaling exactly ${totalMarks} marks. Use only these question types: ${questionTypes}. For each question, specify the type (MCQ, Short Answer, True/False, etc.), the question text, the marks, and the correct answer. Distribute marks appropriately.\n\nPDF Content:\n${extractedText.substring(0, 3000)}\n\nReturn ONLY a valid JSON object with no explanation, markdown, or code fences. Format: {"questions": [{"type": "MCQ", "question": "...", "marks": 2, "answer": "...", "options": ["A", "B", "C", "D"] (if MCQ)}]}`;
    const examCompletion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You are an expert exam creator. Generate high-quality exam questions in JSON format.' },
        { role: 'user', content: examPrompt },
      ],
      temperature: 0.7,
      max_tokens: 1500,
      response_format: { type: 'text' },
    });
    let examContent = examCompletion.choices?.[0]?.message?.content?.trim() || '';
    if (examContent.startsWith('```')) {
      examContent = examContent.replace(/```(json)?/g, '').replace(/```/g, '').trim();
    }
    let examResult;
    try {
      examResult = JSON.parse(examContent);
    } catch {
      const match = examContent.match(/\{[\s\S]*\}/);
      if (match) {
        try {
          examResult = JSON.parse(match[0]);
        } catch {
          return NextResponse.json({ error: 'Failed to parse OpenAI exam response (regex fallback)', raw: examContent }, { status: 500 });
        }
      } else {
        return NextResponse.json({ error: 'Failed to parse OpenAI exam response', raw: examContent }, { status: 500 });
      }
    }
    if (!examResult || !examResult.questions || !Array.isArray(examResult.questions)) {
      return NextResponse.json({ error: 'Exam generation failed. Invalid format.', raw: examContent }, { status: 500 });
    }
    // Validate structure
    const validatedQuestions = examResult.questions.map((q: any, idx: number) => ({
      type: q.type || 'Unknown',
      question: q.question || `Question ${idx + 1}`,
      marks: q.marks || 1,
      answer: q.answer || '',
      options: q.options || null,
    }));
    return NextResponse.json({
      notes,
      questions: validatedQuestions,
      totalQuestions: validatedQuestions.length,
      message: 'Notes and exam generated successfully',
    });
  } catch (err) {
    console.error('Exam Preparation generation error:', err);
    return NextResponse.json({ error: 'Internal server error', details: String(err) }, { status: 500 });
  }
}

// Simplified PDF text extraction function
function extractTextFromPDF(arrayBuffer: ArrayBuffer): string {
  try {
    const uint8Array = new Uint8Array(arrayBuffer);
    const textDecoder = new TextDecoder('utf-8');
    let text = textDecoder.decode(uint8Array);
    text = text.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F]/g, '');
    const textMatches = text.match(/BT[\s\S]*?ET/g);
    if (textMatches) {
      return textMatches.join(' ').replace(/[^\w\s.,!?;:()\-]/g, ' ').replace(/\s+/g, ' ').trim();
    }
    return text.replace(/[^\w\s.,!?;:()\-]/g, ' ').replace(/\s+/g, ' ').trim();
  } catch (error) {
    console.error('PDF text extraction error:', error);
    return '';
  }
} 