'use client';

import type { CSSProperties } from 'react';
import { tmdbProfileZoomUrl } from '@/lib/tmdb/images';
import { cn } from 'cn';

type DashboardProfileHoverCardProps = {
  name: string;
  photoUrl: string;
  lines: string[];
  onClick?: () => void;
  className?: string;
};

/**
 * Réplica del “Profile Hover Effect with Tailwind” (FreeFrontend):
 * la foto va en el fondo de la card; al hover pasa de 250px a 600px.
 * Sin iconos de redes: en su lugar, líneas de dato del historial.
 */
export function DashboardProfileHoverCard({
  name,
  photoUrl,
  lines,
  onClick,
  className,
}: DashboardProfileHoverCardProps) {
  const trimmed = photoUrl?.trim() ?? '';
  const hasPhoto = trimmed.startsWith('http');
  const zoomUrl = hasPhoto ? tmdbProfileZoomUrl(trimmed) : '';

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn('df-ff-profile-card', className)}
      style={hasPhoto ? ({ '--photo': `url("${zoomUrl}")` } as CSSProperties) : undefined}
      aria-label={`${name}: ver títulos`}
    >
      <div className="df-ff-profile-card__frame">
        <h2 className="ml-4 pt-5 text-xl font-semibold text-white">{name}</h2>
        <div className="absolute top-44 ml-4 flex flex-col space-y-2 text-sm font-medium text-white">
          {lines.map((line) => (
            <p key={line} className="m-0 drop-shadow-[0_1px_8px_rgba(0,0,0,0.9)]">
              {line}
            </p>
          ))}
        </div>
      </div>
    </button>
  );
}
