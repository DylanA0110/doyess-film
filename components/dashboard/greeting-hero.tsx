'use client';

import * as React from 'react';
import Image from 'next/image';

interface GreetingHeroProps {
  userName?: string;
}

export function GreetingHero({ userName = 'Dylan' }: GreetingHeroProps) {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/8 bg-[#101009]/80 p-6 sm:p-8 backdrop-blur-xl">
      {/* Background artwork: Monochrome face with cherry red circular arc */}
      <div className="pointer-events-none absolute inset-y-0 right-0 w-full sm:w-2/3 lg:w-1/2 overflow-hidden">
        <div className="relative h-full w-full">
          {/* Subtle cherry red ambient glow circle */}
          <div className="absolute right-12 top-1/2 -translate-y-1/2 size-64 rounded-full bg-[#8A0201]/25 blur-3xl pointer-events-none" />
          
          {/* Circular red arc graphics matching the mockup */}
          <div className="absolute right-16 top-1/2 -translate-y-1/2 size-56 rounded-full border-4 border-[#8A0201]/40 opacity-70 pointer-events-none" />

          {/* Artistic portrait with gradient mask to transparent */}
          <Image
            src="https://image.tmdb.org/t/p/w1280/gNdLJU9TxrpGx4dkZidjys3fyy0.jpg"
            alt=""
            fill
            sizes="(max-width: 768px) 100vw, 600px"
            className="object-cover object-center grayscale contrast-125 opacity-35 mix-blend-screen"
            priority
          />
          {/* Left-to-right fade mask */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#101009] via-[#101009]/80 to-transparent" />
        </div>
      </div>

      {/* Foreground Content */}
      <div className="relative z-10 max-w-lg space-y-3">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-[#F4F6F3]">
          Hola, {userName}
        </h1>
        <p className="text-sm sm:text-base text-[#F4F6F3]/70 font-normal">
          Las mejores historias también se descubren.
        </p>
        <div className="h-1 w-12 rounded-full bg-[#8A0201]" />
      </div>
    </div>
  );
}
