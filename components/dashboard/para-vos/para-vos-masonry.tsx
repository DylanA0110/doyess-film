'use client';

import * as React from 'react';
import type { ProfileHighlight } from '@/components/dashboard/types';
import { FlipRevealCard } from '@/components/dashboard/flip-reveal-card';
import { ParaVosDiscoverHint } from '@/components/dashboard/para-vos/para-vos-discover-hint';

type ParaVosMasonryProps = {
  highlights: ProfileHighlight[];
  onOpenGenreDetail?: () => void;
};

export function ParaVosMasonry({ highlights, onOpenGenreDetail }: ParaVosMasonryProps) {
  const cards = highlights.filter((h) => h.kind !== 'daily');

  if (cards.length === 0) {
    return (
      <p className="py-12 text-center text-sm text-zinc-500">
        Importa tu CSV para desbloquear tus cartas de descubrimiento.
      </p>
    );
  }

  return (
    <>
      <ParaVosDiscoverHint />
      <section
        aria-label="Cartas de descubrimiento"
        className="para-vos-masonry"
        style={{ '--para-vos-cols-cap': cards.length } as React.CSSProperties}
      >
      {cards.map((h) => (
        <div key={h.kind} className="card-animation-layer">
          <article className="para-vos-masonry-card card">
            <FlipRevealCard
              highlight={h}
              onGenreDetail={h.openGenreDetail ? onOpenGenreDetail : undefined}
            />
          </article>
        </div>
      ))}
      </section>
    </>
  );
}
