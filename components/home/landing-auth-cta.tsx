'use client';

import Link from 'next/link';
import { FaGoogle } from 'react-icons/fa6';
import { ArrowRight } from 'lucide-react';
import { cn } from 'cn';

type LandingAuthCtaProps = {
  devSkipAuth?: boolean;
  className?: string;
  showArrow?: boolean;
};

const defaultClass =
  'inline-flex items-center justify-center gap-2.5 rounded-full bg-[#8A0201] px-7 py-3.5 text-sm font-semibold text-white shadow-[0_8px_32px_rgba(138,2,1,0.45)] transition hover:scale-[1.02] hover:bg-[#a30302] hover:shadow-[0_12px_40px_rgba(138,2,1,0.5)]';

export function LandingAuthCta({
  devSkipAuth = false,
  className,
  showArrow = true,
}: LandingAuthCtaProps) {
  const content = (
    <>
      <FaGoogle className="size-4" />
      Continuar con Google
      {showArrow ? <ArrowRight className="size-4 opacity-90" /> : null}
    </>
  );

  if (devSkipAuth) {
    return (
      <Link href="/dashboard" className={cn(defaultClass, className)}>
        {content}
      </Link>
    );
  }

  // Navegación completa: /auth/login es Route Handler (307 → Google), no una página RSC.
  return (
    <a href="/auth/login" className={cn(defaultClass, className)}>
      {content}
    </a>
  );
}
