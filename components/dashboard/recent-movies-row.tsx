'use client';

import * as React from 'react';
import Image from 'next/image';
import { Star, ArrowRight } from 'lucide-react';
import type { DashboardMovie } from './types';

interface RecentMoviesRowProps {
  movies: DashboardMovie[];
}

export function RecentMoviesRow({ movies }: RecentMoviesRowProps) {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/8 bg-[#101009] p-6 backdrop-blur-xl">
      {/* Header */}
      <div className="flex items-center justify-between pb-4">
        <h3 className="text-base font-bold tracking-tight text-[#F4F6F3]">
          Películas recientes
        </h3>
        <button
          type="button"
          className="group flex items-center gap-1 text-xs text-[#F4F6F3]/50 hover:text-[#F4F6F3] transition"
        >
          <span>Ver todas</span>
          <ArrowRight className="size-3 text-[#F4F6F3]/40 group-hover:translate-x-0.5 transition" />
        </button>
      </div>

      {/* 5-poster Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {movies.slice(0, 5).map((movie) => (
          <div
            key={movie.id}
            className="group relative flex flex-col overflow-hidden rounded-xl border border-white/8 bg-black/40 transition hover:border-[#8A0201]/60 hover:scale-[1.02]"
          >
            {/* Poster */}
            <div className="relative aspect-2/3 w-full overflow-hidden bg-zinc-900">
              <Image
                src={movie.posterUrl}
                alt={movie.title}
                fill
                sizes="(max-width: 640px) 50vw, 120px"
                className="object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-linear-to-t from-black/80 via-transparent to-transparent" />
            </div>

            {/* Title & Rating */}
            <div className="p-2 space-y-1">
              <p className="text-xs font-semibold text-[#F4F6F3] truncate">
                {movie.title}
              </p>
              {movie.userRating !== undefined && (
                <div className="flex items-center gap-1 text-[11px] font-medium text-amber-400">
                  <Star className="size-3 fill-amber-400" />
                  <span>{movie.userRating.toFixed(1)}</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
