'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { DashboardMovie } from '@/components/dashboard/types';
import { MoviePoster } from '@/components/dashboard/movie-poster';
import { Star } from 'lucide-react';

type MovieListDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  subtitle?: string;
  movies: DashboardMovie[];
};

export function MovieListDialog({
  open,
  onOpenChange,
  title,
  subtitle,
  movies,
}: MovieListDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-h-[min(92vh,44rem)] w-[calc(100vw-1rem)] max-w-2xl overflow-hidden border border-white/10 bg-[#0c0c0b] p-0 text-[#F4F6F3] sm:w-full"
        showCloseButton
      >
        <DialogHeader className="border-b border-white/8 px-5 pb-4 pt-6 pr-12">
          <DialogTitle className="text-lg font-semibold">{title}</DialogTitle>
          {subtitle ? <p className="text-sm text-zinc-500">{subtitle}</p> : null}
        </DialogHeader>
        <ul className="max-h-[min(70vh,32rem)] overflow-y-auto overscroll-contain px-3 py-3 sm:px-4">
          {movies.length === 0 ? (
            <li className="px-2 py-8 text-center text-sm text-zinc-500">Sin títulos en tu historial.</li>
          ) : (
            movies.map((movie) => (
              <li key={movie.id}>
                <div className="flex gap-3 rounded-xl border border-transparent p-2 transition hover:border-white/10 hover:bg-white/[0.04]">
                  <div className="relative h-[4.5rem] w-12 shrink-0 overflow-hidden rounded-md">
                    <MoviePoster src={movie.posterUrl} alt={movie.title} sizes="48px" />
                  </div>
                  <div className="min-w-0 flex-1 py-0.5">
                    <p className="truncate text-sm font-semibold text-[#F4F6F3]">{movie.title}</p>
                    <p className="text-xs text-zinc-500">
                      {movie.year ?? '—'}
                      {movie.director ? ` · ${movie.director}` : ''}
                    </p>
                    {movie.genres.length > 0 ? (
                      <p className="mt-1 truncate text-[10px] text-zinc-600">
                        {movie.genres.slice(0, 3).join(' · ')}
                      </p>
                    ) : null}
                  </div>
                  {movie.userRating != null ? (
                    <span className="flex shrink-0 items-center gap-1 self-center text-sm tabular-nums">
                      <Star className="size-3.5 fill-amber-400 text-amber-400" />
                      {movie.userRating}
                    </span>
                  ) : null}
                </div>
              </li>
            ))
          )}
        </ul>
      </DialogContent>
    </Dialog>
  );
}
