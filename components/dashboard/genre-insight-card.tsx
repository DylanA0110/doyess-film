'use client';

import { Star } from 'lucide-react';
import type { DashboardGenreInsight } from '@/components/dashboard/types';
import { MoviePoster } from '@/components/dashboard/movie-poster';

type GenreInsightCardProps = {
  insight: DashboardGenreInsight;
};

export function GenreInsightCard({ insight }: GenreInsightCardProps) {
  return (
    <section className="rounded-2xl border border-[#8A0201]/25 bg-gradient-to-br from-[#8A0201]/10 to-transparent p-6">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8A0201]">
        Por qué domina {insight.genre}
      </p>
      <p className="mt-3 text-sm leading-relaxed text-zinc-300">{insight.explanation}</p>
      <p className="mt-2 text-xs text-zinc-500">
        {insight.titlesWithGenre} títulos etiquetados · {insight.percent}% de tus etiquetas de
        género
      </p>

      {insight.sampleTitles.length > 0 ? (
        <div className="mt-5">
          <p className="text-xs font-medium text-zinc-400">Títulos que más pesan en este patrón</p>
          <ul className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {insight.sampleTitles.map((item) => (
              <li
                key={item.id}
                className="flex gap-3 rounded-xl border border-white/8 bg-black/30 p-2.5"
              >
                <div className="relative h-16 w-11 shrink-0 overflow-hidden rounded-md">
                  <MoviePoster src={item.posterUrl} alt={item.title} sizes="44px" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-[#F4F6F3]">{item.title}</p>
                  <p className="text-[10px] text-zinc-500">
                    {item.year ?? '—'}
                    {item.titleKind === 'series' ? ' · Serie' : ' · Película'}
                  </p>
                  <p className="mt-0.5 flex items-center gap-1 text-xs text-amber-400/90">
                    <Star className="size-3 fill-current" />
                    {item.userRating}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}
