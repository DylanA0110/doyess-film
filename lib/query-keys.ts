export const queryKeys = {
  dashboard: (userId: string) => ['dashboard', userId] as const,
  cinephileStats: (userId: string) => ['cinephile-stats', userId] as const,
  tasteProfile: (userId: string) => ['taste-profile', userId] as const,
  mediaSearch: (query: string) => ['media-search', query] as const,
  mediaDetail: (mediaType: 'movie' | 'tv', tmdbId: number) =>
    ['media-detail', mediaType, tmdbId] as const,
  explore: (userId: string) => ['explore', userId] as const,
};
