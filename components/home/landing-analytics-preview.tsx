'use client';

import Image from 'next/image';
import { UserRound } from 'lucide-react';
import type { LandingDirectorPreview } from '@/lib/tmdb/landing-hero';

const GENRE_BARS = [
  { label: 'Thriller', pct: 32 },
  { label: 'Drama', pct: 24 },
  { label: 'Ciencia ficción', pct: 18 },
  { label: 'Acción', pct: 12 },
  { label: 'Otros', pct: 14 },
] as const;

const MATCH_PCT = 87;

type LandingAnalyticsPreviewProps = {
  directors: LandingDirectorPreview[];
};

export function LandingAnalyticsPreview({ directors }: LandingAnalyticsPreviewProps) {
  const circumference = 2 * Math.PI * 42;
  const dashOffset = circumference * (1 - MATCH_PCT / 100);

  return (
    <aside
      className="w-full max-w-md rounded-2xl border border-[#8A0201]/25 bg-neutral-950/70 p-5 shadow-[0_24px_64px_rgba(0,0,0,0.55)] backdrop-blur-md sm:p-6"
      aria-label="Tu perfil cinematográfico"
    >
      <div className="flex items-start gap-2.5">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#8A0201]/20 text-[#8A0201]">
          <UserRound className="size-4" />
        </span>
        <div>
          <p className="text-[11px] uppercase tracking-wider text-[#8E908C]">
            Tu perfil cinematográfico
          </p>
          <p className="mt-1 text-xl font-bold tracking-tight text-[#F4F6F3]">Cinéfilo Analítico</p>
          <p className="mt-0.5 text-xs text-[#8E908C]">Thriller • Drama • Ciencia ficción</p>
        </div>
      </div>

      <div className="mt-6 grid gap-6 sm:grid-cols-[minmax(0,7.5rem)_1fr] sm:items-center">
        <div className="flex flex-col items-center">
          <div className="relative size-[7.5rem]">
            <svg className="size-full -rotate-90" viewBox="0 0 100 100" aria-hidden>
              <circle
                cx="50"
                cy="50"
                r="42"
                fill="none"
                stroke="rgba(255,255,255,0.08)"
                strokeWidth="8"
              />
              <circle
                cx="50"
                cy="50"
                r="42"
                fill="none"
                stroke="#8A0201"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={dashOffset}
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-2xl font-bold tabular-nums text-[#F4F6F3]">
              {MATCH_PCT}%
            </span>
          </div>
          <p className="mt-2 max-w-[8rem] text-center text-[10px] leading-snug text-[#8E908C]">
            Coincidencia con tus gustos
          </p>
        </div>

        <ul className="space-y-2.5">
          {GENRE_BARS.map((row) => (
            <li key={row.label}>
              <div className="mb-1 flex justify-between text-[11px] text-[#F4F6F3]/80">
                <span>{row.label}</span>
                <span className="tabular-nums text-[#8E908C]">{row.pct}%</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-white/8">
                <div
                  className="h-full rounded-full bg-[#8A0201]"
                  style={{ width: `${row.pct}%` }}
                />
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-6 border-t border-white/8 pt-5">
        <p className="text-[11px] font-medium uppercase tracking-wider text-[#8E908C]">
          Directores favoritos
        </p>
        <ul className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {directors.map((director) => (
            <li key={director.name} className="text-center">
              <div className="relative mx-auto size-11 overflow-hidden rounded-full border border-white/10 bg-[#101009]">
                {director.photoUrl ? (
                  <Image
                    src={director.photoUrl}
                    alt=""
                    fill
                    sizes="44px"
                    className="object-cover"
                  />
                ) : (
                  <span className="flex size-full items-center justify-center text-xs font-semibold text-[#8A0201]">
                    {director.name.slice(0, 1)}
                  </span>
                )}
              </div>
              <p className="mt-1.5 truncate text-[11px] font-medium text-[#F4F6F3]">
                {director.name}
              </p>
              <p className="text-[10px] text-[#8E908C]">{director.count} películas</p>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}
