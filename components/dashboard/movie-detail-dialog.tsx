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
  const { data: detail, isLoading, isError } = useMediaDetail(
    target?.mediaType,
    target?.tmdbId,
    open && Boolean(target),
  );
  const submitRating = useSubmitRating(userId);
  const [draft, setDraft] = React.useState<number | null>(null);
  const [gustosNotice, setGustosNotice] = React.useState(false);

  React.useEffect(() => {
    if (open && target) {
      setDraft(target.userRating ?? null);
    } else if (!open) {
      setDraft(null);
      setGustosNotice(false);
    }
  }, [open, target?.tmdbId, target?.userRating, target]);

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
          window.setTimeout(() => onOpenChange(false), 1400);
        },
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-h-[min(92vh,44rem)] w-[calc(100vw-1rem)] max-w-lg overflow-y-auto overscroll-contain border border-white/10 bg-[#101009] p-0 text-[#F4F6F3] sm:w-full"
        showCloseButton
      >
        <DialogHeader className="border-b border-white/[0.06] px-4 pb-4 pt-5 pr-12 sm:px-5">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
            {mediaLabel}
          </p>
          <DialogTitle className="text-xl font-semibold">{title}</DialogTitle>
          <p className="text-sm text-zinc-500">
            {detail?.year ?? target?.year ?? '—'}
            {detail?.genres?.length ? ` · ${detail.genres.slice(0, 4).join(', ')}` : ''}
          </p>
        </DialogHeader>

        <div className="flex flex-col gap-4 px-4 pb-6 sm:flex-row sm:px-5">
          {poster ? (
            <div className="relative mx-auto h-40 w-[7.5rem] shrink-0 overflow-hidden rounded-md ring-1 ring-white/10 sm:mx-0 sm:h-44 sm:w-32">
              <Image src={poster} alt={title} fill sizes="128px" className="object-cover" />
            </div>
          ) : null}
          <div className="min-w-0 flex-1 space-y-4">
            {target?.userRating != null && draft === target.userRating ? (
              <p className="flex items-center gap-2 text-sm text-zinc-300">
                <Star className="size-4 fill-amber-400 text-amber-400" />
                Tu nota: <span className="font-semibold tabular-nums">{target.userRating}</span>
              </p>
            ) : null}
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
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-zinc-500">
                  Calificar esto
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
