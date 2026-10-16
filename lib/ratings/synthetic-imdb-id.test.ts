import { describe, expect, it } from 'vitest';
import {
  isSyntheticImdbId,
  rowsForImportedDisplay,
  syntheticImdbId,
  titleTypeForMedia,
} from '@/lib/ratings/synthetic-imdb-id';

describe('syntheticImdbId', () => {
  it('generates stable ids for movie and tv', () => {
    expect(syntheticImdbId('movie', 42)).toBe('doyess-tmdb-m-42');
    expect(syntheticImdbId('tv', 99)).toBe('doyess-tmdb-t-99');
  });

  it('maps title types', () => {
    expect(titleTypeForMedia('movie')).toBe('movie');
    expect(titleTypeForMedia('tv')).toBe('tvSeries');
  });

  it('detects synthetic ids and prefers imported rows for display', () => {
    expect(isSyntheticImdbId('doyess-tmdb-m-1')).toBe(true);
    expect(isSyntheticImdbId('tt123')).toBe(false);
    const rows = [
      { imdb_id: 'tt1' },
      { imdb_id: 'doyess-tmdb-m-372058' },
    ];
    expect(rowsForImportedDisplay(rows)).toEqual([{ imdb_id: 'tt1' }]);
  });
});
