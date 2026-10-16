import { describe, expect, it } from 'vitest';
import { fromTmdbMovieListItem } from './media-candidate';
import { scoreCandidate } from './score-candidate';
import type { UserVectorProfile } from './types';

function minimalProfile(overrides?: Partial<UserVectorProfile>): UserVectorProfile {
  return {
    algorithmVersion: 3,
    globalMean: 7,
    globalStdDev: 1,
    criticPersona: { label: 'Test', globalMean: 7, globalStdDev: 1, detail: '' },
    genreVector: [],
    genreStats: [],
    dominantByBayes: 'Drama',
    dominantByFrequency: 'Drama',
    topGenreNames: ['Drama'],
    topDirectors: [{ name: 'Nolan', count: 3, meanZ: 1, bayesianScore: 1, avgRating: 9 }],
    yearMin: 1990,
    yearMax: 2024,
    minVoteAverage: 7,
    seedImdbIds: [],
    ratingsCount: 10,
    moviesTaste: null,
    seriesTaste: null,
    keywordVector: { cyberpunk: 0.8, dystopia: 0.6 },
    topKeywords: ['cyberpunk'],
    ...overrides,
  };
}

describe('scoreCandidate', () => {
  it('clamps final score to 1 after hidden gem', () => {
    const profile = minimalProfile();
    const candidate = fromTmdbMovieListItem(
      {
        id: 1,
        title: 'Test',
        overview: 'x',
        poster_path: null,
        release_date: '2020-01-01',
        vote_average: 9.5,
        vote_count: 500,
      },
      { keywords: ['cyberpunk', 'dystopia'], director: 'Nolan' },
    );
    const result = scoreCandidate(profile, candidate);
    expect(result.finalScore).toBeLessThanOrEqual(1);
    expect(result.breakdown.hiddenGemMultiplier).toBe(1.5);
  });

  it('uses human copy when keyword profile is empty', () => {
    const profile = minimalProfile({ keywordVector: {} });
    const candidate = fromTmdbMovieListItem({
      id: 2,
      title: 'B',
      overview: '',
      poster_path: null,
      release_date: '2019-01-01',
      vote_average: 7,
      vote_count: 5000,
    });
    const result = scoreCandidate(profile, candidate);
    expect(result.reason).not.toMatch(/%/);
    expect(result.reason.toLowerCase()).toMatch(/gusto|onda|encaja/);
  });
});
