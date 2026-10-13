'use client';

import Image from 'next/image';
import { cn } from 'cn';

type UserAvatarProps = {
  src: string | null;
  alt: string;
  className?: string;
  size?: number;
};

const FALLBACK = '/dylan-avatar.svg';

export function UserAvatar({ src, alt, className, size = 40 }: UserAvatarProps) {
  const resolved = src?.trim() || FALLBACK;
  const isRemote = resolved.startsWith('http');

  if (isRemote) {
    return (
      <img
        src={resolved}
        alt={alt}
        width={size}
        height={size}
        referrerPolicy="no-referrer"
        className={cn('size-full object-cover', className)}
      />
    );
  }

  return (
    <Image
      src={resolved}
      alt={alt}
      width={size}
      height={size}
      className={cn('size-full object-cover', className)}
    />
  );
}
