import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';


const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const { subject, gradeLevel, learningObjectives, duration } = await req.json();
    
    if (!subject || typeof subject !== 'string' || 
        !gradeLevel || typeof gradeLevel !== 'string' || 
        !learningObjectives || typeof learningObjectives !== 'string' || 
        !duration || typeof duration !== 'string') {
      return NextResponse.json({ error: 'Missing or invalid required fields' }, { status: 400 });
    }

    const prompt = `Create a comprehensive curriculum plan for the following specifications:

Subject: ${subject}
Grade Level: ${gradeLevel}
Learning Objectives: ${learningObjectives}
Duration: ${duration}

Please create a detailed curriculum plan that includes:
1. Unit breakdown with clear learning outcomes
2. Suggested activities and teaching strategies
3. Assessment methods
4. Timeline and pacing
5. Resources and materials needed
6. Differentiation strategies for diverse learners

Return ONLY a valid JSON object with no explanation, markdown, or code fences. Format: {"curriculum": "detailed curriculum plan text"}

IMPORTANT: The curriculum field should contain a well-formatted, readable text description of the curriculum plan, NOT a JSON structure. Use clear headings, bullet points, and organized sections to make it easy to read. For example:

{"curriculum": "CURRICULUM PLAN

UNIT 1: Introduction to [Subject]
Learning Outcomes:
• Students will understand [specific outcome]
• Students will be able to [specific skill]

Activities:
• [Activity 1]
• [Activity 2]

Teaching Strategies:
• [Strategy 1]
• [Strategy 2]

ASSESSMENT METHODS:
• [Assessment 1]
• [Assessment 2]

TIMELINE:
• Week 1: [content]
• Week 2: [content]

RESOURCES NEEDED:
• [Resource 1]
• [Resource 2]

DIFFERENTIATION STRATEGIES:
• [Strategy 1]
• [Strategy 2]"}`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You are an expert curriculum designer and educational consultant. Always return curriculum plans as well-formatted, readable text with clear headings, bullet points, and organized sections. Do NOT return JSON structures or code blocks.' },
        { role: 'user', content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 3000,
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
    
    if (!result || !result.curriculum) {
      return NextResponse.json({ error: 'Curriculum planning failed. Invalid format.', raw: content }, { status: 500 });
    }
    
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error', details: String(err) }, { status: 500 });
  }
} 