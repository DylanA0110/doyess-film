'use client';

import Image from 'next/image';
import { cn } from 'cn';

type UserAvatarFillProps = {
  src: string | null;
  alt: string;
  className?: string;
  sizes?: string;
};

const FALLBACK = '/dylan-avatar.svg';

/** Avatar en contenedor `relative` con `fill` (sidebar, topbar). */
export function UserAvatarFill({ src, alt, className, sizes = '40px' }: UserAvatarFillProps) {
  const resolved = src?.trim() || FALLBACK;
  const isRemote = resolved.startsWith('http');

  if (isRemote) {
    return (
      <img
        src={resolved}
        alt={alt}
        referrerPolicy="no-referrer"
        className={cn('absolute inset-0 size-full object-cover', className)}
      />
    );
  }

  return (
    <Image
      src={resolved}
      alt={alt}
      fill
      sizes={sizes}
      className={cn('object-cover', className)}
    />
  );
}
