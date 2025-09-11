import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';


const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const { instructions, answer, rubric = '', language = 'English' } = await req.json();
    if (!instructions || typeof instructions !== 'string' || !answer || typeof answer !== 'string') {
      return NextResponse.json({ error: 'Missing or invalid instructions or answer' }, { status: 400 });
    }

    let prompt = `You are a professional teacher and grader. Grade the following student answer based on the assignment instructions${rubric ? ' and the provided rubric' : ''}. Provide a grade (A-F) and detailed feedback. Return ONLY a valid JSON object, with no explanation, markdown, or code fences. Format: {\"grade\": \"A\", \"feedback\": \"...\"}${rubric ? ', "rubricBreakdown": {"...": "..."}' : ''}.\nAssignment Instructions: ${instructions}\n${rubric ? `Rubric: ${rubric}\n` : ''}Student Answer: ${answer}`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You are a professional teacher and grader.' },
        { role: 'user', content: prompt },
      ],
      temperature: 0.3,
      max_tokens: 700,
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
    if (!result || !result.grade || !result.feedback) {
      return NextResponse.json({ error: 'Grading failed. Invalid format.', raw: content }, { status: 500 });
    }
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error', details: String(err) }, { status: 500 });
  }
} 