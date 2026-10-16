-- Keywords TMDB + tipo de media para motor de recomendación v3
alter table public.movies
  add column if not exists tmdb_media_type text,
  add column if not exists tmdb_keywords text[] default '{}'::text[];

update public.movies
set tmdb_keywords = '{}'::text[]
where tmdb_keywords is null;

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
