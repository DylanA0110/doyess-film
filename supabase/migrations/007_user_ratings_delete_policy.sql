drop policy if exists "user_ratings_delete_own" on public.user_ratings;
create policy "user_ratings_delete_own"
  on public.user_ratings for delete
  using (auth.uid() = user_id);
