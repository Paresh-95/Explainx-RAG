import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';


const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const { content, platform, tone, length } = await req.json();
    
    if (!content || typeof content !== 'string' || 
        !platform || typeof platform !== 'string' || 
        !tone || typeof tone !== 'string' || 
        !length || typeof length !== 'string') {
      return NextResponse.json({ error: 'Missing or invalid required fields' }, { status: 400 });
    }

    const prompt = `Generate a ${tone.toLowerCase()} comment for the following content on ${platform}:

Content: "${content}"

Requirements:
- Tone: ${tone}
- Length: ${length}
- Platform: ${platform}

Please write an engaging comment that:
1. Responds appropriately to the content
2. Matches the specified tone and platform style
3. Is the appropriate length
4. Adds value to the conversation
5. Uses appropriate emojis and formatting for the platform

Return ONLY a valid JSON object with no explanation, markdown, or code fences. Format: {"comment": "complete comment text"}

IMPORTANT: The comment field should contain the complete, well-formatted comment text, NOT a JSON structure.`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You are an expert social media commentator and engagement specialist. Write authentic, engaging comments that add value to online conversations.' },
        { role: 'user', content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 500,
      response_format: { type: 'text' },
    });

    let content_response = completion.choices?.[0]?.message?.content?.trim() || '';
    if (content_response.startsWith('```')) {
      content_response = content_response.replace(/```(json)?/g, '').replace(/```/g, '').trim();
    }
    
    let result;
    try {
      result = JSON.parse(content_response);
    } catch {
      // Try to extract the first JSON object from the content using regex
      const match = content_response.match(/\{[\s\S]*\}/);
      if (match) {
        try {
          result = JSON.parse(match[0]);
        } catch {
          return NextResponse.json({ error: 'Failed to parse OpenAI response (regex fallback)', raw: content_response }, { status: 500 });
        }
      } else {
        return NextResponse.json({ error: 'Failed to parse OpenAI response', raw: content_response }, { status: 500 });
      }
    }
    
    if (!result || !result.comment) {
      return NextResponse.json({ error: 'Comment generation failed. Invalid format.', raw: content_response }, { status: 500 });
    }
    
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error', details: String(err) }, { status: 500 });
  }
} 