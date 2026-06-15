-- Run this in your Supabase SQL editor (Dashboard → SQL Editor → New query)

-- 1. Enable pgvector extension
create extension if not exists vector;

-- 2. Create documents table for RAG
create table if not exists documents (
  id bigserial primary key,
  content text not null,
  embedding vector(1536),
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

-- 3. Create index for fast similarity search
create index if not exists documents_embedding_idx
  on documents
  using ivfflat (embedding vector_cosine_ops)
  with (lists = 100);

-- 4. Create match function used by the RAG pipeline
create or replace function match_documents (
  query_embedding vector(1536),
  match_count int default 5,
  filter jsonb default '{}'::jsonb
)
returns table (
  id bigint,
  content text,
  metadata jsonb,
  similarity float
)
language plpgsql
as $$
begin
  return query
  select
    documents.id,
    documents.content,
    documents.metadata,
    1 - (documents.embedding <=> query_embedding) as similarity
  from documents
  where documents.metadata @> filter
  order by documents.embedding <=> query_embedding
  limit match_count;
end;
$$;

-- 5. Enable RLS but allow reads with anon key
alter table documents enable row level security;

create policy "Allow public reads"
  on documents for select
  using (true);

create policy "Allow service role inserts"
  on documents for insert
  with check (true);
