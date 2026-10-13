-- Redirige a supabase/migrate-tmdb-enrichment.sql (mismo contenido, un solo archivo para correr en SQL Editor).

alter table public.movies
  add column if not exists tmdb_id int,
  add column if not exists poster_path text,
  add column if not exists backdrop_path text,
  add column if not exists enriched_at timestamptz,
  add column if not exists cast_snapshot jsonb default '[]'::jsonb,
  add column if not exists crew_snapshot jsonb default '[]'::jsonb;

update public.movies set cast_snapshot = '[]'::jsonb where cast_snapshot is null;
update public.movies set crew_snapshot = '[]'::jsonb where crew_snapshot is null;

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
  m.enrichment_status,
  m.cast_snapshot,
  m.crew_snapshot,
  ur.rating,
  ur.date_rated
from public.user_ratings ur
inner join public.movies m on m.id = ur.movie_id;

grant select on public.cinephile_stats to authenticated;
