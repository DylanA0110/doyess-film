'use client';

import type { DailyPickResult, ProfileHighlight } from '@/components/dashboard/types';
import { DailyPickSection } from '@/components/dashboard/daily-pick-section';
import { FlipRevealCard } from '@/components/dashboard/flip-reveal-card';

type DashboardHighlightFlipsProps = {
  highlights: ProfileHighlight[];
  hasData: boolean;
  userId: string;
  dailyPick: DailyPickResult | null;
  onOpenGenreDetail?: () => void;
};

export function DashboardHighlightFlips({
  highlights,
  hasData,
  userId,
  dailyPick,
  onOpenGenreDetail,
}: DashboardHighlightFlipsProps) {
  const cards = highlights.filter((h) => h.kind !== 'daily');

  if (cards.length === 0 && !hasData) {
    return (
      <p className="text-sm text-zinc-500">
        Importa tu CSV para ver tus tarjetas de revelación.
      </p>
    );
  }

  return (
    <section aria-label="Tarjetas de revelación" className="space-y-10 sm:space-y-12">
      {hasData ? <DailyPickSection userId={userId} pick={dailyPick} /> : null}

      {cards.length > 0 ? (
        <div className="border-t border-white/8 pt-8 sm:pt-10">
          <div className="mb-5 sm:mb-6">
            <h2 className="text-sm font-semibold text-[#F4F6F3]">Tu perfil en cartas</h2>
            <p className="mt-1 text-xs text-zinc-500">
              Pasa el cursor o toca para voltear · Género: toca otra vez con la carta volteada
              para detalle
            </p>
          </div>
          <div data-flip-grid>
            {cards.map((h) => (
              <FlipRevealCard
                key={h.kind}
                highlight={h}
                onGenreDetail={h.openGenreDetail ? onOpenGenreDetail : undefined}
              />
            ))}
          </div>
        </div>
      ) : null}
    </section>
  );
}
