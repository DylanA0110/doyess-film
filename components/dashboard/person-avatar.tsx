'use client';

import Image from 'next/image';
import { NEUTRAL_POSTER } from '@/lib/imdb/poster-url';
import { cn } from 'cn';

type PersonAvatarProps = {
  src: string;
  alt: string;
  className?: string;
};

function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] ?? ''}${parts[parts.length - 1][0] ?? ''}`.toUpperCase();
}

export function PersonAvatar({ src, alt, className }: PersonAvatarProps) {
  const resolved = src?.trim() || NEUTRAL_POSTER;
  const isRemote = resolved.startsWith('http');
  const isNeutral = !isRemote && (resolved === NEUTRAL_POSTER || resolved.endsWith('doyess-logo.svg'));

  if (isNeutral) {
    return (
      <span
        className={cn(
          'flex size-full items-center justify-center rounded-full bg-[#8A0201]/25 text-xs font-semibold text-[#F4F6F3]',
          className,
        )}
        aria-hidden
      >
        {initialsFromName(alt)}
      </span>
    );
  }

  if (isRemote) {
    return (
      <img
        src={resolved}
        alt={alt}
        referrerPolicy="no-referrer"
        className={cn('size-full rounded-full object-cover', className)}
      />
    );
  }

  return (
    <Image
      src={resolved}
      alt={alt}
      fill
      sizes="56px"
      className={cn('rounded-full object-cover', className)}
    />
  );
}
