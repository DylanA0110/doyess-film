'use client';

import { MoviePoster } from '@/components/dashboard/movie-poster';
import type { ExploreCardItem } from '@/lib/recommendation/lanes/build-explore-lanes';
import { Star } from 'lucide-react';
import { cn } from 'cn';

type ExploreMovieCardProps = {
  item: ExploreCardItem;
  onOpenItem: (item: ExploreCardItem) => void;
  className?: string;
};

export function ExploreMovieCard({ item, onOpenItem, className }: ExploreMovieCardProps) {
  const typeLabel = item.mediaType === 'tv' ? 'Serie' : 'Película';

  return (
    <article
      className={cn(
        'group relative w-[clamp(6.75rem,28vw,9.25rem)] shrink-0 snap-start',
        className,
      )}
    >
      <button
        type="button"
        onClick={() => onOpenItem(item)}
        className="df-magic-card block w-full text-left"
        aria-label={`Ver ficha de ${item.title}`}
      >
        <div className="df-magic-card__inner">
          <div className="df-magic-card__poster aspect-[2/3]">
            <MoviePoster
              src={item.posterUrl}
              alt={item.title}
              sizes="(max-width: 640px) 28vw, 148px"
            />
            <span
              className="absolute left-1.5 top-1.5 z-[2] max-w-[calc(100%-0.75rem)] truncate rounded-md border border-white/10 bg-[#050000]/80 px-1.5 py-0.5 text-[9px] font-semibold text-[#F4F6F3] backdrop-blur-sm sm:text-[10px]"
            >
              {item.matchBadge}
            </span>
            <span
              className="absolute right-1.5 top-1.5 z-[2] rounded-md border border-white/10 bg-[#050000]/70 px-1 py-0.5 text-[9px] text-zinc-300"
            >
              {typeLabel}
            </span>
            {item.userRating != null ? (
              <span
                className="absolute bottom-1.5 right-1.5 z-[2] flex items-center gap-0.5 rounded-md border border-amber-500/30 bg-[#050000]/85 px-1.5 py-0.5 text-[10px] font-semibold tabular-nums text-amber-400"
              >
                <Star className="size-2.5 fill-current" aria-hidden />
                {item.userRating}
              </span>
            ) : null}
          </div>
          <div className="df-magic-card__meta">
            <p className="df-magic-card__title line-clamp-2">{item.title}</p>
            {item.vibeTags.length > 0 ? (
              <p className="df-magic-card__sub line-clamp-1 text-[10px] text-zinc-500">
                {item.vibeTags.join(' · ')}
              </p>
            ) : null}
          </div>
        </div>
      </button>
    </article>
  );
}
