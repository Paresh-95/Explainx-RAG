import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';


const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const { courseTitle, targetAudience, prerequisites, duration, learningOutcomes } = await req.json();
    
    if (!courseTitle || typeof courseTitle !== 'string' || 
        !targetAudience || typeof targetAudience !== 'string' || 
        !prerequisites || typeof prerequisites !== 'string' || 
        !duration || typeof duration !== 'string' ||
        !learningOutcomes || typeof learningOutcomes !== 'string') {
      return NextResponse.json({ error: 'Missing or invalid required fields' }, { status: 400 });
    }

    const prompt = `Create a visually attractive, well-formatted course curriculum for the following specifications:

Course Title: ${courseTitle}
Target Audience: ${targetAudience}
Prerequisites: ${prerequisites}
Duration: ${duration}
Learning Outcomes: ${learningOutcomes}

The curriculum should:
- Use ALL CAPS or bold for section headings (e.g., COURSE OVERVIEW, MODULE 1, ACTIVITIES, ASSESSMENTS, TIMELINE, RESOURCES, DIFFERENTIATION STRATEGIES)
- Clearly separate each section with whitespace for readability
- Number modules clearly (e.g., MODULE 1: Title, MODULE 2: Title, ...)
- Use bullet points for lists (topics, activities, assessments, resources, etc.)
- Start with a COURSE OVERVIEW, then list MODULES, then ACTIVITIES, ASSESSMENTS, TIMELINE, RESOURCES, DIFFERENTIATION STRATEGIES
- Make the output visually attractive and easy to scan
- Do NOT use markdown or code blocks, just plain text with clear formatting

Return ONLY a valid JSON object with no explanation, markdown, or code fences. Format: {"curriculum": "well-formatted, visually attractive course curriculum plan text"}

Example:

{"curriculum": "COURSE OVERVIEW\nThis course covers...\n\nMODULE 1: Introduction to Data Science\nTopics:\n• What is Data Science?\n• Applications\n\nACTIVITIES:\n• Group discussion\n• Case study\n\nASSESSMENTS:\n• Quiz\n\nMODULE 2: ...\n...\n\nTIMELINE:\n• Week 1: ...\n• Week 2: ...\n\nRESOURCES:\n• Book: ...\n• Website: ...\n\nDIFFERENTIATION STRATEGIES:\n• Extra support for beginners\n• Advanced tasks for fast learners\n"}
`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You are an expert course designer and educational consultant. Always return course curriculum plans as well-formatted, readable text with clear headings, bullet points, and organized sections. Do NOT return JSON structures or code blocks.' },
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
      return NextResponse.json({ error: 'Course curriculum generation failed. Invalid format.', raw: content }, { status: 500 });
    }
    
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error', details: String(err) }, { status: 500 });
  }
} 