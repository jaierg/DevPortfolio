# jaier.dev

**AI-powered portfolio with RAG chatbot** — Next.js 14 + Supabase pgvector + OpenAI GPT-4o-mini

A production-grade portfolio website featuring an intelligent conversational AI assistant powered by Retrieval-Augmented Generation (RAG). The chatbot indexes your resume, GitHub repositories, and project information, delivering context-aware responses about your experience and work.

## 🎯 Features

- **RAG-Powered Chatbot** — Retrieves relevant context from your knowledge base before generating responses
- **Vector Embeddings** — Uses OpenAI's `text-embedding-3-small` for semantic search
- **Stream Responses** — Real-time AI responses via Vercel AI SDK
- **Production-Ready** — Deployed on Vercel, persisted to Supabase
- **Responsive Design** — Mobile-optimized with smooth animations
- **GitHub Integration** — Auto-indexes all public repos + READMEs
- **Zero Cold Start** — Precompiled Next.js with edge runtime support

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    FRONTEND (Next.js 14)                        │
│                   - React Components                            │
│                   - Chat Widget UI                              │
│                   - Portfolio Display                           │
└─────────────────┬───────────────────────────────────────────────┘
                  │
                  │ HTTP Requests
                  ▼
┌─────────────────────────────────────────────────────────────────┐
│              API ROUTES (Edge Functions)                        │
│            /api/chat (Streaming Response)                       │
│  1. Embed user query (OpenAI embedding)                         │
│  2. Retrieve context (Supabase pgvector)                        │
│  3. Generate response (OpenAI GPT-4o-mini)                      │
└─────────────────┬───────────────────────────────────────────────┘
                  │
         ┌────────┼────────┐
         ▼        ▼        ▼
    ┌────────────────────────────┐
    │  External Services         │
    │                            │
    │  • OpenAI API              │
    │    - Embeddings            │
    │    - GPT-4o-mini Chat      │
    │                            │
    │  • Supabase                │
    │    - PostgreSQL + pgvector │
    │    - RLS Policies          │
    │    - Vector Similarity     │
    │                            │
    │  • GitHub API              │
    │    - Public Repos          │
    │    - README Files          │
    └────────────────────────────┘
```

See [ARCHITECTURE.md](./ARCHITECTURE.md) for detailed system design.

## 🚀 Quick Start (4 steps, ~20 min)

### Step 1: Supabase Setup (5 min)

1. Create a free [Supabase](https://supabase.com) project
2. Go to **SQL Editor** → **New query**
3. Paste the entire contents of `supabase-setup.sql` and click **Run**
4. Go to **Project Settings → API** and copy your credentials:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`

### Step 2: Local Development (5 min)

```bash
npm install
npm run dev
```

Open http://localhost:3000 — portfolio loads immediately. Chat shows errors until step 3 is complete.

### Step 3: Ingest Knowledge Base (5 min)

Create `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=your_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
OPENAI_API_KEY=your_openai_api_key_here
GITHUB_TOKEN=your_github_pat_here  # optional, for higher rate limits
```

Run the ingest script:
```bash
npm run ingest
```

This will:
- Chunk and embed your resume (from `scripts/ingest.ts`)
- Fetch all public GitHub repos + READMEs
- Store vectors in Supabase `documents` table with pgvector
- Takes ~2-3 min depending on repo count

### Step 4: Deploy to Vercel (5 min)

```bash
npm i -g vercel
vercel
```

In Vercel dashboard, set environment variables:
- `OPENAI_API_KEY`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

That's it! Auto-deploys on git push.

### Optional: Custom Domain

1. Purchase domain (~$12/year)
2. In Vercel dashboard → Project → Settings → Domains → Add your domain
3. Follow DNS setup (add CNAME record)
4. Live in ~2 min

## 📁 Project Structure

```
jaier-dev/
├── app/
│   ├── api/chat/route.ts      # RAG + streaming chat endpoint
│   ├── layout.tsx              # Root layout + styles
│   └── page.tsx                # Portfolio page
├── components/
│   ├── ChatWidget.tsx          # Chat UI component
│   └── ParticleCanvas.tsx      # Animated background
├── scripts/
│   └── ingest.ts               # Knowledge base ingestion
├── supabase-setup.sql          # Database initialization
├── .env.local                  # Local secrets (gitignored)
├── package.json                # Dependencies
└── README.md                   # This file
```

## 🔌 Environment Variables

### Required (Runtime)
- `NEXT_PUBLIC_SUPABASE_URL` — Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Public anon key (safe for client)
- `OPENAI_API_KEY` — OpenAI API key

### Optional (Runtime)
- `SUPABASE_SERVICE_ROLE_KEY` — Only for local ingestion, not needed in Vercel

### Optional (Local Development)
- `GITHUB_TOKEN` — GitHub PAT for higher API rate limits

## 💬 How the Chat Works

1. **User Message**: Frontend sends message to `/api/chat`
2. **Embedding**: Message is embedded using OpenAI `text-embedding-3-small`
3. **Vector Search**: Embedding queried against Supabase pgvector (IVF index)
4. **Context Retrieval**: Top 5 similar documents returned with metadata
5. **Prompt Injection**: Context + system prompt fed to GPT-4o-mini
6. **Streaming Response**: Response streamed back to client via EventSource

**Example Flow:**
```
User: "What's your experience with React?"
  ↓
[Embed] → vector [0.123, -0.456, ...]
  ↓
[Search] → Returns resume chunks mentioning React, portfolio projects
  ↓
[Augment] → System prompt + context + messages → GPT-4o-mini
  ↓
[Stream] → "Jaier has 4+ years shipping production React at NCR Voyix..."
```

## 📊 Knowledge Base

The ingest script populates the `documents` table with:

| Source | Type | Count | Size |
|--------|------|-------|------|
| Resume | text | ~4-6 chunks | ~2-3 KB |
| About | text | ~2-3 chunks | ~1 KB |
| GitHub Repos | code/readme | ~50-200 chunks | varies |

Each chunk is:
- **Max 500 words** (configurable in `ingest.ts`)
- **80-word overlap** to preserve context
- **Embedded** with metadata: `{ source, type }`
- **Searchable** via cosine similarity in pgvector

## 🏷️ Database Schema

See `supabase-setup.sql`:

```sql
CREATE TABLE documents (
  id BIGSERIAL PRIMARY KEY,
  content TEXT NOT NULL,
  embedding vector(1536),              -- OpenAI embedding
  metadata JSONB,                      -- { source, type }
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX documents_embedding_idx
  ON documents USING ivfflat (embedding vector_cosine_ops);

CREATE FUNCTION match_documents(query_embedding, match_count, filter)
  RETURNS TABLE(id, content, metadata, similarity);
```

## 💰 Cost Breakdown

| Service | Free Tier | Cost/Mo |
|---------|-----------|---------|
| **Vercel** | Up to 100GB transfer | Free (Hobby) |
| **Supabase** | Up to 500 MB storage | Free |
| **OpenAI** | Pay-as-you-go | ~$0.50 (~200 queries) |
| **Domain** | N/A | ~$1/mo |
| **Total** | | **~$1.50/mo** |

Estimated tokens per query:
- Embedding: ~50-150 tokens @ $0.02/1M
- Chat: ~200-400 tokens @ $0.15/1M (gpt-4o-mini)
- **Per query**: ~$0.002-0.006

## 🛠️ Development

### Local Development
```bash
npm run dev      # http://localhost:3000
```

### Build for Production
```bash
npm run build
npm run start
```

### Ingest Knowledge Base
```bash
npm run ingest
```

### Test on Phone
```bash
npm run dev -- --hostname 0.0.0.0
# Open http://YOUR_LOCAL_IP:3000 on phone
```

Or use instant tunnel:
```bash
ssh -p 443 -R0:localhost:3000 a.pinggy.io
```

## 📚 Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **AI/LLM**: OpenAI (Embeddings + GPT-4o-mini), Vercel AI SDK
- **Database**: Supabase (PostgreSQL + pgvector)
- **Vector Search**: pgvector with IVF indexing
- **Deployment**: Vercel
- **External APIs**: GitHub API

## 🔐 Security

- RLS policies restrict inserts to service role only
- Public reads allowed (portfolio data is public anyway)
- API keys stored in environment variables, never committed
- OpenAI API key used server-side only
- GitHub token optional, never exposed to client

## 📝 License

MIT — Fork and customize for your own portfolio!

## 🤝 Contributing

This is a personal portfolio, but feel free to:
- Fork for your own portfolio
- Open issues for improvements
- Submit PRs for bug fixes

## 👋 Questions?

Reach out to **jaiergordon@gmail.com** or open an issue.

---

**Made with ❤️ for an AI-first future**
