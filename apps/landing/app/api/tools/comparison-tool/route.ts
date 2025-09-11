import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';


const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const { left, right } = await req.json();
    if (!left || !right || typeof left !== 'string' || typeof right !== 'string') {
      return NextResponse.json({ error: 'Missing or invalid input' }, { status: 400 });
    }

    const prompt = `Compare the following two things in a clear, point-by-point table. For each point, provide a short label (e.g., 'Release Date', 'Owner', etc.), and a value for each side. Return ONLY a valid JSON array, with no explanation, markdown, or code fences. Format: [{"point": "...", "left": "...", "right": "..."}].

Thing 1: ${left}
Thing 2: ${right}`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You are an expert at making clear, unbiased comparison tables.' },
        { role: 'user', content: prompt },
      ],
      temperature: 0.5,
      max_tokens: 900,
      response_format: { type: 'text' },
    });

    let content = completion.choices?.[0]?.message?.content?.trim() || '';
    if (content.startsWith('```')) {
      content = content.replace(/```(json)?/g, '').replace(/```/g, '').trim();
    }
    let comparison;
    try {
      comparison = JSON.parse(content);
    } catch {
      // Try to extract the first JSON array from the content using regex
      const match = content.match(/\[\s*{[\s\S]*?}\s*\]/);
      if (match) {
        try {
          comparison = JSON.parse(match[0]);
        } catch {
          return NextResponse.json({ error: 'Failed to parse OpenAI response (regex fallback)', raw: content }, { status: 500 });
        }
      } else {
        return NextResponse.json({ error: 'Failed to parse OpenAI response', raw: content }, { status: 500 });
      }
    }
    if (!Array.isArray(comparison) || comparison.length === 0 || !comparison[0].point) {
      return NextResponse.json({ error: 'Comparison failed. Invalid format.', raw: content }, { status: 500 });
    }
    return NextResponse.json({ comparison });
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error', details: String(err) }, { status: 500 });
  }
} 