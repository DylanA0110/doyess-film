export type DashboardMovie = {
  id: string;
  title: string;
  year?: number;
  rating?: number;
  userRating?: number;
  genres: string[];
  director?: string;
  posterUrl: string;
  backdropUrl?: string;
  overview?: string;
  affinity?: number;
  reason?: string;
  relativeDate?: string;
};

export type DashboardStats = {
  moviesWatched: number;
  moviesWatchedDelta: string;
  averageRating: number;
  averageRatingDelta: string;
  screenTimeMinutes: number;
  screenTimeString: string;
  screenTimeDelta: string;
  topGenres: Array<{ name: string; percentage: number; count: number; color: string }>;
  topDirector: { name: string; photoUrl: string; rating: number };
  topActor: { name: string; photoUrl: string; count: number };
  perfectMovie: { title: string; posterUrl: string; score: number };
  growingGenre: { name: string; delta: string };
};
