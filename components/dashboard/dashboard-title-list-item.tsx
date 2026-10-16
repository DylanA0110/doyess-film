'use client';

import * as React from 'react';
import { MoviePoster } from '@/components/dashboard/movie-poster';
import { Star } from 'lucide-react';
import { cn } from 'cn';

type DashboardTitleListItemProps = {
  title: string;
  subtitle?: string;
  posterUrl: string;
  userRating?: number | null;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
};

export function DashboardTitleListItem({
  title,
  subtitle,
  posterUrl,
  userRating,
  onClick,
  disabled,
  className,
}: DashboardTitleListItemProps) {
  const interactive = Boolean(onClick) && !disabled;

  return (
    <button
      type="button"
      disabled={!interactive}
      onClick={onClick}
      className={cn('df-title-sunset', className)}
    >
      <div className="df-sunset-card">
        <div className="df-sunset-card__glass">
          <span className="df-title-sunset__blob" aria-hidden />
          <div className="df-title-sunset__glass df-sunset-card__content">
            <div className="df-title-sunset__poster">
              <MoviePoster src={posterUrl} alt={title} sizes="48px" />
            </div>
            <div className="min-w-0 flex-1 py-0.5">
              <p className="truncate text-sm font-bold text-[#F4F6F3]">{title}</p>
              {subtitle ? (
                <p className="text-xs text-[#c4a035]/90">{subtitle}</p>
              ) : null}
            </div>
            {userRating != null ? (
              <span className="flex shrink-0 items-center gap-1 self-center text-sm tabular-nums text-zinc-100">
                <Star className="size-3.5 fill-amber-400 text-amber-400" />
                {userRating}
              </span>
            ) : null}
          </div>
        </div>
      </div>
    </button>
  );
}
