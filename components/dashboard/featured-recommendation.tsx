'use client';

import * as React from 'react';
import Image from 'next/image';
import {
  Star,
  ThumbsUp,
  Clock,
  X,
  ChevronLeft,
  ChevronRight,
  Check,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { DashboardMovie } from './types';

interface FeaturedRecommendationProps {
  recommendations: DashboardMovie[];
}

export function FeaturedRecommendation({
  recommendations,
}: FeaturedRecommendationProps) {
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [reaction, setReaction] = React.useState<string | null>(null);

  const currentMovie = recommendations[currentIndex] || recommendations[0];

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % recommendations.length);
    setReaction(null);
  };

  const handlePrev = () => {
    setCurrentIndex(
      (prev) => (prev - 1 + recommendations.length) % recommendations.length,
    );
    setReaction(null);
  };

  const handleAction = (type: 'like' | 'later' | 'dismiss') => {
    setReaction(type);
    setTimeout(() => {
      handleNext();
    }, 450);
  };

  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/8 bg-[#101009] shadow-2xl backdrop-blur-xl">
      {/* Cinematic Backdrop Image with Red Moody Atmospheric Gradient */}
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        {currentMovie.backdropUrl ? (
          <Image
            src={currentMovie.backdropUrl}
            alt={currentMovie.title}
            fill
            sizes="100vw"
            className="object-cover opacity-25 filter brightness-75 contrast-125"
            priority
          />
        ) : (
          <div className="size-full bg-linear-to-r from-black via-[#101009] to-[#8A0201]/20" />
        )}
        {/* Soft cherry red radial haze from the left */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(138,2,1,0.4),transparent_60%)]" />
        {/* Dark overlay gradients */}
        <div className="absolute inset-0 bg-linear-to-r from-[#050000] via-[#050000]/85 to-transparent" />
        <div className="absolute inset-0 bg-linear-to-t from-[#050000] via-transparent to-transparent" />
      </div>

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-[1.3fr_0.7fr] gap-6 p-6 sm:p-8 items-center">
        {/* Left Column: Movie Info & Actions */}
        <div className="space-y-4 max-w-xl">
          {/* Badge */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 rounded-full border border-white/10 bg-black/40 px-3 py-1 text-xs font-semibold tracking-wider uppercase text-[#F4F6F3]/80">
              <Star className="size-3 text-amber-400 fill-amber-400" />
              <span>RECOMENDACIÓN PERSONALIZADA</span>
            </div>
          </div>

          {/* Title & Metadata */}
          <div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#F4F6F3] tracking-tight">
              {currentMovie.title}
            </h2>
            <p className="mt-2 text-sm text-[#F4F6F3]/60">
              {currentMovie.year} · {currentMovie.genres.join(' · ')}
              {currentMovie.director ? ` · ${currentMovie.director}` : ''}
            </p>
          </div>

          {/* Affinity Indicator */}
          <div className="flex items-center gap-2.5">
            <div className="relative size-6 flex items-center justify-center">
              <svg viewBox="0 0 36 36" className="size-full -rotate-90">
                <circle
                  cx="18"
                  cy="18"
                  r="14"
                  stroke="rgba(255,255,255,0.1)"
                  strokeWidth="3.5"
                  fill="none"
                />
                <circle
                  cx="18"
                  cy="18"
                  r="14"
                  stroke="#8A0201"
                  strokeWidth="3.5"
                  strokeDasharray="88"
                  strokeDashoffset={88 - (88 * (currentMovie.affinity || 92)) / 100}
                  strokeLinecap="round"
                  fill="none"
                />
              </svg>
            </div>
            <span className="text-sm font-semibold text-[#F4F6F3]">
              {currentMovie.affinity ?? 92}% afinidad
            </span>
          </div>

          {/* Rationale / Synopsis */}
          <p className="text-sm sm:text-base leading-relaxed text-[#F4F6F3]/75 font-normal">
            {currentMovie.reason || currentMovie.overview}
          </p>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Button
              type="button"
              onClick={() => handleAction('like')}
              className={`rounded-full px-5 py-2.5 text-sm font-semibold transition-all ${
                reaction === 'like'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-[#8A0201] text-white hover:bg-[#a30302] shadow-[0_4px_24px_rgba(138,2,1,0.45)]'
              }`}
            >
              <ThumbsUp className="mr-2 size-4" />
              {reaction === 'like' ? '¡Guardado!' : 'Me gusta'}
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={() => handleAction('later')}
              className={`rounded-full border-white/10 bg-white/5 px-5 py-2.5 text-sm font-semibold text-[#F4F6F3] hover:bg-white/10 hover:text-white transition-all ${
                reaction === 'later' ? 'border-amber-500/50 text-amber-300' : ''
              }`}
            >
              <Clock className="mr-2 size-4" />
              Ver más tarde
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={() => handleAction('dismiss')}
              className={`rounded-full border-white/10 bg-white/5 px-5 py-2.5 text-sm font-semibold text-[#F4F6F3] hover:bg-white/10 hover:text-white transition-all ${
                reaction === 'dismiss' ? 'border-rose-500/50 text-rose-300' : ''
              }`}
            >
              <X className="mr-2 size-4" />
              Descartar
            </Button>
          </div>
        </div>

        {/* Right Column: Thumbnail Queue & Carousel Navigation */}
        <div className="flex flex-col items-center lg:items-end justify-center space-y-4">
          <div className="flex gap-3 items-center">
            {recommendations.slice(0, 3).map((item, idx) => {
              const isSelected = idx === currentIndex % 3;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setCurrentIndex(idx)}
                  className={`relative overflow-hidden rounded-xl border transition-all duration-300 ${
                    isSelected
                      ? 'w-24 sm:w-28 aspect-2/3 border-[#8A0201] ring-2 ring-[#8A0201]/50 scale-105 z-10 shadow-2xl'
                      : 'w-18 sm:w-20 aspect-2/3 border-white/10 opacity-60 hover:opacity-100 hover:scale-100'
                  }`}
                >
                  <Image
                    src={item.posterUrl}
                    alt={item.title}
                    fill
                    sizes="120px"
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-black/80 via-transparent to-transparent" />
                  <div className="absolute bottom-1.5 inset-x-1 text-center">
                    <p className="text-[10px] font-bold text-white truncate px-0.5">
                      {item.title}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Carousel dots and Pager */}
          <div className="flex items-center gap-4 text-xs text-[#F4F6F3]/50">
            {/* Dots */}
            <div className="flex items-center gap-1.5">
              {recommendations.map((_, i) => (
                <span
                  key={i}
                  className={`size-1.5 rounded-full transition-all ${
                    i === currentIndex % recommendations.length
                      ? 'w-4 bg-[#8A0201]'
                      : 'bg-white/20'
                  }`}
                />
              ))}
            </div>

            {/* < 2 / 10 > */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePrev}
                aria-label="Anterior"
                className="p-1 hover:text-[#F4F6F3] transition"
              >
                <ChevronLeft className="size-3.5" />
              </button>
              <span className="font-mono text-xs">
                {currentIndex + 1} / {recommendations.length}
              </span>
              <button
                type="button"
                onClick={handleNext}
                aria-label="Siguiente"
                className="p-1 hover:text-[#F4F6F3] transition"
              >
                <ChevronRight className="size-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
