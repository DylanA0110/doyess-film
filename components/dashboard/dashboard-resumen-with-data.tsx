'use client';

import * as React from 'react';
import {
  ArrowRight,
  Bookmark,
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
import { DashboardAuroraStatCard } from '@/components/dashboard/dashboard-aurora-stat-card';
import { DashboardKpiCompactCard } from '@/components/dashboard/dashboard-kpi-compact-card';
import { DashboardMagicPosterCard } from '@/components/dashboard/dashboard-magic-poster-card';
import { ClientOnlyLabel } from '@/components/dashboard/client-only-label';
import { DashboardPersonGallery } from '@/components/dashboard/dashboard-person-gallery';
import { PersonAvatar } from '@/components/dashboard/person-avatar';
import { RatingBucketDialog } from '@/components/dashboard/rating-bucket-dialog';
import { MovieListDialog } from '@/components/dashboard/movie-list-dialog';
import {
  MovieDetailDialog,
  type MovieDetailTarget,
} from '@/components/dashboard/movie-detail-dialog';
import { moviesForPersonName } from '@/lib/dashboard/person-movie-lookup';
import { dashboardMovieToDetailTarget } from '@/lib/dashboard/movie-detail-target';
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
  const [bucketFromKpi, setBucketFromKpi] = React.useState(false);
  const [listOpen, setListOpen] = React.useState(false);
  const [listTitle, setListTitle] = React.useState('');
  const [listMovies, setListMovies] = React.useState<DashboardMovie[]>([]);
  const [detailOpen, setDetailOpen] = React.useState(false);
  const [detailTarget, setDetailTarget] = React.useState<MovieDetailTarget | null>(null);
  const [gallery, setGallery] = React.useState<'directores' | 'actores' | null>(null);

  const openDetail = (movie: DashboardMovie) => {
    const target = dashboardMovieToDetailTarget(movie);
    if (!target) {
      openMovieList(movie.title, [movie]);
      return;
    }
    setDetailTarget(target);
    setDetailOpen(true);
  };

  const openMovieList = (title: string, movies: DashboardMovie[]) => {
    setListTitle(title);
    setListMovies(movies);
    setListOpen(true);
  };

  const openPerson = (name: string) => {
    openMovieList(name, moviesForPersonName(personMovieLookup, name));
  };

  const openRatingBucket = (rating: number, fromKpi = false) => {
    setBucketRating(rating);
    setBucketFromKpi(fromKpi);
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
  const ratingSparkline = React.useMemo(
    () => stats.ratingDistribution,
    [stats.ratingDistribution],
  );

  React.useEffect(() => {
    if (!gallery) return;
    document.getElementById('dashboard-main')?.scrollTo({ top: 0 });
  }, [gallery]);

  if (gallery === 'directores') {
    return (
      <>
        <DashboardPersonGallery
          title="Directores que más valoras"
          subtitle="Pasa el cursor: la foto se abre. Toca una card para ver su filmografía."
          items={stats.topDirectors.map((d) => ({
            key: d.name,
            name: d.name,
            photoUrl: d.photoUrl,
            lines: [`${d.avgRating.toFixed(1)} nota media`, `${d.movieCount} en tu historial`],
          }))}
          onBack={() => setGallery(null)}
          onSelect={openPerson}
        />
        <MovieListDialog
          open={listOpen}
          onOpenChange={setListOpen}
          title={listTitle}
          subtitle={`${listMovies.length} en tu historial`}
          movies={listMovies}
          onSelectMovie={openDetail}
        />
        <MovieDetailDialog
          open={detailOpen}
          onOpenChange={setDetailOpen}
          target={detailTarget}
          userId={userId}
        />
      </>
    );
  }

  if (gallery === 'actores') {
    return (
      <>
        <DashboardPersonGallery
          title="Actores y actrices recurrentes"
          subtitle="El mismo zoom de perfil. Sin redes: solo tu historial."
          items={stats.recurringCast.map((p) => ({
            key: `${p.roleLabel}-${p.name}`,
            name: p.name,
            photoUrl: p.photoUrl,
            lines: [`${p.count} películas`],
          }))}
          onBack={() => setGallery(null)}
          onSelect={openPerson}
        />
        <MovieListDialog
          open={listOpen}
          onOpenChange={setListOpen}
          title={listTitle}
          subtitle={`${listMovies.length} en tu historial`}
          movies={listMovies}
          onSelectMovie={openDetail}
        />
        <MovieDetailDialog
          open={detailOpen}
          onOpenChange={setDetailOpen}
          target={detailTarget}
          userId={userId}
        />
      </>
    );
  }

  return (
    <div className="space-y-10">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-medium text-[#8A0201]">Hola, {userName}</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#F4F6F3] sm:text-4xl">
            Tu perfil cinematográfico
          </h1>
          <p className="mt-2 text-sm text-zinc-500">
            Patrones de tu historial. Toca una métrica o un póster para ver el detalle.
          </p>
        </div>
        <div className="flex flex-col items-start gap-2 sm:items-end">
          <ClientOnlyLabel>
            {stats.lastUpdatedLabel ? (
              <p className="text-xs text-zinc-500">
                Última actualización: {stats.lastUpdatedLabel}
              </p>
            ) : null}
          </ClientOnlyLabel>
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

      <div className="df-kpi-grid">
        <DashboardKpiCompactCard
          eyebrow="Catálogo"
          value={String(stats.moviesWatched)}
          hint={`${stats.titleKindBreakdown.movies.count} películas · ${stats.titleKindBreakdown.series.count} series · ${stats.moviesWatchedDelta}`}
          icon={<FileSpreadsheet className="size-5 text-[#8A0201]" />}
          onClick={() => openKpi('catalog')}
        />
        <DashboardAuroraStatCard
          title="Nota media"
          subtitle="Distribución de tus estrellas"
          icon={<Star className="size-5 fill-[#c4a035] text-[#c4a035]" />}
          primary={{
            label: 'Promedio',
            value: `${stats.averageRating} / 10`,
            hint: stats.averageRatingDelta,
            hintTone: 'up',
          }}
          secondary={{
            label: 'Con 8+',
            value: `${stats.ratingSummary.highPercent}%`,
            hint: `${stats.ratingSummary.highCount} títulos`,
            hintTone: 'neutral',
          }}
          sparkline={ratingSparkline}
          onClick={() => openKpi('rating')}
        />
        <DashboardKpiCompactCard
          eyebrow="Género dominante"
          value={stats.dominantGenreName}
          hint={`${stats.dominantGenrePercent}% · ${stats.growingGenre.name} ${stats.growingGenre.delta}`}
          icon={<TrendingUp className="size-5 text-[#8A0201]" />}
          onClick={() => openKpi('genre')}
        />
        <DashboardKpiCompactCard
          eyebrow="Tiempo en pantalla"
          value={stats.screenTimeString}
          hint={`Cine ${stats.titleKindBreakdown.movies.screenTimeString} · Series ${stats.titleKindBreakdown.series.screenTimeString}`}
          icon={<Bookmark className="size-5 text-[#8A0201]" />}
          onClick={() => openKpi('screen')}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3 lg:items-stretch">
        <RatingDistributionRecharts
          distribution={stats.ratingDistribution}
          onSelectRating={openRatingBucket}
        />
        <FavoriteGenresChart
          stats={stats}
          compact
          onSelectGenre={(name) => openKpi('genre', name)}
        />
      </div>

      <DashboardPaginatedSection
        title="Directores que más valoras"
        subtitle="Nota media en tu historial."
        items={stats.topDirectors}
        emptyMessage="Importa tu CSV para ver directores."
        gridClassName="grid gap-2 sm:grid-cols-2 lg:grid-cols-3"
        previewCount={3}
        headerAction={
          stats.topDirectors.length > 0 ? (
            <button
              type="button"
              onClick={() => setGallery('directores')}
              className="text-sm font-medium text-[#8A0201] hover:underline"
            >
              Ver todos
            </button>
          ) : null
        }
        renderItem={(director) => (
          <button
            key={director.name}
            type="button"
            onClick={() => openPerson(director.name)}
            className="df-person-row"
            aria-label={`Director ${director.name}`}
          >
            <div className="relative size-9 shrink-0 overflow-hidden rounded-full ring-1 ring-[#8A0201]/35">
              <PersonAvatar src={director.photoUrl} alt={director.name} />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-[#F4F6F3]">{director.name}</p>
              <p className="mt-0.5 flex items-center gap-1 text-xs text-zinc-400">
                <Star className="size-3 fill-current text-[#8A0201]" />
                {director.avgRating.toFixed(1)}
                <span>· {director.movieCount} películas</span>
              </p>
            </div>
          </button>
        )}
      />

      <DashboardPaginatedSection
        title="Actores y actrices recurrentes"
        subtitle="Los que más aparecen en títulos que calificaste."
        items={stats.recurringCast}
        emptyMessage="Sincroniza TMDB para ver reparto."
        gridClassName="grid gap-2 sm:grid-cols-2 lg:grid-cols-3"
        previewCount={3}
        headerAction={
          stats.recurringCast.length > 0 ? (
            <button
              type="button"
              onClick={() => setGallery('actores')}
              className="text-sm font-medium text-[#8A0201] hover:underline"
            >
              Ver todos
            </button>
          ) : null
        }
        renderItem={(person) => (
          <button
            key={`${person.roleLabel}-${person.name}`}
            type="button"
            onClick={() => openPerson(person.name)}
            className="df-person-row"
            aria-label={person.name}
          >
            <div className="relative size-9 shrink-0 overflow-hidden rounded-full ring-1 ring-[#8A0201]/30">
              <PersonAvatar src={person.photoUrl} alt={person.name} />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-[#F4F6F3]">{person.name}</p>
              <p className="text-xs text-zinc-500">{person.count} películas</p>
            </div>
          </button>
        )}
      />

      <DashboardPaginatedSection
        title="Películas con 10"
        subtitle="Tus calificaciones perfectas."
        items={stats.moviesRated10}
        emptyMessage="Aún no tienes ninguna calificación de 10."
        gridClassName="df-poster-grid"
        renderItem={(movie) => (
          <DashboardMagicPosterCard
            key={movie.id}
            title={movie.title}
            year={movie.year}
            userRating={movie.userRating}
            posterUrl={movie.posterUrl}
            onClick={() => openDetail(movie)}
            sizes="(max-width:640px) 28vw, 120px"
          />
        )}
      />

      {stats.seriesRated10.length > 0 ? (
        <DashboardPaginatedSection
          title="Series con 10"
          subtitle="Tus calificaciones perfectas en series."
          items={stats.seriesRated10}
          emptyMessage="Aún no tienes series con 10."
          gridClassName="df-poster-grid"
          renderItem={(movie) => (
            <DashboardMagicPosterCard
              key={movie.id}
              title={movie.title}
              year={movie.year}
              userRating={movie.userRating}
              posterUrl={movie.posterUrl}
              onClick={() => openDetail(movie)}
              sizes="(max-width:640px) 28vw, 120px"
            />
          )}
        />
      ) : null}

      <section>
        <div className="flex items-center justify-between gap-4">
          <h2 className="flex items-center gap-2 text-base font-semibold text-[#F4F6F3]">
            Tus últimas calificaciones
            <ArrowRight className="size-4 text-zinc-600" />
          </h2>
        </div>
        <p className="mt-1 text-sm text-zinc-500">
          Lo más reciente de tu exportación IMDb.
        </p>
        <div className="df-latest-ratings-grid mt-5">
          {latestRatings.map((movie) => (
            <DashboardMagicPosterCard
              key={movie.id}
              title={movie.title}
              year={movie.year}
              userRating={movie.userRating}
              posterUrl={movie.posterUrl}
              onClick={() => openDetail(movie)}
              sizes="(max-width: 480px) 45vw, 200px"
            />
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
          openRatingBucket(rating, true);
        }}
        onOpenTitle={(target) => {
          setKpiOpen(false);
          setDetailTarget(target);
          setDetailOpen(true);
        }}
      />

      <RatingBucketDialog
        open={bucketOpen}
        onOpenChange={setBucketOpen}
        rating={bucketRating}
        movies={movieCatalog}
        onBack={
          bucketFromKpi
            ? () => {
                setKpiKind('rating');
                setKpiOpen(true);
              }
            : undefined
        }
        backLabel="Volver a nota media"
        onSelectMovie={(movie) => {
          setBucketOpen(false);
          openDetail(movie);
        }}
      />

      <MovieListDialog
        open={listOpen}
        onOpenChange={setListOpen}
        title={listTitle}
        subtitle={`${listMovies.length} en tu historial`}
        movies={listMovies}
        onSelectMovie={openDetail}
      />

      <MovieDetailDialog
        open={detailOpen}
        onOpenChange={setDetailOpen}
        target={detailTarget}
        userId={userId}
      />
    </div>
  );
}
