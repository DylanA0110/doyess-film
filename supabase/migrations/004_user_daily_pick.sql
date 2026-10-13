-- Película del día (una fila por usuario y fecha)
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

alter table public.user_daily_picks enable row level security;

drop policy if exists "user_daily_picks_select_own" on public.user_daily_picks;
create policy "user_daily_picks_select_own"
  on public.user_daily_picks for select
  using (auth.uid() = user_id);

drop policy if exists "user_daily_picks_insert_own" on public.user_daily_picks;
create policy "user_daily_picks_insert_own"
  on public.user_daily_picks for insert
  with check (auth.uid() = user_id);
