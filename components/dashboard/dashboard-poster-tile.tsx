'use client';

import * as React from 'react';
import { MoviePoster } from '@/components/dashboard/movie-poster';

type DashboardPosterTileProps = {
  title: string;
  year?: number | null;
  posterUrl: string;
  onClick?: () => void;
  sizes?: string;
};

export function DashboardPosterTile({
  title,
  year,
  posterUrl,
  onClick,
  sizes = '120px',
}: DashboardPosterTileProps) {
  return (
    <button type="button" onClick={onClick} className="df-blob-card">
      <div className="df-blob-card__shell">
        <div className="df-blob-card__blob" aria-hidden />
        <div className="df-blob-card__media">
          <MoviePoster src={posterUrl} alt={title} sizes={sizes} />
        </div>
        <div className="df-blob-card__meta">
          <div className="df-blob-card__title">{title}</div>
          <div className="df-blob-card__sub">{year ?? '—'}</div>
        </div>
      </div>
    </button>
  );
}
