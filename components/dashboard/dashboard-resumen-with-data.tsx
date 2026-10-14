'use client';

import * as React from 'react';
import {
  ArrowRight,
  Bookmark,
  ChevronDown,
  FileSpreadsheet,
  RefreshCw,
  Star,
  TrendingUp,
} from 'lucide-react';
import type { DashboardMovie, DashboardStats } from '@/components/dashboard/types';
import { Button } from '@/components/ui/button';
import { EnrichmentFootnote } from '@/components/dashboard/enrichment-footnote';
import { useSilentTmdbEnrich } from '@/hooks/use-silent-tmdb-enrich';
import { DashboardPaginatedSection } from '@/components/dashboard/dashboard-paginated-section';
import { FavoriteGenresChart } from '@/components/dashboard/favorite-genres-chart';
import { RatingDistributionRecharts } from '@/components/dashboard/rating-distribution-recharts';
import {
  KpiDetailDialog,
  type KpiDetailKind,
} from '@/components/dashboard/kpi-detail-dialog';
import { MoviePoster } from '@/components/dashboard/movie-poster';
import { PersonAvatar } from '@/components/dashboard/person-avatar';
import { RatingBucketDialog } from '@/components/dashboard/rating-bucket-dialog';
import { MovieListDialog } from '@/components/dashboard/movie-list-dialog';
import { moviesForPersonName } from '@/lib/dashboard/person-movie-lookup';
import { cn } from 'cn';

type DashboardResumenWithDataProps = {
  userId: string;
  userName: string;
  stats: DashboardStats;
  recentMovies: DashboardMovie[];
  catalogMovies: DashboardMovie[];
  personMovieLookup: Record<string, DashboardMovie[]>;
  onOpenImporter: () => void;
};

export function DashboardResumenWithData({
  userId,
  userName,
  stats,
  recentMovies,
  catalogMovies,
  personMovieLookup,
  onOpenImporter,
}: DashboardResumenWithDataProps) {
  const movieCatalog = catalogMovies.filter((m) => m.titleKind === 'movie' || !m.titleKind);
  useSilentTmdbEnrich(stats.pendingEnrichmentCount);

  const [kpiOpen, setKpiOpen] = React.useState(false);
  const [kpiKind, setKpiKind] = React.useState<KpiDetailKind | null>(null);
  const [genreInsight, setGenreInsight] = React.useState(
    stats.dominantGenreInsight,
  );
  const [bucketOpen, setBucketOpen] = React.useState(false);
  const [bucketRating, setBucketRating] = React.useState<number | null>(null);
  const [listOpen, setListOpen] = React.useState(false);
  const [listTitle, setListTitle] = React.useState('');
  const [listMovies, setListMovies] = React.useState<DashboardMovie[]>([]);

  const openMovieList = (title: string, movies: DashboardMovie[]) => {
    setListTitle(title);
    setListMovies(movies);
    setListOpen(true);
  };

  const openPerson = (name: string) => {
    openMovieList(name, moviesForPersonName(personMovieLookup, name));
  };

  const openRatingBucket = (rating: number) => {
    setBucketRating(rating);
    setBucketOpen(true);
  };

  const openKpi = (kind: KpiDetailKind, genreName?: string) => {
    setKpiKind(kind);
    if (kind === 'genre') {
      const name = genreName ?? stats.dominantGenreName;
      setGenreInsight(stats.genreInsightsByName[name] ?? stats.dominantGenreInsight);
    }
    setKpiOpen(true);
  };

  const latestRatings = recentMovies.slice(0, 4);

  return (
    <div className="space-y-10">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-medium text-[#8A0201]">Hola, {userName}</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#F4F6F3] sm:text-4xl">
            Tu perfil cinematográfico
          </h1>
          <p className="mt-2 text-sm text-zinc-500">
            Patrones de tu historial IMDb. Toca una métrica para ver el detalle.
          </p>
        </div>
        <div className="flex flex-col items-start gap-2 sm:items-end">
          {stats.lastUpdatedLabel ? (
            <p className="text-xs text-zinc-500">
              Última actualización: {stats.lastUpdatedLabel}
            </p>
          ) : null}
          <Button
            type="button"
            variant="outline"
            onClick={onOpenImporter}
            className="rounded-full border-white/15 bg-transparent text-xs text-zinc-300 hover:bg-white/5"
          >
            <RefreshCw className="mr-2 size-3.5" />
            Actualizar historial
          </Button>
        </div>
      </header>

      <EnrichmentFootnote
        pendingEnrichmentCount={stats.pendingEnrichmentCount}
        withoutPosterCount={stats.withoutPosterCount}
      />

      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        <KpiCard
          icon={<FileSpreadsheet className="size-4" />}
          label="Películas calificadas"
          value={String(stats.moviesWatched)}
          sub={stats.moviesWatchedDelta}
          onClick={() => openKpi('catalog')}
        />
        <KpiCard
          icon={<Star className="size-4 fill-amber-400 text-amber-400" />}
          label="Nota media"
          value={
            <>
              {stats.averageRating}
              <span className="text-lg font-semibold text-zinc-500"> / 10</span>
            </>
          }
          sub={stats.averageRatingDelta}
          onClick={() => openKpi('rating')}
        />
        <KpiCard
          icon={<TrendingUp className="size-4" />}
          label="Género dominante"
          value={stats.dominantGenreName}
          sub={`${stats.dominantGenrePercent}% en tus películas`}
          valueClassName="text-2xl sm:text-3xl"
          onClick={() => openKpi('genre')}
        />
        <KpiCard
          icon={<Bookmark className="size-4" />}
          label="Tiempo estimado"
          value={stats.screenTimeString}
          sub={stats.screenTimeDelta}
          valueClassName="text-2xl sm:text-3xl"
          onClick={() => openKpi('screen')}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <RatingDistributionRecharts
          distribution={stats.ratingDistribution}
          onSelectRating={openRatingBucket}
        />

        <div className="rounded-2xl border border-white/8 bg-zinc-900/80 p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-[#F4F6F3]">Tus géneros</h2>
            <button
              type="button"
              className="inline-flex items-center gap-1 text-xs text-zinc-500"
            >
              Todos
              <ChevronDown className="size-3.5" />
            </button>
          </div>
          <ul className="mt-5 space-y-3">
            {stats.topGenres.map((genre) => (
              <li key={genre.name}>
                <button
                  type="button"
                  disabled={genre.name === 'Otros'}
                  onClick={() => openKpi('genre', genre.name)}
                  className={cn(
                    'w-full text-left',
                    genre.name !== 'Otros' && 'cursor-pointer rounded-lg py-0.5 hover:bg-white/5',
                  )}
                >
                  <div className="mb-1 flex justify-between text-xs">
                    <span className="text-zinc-300">{genre.name}</span>
                    <span className="tabular-nums text-zinc-500">{genre.percentage}%</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-white/8">
                    <div
                      className="h-full rounded-full bg-[#8A0201]"
                      style={{ width: `${genre.percentage}%` }}
                    />
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <FavoriteGenresChart
        stats={stats}
        onSelectGenre={(name) => openKpi('genre', name)}
      />

      <DashboardPaginatedSection
        title="Directores que más valoras"
        subtitle="Nota media en tu historial."
        items={stats.topDirectors}
        emptyMessage="Importa tu CSV para ver directores."
        gridClassName="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
        renderItem={(director) => (
          <button
            type="button"
            key={director.name}
            onClick={() => openPerson(director.name)}
            className="flex w-full items-center gap-4 rounded-xl border border-white/8 bg-zinc-900/60 p-4 text-left transition hover:border-[#8A0201]/35 hover:bg-zinc-900"
          >
            <div className="relative size-14 shrink-0 overflow-hidden rounded-full">
              <PersonAvatar src={director.photoUrl} alt={director.name} />
            </div>
            <div className="min-w-0">
              <div className="truncate text-sm font-semibold text-[#F4F6F3]">{director.name}</div>
              <div className="mt-1 flex items-center gap-1 text-sm text-[#8A0201]">
                <Star className="size-3.5 fill-current" />
                {director.avgRating.toFixed(1)}
              </div>
              <div className="text-xs text-zinc-500">
                {director.movieCount} películas · toca para ver
              </div>
            </div>
          </button>
        )}
      />

      <DashboardPaginatedSection
        title="Actores y actrices recurrentes"
        subtitle="Los que más aparecen en títulos que calificaste."
        items={stats.recurringCast}
        emptyMessage="Sincroniza TMDB para ver reparto."
        gridClassName="grid gap-3 sm:grid-cols-2 lg:grid-cols-4"
        renderItem={(person) => (
          <button
            type="button"
            key={`${person.roleLabel}-${person.name}`}
            onClick={() => openPerson(person.name)}
            className="flex w-full items-center gap-3 rounded-xl border border-white/8 bg-zinc-900/60 p-3 text-left transition hover:border-[#8A0201]/35 hover:bg-zinc-900"
          >
            <div className="relative size-11 shrink-0 overflow-hidden rounded-full">
              <PersonAvatar src={person.photoUrl} alt={person.name} />
            </div>
            <div className="min-w-0">
              <div className="truncate text-sm font-medium text-[#F4F6F3]">{person.name}</div>
              <div className="text-xs text-zinc-500">{person.count} películas</div>
            </div>
          </button>
        )}
      />

      <DashboardPaginatedSection
        title="Películas con 10"
        subtitle="Tus calificaciones perfectas."
        items={stats.moviesRated10}
        emptyMessage="Aún no tienes ninguna calificación de 10."
        gridClassName="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5"
        renderItem={(movie) => (
          <button
            type="button"
            key={movie.id}
            onClick={() => openMovieList(movie.title, [movie])}
            className="overflow-hidden rounded-xl border border-white/8 bg-zinc-900/50 text-left transition hover:border-[#8A0201]/35"
          >
            <div className="relative aspect-[2/3]">
              <MoviePoster src={movie.posterUrl} alt={movie.title} sizes="180px" />
            </div>
            <div className="p-2.5">
              <div className="truncate text-xs font-semibold text-[#F4F6F3]">{movie.title}</div>
              <div className="text-[10px] text-zinc-500">{movie.year ?? '—'}</div>
            </div>
          </button>
        )}
      />

      <section>
        <div className="flex items-center justify-between gap-4">
          <h2 className="flex items-center gap-2 text-base font-semibold text-[#F4F6F3]">
            Tus últimas calificaciones
            <ArrowRight className="size-4 text-zinc-600" />
          </h2>
        </div>
        <p className="mt-1 text-sm text-zinc-500">Lo más reciente de tu importación.</p>
        <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {latestRatings.map((movie) => (
            <button
              type="button"
              key={movie.id}
              onClick={() => openMovieList(movie.title, [movie])}
              className="overflow-hidden rounded-xl border border-white/8 bg-zinc-900/50 text-left transition hover:border-[#8A0201]/35"
            >
              <div className="relative aspect-[2/3]">
                <MoviePoster src={movie.posterUrl} alt={movie.title} sizes="25vw" />
              </div>
              <div className="p-3">
                <div className="truncate text-sm font-semibold text-[#F4F6F3]">{movie.title}</div>
                <div className="mt-1 flex items-center justify-between text-xs text-zinc-500">
                  <span>{movie.year ?? '—'}</span>
                  {movie.userRating ? (
                    <span className="flex items-center gap-1 text-[#F4F6F3]">
                      <Star className="size-3 fill-amber-400 text-amber-400" />
                      {movie.userRating}
                    </span>
                  ) : null}
                </div>
              </div>
            </button>
          ))}
        </div>
      </section>

      <KpiDetailDialog
        open={kpiOpen}
        onOpenChange={setKpiOpen}
        kind={kpiKind}
        stats={stats}
        genreInsight={genreInsight}
        onSelectRating={(rating) => {
          setKpiOpen(false);
          openRatingBucket(rating);
        }}
      />

      <RatingBucketDialog
        open={bucketOpen}
        onOpenChange={setBucketOpen}
        rating={bucketRating}
        movies={movieCatalog}
      />

      <MovieListDialog
        open={listOpen}
        onOpenChange={setListOpen}
        title={listTitle}
        subtitle={`${listMovies.length} en tu historial`}
        movies={listMovies}
      />
    </div>
  );
}

function KpiCard({
  icon,
  label,
  value,
  sub,
  valueClassName,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
  sub: string;
  valueClassName?: string;
  onClick?: () => void;
}) {
  const className = cn(
    'rounded-2xl border border-white/8 bg-zinc-900/80 p-5 text-left transition',
    onClick && 'cursor-pointer hover:border-white/15 hover:bg-zinc-900',
  );

  const inner = (
    <>
      <div className="flex items-center justify-between gap-2 text-xs text-zinc-400">
        <span className="flex items-center gap-2">
          <span className="text-zinc-300">{icon}</span>
          {label}
        </span>
      </div>
      <div
        className={`mt-3 font-bold tracking-tight text-[#F4F6F3] ${valueClassName ?? 'text-3xl sm:text-4xl'}`}
      >
        {value}
      </div>
      <div className="mt-2 text-xs text-zinc-500">{sub}</div>
    </>
  );

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={className}
        aria-label={`${label}: ver detalle`}
      >
        {inner}
      </button>
    );
  }

  return <div className={className}>{inner}</div>;
}
