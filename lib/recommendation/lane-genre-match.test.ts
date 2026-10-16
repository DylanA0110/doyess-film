import { describe, expect, it } from 'vitest';
import { fromTmdbMovieListItem } from '@/lib/recommendation/media-candidate';
import { candidateMatchesLaneGenre } from '@/lib/recommendation/lane-genre-match';
import { tmdbGenreIdFromImdbLabel } from '@/lib/tmdb/imdb-genre-to-tmdb';

describe('lane genre matching', () => {
  it('maps Suspense to TMDB Thriller', () => {
    expect(tmdbGenreIdFromImdbLabel('Suspense')).toBe(53);
  });

  it('rejects pure romance in Suspense lane', () => {
    const pride = fromTmdbMovieListItem(
      {
        id: 4348,
        title: 'Pride & Prejudice',
        overview: 'x',
        poster_path: '/p',
        release_date: '2005-01-01',
        vote_average: 8,
        vote_count: 5000,
        genre_ids: [18, 10749],
      },
      { genreLabels: ['Drama', 'Romance'] },
    );
    expect(candidateMatchesLaneGenre('Suspense', pride)).toBe(false);
  });

  it('accepts thriller in Suspense lane', () => {
    const se7en = fromTmdbMovieListItem(
      {
        id: 807,
        title: 'Se7en',
        overview: 'x',
        poster_path: '/p',
        release_date: '1995-01-01',
        vote_average: 8.3,
        vote_count: 9000,
        genre_ids: [53, 80, 18],
      },
      { genreLabels: ['Thriller', 'Crime', 'Drama'] },
    );
    expect(candidateMatchesLaneGenre('Suspense', se7en)).toBe(true);
  });
});
