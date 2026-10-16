-- Fase 6 (escalabilidad): no ejecutar en MVP. Referencia para cuando escale el tráfico.
-- Documentación: docs/architecture-scaling.md

-- 6.2 pgvector (afinidad en Postgres)
-- create extension if not exists vector;
-- create table public.media_keyword_vectors (
--   tmdb_id int not null,
--   media_type text not null check (media_type in ('movie', 'tv')),
--   embedding vector(384) not null,
--   primary key (tmdb_id, media_type)
-- );
-- create index on public.media_keyword_vectors using hnsw (embedding vector_cosine_ops);

-- 6.3 KPI materializados
-- create materialized view public.user_kpi_summary as
--   select user_id, /* agregados JSON */ ...
--   from ...;
-- refresh materialized view concurrently public.user_kpi_summary;

-- Política DELETE en user_taste_profiles (si ya corriste migrate-user-taste-profiles.sql sin ella):
-- drop policy if exists "user_taste_profiles_delete_own" on public.user_taste_profiles;
-- create policy "user_taste_profiles_delete_own"
--   on public.user_taste_profiles for delete
--   using (auth.uid() = user_id);
