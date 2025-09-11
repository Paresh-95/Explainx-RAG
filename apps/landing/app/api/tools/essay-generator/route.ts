import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';


const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const { topic, essayType, length, style } = await req.json();
    
    if (!topic || typeof topic !== 'string' || 
        !essayType || typeof essayType !== 'string' || 
        !length || typeof length !== 'string' || 
        !style || typeof style !== 'string') {
      return NextResponse.json({ error: 'Missing or invalid required fields' }, { status: 400 });
    }

    const prompt = `Write a ${essayType.toLowerCase()} essay on the topic: "${topic}"

Requirements:
- Length: ${length}
- Writing Style: ${style}
- Essay Type: ${essayType}

Please write a well-structured essay that includes:
1. An engaging introduction with a clear thesis statement
2. Well-developed body paragraphs with supporting evidence
3. A strong conclusion that reinforces the main points
4. Proper transitions between paragraphs
5. Appropriate tone and style for the specified essay type

Return ONLY a valid JSON object with no explanation, markdown, or code fences. Format: {"essay": "complete essay text"}

IMPORTANT: The essay field should contain the complete, well-formatted essay text, NOT a JSON structure.`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You are an expert essay writer and writing tutor. Write clear, well-structured essays that follow academic standards and engage readers effectively.' },
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
    
    if (!result || !result.essay) {
      return NextResponse.json({ error: 'Essay generation failed. Invalid format.', raw: content }, { status: 500 });
    }
    
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error', details: String(err) }, { status: 500 });
  }
} 