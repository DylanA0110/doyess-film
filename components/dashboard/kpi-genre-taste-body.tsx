'use client';

import * as React from 'react';
import type { DashboardGenreTasteBlock } from '@/components/dashboard/types';
import { cn } from 'cn';

type KpiGenreTasteBodyProps = {
  movies: DashboardGenreTasteBlock | null;
  series?: DashboardGenreTasteBlock | null;
};

export function KpiGenreTasteBody({ movies, series }: KpiGenreTasteBodyProps) {
  const hasMovies = Boolean(movies && movies.ratingsCount > 0);
  const hasSeries = Boolean(series && series.ratingsCount > 0);
  const [tab, setTab] = React.useState<'movies' | 'series'>(() =>
    hasMovies ? 'movies' : hasSeries ? 'series' : 'movies',
  );

  React.useEffect(() => {
    if (tab === 'movies' && !hasMovies && hasSeries) setTab('series');
    if (tab === 'series' && !hasSeries && hasMovies) setTab('movies');
  }, [hasMovies, hasSeries, tab]);

  const active = tab === 'movies' ? movies : series;

  if (!hasMovies && !hasSeries) {
    return (
      <p className="text-sm text-zinc-500">
        Califica títulos o importa tu CSV para ver géneros.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {hasMovies && hasSeries ? (
        <div className="flex gap-2 rounded-xl border border-white/8 bg-zinc-950/50 p-1">
          <TabButton active={tab === 'movies'} onClick={() => setTab('movies')}>
            Películas
          </TabButton>
          <TabButton active={tab === 'series'} onClick={() => setTab('series')}>
            Series
          </TabButton>
        </div>
      ) : null}
      <GenreList block={active} kind={tab} />
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex-1 rounded-lg px-3 py-2 text-xs font-semibold transition',
        active
          ? 'bg-[#8A0201]/25 text-[#F4F6F3]'
          : 'text-zinc-500 hover:text-zinc-300',
      )}
    >
      {children}
    </button>
  );
}

function GenreList({
  block,
  kind,
}: {
  block: DashboardGenreTasteBlock | null | undefined;
  kind: 'movies' | 'series';
}) {
  if (!block || block.ratingsCount === 0) {
    return (
      <p className="text-sm text-zinc-500">
        {kind === 'movies' ? 'Sin películas calificadas aún.' : 'Sin series calificadas aún.'}
      </p>
    );
  }

  return (
    <ul className="space-y-2">
      {block.topGenres.slice(0, 6).map((g) => (
        <li key={g.name} className="space-y-1">
          <div className="flex items-center justify-between gap-2 text-xs">
            <span className="truncate text-sm text-zinc-300">{g.name}</span>
            <span className="shrink-0 tabular-nums text-zinc-500">{g.percentage}%</span>
          </div>
          <div className="df-genre-bar-track">
            <div
              className="df-genre-bar-fill"
              style={{ width: `${Math.min(100, g.percentage)}%` }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}
