import Link from 'next/link';
import { redirect } from 'next/navigation';
import { connection } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { isDevSkipAuth } from '@/lib/auth/dev-mode';
import { DEV_USER } from '@/lib/auth/dev-user';
import { loadTodayDailyPickRow } from '@/lib/dashboard/load-today-daily-pick';
import { resolvePosterUrl } from '@/lib/imdb/poster-url';
import { fetchMovieDetail } from '@/lib/tmdb/movie-public';
import { getTmdbBackdropUrl } from '@/lib/tmdb/images';

export const instant = false;

function formatTmdbScore(vote: number): string {
  return `${vote.toFixed(1)}/10`;
}

export default async function PeliculaDelDiaPage() {
  await connection();

  let userId: string;
  if (isDevSkipAuth()) {
    userId = DEV_USER.id;
  } else {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) redirect('/?from=/dashboard/pelicula-del-dia');
    userId = user.id;
  }

  const supabase = await createSupabaseServerClient();
  const pick = await loadTodayDailyPickRow(supabase, userId);
  if (!pick) {
    redirect('/dashboard');
  }

  const detail = await fetchMovieDetail(pick.tmdb_id);
  const title = detail?.title ?? pick.title;
  const overview = detail?.overview?.trim() || pick.overview?.trim() || '';
  const year = pick.release_year ?? (detail?.release_date ? detail.release_date.slice(0, 4) : null);
  const poster = resolvePosterUrl(detail?.poster_path ?? pick.poster_path);
  const backdrop = detail?.backdrop_path ? getTmdbBackdropUrl(detail.backdrop_path, 'w1280') : null;
  const imdbId = detail?.imdb_id ?? pick.imdb_id;
  const tmdbVote = detail?.vote_average;
  const runtime = detail?.runtime;
  const genres = detail?.genres?.map((g) => g.name) ?? [];

  return (
    <div className="min-h-screen bg-[#050000] text-[#F4F6F3]">
      <div className="relative overflow-hidden border-b border-white/8">
        {backdrop ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={backdrop}
            alt=""
            className="absolute inset-0 h-full w-full object-cover opacity-35"
            referrerPolicy="no-referrer"
          />
        ) : null}
        <div className="relative mx-auto flex max-w-3xl flex-col gap-6 px-4 py-8 sm:px-6 sm:py-10">
          <Link
            href="/dashboard"
            className="text-xs font-medium text-zinc-400 transition hover:text-[#F4F6F3]"
          >
            ← Volver a Para vos
          </Link>
          <p className="text-xs font-semibold uppercase tracking-wider text-[#8A0201]">
            Película del día
          </p>
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={poster}
              alt=""
              className="mx-auto w-40 shrink-0 rounded-md border border-white/10 shadow-lg sm:mx-0 sm:w-44"
              referrerPolicy={poster.startsWith('http') ? 'no-referrer' : undefined}
            />
            <div className="min-w-0 flex-1">
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{title}</h1>
              {year ? <p className="mt-1 text-sm text-zinc-400">{year}</p> : null}
              <dl className="mt-4 flex flex-wrap gap-3 text-sm">
                {tmdbVote != null ? (
                  <div className="rounded-lg border border-white/10 bg-black/40 px-3 py-2">
                    <dt className="text-[10px] font-semibold uppercase tracking-wide text-zinc-500">
                      TMDB
                    </dt>
                    <dd className="font-semibold text-[#F4F6F3]">{formatTmdbScore(tmdbVote)}</dd>
                  </div>
                ) : null}
                {runtime ? (
                  <div className="rounded-lg border border-white/10 bg-black/40 px-3 py-2">
                    <dt className="text-[10px] font-semibold uppercase tracking-wide text-zinc-500">
                      Duración
                    </dt>
                    <dd className="font-semibold">{runtime} min</dd>
                  </div>
                ) : null}
              </dl>
              {genres.length > 0 ? (
                <p className="mt-3 text-xs text-zinc-400">{genres.join(' · ')}</p>
              ) : null}
              <p className="mt-4 text-sm leading-relaxed text-zinc-300">{pick.reason}</p>
            </div>
          </div>
        </div>
      </div>

      <article className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-10">
        <h2 className="text-sm font-semibold text-[#F4F6F3]">Sinopsis</h2>
        <p className="mt-3 text-sm leading-relaxed text-zinc-400">
          {overview || 'Sinopsis no disponible en TMDB.'}
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          {imdbId ? (
            <a
              href={`https://www.imdb.com/title/${imdbId}/`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center rounded-lg border border-[#8A0201] bg-[#8A0201] px-5 py-3 text-sm font-semibold text-[#F4F6F3] transition hover:bg-[#a00302]"
            >
              Ver en IMDb
            </a>
          ) : null}
          <a
            href={`https://www.themoviedb.org/movie/${pick.tmdb_id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center rounded-lg border border-white/15 bg-[#141414] px-5 py-3 text-sm font-semibold text-[#F4F6F3] transition hover:border-white/25"
          >
            Ficha en TMDB
          </a>
        </div>
        <p className="mt-6 text-xs text-zinc-600">
          No tenemos la nota de IMDb en vivo (solo tu export). La puntuación mostrada es la de la
          comunidad en TMDB.
        </p>
      </article>
    </div>
  );
}
