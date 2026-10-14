'use client';

import * as React from 'react';
import { DashboardParaVos } from '@/components/dashboard/dashboard-para-vos';
import type { DailyPickResult, DashboardStats, ProfileHighlight } from '@/components/dashboard/types';
import { dailyPickDateKey } from '@/lib/dashboard/daily-pick-format';

const MOCK_DAILY: DailyPickResult = {
  tmdbId: 807,
  tmdbVoteAverage: 8.3,
  movie: {
    id: 'preview-seven',
    title: 'Seven',
    year: 1995,
    userRating: 0,
    genres: ['Drama', 'Crime'],
    posterUrl: 'https://image.tmdb.org/t/p/w342/6yoghtyTpDpf4XzxXp9kPDrzila.jpg',
  },
  reason: 'Encaja con tu afición por drama intenso',
  synopsis:
    'Dos detectives persiguen a un asesino que usa los siete pecados capitales como modus operandi.',
  dayLabel: { month: 'OCT', day: '14' },
  unwatched: true,
};

type PreviewShellProps = {
  highlights: ProfileHighlight[];
  stats: DashboardStats;
};

export function PreviewShell({ highlights, stats }: PreviewShellProps) {
  const [ritualDateKey, setRitualDateKey] = React.useState<string | null>(null);

  React.useEffect(() => {
    const key = dailyPickDateKey(new Date());
    setRitualDateKey(key);
    try {
      localStorage.removeItem(`doyess-daily-ritual:preview-user:${key}`);
    } catch {
      /* ignore */
    }
  }, []);

  if (!ritualDateKey) {
    return (
      <p className="py-16 text-center text-sm text-zinc-500" aria-live="polite">
        Cargando preview…
      </p>
    );
  }

  return (
    <DashboardParaVos
      userName="Preview"
      userId="preview-user"
      stats={stats}
      highlights={highlights}
      hasData={true}
      dailyPick={MOCK_DAILY}
      ritualDateKey={ritualDateKey}
    />
  );
}
