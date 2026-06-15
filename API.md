# API Documentation

## Chat Endpoint

### `POST /api/chat`

Streams a conversational response using RAG with OpenAI's GPT-4o-mini.

#### Request

```bash
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {
        "role": "user",
        "content": "What are your key skills?"
      }
    ]
  }'
```

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `messages` | Array | ✓ | Array of message objects |
| `messages[].role` | String | ✓ | Either `"user"` or `"assistant"` |
| `messages[].content` | String | ✓ | Message text |

**Example Request:**

```json
{
  "messages": [
    {
      "role": "user",
      "content": "Tell me about your experience with TypeScript"
    }
  ]
}
```

#### Response

**Content-Type:** `text/event-stream`

The response is streamed as Server-Sent Events (SSE). Each chunk is prefixed with `0:`.

**Example Response Stream:**

```
0:"Jaier"
0:" has"
0:" extensive"
0:" experience"
0:" with"
0:" TypeScript"
0:" in"
0:" production"
0:" environments"
0:"."
0:"\n"
```

**Response Headers:**

```
Content-Type: text/event-stream
Cache-Control: no-cache
x-vercel-ai-data-stream: v1
```

#### Response Format

Each SSE line follows the pattern:

```
0:"<text_chunk>"
```

- `0:` — Data stream ID (always 0, indicates first stream)
- `"<text_chunk>"` — JSON-encoded text chunk
- Final line is `0:"\n"` indicating stream end

#### Error Response

**Status:** `500 Internal Server Error`

```json
{
  "error": "Something went wrong"
}
```

**Common Errors:**

| Status | Cause | Solution |
|--------|-------|----------|
| 500 | Missing `OPENAI_API_KEY` | Set in `.env.local` or Vercel |
| 500 | Supabase connection error | Check `NEXT_PUBLIC_SUPABASE_URL` |
| 500 | OpenAI API error | Check API key validity, quota |
| 400 | Missing `messages` field | Ensure request body is valid JSON |

#### Client-Side Streaming Example

**JavaScript (Fetch API):**

```javascript
async function chat(messages) {
  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages })
  });

  if (!response.ok) {
    console.error('Chat error:', await response.json());
    return;
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value);
    const lines = chunk.split('\n').filter(l => l.length);

    for (const line of lines) {
      if (line.startsWith('0:')) {
        const text = JSON.parse(line.slice(2));
        console.log(text); // or append to UI
      }
    }
  }
}

// Usage
chat([
  { role: 'user', content: 'What is RAG?' }
]);
```

**React Hook:**

```javascript
import { useEffect, useState } from 'react';

export function useChat() {
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);

  const send = async (messages) => {
    setLoading(true);
    setResponse('');

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages })
      });

      if (!res.ok) throw new Error('API error');

      const reader = res.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n').filter(l => l.length);

        for (const line of lines) {
          if (line.startsWith('0:')) {
            const text = JSON.parse(line.slice(2));
            setResponse(prev => prev + text);
          }
        }
      }
    } catch (err) {
      console.error(err);
      setResponse('Error: Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return { response, loading, send };
}
```

#### Rate Limiting

Currently no rate limiting is enforced. For production, consider:

- Vercel's built-in rate limiting
- Custom middleware with `rate-limit` package
- Redis-backed rate limiting

**Estimated costs per request:**

- Embedding: ~$0.0002
- Chat: ~$0.002-0.005
- **Total: ~$0.003 per request**

#### Timeout

- **Max Duration**: 30 seconds (Vercel limit)
- First token usually arrives within 1-3 seconds
- Full response typically completes in 2-5 seconds

If streaming times out, the connection closes and the client receives partial response.

---

## Internal Endpoints

### Vector Search (Internal)

The `/api/chat` endpoint internally calls Supabase's `match_documents` RPC function.

**Function Signature:**

```sql
match_documents(
  query_embedding vector(1536),
  match_count int DEFAULT 5,
  filter jsonb DEFAULT '{}'::jsonb
)
RETURNS TABLE(id bigint, content text, metadata jsonb, similarity float)
```

**Example Call (from code):**

```javascript
const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/match_documents`, {
  method: 'POST',
  headers: {
    'apikey': SUPABASE_KEY,
    'Authorization': `Bearer ${SUPABASE_KEY}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    query_embedding: embedding,
    match_count: 5,
    filter: {}
  }),
});

const results = await res.json();
// Results: [{ id, content, metadata, similarity }, ...]
```

---

## Environment Variables

### Required for Runtime

```bash
# OpenAI API
OPENAI_API_KEY=sk-...

# Supabase (public)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

### Required for Ingestion Only

```bash
# Supabase (private, for inserts)
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# GitHub (optional, for higher rate limits)
GITHUB_TOKEN=ghp_...
GITHUB_USERNAME=jaierg  # defaults to 'jaierg'
```

---

## Data Models

### Message Object

```typescript
interface Message {
  role: 'user' | 'assistant';
  content: string;
}
```

### Document (from Supabase)

```typescript
interface Document {
  id: number;
  content: string;
  embedding: number[];  // 1536 dimensions
  metadata: {
    source: string;    // 'resume' | 'about' | 'github:repo-name'
    type: string;      // 'resume' | 'about' | 'github' | 'project'
  };
  created_at: string;  // ISO 8601 timestamp
}
```

### Chat System Prompt

```
You are an AI assistant on Jaier Gordon's portfolio website (jaier.dev).
Help visitors learn about Jaier's skills, experience, and projects.
- Always refer to Jaier in third person
- Be concise, 2-4 sentences unless asked for detail
- Only answer based on context provided
- If unsure, say "reach out to Jaier at jaiergordon@gmail.com"
- Mention he's open to new opportunities if asked about availability

CONTEXT:
{context from RAG search}
```

---

## Examples

### Example 1: Simple Query

**Request:**
```json
{
  "messages": [
    {
      "role": "user",
      "content": "What tech stack does jaier.dev use?"
    }
  ]
}
```

**Response Stream:**
```
0:"jaier.dev"
0:" is"
0:" built"
0:" with"
0:" Next.js"
0:" 14,"
0:" TypeScript,"
0:" Supabase"
0:" pgvector,"
0:" and"
0:" OpenAI"
0:" APIs."
0:"\n"
```

### Example 2: Multi-Turn Conversation

**Request:**
```json
{
  "messages": [
    {
      "role": "user",
      "content": "What's your experience with React?"
    },
    {
      "role": "assistant",
      "content": "Jaier has 4+ years of production React experience at NCR Voyix..."
    },
    {
      "role": "user",
      "content": "What about TypeScript?"
    }
  ]
}
```

**Response Stream:**
```
0:"TypeScript"
0:" is"
0:" a"
0:" core"
0:" skill"
0:" for"
0:" Jaier,"
0:" used"
0:" across"
0:" React"
0:" projects..."
0:"\n"
```

### Example 3: Out-of-Scope Question

**Request:**
```json
{
  "messages": [
    {
      "role": "user",
      "content": "What's the current weather?"
    }
  ]
}
```

**Response Stream:**
```
0:"I"
0:" don't"
0:" have"
0:" information"
0:" about"
0:" weather."
0:" Reach"
0:" out"
0:" to"
0:" Jaier"
0:" at"
0:" jaiergordon@gmail.com"
0:"\n"
```

---

## Troubleshooting

### Connection Issues

**Problem:** `fetch() failed`

**Solutions:**
- Ensure API endpoint is accessible
- Check CORS settings (should allow cross-origin)
- Verify network connectivity

### Missing Context

**Problem:** Response seems off-topic or generic

**Solutions:**
- Check that documents are ingested (`npm run ingest`)
- Verify Supabase connection in console
- Ensure query is semantically similar to indexed content

### Rate Limiting

**Problem:** `429 Too Many Requests`

**Solutions:**
- Add delays between requests
- Implement exponential backoff
- Monitor OpenAI usage in dashboard

### Streaming Timeout

**Problem:** Response cuts off abruptly

**Solutions:**
- Check Vercel function timeout (30s max)
- Monitor OpenAI API status
- Try again after a few seconds (retry logic)

---

## Performance Tips

1. **Batch Requests**: Don't send too many requests in parallel; queue them
2. **Compress Messages**: Keep conversation history brief (send only last few messages)
3. **Use Caching**: Cache frequently asked questions at the client
4. **Monitor Costs**: Track OpenAI usage; implement rate limits if needed

---

**Last Updated:** June 2024  
**API Version:** 1.0  
**Status:** Stable ✓
