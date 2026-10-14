'use client';

import * as React from 'react';
import Link from 'next/link';
import type { DailyPickResult } from '@/components/dashboard/types';

type DailyPickHeroCardProps = {
  pick: DailyPickResult;
  userId: string;
  centered?: boolean;
  /** Tras el ritual de revelación: mostrar la carta 3D sin fade inicial. */
  immediateEnter?: boolean;
};

export function DailyPickHeroCard({
  pick,
  userId,
  centered,
  immediateEnter,
}: DailyPickHeroCardProps) {
  const { movie, synopsis, reason, dayLabel, tmdbVoteAverage } = pick;
  const poster = movie.posterUrl?.trim();
  const [entered, setEntered] = React.useState(immediateEnter ?? false);

  React.useEffect(() => {
    if (immediateEnter) {
      setEntered(true);
      return;
    }
    const dateKey = `${dayLabel.month}-${dayLabel.day}`;
    const storageKey = `doyess-daily-entered:${userId}:${dateKey}`;
    const already = sessionStorage.getItem(storageKey) === '1';
    if (already) {
      setEntered(true);
      return;
    }
    const id = window.setTimeout(() => {
      setEntered(true);
      sessionStorage.setItem(storageKey, '1');
    }, 120);
    return () => window.clearTimeout(id);
  }, [userId, dayLabel.day, dayLabel.month, immediateEnter]);

  const scoreLabel =
    tmdbVoteAverage != null ? `TMDB ${tmdbVoteAverage.toFixed(1)}/10` : null;

  return (
    <section
      aria-labelledby={centered ? undefined : 'daily-pick-title'}
      className={centered ? 'mb-2 w-full' : 'mb-2'}
    >
      {!centered ? (
        <div className="mb-3">
          <h2 id="daily-pick-title" className="text-sm font-semibold text-[#F4F6F3]">
            Película del día
          </h2>
          <p className="mt-1 text-xs text-zinc-500">{reason}</p>
        </div>
      ) : null}
      {centered && reason ? (
        <p className="mb-4 text-center text-xs text-zinc-500">{reason}</p>
      ) : null}
      <div
        data-daily-stage
        data-centered={centered ? 'true' : 'false'}
        data-entered={entered ? 'true' : 'false'}
        className="flex w-full justify-center"
      >
        <div data-daily-shell>
          <div data-daily-parent tabIndex={0}>
            <article data-daily-card aria-label={`Película del día: ${movie.title}`}>
            <div data-daily-top>
              <div data-daily-poster-wrap>
                {poster ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={poster}
                    alt=""
                    data-daily-poster
                    referrerPolicy={poster.startsWith('http') ? 'no-referrer' : undefined}
                  />
                ) : null}
              </div>
              <div data-daily-head>
                <div data-daily-date aria-hidden="true">
                  <span data-daily-month>{dayLabel.month}</span>
                  <span data-daily-day>{dayLabel.day}</span>
                </div>
                <h3 data-daily-title>{movie.title}</h3>
                {movie.year ? <p data-daily-year>{movie.year}</p> : null}
                {scoreLabel ? <p data-daily-score>{scoreLabel}</p> : null}
              </div>
            </div>
            <div data-daily-content>
              <p data-daily-synopsis>{synopsis}</p>
              <Link href="/dashboard/pelicula-del-dia" data-daily-cta>
                Ver ficha completa
              </Link>
            </div>
            </article>
          </div>
        </div>
      </div>
    </section>
  );
}
