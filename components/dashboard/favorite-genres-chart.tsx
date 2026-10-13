'use client';

import * as React from 'react';
import { ArrowRight } from 'lucide-react';
import type { DashboardStats } from './types';

interface FavoriteGenresChartProps {
  stats: DashboardStats;
}

export function FavoriteGenresChart({ stats }: FavoriteGenresChartProps) {
  const genres = stats.topGenres;

  // Compute SVG stroke-dasharray arcs for the donut chart
  // Circumference = 2 * PI * r = 2 * PI * 40 ~= 251.3
  const circumference = 251.3;
  let cumulativePercent = 0;

  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/8 bg-zinc-900/80 p-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-4">
        <h3 className="text-base font-bold tracking-tight text-[#F4F6F3]">
          Tus géneros favoritos
        </h3>
        <button
          type="button"
          className="group flex items-center gap-1 text-xs text-[#F4F6F3]/50 hover:text-[#F4F6F3] transition"
        >
          <span>Ver todos</span>
          <ArrowRight className="size-3 text-[#F4F6F3]/40 group-hover:translate-x-0.5 transition" />
        </button>
      </div>

      {/* Donut Chart & Legend */}
      <div className="flex items-center gap-6">
        {/* Donut Chart */}
        <div className="relative size-32 shrink-0 flex items-center justify-center">
          <svg viewBox="0 0 100 100" className="size-full -rotate-90">
            {genres.map((g, idx) => {
              const dashLength = (g.percentage / 100) * circumference;
              const dashOffset = -((cumulativePercent / 100) * circumference);
              cumulativePercent += g.percentage;

              return (
                <circle
                  key={idx}
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke={g.color}
                  strokeWidth="12"
                  strokeDasharray={`${dashLength} ${circumference - dashLength}`}
                  strokeDashoffset={dashOffset}
                  className="transition-all duration-500"
                />
              );
            })}
          </svg>

          {/* Center Label: "9 géneros" */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center select-none">
            <span className="text-xl font-black text-[#F4F6F3] leading-none">
              9
            </span>
            <span className="text-[10px] uppercase tracking-wider text-[#F4F6F3]/50 mt-0.5">
              géneros
            </span>
          </div>
        </div>

        {/* Legend */}
        <div className="flex-1 space-y-2">
          {genres.map((g) => (
            <div
              key={g.name}
              className="flex items-center justify-between text-xs"
            >
              <div className="flex items-center gap-2">
                <span
                  className="size-2 rounded-full shrink-0"
                  style={{ backgroundColor: g.color }}
                />
                <span className="text-[#F4F6F3]/80 font-medium truncate max-w-[100px]">
                  {g.name}
                </span>
              </div>
              <span className="font-semibold text-[#F4F6F3]">
                {g.percentage}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
