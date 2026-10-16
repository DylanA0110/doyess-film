'use client';

import * as React from 'react';
import { MoviePoster } from '@/components/dashboard/movie-poster';
import { Star } from 'lucide-react';

type DashboardSunsetPosterCardProps = {
  title: string;
  year?: number | null;
  userRating?: number | null;
  posterUrl: string;
  onClick?: () => void;
  sizes?: string;
};

/** Tarjeta tipo “sunset” de la referencia: marco gradiente + vidrio + póster al fondo. */
export function DashboardSunsetPosterCard({
  title,
  year,
  userRating,
  posterUrl,
  onClick,
  sizes = '200px',
}: DashboardSunsetPosterCardProps) {
  return (
    <button type="button" onClick={onClick} className="df-ref-sunset">
      <div className="df-ref-sunset__frame">
        <div className="df-ref-sunset__glass">
          <div className="df-ref-sunset__details">
            <p className="df-ref-sunset__title">{title}</p>
            <p className="df-ref-sunset__body">
              {year ?? '—'}
              {userRating != null ? (
                <span className="df-ref-sunset__rating">
                  <Star className="size-3 fill-amber-400 text-amber-400" aria-hidden />
                  {userRating}
                </span>
              ) : null}
            </p>
          </div>
          <div className="df-ref-sunset__art" aria-hidden>
            <MoviePoster src={posterUrl} alt="" sizes={sizes} />
          </div>
        </div>
      </div>
    </button>
  );
}
