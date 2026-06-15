# Architecture Overview

## System Diagram

```plantuml
@startuml RAGChatbotArchitecture

!theme default
skinparam backgroundColor #FEFEFE
skinparam fontFamily Courier
skinparam fontSize 14

actor User as user
participant "Browser" as browser
participant "Vercel\n(Next.js 14)" as vercel
participant "OpenAI\nAPI" as openai
database "Supabase\nPostgreSQL" as supabase
participant "GitHub\nAPI" as github
database "pgvector\nIndex" as pgvector

user -> browser: 1. Type message in chat
activate browser
browser -> vercel: 2. POST /api/chat\n{ messages }
deactivate browser

activate vercel
vercel -> openai: 3a. Embed query\ntext-embedding-3-small
activate openai
openai --> vercel: 3b. Return vector\nvec(1536)
deactivate openai

vercel -> supabase: 4a. Call RPC match_documents\n(query_embedding, match_count=5)
activate supabase
supabase -> pgvector: 4b. IVF search\n<=> distance
activate pgvector
pgvector --> supabase: 4c. Top-5 documents
deactivate pgvector
supabase --> vercel: 4d. Return context\nwith metadata
deactivate supabase

vercel -> openai: 5a. Create chat completion\n[system prompt + context + messages]
activate openai
openai --> vercel: 5b. Stream: gpt-4o-mini\n(max_tokens=400)
deactivate openai

activate browser
vercel -> browser: 6a. Server-Sent Events\ntext/event-stream
browser -> browser: 6b. Parse chunks\ndisplay streaming
deactivate browser
deactivate vercel

note over browser
  Real-time streaming
  response in chat UI
end note

@enduml
```

## 🏗️ High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                                │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ Browser                                                     │   │
│  │  • React Components (Next.js 14)                           │   │
│  │  • Chat Widget (real-time streaming)                       │   │
│  │  • Portfolio Display                                       │   │
│  │  • Particle Background Animation                           │   │
│  └─────────────────────────────────────────────────────────────┘   │
└────────────────────────────┬────────────────────────────────────────┘
                             │ HTTP/Streaming
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    SERVER LAYER (Vercel Edge)                       │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ /api/chat Route (Node.js runtime)                           │   │
│  │  ┌──────────────────────────────────────────────────────┐   │   │
│  │  │ 1. Parse incoming message                           │   │   │
│  │  │ 2. Call OpenAI Embeddings API                       │   │   │
│  │  │ 3. Query Supabase pgvector for context             │   │   │
│  │  │ 4. Construct system prompt + context               │   │   │
│  │  │ 5. Stream GPT-4o-mini response                     │   │   │
│  │  │ 6. Format as Server-Sent Events                    │   │   │
│  │  └──────────────────────────────────────────────────────┘   │   │
│  └─────────────────────────────────────────────────────────────┘   │
└──────────────┬──────────────────────┬──────────────────────┬────────┘
               │                      │                      │
    ┌──────────▼──────────┐  ┌────────▼───────────┐  ┌──────▼────────────┐
    │  OpenAI API         │  │  Supabase          │  │  GitHub API       │
    │  ┌────────────────┐ │  │  ┌──────────────┐  │  │  (Ingest only)   │
    │  │ Embeddings     │ │  │  │ PostgreSQL   │  │  │  ┌──────────────┐│
    │  │ (1536-dims)    │ │  │  │ + pgvector   │  │  │  │ Fetch repos  ││
    │  │                │ │  │  │              │  │  │  │ & READMEs    ││
    │  │ GPT-4o-mini    │ │  │  │ IVF Index    │  │  │  │ (one-time)   ││
    │  │ (Streaming)    │ │  │  │              │  │  │  └──────────────┘│
    │  └────────────────┘ │  │  │ RLS Policies │  │  └──────────────────┘
    │  $0.15/1M tokens    │  │  │ (public r)   │  │  Free tier OK
    └─────────────────────┘  │  │              │  │
                             │  └──────────────┘  │
                             │  Free tier OK      │
                             └────────────────────┘
```

## 📊 Data Flow: Chat Request → Response

### 1. **Message Ingestion**
```
User Input: "What's your experience with React?"
           ↓
   POST /api/chat
   Content-Type: application/json
   Body: {
     "messages": [
       { "role": "user", "content": "What's your experience with React?" }
     ]
   }
```

### 2. **Query Embedding**
```
Message embedding:
  • Model: text-embedding-3-small
  • Input: "What's your experience with React?"
  • Output: vector[0.123, -0.456, 0.789, ..., -0.234]  (1536 dimensions)
  • Cost: ~$0.0002 per query
```

### 3. **Vector Search (pgvector)**
```
SELECT * FROM match_documents(
  query_embedding := <vector>,
  match_count := 5,
  filter := {}
)
ORDER BY similarity DESC
LIMIT 5

Results:
  ┌─ Document 1: Resume chunk (similarity: 0.92)
  │  "Front-End Engineer, 4+ years production React/TypeScript at NCR..."
  │
  ├─ Document 2: Project chunk (similarity: 0.88)
  │  "jaier.dev — Next.js RAG chatbot with React components..."
  │
  ├─ Document 3: GitHub repo (similarity: 0.85)
  │  "Repo: recipe-finder — React.js application..."
  │
  └─ ...
```

### 4. **Context Assembly**
```javascript
const context = `
[resume]
Front-End Engineer, 4+ years production React/TypeScript at NCR Voyix...

---

[jaier.dev]
This portfolio — a Next.js 14 app with a RAG-powered AI assistant...

---

[recipe-finder]
Repo: jaierg/recipe-finder — A recipe search engine in React...
`
```

### 5. **System Prompt Injection**
```
System prompt:
  You are an AI assistant on Jaier Gordon's portfolio website (jaier.dev).
  Help visitors learn about Jaier's skills, experience, and projects.
  - Always refer to Jaier in third person
  - Be concise, 2-4 sentences unless asked for detail
  - Only answer based on context provided
  - If unsure, say "reach out to Jaier at jaiergordon@gmail.com"

Context: [assembled from documents above]

Messages:
  [{ role: "user", content: "What's your experience with React?" }]
```

### 6. **Streaming Response**
```
GPT-4o-mini generates:
  "Jaier has 4+ years of production React and TypeScript experience at NCR Voyix, 
   where he built and maintained React components integrated with REST APIs. 
   He's also built personal projects like jaier.dev (a Next.js RAG chatbot) 
   and recipe-finder (a React search application). He's skilled in React, 
   TypeScript, React Native, and modern frontend tooling."

Streamed via Server-Sent Events:
  data: 0:"Jaier"
  data: 0:" has 4+ years"
  data: 0:" of production"
  data: 0:" React"
  ...
  data: 0:"\n"
```

## 🗄️ Database Schema

### `documents` Table

```sql
CREATE TABLE documents (
  id BIGSERIAL PRIMARY KEY,           -- Auto-incrementing ID
  content TEXT NOT NULL,               -- Chunk of text (resume, repo, etc.)
  embedding vector(1536),              -- OpenAI embedding (1536 dims)
  metadata JSONB DEFAULT '{}',         -- { source, type }
  created_at TIMESTAMPTZ DEFAULT NOW() -- Timestamp
);
```

**Indexes:**
```sql
CREATE INDEX documents_embedding_idx
  ON documents
  USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);
```

**RLS Policies:**
```sql
-- Public can read
CREATE POLICY "Allow public reads"
  ON documents FOR SELECT USING (true);

-- Only service role can insert
CREATE POLICY "Allow service role inserts"
  ON documents FOR INSERT WITH CHECK (true);
```

**Match Function:**
```sql
CREATE OR REPLACE FUNCTION match_documents(
  query_embedding vector(1536),
  match_count int DEFAULT 5,
  filter jsonb DEFAULT '{}'::jsonb
)
RETURNS TABLE(id bigint, content text, metadata jsonb, similarity float)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    documents.id,
    documents.content,
    documents.metadata,
    1 - (documents.embedding <=> query_embedding) AS similarity
  FROM documents
  WHERE documents.metadata @> filter
  ORDER BY documents.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
```

### Metadata Schema

Each document stores metadata for filtering and tracking:

```json
{
  "source": "resume|about|github:repo-name",
  "type": "resume|about|github|project"
}
```

Examples:
```json
{ "source": "resume", "type": "resume" }
{ "source": "about", "type": "about" }
{ "source": "github:recipe-finder", "type": "github" }
```

## 🔄 Knowledge Base Ingestion

### Ingest Pipeline (`scripts/ingest.ts`)

```
Start
  ↓
Delete all existing documents
  ↓
Ingest Resume
  ├─ Chunk: 500-word chunks, 80-word overlap
  ├─ Embed: Each chunk via OpenAI embeddings
  └─ Insert: Into documents table with metadata
  ↓
Ingest About
  └─ Same process as resume
  ↓
Fetch GitHub Repos
  ├─ Iterate public repos (@jaierg)
  ├─ For each repo:
  │  ├─ Fetch README
  │  ├─ Fetch package.json (extract dependencies)
  │  └─ Combine metadata
  ├─ Chunk & embed
  └─ Insert with github:repo-name metadata
  ↓
End
```

**Chunking Strategy:**
- **Chunk size**: 500 words
- **Overlap**: 80 words
- **Min chunk**: 40 words (filter out tiny chunks)

**Embedding:**
- Model: `text-embedding-3-small`
- Dimensions: 1536
- Cost: ~$0.02 per 1M tokens

### Ingestion Costs

For 50 GitHub repos + resume + about:
- ~300-500 embeddings
- Cost: ~$0.01 total (one-time)

## 🎯 API Endpoint: `/api/chat`

### Request

```http
POST /api/chat
Content-Type: application/json

{
  "messages": [
    {
      "role": "user",
      "content": "What's your experience with React?"
    }
  ]
}
```

### Response (Streaming)

```http
HTTP/1.1 200 OK
Content-Type: text/event-stream
Cache-Control: no-cache
x-vercel-ai-data-stream: v1

0:"Jaier"
0:" has 4+ years"
0:" of production"
0:" React"
0:" and"
...
0:"\n"
```

Each chunk is prefixed with `0:` indicating the first (and only) data stream.

### Error Handling

```http
HTTP/1.1 500 Internal Server Error
Content-Type: application/json

{
  "error": "Something went wrong"
}
```

Errors logged to console. User receives generic error message.

## 🔐 Security Model

### Public Data
- Portfolio website content is public
- Resume, projects, GitHub repos are intentionally public
- RLS allows public reads from `documents` table

### Protected Insertions
- Only service role can insert documents
- `SUPABASE_SERVICE_ROLE_KEY` only used in local `npm run ingest`
- Never exposed in browser or Vercel runtime

### API Keys
- `OPENAI_API_KEY` — server-side only
- `SUPABASE_SERVICE_ROLE_KEY` — local only (not deployed)
- `SUPABASE_ANON_KEY` — used for public reads
- All keys in `.env.local` (gitignored)

## 📈 Performance Characteristics

### Latency Breakdown

| Operation | Duration | Notes |
|-----------|----------|-------|
| Embedding query | 200-300ms | OpenAI API + network |
| pgvector search | 10-50ms | IVF index lookup |
| GPT-4o-mini streaming | 1-3s | First token to last token |
| **Total** | **~2-4s** | User-perceived latency |

### Scalability

- **Documents**: Currently ~200-300 chunks. pgvector with IVF can scale to millions.
- **Concurrent users**: Vercel serverless scales automatically.
- **Cost scaling**: Linear with OpenAI API usage (embedding + chat tokens).

### Database Limits (Supabase Free)

- **Storage**: 500 MB (current usage: ~5-10 MB)
- **Bandwidth**: 2 GB/month (more than enough)
- **Max functions**: 5,000 per month (ample for chat queries)

## 🛠️ Technology Rationale

| Component | Choice | Why |
|-----------|--------|-----|
| **Frontend** | Next.js 14 | SSR, edge functions, built-in API routes |
| **Embedding** | OpenAI (3-small) | Best price/quality, 1536 dims perfect for RAG |
| **LLM** | GPT-4o-mini | Fast, cheap (~$0.15/1M), good quality |
| **Vector DB** | Supabase pgvector | PostgreSQL + pgvector, free tier, no separate service |
| **Vector Index** | IVF | Fast approximate search, handles 1M+ vectors |
| **Streaming** | Server-Sent Events | Simple, native browser support, no WebSocket overhead |
| **Deployment** | Vercel | Next.js native, edge runtime, free tier, auto-scaling |

## 🚀 Deployment Pipeline

```
Local Development
  ↓ git push
GitHub Repository
  ↓ auto-detect Next.js
Vercel CI/CD
  ↓
Build:
  - npm install
  - npm run build
  ↓
Test:
  - Next.js lint/validation
  ↓
Deploy:
  - Push to edge network (200+ locations)
  - Set environment variables
  - Enable serverless functions
  ↓
Production (jaier.dev)
  - Global CDN
  - Auto-scaling
  - 99.99% uptime SLA
```

## 📝 Detailed Flow Examples

### Example 1: First-Time Chat

```
User visits jaier.dev
  ↓
Portfolio loads (static/prerendered)
  ↓
Chat widget appears
  ↓
User: "Hi! Who is Jaier?"
  ↓
1. Embed: "Hi! Who is Jaier?"
2. Search: similarity >= 0.7
3. Result: resume, about, project chunks
4. Prompt: "You are an AI assistant... Here's context about Jaier..."
5. GPT-4o-mini: "Jaier Gordon is a Front-End Engineer with 4+ years..."
6. Stream: Word by word to chat UI
```

### Example 2: Specific Project Query

```
User: "Tell me about the RAG chatbot project"
  ↓
1. Embed: "Tell me about the RAG chatbot project"
2. Search: pgvector finds high-similarity chunks
   - jaier.dev project description
   - Next.js + Supabase + OpenAI
   - This portfolio description
3. Augment: System prompt + high-relevance context
4. GPT-4o-mini: Detailed response about the project
5. Stream: Response flows naturally to UI
```

### Example 3: Out-of-Scope Question

```
User: "What's the weather in Atlanta?"
  ↓
1. Embed: "What's the weather in Atlanta?"
2. Search: Low similarity to all documents
3. Result: Generic context (about/resume)
4. System prompt: "Only answer based on context provided"
5. GPT-4o-mini: "I don't have information about the weather.
                   Reach out to Jaier at jaiergordon@gmail.com"
```

## 🔮 Future Enhancements

- [ ] Conversation history (persistent in Supabase)
- [ ] User authentication (GitHub OAuth)
- [ ] Analytics (message count, popular questions)
- [ ] Multi-turn context (remember conversation history)
- [ ] Hybrid search (keyword + semantic)
- [ ] Reranking (cross-encoder for better results)
- [ ] Custom instructions per user type
- [ ] Caching layer (Redis for frequent queries)

---

**System designed for simplicity, cost-efficiency, and great UX** ✨
