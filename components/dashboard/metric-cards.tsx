'use client';

import * as React from 'react';
import { Film, Star, Clock, ArrowUp } from 'lucide-react';
import type { DashboardStats } from './types';

interface MetricCardsProps {
  stats: DashboardStats;
}

export function MetricCards({ stats }: MetricCardsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {/* 1. Películas vistas */}
      <div className="relative overflow-hidden rounded-2xl border border-white/8 bg-[#101009]/90 p-5 backdrop-blur-xl transition hover:border-[#8A0201]/40">
        <div className="flex items-center gap-2.5 text-[#F4F6F3]/70">
          <div className="flex size-7 items-center justify-center rounded-lg bg-white/5 text-[#F4F6F3]">
            <Film className="size-4" />
          </div>
          <span className="text-xs font-medium text-[#F4F6F3]/80">Películas vistas</span>
        </div>

        <div className="mt-4 flex items-baseline justify-between">
          <div>
            <p className="text-3xl sm:text-4xl font-black text-[#F4F6F3] tracking-tight">
              {stats.moviesWatched}
            </p>
            <div className="mt-2 flex items-center gap-1 text-xs font-semibold text-[#8A0201]">
              <ArrowUp className="size-3" />
              <span>{stats.moviesWatchedDelta}</span>
            </div>
          </div>

          {/* Red Sparkline wave */}
          <div className="h-10 w-24">
            <svg viewBox="0 0 100 40" className="h-full w-full overflow-visible">
              <defs>
                <linearGradient id="grad-sparkline-1" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#8A0201" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#8A0201" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path
                d="M0,32 Q15,35 30,22 T60,25 T80,10 T100,6"
                fill="none"
                stroke="#8A0201"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              <path
                d="M0,32 Q15,35 30,22 T60,25 T80,10 T100,6 L100,40 L0,40 Z"
                fill="url(#grad-sparkline-1)"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* 2. Promedio de calificación */}
      <div className="relative overflow-hidden rounded-2xl border border-white/8 bg-[#101009]/90 p-5 backdrop-blur-xl transition hover:border-[#8A0201]/40">
        <div className="flex items-center gap-2.5 text-[#F4F6F3]/70">
          <div className="flex size-7 items-center justify-center rounded-lg bg-white/5 text-[#F4F6F3]">
            <Star className="size-4 text-amber-400 fill-amber-400" />
          </div>
          <span className="text-xs font-medium text-[#F4F6F3]/80">Promedio de calificación</span>
        </div>

        <div className="mt-4 flex items-baseline justify-between">
          <div>
            <p className="text-3xl sm:text-4xl font-black text-[#F4F6F3] tracking-tight">
              {stats.averageRating}
            </p>
            <div className="mt-2 flex items-center gap-1 text-xs font-semibold text-[#8A0201]">
              <ArrowUp className="size-3" />
              <span>{stats.averageRatingDelta}</span>
            </div>
          </div>

          {/* Red Sparkline wave */}
          <div className="h-10 w-24">
            <svg viewBox="0 0 100 40" className="h-full w-full overflow-visible">
              <defs>
                <linearGradient id="grad-sparkline-2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#8A0201" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#8A0201" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path
                d="M0,30 Q20,32 40,24 T70,18 T90,20 T100,8"
                fill="none"
                stroke="#8A0201"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              <path
                d="M0,30 Q20,32 40,24 T70,18 T90,20 T100,8 L100,40 L0,40 Z"
                fill="url(#grad-sparkline-2)"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* 3. Tiempo de pantalla */}
      <div className="relative overflow-hidden rounded-2xl border border-white/8 bg-[#101009]/90 p-5 backdrop-blur-xl transition hover:border-[#8A0201]/40">
        <div className="flex items-center gap-2.5 text-[#F4F6F3]/70">
          <div className="flex size-7 items-center justify-center rounded-lg bg-white/5 text-[#F4F6F3]">
            <Clock className="size-4" />
          </div>
          <span className="text-xs font-medium text-[#F4F6F3]/80">Tiempo de pantalla</span>
        </div>

        <div className="mt-4 flex items-baseline justify-between">
          <div>
            <p className="text-3xl sm:text-4xl font-black text-[#F4F6F3] tracking-tight">
              {stats.screenTimeString}
            </p>
            <div className="mt-2 flex items-center gap-1 text-xs font-semibold text-[#8A0201]">
              <ArrowUp className="size-3" />
              <span>{stats.screenTimeDelta}</span>
            </div>
          </div>

          {/* Red Circular Progress Ring matching Mockup */}
          <div className="relative size-12 flex items-center justify-center">
            <svg viewBox="0 0 48 48" className="size-full -rotate-90">
              <circle
                cx="24"
                cy="24"
                r="18"
                stroke="rgba(255,255,255,0.08)"
                strokeWidth="4"
                fill="none"
              />
              <circle
                cx="24"
                cy="24"
                r="18"
                stroke="#8A0201"
                strokeWidth="4"
                strokeDasharray="113"
                strokeDashoffset="32"
                strokeLinecap="round"
                fill="none"
              />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
