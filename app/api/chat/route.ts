import OpenAI from 'openai';
import { NextRequest } from 'next/server';

export const runtime = 'nodejs';
export const maxDuration = 30;

const oai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

async function getContext(query: string): Promise<string> {
  const embRes = await oai.embeddings.create({ model: 'text-embedding-3-small', input: query });
  const embedding = embRes.data[0].embedding;

  const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/match_documents`, {
    method: 'POST',
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query_embedding: embedding, match_count: 5, filter: {} }),
  });

  if (!res.ok) return '';
  const data = await res.json();
  return data.map((d: any) => `[${d.metadata?.source}]\n${d.content}`).join('\n\n---\n\n');
}

const SYSTEM = `You are an AI assistant on Jaier Gordon's portfolio website (jaier.dev).
Help visitors learn about Jaier's skills, experience, and projects.
- Always refer to Jaier in third person
- Be concise, 2-4 sentences unless asked for detail
- Only answer based on context provided
- If unsure, say "reach out to Jaier at jaiergordon@gmail.com"
- Mention he's open to new opportunities if asked about availability

CONTEXT:
{context}`;

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();
    const lastMessage = messages[messages.length - 1]?.content || '';
    const context = await getContext(lastMessage);
    const system = SYSTEM.replace('{context}', context || 'No context found.');

    const response = await oai.chat.completions.create({
      model: 'gpt-4o-mini',
      stream: true,
      max_tokens: 400,
      temperature: 0.7,
      messages: [
        { role: 'system', content: system },
        ...messages,
      ],
    });

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        for await (const chunk of response) {
          const text = chunk.choices[0]?.delta?.content || '';
          if (text) controller.enqueue(encoder.encode(`0:${JSON.stringify(text)}\n`));
        }
        controller.enqueue(encoder.encode('0:\n'));
        controller.close();
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'x-vercel-ai-data-stream': 'v1',
      },
    });
  } catch (err) {
    console.error('Chat error:', err);
    return new Response(JSON.stringify({ error: 'Something went wrong' }), { status: 500 });
  }
}
