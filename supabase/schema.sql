-- Ejecutar en Supabase → SQL Editor (proyecto Doyess Film)
-- Crea tablas, vista cinephile_stats, RLS y perfil al registrarse.
--
-- Solo para proyecto NUEVO. Si ya tienes tablas, NO vuelvas a pegar este archivo:
-- usa migraciones puntuales (p. ej. migrate-tmdb-enrichment.sql, migrate-user-daily-pick.sql).

-- Perfiles (vinculado a auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  full_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles_select_own"
  on public.profiles for select
  using (auth.uid() = id);

create policy "profiles_insert_own"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id);

-- Catálogo de películas (desde CSV IMDb)
create table if not exists public.movies (
  id uuid primary key default gen_random_uuid(),
  imdb_id text not null unique,
  title text not null,
  original_title text,
  title_type text,
  release_year int,
  runtime_mins int,
  genres text[],
  directors text[],
  tmdb_id int,
  poster_path text,
  backdrop_path text,
  enriched_at timestamptz,
  cast_snapshot jsonb default '[]'::jsonb,
  crew_snapshot jsonb default '[]'::jsonb,
  enrichment_status text not null default 'pending',
  enrichment_attempted_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.movies enable row level security;

create policy "movies_select_authenticated"
  on public.movies for select
  to authenticated
  using (true);

create policy "movies_insert_authenticated"
  on public.movies for insert
  to authenticated
  with check (true);

create policy "movies_update_authenticated"
  on public.movies for update
  to authenticated
  using (true);

-- Calificaciones por usuario
create table if not exists public.user_ratings (
  user_id uuid not null references auth.users (id) on delete cascade,
  movie_id uuid not null references public.movies (id) on delete cascade,
  rating int not null check (rating between 1 and 10),
  date_rated date,
  created_at timestamptz not null default now(),
  primary key (user_id, movie_id)
);

alter table public.user_ratings enable row level security;

create policy "user_ratings_select_own"
  on public.user_ratings for select
  using (auth.uid() = user_id);

create policy "user_ratings_insert_own"
  on public.user_ratings for insert
  with check (auth.uid() = user_id);

create policy "user_ratings_update_own"
  on public.user_ratings for update
  using (auth.uid() = user_id);

-- Vista usada por el dashboard (DROP si cambia la definición de columnas)
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

-- Película del día (persistencia por usuario y fecha)
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
  created_at timestamptz not null default now(),
  primary key (user_id, pick_date)
);

alter table public.user_daily_picks enable row level security;

drop policy if exists "user_daily_picks_select_own" on public.user_daily_picks;
create policy "user_daily_picks_select_own"
  on public.user_daily_picks for select
  using (auth.uid() = user_id);

drop policy if exists "user_daily_picks_insert_own" on public.user_daily_picks;
create policy "user_daily_picks_insert_own"
  on public.user_daily_picks for insert
  with check (auth.uid() = user_id);

-- Perfil automático al crear usuario (Google OAuth)
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(
      new.raw_user_meta_data ->> 'full_name',
      new.raw_user_meta_data ->> 'name',
      split_part(new.email, '@', 1)
    ),
    coalesce(
      new.raw_user_meta_data ->> 'avatar_url',
      new.raw_user_meta_data ->> 'picture'
    )
  )
  on conflict (id) do update set
    email = excluded.email,
    full_name = coalesce(excluded.full_name, profiles.full_name),
    avatar_url = coalesce(excluded.avatar_url, profiles.avatar_url),
    updated_at = now();
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
