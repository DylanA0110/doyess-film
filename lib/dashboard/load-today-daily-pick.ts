import type { SupabaseClient } from '@supabase/supabase-js';

function pickDateKey(now: Date): string {
  return now.toLocaleDateString('en-CA', { timeZone: 'America/Mexico_City' });
}

export type TodayDailyPickRow = {
  tmdb_id: number;
  imdb_id: string | null;
  title: string;
  release_year: number | null;
  poster_path: string | null;
  overview: string | null;
  reason: string;
};

export async function loadTodayDailyPickRow(
  supabase: SupabaseClient,
  userId: string,
  now: Date = new Date(),
): Promise<TodayDailyPickRow | null> {
  const pickDate = pickDateKey(now);
  const { data } = await supabase
    .from('user_daily_picks')
    .select('tmdb_id, imdb_id, title, release_year, poster_path, overview, reason')
    .eq('user_id', userId)
    .eq('pick_date', pickDate)
    .maybeSingle();

  return (data as TodayDailyPickRow | null) ?? null;
}
