import {
  GENRE_AXIS,
  imdbGenreToAxisIndex,
  vectorFromTmdbGenreIds,
} from '@/lib/recommendation/genre-axis';
import {
  adaptiveShrinkageM,
  bayesianAverage,
  cosineSimilarity,
  l2Normalize,
  mean,
  percentile,
  softmaxDistribution,
  stdDev,
  zScore,
} from '@/lib/recommendation/math';
import { consistencyLabel } from '@/lib/recommendation/format-user-copy';
import {
  ALGORITHM_VERSION,
  BAYES_M_DIRECTOR,
  BAYES_M_GENRE,
  type CriticPersona,
  type DirectorBayesianStat,
  type GenreBayesianStat,
  type TitleKindTasteSlice,
  type UserRating,
  type UserVectorProfile,
} from '@/lib/recommendation/types';
export function buildCriticPersona(globalMean: number, globalStdDev: number): CriticPersona {
  let label = 'Equilibrado';
  let detail = `Tu media es ${globalMean.toFixed(1)}/10. ${consistencyLabel(globalStdDev)}`;

  if (globalMean >= 7.8 && globalStdDev < 1.2) {
    label = 'Crítico amable';
    detail = `Tu media es ${globalMean.toFixed(1)}/10: sueles irte a notas altas. Un 7 para ti suele quedar corto.`;
  } else if (globalMean < 6.5) {
    label = 'Exigente';
    detail = `Tu media es ${globalMean.toFixed(1)}/10: pocos títulos superan tu listón.`;
  } else if (globalStdDev >= 1.5) {
    label = 'De contrastes';
    detail = `Tu media es ${globalMean.toFixed(1)}/10. ${consistencyLabel(globalStdDev)}`;
  } else if (globalStdDev < 0.6) {
    label = 'Muy constante';
    detail = `Tu media es ${globalMean.toFixed(1)}/10. ${consistencyLabel(globalStdDev)}`;
  }

  return { label, globalMean, globalStdDev, detail };
}

function buildGenreStatsForRatings(
  ratings: UserRating[],
  sampleMean: number,
  sampleStd: number,
  mGenre: number,
): GenreBayesianStat[] {
  type GenreAgg = { sumRating: number; sumZ: number; count: number };
  const genreAgg: Record<string, GenreAgg> = {};

  for (const row of ratings) {
    const z = zScore(row.rating, sampleMean, sampleStd);
    for (const g of row.genres) {
      if (!genreAgg[g]) genreAgg[g] = { sumRating: 0, sumZ: 0, count: 0 };
      genreAgg[g].sumRating += row.rating;
      genreAgg[g].sumZ += z;
      genreAgg[g].count += 1;
    }
  }

  const genreStats: GenreBayesianStat[] = Object.entries(genreAgg).map(([name, agg]) => {
    const meanRating = agg.sumRating / agg.count;
    const meanZ = agg.sumZ / agg.count;
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

/** Perfil de gustos para un subconjunto (p. ej. solo series); no mezcla con KPIs de cine. */
export function buildTasteSliceForRatings(ratings: UserRating[]): TitleKindTasteSlice | null {
  if (ratings.length === 0) return null;

  const allRatings = ratings.map((r) => r.rating);
  const kindMean = mean(allRatings);
  const kindStd = stdDev(allRatings);
  const mGenre = adaptiveShrinkageM(ratings.length, BAYES_M_GENRE);
  const genreStats = buildGenreStatsForRatings(ratings, kindMean, kindStd, mGenre);

  genreStats.sort((a, b) => b.count - a.count);
  genreStats.forEach((g, i) => {
    g.frequencyRank = i + 1;
  });
  const byBayes = [...genreStats].sort((a, b) => b.bayesianScore - a.bayesianScore);
  byBayes.forEach((g, i) => {
    const ref = genreStats.find((x) => x.name === g.name);
    if (ref) ref.bayesianRank = i + 1;
  });

  const sortedByBayes = [...genreStats].sort((a, b) => b.bayesianScore - a.bayesianScore);
  const sortedByFreq = [...genreStats].sort((a, b) => b.count - a.count);

  return {
    criticPersona: buildCriticPersona(kindMean, kindStd),
    genreStats: sortedByBayes,
    dominantByAffinity: sortedByBayes[0]?.name ?? '—',
    dominantByVolume: sortedByFreq[0]?.name ?? '—',
    ratingsCount: ratings.length,
  };
}

export function genreDisplayPercentagesForSlice(
  slice: TitleKindTasteSlice,
): Array<{ name: string; percentage: number; count: number; meanRating: number }> {
  const weights = softmaxDistribution(slice.genreStats.map((g) => g.meanZ));
  return slice.genreStats.map((g, i) => ({
    name: g.name,
    percentage: Math.round((weights[i] ?? 0) * 100),
    count: g.count,
    meanRating: Number(g.meanRating.toFixed(1)),
  }));
}

export function buildUserVectorProfile(ratings: UserRating[]): UserVectorProfile | null {
  if (ratings.length === 0) return null;

  const allRatings = ratings.map((r) => r.rating);
  const globalMean = mean(allRatings);
  const globalStdDev = stdDev(allRatings);
  const mGenre = adaptiveShrinkageM(ratings.length, BAYES_M_GENRE);
  const mDirector = adaptiveShrinkageM(ratings.length, BAYES_M_DIRECTOR);

  type DirectorAgg = { sumZ: number; sumRating: number; count: number };
  const directorAgg: Record<string, DirectorAgg> = {};

  for (const row of ratings) {
    const z = zScore(row.rating, globalMean, globalStdDev);
    for (const d of row.directors) {
      if (!directorAgg[d]) directorAgg[d] = { sumZ: 0, sumRating: 0, count: 0 };
      directorAgg[d].sumZ += z;
      directorAgg[d].sumRating += row.rating;
      directorAgg[d].count += 1;
    }
  }

  const genreStats = buildGenreStatsForRatings(ratings, globalMean, globalStdDev, mGenre);

  genreStats.sort((a, b) => b.count - a.count);
  genreStats.forEach((g, i) => {
    g.frequencyRank = i + 1;
  });
  const byBayes = [...genreStats].sort((a, b) => b.bayesianScore - a.bayesianScore);
  byBayes.forEach((g, i) => {
    const ref = genreStats.find((x) => x.name === g.name);
    if (ref) ref.bayesianRank = i + 1;
  });

  const rawVector = new Array<number>(GENRE_AXIS.length).fill(0);
  for (const stat of genreStats) {
    const idx = imdbGenreToAxisIndex(stat.name);
    if (idx != null) rawVector[idx] = Math.max(0, stat.bayesianScore);
  }
  const genreVector = l2Normalize(rawVector);

  const sortedByBayes = [...genreStats].sort((a, b) => b.bayesianScore - a.bayesianScore);
  const sortedByFreq = [...genreStats].sort((a, b) => b.count - a.count);
  const dominantByBayes = sortedByBayes[0]?.name ?? '—';
  const dominantByFrequency = sortedByFreq[0]?.name ?? '—';
  const topGenreNames = sortedByBayes.slice(0, 3).map((g) => g.name);

  const directorStats: DirectorBayesianStat[] = Object.entries(directorAgg).map(
    ([name, agg]) => {
      const meanZ = agg.sumZ / agg.count;
      const avgRating = agg.sumRating / agg.count;
      const bayesianScore = bayesianAverage(agg.count, mDirector, meanZ, 0);
      return { name, count: agg.count, meanZ, bayesianScore, avgRating };
    },
  );
  const topDirectors = directorStats
    .filter((d) => d.count >= 2 || d.avgRating >= 9)
    .sort((a, b) => b.bayesianScore - a.bayesianScore)
    .slice(0, 5);

  const likedYears = ratings
    .filter((r) => r.rating >= 7 && r.releaseYear)
    .map((r) => r.releaseYear as number)
    .sort((a, b) => a - b);
  const allYears = ratings
    .filter((r) => r.releaseYear)
    .map((r) => r.releaseYear as number)
    .sort((a, b) => a - b);
  const baseYears = likedYears.length >= 8 ? likedYears : allYears;
  const yearMin =
    baseYears.length > 0 ? Math.max(1950, percentile(baseYears, 0.12) - 2) : 1970;
  const yearMax =
    baseYears.length > 0
      ? Math.min(new Date().getFullYear(), percentile(baseYears, 0.88) + 2)
      : new Date().getFullYear();

  const minVoteAverage =
    globalMean >= 7.5 ? 7.4 : globalMean >= 6.5 ? 7.0 : 6.6;

  const seeds = ratings
    .filter((r) => r.imdbId && r.rating >= 9)
    .sort(
      (a, b) =>
        b.rating - a.rating || (b.releaseYear ?? 0) - (a.releaseYear ?? 0),
    )
    .slice(0, 3)
    .map((r) => r.imdbId!);
  if (seeds.length === 0) {
    ratings
      .filter((r) => r.imdbId && r.rating >= 8)
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 2)
      .forEach((r) => seeds.push(r.imdbId!));
  }

  const moviesTaste = buildTasteSliceForRatings(ratings);

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
    ratingsCount: ratings.length,
    moviesTaste,
    seriesTaste: null,
    keywordVector: {},
    topKeywords: [],
  };
}

/** Porcentajes de visualización para gráficos (suman ~100) */
export function genreDisplayPercentages(profile: UserVectorProfile): Array<{
  name: string;
  percentage: number;
  count: number;
}> {
  const weights = softmaxDistribution(profile.genreStats.map((g) => g.meanZ));
  return profile.genreStats.map((g, i) => ({
    name: g.name,
    percentage: Math.round((weights[i] ?? 0) * 100),
    count: g.count,
  }));
}

export function titleGenreAffinity(
  profile: UserVectorProfile,
  imdbGenres: string[],
): number {
  const ids: number[] = [];
  for (const g of imdbGenres) {
    const idx = imdbGenreToAxisIndex(g);
    if (idx != null) ids.push(GENRE_AXIS[idx].tmdbId);
  }
  const m = vectorFromTmdbGenreIds(ids);
  return cosineSimilarity(profile.genreVector, m);
}
