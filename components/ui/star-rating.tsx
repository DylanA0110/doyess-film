'use client';

import * as React from 'react';
import { Star } from 'lucide-react';
import { cn } from 'cn';

const STAR_COUNT = 10;

const sizeClasses = {
  sm: 'gap-0.5',
  md: 'gap-1',
  lg: 'gap-1.5',
} as const;

const starSizeClasses = {
  sm: 'size-4',
  md: 'size-5',
  lg: 'size-7',
} as const;

export type StarRatingProps = {
  value?: number | null;
  defaultValue?: number | null;
  /** Al elegir estrella (siempre). */
  onValueChange?: (score: number) => void;
  /** Si true (default), onRate se dispara al hacer clic en una estrella. */
  submitOnSelect?: boolean;
  onRate?: (score: number) => void;
  isSubmitting?: boolean;
  size?: keyof typeof sizeClasses;
  variant?: 'default' | 'imdb';
  showHint?: boolean;
  /** Etiqueta grande al hover (estilo IMDb). */
  imdbProminentLabel?: boolean;
  className?: string;
  'aria-label'?: string;
};

export function StarRating({
  value: valueProp,
  defaultValue = null,
  onValueChange,
  submitOnSelect = true,
  onRate,
  isSubmitting = false,
  size = 'md',
  variant = 'default',
  showHint = true,
  imdbProminentLabel = false,
  className,
  'aria-label': ariaLabel = 'Calificación del 1 al 10',
}: StarRatingProps) {
  const [internalValue, setInternalValue] = React.useState<number | null>(defaultValue);
  const [hoverScore, setHoverScore] = React.useState<number | null>(null);

  const committed = valueProp !== undefined ? valueProp : internalValue;
  const displayScore = hoverScore ?? committed ?? 0;
  const labelScore = hoverScore ?? committed;
  const disabled = isSubmitting;

  const commit = (score: number) => {
    if (disabled) return;
    if (valueProp === undefined) setInternalValue(score);
    onValueChange?.(score);
    if (submitOnSelect) onRate?.(score);
  };

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (disabled) return;
    const current = committed ?? 0;
    if (event.key === 'ArrowRight' || event.key === 'ArrowUp') {
      event.preventDefault();
      commit(Math.min(STAR_COUNT, current + 1));
    } else if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') {
      event.preventDefault();
      commit(Math.max(1, current > 0 ? current - 1 : 1));
    }
  };

  return (
    <div
      className={cn(
        'inline-flex flex-col',
        variant === 'imdb' ? 'w-full items-center' : 'items-start',
        className,
      )}
      onMouseLeave={() => setHoverScore(null)}
    >
      {variant === 'imdb' && imdbProminentLabel ? (
        <p
          className="mb-2 flex min-h-[2.75rem] items-baseline justify-center gap-1.5 tabular-nums"
          aria-live="polite"
        >
          {labelScore != null && labelScore > 0 ? (
            <>
              <span className="text-4xl font-bold leading-none text-amber-400 sm:text-5xl">
                {labelScore}
              </span>
              <span className="text-sm font-medium text-zinc-400">
                / {STAR_COUNT}
                {hoverScore != null ? (
                  <span className="text-zinc-500">
                    {' '}
                    · {hoverScore === 1 ? '1 estrella' : `${hoverScore} estrellas`}
                  </span>
                ) : null}
              </span>
            </>
          ) : (
            <span className="text-sm text-zinc-500">Pasa el cursor sobre las estrellas</span>
          )}
        </p>
      ) : null}
      <div
        role="slider"
        aria-label={ariaLabel}
        aria-valuemin={1}
        aria-valuemax={STAR_COUNT}
        aria-valuenow={committed ?? undefined}
        aria-disabled={disabled}
        tabIndex={disabled ? -1 : 0}
        onKeyDown={onKeyDown}
        className={cn(
          'inline-flex max-w-full items-center justify-center rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-[#8A0201]/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#050000]',
          variant === 'imdb' ? 'flex-wrap gap-0.5 sm:flex-nowrap' : sizeClasses[size],
          disabled && 'cursor-not-allowed opacity-50',
        )}
      >
        {Array.from({ length: STAR_COUNT }, (_, i) => {
          const starValue = i + 1;
          const active = starValue <= displayScore;
          return (
            <button
              key={starValue}
              type="button"
              disabled={disabled}
              aria-label={`${starValue} de ${STAR_COUNT}`}
              className={cn(
                'rounded-sm p-0.5 transition-colors duration-200',
                'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-amber-400/80',
                disabled ? 'pointer-events-none' : 'cursor-pointer',
              )}
              onMouseEnter={() => !disabled && setHoverScore(starValue)}
              onFocus={() => !disabled && setHoverScore(starValue)}
              onBlur={() => setHoverScore(null)}
              onClick={() => commit(starValue)}
            >
              <Star
                className={cn(
                  variant === 'imdb' ? 'size-5 sm:size-6' : starSizeClasses[size],
                  'transition-colors duration-200',
                  variant === 'imdb'
                    ? active
                      ? 'fill-amber-400 text-amber-400'
                      : 'fill-transparent text-zinc-100'
                    : active
                      ? 'fill-amber-400 text-amber-400 drop-shadow-[0_0_6px_rgba(251,191,36,0.35)]'
                      : 'fill-zinc-800/80 text-zinc-600',
                )}
                strokeWidth={variant === 'imdb' ? 1.25 : 1.5}
                aria-hidden
              />
            </button>
          );
        })}
      </div>
      {showHint && !(variant === 'imdb' && imdbProminentLabel) ? (
        <p className="mt-1.5 min-h-[1.25rem] text-xs tabular-nums text-zinc-500">
          {disabled ? (
            <span className="text-zinc-600">Guardando…</span>
          ) : displayScore > 0 ? (
            <span>
              <span className="font-semibold text-amber-400/90">{displayScore}</span>
              <span className="text-zinc-600"> / {STAR_COUNT}</span>
              {hoverScore != null ? <span className="text-zinc-500"> · clic para guardar</span> : null}
            </span>
          ) : (
            <span>Pasa el cursor y elige tu nota</span>
          )}
        </p>
      ) : null}
      {variant === 'imdb' && imdbProminentLabel && !disabled ? (
        <p className="mt-2 text-center text-[11px] text-zinc-500">
          Clic en una estrella para guardar (como en IMDb)
        </p>
      ) : null}
    </div>
  );
}
