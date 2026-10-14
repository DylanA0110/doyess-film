'use client';

import type { DashboardGenreTasteBlock } from '@/components/dashboard/types';

export function KpiGenreTasteBody({ movies }: { movies: DashboardGenreTasteBlock | null }) {
  if (!movies || movies.ratingsCount === 0) {
    return <p className="text-sm text-zinc-500">Importa películas en tu CSV para ver géneros.</p>;
  }

  return (
    <ul className="space-y-2">
      {movies.topGenres.slice(0, 6).map((g) => (
        <li key={g.name} className="flex items-center gap-3">
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/8">
            <div
              className="h-full rounded-full bg-[#8A0201]"
              style={{ width: `${Math.min(100, g.percentage)}%` }}
            />
          </div>
          <span className="w-24 truncate text-sm text-zinc-300">{g.name}</span>
          <span className="w-10 text-right text-xs tabular-nums text-zinc-500">{g.percentage}%</span>
        </li>
      ))}
    </ul>
  );
}
