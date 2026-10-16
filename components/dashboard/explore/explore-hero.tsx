'use client';

import Image from 'next/image';
import type { ExploreCardItem, ExplorePagePayload } from '@/lib/recommendation/lanes/build-explore-lanes';

type ExploreHeroProps = {
  hero: NonNullable<ExplorePagePayload['hero']>;
  onOpenItem: (item: ExploreCardItem) => void;
};

export function ExploreHero({ hero, onOpenItem }: ExploreHeroProps) {
  const { item, explain, badgeLabel } = hero;

  return (
    <section
      className="relative overflow-hidden rounded-2xl border border-white/8 bg-[#101009]"
      aria-labelledby="explore-hero-title"
    >
      <div className="absolute inset-0">
        {item.posterUrl ? (
          <Image
            src={item.posterUrl}
            alt=""
            fill
            className="object-cover opacity-25 blur-sm"
            sizes="100vw"
            priority
          />
        ) : null}
        <div className="absolute inset-0 bg-gradient-to-r from-[#050000] via-[#050000]/92 to-[#050000]/40" />
      </div>

      <div className="relative grid gap-5 p-4 sm:grid-cols-[minmax(0,9rem)_1fr] sm:items-center sm:gap-6 sm:p-8 lg:min-h-[min(42vh,24rem)]">
        <button
          type="button"
          onClick={() => onOpenItem(item)}
          className="relative mx-auto aspect-[2/3] w-full max-w-[9rem] overflow-hidden rounded-xl border border-white/10 text-left shadow-2xl transition hover:border-white/25 sm:mx-0 sm:max-w-[11rem]"
          aria-label={`Ver ficha de ${item.title}`}
        >
          {item.posterUrl ? (
            <Image
              src={item.posterUrl}
              alt=""
              fill
              sizes="176px"
              className="object-cover"
              priority
            />
          ) : null}
          <div className="absolute left-2 top-2 rounded-full border border-[#8A0201]/40 bg-[#050000]/80 px-2 py-0.5 text-[10px] font-semibold text-[#F4F6F3] sm:px-2.5 sm:text-[11px]">
            {badgeLabel}
          </div>
        </button>

        <div className="min-w-0 text-center sm:text-left">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-amber-500/90">
            Destacado para vos
          </p>
          <h1
            id="explore-hero-title"
            className="mt-2 text-2xl font-bold tracking-tight text-[#F4F6F3] sm:text-3xl lg:text-4xl"
          >
            {item.title}
          </h1>
          {item.year ? (
            <p className="mt-1 text-sm text-zinc-500">{item.year}</p>
          ) : null}

          <p className="mt-3 max-w-xl text-sm leading-relaxed text-zinc-400">{explain}</p>

          {item.overview ? (
            <p className="mt-2 line-clamp-3 max-w-xl text-xs text-zinc-500">{item.overview}</p>
          ) : null}

          <button
            type="button"
            onClick={() => onOpenItem(item)}
            className="mt-5 inline-flex rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm font-medium text-[#F4F6F3] transition hover:bg-white/10"
          >
            Ver ficha y calificar
          </button>
        </div>
      </div>
    </section>
  );
}
