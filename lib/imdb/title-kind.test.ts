import { describe, expect, it } from 'vitest';
import { rowsForMovieKpis, titleKindFromImdbType } from './title-kind';

describe('titleKindFromImdbType', () => {
  it('separates episodes from series and movies', () => {
    expect(titleKindFromImdbType('TV Episode')).toBe('episode');
    expect(titleKindFromImdbType('tv episodio')).toBe('episode');
    expect(titleKindFromImdbType('TV Series')).toBe('series');
    expect(titleKindFromImdbType('Película')).toBe('movie');
  });

  it('rowsForMovieKpis excludes series and episodes', () => {
    const rows = [
      { title_type: 'movie' },
      { title_type: 'TV Series' },
      { title_type: 'TV Episode' },
    ];
    expect(rowsForMovieKpis(rows)).toHaveLength(1);
  });
});
