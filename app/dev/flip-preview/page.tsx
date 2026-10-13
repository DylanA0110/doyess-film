import { notFound } from 'next/navigation';
import { DailyPickHeroCard } from '@/components/dashboard/daily-pick-hero-card';
import { DashboardHighlightFlips } from '@/components/dashboard/dashboard-highlight-flips';
import type { DailyPickResult, ProfileHighlight } from '@/components/dashboard/types';

const MOCK_HIGHLIGHTS: ProfileHighlight[] = [
  {
    kind: 'genre',
    frontLabel: 'Género favorito',
    backTitle: 'Drama',
    kindLabel: 'Género',
    imageUrl: 'https://image.tmdb.org/t/p/w342/9Rq14Eyrf7Tu1xgB2q4O4mRgQv.jpg',
    blurb: 'Aparece en 57 de tus calificaciones. Destacan títulos que marcaste con 10.',
    stat: '21%',
    openGenreDetail: true,
  },
  {
    kind: 'ten',
    frontLabel: 'Tu 10',
    backTitle: 'Chernobyl',
    kindLabel: 'Serie',
    imageUrl: 'https://image.tmdb.org/t/p/w342/9Rq14Eyrf7Tu1xgB2q4O4mRgQv.jpg',
    blurb: 'Tu nota 10/10; encaja con drama.',
    stat: '10/10',
  },
  {
    kind: 'favoriteMovie',
    frontLabel: 'Película favorita',
    backTitle: 'Inception',
    kindLabel: 'Película',
    imageUrl: 'https://image.tmdb.org/t/p/w342/oYuLEt3zVCKq57FMfoptgiFbDnO.jpg',
    blurb: 'Alta afinidad con tu perfil y nota 9/10.',
    stat: '9/10',
  },
];

const MOCK_DAILY: DailyPickResult = {
  tmdbId: 12493,
  tmdbVoteAverage: 8.2,
  movie: {
    id: 'preview',
    title: 'Seven',
    year: 1995,
    userRating: 9,
    genres: ['Drama', 'Crime'],
    posterUrl: 'https://image.tmdb.org/t/p/w342/6yoghtyTpDpf4XzxXp9kPDrzila.jpg',
  },
  reason: 'Género drama y nota alta en tu historial',
  synopsis:
    'Dos detectives persiguen a un asesino en serie que usa los siete pecados capitales como modus operandi.',
  dayLabel: { month: 'OCT', day: '13' },
  unwatched: true,
};

export default function FlipPreviewPage() {
  if (process.env.NODE_ENV === 'production') {
    notFound();
  }

  return (
    <main className="min-h-screen bg-[#050000] p-8">
      <p className="mb-4 text-xs text-zinc-500">Dev: flip-preview — hover o toca cada carta</p>
      <DailyPickHeroCard pick={MOCK_DAILY} userId="preview-user" />
      <div className="mt-10">
        <DashboardHighlightFlips
          highlights={MOCK_HIGHLIGHTS}
          hasData={false}
          dailyPick={null}
          userId="preview-user"
        />
      </div>
    </main>
  );
}
