import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';


const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const { text, numQuestions = 3, numOptions = 4, difficulty = 'Medium', questionType = 'MCQ' } = await req.json();
    if (!text || typeof text !== 'string') {
      return NextResponse.json({ error: 'Missing or invalid summary text' }, { status: 400 });
    }

    // Build prompt for summary-to-quiz
    let prompt = `You are a professional quiz generator. Based on the following summary or notes, generate exactly ${numQuestions} ${questionType === 'TrueFalse' ? 'True/False' : 'multiple-choice'} questions`;
    if (questionType === 'MCQ') {
      prompt += `, each with ${numOptions} options`;
    }
    prompt += `. The quiz should have a ${difficulty.toLowerCase()} difficulty level. For each question, provide the options and indicate the correct answer by index (0-${numOptions - 1}). Return ONLY a valid JSON array, with no explanation, markdown, or code fences. Format: [`;
    if (questionType === 'MCQ') {
      prompt += '{"question": "...", "options": ["..."], "answerIndex": 0}';
    } else {
      prompt += '{"question": "...", "options": ["True", "False"], "answerIndex": 0}';
    }
    prompt += `]. Summary: ${text}`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You are a professional quiz generator.' },
        { role: 'user', content: prompt },
      ],
      temperature: 0.5,
      max_tokens: 700,
      response_format: { type: 'text' },
    });

    let content = completion.choices?.[0]?.message?.content?.trim() || '';
    // Remove code fences if present
    if (content.startsWith('```')) {
      content = content.replace(/```(json)?/g, '').replace(/```/g, '').trim();
    }
    let quiz;
    try {
      quiz = JSON.parse(content);
    } catch {
      // Try to extract the first JSON array from the content using regex
      const match = content.match(/\[\s*{[\s\S]*?}\s*\]/);
      if (match) {
        try {
          quiz = JSON.parse(match[0]);
        } catch {
          return NextResponse.json({ error: 'Failed to parse OpenAI response (regex fallback)', raw: content }, { status: 500 });
        }
      } else {
        return NextResponse.json({ error: 'Failed to parse OpenAI response', raw: content }, { status: 500 });
      }
    }
    if (!Array.isArray(quiz) || quiz.length === 0 || !quiz[0].question) {
      return NextResponse.json({ error: 'Quiz generation failed. Invalid quiz format.', raw: content }, { status: 500 });
    }
    return NextResponse.json({ quiz });
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error', details: String(err) }, { status: 500 });
  }
} 