'use client';

import Image from 'next/image';
import { NEUTRAL_POSTER } from '@/lib/imdb/poster-url';
import { cn } from 'cn';

type MoviePosterProps = {
  src: string;
  alt: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
};

export function MoviePoster({ src, alt, className, sizes = '200px', priority }: MoviePosterProps) {
  const resolved = src?.trim() || NEUTRAL_POSTER;
  const isRemote = resolved.startsWith('http');

  if (isRemote) {
    return (
      <img
        src={resolved}
        alt={alt}
        referrerPolicy="no-referrer"
        className={cn('size-full object-cover', className)}
      />
    );
  }

  return (
    <Image
      src={resolved}
      alt={alt}
      fill
      sizes={sizes}
      priority={priority}
      className={cn('object-cover', className)}
    />
  );
}
