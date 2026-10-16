import type { SupabaseClient } from '@supabase/supabase-js';
import type { CinephileStatsRow } from '@/lib/imdb/build-dashboard-stats';
import type { DashboardStats, DailyPickResult } from '@/components/dashboard/types';
import { getUserRecommendationProfile } from '@/lib/recommendation';
import {
  backfillDailyPickLocale,
  getCachedDailyPickResult,
  loadStoredDailyPick,
  storedToResult,
} from '@/lib/dashboard/daily-pick-cache';
import { dailyPickDateKey } from '@/lib/dashboard/daily-pick-format';
import { isStoredDailyPickStale } from '@/lib/dashboard/daily-pick-stale';
import { refreshDailyPickReason } from '@/lib/dashboard/refresh-daily-pick-reason';
import { discoverUnwatchedMovie } from '@/lib/tmdb/discover-unwatched';
import { fetchMovieDetail } from '@/lib/tmdb/movie-public';

function hashSeed(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/**
 * Lee caché en Supabase; si no hay fila para hoy, genera una vez (TMDB) y persiste.
 * Visitas siguientes del mismo día: solo SELECT — escala con N usuarios × 1 lectura/día.
 */
export async function resolveDailyPick(
  supabase: SupabaseClient,
  userId: string,
  rows: CinephileStatsRow[],
  stats: DashboardStats,
  now: Date = new Date(),
): Promise<DailyPickResult | null> {
  if (rows.length === 0) return null;

  const pickDate = dailyPickDateKey(now);
  let cached = await loadStoredDailyPick(supabase, userId, pickDate);

  if (cached) {
    cached = await backfillDailyPickLocale(supabase, userId, pickDate, cached);
    const stale = await isStoredDailyPickStale(cached, rows);
    if (!stale) {
      const result = storedToResult(cached, now);
      return refreshDailyPickReason(result, rows);
    }
    await supabase
      .from('user_daily_picks')
      .delete()
      .eq('user_id', userId)
      .eq('pick_date', pickDate);
  }

  const excluded = new Set<string>();
  for (const row of rows) {
    if (row.imdb_id?.trim()) {
      const id = row.imdb_id.trim();
      excluded.add(id);
      if (!id.startsWith('tt')) excluded.add(`tt${id}`);
    }
  }

  const profile = getUserRecommendationProfile(rows);
  if (!profile) return null;

  const seed = hashSeed(`${userId}:${pickDate}`);

  let discovered: Awaited<ReturnType<typeof discoverUnwatchedMovie>> = null;
  try {
    discovered = await discoverUnwatchedMovie(profile, excluded, seed);
  } catch {
    discovered = null;
  }

  if (!discovered) return null;

  const detail = await fetchMovieDetail(discovered.tmdbId);
  const title = detail?.title?.trim() || discovered.title;
  const overview =
    detail?.overview?.trim() || discovered.overview?.trim() || '';
  const reason = discovered.matchReason;
  const voteAverage = detail?.vote_average ?? discovered.voteAverage;

  const insertRow = {
    user_id: userId,
    pick_date: pickDate,
    tmdb_id: discovered.tmdbId,
    imdb_id: detail?.imdb_id ?? discovered.imdbId,
    title,
    release_year: discovered.releaseYear,
    poster_path: detail?.poster_path ?? discovered.posterPath,
    overview,
    reason,
    vote_average: voteAverage,
  };

  const { error } = await supabase.from('user_daily_picks').insert(insertRow);
  if (error) {
    const retry = await getCachedDailyPickResult(supabase, userId, now);
    if (retry) return retry;
    return storedToResult(
      {
        tmdb_id: discovered.tmdbId,
        imdb_id: insertRow.imdb_id,
        title,
        release_year: discovered.releaseYear,
        poster_path: insertRow.poster_path,
        overview,
        reason,
        vote_average: voteAverage,
      },
      now,
    );
  }

  return storedToResult(
    {
      tmdb_id: discovered.tmdbId,
      imdb_id: insertRow.imdb_id,
      title,
      release_year: discovered.releaseYear,
      poster_path: insertRow.poster_path,
      overview,
      reason,
      vote_average: voteAverage,
    },
    now,
  );
}
