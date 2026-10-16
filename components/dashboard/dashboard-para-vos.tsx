'use client';

import '@/app/para-vos.css';

import * as React from 'react';
import { Suspense } from 'react';
import type { DailyPickResult, DashboardStats, ProfileHighlight } from '@/components/dashboard/types';
import { DailyPickRevealStage } from '@/components/dashboard/para-vos/daily-pick-reveal-stage';
import { ParaVosMasonry } from '@/components/dashboard/para-vos/para-vos-masonry';
import {
  KpiDetailDialog,
  type KpiDetailKind,
} from '@/components/dashboard/kpi-detail-dialog';
import {
  MovieDetailDialog,
  type MovieDetailTarget,
} from '@/components/dashboard/movie-detail-dialog';

type DashboardParaVosProps = {
  userName: string;
  userId: string;
  stats: DashboardStats;
  highlights: ProfileHighlight[];
  hasData: boolean;
  dailyPick: DailyPickResult | null;
  ritualDateKey: string;
};

export function DashboardParaVos({
  userName,
  userId,
  stats,
  highlights,
  hasData,
  dailyPick,
  ritualDateKey,
}: DashboardParaVosProps) {
  const [kpiOpen, setKpiOpen] = React.useState(false);
  const [kpiKind, setKpiKind] = React.useState<KpiDetailKind | null>(null);
  const [genreInsight, setGenreInsight] = React.useState(stats.dominantGenreInsight);
  const [detailOpen, setDetailOpen] = React.useState(false);
  const [detailTarget, setDetailTarget] = React.useState<MovieDetailTarget | null>(null);

  const openKpi = (kind: KpiDetailKind, genreName?: string) => {
    setKpiKind(kind);
    if (kind === 'genre') {
      const name = genreName ?? stats.dominantGenreName;
      setGenreInsight(stats.genreInsightsByName[name] ?? stats.dominantGenreInsight);
    }
    setKpiOpen(true);
  };

  return (
    <div className="relative min-h-[80vh]">
      <header className="mb-2 text-center sm:text-left">
        <p className="text-xs font-medium text-[#8A0201]">Para vos, {userName}</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#F4F6F3] sm:text-4xl">
          Descubrí tu cine
        </h1>
      </header>

      {hasData ? (
        <div className="para-vos-daily-block">
          <Suspense
            fallback={
              <p className="py-8 text-center text-sm text-zinc-500">Cargando tu pick…</p>
            }
          >
            <DailyPickRevealStage
              userId={userId}
              initialPick={dailyPick}
              ritualDateKey={ritualDateKey}
            />
          </Suspense>
        </div>
      ) : (
        <p className="py-8 text-center text-sm text-zinc-500">
          Califica un título o importa tu CSV para desbloquear tu pick diario y tus cartas.
        </p>
      )}

      {hasData ? (
        <ParaVosMasonry
          highlights={highlights}
          onOpenGenreDetail={() => openKpi('genre')}
        />
      ) : null}

      <KpiDetailDialog
        open={kpiOpen}
        onOpenChange={setKpiOpen}
        kind={kpiKind}
        stats={stats}
        genreInsight={genreInsight}
        onOpenTitle={(target) => {
          setKpiOpen(false);
          setDetailTarget(target);
          setDetailOpen(true);
        }}
      />

      <MovieDetailDialog
        open={detailOpen}
        onOpenChange={setDetailOpen}
        target={detailTarget}
        userId={userId}
      />
    </div>
  );
}
