import {
  GENRE_AXIS,
  imdbGenreToAxisIndex,
} from '@/lib/recommendation/genre-axis';
import {
  adaptiveShrinkageM,
  bayesianAverage,
  daysSinceDate,
  exponentialTimeDecayWeight,
  l2Normalize,
  mean,
  percentile,
  stdDev,
  zScore,
} from '@/lib/recommendation/math';
import {
  keywordIdf,
  l2NormalizeSparse,
  slugifyKeyword,
  topKeysByWeight,
} from '@/lib/recommendation/keyword-idf';
import {
  buildCriticPersona,
  buildTasteSliceForRatings,
} from '@/lib/recommendation/build-user-profile';
import {
  ALGORITHM_VERSION,
  BAYES_M_DIRECTOR,
  BAYES_M_GENRE,
  type DirectorBayesianStat,
  type GenreBayesianStat,
  type UserRating,
  type UserVectorProfile,
} from '@/lib/recommendation/types';

const Z_KEYWORD_THRESHOLD = 0.5;
/** Evita que una sola calificación reciente (ej. anime) domine carriles por keywords. */
const RECENT_KEYWORD_DAMPEN_DAYS = 21;
const RECENT_KEYWORD_MIN_BLEND = 0.35;

function recommendationRatings(ratings: UserRating[]): UserRating[] {
  return ratings.filter((r) => r.titleKind === 'movie' || r.titleKind === 'series');
}

function buildGenreStatsWithDecay(
  ratings: UserRating[],
  sampleMean: number,
  sampleStd: number,
  mGenre: number,
  now: Date,
): GenreBayesianStat[] {
  type GenreAgg = { sumRating: number; sumZ: number; weightSum: number; count: number };
  const genreAgg: Record<string, GenreAgg> = {};

  for (const row of ratings) {
    const z = zScore(row.rating, sampleMean, sampleStd);
    const decay = exponentialTimeDecayWeight(daysSinceDate(row.dateRated, now));
    const zWeighted = z * decay;
    for (const g of row.genres) {
      if (!genreAgg[g]) genreAgg[g] = { sumRating: 0, sumZ: 0, weightSum: 0, count: 0 };
      genreAgg[g].sumRating += row.rating;
      genreAgg[g].sumZ += zWeighted;
      genreAgg[g].weightSum += decay;
      genreAgg[g].count += 1;
    }
  }

  const genreStats: GenreBayesianStat[] = Object.entries(genreAgg).map(([name, agg]) => {
    const meanRating = agg.sumRating / agg.count;
    const meanZ = agg.weightSum > 0 ? agg.sumZ / agg.weightSum : agg.sumZ / agg.count;
    return {
      name,
      count: agg.count,
      meanRating,
      meanZ,
      bayesianScore: bayesianAverage(agg.count, mGenre, meanZ, 0),
      frequencyRank: 0,
      bayesianRank: 0,
    };
  });

  genreStats.sort((a, b) => b.count - a.count);
  genreStats.forEach((g, i) => {
    g.frequencyRank = i + 1;
  });
  const byBayes = [...genreStats].sort((a, b) => b.bayesianScore - a.bayesianScore);
  byBayes.forEach((g, i) => {
    const ref = genreStats.find((x) => x.name === g.name);
    if (ref) ref.bayesianRank = i + 1;
  });

  return genreStats;
}

function buildKeywordVector(
  ratings: UserRating[],
  sampleMean: number,
  sampleStd: number,
  now: Date,
): { keywordVector: Record<string, number>; topKeywords: string[] } {
  const tf: Record<string, number> = {};
  const docFreq: Record<string, number> = {};
  let corpusSize = 0;

  for (const row of ratings) {
    const z = zScore(row.rating, sampleMean, sampleStd);
    const days = daysSinceDate(row.dateRated, now);
    const decay = exponentialTimeDecayWeight(days);
    const recencyBlend =
      days < RECENT_KEYWORD_DAMPEN_DAYS
        ? RECENT_KEYWORD_MIN_BLEND +
          (1 - RECENT_KEYWORD_MIN_BLEND) * (days / RECENT_KEYWORD_DAMPEN_DAYS)
        : 1;
    const zWeighted = z * decay * recencyBlend;
    if (zWeighted <= Z_KEYWORD_THRESHOLD) continue;

    const keywords = row.keywords ?? [];
    if (keywords.length === 0) continue;

    corpusSize += 1;
    const seenInDoc = new Set<string>();
    const countsForDocFreq = days >= 14;
    for (const kw of keywords) {
      const slug = slugifyKeyword(kw);
      if (!slug) continue;
      tf[slug] = (tf[slug] ?? 0) + zWeighted;
      if (!seenInDoc.has(slug)) {
        seenInDoc.add(slug);
        if (countsForDocFreq) {
          docFreq[slug] = (docFreq[slug] ?? 0) + 1;
        }
      }
    }
  }

  const weighted: Record<string, number> = {};
  for (const [slug, termTf] of Object.entries(tf)) {
    const idf = keywordIdf(slug, docFreq[slug] ?? 1, corpusSize);
    weighted[slug] = termTf * idf;
  }

  const keywordVector = l2NormalizeSparse(weighted);
  const ranked = topKeysByWeight(weighted, 12);
  const stable = ranked.filter((slug) => (docFreq[slug] ?? 0) >= 2);
  const topKeywords = stable.length > 0 ? stable : ranked.slice(0, 4);
  return { keywordVector, topKeywords };
}

/** Perfil central v3: keywords TF-IDF + agregados de género/director con time decay. */
export function buildUserRecommendationProfile(
  ratings: UserRating[],
  now: Date = new Date(),
): UserVectorProfile | null {
  const scoped = recommendationRatings(ratings);
  if (scoped.length === 0) return null;

  const allRatings = scoped.map((r) => r.rating);
  const globalMean = mean(allRatings);
  const globalStdDev = stdDev(allRatings);
  const mGenre = adaptiveShrinkageM(scoped.length, BAYES_M_GENRE);
  const mDirector = adaptiveShrinkageM(scoped.length, BAYES_M_DIRECTOR);

  type DirectorAgg = { sumZ: number; sumRating: number; weightSum: number; count: number };
  const directorAgg: Record<string, DirectorAgg> = {};

  for (const row of scoped) {
    const z = zScore(row.rating, globalMean, globalStdDev);
    const decay = exponentialTimeDecayWeight(daysSinceDate(row.dateRated, now));
    const zWeighted = z * decay;
    for (const d of row.directors) {
      if (!directorAgg[d]) directorAgg[d] = { sumZ: 0, sumRating: 0, weightSum: 0, count: 0 };
      directorAgg[d].sumZ += zWeighted;
      directorAgg[d].sumRating += row.rating;
      directorAgg[d].weightSum += decay;
      directorAgg[d].count += 1;
    }
  }

  const genreStats = buildGenreStatsWithDecay(scoped, globalMean, globalStdDev, mGenre, now);
  const sortedByBayes = [...genreStats].sort((a, b) => b.bayesianScore - a.bayesianScore);
  const sortedByFreq = [...genreStats].sort((a, b) => b.count - a.count);

  const rawVector = new Array<number>(GENRE_AXIS.length).fill(0);
  for (const stat of genreStats) {
    const idx = imdbGenreToAxisIndex(stat.name);
    if (idx != null) rawVector[idx] = Math.max(0, stat.bayesianScore);
  }
  const genreVector = l2Normalize(rawVector);

  const directorStats: DirectorBayesianStat[] = Object.entries(directorAgg).map(
    ([name, agg]) => {
      const meanZ = agg.weightSum > 0 ? agg.sumZ / agg.weightSum : agg.sumZ / agg.count;
      const avgRating = agg.sumRating / agg.count;
      const bayesianScore = bayesianAverage(agg.count, mDirector, meanZ, 0);
      return { name, count: agg.count, meanZ, bayesianScore, avgRating };
    },
  );
  const topDirectors = directorStats
    .filter((d) => d.count >= 2 || d.avgRating >= 9)
    .sort((a, b) => b.bayesianScore - a.bayesianScore)
    .slice(0, 5);

  const dominantByBayes = sortedByBayes[0]?.name ?? '—';
  const dominantByFrequency = sortedByFreq[0]?.name ?? '—';
  const topGenreNames = sortedByBayes.slice(0, 3).map((g) => g.name);

  const likedYears = scoped
    .filter((r) => r.rating >= 7 && r.releaseYear)
    .map((r) => r.releaseYear as number)
    .sort((a, b) => a - b);
  const allYears = scoped
    .filter((r) => r.releaseYear)
    .map((r) => r.releaseYear as number)
    .sort((a, b) => a - b);
  const baseYears = likedYears.length >= 8 ? likedYears : allYears;
  const yearMin =
    baseYears.length > 0 ? Math.max(1950, percentile(baseYears, 0.12) - 2) : 1970;
  const yearMax =
    baseYears.length > 0
      ? Math.min(now.getFullYear(), percentile(baseYears, 0.88) + 2)
      : now.getFullYear();

  const minVoteAverage =
    globalMean >= 7.5 ? 7.4 : globalMean >= 6.5 ? 7.0 : 6.6;

  const seeds = scoped
    .filter((r) => r.imdbId && r.rating >= 9)
    .sort(
      (a, b) =>
        b.rating - a.rating || (b.releaseYear ?? 0) - (a.releaseYear ?? 0),
    )
    .slice(0, 3)
    .map((r) => r.imdbId!);
  if (seeds.length === 0) {
    scoped
      .filter((r) => r.imdbId && r.rating >= 8)
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 2)
      .forEach((r) => seeds.push(r.imdbId!));
  }

  const { keywordVector, topKeywords } = buildKeywordVector(
    scoped,
    globalMean,
    globalStdDev,
    now,
  );

  const movieRatings = scoped.filter((r) => r.titleKind === 'movie');
  const seriesRatings = scoped.filter((r) => r.titleKind === 'series');

  return {
    algorithmVersion: ALGORITHM_VERSION,
    globalMean,
    globalStdDev,
    criticPersona: buildCriticPersona(globalMean, globalStdDev),
    genreVector,
    genreStats: sortedByBayes,
    dominantByBayes,
    dominantByFrequency,
    topGenreNames: topGenreNames.length > 0 ? topGenreNames : [dominantByBayes],
    topDirectors,
    yearMin,
    yearMax,
    minVoteAverage,
    seedImdbIds: seeds,
    ratingsCount: scoped.length,
    moviesTaste: buildTasteSliceForRatings(movieRatings),
    seriesTaste: buildTasteSliceForRatings(seriesRatings),
    keywordVector,
    topKeywords,
  };
}
