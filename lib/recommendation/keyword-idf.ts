/** Keywords TMDB muy genéricas — IDF global bajo (penalización fuerte). */
export const GENERIC_KEYWORD_SLUGS = new Set([
  'based-on-novel',
  'based-on-comic',
  'based-on-true-story',
  'murder',
  'death',
  'love',
  'friendship',
  'revenge',
  'family',
  'violence',
  'sequel',
  'holiday',
  'christmas',
  'duringcreditsstinger',
  'aftercreditsstinger',
]);

const GENERIC_IDF = 0.15;
const DEFAULT_LOCAL_BASE = 1;

export function slugifyKeyword(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * IDF híbrido: global estático para genéricas; local log((N+1)/(df+1)) para el resto.
 */
export function keywordIdf(slug: string, documentFrequency: number, corpusSize: number): number {
  if (GENERIC_KEYWORD_SLUGS.has(slug)) return GENERIC_IDF;
  const N = Math.max(corpusSize, 1);
  const df = Math.max(documentFrequency, 0);
  return DEFAULT_LOCAL_BASE + Math.log((N + 1) / (df + 1));
}

export function sparseVectorFromKeywords(
  keywords: string[],
  weightPerKeyword = 1,
): Record<string, number> {
  const vec: Record<string, number> = {};
  for (const kw of keywords) {
    const slug = slugifyKeyword(kw);
    if (!slug) continue;
    vec[slug] = (vec[slug] ?? 0) + weightPerKeyword;
  }
  return vec;
}

export function l2NormalizeSparse(vec: Record<string, number>): Record<string, number> {
  let norm = 0;
  for (const v of Object.values(vec)) norm += v * v;
  norm = Math.sqrt(norm);
  if (norm === 0) return {};
  const out: Record<string, number> = {};
  for (const [k, v] of Object.entries(vec)) {
    out[k] = v / norm;
  }
  return out;
}

export function topKeysByWeight(vec: Record<string, number>, n: number): string[] {
  return Object.entries(vec)
    .sort((a, b) => b[1] - a[1])
    .slice(0, n)
    .map(([k]) => k);
}
