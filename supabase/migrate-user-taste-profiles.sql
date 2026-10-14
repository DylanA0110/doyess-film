-- Perfil de recomendación (snapshot JSON, Fase 2 opcional)
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
create policy "user_taste_profiles_insert_own"
  on public.user_taste_profiles for insert
  with check (auth.uid() = user_id);

drop policy if exists "user_taste_profiles_update_own" on public.user_taste_profiles;
create policy "user_taste_profiles_update_own"
  on public.user_taste_profiles for update
  using (auth.uid() = user_id);
