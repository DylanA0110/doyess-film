'use client';

import * as React from 'react';

export function QuoteCard() {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/8 bg-[#101009] p-6 backdrop-blur-xl">
      <div className="relative border-l-2 border-[#8A0201] pl-4 py-1">
        <blockquote className="text-sm sm:text-base font-light italic leading-relaxed text-[#F4F6F3]/90">
          “El cine no es solo lo que ves, sino lo que sientes.”
        </blockquote>
      </div>
    </div>
  );
}
