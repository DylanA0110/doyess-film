'use client';

import { MoviePoster } from '@/components/dashboard/movie-poster';
import { Star } from 'lucide-react';

type DashboardMagicPosterCardProps = {
  title: string;
  year?: number | null;
  userRating?: number | null;
  posterUrl: string;
  onClick?: () => void;
  sizes?: string;
};

/** Uiverse heavy-elephant-39 — borde gradiente + glow; paleta Doyess. */
export function DashboardMagicPosterCard({
  title,
  year,
  userRating,
  posterUrl,
  onClick,
  sizes = '200px',
}: DashboardMagicPosterCardProps) {
  return (
    <button type="button" onClick={onClick} className="df-magic-card group">
      <div className="df-magic-card__inner">
        <div className="df-magic-card__poster">
          <MoviePoster src={posterUrl} alt={title} sizes={sizes} />
        </div>
        <div className="df-magic-card__meta">
          <p className="df-magic-card__title">{title}</p>
          <p className="df-magic-card__sub">
            <span>{year ?? '—'}</span>
            {userRating != null ? (
              <span className="df-magic-card__rating">
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
