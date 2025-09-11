import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';


const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const { productName, category, rating, tone } = await req.json();
    
    if (!productName || typeof productName !== 'string' || 
        !category || typeof category !== 'string' || 
        !rating || typeof rating !== 'string' || 
        !tone || typeof tone !== 'string') {
      return NextResponse.json({ error: 'Missing or invalid required fields' }, { status: 400 });
    }

    const prompt = `Write a ${tone.toLowerCase()} review for ${productName} (Category: ${category}) with a rating of ${rating}.

Please write a comprehensive review that includes:
1. An engaging opening that captures attention
2. Detailed analysis of the product/service features
3. Pros and cons based on the rating
4. Personal experience or perspective
5. Recommendation for potential buyers
6. Appropriate tone and style for the specified review type

The review should be authentic, detailed, and helpful for other consumers.

Return ONLY a valid JSON object with no explanation, markdown, or code fences. Format: {"review": "complete review text"}

IMPORTANT: The review field should contain the complete, well-formatted review text, NOT a JSON structure.`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You are an expert product reviewer and consumer advocate. Write authentic, detailed, and helpful reviews that provide genuine value to readers.' },
        { role: 'user', content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 1500,
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
    
    if (!result || !result.review) {
      return NextResponse.json({ error: 'Review generation failed. Invalid format.', raw: content }, { status: 500 });
    }
    
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error', details: String(err) }, { status: 500 });
  }
} 