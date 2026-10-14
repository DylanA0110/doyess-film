import { notFound } from 'next/navigation';
import type { ProfileHighlight } from '@/components/dashboard/types';
import { buildDashboardStats } from '@/lib/imdb/build-dashboard-stats';
import { PreviewShell } from './preview-shell';

const MOCK_HIGHLIGHTS: ProfileHighlight[] = [
  {
    kind: 'genre',
    frontLabel: 'Género favorito',
    backTitle: 'Drama',
    kindLabel: 'Género',
    imageUrl: 'https://image.tmdb.org/t/p/w342/9Rq14Eyrf7Tu1xgB2q4O4mRgQv.jpg',
    blurb: 'Aparece en 57 de tus calificaciones.',
    stat: '21%',
    openGenreDetail: true,
  },
  {
    kind: 'ten',
    frontLabel: 'Tu 10',
    backTitle: 'Chernobyl',
    kindLabel: 'Serie',
    imageUrl: 'https://image.tmdb.org/t/p/w342/9Rq14Eyrf7Tu1xgB2q4O4mRgQv.jpg',
    blurb: 'Tu nota 10/10.',
    stat: '10/10',
  },
  {
    kind: 'favoriteMovie',
    frontLabel: 'Película favorita',
    backTitle: 'Inception',
    kindLabel: 'Película',
    imageUrl: 'https://image.tmdb.org/t/p/w342/oYuLEt3zVCKq57FMfoptgiFbDnO.jpg',
    blurb: 'Alta afinidad con tu perfil.',
    stat: '9/10',
  },
  {
    kind: 'favoriteSeries',
    frontLabel: 'Serie favorita',
    backTitle: 'Breaking Bad',
    kindLabel: 'Serie',
    imageUrl: 'https://image.tmdb.org/t/p/w342/ggFHVNu6YYI5L9pCfOacjizRGqk.jpg',
    blurb: 'La serie que más marcaste.',
    stat: '10/10',
  },
  {
    kind: 'actor',
    frontLabel: 'Actor favorito',
    backTitle: 'Leonardo DiCaprio',
    kindLabel: 'Actor',
    imageUrl: 'https://image.tmdb.org/t/p/w185/5BrcMrtck0c8i6W2f6z5nvmimyL.jpg',
    blurb: 'Aparece en varios de tus 10.',
    stat: '8 títulos',
    roundImage: true,
  },
  {
    kind: 'director',
    frontLabel: 'Director favorito',
    backTitle: 'Christopher Nolan',
    kindLabel: 'Director',
    imageUrl: 'https://image.tmdb.org/t/p/w185/ukCAdKFnDjh25ebkJDt4d6pKuiA.jpg',
    blurb: 'Coincide con tu gusto por sci-fi.',
    stat: '6 pelis',
    roundImage: true,
  },
];

const MOCK_STATS = buildDashboardStats([]);

export default function ParaVosPreviewPage() {
  if (process.env.NODE_ENV === 'production') {
    notFound();
  }

  return (
    <div className="min-h-screen bg-[#050000]">
      <p className="border-b border-white/10 px-4 py-2 text-center text-xs text-amber-600/90">
        Dev preview — mismo DOM que /dashboard → Para vos (sin login)
      </p>
      <div className="mx-auto max-w-[1600px] p-4 sm:p-6 lg:p-7">
        <PreviewShell highlights={MOCK_HIGHLIGHTS} stats={MOCK_STATS} />
      </div>
    </div>
  );
}
