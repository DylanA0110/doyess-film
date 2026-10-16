'use client';

import * as React from 'react';
import Image from 'next/image';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { StarRating } from '@/components/ui/star-rating';
import { useMediaDetail } from '@/hooks/use-media-detail';
import { useSubmitRating } from '@/hooks/use-submit-rating';
import { getTmdbPosterUrl } from '@/lib/tmdb/images';
import type { TmdbMediaType } from '@/lib/tmdb/find-by-imdb';
import { Star } from 'lucide-react';

export type MovieDetailTarget = {
  tmdbId: number;
  mediaType: TmdbMediaType;
  title: string;
  year?: number;
  userRating?: number;
  posterUrl?: string;
};

type MovieDetailDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  target: MovieDetailTarget | null;
  userId: string;
};

export function MovieDetailDialog({
  open,
  onOpenChange,
  target,
  userId,
}: MovieDetailDialogProps) {
  const { data, isLoading, isError } = useMediaDetail(
    target?.mediaType,
    target?.tmdbId,
    open && Boolean(target),
  );
  const detail = data?.detail;
  const submitRating = useSubmitRating(userId);
  const [draft, setDraft] = React.useState<number | null>(null);
  const [gustosNotice, setGustosNotice] = React.useState(false);

  const resolvedRating =
    draft ??
    data?.userRating ??
    target?.userRating ??
    null;

  React.useEffect(() => {
    if (open && target) {
      setDraft(target.userRating ?? data?.userRating ?? null);
    } else if (!open) {
      setDraft(null);
      setGustosNotice(false);
    }
  }, [open, target?.tmdbId, target?.userRating, target, data?.userRating]);

  React.useEffect(() => {
    if (open && data?.userRating != null && draft == null) {
      setDraft(data.userRating);
    }
  }, [open, data?.userRating, draft]);

  const title = detail?.title ?? target?.title ?? 'Título';
  const overview = detail?.overview?.trim();
  const poster = detail?.posterPath
    ? getTmdbPosterUrl(detail.posterPath, 'w500')
    : target?.posterUrl;
  const mediaLabel = target?.mediaType === 'tv' ? 'Serie' : 'Película';

  const rateNow = (score: number) => {
    if (!target) return;
    setDraft(score);
    submitRating.mutate(
      {
        tmdbId: target.tmdbId,
        mediaType: target.mediaType,
        rating: score,
      },
      {
        onSuccess: () => {
          setGustosNotice(true);
        },
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-h-[min(94vh,46rem)] w-[calc(100vw-0.75rem)] max-w-xl overflow-y-auto overscroll-contain border border-white/10 bg-[#101009] p-0 text-[#F4F6F3] sm:w-full"
        showCloseButton
      >
        <div className="border-b border-white/[0.06] px-4 pb-4 pt-5 pr-12 sm:px-5">
          <DialogHeader className="space-y-1 p-0">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
              {mediaLabel}
            </p>
            <DialogTitle className="text-xl font-semibold leading-tight sm:text-2xl">
              {title}
            </DialogTitle>
            <p className="text-sm text-zinc-500">
              {detail?.year ?? target?.year ?? '—'}
              {detail?.genres?.length ? ` · ${detail.genres.slice(0, 4).join(', ')}` : ''}
            </p>
          </DialogHeader>

          {resolvedRating != null ? (
            <div
              className="mt-4 flex items-center gap-2 rounded-lg border border-amber-500/25 bg-amber-500/10 px-3 py-2"
              role="status"
            >
              <Star className="size-4 shrink-0 fill-amber-400 text-amber-400" aria-hidden />
              <p className="text-sm text-[#F4F6F3]">
                <span className="font-semibold">Tu calificación</span>
                <span className="ml-1.5 text-lg font-bold tabular-nums text-amber-400">
                  {resolvedRating}
                </span>
                <span className="text-zinc-500"> /10</span>
              </p>
            </div>
          ) : (
            <p className="mt-3 text-xs text-zinc-500">Aún no calificaste este título en Doyess.</p>
          )}
        </div>

        <div className="flex flex-col gap-5 px-4 py-5 sm:flex-row sm:px-5">
          {poster ? (
            <div className="df-magic-card mx-auto w-[min(100%,11rem)] shrink-0 sm:mx-0">
              <div className="df-magic-card__inner">
                <div className="df-magic-card__poster aspect-[2/3]">
                  <Image src={poster} alt={title} fill sizes="176px" className="object-cover" />
                </div>
              </div>
            </div>
          ) : null}
          <div className="min-w-0 flex-1 space-y-4">
            {isLoading ? (
              <p className="text-sm text-zinc-500">Cargando sinopsis…</p>
            ) : isError ? (
              <p className="text-sm text-zinc-500">No pudimos cargar la ficha de TMDB.</p>
            ) : overview ? (
              <p className="text-sm leading-relaxed text-zinc-400">{overview}</p>
            ) : (
              <p className="text-sm text-zinc-500">Sin sinopsis disponible.</p>
            )}
            {target ? (
              <div className="border-t border-white/8 pt-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
                  {resolvedRating != null ? 'Cambiar tu nota' : 'Calificar'}
                </p>
                <div className="mt-3">
                  <StarRating
                    value={draft}
                    variant="imdb"
                    imdbProminentLabel
                    submitOnSelect
                    onRate={rateNow}
                    isSubmitting={submitRating.isPending || gustosNotice}
                  />
                </div>
                {gustosNotice ? (
                  <p className="mt-3 text-sm text-emerald-400/90" role="status">
                    Nota guardada. Actualizando tus gustos…
                  </p>
                ) : null}
              </div>
            ) : null}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
