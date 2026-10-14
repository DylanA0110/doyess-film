'use client';

import * as React from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

function RatingBarTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ value?: number }>;
  label?: string | number;
}) {
  if (!active || !payload?.length) return null;
  const count = payload[0]?.value ?? 0;
  return (
    <div
      className="rounded-xl border border-white/15 bg-zinc-900 px-3.5 py-2.5 shadow-lg"
      style={{ color: '#F4F6F3' }}
    >
      <p className="text-sm font-semibold text-[#F4F6F3]">Nota {label}</p>
      <p className="mt-0.5 text-xs text-zinc-300">
        {count} {count === 1 ? 'título' : 'títulos'}
      </p>
    </div>
  );
}

type RatingDistributionRechartsProps = {
  distribution: number[];
  onSelectRating?: (rating: number) => void;
};

export function RatingDistributionRecharts({
  distribution,
  onSelectRating,
}: RatingDistributionRechartsProps) {
  const [activeRating, setActiveRating] = React.useState<number | null>(null);

  const data = distribution.map((count, index) => ({
    rating: index + 1,
    ratingLabel: String(index + 1),
    count,
  }));

  const handleBar = (rating: number) => {
    setActiveRating(rating);
    onSelectRating?.(rating);
  };

  return (
    <div className="rounded-2xl border border-white/8 bg-zinc-900/80 p-5 lg:col-span-2">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <h2 className="text-base font-semibold text-[#F4F6F3]">
          Distribución de tus calificaciones
        </h2>
        {onSelectRating ? (
          <p className="text-[10px] text-zinc-500 sm:text-xs">Toca una barra para ver títulos</p>
        ) : null}
      </div>
      <div className="mt-4 h-44 w-full min-w-0 sm:h-52">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
            <XAxis
              dataKey="ratingLabel"
              tick={{ fill: '#71717a', fontSize: 11 }}
              axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
              tickLine={false}
            />
            <YAxis
              allowDecimals={false}
              tick={{ fill: '#71717a', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              cursor={{ fill: 'rgba(138,2,1,0.12)' }}
              content={<RatingBarTooltip />}
            />
            <Bar
              dataKey="count"
              radius={[6, 6, 0, 0]}
              maxBarSize={40}
              cursor={onSelectRating ? 'pointer' : 'default'}
              onClick={(barData) => {
                const rating = (barData as { payload?: { rating?: number } })?.payload?.rating;
                if (typeof rating === 'number') handleBar(rating);
              }}
            >
              {data.map((entry) => (
                <Cell
                  key={entry.rating}
                  fill={activeRating === entry.rating ? '#c80000' : '#8A0201'}
                  opacity={entry.count === 0 ? 0.25 : 1}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
