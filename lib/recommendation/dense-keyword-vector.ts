import { slugifyKeyword } from '@/lib/recommendation/keyword-idf';
import { l2Normalize } from '@/lib/recommendation/math';

/** Dimensión fija para pgvector (hash de keywords). */
export const KEYWORD_VECTOR_DIM = 256;

function bucketIndex(slug: string): number {
  let hash = 0;
  for (let i = 0; i < slug.length; i += 1) {
    hash = (hash * 31 + slug.charCodeAt(i)) >>> 0;
  }
  return hash % KEYWORD_VECTOR_DIM;
}

export function sparseToDense(sparse: Record<string, number>): number[] {
  const dense = new Array<number>(KEYWORD_VECTOR_DIM).fill(0);
  for (const [key, weight] of Object.entries(sparse)) {
    if (!Number.isFinite(weight) || weight === 0) continue;
    const slug = slugifyKeyword(key);
    dense[bucketIndex(slug)] += weight;
  }
  return l2Normalize(dense);
}

export function keywordsListToDense(keywords: string[]): number[] {
  const sparse: Record<string, number> = {};
  for (const kw of keywords) {
    const slug = slugifyKeyword(kw);
    if (!slug) continue;
    sparse[slug] = (sparse[slug] ?? 0) + 1;
  }
  return sparseToDense(sparse);
}

/** Formato aceptado por columna `vector` de Supabase/pgvector. */
export function vectorToPg(values: number[]): string {
  return `[${values.map((v) => Number(v.toFixed(6))).join(',')}]`;
}
