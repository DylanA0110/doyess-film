'use client';

import type { DailyPickResult } from '@/components/dashboard/types';
import { DailyPickHeroCard } from '@/components/dashboard/daily-pick-hero-card';

type DailyPickSectionProps = {
  userId: string;
  pick: DailyPickResult | null;
};

export function DailyPickSection({ userId, pick }: DailyPickSectionProps) {
  if (!pick) {
    return (
      <p className="text-sm text-zinc-500">
        No hay película del día todavía. Vuelve a cargar el dashboard en unos segundos.
      </p>
    );
  }

  return <DailyPickHeroCard pick={pick} userId={userId} />;
}
