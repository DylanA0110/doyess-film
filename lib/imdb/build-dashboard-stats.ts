import type {
  DashboardCastInsight,
  DashboardGenreInsight,
  DashboardGenreTasteBlock,
  DashboardMovie,
  DashboardPersonStat,
  DashboardStats,
  TitleKindBreakdown,
  TitleKindSlice,
} from '@/components/dashboard/types';
import type { TmdbCastSnapshotEntry, TmdbCrewSnapshotEntry } from '@/lib/tmdb/types';
import { getTmdbProfileUrl } from '@/lib/tmdb/images';
import { NEUTRAL_POSTER, resolvePosterUrl } from '@/lib/imdb/poster-url';
import { personNamesMatch } from '@/lib/imdb/normalize-person-name';
import {
  rowsForMovieKpis,
  rowsForSeriesKpis,
  titleKindFromImdbType,
  type TitleKind,
} from '@/lib/imdb/title-kind';
import {
  INSIGHT_CAST_TOP_N,
  INSIGHT_GENRE_SAMPLES,
} from '@/lib/dashboard/insight-limits';
import { actorCompositeScore } from '@/lib/dashboard/highlight-scoring';
import { genreAffinityExplanation } from '@/lib/recommendation/format-user-copy';
import {
  buildCinephileInsights,
  genreDisplayPercentages,
  genreDisplayPercentagesForSlice,
  getUserRecommendationProfile,
} from '@/lib/recommendation';
import type { TitleKindTasteSlice, UserVectorProfile } from '@/lib/recommendation/types';

export type CinephileStatsRow = {
  user_id: string;
  movie_id: string;
  imdb_id?: string | null;
  title: string;
  title_type?: string | null;
  release_year: number | null;
  runtime_mins?: number | null;
  genres: string[] | null;
  directors: string[] | null;
  poster_path?: string | null;
  enrichment_status?: string | null;
  cast_snapshot?: TmdbCastSnapshotEntry[] | null;
  crew_snapshot?: TmdbCrewSnapshotEntry[] | null;
  rating: number;
  date_rated: string | null;
  tmdb_id?: number | null;
  tmdb_media_type?: string | null;
  tmdb_keywords?: string[] | null;
};

const genreColors = ['#8A0201', '#5B1E31', '#C80000', '#801818', '#D97706'];
const DEFAULT_RUNTIME = 110;

function parseSnapshot<T>(value: unknown): T[] {
  if (!value) return [];
  if (Array.isArray(value)) return value as T[];
  return [];
}

function formatScreenTime(totalMinutes: number) {
  const hours = Math.round(totalMinutes / 60);
  if (hours >= 1000) {
    return `${(totalMinutes / 1000).toFixed(1)}k m`;
  }
  return `${hours}h`;
}

function formatLastUpdated(dates: string[]) {
  if (dates.length === 0) return null;
  const latest = dates.sort().at(-1);
  if (!latest) return null;
  const parsed = new Date(latest);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed.toLocaleString('es-ES', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'America/Mexico_City',
  });
}

function bucketRating(rating: number) {
  const rounded = Math.round(rating);
  return Math.min(10, Math.max(1, rounded));
}

function findCrewPhoto(directorName: string, rows: CinephileStatsRow[]): string {
  for (const row of rows) {
    const crew = parseSnapshot<TmdbCrewSnapshotEntry>(row.crew_snapshot);
    const hit = crew.find((c) => personNamesMatch(c.name, directorName));
    if (hit?.profile_path) {
      return getTmdbProfileUrl(hit.profile_path) ?? NEUTRAL_POSTER;
    }
  }
  return NEUTRAL_POSTER;
}

function tmdbMediaTypeFromRow(row: CinephileStatsRow): 'movie' | 'tv' | undefined {
  const raw = row.tmdb_media_type?.trim();
  if (raw === 'tv' || raw === 'movie') return raw;
  return titleKindFromImdbType(row.title_type) === 'series' ? 'tv' : 'movie';
}

export function cinephileRowToMovie(row: CinephileStatsRow): DashboardMovie {
  const mediaType = tmdbMediaTypeFromRow(row);
  return {
    id: row.movie_id,
    title: row.title,
    year: row.release_year ?? undefined,
    titleKind: titleKindFromImdbType(row.title_type),
    tmdbId: row.tmdb_id ?? undefined,
    tmdbMediaType: mediaType,
    userRating: row.rating,
    genres: row.genres ?? [],
    director: row.directors?.[0],
    posterUrl: resolvePosterUrl(row.poster_path),
    relativeDate: row.date_rated ?? 'Reciente',
    reason:
      row.genres?.[0]
        ? `Por tu interés en ${row.genres[0].toLowerCase()}`
        : undefined,
  };
}

function buildPersonStats(
  rows: CinephileStatsRow[],
  gender: 1 | 2,
): DashboardPersonStat[] {
  const agg: Record<string, { count: number; sum: number; photo: string | null }> = {};

  rows.forEach((row) => {
    const cast = parseSnapshot<TmdbCastSnapshotEntry>(row.cast_snapshot);
    cast.forEach((member) => {
      if (member.gender !== gender) return;
      if (!agg[member.name]) {
        agg[member.name] = { count: 0, sum: 0, photo: member.profile_path };
      }
      agg[member.name].count += 1;
      agg[member.name].sum += row.rating;
      if (!agg[member.name].photo && member.profile_path) {
        agg[member.name].photo = member.profile_path;
      }
    });
  });

  return Object.entries(agg)
    .map(([name, { count, sum, photo }]) => ({
      name,
      count,
      photoUrl: photo ? getTmdbProfileUrl(photo) ?? NEUTRAL_POSTER : NEUTRAL_POSTER,
      _score: actorCompositeScore(sum / count, count),
    }))
    .sort((a, b) => b._score - a._score)
    .map(({ name, count, photoUrl }) => ({ name, count, photoUrl }));
}

function buildRecurringCast(rows: CinephileStatsRow[]): DashboardCastInsight[] {
  const agg: Record<
    string,
    { count: number; sum: number; photo: string | null; gender: number }
  > = {};

  rows.forEach((row) => {
    const cast = parseSnapshot<TmdbCastSnapshotEntry>(row.cast_snapshot);
    cast.forEach((member) => {
      if (!agg[member.name]) {
        agg[member.name] = {
          count: 0,
          sum: 0,
          photo: member.profile_path,
          gender: member.gender,
        };
      }
      agg[member.name].count += 1;
      agg[member.name].sum += row.rating;
      if (!agg[member.name].photo && member.profile_path) {
        agg[member.name].photo = member.profile_path;
      }
    });
  });

  return Object.entries(agg)
    .map(([name, { count, sum, photo, gender }]) => ({
      name,
      count,
      photoUrl: photo ? getTmdbProfileUrl(photo) ?? NEUTRAL_POSTER : NEUTRAL_POSTER,
      roleLabel: gender === 1 ? ('actress' as const) : ('actor' as const),
      _score: actorCompositeScore(sum / count, count),
    }))
    .sort((a, b) => b._score - a._score)
    .slice(0, INSIGHT_CAST_TOP_N)
    .map(({ name, count, photoUrl, roleLabel }) => ({
      name,
      count,
      photoUrl,
      roleLabel,
    }));
}

function buildTitleKindBreakdown(rows: CinephileStatsRow[]): TitleKindBreakdown {
  return {
    movies: buildTitleKindSlice(rows, 'movie'),
    series: buildTitleKindSlice(rows, 'series'),
    episodes: {
      count: rows.filter((r) => titleKindFromImdbType(r.title_type) === 'episode').length,
    },
  };
}

function buildTitleKindSlice(
  rows: CinephileStatsRow[],
  kind: TitleKind,
): TitleKindSlice {
  const subset = rows.filter((r) => titleKindFromImdbType(r.title_type) === kind);
  if (subset.length === 0) {
    return { count: 0, avgRating: 0, screenTimeString: '0h' };
  }
  const mins = subset.reduce((acc, r) => acc + (r.runtime_mins ?? DEFAULT_RUNTIME), 0);
  const avg = subset.reduce((acc, r) => acc + r.rating, 0) / subset.length;
  return {
    count: subset.length,
    avgRating: Number(avg.toFixed(1)),
    screenTimeString: formatScreenTime(mins),
  };
}

function medianRating(rows: CinephileStatsRow[]): number {
  const sorted = rows.map((r) => r.rating).sort((a, b) => a - b);
  if (sorted.length === 0) return 0;
  const mid = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 0) {
    return Number(((sorted[mid - 1] + sorted[mid]) / 2).toFixed(1));
  }
  return sorted[mid];
}

function getRatingSummary(rows: CinephileStatsRow[]) {
  const high = rows.filter((r) => r.rating >= 8).length;
  const total = rows.length || 1;
  return {
    median: medianRating(rows),
    highPercent: Math.round((high / total) * 100),
    highCount: high,
  };
}

function mapTasteSliceToBlock(
  slice: TitleKindTasteSlice,
  colorOffset: number,
): DashboardGenreTasteBlock {
  const display = genreDisplayPercentagesForSlice(slice).slice(0, 5);
  const topGenres = display.map((g, idx) => ({
    name: g.name,
    count: g.count,
    percentage: g.percentage,
    color: genreColors[(colorOffset + idx) % genreColors.length],
  }));
  const dominantRow = display.find((g) => g.name === slice.dominantByAffinity);
  return {
    dominantName: slice.dominantByAffinity,
    dominantPercent: dominantRow?.percentage ?? topGenres[0]?.percentage ?? 0,
    volumeLeader: slice.dominantByVolume,
    ratingsCount: slice.ratingsCount,
    topGenres,
    criticPersona: {
      label: slice.criticPersona.label,
      detail: slice.criticPersona.detail,
      globalMean: slice.criticPersona.globalMean,
      globalStdDev: slice.criticPersona.globalStdDev,
    },
  };
}

function buildGenreInsight(
  rows: CinephileStatsRow[],
  genreName: string,
  percent: number,
  titleKind?: TitleKind,
): DashboardGenreInsight {
  const scoped =
    titleKind === undefined
      ? rows
      : rows.filter((row) => titleKindFromImdbType(row.title_type) === titleKind);
  const withGenre = scoped.filter((row) => (row.genres ?? []).includes(genreName));
  const samples = withGenre
    .sort((a, b) => b.rating - a.rating || (b.release_year ?? 0) - (a.release_year ?? 0))
    .slice(0, INSIGHT_GENRE_SAMPLES)
    .map((row) => ({
      id: row.movie_id,
      title: row.title,
      year: row.release_year ?? undefined,
      userRating: row.rating,
      posterUrl: resolvePosterUrl(row.poster_path),
      titleKind: titleKindFromImdbType(row.title_type),
      tmdbId: row.tmdb_id ?? undefined,
      tmdbMediaType: tmdbMediaTypeFromRow(row),
    }));

  const highlight = samples
    .slice(0, 3)
    .map((s) => `«${s.title}» (${s.userRating})`)
    .join(', ');

  const explanation = genreAffinityExplanation(
    genreName,
    percent,
    withGenre.length,
    highlight || '—',
  );

  return {
    genre: genreName,
    percent,
    titlesWithGenre: withGenre.length,
    explanation,
    sampleTitles: samples,
  };
}

export function buildDashboardStats(
  rows: CinephileStatsRow[],
  profileOverride?: UserVectorProfile | null,
): DashboardStats {
  if (rows.length === 0) {
    return emptyDashboardStats();
  }

  const movieRows = rowsForMovieKpis(rows);
  const seriesRows = rowsForSeriesKpis(rows);
  const titleKindBreakdown = buildTitleKindBreakdown(rows);
  const profile = profileOverride ?? getUserRecommendationProfile(rows);
  if (!profile) {
    const base = emptyDashboardStats();
    return { ...base, titleKindBreakdown };
  }

  let totalRuntimeEstimate = 0;
  let totalRating = 0;
  const ratingDistribution = Array.from({ length: 10 }, () => 0);
  const ratedDates: string[] = [];
  const releaseYears: number[] = [];
  let pendingEnrichmentCount = 0;
  let withoutPosterCount = 0;

  movieRows.forEach((row) => {
    totalRating += row.rating;
    ratingDistribution[bucketRating(row.rating) - 1] += 1;

    if (row.date_rated) ratedDates.push(row.date_rated);
    if (row.release_year) releaseYears.push(row.release_year);

    totalRuntimeEstimate += row.runtime_mins ?? DEFAULT_RUNTIME;

    const status = row.enrichment_status ?? 'pending';
    if (status === 'pending') pendingEnrichmentCount += 1;
    if (!row.poster_path) withoutPosterCount += 1;
  });

  const avg = Number(profile.globalMean.toFixed(1));
  const bayesDisplay = genreDisplayPercentages(profile);
  const topFiveBayes = bayesDisplay.slice(0, 5);
  const topGenres = topFiveBayes.map((g, idx) => ({
    name: g.name,
    count: g.count,
    percentage: g.percentage,
    color: genreColors[idx % genreColors.length],
  }));

  const dominantGenreName = profile.dominantByBayes;
  const dominantGenrePercent = topGenres[0]?.percentage ?? 0;

  const catalogSinceYear =
    releaseYears.length > 0 ? Math.min(...releaseYears) : null;

  const topDirectors = profile.topDirectors.map((d) => ({
    name: d.name,
    photoUrl: findCrewPhoto(d.name, movieRows),
    avgRating: Number(d.avgRating.toFixed(1)),
    movieCount: d.count,
  }));

  const topActors = buildPersonStats(movieRows, 2);
  const topActresses = buildPersonStats(movieRows, 1);
  const recurringCast = buildRecurringCast(movieRows);
  const genreInsightsByName: Record<string, DashboardGenreInsight> = {};
  for (const g of topGenres) {
    if (g.name === 'Otros') continue;
    genreInsightsByName[g.name] = buildGenreInsight(movieRows, g.name, g.percentage, 'movie');
  }
  const dominantGenreInsight =
    dominantGenreName !== '—' ? genreInsightsByName[dominantGenreName] ?? null : null;

  const moviesRated10 = movieRows
    .filter((row) => row.rating === 10)
    .sort((a, b) => (b.date_rated ?? '').localeCompare(a.date_rated ?? ''))
    .map(cinephileRowToMovie);

  const seriesRated10 = seriesRows
    .filter((row) => row.rating === 10)
    .sort((a, b) => (b.date_rated ?? '').localeCompare(a.date_rated ?? ''))
    .map(cinephileRowToMovie);

  const topDirectorEntry = topDirectors[0];
  const topActorEntry = topActors[0];
  const topRated = [...movieRows].sort((a, b) => b.rating - a.rating)[0];
  const topRatedSeries = [...seriesRows].sort((a, b) => b.rating - a.rating)[0];

  const ratingSummary = getRatingSummary(movieRows);

  return {
    moviesWatched: movieRows.length,
    moviesWatchedDelta: catalogSinceYear
      ? `desde ${catalogSinceYear}`
      : `${movieRows.length} películas`,
    averageRating: avg,
    averageRatingDelta: profile.criticPersona.label,
    screenTimeMinutes: totalRuntimeEstimate,
    screenTimeString: formatScreenTime(totalRuntimeEstimate),
    screenTimeDelta: 'Desde duración IMDb / TMDB',
    topGenres,
    topDirector: {
      name: topDirectorEntry?.name ?? '—',
      photoUrl: topDirectorEntry?.photoUrl ?? NEUTRAL_POSTER,
      rating: topDirectorEntry?.avgRating ?? 0,
    },
    topActor: {
      name: topActorEntry?.name ?? '—',
      photoUrl: topActorEntry?.photoUrl ?? NEUTRAL_POSTER,
      count: topActorEntry?.count ?? 0,
    },
    perfectMovie: {
      title: topRated?.title ?? '—',
      posterUrl: topRated ? resolvePosterUrl(topRated.poster_path) : NEUTRAL_POSTER,
      score: topRated?.rating ?? 0,
    },
    growingGenre: {
      name: dominantGenreName,
      delta: `${dominantGenrePercent}% de tu historial en este género`,
    },
    ratingDistribution,
    dominantGenreName,
    dominantGenrePercent,
    dominantGenreInsight,
    genreInsightsByName,
    titleKindBreakdown,
    recurringCast,
    catalogSinceYear,
    lastUpdatedLabel: formatLastUpdated(ratedDates),
    topDirectors,
    topActors,
    topActresses,
    moviesRated10,
    seriesRated10,
    perfectSeries: {
      title: topRatedSeries?.title ?? '—',
      posterUrl: topRatedSeries ? resolvePosterUrl(topRatedSeries.poster_path) : NEUTRAL_POSTER,
      score: topRatedSeries?.rating ?? 0,
    },
    pendingRecommendations: 0,
    pendingEnrichmentCount,
    withoutPosterCount,
    unenrichedCount: withoutPosterCount,
    ratingSummary,
    globalMean: profile.globalMean,
    globalStdDev: profile.globalStdDev,
    criticPersona: {
      label: profile.criticPersona.label,
      detail: profile.criticPersona.detail,
      globalMean: profile.criticPersona.globalMean,
      globalStdDev: profile.criticPersona.globalStdDev,
    },
    cinephileInsights: buildCinephileInsights(profile).map((i) => ({
      kind: i.kind,
      headline: i.headline,
      detail: i.detail,
      evidence: i.evidence,
    })),
    dominantGenreByFrequency: profile.dominantByFrequency,
    genreTaste: {
      movies: profile.moviesTaste ? mapTasteSliceToBlock(profile.moviesTaste, 0) : null,
      series: profile.seriesTaste ? mapTasteSliceToBlock(profile.seriesTaste, 2) : null,
    },
  };
}

export function emptyDashboardStats(): DashboardStats {
  return {
    moviesWatched: 0,
    moviesWatchedDelta: '—',
    averageRating: 0,
    averageRatingDelta: '—',
    screenTimeMinutes: 0,
    screenTimeString: '0h',
    screenTimeDelta: '—',
    topGenres: [],
    topDirector: { name: '—', photoUrl: NEUTRAL_POSTER, rating: 0 },
    topActor: { name: '—', photoUrl: NEUTRAL_POSTER, count: 0 },
    perfectMovie: { title: '—', posterUrl: NEUTRAL_POSTER, score: 0 },
    growingGenre: { name: '—', delta: '—' },
    ratingDistribution: Array.from({ length: 10 }, () => 0),
    dominantGenreName: '—',
    dominantGenrePercent: 0,
    dominantGenreInsight: null,
    genreInsightsByName: {},
    titleKindBreakdown: {
      movies: { count: 0, avgRating: 0, screenTimeString: '0h' },
      series: { count: 0, avgRating: 0, screenTimeString: '0h' },
      episodes: { count: 0 },
    },
    recurringCast: [],
    catalogSinceYear: null,
    lastUpdatedLabel: null,
    topDirectors: [],
    topActors: [],
    topActresses: [],
    moviesRated10: [],
    seriesRated10: [],
    perfectSeries: { title: '—', posterUrl: NEUTRAL_POSTER, score: 0 },
    pendingRecommendations: 0,
    pendingEnrichmentCount: 0,
    withoutPosterCount: 0,
    unenrichedCount: 0,
    ratingSummary: { median: 0, highPercent: 0, highCount: 0 },
    globalMean: 0,
    globalStdDev: 0,
    criticPersona: {
      label: '—',
      detail: '—',
      globalMean: 0,
      globalStdDev: 0,
    },
    cinephileInsights: [],
    dominantGenreByFrequency: '—',
    genreTaste: { movies: null, series: null },
  };
}

export function cinephileRowsToMovies(rows: CinephileStatsRow[]): DashboardMovie[] {
  const sorted = [...rows].sort((a, b) => {
    const da = a.date_rated ?? '';
    const db = b.date_rated ?? '';
    return db.localeCompare(da);
  });

  return sorted.map(cinephileRowToMovie);
}
