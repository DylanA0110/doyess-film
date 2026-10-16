'use client';

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

/** Fila editorial — clic abre ficha completa (sin marco sunset). */
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
      className={cn(
        'df-title-row group w-full text-left',
        !interactive && 'cursor-default opacity-80',
        className,
      )}
      aria-label={interactive ? `Ver ficha de ${title}` : title}
    >
      <div className="df-title-row__poster">
        <MoviePoster src={posterUrl} alt={title} sizes="52px" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-[#F4F6F3] group-hover:text-white">
          {title}
        </p>
        {subtitle ? <p className="mt-0.5 truncate text-xs text-zinc-500">{subtitle}</p> : null}
        {userRating != null ? (
          <p className="mt-1 flex items-center gap-1 text-[11px] font-medium text-zinc-400">
            <Star className="size-3 fill-amber-400 text-amber-400" aria-hidden />
            Tu nota · {userRating}/10
          </p>
        ) : null}
      </div>
      {userRating != null ? (
        <span
          className="flex shrink-0 items-center gap-1 rounded-md border border-white/10 bg-[#0a0a09] px-2 py-1 text-sm font-semibold tabular-nums text-amber-400"
          aria-hidden
        >
          {userRating}
        </span>
      ) : null}
    </button>
  );
}
