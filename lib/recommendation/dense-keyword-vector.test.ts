import { describe, expect, it } from 'vitest';
import {
  KEYWORD_VECTOR_DIM,
  keywordsListToDense,
  sparseToDense,
  vectorToPg,
} from '@/lib/recommendation/dense-keyword-vector';

describe('dense-keyword-vector', () => {
  it('produces fixed dimension', () => {
    const dense = sparseToDense({ thriller: 0.8, noir: 0.3 });
    expect(dense).toHaveLength(KEYWORD_VECTOR_DIM);
  });

  it('normalizes to unit length', () => {
    const dense = keywordsListToDense(['drama', 'crime', 'drama']);
    const norm = Math.sqrt(dense.reduce((s, v) => s + v * v, 0));
    expect(norm).toBeCloseTo(1, 5);
  });

  it('formats pgvector literal', () => {
    expect(vectorToPg([0.1, 0.2])).toBe('[0.1,0.2]');
  });
});
