'use client';

import * as React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
const PAGE_SIZE = 12;

type DashboardProfileCarouselSectionProps<T> = {
  title: string;
  subtitle?: string;
  items: T[];
  emptyMessage?: string;
  getKey: (item: T) => string;
  renderCard: (item: T) => React.ReactNode;
};

export function DashboardProfileCarouselSection<T>({
  title,
  subtitle,
  items,
  emptyMessage = 'Sin datos todavía.',
  getKey,
  renderCard,
}: DashboardProfileCarouselSectionProps<T>) {
  const trackRef = React.useRef<HTMLDivElement>(null);
  const [visible, setVisible] = React.useState(PAGE_SIZE);
  const shown = items.slice(0, visible);
  const hasMore = visible < items.length;

  const scrollBy = (direction: -1 | 1) => {
    const el = trackRef.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>('.df-profile-hover-card');
    const step = card ? card.offsetWidth + 24 : 300;
    el.scrollBy({ left: direction * step, behavior: 'smooth' });
  };

  return (
    <section className="df-profile-carousel-section">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-base font-semibold text-[#F4F6F3]">{title}</h2>
          {subtitle ? <p className="mt-1 text-sm text-zinc-400">{subtitle}</p> : null}
        </div>
        {items.length > 0 ? (
          <p className="text-xs text-zinc-500">{items.length} en total</p>
        ) : null}
      </div>

      {items.length === 0 ? (
        <p className="mt-4 text-sm text-zinc-500">{emptyMessage}</p>
      ) : (
        <>
          <div className="df-profile-carousel mt-4">
            <button
              type="button"
              className="df-profile-carousel__nav df-profile-carousel__nav--prev"
              onClick={() => scrollBy(-1)}
              aria-label="Anterior"
            >
              <ChevronLeft className="size-5" />
            </button>
            <div ref={trackRef} className="df-profile-carousel__track">
              {shown.map((item) => (
                <React.Fragment key={getKey(item)}>{renderCard(item)}</React.Fragment>
              ))}
            </div>
            <button
              type="button"
              className="df-profile-carousel__nav df-profile-carousel__nav--next"
              onClick={() => scrollBy(1)}
              aria-label="Siguiente"
            >
              <ChevronRight className="size-5" />
            </button>
          </div>
          {hasMore ? (
            <button
              type="button"
              onClick={() => setVisible((v) => v + PAGE_SIZE)}
              className="mt-4 text-sm font-medium text-[#8A0201] hover:underline"
            >
              Ver más ({items.length - visible} restantes)
            </button>
          ) : null}
        </>
      )}
    </section>
  );
}
