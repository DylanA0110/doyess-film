'use client';

import * as React from 'react';
import { ArrowRight } from 'lucide-react';
import type { DashboardStats } from './types';
import { cn } from 'cn';

interface FavoriteGenresChartProps {
  stats: DashboardStats;
  onSelectGenre?: (genreName: string) => void;
  className?: string;
  compact?: boolean;
}

export function FavoriteGenresChart({
  stats,
  onSelectGenre,
  className,
  compact = false,
}: FavoriteGenresChartProps) {
  const genres = React.useMemo(
    () => stats.topGenres.filter((g) => g.name !== 'Otros'),
    [stats.topGenres],
  );
  const circumference = 251.3;
  const genreCount = genres.length;

  const donutSegments = React.useMemo(() => {
    let cumulativePercent = 0;
    return genres.map((g) => {
      const dashLength = (g.percentage / 100) * circumference;
      const dashOffset = -((cumulativePercent / 100) * circumference);
      cumulativePercent += g.percentage;
      return { ...g, dashLength, dashOffset };
    });
  }, [genres, circumference]);

  const openDominant = () => {
    const first = genres[0]?.name ?? stats.dominantGenreName;
    if (first && first !== 'Otros') onSelectGenre?.(first);
  };

  return (
    <div className={cn('df-dash-panel', className)}>
      <div className="p-3 sm:p-4">
      <div className="flex items-center justify-between gap-3 pb-3 sm:pb-4">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#8A0201]">
            Laboratorio
          </p>
          <h3 className="text-base font-bold tracking-tight text-[#F4F6F3]">
            {compact ? 'Géneros' : 'Tus géneros favoritos'}
          </h3>
        </div>
        {onSelectGenre ? (
          <button
            type="button"
            onClick={openDominant}
            className="group flex items-center gap-1 rounded-full border border-white/10 bg-black/25 px-2.5 py-1 text-[10px] font-semibold text-zinc-400 transition hover:border-[#8A0201]/40 hover:text-[#F4F6F3]"
          >
            <span>Detalle</span>
            <ArrowRight className="size-3 transition group-hover:translate-x-0.5" />
          </button>
        ) : null}
      </div>

      <div
        className={cn(
          'df-sunset-card__content flex gap-5',
          compact ? 'flex-col items-center' : 'items-center',
        )}
      >
        <div
          className={cn(
            'relative shrink-0 flex items-center justify-center df-donut-glow',
            compact ? 'size-28' : 'size-32',
          )}
        >
          <svg viewBox="0 0 100 100" className="size-full -rotate-90" aria-hidden>
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="none"
              stroke="rgba(255,255,255,0.06)"
              strokeWidth="11"
            />
            {donutSegments.map((g) => (
                <circle
                  key={g.name}
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke={g.color}
                  strokeWidth="11"
                  strokeLinecap="round"
                  strokeDasharray={`${g.dashLength} ${circumference - g.dashLength}`}
                  strokeDashoffset={g.dashOffset}
                  className="transition-all duration-500"
                />
            ))}
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center select-none">
            <span className="text-xl font-black leading-none text-[#F4F6F3]">
              {genreCount}
            </span>
            <span className="mt-0.5 text-[9px] uppercase tracking-wider text-[#F4F6F3]/50">
              géneros
            </span>
          </div>
        </div>

        <div className="min-w-0 flex-1 space-y-2.5">
          {genres.slice(0, compact ? 5 : 6).map((g, index) => (
            <button
              key={g.name}
              type="button"
              disabled={!onSelectGenre}
              onClick={() => onSelectGenre?.(g.name)}
              className="w-full rounded-lg px-1 py-0.5 text-left transition enabled:cursor-pointer enabled:hover:bg-white/[0.04] disabled:cursor-default"
            >
              <div className="mb-1 flex items-center justify-between gap-2 text-xs">
                <div className="flex min-w-0 items-center gap-2">
                  <span className="text-[10px] tabular-nums text-zinc-600">{index + 1}</span>
                  <span
                    className="size-2 shrink-0 rounded-full"
                    style={{ backgroundColor: g.color }}
                  />
                  <span className="truncate font-medium text-[#F4F6F3]/90">{g.name}</span>
                </div>
                <span className="shrink-0 font-semibold tabular-nums text-[#F4F6F3]">
                  {g.percentage}%
                </span>
              </div>
              <div className="df-genre-bar-track">
                <div
                  className="df-genre-bar-fill"
                  style={{ width: `${Math.min(100, g.percentage)}%` }}
                />
              </div>
            </button>
          ))}
        </div>
      </div>
      </div>
    </div>
  );
}
