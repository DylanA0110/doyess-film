'use client';

import * as React from 'react';
import Image from 'next/image';
import { Sparkles, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function UniverseCard() {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/8 bg-[#101009] p-6 backdrop-blur-xl flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center gap-2 text-[#F4F6F3]">
        <Sparkles className="size-4 text-[#8A0201]" />
        <h3 className="text-base font-bold tracking-tight">
          Tu universo cinematográfico
        </h3>
      </div>

      {/* Main Content Area */}
      <div className="my-4 grid grid-cols-1 sm:grid-cols-[110px_1fr] gap-4 items-center">
        {/* Artistic Composition Thumbnail with words */}
        <div className="relative aspect-4/5 w-full max-w-[120px] overflow-hidden rounded-2xl border border-white/10 bg-black/50">
          <Image
            src="https://image.tmdb.org/t/p/w780/6WRrGYalXXveItfpnipYdayFkQB.jpg"
            alt="Cine"
            fill
            sizes="120px"
            className="object-cover grayscale contrast-125 opacity-40"
          />
          {/* Subtle red tint */}
          <div className="absolute inset-0 bg-[#8A0201]/30 mix-blend-color" />
          <div className="absolute inset-0 bg-linear-to-t from-black via-black/40 to-transparent" />

          {/* Words overlay matching the mockup */}
          <div className="absolute inset-0 p-3 flex flex-col justify-between text-[11px] font-bold text-[#F4F6F3]/90 leading-tight select-none">
            <span className="text-[#8A0201]">Películas</span>
            <span className="text-white/80">Series</span>
            <span className="text-[#8A0201]">Datos</span>
            <span className="text-white font-extrabold text-sm">Tú</span>
          </div>
        </div>

        {/* Text and CTA */}
        <div className="space-y-3">
          <p className="text-xs sm:text-sm text-[#F4F6F3]/70 leading-relaxed">
            Un espacio hecho para explorar, analizar y descubrir el cine desde tu propia perspectiva.
          </p>
          <Button
            size="sm"
            variant="outline"
            className="rounded-full border-white/15 bg-white/5 text-xs font-semibold text-[#F4F6F3] hover:border-[#8A0201] hover:bg-[#8A0201]/10 hover:text-white"
          >
            <span>Descubrir más</span>
            <ArrowRight className="ml-1.5 size-3 text-[#8A0201]" />
          </Button>
        </div>
      </div>
    </div>
  );
}
