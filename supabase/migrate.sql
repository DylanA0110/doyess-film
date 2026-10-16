-- =============================================================================
-- Doyess Film — ÚNICA migración para proyecto YA existente en Supabase
-- Ejecutar en: Supabase → SQL Editor (pegar y Run). Idempotente: se puede re-ejecutar.
--
-- Incluye: TMDB en movies, vista cinephile_stats, user_taste_profiles (motor v3),
--          user_daily_picks (pick del día), calificación manual en app.
--
-- Proyecto NUEVO (sin tablas): usa supabase/schema.sql en su lugar.
--
-- Fase 6 (escalabilidad): secciones 5–7 más abajo (pgvector, KPI cache, jobs).
-- Jobs: Inngest en app/api/inngest; sin Inngest usa after() + SUPABASE_SERVICE_ROLE_KEY.
-- Redis TMDB: UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN en .env.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1) Columnas TMDB en movies
-- -----------------------------------------------------------------------------
alter table public.movies
  add column if not exists tmdb_id int,
  add column if not exists poster_path text,
  add column if not exists backdrop_path text,
  add column if not exists enriched_at timestamptz,
  add column if not exists cast_snapshot jsonb default '[]'::jsonb,
  add column if not exists crew_snapshot jsonb default '[]'::jsonb,
  add column if not exists enrichment_status text not null default 'pending',
  add column if not exists enrichment_attempted_at timestamptz,
  add column if not exists tmdb_media_type text,
  add column if not exists tmdb_keywords text[] default '{}'::text[];

update public.movies
set tmdb_keywords = '{}'::text[]
where tmdb_keywords is null;

update public.movies
set cast_snapshot = '[]'::jsonb
where cast_snapshot is null;

update public.movies
set crew_snapshot = '[]'::jsonb
where crew_snapshot is null;

update public.movies
set enrichment_status = 'ok'
where enriched_at is not null and enrichment_status = 'pending';

-- -----------------------------------------------------------------------------
-- 2) Vista del dashboard
-- -----------------------------------------------------------------------------
drop view if exists public.cinephile_stats;

create view public.cinephile_stats as
select
  ur.user_id,
  m.id as movie_id,
  m.imdb_id,
  m.title,
  m.release_year,
  m.runtime_mins,
  m.title_type,
  m.genres,
  m.directors,
  m.poster_path,
  m.tmdb_id,
  m.tmdb_media_type,
  m.tmdb_keywords,
  m.enrichment_status,
  m.cast_snapshot,
  m.crew_snapshot,
  ur.rating,
  ur.date_rated
from public.user_ratings ur
inner join public.movies m on m.id = ur.movie_id;

grant select on public.cinephile_stats to authenticated;

-- -----------------------------------------------------------------------------
-- 3) Snapshot perfil recomendación (motor v3 + calificación manual)
-- -----------------------------------------------------------------------------
create table if not exists public.user_taste_profiles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  algorithm_version int not null,
  profile_json jsonb not null,
  ratings_count int not null default 0,
  updated_at timestamptz not null default now()
);

alter table public.user_taste_profiles enable row level security;

drop policy if exists "user_taste_profiles_select_own" on public.user_taste_profiles;
create policy "user_taste_profiles_select_own"
  on public.user_taste_profiles for select
  using (auth.uid() = user_id);

drop policy if exists "user_taste_profiles_upsert_own" on public.user_taste_profiles;
drop policy if exists "user_taste_profiles_insert_own" on public.user_taste_profiles;
create policy "user_taste_profiles_insert_own"
  on public.user_taste_profiles for insert
  with check (auth.uid() = user_id);

drop policy if exists "user_taste_profiles_update_own" on public.user_taste_profiles;
create policy "user_taste_profiles_update_own"
  on public.user_taste_profiles for update
  using (auth.uid() = user_id);

drop policy if exists "user_taste_profiles_delete_own" on public.user_taste_profiles;
create policy "user_taste_profiles_delete_own"
  on public.user_taste_profiles for delete
  using (auth.uid() = user_id);

-- -----------------------------------------------------------------------------
-- 4) Película del día
-- -----------------------------------------------------------------------------
create table if not exists public.user_daily_picks (
  user_id uuid not null references auth.users (id) on delete cascade,
  pick_date date not null,
  tmdb_id int not null,
  imdb_id text,
  title text not null,
  release_year int,
  poster_path text,
  overview text,
  reason text not null,
  vote_average real,
  created_at timestamptz not null default now(),
  primary key (user_id, pick_date)
);

alter table public.user_daily_picks
  add column if not exists vote_average real;

alter table public.user_daily_picks enable row level security;

drop policy if exists "user_daily_picks_select_own" on public.user_daily_picks;
create policy "user_daily_picks_select_own"
  on public.user_daily_picks for select
  using (auth.uid() = user_id);

drop policy if exists "user_daily_picks_insert_own" on public.user_daily_picks;
create policy "user_daily_picks_insert_own"
  on public.user_daily_picks for insert
  with check (auth.uid() = user_id);

-- -----------------------------------------------------------------------------
-- 5) Fase 6 — pgvector (vecinos por keywords)
-- -----------------------------------------------------------------------------
create extension if not exists vector;

alter table public.user_taste_profiles
  add column if not exists keyword_vector vector(256);

create table if not exists public.media_keyword_vectors (
  tmdb_id int not null,
  media_type text not null check (media_type in ('movie', 'tv')),
  embedding vector(256) not null,
  updated_at timestamptz not null default now(),
  primary key (tmdb_id, media_type)
);

create index if not exists media_keyword_vectors_hnsw_idx
  on public.media_keyword_vectors
  using hnsw (embedding vector_cosine_ops);

alter table public.media_keyword_vectors enable row level security;

drop policy if exists "media_keyword_vectors_select_authenticated" on public.media_keyword_vectors;
create policy "media_keyword_vectors_select_authenticated"
  on public.media_keyword_vectors for select
  to authenticated
  using (true);

drop policy if exists "media_keyword_vectors_write_authenticated" on public.media_keyword_vectors;
create policy "media_keyword_vectors_write_authenticated"
  on public.media_keyword_vectors for all
  to authenticated
  using (true)
  with check (true);

create or replace function public.match_media_neighbors(
  query_embedding vector(256),
  match_count int default 20
)
returns table (
  tmdb_id int,
  media_type text,
  similarity float
)
language sql
stable
security definer
set search_path = public
as $$
  select
    m.tmdb_id,
    m.media_type,
    1 - (m.embedding <=> query_embedding) as similarity
  from public.media_keyword_vectors m
  order by m.embedding <=> query_embedding
  limit greatest(1, least(match_count, 50));
$$;

grant execute on function public.match_media_neighbors(vector, int) to authenticated;

-- -----------------------------------------------------------------------------
-- 6) Fase 6 — KPI cache (mantenido por worker / rebuild)
-- -----------------------------------------------------------------------------
create table if not exists public.user_kpi_cache (
  user_id uuid primary key references auth.users (id) on delete cascade,
  ratings_count int not null,
  stats_json jsonb not null,
  refreshed_at timestamptz not null default now()
);

alter table public.user_kpi_cache enable row level security;

drop policy if exists "user_kpi_cache_select_own" on public.user_kpi_cache;
create policy "user_kpi_cache_select_own"
  on public.user_kpi_cache for select
  using (auth.uid() = user_id);

drop policy if exists "user_kpi_cache_delete_own" on public.user_kpi_cache;
create policy "user_kpi_cache_delete_own"
  on public.user_kpi_cache for delete
  using (auth.uid() = user_id);
