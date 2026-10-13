'use client';

import { ArrowRight } from 'lucide-react';

const CHART_HEIGHT_PX = 160;

type RatingDistributionChartProps = {
  distribution: number[];
};

export function RatingDistributionChart({ distribution }: RatingDistributionChartProps) {
  const maxDist = Math.max(...distribution, 1);

  return (
    <div className="rounded-2xl border border-white/8 bg-zinc-900/80 p-5 lg:col-span-2">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-[#F4F6F3]">
          Distribución de tus calificaciones
        </h2>
        <ArrowRight className="size-4 text-zinc-600" />
      </div>
      <div
        className="mt-6 flex items-end gap-2 sm:gap-3"
        style={{ height: CHART_HEIGHT_PX }}
        role="img"
        aria-label="Gráfico de barras de calificaciones del 1 al 10"
      >
        {distribution.map((count, index) => {
          const rating = index + 1;
          const barHeight =
            count > 0 ? Math.max(6, Math.round((count / maxDist) * (CHART_HEIGHT_PX - 24))) : 2;

          return (
            <div
              key={rating}
              className="flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-2"
            >
              <div
                className="w-full rounded-t-md bg-[#8A0201] transition-all"
                style={{ height: barHeight }}
                title={`${count} películas con nota ${rating}`}
              />
              <span className="text-[10px] tabular-nums text-zinc-500">{rating}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
