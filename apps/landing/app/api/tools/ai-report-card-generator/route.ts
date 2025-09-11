import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';


const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const {
      studentName,
      gradeLevel,
      subject,
      term,
      performanceData,
      schoolName,
      schoolAddress,
      principalName,
      teacherName,
      generationMethod = 'AI Generated',
    } = await req.json();

    if (!studentName || !gradeLevel || !subject || !term || !performanceData) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Build prompt for OpenAI
    const prompt = `You are a professional educator. Based on the following details, generate a detailed, formal, and encouraging report card summary for the student.\n\nStudent Name: ${studentName}\nGrade Level: ${gradeLevel}\nSubject: ${subject}\nTerm: ${term}\nPerformance Data: ${performanceData}\nSchool Name: ${schoolName}\nSchool Address: ${schoolAddress}\nPrincipal's Name: ${principalName}\nTeacher's Name: ${teacherName}\n\nThe report should be suitable for sharing with parents and should highlight strengths, areas for improvement, and a positive closing remark. Return ONLY the report card text, no explanations or markdown.`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You are a professional educator and report card writer.' },
        { role: 'user', content: prompt },
      ],
      temperature: 0.5,
      max_tokens: 700,
      response_format: { type: 'text' },
    });

    let content = completion.choices?.[0]?.message?.content?.trim() || '';
    // Remove code fences if present
    if (content.startsWith('```')) {
      content = content.replace(/```(text)?/g, '').replace(/```/g, '').trim();
    }

    if (!content) {
      return NextResponse.json({ error: 'Failed to generate report card.' }, { status: 500 });
    }

    return NextResponse.json({ report: content });
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error', details: String(err) }, { status: 500 });
  }
} 