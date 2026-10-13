import type { SupabaseClient } from '@supabase/supabase-js';
import type { CinephileStatsRow } from '@/lib/imdb/build-dashboard-stats';
import type { DashboardStats, DailyPickResult } from '@/components/dashboard/types';
import { buildDailyPickTasteProfile } from '@/lib/dashboard/daily-pick-taste';
import { discoverUnwatchedMovie } from '@/lib/tmdb/discover-unwatched';
import { resolvePosterUrl } from '@/lib/imdb/poster-url';

const MONTHS_ES = [
  'ENE',
  'FEB',
  'MAR',
  'ABR',
  'MAY',
  'JUN',
  'JUL',
  'AGO',
  'SEP',
  'OCT',
  'NOV',
  'DIC',
] as const;

function hashSeed(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function pickDateKey(now: Date): string {
  return now.toLocaleDateString('en-CA', { timeZone: 'America/Mexico_City' });
}

function dayLabel(now: Date) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Mexico_City',
    month: 'numeric',
    day: 'numeric',
  }).formatToParts(now);
  const monthNum = Number(parts.find((p) => p.type === 'month')?.value ?? '1');
  const day = parts.find((p) => p.type === 'day')?.value ?? '1';
  const monthIndex = Math.min(12, Math.max(1, monthNum)) - 1;
  return {
    month: MONTHS_ES[monthIndex] ?? 'HOY',
    day,
  };
}

function truncate(text: string, max: number): string {
  const t = text.replace(/\s+/g, ' ').trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max - 1).trimEnd()}…`;
}

type StoredPick = {
  tmdb_id: number;
  imdb_id: string | null;
  title: string;
  release_year: number | null;
  poster_path: string | null;
  overview: string | null;
  reason: string;
};

function toResult(
  row: StoredPick,
  now: Date,
  extras?: { tmdbVoteAverage?: number },
): DailyPickResult {
  return {
    tmdbId: row.tmdb_id,
    tmdbVoteAverage: extras?.tmdbVoteAverage,
    movie: {
      id: `daily-${row.tmdb_id}`,
      title: row.title,
      year: row.release_year ?? undefined,
      titleKind: 'movie',
      genres: [],
      posterUrl: resolvePosterUrl(row.poster_path),
      overview: row.overview ?? undefined,
    },
    reason: row.reason,
    synopsis: truncate(
      row.overview?.trim() ||
        `${row.title}: sugerencia para hoy según tu gusto por el cine que ya calificas.`,
      240,
    ),
    dayLabel: dayLabel(now),
    unwatched: true,
  };
}

export async function resolveDailyPick(
  supabase: SupabaseClient,
  userId: string,
  rows: CinephileStatsRow[],
  stats: DashboardStats,
  now: Date = new Date(),
): Promise<DailyPickResult | null> {
  if (rows.length === 0 || stats.dominantGenreName === '—') return null;

  const pickDate = pickDateKey(now);

  const { data: cached } = await supabase
    .from('user_daily_picks')
    .select('tmdb_id, imdb_id, title, release_year, poster_path, overview, reason')
    .eq('user_id', userId)
    .eq('pick_date', pickDate)
    .maybeSingle();

  if (cached) {
    return toResult(cached as StoredPick, now);
  }

  const excluded = new Set<string>();
  for (const row of rows) {
    if (row.imdb_id?.trim()) {
      const id = row.imdb_id.trim();
      excluded.add(id);
      if (!id.startsWith('tt')) excluded.add(`tt${id}`);
    }
  }

  const taste = buildDailyPickTasteProfile(rows, stats);
  const seed = hashSeed(`${userId}:${pickDate}`);
  let discovered: Awaited<ReturnType<typeof discoverUnwatchedMovie>> = null;

  try {
    discovered = await discoverUnwatchedMovie(taste, excluded, seed);
  } catch {
    discovered = null;
  }

  if (!discovered) {
    return null;
  }

  const reason = discovered.matchReason;

  const insertRow = {
    user_id: userId,
    pick_date: pickDate,
    tmdb_id: discovered.tmdbId,
    imdb_id: discovered.imdbId,
    title: discovered.title,
    release_year: discovered.releaseYear,
    poster_path: discovered.posterPath,
    overview: discovered.overview,
    reason,
  };

  const { error } = await supabase.from('user_daily_picks').insert(insertRow);
  if (error) {
    const { data: retry } = await supabase
      .from('user_daily_picks')
      .select('tmdb_id, imdb_id, title, release_year, poster_path, overview, reason')
      .eq('user_id', userId)
      .eq('pick_date', pickDate)
      .maybeSingle();
    if (retry) return toResult(retry as StoredPick, now);
    return toResult(
      {
        tmdb_id: discovered.tmdbId,
        imdb_id: discovered.imdbId,
        title: discovered.title,
        release_year: discovered.releaseYear,
        poster_path: discovered.posterPath,
        overview: discovered.overview,
        reason,
      },
      now,
      { tmdbVoteAverage: discovered.voteAverage },
    );
  }

  return toResult(
    {
      tmdb_id: discovered.tmdbId,
      imdb_id: discovered.imdbId,
      title: discovered.title,
      release_year: discovered.releaseYear,
      poster_path: discovered.posterPath,
      overview: discovered.overview,
      reason,
    },
    now,
    { tmdbVoteAverage: discovered.voteAverage },
  );
}
