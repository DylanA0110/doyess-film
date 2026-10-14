export type TitleKind = 'movie' | 'series' | 'episode';

export type DashboardMovie = {
  id: string;
  title: string;
  year?: number;
  titleKind?: TitleKind;
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

export type DashboardDirectorStat = {
  name: string;
  photoUrl: string;
  avgRating: number;
  movieCount: number;
};

export type DashboardPersonStat = {
  name: string;
  photoUrl: string;
  count: number;
};

export type DashboardCastInsight = DashboardPersonStat & {
  roleLabel: 'actor' | 'actress';
};

export type TitleKindSlice = {
  count: number;
  avgRating: number;
  screenTimeString: string;
};

export type TitleKindBreakdown = {
  movies: TitleKindSlice;
  series: TitleKindSlice;
  /** Calificaciones de capítulos (fuera de KPIs de cine por ahora). */
  episodes: { count: number };
};

export type DashboardGenreInsight = {
  genre: string;
  percent: number;
  titlesWithGenre: number;
  explanation: string;
  sampleTitles: Array<{
    id: string;
    title: string;
    year?: number;
    userRating: number;
    posterUrl: string;
    titleKind: TitleKind;
  }>;
};

export type ProfileHighlightKind =
  | 'genre'
  | 'ten'
  | 'favoriteMovie'
  | 'favoriteSeries'
  | 'actor'
  | 'director'
  | 'daily';

export type ProfileHighlight = {
  kind: ProfileHighlightKind;
  frontLabel: string;
  backTitle: string;
  kindLabel: string;
  imageUrl: string;
  blurb: string;
  stat?: string;
  roundImage?: boolean;
  openGenreDetail?: boolean;
};

export type DailyPickResult = {
  tmdbId: number;
  tmdbVoteAverage?: number;
  movie: DashboardMovie;
  reason: string;
  synopsis: string;
  dayLabel: { month: string; day: string };
  /** Sugerencia TMDB fuera del CSV calificado */
  unwatched?: boolean;
};

export type CriticPersonaSummary = {
  label: string;
  detail: string;
  globalMean: number;
  globalStdDev: number;
};

export type CinephileInsightSummary = {
  kind: string;
  headline: string;
  detail: string;
  evidence: string;
};

export type DashboardGenreTasteBlock = {
  dominantName: string;
  dominantPercent: number;
  volumeLeader: string;
  ratingsCount: number;
  topGenres: Array<{ name: string; percentage: number; count: number; color: string }>;
  criticPersona: CriticPersonaSummary;
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
  ratingDistribution: number[];
  dominantGenreName: string;
  dominantGenrePercent: number;
  dominantGenreInsight: DashboardGenreInsight | null;
  genreInsightsByName: Record<string, DashboardGenreInsight>;
  titleKindBreakdown: TitleKindBreakdown;
  recurringCast: DashboardCastInsight[];
  catalogSinceYear: number | null;
  lastUpdatedLabel: string | null;
  topDirectors: DashboardDirectorStat[];
  topActors: DashboardPersonStat[];
  topActresses: DashboardPersonStat[];
  moviesRated10: DashboardMovie[];
  pendingRecommendations: number;
  pendingEnrichmentCount: number;
  withoutPosterCount: number;
  /** @deprecated Usa withoutPosterCount */
  unenrichedCount: number;
  ratingSummary: {
    median: number;
    highPercent: number;
    highCount: number;
  };
  globalMean: number;
  globalStdDev: number;
  criticPersona: CriticPersonaSummary;
  cinephileInsights: CinephileInsightSummary[];
  dominantGenreByFrequency: string;
  genreTaste: {
    movies: DashboardGenreTasteBlock | null;
    series: DashboardGenreTasteBlock | null;
  };
};
