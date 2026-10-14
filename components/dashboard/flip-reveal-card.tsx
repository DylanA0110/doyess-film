'use client';

import * as React from 'react';
import type { ProfileHighlight } from '@/components/dashboard/types';
import { NEUTRAL_POSTER } from '@/lib/imdb/poster-url';

type FlipRevealCardProps = {
  highlight: ProfileHighlight;
  onGenreDetail?: () => void;
};

const SWIPE_THRESHOLD_PX = 36;

export function FlipRevealCard({ highlight, onGenreDetail }: FlipRevealCardProps) {
  const [flipped, setFlipped] = React.useState(false);
  const touchStart = React.useRef<{ x: number; y: number } | null>(null);
  const swipeJustFired = React.useRef(false);
  const resolved = highlight.imageUrl?.trim() || NEUTRAL_POSTER;

  const toggleFlip = () => {
    setFlipped((v) => !v);
  };

  const handleClick = () => {
    if (swipeJustFired.current) {
      swipeJustFired.current = false;
      return;
    }
    if (flipped && highlight.openGenreDetail && onGenreDetail) {
      onGenreDetail();
      return;
    }
    toggleFlip();
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0];
    touchStart.current = { x: t.clientX, y: t.clientY };
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const start = touchStart.current;
    touchStart.current = null;
    if (!start) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - start.x;
    const dy = t.clientY - start.y;
    if (Math.abs(dx) < SWIPE_THRESHOLD_PX || Math.abs(dx) < Math.abs(dy)) return;
    swipeJustFired.current = true;
    toggleFlip();
  };

  return (
    <div data-flip-card>
      <button
        type="button"
        data-flip-btn
        onClick={handleClick}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        aria-expanded={flipped}
        aria-label={`${highlight.frontLabel}. Tocá o deslizá horizontalmente para revelar.`}
      >
        <div data-flip-inner data-flipped={flipped ? 'true' : 'false'}>
          <div data-flip-face="front">
            <span data-flip-front-eyebrow>{highlight.kindLabel}</span>
            <span data-flip-front-label>{highlight.frontLabel}</span>
            <span data-flip-reveal-hint data-hint="touch">
              Deslizá ↔ o tocá para revelar
            </span>
            <span data-flip-reveal-hint data-hint="pointer">
              Clic para revelar
            </span>
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
            <div data-flip-back-title>{highlight.backTitle}</div>
            <span data-flip-kind>{highlight.kindLabel}</span>
            {highlight.stat ? <span data-flip-stat>{highlight.stat}</span> : null}
            <div data-flip-blurb>{highlight.blurb}</div>
            <span data-flip-back-hint>Tocá de nuevo para volver</span>
          </div>
        </div>
      </button>
    </div>
  );
}
