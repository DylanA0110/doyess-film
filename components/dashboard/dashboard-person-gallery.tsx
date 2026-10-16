'use client';

import * as React from 'react';
import { ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';
import { DashboardProfileHoverCard } from '@/components/dashboard/dashboard-profile-hover-card';

export type PersonGalleryItem = {
  key: string;
  name: string;
  photoUrl: string;
  lines: string[];
};

type DashboardPersonGalleryProps = {
  title: string;
  subtitle: string;
  items: PersonGalleryItem[];
  onBack: () => void;
  onSelect: (name: string) => void;
};

const AUTO_MS = 4500;

export function DashboardPersonGallery({
  title,
  subtitle,
  items,
  onBack,
  onSelect,
}: DashboardPersonGalleryProps) {
  const trackRef = React.useRef<HTMLDivElement>(null);
  const pausedRef = React.useRef(false);
  const userScrollRef = React.useRef(false);

  const scrollStep = React.useCallback((direction: -1 | 1) => {
    const el = trackRef.current;
    if (!el) return 0;
    const card = el.querySelector<HTMLElement>('.df-ff-profile-card');
    const gap = 40;
    const step = card ? card.offsetWidth + gap : 328;
    const maxScroll = Math.max(0, el.scrollWidth - el.clientWidth);

    if (direction > 0 && el.scrollLeft >= maxScroll - 12) {
      el.scrollTo({ left: 0, behavior: 'smooth' });
      return step;
    }
    if (direction < 0 && el.scrollLeft <= 12) {
      el.scrollTo({ left: maxScroll, behavior: 'smooth' });
      return step;
    }
    el.scrollBy({ left: direction * step, behavior: 'smooth' });
    return step;
  }, []);

  React.useEffect(() => {
    if (items.length < 2) return;

    const id = window.setInterval(() => {
      if (pausedRef.current || userScrollRef.current) return;
      scrollStep(1);
    }, AUTO_MS);

    return () => window.clearInterval(id);
  }, [items.length, scrollStep]);

  React.useEffect(() => {
    const el = trackRef.current;
    if (!el) return;

    let scrollEndTimer: ReturnType<typeof setTimeout> | undefined;
    const onScroll = () => {
      userScrollRef.current = true;
      window.clearTimeout(scrollEndTimer);
      scrollEndTimer = setTimeout(() => {
        userScrollRef.current = false;
      }, 1200);
    };

    el.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      el.removeEventListener('scroll', onScroll);
      window.clearTimeout(scrollEndTimer);
    };
  }, []);

  const pause = () => {
    pausedRef.current = true;
  };
  const resume = () => {
    pausedRef.current = false;
  };

  return (
    <div
      className="df-person-gallery"
      onMouseEnter={pause}
      onMouseLeave={resume}
      onFocus={pause}
      onBlur={resume}
    >
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-2 text-sm text-zinc-400 transition hover:text-[#F4F6F3]"
      >
        <ArrowLeft className="size-4" />
        Volver al resumen
      </button>
      <header className="mt-5 text-center sm:text-left">
        <p className="text-xs font-medium uppercase tracking-[0.14em] text-[#8A0201]">Galería</p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-[#F4F6F3] sm:text-3xl">{title}</h1>
        <p className="mx-auto mt-2 max-w-md text-sm text-zinc-400 sm:mx-0">{subtitle}</p>
      </header>

      {items.length === 0 ? (
        <p className="mt-10 text-center text-sm text-zinc-500">Aún no hay perfiles para mostrar.</p>
      ) : (
        <div className="df-person-gallery__stage">
          <button
            type="button"
            className="df-person-gallery__nav df-person-gallery__nav--prev"
            onClick={() => scrollStep(-1)}
            aria-label="Anterior"
          >
            <ChevronLeft className="size-5" />
          </button>
          <div ref={trackRef} className="df-person-gallery__track">
            {items.map((item) => (
              <DashboardProfileHoverCard
                key={item.key}
                name={item.name}
                photoUrl={item.photoUrl}
                lines={item.lines}
                onClick={() => onSelect(item.name)}
              />
            ))}
          </div>
          <button
            type="button"
            className="df-person-gallery__nav df-person-gallery__nav--next"
            onClick={() => scrollStep(1)}
            aria-label="Siguiente"
          >
            <ChevronRight className="size-5" />
          </button>
        </div>
      )}
    </div>
  );
}
