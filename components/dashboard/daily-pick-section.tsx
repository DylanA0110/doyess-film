'use client';

import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import type { DailyPickResult } from '@/components/dashboard/types';
import { DailyPickHeroCard } from '@/components/dashboard/daily-pick-hero-card';

type DailyPickSectionProps = {
  userId: string;
  enabled: boolean;
};

async function fetchDailyPick(): Promise<DailyPickResult | null> {
  const res = await fetch('/api/daily-pick');
  if (!res.ok) return null;
  const data = (await res.json()) as { pick: DailyPickResult | null };
  return data.pick;
}

export function DailyPickSection({ userId, enabled }: DailyPickSectionProps) {
  const { data: pick, isLoading, isFetching } = useQuery({
    queryKey: ['daily-pick', userId],
    queryFn: fetchDailyPick,
    enabled,
    staleTime: 1000 * 60 * 60 * 12,
    refetchOnWindowFocus: false,
    retry: 1,
  });

  if (!enabled) return null;

  if (isLoading || (isFetching && !pick)) {
    return (
      <section aria-labelledby="daily-pick-title" className="mb-2">
        <div className="mb-3">
          <h2 id="daily-pick-title" className="text-sm font-semibold text-[#F4F6F3]">
            Película del día
          </h2>
          <p className="mt-1 text-xs text-zinc-500">Generando tu elección de hoy…</p>
        </div>
        <div data-daily-generating aria-busy="true">
          <div data-daily-generating-inner>
            <span data-daily-generating-dot />
            <span data-daily-generating-dot />
            <span data-daily-generating-dot />
          </div>
          <p className="mt-3 text-center text-xs text-zinc-500">
            Buscando una película que aún no tienes en tu historial IMDb
          </p>
        </div>
      </section>
    );
  }

  if (!pick) {
    return (
      <p className="text-sm text-zinc-500">
        No pudimos generar la película del día (TMDB o caché). Vuelve a intentar más tarde.
      </p>
    );
  }

  return <DailyPickHeroCard pick={pick} userId={userId} />;
}
