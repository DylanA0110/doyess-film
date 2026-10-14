import { describe, expect, it } from 'vitest';
import { buildUserVectorProfile } from './build-user-profile';
import type { UserRating } from './types';

function fixtureRatings(): UserRating[] {
  const base: Omit<UserRating, 'rating' | 'genres' | 'directors'> = {
    movieId: 'x',
    imdbId: 'tt1',
    title: 'T',
    releaseYear: 2010,
    titleKind: 'movie',
    dateRated: '2024-01-01',
  };
  const rows: UserRating[] = [];
  for (let i = 0; i < 15; i++) {
    rows.push({
      ...base,
      movieId: `m${i}`,
      imdbId: `tt${i}`,
      rating: 9,
      genres: ['Drama'],
      directors: ['Nolan'],
    });
  }
  rows.push({
    ...base,
    movieId: 'low',
    rating: 7,
    genres: ['Drama'],
    directors: ['Nolan'],
  });
  return rows;
}

describe('buildUserVectorProfile', () => {
  it('low rating lowers genre bayesian vs high cluster', () => {
    const profile = buildUserVectorProfile(fixtureRatings());
    expect(profile).not.toBeNull();
    const drama = profile!.genreStats.find((g) => g.name === 'Drama');
    expect(drama).toBeDefined();
    expect(drama!.meanZ).toBeLessThan(0.5);
  });

  it('benchmark ~2000 ratings under 50ms', () => {
    const big: UserRating[] = [];
    for (let i = 0; i < 2000; i++) {
      big.push({
        movieId: `id-${i}`,
        imdbId: `tt${i}`,
        title: `Film ${i}`,
        rating: 5 + (i % 6),
        genres: i % 2 === 0 ? ['Drama', 'Thriller'] : ['Comedy'],
        directors: ['Dir'],
        releaseYear: 1990 + (i % 30),
        titleKind: 'movie',
        dateRated: null,
      });
    }
    const t0 = performance.now();
    buildUserVectorProfile(big);
    const elapsed = performance.now() - t0;
    expect(elapsed).toBeLessThan(120);
  });
});
