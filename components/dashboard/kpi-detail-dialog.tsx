'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { DashboardGenreInsight, DashboardStats } from '@/components/dashboard/types';
import { MoviePoster } from '@/components/dashboard/movie-poster';
import { Star } from 'lucide-react';

export type KpiDetailKind = 'catalog' | 'rating' | 'genre' | 'screen';

type KpiDetailDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  kind: KpiDetailKind | null;
  stats: DashboardStats;
  genreInsight?: DashboardGenreInsight | null;
  onSelectRating?: (rating: number) => void;
};

export function KpiDetailDialog({
  open,
  onOpenChange,
  kind,
  stats,
  genreInsight,
  onSelectRating,
}: KpiDetailDialogProps) {
  if (!kind) return null;

  const title =
    kind === 'catalog'
      ? 'Películas calificadas'
      : kind === 'rating'
        ? 'Nota media'
        : kind === 'genre'
          ? genreInsight?.genre ?? stats.dominantGenreName
          : 'Tiempo de pantalla';

  const resolvedGenre =
    genreInsight ??
    (kind === 'genre' ? stats.genreInsightsByName[stats.dominantGenreName] : null);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-h-[min(92vh,44rem)] w-[calc(100vw-1rem)] max-w-2xl overflow-y-auto overscroll-contain border border-white/10 bg-[#0c0c0b] px-5 pb-8 pt-6 text-[#F4F6F3] sm:w-full"
        showCloseButton
      >
        <DialogHeader className="pr-8">
          <DialogTitle className="text-lg font-semibold text-[#F4F6F3]">{title}</DialogTitle>
        </DialogHeader>

        {kind === 'catalog' ? <CatalogBody stats={stats} /> : null}
        {kind === 'rating' ? (
          <RatingBody stats={stats} onSelectRating={onSelectRating} />
        ) : null}
        {kind === 'genre' && resolvedGenre ? <GenreBody insight={resolvedGenre} /> : null}
        {kind === 'genre' && !resolvedGenre ? (
          <p className="text-sm text-zinc-400">No hay datos de género para mostrar.</p>
        ) : null}
        {kind === 'screen' ? <ScreenBody stats={stats} /> : null}
      </DialogContent>
    </Dialog>
  );
}

function CatalogBody({ stats }: { stats: DashboardStats }) {
  const { movies, series } = stats.titleKindBreakdown;
  return (
    <div className="space-y-4 text-sm text-zinc-400">
      <p>
        Tienes <span className="text-[#F4F6F3]">{stats.moviesWatched}</span> títulos con nota en
        tu CSV.
        {stats.catalogSinceYear ? ` Tu historial llega hasta ${stats.catalogSinceYear}.` : null}
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        <StatLine label="Películas" value={String(movies.count)} hint={`Media ${movies.avgRating || '—'}`} />
        <StatLine label="Series" value={String(series.count)} hint={`Media ${series.avgRating || '—'}`} />
      </div>
    </div>
  );
}

function RatingBody({
  stats,
  onSelectRating,
}: {
  stats: DashboardStats;
  onSelectRating?: (rating: number) => void;
}) {
  const low = stats.ratingDistribution.slice(0, 4).reduce((a, b) => a + b, 0);
  const { median, highPercent, highCount } = stats.ratingSummary;
  return (
    <div className="space-y-4 text-sm text-zinc-400">
      <p>
        Media{' '}
        <span className="font-semibold text-[#F4F6F3]">{stats.averageRating}</span>/10 · mediana{' '}
        <span className="font-semibold text-[#F4F6F3]">{median}</span>
      </p>
      <p>{stats.averageRatingDelta}</p>
      <p>
        {highCount} títulos con nota ≥8 ({highPercent}%) · {low} con nota 1–4.
      </p>
      {onSelectRating ? (
        <div>
          <p className="mb-2 text-xs text-zinc-500">Toca una nota para ver títulos</p>
          <div className="flex flex-wrap gap-2">
            {stats.ratingDistribution.map((count, index) => {
              const rating = index + 1;
              if (count === 0) return null;
              return (
                <button
                  key={rating}
                  type="button"
                  onClick={() => onSelectRating(rating)}
                  className="rounded-full border border-white/10 bg-zinc-900/80 px-3 py-1.5 text-xs font-semibold text-[#F4F6F3] transition hover:border-[#8A0201]/50 hover:bg-[#8A0201]/15"
                >
                  {rating}{' '}
                  <span className="font-normal text-zinc-500">({count})</span>
                </button>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function ScreenBody({ stats }: { stats: DashboardStats }) {
  const { movies, series } = stats.titleKindBreakdown;
  return (
    <div className="space-y-3 text-sm text-zinc-400">
      <p>
        Estimación total: <span className="text-[#F4F6F3]">{stats.screenTimeString}</span> según
        duración del CSV (y TMDB cuando está disponible).
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        <StatLine label="Películas" value={movies.screenTimeString} />
        <StatLine label="Series" value={series.screenTimeString} />
      </div>
    </div>
  );
}

function GenreBody({ insight }: { insight: DashboardGenreInsight }) {
  return (
    <div className="space-y-4">
      <p className="text-sm leading-relaxed text-zinc-400">{insight.explanation}</p>
      {insight.sampleTitles.length > 0 ? (
        <ul className="space-y-2">
          {insight.sampleTitles.map((item) => (
            <li
              key={item.id}
              className="flex gap-3 rounded-xl border border-white/8 bg-zinc-950/50 p-2.5 transition hover:border-[#8A0201]/35 hover:bg-zinc-900/80"
            >
              <div className="relative h-14 w-10 shrink-0 overflow-hidden rounded">
                <MoviePoster src={item.posterUrl} alt={item.title} sizes="40px" />
              </div>
              <div className="min-w-0 flex-1 py-0.5">
                <p className="truncate text-sm text-[#F4F6F3]">{item.title}</p>
                <p className="text-xs text-zinc-500">
                  {item.year ?? '—'}
                  {item.titleKind === 'series' ? ' · Serie' : ''}
                </p>
              </div>
              <span className="flex items-center gap-1 self-center text-sm tabular-nums text-zinc-300">
                <Star className="size-3.5 fill-amber-400 text-amber-400" />
                {item.userRating}
              </span>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

function StatLine({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="rounded-lg border border-white/8 px-3 py-2.5">
      <p className="text-xs text-zinc-500">{label}</p>
      <p className="text-lg font-semibold text-[#F4F6F3]">{value}</p>
      {hint ? <p className="text-xs text-zinc-500">{hint}</p> : null}
    </div>
  );
}
