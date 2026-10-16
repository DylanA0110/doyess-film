'use client';

import { ArrowLeft } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { DashboardMovie } from '@/components/dashboard/types';
import { DashboardTitleListItem } from '@/components/dashboard/dashboard-title-list-item';

type RatingBucketDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  rating: number | null;
  movies: DashboardMovie[];
  onBack?: () => void;
  backLabel?: string;
  onSelectMovie?: (movie: DashboardMovie) => void;
};

export function RatingBucketDialog({
  open,
  onOpenChange,
  rating,
  movies,
  onBack,
  backLabel = 'Volver',
  onSelectMovie,
}: RatingBucketDialogProps) {
  const filtered =
    rating == null
      ? []
      : movies.filter((m) => m.userRating === rating).sort((a, b) =>
          (a.title ?? '').localeCompare(b.title ?? '', 'es'),
        );

  const handleBack = () => {
    onOpenChange(false);
    onBack?.();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-h-[min(92vh,44rem)] w-[calc(100vw-1rem)] max-w-2xl overflow-hidden border border-white/10 bg-[#101009] p-0 text-[#F4F6F3] sm:w-full"
        showCloseButton
      >
        <DialogHeader className="space-y-3 border-b border-white/8 px-4 pb-4 pt-5 pr-12 sm:px-5 sm:pt-6">
          {onBack ? (
            <button
              type="button"
              onClick={handleBack}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-zinc-400 transition hover:text-[#F4F6F3]"
            >
              <ArrowLeft className="size-4 shrink-0" aria-hidden />
              {backLabel}
            </button>
          ) : (
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-zinc-400 transition hover:text-[#F4F6F3]"
            >
              <ArrowLeft className="size-4 shrink-0" aria-hidden />
              Volver al resumen
            </button>
          )}
          <div>
            <DialogTitle className="text-lg font-semibold">
              {rating != null ? `Títulos con nota ${rating}` : 'Calificaciones'}
            </DialogTitle>
            <p className="text-sm text-zinc-500">
              {filtered.length} en tu historial · Esc para cerrar
            </p>
          </div>
        </DialogHeader>
        <ul className="dashboard-dark-scroll max-h-[min(70vh,32rem)] overflow-y-auto overscroll-contain px-3 py-3 sm:px-4">
          {filtered.length === 0 ? (
            <li className="px-2 py-8 text-center text-sm text-zinc-500">
              No hay títulos con esta nota.
            </li>
          ) : (
            filtered.map((movie) => (
              <li key={movie.id} className="mb-1.5">
                <DashboardTitleListItem
                  title={movie.title}
                  subtitle={[
                    movie.year ?? '—',
                    movie.titleKind === 'series' ? 'Serie' : null,
                    movie.director,
                    movie.genres.slice(0, 2).join(' · '),
                  ]
                    .filter(Boolean)
                    .join(' · ')}
                  posterUrl={movie.posterUrl}
                  userRating={movie.userRating}
                  onClick={() => onSelectMovie?.(movie)}
                  disabled={!onSelectMovie}
                />
              </li>
            ))
          )}
        </ul>
      </DialogContent>
    </Dialog>
  );
}
