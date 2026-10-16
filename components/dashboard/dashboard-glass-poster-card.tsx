'use client';

import * as React from 'react';
import { MoviePoster } from '@/components/dashboard/movie-poster';
import { Star } from 'lucide-react';

type DashboardGlassPosterCardProps = {
  title: string;
  year?: number | null;
  userRating?: number | null;
  posterUrl: string;
  onClick?: () => void;
  sizes?: string;
};

/** Tarjeta vidrio + blob animado (referencia) en paleta Doyess. */
export function DashboardGlassPosterCard({
  title,
  year,
  userRating,
  posterUrl,
  onClick,
  sizes = '200px',
}: DashboardGlassPosterCardProps) {
  return (
    <button type="button" onClick={onClick} className="df-glass-poster">
      <div className="df-glass-poster__blob" aria-hidden />
      <div className="df-glass-poster__glass">
        <div className="df-glass-poster__poster">
          <MoviePoster src={posterUrl} alt={title} sizes={sizes} />
        </div>
        <div className="df-glass-poster__meta">
          <p className="df-glass-poster__title">{title}</p>
          <p className="df-glass-poster__sub">
            <span>{year ?? '—'}</span>
            {userRating != null ? (
              <span className="df-glass-poster__rating">
                <Star className="size-3 fill-amber-400 text-amber-400" aria-hidden />
                {userRating}
              </span>
            ) : null}
          </p>
        </div>
      </div>
    </button>
  );
}
