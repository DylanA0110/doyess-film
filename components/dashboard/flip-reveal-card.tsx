'use client';

import * as React from 'react';
import type { ProfileHighlight } from '@/components/dashboard/types';
import { NEUTRAL_POSTER } from '@/lib/imdb/poster-url';

type FlipRevealCardProps = {
  highlight: ProfileHighlight;
  onGenreDetail?: () => void;
};

export function FlipRevealCard({ highlight, onGenreDetail }: FlipRevealCardProps) {
  const [flipped, setFlipped] = React.useState(false);
  const resolved = highlight.imageUrl?.trim() || NEUTRAL_POSTER;

  const handleClick = () => {
    if (flipped && highlight.openGenreDetail && onGenreDetail) {
      onGenreDetail();
      return;
    }
    setFlipped((v) => !v);
  };

  return (
    <div
      data-flip-card
      onMouseLeave={() => {
        if (typeof window !== 'undefined' && window.matchMedia('(hover: hover)').matches) {
          setFlipped(false);
        }
      }}
    >
      <button
        type="button"
        data-flip-btn
        onClick={handleClick}
        aria-expanded={flipped}
        aria-label={`${highlight.frontLabel}. Toca para voltear.`}
      >
        <div data-flip-inner data-flipped={flipped ? 'true' : 'false'}>
          <div data-flip-face="front">
            <span data-flip-front-label>{highlight.frontLabel}</span>
          </div>
          <div data-flip-face="back">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={resolved}
              alt=""
              data-flip-thumb
              data-round={highlight.roundImage ? 'true' : 'false'}
              referrerPolicy={resolved.startsWith('http') ? 'no-referrer' : undefined}
            />
            <p data-flip-back-title>{highlight.backTitle}</p>
            <span data-flip-kind>{highlight.kindLabel}</span>
            {highlight.stat ? <span data-flip-stat>{highlight.stat}</span> : null}
            <p data-flip-blurb>{highlight.blurb}</p>
          </div>
        </div>
      </button>
    </div>
  );
}
