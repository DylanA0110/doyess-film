'use client';

import * as React from 'react';
import { Search, Star } from 'lucide-react';
import type { DashboardMovie, DashboardStats } from '@/components/dashboard/types';
import { MoviePoster } from '@/components/dashboard/movie-poster';
import {
  MovieDetailDialog,
  type MovieDetailTarget,
} from '@/components/dashboard/movie-detail-dialog';
import { dashboardMovieToDetailTarget } from '@/lib/dashboard/movie-detail-target';
import {
  useCatalogFilters,
  type CatalogKindFilter,
  type CatalogSort,
} from '@/lib/dashboard/use-catalog-filters';
import { cn } from 'cn';

type DashboardBibliotecaProps = {
  userId: string;
  userName: string;
  stats: DashboardStats;
  catalogMovies: DashboardMovie[];
};

const KIND_OPTIONS: { id: CatalogKindFilter; label: string }[] = [
  { id: 'all', label: 'Todo' },
  { id: 'movie', label: 'Películas' },
  { id: 'series', label: 'Series' },
];

const SORT_OPTIONS: { id: CatalogSort; label: string }[] = [
  { id: 'rating-desc', label: 'Nota ↓' },
  { id: 'year-desc', label: 'Año ↓' },
  { id: 'title-asc', label: 'A–Z' },
  { id: 'recent', label: 'Recientes' },
];

export function DashboardBiblioteca({
  userId,
  userName,
  stats,
  catalogMovies,
}: DashboardBibliotecaProps) {
  const filters = useCatalogFilters({ movies: catalogMovies });
  const [detailOpen, setDetailOpen] = React.useState(false);
  const [detailTarget, setDetailTarget] = React.useState<MovieDetailTarget | null>(null);

  const openDetail = (movie: DashboardMovie) => {
    const target = dashboardMovieToDetailTarget(movie);
    if (!target) return;
    setDetailTarget(target);
    setDetailOpen(true);
  };

  const { movies, series } = stats.titleKindBreakdown;

  return (
    <div className="space-y-6 pb-8">
      <header>
        <p className="text-xs font-medium text-[#8A0201]">Biblioteca, {userName}</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#F4F6F3] sm:text-4xl">
          Mi biblioteca
        </h1>
        <p className="mt-2 text-sm text-zinc-500">
          {movies.count} películas · {series.count} series en tu historial
        </p>
      </header>

      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        <div className="relative min-w-0 flex-1 sm:max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-500" />
          <input
            type="search"
            value={filters.query}
            onChange={(e) => filters.setQuery(e.target.value)}
            placeholder="Buscar título o director…"
            className="h-10 w-full rounded-xl border border-white/10 bg-zinc-950/80 pl-9 pr-3 text-sm outline-none focus:border-[#8A0201]/50"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {KIND_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => filters.setKind(opt.id)}
              className={cn(
                'rounded-full px-3 py-1.5 text-xs font-medium transition',
                filters.kind === opt.id
                  ? 'bg-[#8A0201] text-white'
                  : 'border border-white/10 text-zinc-400 hover:bg-white/5',
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs text-zinc-500">Orden:</span>
        {SORT_OPTIONS.map((opt) => (
          <button
            key={opt.id}
            type="button"
            onClick={() => filters.setSort(opt.id)}
            className={cn(
              'rounded-full px-2.5 py-1 text-[11px] transition',
              filters.sort === opt.id
                ? 'bg-white/10 text-[#F4F6F3]'
                : 'text-zinc-500 hover:text-zinc-300',
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {filters.genres.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => filters.setGenre(null)}
            className={cn(
              'rounded-full px-2.5 py-1 text-[11px]',
              !filters.genre ? 'bg-white/10 text-[#F4F6F3]' : 'text-zinc-500',
            )}
          >
            Todos los géneros
          </button>
          {filters.genres.slice(0, 12).map((g) => (
            <button
              key={g}
              type="button"
              onClick={() => filters.setGenre(g)}
              className={cn(
                'rounded-full px-2.5 py-1 text-[11px] transition',
                filters.genre === g
                  ? 'bg-[#8A0201]/25 text-[#F4F6F3]'
                  : 'border border-white/8 text-zinc-500 hover:text-zinc-300',
              )}
            >
              {g}
            </button>
          ))}
        </div>
      ) : null}

      {filters.filtered.length === 0 ? (
        <p className="py-12 text-center text-sm text-zinc-500">Sin títulos con esos filtros.</p>
      ) : (
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7">
          {filters.filtered.map((movie) => (
            <button
              key={movie.id}
              type="button"
              onClick={() => openDetail(movie)}
              className="overflow-hidden rounded-xl border border-white/8 bg-zinc-900/50 text-left transition hover:border-[#8A0201]/35"
            >
              <div className="relative aspect-[2/3]">
                <MoviePoster src={movie.posterUrl} alt={movie.title} sizes="120px" />
              </div>
              <div className="p-2">
                <p className="line-clamp-2 text-[11px] font-medium leading-snug text-[#F4F6F3] sm:text-xs">
                  {movie.title}
                </p>
                <div className="mt-1 flex items-center justify-between text-[10px] text-zinc-500">
                  <span>{movie.year ?? '—'}</span>
                  {movie.userRating != null ? (
                    <span className="flex items-center gap-0.5 text-[#F4F6F3]">
                      <Star className="size-2.5 fill-amber-400 text-amber-400" />
                      {movie.userRating}
                    </span>
                  ) : null}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      <MovieDetailDialog
        open={detailOpen}
        onOpenChange={setDetailOpen}
        target={detailTarget}
        userId={userId}
      />
    </div>
  );
}
