'use client';

import * as React from 'react';

/** Decoración tipo atardecer (paleta Doyess) en el pie de tarjetas. */
export function DashboardHorizonDeco({ className }: { className?: string }) {
  const uid = React.useId().replace(/:/g, '');
  const gradId = `dfHorizonGrad-${uid}`;

  return (
    <svg
      className={className}
      viewBox="0 0 400 120"
      preserveAspectRatio="none"
      aria-hidden
    >
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#8a0201" stopOpacity="0" />
          <stop offset="55%" stopColor="#8a0201" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#c4a035" stopOpacity="0.6" />
        </linearGradient>
      </defs>
      <path fill={`url(#${gradId})`} d="M0,80 Q100,40 200,70 T400,55 L400,120 L0,120 Z" />
      <path
        fill="#c4a035"
        fillOpacity="0.22"
        d="M0,95 Q120,75 240,88 T400,82 L400,120 L0,120 Z"
      />
    </svg>
  );
}
