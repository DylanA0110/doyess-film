'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { DashboardGenreInsight, DashboardStats } from '@/components/dashboard/types';
import type { MovieDetailTarget } from '@/components/dashboard/movie-detail-dialog';
import { KpiGenreTasteBody } from '@/components/dashboard/kpi-genre-taste-body';
import { DashboardTitleListItem } from '@/components/dashboard/dashboard-title-list-item';

export type KpiDetailKind = 'catalog' | 'rating' | 'genre' | 'screen';

type KpiDetailDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  kind: KpiDetailKind | null;
  stats: DashboardStats;
  genreInsight?: DashboardGenreInsight | null;
  onSelectRating?: (rating: number) => void;
  onOpenTitle?: (target: MovieDetailTarget) => void;
};

export function KpiDetailDialog({
  open,
  onOpenChange,
  kind,
  stats,
  genreInsight,
  onSelectRating,
  onOpenTitle,
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
        className="dashboard-dark-scroll max-h-[min(92vh,44rem)] w-[calc(100vw-1rem)] max-w-2xl overflow-y-auto overscroll-contain border border-white/10 bg-[#101009] px-4 pb-8 pt-5 text-[#F4F6F3] sm:px-5 sm:pt-6 sm:w-full"
        showCloseButton
      >
        <DialogHeader className="pr-8">
          <DialogTitle className="text-lg font-semibold text-[#F4F6F3]">{title}</DialogTitle>
        </DialogHeader>

        {kind === 'catalog' ? <CatalogBody stats={stats} /> : null}
        {kind === 'rating' ? (
          <RatingBody stats={stats} onSelectRating={onSelectRating} />
        ) : null}
        {kind === 'genre' ? (
          <>
            <KpiGenreTasteBody
              movies={stats.genreTaste.movies}
              series={stats.genreTaste.series}
            />
            {resolvedGenre?.sampleTitles.length ? (
              <GenreSamples insight={resolvedGenre} onOpenTitle={onOpenTitle} />
            ) : null}
          </>
        ) : null}
        {kind === 'screen' ? <ScreenBody stats={stats} /> : null}
      </DialogContent>
    </Dialog>
  );
}

function CatalogBody({ stats }: { stats: DashboardStats }) {
  const { movies, series, episodes } = stats.titleKindBreakdown;
  return (
    <div className="grid gap-3 sm:grid-cols-3 text-sm">
      <StatLine label="Películas" value={String(movies.count)} />
      <StatLine label="Series" value={String(series.count)} />
      <StatLine label="Capítulos" value={String(episodes.count)} />
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
  return (
    <div className="space-y-4 text-sm">
      <p className="text-3xl font-bold tabular-nums text-[#F4F6F3]">
        {stats.averageRating}
        <span className="text-lg font-semibold text-zinc-500"> /10</span>
      </p>
      <p className="text-zinc-400">{stats.criticPersona.detail}</p>
      {onSelectRating ? (
        <div className="flex flex-wrap gap-2 pt-2">
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
                {rating} <span className="font-normal text-zinc-500">({count})</span>
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

function ScreenBody({ stats }: { stats: DashboardStats }) {
  return (
    <p className="text-2xl font-semibold text-[#F4F6F3]">{stats.screenTimeString}</p>
  );
}

function GenreSamples({
  insight,
  onOpenTitle,
}: {
  insight: DashboardGenreInsight;
  onOpenTitle?: (target: MovieDetailTarget) => void;
}) {
  return (
    <ul className="mt-6 space-y-2 border-t border-white/8 pt-4">
      {insight.sampleTitles.map((item) => (
        <li key={item.id}>
          <DashboardTitleListItem
            title={item.title}
            subtitle={item.year != null ? String(item.year) : '—'}
            posterUrl={item.posterUrl}
            userRating={item.userRating}
            disabled={!item.tmdbId || !onOpenTitle}
            onClick={() =>
              item.tmdbId &&
              onOpenTitle?.({
                tmdbId: item.tmdbId,
                mediaType: item.tmdbMediaType ?? (item.titleKind === 'series' ? 'tv' : 'movie'),
                title: item.title,
                year: item.year,
                userRating: item.userRating,
                posterUrl: item.posterUrl,
              })
            }
          />
        </li>
      ))}
    </ul>
  );
}

function StatLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/[0.08] bg-[#0a0a09] px-3 py-2.5">
      <p className="text-xs text-zinc-500">{label}</p>
      <p className="text-lg font-semibold text-[#F4F6F3]">{value}</p>
    </div>
  );
}
