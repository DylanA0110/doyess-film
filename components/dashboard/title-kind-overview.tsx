'use client';

import { Clapperboard, Tv } from 'lucide-react';
import type { TitleKindBreakdown } from '@/components/dashboard/types';

type TitleKindOverviewProps = {
  breakdown: TitleKindBreakdown;
};

export function TitleKindOverview({ breakdown }: TitleKindOverviewProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <KindCard
        icon={<Clapperboard className="size-4" />}
        label="Películas"
        count={breakdown.movies.count}
        avg={breakdown.movies.avgRating}
        screen={breakdown.movies.screenTimeString}
      />
      <KindCard
        icon={<Tv className="size-4" />}
        label="Series"
        count={breakdown.series.count}
        avg={breakdown.series.avgRating}
        screen={breakdown.series.screenTimeString}
      />
    </div>
  );
}

function KindCard({
  icon,
  label,
  count,
  avg,
  screen,
}: {
  icon: React.ReactNode;
  label: string;
  count: number;
  avg: number;
  screen: string;
}) {
  return (
    <div className="rounded-2xl border border-white/8 bg-zinc-900/80 p-5">
      <div className="flex items-center gap-2 text-xs text-zinc-400">
        <span className="text-zinc-300">{icon}</span>
        {label}
      </div>
      <p className="mt-3 text-3xl font-bold text-[#F4F6F3]">{count}</p>
      <p className="mt-2 text-xs text-zinc-500">
        Nota media {avg > 0 ? avg.toFixed(1) : '—'} · ~{screen} visionado
      </p>
    </div>
  );
}
