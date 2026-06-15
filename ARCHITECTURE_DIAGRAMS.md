# Architecture Diagrams (PlantUML)

All diagrams below are in PlantUML format. Render them at:
- **Online**: [PlantUML Editor](https://www.plantuml.com/plantuml/uml/)
- **CLI**: `plantuml diagram.puml -o output.png`
- **VS Code**: Install PlantUML extension

---

## 1. System Architecture Overview

```plantuml
@startuml SystemArchitecture
!define AWSPUML https://raw.githubusercontent.com/awslabs/aws-icons-for-plantuml/v14.0/dist
skinparam linetype ortho
skinparam backgroundColor #FEFEFE
skinparam ArrowColor #333333

rectangle "Client Layer" #E1F5FE {
  component "Browser\n(React 18)" as browser #1976D2
  component "Chat Widget\n(Real-time)" as chat #1976D2
  component "Portfolio Page\n(Static)" as portfolio #1976D2
}

rectangle "Edge/Server Layer" #F3E5F5 {
  component "/api/chat\nStreaming Response" as api #7B1FA2
  component "Request Handler\n(Node.js)" as handler #7B1FA2
}

rectangle "AI Services" #FFF3E0 {
  component "OpenAI API" as openai #E65100
  note right of openai
    - text-embedding-3-small (1536 dims)
    - GPT-4o-mini (streaming)
  end note
}

rectangle "Data Layer" #E8F5E9 {
  database "Supabase\nPostgreSQL" as db #2E7D32
  component "pgvector\nIVF Index" as pgvector #2E7D32
  component "RLS Policies\n(Public Read)" as rls #2E7D32
}

rectangle "External Services" #FFEBEE {
  component "GitHub API\n(Public Repos)" as github #C62828
}

browser --> chat
browser --> portfolio
chat --> api
portfolio --> api
api --> handler
handler --> openai : Embed query
handler --> db : Search vectors
openai -.-> handler : Response stream
db --> pgvector : Query
pgvector --> db
db --> rls
handler --> github : Ingest only\n(npm run ingest)

@enduml
```

---

## 2. Chat Request Flow (Sequence Diagram)

```plantuml
@startuml ChatRequestFlow
skinparam backgroundColor #FEFEFE
skinparam ParticipantBackgroundColor #E1F5FE
skinparam ArrowColor #1976D2
skinparam FontName Courier

actor User
participant Browser
participant "API /chat\nNode.js" as API
participant "OpenAI\nEmbeddings" as Embeddings
participant "Supabase\nPostgreSQL" as DB
participant "OpenAI\nGPT-4o-mini" as GPT
participant "SSE Stream" as Stream

User -> Browser: Type message
activate Browser
Browser -> API: POST /api/chat\n{ messages }
deactivate Browser

activate API
API -> Embeddings: Embed query\ntext-embedding-3-small
activate Embeddings
Embeddings --> API: Vector [1536]
deactivate Embeddings

API -> DB: RPC match_documents\n(query_embedding, limit=5)
activate DB
DB -> DB: IVF search\n<=> distance
DB --> API: Top-5 documents\n+ metadata + similarity
deactivate DB

API -> API: Assemble context\nfrom results

API -> GPT: Create chat completion\n[system + context + messages]
activate GPT
GPT --> API: stream: token by token
deactivate GPT

API -> Stream: Server-Sent Events\n0:"token"\n0:"by"\n0:"token"
activate Stream

Browser -> Stream: EventSource listener
activate Browser
Stream --> Browser: Receive chunks
Browser -> Browser: Update chat UI\nreal-time
deactivate Stream
deactivate Browser

deactivate API

@enduml
```

---

## 3. Knowledge Base Ingestion Pipeline

```plantuml
@startuml IngestionPipeline
skinparam backgroundColor #FEFEFE
skinparam NodeBackgroundColor #FFF3E0
skinparam ArrowColor #E65100

start
:Delete all documents;
:Load Resume;
:Chunk text\n(500 words, 80 overlap);
:Embed chunks\n(OpenAI 1536-dims);
:Insert to DB\n(metadata: resume);

:Load About;
:Chunk text;
:Embed chunks;
:Insert to DB\n(metadata: about);

:Fetch GitHub repos\n(@username);
loop For each repo
  :Fetch README;
  :Fetch package.json;
  :Combine metadata;
  :Chunk content;
  :Embed chunks;
  :Insert to DB\n(metadata: github:repo);
  :Wait 300ms\n(rate limit);
end loop

:Log completion;
stop

@enduml
```

---

## 4. Component Interaction Diagram

```plantuml
@startuml ComponentInteraction
skinparam backgroundColor #FEFEFE
skinparam componentBackgroundColor #E8F5E9

package "Frontend Components" {
  component [ChatWidget] as CW
  component [ParticleCanvas] as PC
  component [Portfolio Page] as PP
}

package "API Layer" {
  component [/api/chat] as API
}

package "External APIs" {
  component [OpenAI] as OAI
  component [Supabase] as SUP
  component [GitHub] as GH
}

package "Database" {
  component [documents table] as DOC
  component [pgvector index] as PGV
  component [match_documents RPC] as RPC
}

CW --> API: Stream subscription
API --> OAI: Embedding request
API --> OAI: Chat completion request
API --> SUP: Vector search via RPC
SUP --> RPC: Call match_documents
RPC --> DOC: Query with IVF
RPC --> PGV: Similarity search
SUP --> API: Return top-5 documents
PP --> CW: Render in footer

@enduml
```

---

## 5. Database Schema Diagram

```plantuml
@startuml DatabaseSchema
skinparam backgroundColor #FEFEFE
skinparam classBorderColor #2E7D32
skinparam classBackgroundColor #E8F5E9

entity "documents" as doc {
  *id: BIGSERIAL [PK]
  --
  content: TEXT [NOT NULL]
  embedding: VECTOR(1536) [Indexed: IVF]
  metadata: JSONB {source, type}
  created_at: TIMESTAMPTZ
}

entity "match_documents RPC" as rpc {
  INPUT:
  query_embedding: VECTOR(1536)
  match_count: INT [default=5]
  filter: JSONB [default={}]
  --
  OUTPUT:
  id: BIGINT
  content: TEXT
  metadata: JSONB
  similarity: FLOAT
}

note bottom of doc
  IVF Index: ivfflat with vector_cosine_ops
  Lists = 100 for optimal performance
  Supports ~1M+ vectors efficiently
end note

note bottom of rpc
  Uses cosine distance: 1 - (<=> distance)
  Returns results sorted by similarity DESC
  Filters by metadata JSONB containment
end note

@enduml
```

---

## 6. Data Flow: Supabase to GPT

```plantuml
@startuml DataFlowSupabaseGPT
skinparam backgroundColor #FEFEFE
skinparam ArrowColor #1976D2

start

:User Query;
:q = "What's your React experience?";

:Generate Embedding;
note right
  Model: text-embedding-3-small
  Dimensions: 1536
  Cost: ~$0.0002
end note

:embedding = [0.123, -0.456, ...]

:Query Supabase;
note right
  SELECT * FROM match_documents(
    query_embedding,
    match_count=5,
    filter={}
  )
end note

:Results:
:• Similarity 0.92: Resume
:• Similarity 0.88: Project
:• Similarity 0.85: GitHub repo

:Build Context;
note right
  [resume]
  Front-End Engineer, 4+ years...
  
  [project]
  jaier.dev — Next.js RAG...
  
  [github:recipe-finder]
  React search app...
end note

:context = "[assembled chunks]"

:Create Prompt;
note right
  System: "You are AI assistant..."
  + context
  + [user message]
end note

:Call GPT-4o-mini;
note right
  Streaming response
  max_tokens: 400
  temperature: 0.7
  Cost: ~$0.003-0.005
end note

:Stream Response;
note right
  "Jaier has 4+ years React..."
  Sent token-by-token via SSE
end note

:User sees response;

stop

@enduml
```

---

## 7. Deployment Pipeline

```plantuml
@startuml DeploymentPipeline
skinparam backgroundColor #FEFEFE
skinparam ArrowColor #E65100

rectangle "Local Development" #FFF3E0 {
  node "Git Clone\nInstall Dependencies" as local
  node "npm run dev\nhttp://localhost:3000" as dev
}

local --> dev

dev --> git[git push to GitHub]

rectangle "GitHub" #E3F2FD {
  node "Repository\njaierg/jaier-dev" as repo
}

git --> repo

repo --> vercel[Vercel CI/CD Pipeline]

rectangle "Vercel Build" #F3E5F5 {
  node "1. Install\nnpm install" as install
  node "2. Build\nnpm run build" as build
  node "3. Test\nNext.js validation" as test
  node "4. Deploy\nPush to edge" as deploy
}

vercel --> install
install --> build
build --> test
test --> deploy

rectangle "Production" #E8F5E9 {
  node "Vercel Edge Network\n(200+ locations)\njaier.dev" as prod
  node "Auto-scaling\n99.99% SLA" as sla
}

deploy --> prod
prod --> sla

@enduml
```

---

## 8. Environment Configuration Flow

```plantuml
@startuml EnvironmentConfig
skinparam backgroundColor #FEFEFE
skinparam nodeBackgroundColor #FFF3E0

rectangle "Local Development" {
  node ".env.local" as local_env
  local_env : OPENAI_API_KEY=sk-...
  local_env : NEXT_PUBLIC_SUPABASE_URL=...
  local_env : NEXT_PUBLIC_SUPABASE_ANON_KEY=...
  local_env : SUPABASE_SERVICE_ROLE_KEY=...
  local_env : GITHUB_TOKEN=...
}

rectangle "Vercel Production" {
  node "Environment Variables\n(Encrypted)" as prod_env
  prod_env : OPENAI_API_KEY=sk-...
  prod_env : NEXT_PUBLIC_SUPABASE_URL=...
  prod_env : NEXT_PUBLIC_SUPABASE_ANON_KEY=...
}

local_env --> "Used by: npm run ingest"
local_env --> "Used by: npm run dev"

prod_env --> "Used by: Vercel Edge Functions"
prod_env --> "Used by: API Routes"

note bottom of local_env
  ⚠️ NEVER commit .env.local
  Add to .gitignore
end note

note bottom of prod_env
  ✓ Service role key NOT needed
  ✓ Only public anon key deployed
  ✓ Secrets encrypted at rest
end note

@enduml
```

---

## 9. RAG Pipeline Architecture

```plantuml
@startuml RAGPipeline
skinparam backgroundColor #FEFEFE
skinparam ArrowColor #1976D2

rectangle "Input" {
  node "User Message" as input
}

rectangle "Embedding Stage" {
  node "Embed User Query\n(OpenAI 3-small)" as embed
  node "1536-dim Vector" as vec
}

rectangle "Retrieval Stage" {
  node "Vector Similarity Search\n(pgvector + IVF)" as search
  node "Top-5 Documents\n(ranked by similarity)" as retrieved
}

rectangle "Augmentation Stage" {
  node "Build Context\nfrom Retrieved Docs" as augment
  node "System Prompt +\nContext +\nMessages" as prompt
}

rectangle "Generation Stage" {
  node "GPT-4o-mini\nChat Completion\n(Streaming)" as gen
}

rectangle "Output" {
  node "Token Stream\nto Client" as output
}

input --> embed
embed --> vec
vec --> search
search --> retrieved
retrieved --> augment
augment --> prompt
prompt --> gen
gen --> output

note right of embed
  Cost: ~$0.0002
  Time: 200-300ms
end note

note right of search
  Cost: 0 (DB query)
  Time: 10-50ms
  Index: IVF (fast approx)
end note

note right of gen
  Cost: ~$0.003-0.005
  Time: 1-3 seconds
  Streaming enabled
end note

@enduml
```

---

## 10. Scalability Architecture

```plantuml
@startuml Scalability
skinparam backgroundColor #FEFEFE
skinparam ArrowColor #E65100

rectangle "Current Scale" #E8F5E9 {
  node "Users: ~10-100/day" as users
  node "Documents: ~200-300" as docs
  node "Queries: ~50-200/day" as queries
}

rectangle "Infrastructure" #FFF3E0 {
  node "Vercel Serverless\n(auto-scales)" as vercel
  node "Supabase Free\n(500MB storage)" as supabase
  node "OpenAI API\n(pay-as-you-go)" as openai
}

rectangle "Scaling to 10K+ Users" #FFEBEE {
  node "• Caching layer (Redis)" as cache
  node "• Rate limiting" as limit
  node "• Hybrid search (BM25 + semantic)" as hybrid
  node "• Reranking (cross-encoder)" as rerank
  node "• Conversation history (persistent)" as history
}

users --> vercel
docs --> supabase
queries --> openai

vercel -.-> cache
vercel -.-> limit
supabase -.-> hybrid
openai -.-> rerank
history -.-> supabase

note bottom of vercel
  Vercel auto-scales
  No config needed
end note

note bottom of supabase
  Upgrade to Pro if needed
  ($25/month)
end note

note bottom of cache
  Optional improvements
  for high traffic
end note

@enduml
```

---

## How to Use These Diagrams

### Option 1: Online Rendering (Recommended)
1. Go to [PlantUML Editor](https://www.plantuml.com/plantuml/uml/)
2. Copy any diagram code above
3. Paste into editor
4. Click "Submit"
5. Download as PNG/SVG

### Option 2: Local Rendering
```bash
# Install PlantUML
brew install plantuml

# Render a diagram
plantuml ARCHITECTURE_DIAGRAMS.md -o diagrams/

# View output
open diagrams/
```

### Option 3: VS Code Extension
1. Install "PlantUML" extension
2. Open this file
3. Press `Alt+D` to preview
4. Right-click → Export as PNG/SVG

---

## Diagram Legend

| Symbol | Meaning |
|--------|---------|
| `→` | Synchronous request |
| `-.->` | Asynchronous / Optional |
| `[Box]` | System component |
| `(Circle)` | Start/End |
| `{Entity}` | Database table |
| `#Color` | Component type |

---

**All diagrams updated for system version 1.0 (June 2024)**
