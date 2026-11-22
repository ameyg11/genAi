-- 1. Enable the pgvector extension in Supabase SQL Editor
create extension if not exists vector;

-- 2. Drop existing table if you previously created it with 1536 dimensions
-- drop table if exists documents;

-- 3. Create documents table with 768 dimensions for Google Gemini embeddings
-- (Note: Gemini gemini-embedding-2 outputs 768 dimensions)
create table if not exists documents (
  id bigint primary key generated always as identity,
  content text not null,
  embedding vector(768)
);

-- 4. Create Postgres function for similarity search matching 768d vectors
create or replace function match_documents (
  query_embedding vector(768),
  match_threshold float,
  match_count int
)
returns table (
  id bigint,
  content text,
  similarity float
)
language sql stable
as $$
  select
    documents.id,
    documents.content,
    1 - (documents.embedding <=> query_embedding) as similarity
  from documents
  where 1 - (documents.embedding <=> query_embedding) > match_threshold
  order by similarity desc
  limit match_count;
$$;
