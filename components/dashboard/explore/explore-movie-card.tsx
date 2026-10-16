'use client';

import Image from 'next/image';
import type { ExploreCardItem } from '@/lib/recommendation/lanes/build-explore-lanes';
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
        className="block w-full text-left"
        aria-label={`Ver ficha de ${item.title}`}
      >
        <div className="relative aspect-[2/3] overflow-hidden rounded-xl border border-white/8 bg-zinc-900 transition hover:border-white/20">
          {item.posterUrl ? (
            <Image
              src={item.posterUrl}
              alt=""
              fill
              sizes="(max-width: 640px) 28vw, 148px"
              className="object-cover transition duration-300 group-hover:scale-[1.02]"
            />
          ) : null}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#050000]/80 via-transparent to-transparent" />

          <span
            className="absolute left-1.5 top-1.5 max-w-[calc(100%-0.75rem)] truncate rounded-md border border-white/10 bg-[#050000]/75 px-1.5 py-0.5 text-[9px] font-semibold text-[#F4F6F3] backdrop-blur-sm sm:text-[10px]"
          >
            {item.matchBadge}
          </span>

          <span
            className="absolute right-1.5 top-1.5 rounded-md border border-white/10 bg-[#050000]/60 px-1 py-0.5 text-[9px] text-zinc-300 backdrop-blur-sm"
          >
            {typeLabel}
          </span>
        </div>

        <h3 className="mt-2 line-clamp-2 text-xs font-medium leading-snug text-[#F4F6F3] sm:text-sm">
          {item.title}
        </h3>
        {item.vibeTags.length > 0 ? (
          <p className="mt-0.5 line-clamp-1 text-[10px] text-zinc-500">
            {item.vibeTags.join(' · ')}
          </p>
        ) : null}
      </button>
    </article>
  );
}
