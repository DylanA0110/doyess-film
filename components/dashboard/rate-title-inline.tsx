'use client';

import * as React from 'react';
import Image from 'next/image';
import { X } from 'lucide-react';
import { StarRating } from '@/components/ui/star-rating';
import { useRateFlowStore } from '@/stores/rate-flow-store';
import { useSubmitRating } from '@/hooks/use-submit-rating';
import { getTmdbPosterUrl } from '@/lib/tmdb/images';

type RateTitleInlineProps = {
  userId: string;
};

export function RateTitleInline({ userId }: RateTitleInlineProps) {
  const selected = useRateFlowStore((s) => s.selected);
  const clearSelection = useRateFlowStore((s) => s.clearSelection);
  const submitRating = useSubmitRating(userId);
  const [savedScore, setSavedScore] = React.useState<number | null>(null);

  React.useEffect(() => {
    setSavedScore(null);
  }, [selected?.tmdbId, selected?.mediaType]);

  if (!selected) return null;

  const poster = selected.posterPath ? getTmdbPosterUrl(selected.posterPath, 'w342') : null;

  const rateNow = (score: number) => {
    submitRating.mutate(
      {
        tmdbId: selected.tmdbId,
        mediaType: selected.mediaType,
        rating: score,
      },
      {
        onSuccess: () => {
          setSavedScore(score);
          window.setTimeout(() => clearSelection(), 1600);
        },
      },
    );
  };

  return (
    <div
      className="border-b border-[#8A0201]/30 bg-[#101009]/95 backdrop-blur-md"
      role="region"
      aria-label="Calificar título"
    >
      <div className="mx-auto flex max-w-[1600px] flex-col gap-3 px-3 py-3 sm:flex-row sm:items-center sm:gap-5 sm:px-6 sm:py-4">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <div className="relative h-14 w-10 shrink-0 overflow-hidden rounded-md bg-zinc-900">
            {poster ? (
              <Image src={poster} alt="" fill sizes="40px" className="object-cover" />
            ) : null}
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#8A0201]">
              Tu calificación
            </p>
            <p className="truncate text-sm font-semibold text-[#F4F6F3] sm:text-base">
              {selected.title}
            </p>
            <p className="text-xs text-zinc-500">
              {selected.year ?? '—'} · {selected.mediaType === 'tv' ? 'Serie' : 'Película'}
            </p>
          </div>
        </div>

        <div className="w-full min-w-0 sm:max-w-xl sm:flex-1">
          {savedScore != null ? (
            <p className="text-center text-sm text-emerald-400/90 sm:text-left" role="status">
              Guardado: {savedScore}/10. Actualizando tus gustos…
            </p>
          ) : (
            <StarRating
              variant="imdb"
              imdbProminentLabel
              submitOnSelect
              onRate={rateNow}
              isSubmitting={submitRating.isPending}
              aria-label={`Calificar ${selected.title}`}
            />
          )}
          {submitRating.isError ? (
            <p className="mt-1 text-center text-xs text-rose-400 sm:text-left">
              {submitRating.error.message}
            </p>
          ) : null}
        </div>

        <button
          type="button"
          onClick={clearSelection}
          className="inline-flex items-center justify-center gap-1 self-end text-xs text-zinc-500 hover:text-[#F4F6F3] sm:self-center"
          aria-label="Cerrar"
        >
          <X className="size-4" />
          Cerrar
        </button>
      </div>
    </div>
  );
}
