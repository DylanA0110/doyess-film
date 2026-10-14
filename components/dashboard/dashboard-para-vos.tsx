'use client';

import * as React from 'react';
import type { DailyPickResult, DashboardStats, ProfileHighlight } from '@/components/dashboard/types';
import { DashboardHighlightFlips } from '@/components/dashboard/dashboard-highlight-flips';
import {
  KpiDetailDialog,
  type KpiDetailKind,
} from '@/components/dashboard/kpi-detail-dialog';

type DashboardParaVosProps = {
  userName: string;
  userId: string;
  stats: DashboardStats;
  highlights: ProfileHighlight[];
  hasData: boolean;
  dailyPick: DailyPickResult | null;
};

export function DashboardParaVos({
  userName,
  userId,
  stats,
  highlights,
  hasData,
  dailyPick,
}: DashboardParaVosProps) {
  const [kpiOpen, setKpiOpen] = React.useState(false);
  const [kpiKind, setKpiKind] = React.useState<KpiDetailKind | null>(null);
  const [genreInsight, setGenreInsight] = React.useState(stats.dominantGenreInsight);

  const openKpi = (kind: KpiDetailKind, genreName?: string) => {
    setKpiKind(kind);
    if (kind === 'genre') {
      const name = genreName ?? stats.dominantGenreName;
      setGenreInsight(stats.genreInsightsByName[name] ?? stats.dominantGenreInsight);
    }
    setKpiOpen(true);
  };

  return (
    <div className="space-y-8">
      <header>
        <p className="text-xs font-medium text-[#8A0201]">Para vos, {userName}</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#F4F6F3] sm:text-4xl">
          Selección personal
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-zinc-500">
          Voltea cada carta para revelar tu género y favoritos. La película del día se genera
          una vez al día y no está en tu historial IMDb.
        </p>
      </header>

      <DashboardHighlightFlips
        highlights={highlights}
        hasData={hasData}
        dailyPick={dailyPick}
        userId={userId}
        onOpenGenreDetail={() => openKpi('genre')}
      />

      {stats.cinephileInsights.length > 0 ? (
        <section className="rounded-2xl border border-white/8 bg-[#101009] p-6">
          <h2 className="text-sm font-semibold text-[#F4F6F3]">Tu analista</h2>
          <ul className="mt-4 space-y-4">
            {stats.cinephileInsights.slice(0, 4).map((insight) => (
              <li key={insight.kind + insight.headline}>
                <p className="text-sm font-medium text-[#F4F6F3]">{insight.headline}</p>
                <p className="mt-1 text-xs text-zinc-500">{insight.detail}</p>
                <p className="mt-1 text-[10px] text-zinc-600">{insight.evidence}</p>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <KpiDetailDialog
        open={kpiOpen}
        onOpenChange={setKpiOpen}
        kind={kpiKind}
        stats={stats}
        genreInsight={genreInsight}
      />
    </div>
  );
}
