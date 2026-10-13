import type { SupabaseClient } from '@supabase/supabase-js';
import type { DailyPickResult } from '@/components/dashboard/types';
import { resolvePosterUrl } from '@/lib/imdb/poster-url';
import { fetchMovieDetail } from '@/lib/tmdb/movie-public';
import { dailyPickDayLabel, dailyPickDateKey, truncateSynopsis, type StoredDailyPick } from '@/lib/dashboard/daily-pick-format';

export async function loadStoredDailyPick(
  supabase: SupabaseClient,
  userId: string,
  pickDate: string,
): Promise<StoredDailyPick | null> {
  const { data } = await supabase
    .from('user_daily_picks')
    .select(
      'tmdb_id, imdb_id, title, release_year, poster_path, overview, reason, vote_average',
    )
    .eq('user_id', userId)
    .eq('pick_date', pickDate)
    .maybeSingle();

  return (data as StoredDailyPick | null) ?? null;
}

function storedToResult(row: StoredDailyPick, now: Date): DailyPickResult {
  const overview = row.overview?.trim() ?? '';
  return {
    tmdbId: row.tmdb_id,
    tmdbVoteAverage: row.vote_average ?? undefined,
    movie: {
      id: `daily-${row.tmdb_id}`,
      title: row.title,
      year: row.release_year ?? undefined,
      titleKind: 'movie',
      genres: [],
      posterUrl: resolvePosterUrl(row.poster_path),
      overview: overview || undefined,
    },
    reason: row.reason,
    synopsis: truncateSynopsis(
      overview ||
        `${row.title}: una sugerencia para hoy según los géneros que más calificas.`,
      200,
    ),
    dayLabel: dailyPickDayLabel(now),
    unwatched: true,
  };
}

/** Solo lectura en DB — O(1) por usuario/día; escalable con muchos usuarios. */
export async function getCachedDailyPickResult(
  supabase: SupabaseClient,
  userId: string,
  now: Date = new Date(),
): Promise<DailyPickResult | null> {
  const pickDate = dailyPickDateKey(now);
  const row = await loadStoredDailyPick(supabase, userId, pickDate);
  if (!row) return null;
  return storedToResult(row, now);
}

/** Rellena sinopsis ES / nota TMDB en filas antiguas (una vez). */
export async function backfillDailyPickLocale(
  supabase: SupabaseClient,
  userId: string,
  pickDate: string,
  row: StoredDailyPick,
): Promise<StoredDailyPick> {
  const overview = row.overview?.trim() ?? '';
  const needsVote = row.vote_average == null;
  const needsText =
    !overview ||
    /^(The|A|An|After|When|In|Down|Two|As|Following)\b/.test(overview);

  if (!needsText && !needsVote) return row;

  const detail = await fetchMovieDetail(row.tmdb_id);
  if (!detail) return row;

  const patch = {
    title: detail.title?.trim() || row.title,
    overview: detail.overview?.trim() || row.overview,
    vote_average: detail.vote_average,
    poster_path: detail.poster_path ?? row.poster_path,
    imdb_id: detail.imdb_id ?? row.imdb_id,
  };

  await supabase
    .from('user_daily_picks')
    .update(patch)
    .eq('user_id', userId)
    .eq('pick_date', pickDate);

  return { ...row, ...patch };
}

export { storedToResult };
