-- Enable the pgvector extension to work with embedding vectors
create extension if not exists vector;

-- Create a table to store knowledge base documents
create table if not exists knowledge_base (
  id bigint primary key generated always as identity,
  content text not null,
  embedding vector(768) not null
);

-- Create a function to search for documents
create or replace function match_knowledge (
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
    knowledge_base.id,
    knowledge_base.content,
    1 - (knowledge_base.embedding <=> query_embedding) as similarity
  from knowledge_base
  where 1 - (knowledge_base.embedding <=> query_embedding) > match_threshold
  order by knowledge_base.embedding <=> query_embedding
  limit match_count;
$$;
