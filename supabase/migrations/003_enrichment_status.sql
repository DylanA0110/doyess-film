-- Ejecutar en SQL Editor si ya corriste migrate-tmdb-enrichment.sql (o usa migrate-tmdb-enrichment.sql completo).

alter table public.movies
  add column if not exists enrichment_status text not null default 'pending',
  add column if not exists enrichment_attempted_at timestamptz;

update public.movies
set enrichment_status = 'ok'
where enriched_at is not null and (enrichment_status is null or enrichment_status = 'pending');

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
