'use client';

import type { ExploreCardItem, ExploreLanePayload } from '@/lib/recommendation/lanes/build-explore-lanes';
import { ExploreMovieCard } from '@/components/dashboard/explore/explore-movie-card';

type ExploreLaneRowProps = {
  lane: ExploreLanePayload;
  onOpenItem: (item: ExploreCardItem) => void;
};

export function ExploreLaneRow({ lane, onOpenItem }: ExploreLaneRowProps) {
  if (lane.items.length === 0) return null;

  return (
    <section className="space-y-3" aria-labelledby={`lane-${lane.id}`}>
      <header className="px-0.5">
        {lane.eyebrow ? (
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#8A0201]">
            {lane.eyebrow}
          </p>
        ) : null}
        <h2 id={`lane-${lane.id}`} className="mt-1 text-lg font-semibold text-[#F4F6F3] sm:text-xl">
          {lane.title}
        </h2>
        {lane.subtitle ? (
          <p className="mt-1 max-w-2xl text-xs text-zinc-500">{lane.subtitle}</p>
        ) : null}
      </header>
      <div
        className="explore-lane-scroll -mx-1 flex gap-2.5 overflow-x-auto overscroll-x-contain px-1 pb-2 snap-x snap-mandatory sm:gap-3"
      >
        {lane.items.map((item) => (
          <ExploreMovieCard key={item.mediaRef} item={item} onOpenItem={onOpenItem} />
        ))}
      </div>
    </section>
  );
}
