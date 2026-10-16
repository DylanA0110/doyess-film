import type { DailyPickResult } from '@/components/dashboard/types';
import type { CinephileStatsRow } from '@/lib/imdb/build-dashboard-stats';
import { resolvePosterUrl } from '@/lib/imdb/poster-url';
import {
  getRecommendedLane,
  type RankedLaneItem,
} from '@/lib/recommendation/lanes/get-recommended-lane';
import {
  fromTmdbMovieListItem,
  fromTmdbTvListItem,
  type MediaRef,
  type TmdbMovieListShape,
  type TmdbTvListShape,
} from '@/lib/recommendation/media-candidate';
import { scoreCandidate, scoreCandidatePartial } from '@/lib/recommendation/score-candidate';
import type { UserVectorProfile } from '@/lib/recommendation/types';
import { HIDDEN_GEM_VOTE_MAX } from '@/lib/recommendation/types';
import { buildSeenMediaSet } from '@/lib/recommendation/seen-media';
import { discoverMediaForTaste } from '@/lib/tmdb/discover-media';
import { fetchTmdbKeywords, mapWithConcurrency, searchTmdbKeywordId } from '@/lib/tmdb/keywords';
import { mediaCandidateFromDetail } from '@/lib/recommendation/candidate-from-detail';
import { fetchTmdbMediaDetail } from '@/lib/tmdb/media-detail';
import {
  computeDisplayAffinity,
  formatExploreMatchBadge,
  slugToDisplayLabel,
  tmdbGenreIdsToImdbLabels,
} from '@/lib/recommendation/format-explore-match';
import { buildCinephileInsights } from '@/lib/recommendation/build-cinephile-insights';
import { genreDisplayPercentages } from '@/lib/recommendation/build-user-profile';
import { candidateMatchesLaneGenre } from '@/lib/recommendation/lane-genre-match';
import type { TitleKindTasteSlice } from '@/lib/recommendation/types';
import type { MediaCandidate } from '@/lib/recommendation/media-candidate';
import type { SupabaseClient } from '@supabase/supabase-js';

export type ExploreCardItem = {
  mediaRef: MediaRef;
  tmdbId: number;
  mediaType: 'movie' | 'tv';
  title: string;
  year?: number;
  posterUrl: string;
  overview?: string;
  matchBadge: string;
  vibeTags: string[];
  reason: string;
};

export type ExploreLanePayload = {
  id: string;
  eyebrow?: string;
  title: string;
  subtitle?: string;
  items: ExploreCardItem[];
};

export type ExplorePagePayload = {
  hero: {
    item: ExploreCardItem;
    explain: string;
    badgeLabel: string;
  } | null;
  lanes: ExploreLanePayload[];
};

function discoverPageForUser(userId: string): number {
  let h = 0;
  for (let i = 0; i < userId.length; i++) {
    h = (h * 31 + userId.charCodeAt(i)) | 0;
  }
  return 1 + (Math.abs(h) % 3);
}

function rankedToCard(profile: UserVectorProfile, ranked: RankedLaneItem): ExploreCardItem {
  const { candidate, breakdown, reason, finalScore } = ranked;
  const displayAffinity = computeDisplayAffinity(profile, candidate);
  const badge = formatExploreMatchBadge(displayAffinity, finalScore, profile);

  const vibes = breakdown.alignedKeywords.slice(0, 2).map(slugToDisplayLabel);
  if (vibes.length === 0 && candidate.genreLabels.length > 0) {
    vibes.push(...candidate.genreLabels.slice(0, 2));
  } else if (vibes.length === 0 && candidate.tmdbGenreIds.length > 0) {
    vibes.push(...tmdbGenreIdsToImdbLabels(candidate.tmdbGenreIds).slice(0, 2));
  }

  return {
    mediaRef: candidate.mediaRef,
    tmdbId: candidate.tmdbId,
    mediaType: candidate.mediaType,
    title: candidate.displayTitle,
    year: candidate.releaseYear ?? undefined,
    posterUrl: resolvePosterUrl(candidate.posterPath),
    overview: candidate.overview?.trim() || undefined,
    matchBadge: badge.label,
    vibeTags: vibes,
    reason,
  };
}

function takeUnique(
  profile: UserVectorProfile,
  ranked: RankedLaneItem[],
  used: Set<MediaRef>,
  limit: number,
): ExploreCardItem[] {
  const out: ExploreCardItem[] = [];
  for (const row of ranked) {
    const ref = row.candidate.mediaRef;
    if (used.has(ref)) continue;
    used.add(ref);
    out.push(rankedToCard(profile, row));
    if (out.length >= limit) break;
  }
  return out;
}

async function rankDiscoverPool(
  profile: UserVectorProfile,
  seenIds: ReadonlySet<MediaRef>,
  discoverOptions: Parameters<typeof discoverMediaForTaste>[0],
  topN: number,
): Promise<RankedLaneItem[]> {
  const items = await discoverMediaForTaste(discoverOptions);
  const candidates = items.map((item) => {
    const labels = tmdbGenreIdsToImdbLabels(item.genre_ids ?? []);
    return discoverOptions.mediaType === 'tv'
      ? fromTmdbTvListItem(item as TmdbTvListShape, { genreLabels: labels })
      : fromTmdbMovieListItem(item as TmdbMovieListShape, { genreLabels: labels });
  });
  let unseen = candidates.filter((c) => !seenIds.has(c.mediaRef));
  if (discoverOptions.genreName) {
    unseen = unseen.filter((c) => candidateMatchesLaneGenre(discoverOptions.genreName!, c));
  }
  if (unseen.length === 0) return [];

  const partial = [...unseen]
    .map((c) => ({ c, partial: scoreCandidatePartial(profile, c) }))
    .sort((a, b) => b.partial - a.partial)
    .slice(0, 18)
    .map((x) => x.c);

  await mapWithConcurrency(partial, 6, async (candidate) => {
    if (candidate.keywords.length > 0) return candidate;
    const keywords = await fetchTmdbKeywords(candidate.mediaType, candidate.tmdbId);
    candidate.keywords = keywords;
    return candidate;
  });

  return partial
    .map((candidate) => {
      const result = scoreCandidate(profile, candidate);
      return { ...result, candidate };
    })
    .sort((a, b) => b.finalScore - a.finalScore)
    .slice(0, topN);
}

async function laneGenreBayes(
  profile: UserVectorProfile,
  seenIds: ReadonlySet<MediaRef>,
  used: Set<MediaRef>,
  genreName: string,
  page: number,
  supabase?: SupabaseClient,
): Promise<ExploreLanePayload | null> {
  const ranked = await getRecommendedLane(
    { kind: 'genre', genreName, page },
    profile,
    seenIds,
    { topN: 10, mediaTypes: ['movie', 'tv'], supabase },
  );
  const items = takeUnique(profile, ranked, used, 8);
  if (items.length === 0) return null;

  return {
    id: `genre-${genreName.toLowerCase().replace(/\s+/g, '-')}`,
    eyebrow: 'Tus géneros',
    title: `Más ${genreName} para vos`,
    subtitle: 'Según lo que más disfrutás calificar en tu historial',
    items,
  };
}

function seriesGenreFitScore(slice: TitleKindTasteSlice, candidate: MediaCandidate): number {
  const labels =
    candidate.genreLabels.length > 0
      ? candidate.genreLabels
      : tmdbGenreIdsToImdbLabels(candidate.tmdbGenreIds);
  let best = 0;
  for (const label of labels) {
    const stat = slice.genreStats.find(
      (g) => g.name.toLowerCase() === label.toLowerCase(),
    );
    if (stat) best = Math.max(best, stat.bayesianScore);
  }
  return best;
}

async function laneSeries(
  profile: UserVectorProfile,
  seenIds: ReadonlySet<MediaRef>,
  used: Set<MediaRef>,
  page: number,
  supabase?: SupabaseClient,
): Promise<ExploreLanePayload | null> {
  const seriesTaste = profile.seriesTaste;
  if (!seriesTaste || seriesTaste.ratingsCount < 3) return null;

  const seriesTopGenre =
    [...seriesTaste.genreStats]
      .filter((g) => g.name && g.name !== '—' && g.name !== 'Otros')
      .sort((a, b) => b.bayesianScore - a.bayesianScore)[0]?.name ??
    (seriesTaste.dominantByAffinity !== '—' ? seriesTaste.dominantByAffinity : null);

  if (!seriesTopGenre) return null;

  const ranked = await getRecommendedLane(
    { kind: 'genre', genreName: seriesTopGenre, page },
    profile,
    seenIds,
    { topN: 16, mediaTypes: ['tv'], supabase },
  );

  const reordered = [...ranked]
    .filter((r) => candidateMatchesLaneGenre(seriesTopGenre, r.candidate))
    .sort((a, b) => {
      const fitA = seriesGenreFitScore(seriesTaste, a.candidate);
      const fitB = seriesGenreFitScore(seriesTaste, b.candidate);
      if (fitB !== fitA) return fitB - fitA;
      return b.finalScore - a.finalScore;
    });

  const items = takeUnique(profile, reordered, used, 8);
  if (items.length === 0) return null;

  const genreLabel =
    seriesTopGenre.charAt(0).toUpperCase() + seriesTopGenre.slice(1).toLowerCase();

  return {
    id: 'series-for-you',
    eyebrow: 'Series',
    title: 'Series para vos',
    subtitle: `Priorizamos ${genreLabel} y lo que más valorás en series`,
    items,
  };
}

async function laneHiddenGems(
  profile: UserVectorProfile,
  seenIds: ReadonlySet<MediaRef>,
  used: Set<MediaRef>,
  page: number,
): Promise<ExploreLanePayload | null> {
  const genre = profile.topGenreNames[0] ?? 'Drama';
  const ranked = await rankDiscoverPool(
    profile,
    seenIds,
    {
      mediaType: 'movie',
      genreName: genre,
      yearMin: profile.yearMin,
      yearMax: profile.yearMax,
      minVote: Math.max(6.5, profile.minVoteAverage),
      page,
      voteCountMin: 80,
      voteCountMax: HIDDEN_GEM_VOTE_MAX,
      sortBy: 'vote_average.desc',
    },
    12,
  );

  const gems = ranked.filter(
    (r) =>
      r.candidate.voteCount <= HIDDEN_GEM_VOTE_MAX &&
      r.breakdown.hiddenGemMultiplier > 1,
  );
  const items = takeUnique(profile, gems, used, 10);
  if (items.length < 4) return null;

  return {
    id: 'hidden-gems',
    eyebrow: 'Tesoros ocultos',
    title: 'Obras maestras que casi nadie está viendo (pero vos amarás)',
    subtitle: 'Joyas con pocos votos que encajan con tu perfil',
    items,
  };
}

async function laneMicroGenre(
  profile: UserVectorProfile,
  seenIds: ReadonlySet<MediaRef>,
  used: Set<MediaRef>,
  keywordSlug: string,
  titleOverride?: string,
  supabase?: SupabaseClient,
): Promise<ExploreLanePayload | null> {
  const keywordId = await searchTmdbKeywordId(slugToDisplayLabel(keywordSlug));
  if (!keywordId) return null;

  const ranked = await getRecommendedLane(
    { kind: 'keyword', tmdbKeywordId: keywordId, page: 1 },
    profile,
    seenIds,
    { topN: 10, mediaTypes: ['movie', 'tv'], supabase },
  );
  const items = takeUnique(profile, ranked, used, 8);
  if (items.length === 0) return null;

  return {
    id: `vibe-${keywordSlug}`,
    eyebrow: 'Tu vibra',
    title: titleOverride ?? slugToDisplayLabel(keywordSlug),
    subtitle: 'Temas que repetís en lo que más te gusta',
    items,
  };
}

async function laneDirectorCircle(
  profile: UserVectorProfile,
  seenIds: ReadonlySet<MediaRef>,
  used: Set<MediaRef>,
  page: number,
  supabase?: SupabaseClient,
): Promise<ExploreLanePayload | null> {
  const director = profile.topDirectors[0]?.name;
  if (!director) return null;

  const genre = profile.topGenreNames[0] ?? 'Drama';
  const ranked = await getRecommendedLane(
    { kind: 'genre', genreName: genre, page },
    profile,
    seenIds,
    { topN: 16, mediaTypes: ['movie', 'tv'], supabase },
  );

  const boosted = [...ranked].sort((a, b) => {
    const da = a.breakdown.directorBonusNorm;
    const db = b.breakdown.directorBonusNorm;
    if (db !== da) return db - da;
    return b.finalScore - a.finalScore;
  });

  const filtered = boosted.filter(
    (r) =>
      (r.candidate.director?.trim().toLowerCase() ?? '') !== director.trim().toLowerCase(),
  );
  const items = takeUnique(profile, filtered, used, 8);
  if (items.length === 0) return null;

  return {
    id: 'director-circle',
    eyebrow: 'Directores',
    title: `Cine que encaja con cómo valorás a ${director}`,
    subtitle:
      'Mismo tono que tus favoritos suyos; no es una lista solo de su filmografía',
    items,
  };
}

async function laneInsightPattern(
  profile: UserVectorProfile,
  seenIds: ReadonlySet<MediaRef>,
  used: Set<MediaRef>,
  page: number,
  supabase?: SupabaseClient,
): Promise<ExploreLanePayload | null> {
  const insights = buildCinephileInsights(profile);
  const guiltyInsight = insights.find((i) => i.kind === 'guiltyPleasure');
  const guiltyStat = profile.genreStats.find(
    (g) => guiltyInsight?.headline.includes(g.name),
  );
  const genreName = guiltyStat?.name ?? profile.dominantByBayes;

  if (!genreName || genreName === '—') return null;

  const ranked = await getRecommendedLane(
    { kind: 'genre', genreName, page: page + 1 },
    profile,
    seenIds,
    { topN: 10, mediaTypes: ['movie', 'tv'], supabase },
  );
  const items = takeUnique(profile, ranked, used, 6);
  if (items.length === 0) return null;

  return {
    id: 'pattern-lane',
    eyebrow: 'Patrones',
    title: guiltyInsight
      ? `Sorpresas fuera de tu rutina de ${genreName}`
      : `Otra mirada a ${genreName}`,
    subtitle: guiltyInsight?.detail ?? 'Para ampliar lo que ya disfrutás',
    items,
  };
}

async function laneWildcard(
  profile: UserVectorProfile,
  seenIds: ReadonlySet<MediaRef>,
  used: Set<MediaRef>,
  page: number,
): Promise<ExploreLanePayload | null> {
  const ranked = await rankDiscoverPool(
    profile,
    seenIds,
    {
      mediaType: 'movie',
      yearMin: profile.yearMin,
      yearMax: profile.yearMax,
      minVote: 8,
      page,
      voteCountMin: 500,
      sortBy: 'vote_average.desc',
    },
    20,
  );

  const wild = ranked.filter((r) => computeDisplayAffinity(profile, r.candidate) < 0.2);
  const items = takeUnique(profile, wild, used, 8);
  if (items.length === 0) return null;

  return {
    id: 'wildcard',
    eyebrow: 'Desafío',
    title: 'Fuera de tu zona de confort',
    subtitle: 'Películas brillantes que normalmente no verías, pero que la crítica ama',
    items,
  };
}

async function heroFromDailyPick(
  dailyPick: DailyPickResult,
  profile: UserVectorProfile,
): Promise<NonNullable<ExplorePagePayload['hero']>> {
  const detail = await fetchTmdbMediaDetail('movie', dailyPick.tmdbId);
  let reason = dailyPick.reason;
  let item: ExploreCardItem;

  if (detail) {
    const candidate = mediaCandidateFromDetail(detail);
    if (candidate.keywords.length === 0) {
      candidate.keywords = await fetchTmdbKeywords(candidate.mediaType, candidate.tmdbId);
    }
    const scored = scoreCandidate(profile, candidate);
    reason = scored.reason;
    const ranked: RankedLaneItem = { ...scored, candidate };
    item = rankedToCard(profile, ranked);
  } else {
    item = {
      mediaRef: `m_${dailyPick.tmdbId}`,
      tmdbId: dailyPick.tmdbId,
      mediaType: 'movie',
      title: dailyPick.movie.title,
      year: dailyPick.movie.year,
      posterUrl: dailyPick.movie.posterUrl,
      overview: dailyPick.synopsis,
      matchBadge: 'Tu joya del día',
      vibeTags: [],
      reason,
    };
  }

  const explain =
    item.vibeTags.length > 0 && !reason.toLowerCase().includes(item.vibeTags[0].toLowerCase())
      ? `${reason} · ${item.vibeTags.slice(0, 2).join(' · ')}`
      : reason;

  return {
    item,
    explain,
    badgeLabel: item.matchBadge,
  };
}

export async function buildExplorePage(
  profile: UserVectorProfile,
  seenIds: ReadonlySet<MediaRef>,
  supabase: SupabaseClient,
  dailyPick: DailyPickResult | null,
  userId: string,
): Promise<ExplorePagePayload> {
  const used = new Set<MediaRef>();
  const lanes: ExploreLanePayload[] = [];
  const page = discoverPageForUser(userId);

  const topGenres = genreDisplayPercentages(profile)
    .filter((g) => g.name && g.name !== '—' && g.name !== 'Otros' && g.count > 0)
    .sort((a, b) => b.percentage - a.percentage)
    .slice(0, 2)
    .map((g) => g.name);

  for (const genreName of topGenres) {
    const lane = await laneGenreBayes(profile, seenIds, used, genreName, page, supabase);
    if (lane) lanes.push(lane);
  }

  const seriesLane = await laneSeries(profile, seenIds, used, page, supabase);
  if (seriesLane) lanes.push(seriesLane);

  const hidden = await laneHiddenGems(profile, seenIds, used, page);
  if (hidden) lanes.push(hidden);

  const keywordSlugs = profile.topKeywords.slice(0, 2);
  if (keywordSlugs.length >= 2 && keywordSlugs.every((k) => (profile.keywordVector[k] ?? 0) > 0)) {
    const lane = await laneMicroGenre(
      profile,
      seenIds,
      used,
      keywordSlugs[0],
      `${slugToDisplayLabel(keywordSlugs[0])} y ${slugToDisplayLabel(keywordSlugs[1])}`,
      supabase,
    );
    if (lane) lanes.push(lane);
  } else if (keywordSlugs[0]) {
    const lane = await laneMicroGenre(profile, seenIds, used, keywordSlugs[0], undefined, supabase);
    if (lane) lanes.push(lane);
  }

  const directorLane = await laneDirectorCircle(profile, seenIds, used, page, supabase);
  if (directorLane) lanes.push(directorLane);

  const patternLane = await laneInsightPattern(profile, seenIds, used, page, supabase);
  if (patternLane) lanes.push(patternLane);

  const wild = await laneWildcard(profile, seenIds, used, page + 1);
  if (wild) lanes.push(wild);

  const hero = await pickDynamicExploreHero(profile, lanes);
  if (hero) {
    used.add(hero.item.mediaRef);
  }

  return { hero, lanes };
}

/** Hero siempre desde el mejor candidato actual (sin pick diario cacheado). */
async function pickDynamicExploreHero(
  profile: UserVectorProfile,
  lanes: ExploreLanePayload[],
): Promise<ExplorePagePayload['hero'] | null> {
  const seenRefs = new Set<MediaRef>();
  const pool: ExploreCardItem[] = [];
  for (const lane of lanes) {
    for (const item of lane.items.slice(0, 5)) {
      if (seenRefs.has(item.mediaRef)) continue;
      seenRefs.add(item.mediaRef);
      pool.push(item);
    }
  }
  if (pool.length === 0) return null;

  let best: {
    card: ExploreCardItem;
    affinity: number;
    finalScore: number;
    explain: string;
    badge: string;
  } | null = null;

  for (const item of pool) {
    const detail = await fetchTmdbMediaDetail(item.mediaType, item.tmdbId);
    if (!detail) continue;
    const candidate = mediaCandidateFromDetail(detail);
    if (candidate.keywords.length === 0) {
      candidate.keywords = await fetchTmdbKeywords(item.mediaType, item.tmdbId);
    }
    const scored = scoreCandidate(profile, candidate);
    const affinity = computeDisplayAffinity(profile, candidate);
    const card = rankedToCard(profile, { ...scored, candidate });
    const better =
      !best ||
      affinity > best.affinity ||
      (affinity === best.affinity && scored.finalScore > best.finalScore);
    if (better) {
      best = {
        card,
        affinity,
        finalScore: scored.finalScore,
        explain: scored.reason,
        badge: card.matchBadge,
      };
    }
  }

  if (!best) return null;

  const explain =
    best.card.vibeTags.length > 0 &&
    !best.explain.toLowerCase().includes(best.card.vibeTags[0].toLowerCase())
      ? `${best.explain} · ${best.card.vibeTags.slice(0, 2).join(' · ')}`
      : best.explain;

  return {
    item: best.card,
    explain,
    badgeLabel: best.badge,
  };
}

export function exploreContextFromRows(rows: CinephileStatsRow[]) {
  return {
    seenIds: buildSeenMediaSet(rows),
  };
}
