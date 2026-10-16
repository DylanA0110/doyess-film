import type { CinephileStatsRow } from '@/lib/imdb/build-dashboard-stats';
import { cinephileRowToMovie as rowToMovie } from '@/lib/imdb/build-dashboard-stats';
import type { DashboardStats, ProfileHighlight } from '@/components/dashboard/types';
import type { TmdbCastSnapshotEntry } from '@/lib/tmdb/types';
import { getTmdbProfileUrl } from '@/lib/tmdb/images';
import { NEUTRAL_POSTER, resolvePosterUrl } from '@/lib/imdb/poster-url';
import { titleKindFromImdbType } from '@/lib/imdb/title-kind';
import { actorCompositeScore, directorCompositeScore } from '@/lib/dashboard/highlight-scoring';
import { computeAffinity, getUserRecommendationProfile } from '@/lib/recommendation';
import { fromTmdbMovieListItem } from '@/lib/recommendation/media-candidate';

const BLURB_MAX = 72;

function truncate(text: string, max: number): string {
  const t = text.replace(/\s+/g, ' ').trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max - 1).trimEnd()}…`;
}

function parseCast(value: unknown): TmdbCastSnapshotEntry[] {
  if (!value || !Array.isArray(value)) return [];
  return value as TmdbCastSnapshotEntry[];
}

function normalizeShowTitle(title: string): string {
  return title.trim().toLowerCase();
}

function kindLabelForRow(row: CinephileStatsRow): string {
  const kind = titleKindFromImdbType(row.title_type);
  if (kind === 'series') return 'Serie';
  if (kind === 'episode') return 'Capítulo';
  return 'Película';
}

function topGenreSet(stats: DashboardStats): Set<string> {
  return new Set(
    stats.topGenres.map((g) => g.name).filter((n) => n !== 'Otros').slice(0, 5),
  );
}

function affinityScore(
  row: CinephileStatsRow,
  stats: DashboardStats,
  rows: CinephileStatsRow[],
): number {
  const profile = getUserRecommendationProfile(rows);
  if (profile) {
    const stub = fromTmdbMovieListItem(
      {
        id: 0,
        title: row.title,
        overview: '',
        poster_path: null,
        release_date: '',
        vote_average: 0,
        vote_count: 0,
      },
      { keywords: row.tmdb_keywords ?? [] },
    );
    const cos = computeAffinity(profile, stub);
    return cos * 5 + (row.rating / 10) * 3;
  }
  const top = topGenreSet(stats);
  const genres = row.genres ?? [];
  let score = (row.rating / 10) * 4;
  if (genres.includes(stats.dominantGenreName)) score += 3;
  else if (genres.some((g) => top.has(g))) score += 1.5;
  return score;
}

function blurbForRow(row: CinephileStatsRow, stats: DashboardStats): string {
  const movie = rowToMovie(row);
  if (movie.overview?.trim()) return truncate(movie.overview.trim(), BLURB_MAX);
  const genre =
    movie.genres.find((g) => g === stats.dominantGenreName) ?? movie.genres[0] ?? 'cine';
  const rating = `${row.rating}/10`;
  const director = row.directors?.[0] ? ` · ${row.directors[0]}` : '';
  return truncate(
    `${movie.title}${movie.year ? ` (${movie.year})` : ''}${director}. Tu nota ${rating}; encaja con ${genre.toLowerCase()}.`,
    BLURB_MAX,
  );
}

function pickBestRow(rows: CinephileStatsRow[], stats: DashboardStats): CinephileStatsRow | null {
  if (rows.length === 0) return null;
  return [...rows].sort(
    (a, b) => affinityScore(b, stats, rows) - affinityScore(a, stats, rows),
  )[0];
}

function groupSeriesRepresentatives(rows: CinephileStatsRow[]): CinephileStatsRow[] {
  const seriesRows = rows.filter((r) => titleKindFromImdbType(r.title_type) === 'series');
  const byTitle = new Map<string, CinephileStatsRow[]>();
  for (const row of seriesRows) {
    const key = normalizeShowTitle(row.title);
    const list = byTitle.get(key) ?? [];
    list.push(row);
    byTitle.set(key, list);
  }
  const reps: CinephileStatsRow[] = [];
  for (const group of byTitle.values()) {
    const sorted = [...group].sort((a, b) => {
      if (b.rating !== a.rating) return b.rating - a.rating;
      const aPoster = a.poster_path ? 1 : 0;
      const bPoster = b.poster_path ? 1 : 0;
      return bPoster - aPoster;
    });
    reps.push(sorted[0]);
  }
  return reps;
}

function pickTenRow(rows: CinephileStatsRow[], stats: DashboardStats): CinephileStatsRow | null {
  const tens = rows.filter((r) => r.rating === 10);
  if (tens.length === 0) return null;
  const dominant = stats.dominantGenreName;
  return [...tens].sort((a, b) => {
    const aGenre = (a.genres ?? []).includes(dominant) ? 1 : 0;
    const bGenre = (b.genres ?? []).includes(dominant) ? 1 : 0;
    if (bGenre !== aGenre) return bGenre - aGenre;
    const da = a.date_rated ?? '';
    const db = b.date_rated ?? '';
    return db.localeCompare(da);
  })[0];
}

type ActorAgg = {
  name: string;
  sum: number;
  count: number;
  photo: string | null;
  gender: number;
};

function buildActorAggs(rows: CinephileStatsRow[]): ActorAgg[] {
  const agg: Record<string, ActorAgg> = {};
  for (const row of rows) {
    for (const member of parseCast(row.cast_snapshot)) {
      if (!agg[member.name]) {
        agg[member.name] = {
          name: member.name,
          sum: 0,
          count: 0,
          photo: member.profile_path,
          gender: member.gender,
        };
      }
      agg[member.name].sum += row.rating;
      agg[member.name].count += 1;
      if (!agg[member.name].photo && member.profile_path) {
        agg[member.name].photo = member.profile_path;
      }
    }
  }
  return Object.values(agg);
}

function pickBestActor(rows: CinephileStatsRow[]): ActorAgg | null {
  const aggs = buildActorAggs(rows);
  if (aggs.length === 0) return null;
  return [...aggs].sort((a, b) => {
    const sa = actorCompositeScore(a.sum / a.count, a.count);
    const sb = actorCompositeScore(b.sum / b.count, b.count);
    return sb - sa;
  })[0];
}

function pickBestDirector(rows: CinephileStatsRow[]): {
  name: string;
  avg: number;
  count: number;
  photoUrl: string;
} | null {
  const agg: Record<string, { sum: number; count: number }> = {};
  for (const row of rows) {
    for (const d of row.directors ?? []) {
      if (!agg[d]) agg[d] = { sum: 0, count: 0 };
      agg[d].sum += row.rating;
      agg[d].count += 1;
    }
  }
  const candidates = Object.entries(agg)
    .map(([name, { sum, count }]) => ({
      name,
      avg: sum / count,
      count,
      score: directorCompositeScore(sum / count, count),
    }))
    .filter((d) => d.count >= 2 || d.avg >= 9);
  if (candidates.length === 0) return null;
  const best = candidates.sort((a, b) => b.score - a.score)[0];
  let photoUrl = NEUTRAL_POSTER;
  for (const row of rows) {
    if (!(row.directors ?? []).includes(best.name)) continue;
    const crew = row.crew_snapshot;
    if (crew && Array.isArray(crew)) {
      const hit = (crew as { name: string; profile_path?: string | null }[]).find(
        (c) => c.name === best.name,
      );
      if (hit?.profile_path) {
        photoUrl = getTmdbProfileUrl(hit.profile_path) ?? NEUTRAL_POSTER;
        break;
      }
    }
  }
  return {
    name: best.name,
    avg: Number(best.avg.toFixed(1)),
    count: best.count,
    photoUrl,
  };
}

function posterFromSamples(stats: DashboardStats): string {
  const sample =
    stats.dominantGenreInsight?.sampleTitles.find((t) => t.posterUrl.startsWith('http'))
      ?.posterUrl ??
    stats.moviesRated10.find((m) => m.posterUrl.startsWith('http'))?.posterUrl;
  return sample ?? NEUTRAL_POSTER;
}

export function buildProfileHighlights(
  rows: CinephileStatsRow[],
  stats: DashboardStats,
): ProfileHighlight[] {
  if (rows.length === 0) return [];

  const highlights: ProfileHighlight[] = [];

  if (stats.dominantGenreName !== '—') {
    const insight = stats.dominantGenreInsight;
    const blurb =
      insight?.explanation
        ? truncate(insight.explanation.split('.')[0] ?? insight.explanation, 80)
        : `${stats.dominantGenrePercent}% de afinidad en tu historial.`;
    highlights.push({
      kind: 'genre',
      frontLabel: 'Género favorito',
      backTitle: stats.dominantGenreName,
      kindLabel: 'Género',
      imageUrl: posterFromSamples(stats),
      blurb,
      stat: `${stats.dominantGenrePercent}%`,
      openGenreDetail: true,
    });
  }

  const movieRows = rows.filter((r) => titleKindFromImdbType(r.title_type) === 'movie');
  const tenRow = pickTenRow(movieRows, stats);
  if (tenRow) {
    highlights.push({
      kind: 'ten',
      frontLabel: 'Tu 10',
      backTitle: tenRow.title,
      kindLabel: kindLabelForRow(tenRow),
      imageUrl: resolvePosterUrl(tenRow.poster_path),
      blurb: blurbForRow(tenRow, stats),
      stat: '10/10',
    });
  }

  const favMovie = pickBestRow(movieRows, stats);
  if (favMovie) {
    highlights.push({
      kind: 'favoriteMovie',
      frontLabel: 'Película favorita',
      backTitle: favMovie.title,
      kindLabel: 'Película',
      imageUrl: resolvePosterUrl(favMovie.poster_path),
      blurb: blurbForRow(favMovie, stats),
      stat: `${favMovie.rating}/10`,
    });
  }

  const seriesReps = groupSeriesRepresentatives(rows);
  const favSeries = pickBestRow(seriesReps, stats);
  if (favSeries) {
    highlights.push({
      kind: 'favoriteSeries',
      frontLabel: 'Serie favorita',
      backTitle: favSeries.title,
      kindLabel: 'Serie',
      imageUrl: resolvePosterUrl(favSeries.poster_path),
      blurb: blurbForRow(favSeries, stats),
      stat: `${favSeries.rating}/10`,
    });
  }

  const actor = pickBestActor(rows);
  if (actor) {
    const avg = Number((actor.sum / actor.count).toFixed(1));
    highlights.push({
      kind: 'actor',
      frontLabel: 'Actor favorito',
      backTitle: actor.name,
      kindLabel: actor.gender === 1 ? 'Actriz' : 'Actor',
      imageUrl: actor.photo ? getTmdbProfileUrl(actor.photo) ?? NEUTRAL_POSTER : NEUTRAL_POSTER,
      blurb: truncate(
        `Media ${avg}/10 en ${actor.count} títulos que calificaste; encaja con tu perfil en ${stats.dominantGenreName.toLowerCase()}.`,
        BLURB_MAX,
      ),
      stat: `${actor.count} títulos`,
      roundImage: true,
    });
  }

  const director = pickBestDirector(rows);
  if (director) {
    highlights.push({
      kind: 'director',
      frontLabel: 'Director favorito',
      backTitle: director.name,
      kindLabel: 'Director',
      imageUrl: director.photoUrl,
      blurb: truncate(
        `Tus notas con su filmografía promedian ${director.avg}/10 en ${director.count} títulos.`,
        BLURB_MAX,
      ),
      stat: `★ ${director.avg}`,
      roundImage: true,
    });
  }

  return highlights;
}
