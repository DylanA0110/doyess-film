'use client';

import Image from 'next/image';
import { Play } from 'lucide-react';
import type { LandingSpotlightMovie } from '@/lib/tmdb/landing-hero';

type LandingSpotlightMovieProps = {
  movie: LandingSpotlightMovie;
};

export function LandingSpotlightMovieCard({ movie }: LandingSpotlightMovieProps) {
  return (
    <div className="relative z-20 w-[min(100%,13.5rem)] sm:w-56">
      <div className="relative overflow-hidden rounded-xl border border-white/12 bg-[#0A0505] shadow-[0_32px_64px_rgba(0,0,0,0.65)] ring-1 ring-white/5">
        <div className="relative aspect-[2/3] w-full">
          <Image
            src={movie.posterUrl}
            alt={movie.title}
            fill
            priority
            sizes="(max-width: 640px) 216px, 224px"
            className="object-cover"
          />
        </div>
        <div className="border-t border-white/10 bg-[#0A0505]/95 px-3 py-2.5 backdrop-blur-sm">
          <p className="text-xs font-semibold text-[#F4F6F3]">{movie.title}</p>
          <p className="mt-0.5 text-[10px] text-[#8E908C]">
            {movie.year} • {movie.genres}
          </p>
          <div className="mt-2 flex items-center justify-between gap-2">
            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[#F4F6F3]">
              <span className="text-amber-400">★</span>
              {movie.rating.toFixed(1)}
            </span>
            <span className="rounded bg-[#F5C518] px-1.5 py-0.5 text-[9px] font-black tracking-tight text-black">
              IMDb
            </span>
          </div>
        </div>
      </div>
      <button
        type="button"
        className="absolute -right-3 top-1/2 flex size-11 -translate-y-1/2 items-center justify-center rounded-full bg-[#8A0201] text-white shadow-[0_8px_24px_rgba(138,2,1,0.55)] ring-4 ring-[#050000]/80 transition hover:scale-105"
        aria-label={`Reproducir ${movie.title}`}
      >
        <Play className="size-4 fill-current" />
      </button>
    </div>
  );
}
