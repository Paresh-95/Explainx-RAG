// app/api/chat/route.ts
import { NextRequest } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
    try {
        const { messages } = await request.json();

        if (!messages || !Array.isArray(messages)) {
            return new Response(
                JSON.stringify({ error: 'Invalid messages format' }),
                {
                    status: 400,
                    headers: { 'Content-Type': 'application/json' }
                }
            );
        }

        const stream = await openai.chat.completions.create({
            model: "gpt-4o-mini", // or "gpt-4" for better quality
            messages: [
                {
                    role: "system",
                    content: "You are a helpful AI assistant. Provide clear, concise, and helpful responses. Format your responses with proper markdown when appropriate for code blocks, lists, etc."
                },
                ...messages
            ],
            max_tokens: 1000,
            temperature: 0.7,
            stream: true,
        });

        // Create a readable stream
        const encoder = new TextEncoder();
        const readable = new ReadableStream({
            async start(controller) {
                try {
                    for await (const chunk of stream) {
                        const content = chunk.choices[0]?.delta?.content || '';
                        if (content) {
                            // Send the content as Server-Sent Events format
                            const data = `data: ${JSON.stringify({ content })}\n\n`;
                            controller.enqueue(encoder.encode(data));
                        }
                    }

                    // Send end signal
                    controller.enqueue(encoder.encode('data: [DONE]\n\n'));
                    controller.close();
                } catch (error) {
                    console.error('Streaming error:', error);
                    controller.error(error);
                }
            }
        });

        return new Response(readable, {
            headers: {
                'Content-Type': 'text/event-stream',
                'Cache-Control': 'no-cache',
                'Connection': 'keep-alive',
            },
        });

    } catch (error) {
        console.error('OpenAI API error:', error);

        if (error instanceof OpenAI.APIError) {
            return new Response(
                JSON.stringify({ error: `OpenAI API error: ${error.message}` }),
                {
                    status: error.status || 500,
                    headers: { 'Content-Type': 'application/json' }
                }
            );
        }

        return new Response(
            JSON.stringify({ error: 'Internal server error' }),
            {
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            }
        );
    }
}