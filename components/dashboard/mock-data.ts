import type { DashboardMovie, DashboardStats } from './types';

export const initialStats: DashboardStats = {
  moviesWatched: 256,
  moviesWatchedDelta: '+12 este mes',
  averageRating: 7.8,
  averageRatingDelta: '+0.3 este mes',
  screenTimeMinutes: 41000,
  screenTimeString: '41k mins',
  screenTimeDelta: '+18% este mes',
  topGenres: [
    { name: 'Ciencia ficción', percentage: 22, count: 56, color: '#8A0201' },
    { name: 'Drama', percentage: 18, count: 46, color: '#5B1E31' },
    { name: 'Thriller', percentage: 16, count: 41, color: '#C80000' },
    { name: 'Acción', percentage: 14, count: 36, color: '#801818' },
    { name: 'Suspense', percentage: 10, count: 25, color: '#D97706' },
    { name: 'Otros', percentage: 20, count: 52, color: '#52525B' },
  ],
  topDirector: {
    name: 'Christopher Nolan',
    photoUrl: 'https://image.tmdb.org/t/p/w185/xuAIuYSmsUzKlUMBFGVZaWsY3DZ.jpg',
    rating: 8.9,
  },
  topActor: {
    name: 'Leonardo DiCaprio',
    photoUrl: 'https://image.tmdb.org/t/p/w185/wo2hJpn04vbtmh0B9utCFdsQhxM.jpg',
    count: 14,
  },
  perfectMovie: {
    title: 'Interstellar',
    posterUrl: 'https://image.tmdb.org/t/p/w342/yQvGrMoipbRoddT0ZR8tPoR7NfX.jpg',
    score: 10,
  },
  growingGenre: {
    name: 'Thriller',
    delta: '+12%',
  },
  ratingDistribution: [2, 4, 8, 12, 18, 24, 32, 28, 14, 6],
  dominantGenreName: 'Thriller',
  dominantGenrePercent: 32,
  catalogSinceYear: 2014,
  lastUpdatedLabel: '12 oct. 2026, 14:32',
  topDirectors: [
    {
      name: 'Christopher Nolan',
      photoUrl: 'https://image.tmdb.org/t/p/w185/xuAIuYSmsUzKlUMBFGVZaWsY3DZ.jpg',
      avgRating: 8.6,
      movieCount: 12,
    },
    {
      name: 'Martin Scorsese',
      photoUrl: 'https://image.tmdb.org/t/p/w185/wo2hJpn04vbtmh0B9utCFdsQhxM.jpg',
      avgRating: 8.4,
      movieCount: 9,
    },
    {
      name: 'David Fincher',
      photoUrl: 'https://image.tmdb.org/t/p/w185/xuAIuYSmsUzKlUMBFGVZaWsY3DZ.jpg',
      avgRating: 8.2,
      movieCount: 7,
    },
  ],
  pendingRecommendations: 42,
  topActors: [
    {
      name: 'Leonardo DiCaprio',
      photoUrl: 'https://image.tmdb.org/t/p/w185/wo2hJpn04vbtmh0B9utCFdsQhxM.jpg',
      count: 14,
    },
    {
      name: 'Tom Hardy',
      photoUrl: 'https://image.tmdb.org/t/p/w185/n3UilIEdA0J2e1iEkmTtHmIqEW.jpg',
      count: 9,
    },
  ],
  topActresses: [
    {
      name: 'Cate Blanchett',
      photoUrl: 'https://image.tmdb.org/t/p/w185/1ckL8b2Bb6soyjKu3TPHU2w6Yg.jpg',
      count: 8,
    },
  ],
  moviesRated10: [
    {
      id: 'mock-10',
      title: 'Interstellar',
      year: 2014,
      genres: ['Ciencia ficción', 'Drama'],
      posterUrl: 'https://image.tmdb.org/t/p/w342/yQvGrMoipbRoddT0ZR8tPoR7NfX.jpg',
      userRating: 10,
    },
  ],
  pendingEnrichmentCount: 0,
  withoutPosterCount: 0,
  unenrichedCount: 0,
  ratingSummary: { median: 7.5, highPercent: 62, highCount: 158 },
  genreInsightsByName: {},
  dominantGenreInsight: {
    genre: 'Thriller',
    percent: 32,
    titlesWithGenre: 28,
    explanation:
      'Thriller domina tu perfil porque etiqueta muchas de tus calificaciones recientes y concentra un tercio de tus etiquetas de género.',
    sampleTitles: [],
  },
  titleKindBreakdown: {
    movies: { count: 220, avgRating: 7.9, screenTimeString: '320h' },
    series: { count: 36, avgRating: 8.2, screenTimeString: '48h' },
  },
  recurringCast: [
    {
      name: 'Leonardo DiCaprio',
      photoUrl: 'https://image.tmdb.org/t/p/w185/wo2hJpn04vbtmh0B9utCFdsQhxM.jpg',
      count: 14,
      roleLabel: 'actor',
    },
  ],
};

export const featuredRecommendations: DashboardMovie[] = [
  {
    id: 'rec-1',
    title: 'Blade Runner 2049',
    year: 2017,
    genres: ['Ciencia ficción', 'Drama', 'Thriller'],
    director: 'Denis Villeneuve',
    affinity: 92,
    posterUrl: 'https://image.tmdb.org/t/p/w780/gajva2L0rPYkEWjzgFlBXCAVBE5.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/w1280/gNdLJU9TxrpGx4dkZidjys3fyy0.jpg',
    overview:
      'Treinta años después de los eventos de la primera película, un nuevo blade runner, K, descubre un secreto enterrado que podría sumir a la sociedad en el caos.',
    reason:
      'Te podría gustar porque combina ciencia ficción visualmente impactante, personajes complejos y una atmósfera melancólica, elementos que aparecen frecuentemente en tus películas mejor calificadas.',
  },
  {
    id: 'rec-2',
    title: 'The Prestige',
    year: 2006,
    genres: ['Drama', 'Misterio', 'Ciencia ficción'],
    director: 'Christopher Nolan',
    affinity: 95,
    posterUrl: 'https://image.tmdb.org/t/p/w780/Ag2B2KHKQPukjH7WutmgnnSNurZ.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/w1280/yaExZh6qE2cfyK3o4kAMEq0mkgy.jpg',
    overview:
      'Dos magos victorianos entran en una feroz rivalidad obsesiva tras una tragedia en el escenario, buscando el truco de teletransportación supremo.',
    reason:
      'Recomendada por tu fascinación por la narrativa no lineal de Christopher Nolan y giros psicológicos inesperados.',
  },
  {
    id: 'rec-3',
    title: 'Eternal Sunshine of the Spotless Mind',
    year: 2004,
    genres: ['Romance', 'Ciencia ficción', 'Drama'],
    director: 'Michel Gondry',
    affinity: 90,
    posterUrl: 'https://image.tmdb.org/t/p/w780/5MwkWH9tYHv3mV9OdYTMR5qreIz.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/w1280/95qi5TJMIBI5VzWHia88Pbrye7Z.jpg',
    overview:
      'Una pareja se somete a un procedimiento médico para borrar sus recuerdos mutuos tras una ruptura dolorosa.',
    reason:
      'Destaca por su melancolía introspectiva, similar a Lost in Translation y Arrival en tu historial cinematográfico.',
  },
  {
    id: 'rec-4',
    title: 'Infiltrados',
    year: 2006,
    genres: ['Crimen', 'Drama', 'Suspense'],
    director: 'Martin Scorsese',
    affinity: 94,
    posterUrl: 'https://image.tmdb.org/t/p/w780/nT97ifVT2J1yMQmeq20Qblg61T.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/w1280/6WRrGYalXXveItfpnipYdayFkQB.jpg',
    overview:
      'Un policía encubierto y un topo infiltrado en la policía intentan identificarse mutuamente mientras se infiltran en una mafia irlandesa.',
    reason:
      'Encaja con tus altas calificaciones a Leonardo DiCaprio y películas de suspenso policial como Zodiac y Sicario.',
  },
];

export const recentActivityList: DashboardMovie[] = [
  {
    id: 'act-1',
    title: 'Interstellar',
    userRating: 8.9,
    relativeDate: 'Hace 2 días',
    posterUrl: 'https://image.tmdb.org/t/p/w342/yQvGrMoipbRoddT0ZR8tPoR7NfX.jpg',
    genres: ['Ciencia ficción', 'Drama'],
  },
  {
    id: 'act-2',
    title: 'Poor Things',
    userRating: 8.2,
    relativeDate: 'Hace 4 días',
    posterUrl: 'https://image.tmdb.org/t/p/w342/kCGlIMHnOm8JPXq3rXM6c5wMxcT.jpg',
    genres: ['Ciencia ficción', 'Comedia', 'Romance'],
  },
  {
    id: 'act-3',
    title: 'The Batman',
    userRating: 7.6,
    relativeDate: 'Hace 6 días',
    posterUrl: 'https://image.tmdb.org/t/p/w342/74xTEgt7R36Fpooo50r9T25onhq.jpg',
    genres: ['Crimen', 'Misterio', 'Suspense'],
  },
  {
    id: 'act-4',
    title: 'Dune: Part Two',
    userRating: 9.1,
    relativeDate: 'Hace 1 semana',
    posterUrl: 'https://image.tmdb.org/t/p/w342/6izwz7rsy95ARzTR3poZ8H6c5pp.jpg',
    genres: ['Ciencia ficción', 'Aventura'],
  },
];

export const recentMoviesGrid: DashboardMovie[] = [
  {
    id: 'rec-grid-1',
    title: 'The Dark Knight',
    userRating: 9.0,
    posterUrl: 'https://image.tmdb.org/t/p/w342/qJ2tW6WMUDux911r6m7haRef0WH.jpg',
    genres: ['Acción', 'Crimen', 'Drama'],
  },
  {
    id: 'rec-grid-2',
    title: 'Inception',
    userRating: 8.8,
    posterUrl: 'https://image.tmdb.org/t/p/w342/xlaY2zyzMfkhk0HSC5VUwzoZPU1.jpg',
    genres: ['Acción', 'Ciencia ficción', 'Aventura'],
  },
  {
    id: 'rec-grid-3',
    title: 'Fight Club',
    userRating: 8.7,
    posterUrl: 'https://image.tmdb.org/t/p/w342/jSziioSwPVrOy9Yow3XhWIBDjq1.jpg',
    genres: ['Drama'],
  },
  {
    id: 'rec-grid-4',
    title: 'Lost in Translation',
    userRating: 8.1,
    posterUrl: 'https://image.tmdb.org/t/p/w342/3jCLmYDIIiSMPujbwygNpqdpM8N.jpg',
    genres: ['Drama', 'Romance'],
  },
  {
    id: 'rec-grid-5',
    title: 'Parasite',
    userRating: 8.9,
    posterUrl: 'https://image.tmdb.org/t/p/w342/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg',
    genres: ['Comedia', 'Suspense', 'Drama'],
  },
];
