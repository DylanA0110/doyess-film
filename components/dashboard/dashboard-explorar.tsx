'use client';

import * as React from 'react';
import type { DashboardStats } from '@/components/dashboard/types';
import { ExploreHero } from '@/components/dashboard/explore/explore-hero';
import { ExploreLaneRow } from '@/components/dashboard/explore/explore-lane-row';
import {
  MovieDetailDialog,
  type MovieDetailTarget,
} from '@/components/dashboard/movie-detail-dialog';
import { exploreCardToDetailTarget } from '@/lib/dashboard/movie-detail-target';
import type { ExploreCardItem } from '@/lib/recommendation/lanes/build-explore-lanes';
import { useExploreLanes } from '@/hooks/use-explore-lanes';
import { Compass } from 'lucide-react';

type DashboardExplorarProps = {
  userName: string;
  userId: string;
  stats: DashboardStats;
};

export function DashboardExplorar({ userName, userId, stats: _stats }: DashboardExplorarProps) {
  const { data, isLoading, isError, error, isFetching } = useExploreLanes(userId, true);
  const [detailOpen, setDetailOpen] = React.useState(false);
  const [detailTarget, setDetailTarget] = React.useState<MovieDetailTarget | null>(null);

  const openItem = (item: ExploreCardItem) => {
    setDetailTarget(exploreCardToDetailTarget(item));
    setDetailOpen(true);
  };

  return (
    <div className="space-y-8 pb-8 sm:space-y-10">
      <header className="max-w-2xl">
        <p className="text-xs font-medium text-[#8A0201]">Explorar, {userName}</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#F4F6F3] sm:text-4xl">
          Tu mente, traducida en cine
        </h1>
        <p className="mt-2 text-sm text-zinc-500">
          Carriles armados con tus géneros, series y joyas que aún no viste — no un catálogo genérico.
        </p>
        {isFetching && !isLoading ? (
          <p className="mt-2 text-xs text-zinc-600" role="status">
            Actualizando recomendaciones…
          </p>
        ) : null}
      </header>

      {isLoading ? (
        <div className="space-y-8">
          <div className="h-56 animate-pulse rounded-2xl bg-zinc-900/80 sm:h-64" />
          <div className="h-36 animate-pulse rounded-2xl bg-zinc-900/60" />
        </div>
      ) : isError ? (
        <p className="text-sm text-rose-400">{error?.message ?? 'Error al cargar'}</p>
      ) : !data || (!data.hero && data.lanes.length === 0) ? (
        <div className="rounded-2xl border border-dashed border-white/12 bg-zinc-950/40 px-6 py-10 text-center">
          <Compass className="mx-auto size-8 text-zinc-600" />
          <p className="mt-3 text-sm text-zinc-400">
            Aún no hay suficiente señal en tu perfil. Califica más títulos o importa tu CSV.
          </p>
        </div>
      ) : (
        <>
          {data.hero ? <ExploreHero hero={data.hero} onOpenItem={openItem} /> : null}
          <div className="space-y-8 sm:space-y-10">
            {data.lanes.map((lane) => (
              <ExploreLaneRow key={lane.id} lane={lane} onOpenItem={openItem} />
            ))}
          </div>
        </>
      )}

      <MovieDetailDialog
        open={detailOpen}
        onOpenChange={setDetailOpen}
        target={detailTarget}
        userId={userId}
      />
    </div>
  );
}
