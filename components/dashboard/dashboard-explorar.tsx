'use client';

import type { DashboardStats } from '@/components/dashboard/types';
import { Compass, Film } from 'lucide-react';

type DashboardExplorarProps = {
  userName: string;
  stats: DashboardStats;
};

export function DashboardExplorar({ userName, stats }: DashboardExplorarProps) {
  const topGenres = stats.topGenres.filter((g) => g.name !== 'Otros').slice(0, 4);

  return (
    <div className="space-y-8">
      <header>
        <p className="text-xs font-medium text-[#8A0201]">Explorar, {userName}</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#F4F6F3] sm:text-4xl">
          Sin ver todavía
        </h1>
        <p className="mt-2 max-w-xl text-sm text-zinc-500">
          Carriles de películas fuera de tu historial IMDb. Próximamente con el mismo motor que tu
          pick diario.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2">
        {topGenres.map((g) => (
          <div
            key={g.name}
            className="flex items-center gap-4 rounded-2xl border border-white/8 bg-zinc-900/60 p-5"
          >
            <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-[#8A0201]/15 text-[#8A0201]">
              <Film className="size-6" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-[#F4F6F3]">{g.name}</p>
              <p className="mt-0.5 text-xs text-zinc-500">{g.percentage}% de tu afinidad</p>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-dashed border-white/12 bg-zinc-950/40 px-6 py-10 text-center">
        <Compass className="mx-auto size-8 text-zinc-600" />
        <p className="mt-3 text-sm text-zinc-400">Los carriles interactivos llegan en la siguiente iteración.</p>
      </div>
    </div>
  );
}
