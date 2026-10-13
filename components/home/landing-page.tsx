'use client';

import * as React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  ArrowRight,
  BarChart3,
  ChevronDown,
  Search,
  Sparkles,
  Upload,
} from 'lucide-react';
import { FaGoogle } from 'react-icons/fa6';
import type { LandingHeroAssets } from '@/lib/tmdb/landing-hero';
import { LandingAuthCta } from '@/components/home/landing-auth-cta';
import { getOAuthErrorMessage } from '@/lib/auth/oauth-error-messages';
import { LandingAnalyticsPreview } from '@/components/home/landing-analytics-preview';
import { LandingSpotlightMovieCard } from '@/components/home/landing-spotlight-movie';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const NAV_LINKS: Array<{ id: string; label: string; active?: boolean }> = [
  { id: 'inicio', label: 'Inicio', active: true },
  { id: 'biblioteca', label: 'Mi biblioteca' },
  { id: 'analisis', label: 'Análisis' },
  { id: 'recomendaciones', label: 'Recomendaciones' },
  { id: 'explorar', label: 'Explorar' },
];

const STEPS = [
  {
    n: '01',
    title: 'Autenticación',
    body: 'Acceso rápido y seguro con Google OAuth.',
    icon: 'google' as const,
  },
  {
    n: '02',
    title: 'Importa tu historial',
    body: 'Sube tu CSV de IMDb y sincroniza sin duplicados.',
    icon: 'upload' as const,
  },
  {
    n: '03',
    title: 'Analiza tus gustos',
    body: 'Patrones, géneros favoritos y directores mejor valorados.',
    icon: 'chart' as const,
  },
  {
    n: '04',
    title: 'Descubre y disfruta',
    body: 'Recomendaciones adaptadas a tu perfil cinematográfico.',
    icon: 'spark' as const,
  },
] as const;

type LandingPageProps = {
  devSkipAuth?: boolean;
  heroAssets: LandingHeroAssets;
};

function scrollToSection(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function StepIcon({ kind }: { kind: (typeof STEPS)[number]['icon'] }) {
  const box =
    'flex size-11 items-center justify-center rounded-lg border border-[#8A0201]/35 bg-[#101009] text-[#F4F6F3]';

  if (kind === 'google') {
    return (
      <span className={box}>
        <FaGoogle className="size-5" />
      </span>
    );
  }
  if (kind === 'upload') {
    return (
      <span className={box}>
        <Upload className="size-5" />
      </span>
    );
  }
  if (kind === 'chart') {
    return (
      <span className={box}>
        <BarChart3 className="size-5" />
      </span>
    );
  }
  return (
    <span className={box}>
      <Sparkles className="size-5" />
    </span>
  );
}

export function LandingPage({ devSkipAuth = false, heroAssets }: LandingPageProps) {
  const searchParams = useSearchParams();
  const { spotlight, directors } = heroAssets;

  React.useEffect(() => {
    if (searchParams.get('section') === 'como-funciona') {
      requestAnimationFrame(() => scrollToSection('como-funciona-section'));
    }
  }, [searchParams]);

  const authError = searchParams.get('error');
  const authReason = searchParams.get('reason');
  const oauthErrorMessage =
    authError && !devSkipAuth ? getOAuthErrorMessage(authError, authReason) : null;

  const dashboardHref = '/dashboard';

  return (
    <main className="relative min-h-screen overflow-x-hidden bg-[#050000] text-[#F4F6F3] font-sans">
      <div className="pointer-events-none absolute inset-0 z-0">
        <div className="absolute inset-x-0 top-0 h-48 bg-gradient-to-b from-[#8A0201]/10 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-[#050000] via-[#050000]/80 to-transparent" />
        <div className="absolute right-0 top-1/4 h-[32rem] w-[32rem] rounded-full bg-[radial-gradient(circle,rgba(138,2,1,0.16)_0%,transparent_70%)] blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-[90rem] px-4 sm:px-6 lg:px-10">
        <header className="flex flex-col gap-4 py-5 sm:flex-row sm:items-center sm:justify-between sm:py-6">
          <Link href="/" className="flex shrink-0 items-center gap-2.5">
            <Image src="/doyess-logo.svg" alt="Doyess Film" width={32} height={32} priority />
            <span className="text-lg font-semibold tracking-tight">Doyess Film</span>
          </Link>

          <nav
            className="hidden flex-1 items-center justify-center gap-8 text-sm text-[#8E908C] xl:flex"
            aria-label="Principal"
          >
            {NAV_LINKS.map((link) =>
              link.active ? (
                <button
                  key={link.id}
                  type="button"
                  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                  className="relative pb-1 font-medium text-[#F4F6F3] transition"
                >
                  {link.label}
                  <span className="absolute inset-x-0 -bottom-0.5 h-0.5 rounded-full bg-[#8A0201]" />
                </button>
              ) : (
                <Link
                  key={link.id}
                  href={devSkipAuth ? dashboardHref : '#como-funciona-section'}
                  className="transition hover:text-[#F4F6F3]"
                >
                  {link.label}
                </Link>
              ),
            )}
          </nav>

          <div className="flex items-center gap-3 sm:gap-4">
            <div className="relative hidden min-w-0 flex-1 sm:block sm:max-w-xs lg:max-w-sm">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#8E908C]" />
              <Input
                readOnly
                placeholder="Buscar películas, directores, géneros..."
                className="h-10 w-full rounded-full border-white/10 bg-neutral-900/50 pl-10 text-sm text-[#F4F6F3] placeholder:text-[#8E908C]"
              />
            </div>
            {devSkipAuth ? (
              <Link href={dashboardHref} className="flex items-center gap-1.5 rounded-full outline-none">
                <Avatar className="size-9 border border-white/10">
                  <AvatarImage src="/dylan-avatar.svg" alt="" />
                  <AvatarFallback className="bg-[#8A0201]/20 text-xs text-[#F4F6F3]">
                    DF
                  </AvatarFallback>
                </Avatar>
                <ChevronDown className="size-4 text-[#8E908C]" aria-hidden />
              </Link>
            ) : (
              <LandingAuthCta
                devSkipAuth={false}
                showArrow={false}
                className="!rounded-full !px-4 !py-2 !text-xs !font-medium !shadow-none hover:!scale-100"
              />
            )}
          </div>
        </header>

        {oauthErrorMessage ? (
          <div
            className="mb-6 mx-auto max-w-xl rounded-2xl border border-[#8A0201]/30 bg-[#8A0201]/10 px-4 py-3 text-center sm:px-5 sm:text-left"
            role="alert"
          >
            <p className="text-sm font-semibold text-[#F4F6F3]">{oauthErrorMessage.title}</p>
            <p className="mt-1 text-xs leading-relaxed text-[#F4F6F3]/70">
              {oauthErrorMessage.detail}
            </p>
            <a
              href="/auth/login"
              className="mt-3 inline-block text-xs font-medium text-[#8A0201] hover:underline"
            >
              Reintentar con Google →
            </a>
          </div>
        ) : null}

        <section className="relative pb-16 pt-2 lg:pb-24 lg:pt-4">
          <div className="grid items-center gap-10 lg:grid-cols-12 lg:gap-6 xl:gap-8">
            <div className="lg:col-span-4 xl:col-span-4">
              <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-[#8A0201]">
                Análisis • Descubrimiento • Cine
              </p>
              <h1 className="mt-4 text-4xl font-bold leading-[1.05] tracking-tight sm:text-5xl xl:text-[3.25rem]">
                Tu historia en el cine,{' '}
                <span className="text-[#8A0201] drop-shadow-[0_0_28px_rgba(138,2,1,0.35)]">
                  con claridad.
                </span>
              </h1>
              <p className="mt-5 max-w-md text-base leading-relaxed text-[#8E908C]">
                Doyess Film analiza tus gustos, descubre patrones en tu historial y te recomienda
                películas que realmente van contigo. Explora, comprende y redescubre el cine.
              </p>
              <div className="mt-8">
                <LandingAuthCta devSkipAuth={devSkipAuth} />
              </div>
              <p className="mt-4 max-w-md text-[11px] leading-relaxed text-[#8E908C]/90">
                Importa tu historial de IMDb • Sincroniza con Supabase • Recomendaciones
                personalizadas
              </p>
            </div>

            <div className="relative flex min-h-[20rem] items-center justify-center lg:col-span-4 xl:col-span-4">
              <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-3xl">
                <Image
                  src={spotlight.backdropUrl}
                  alt=""
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 40vw"
                  className="object-cover object-[center_20%] opacity-85"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-[#050000] via-[#050000]/40 to-[#050000]/90" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#050000] via-transparent to-[#050000]/60" />
              </div>
              <LandingSpotlightMovieCard movie={spotlight} />
            </div>

            <div className="flex justify-center lg:col-span-4 lg:justify-end xl:col-span-4">
              <LandingAnalyticsPreview directors={directors} />
            </div>
          </div>
        </section>

        <section
          id="como-funciona-section"
          className="scroll-mt-24 border-t border-white/5 py-16 sm:py-20"
        >
          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-lg">
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-[#8A0201]">
                — Cómo funciona
              </p>
              <h2 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">
                Tu experiencia, en 4 pasos
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-[#8E908C]">
                Desde tu historial hasta recomendaciones personalizadas, todo en un solo lugar.
              </p>
            </div>
            <LandingAuthCta
              devSkipAuth={devSkipAuth}
              className="!px-5 !py-2.5 !text-xs lg:hidden"
            />
          </div>

          <ol className="mt-12 grid gap-8 sm:grid-cols-2 xl:grid-cols-4">
            {STEPS.map((step, index) => (
              <li key={step.n} className="relative">
                {index < STEPS.length - 1 ? (
                  <ArrowRight
                    className="absolute -right-4 top-6 hidden size-4 text-[#8E908C]/40 xl:block"
                    aria-hidden
                  />
                ) : null}
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-medium tabular-nums text-[#8E908C]">{step.n}</span>
                    <StepIcon kind={step.icon} />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-[#F4F6F3]">{step.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-[#8E908C]">{step.body}</p>
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <footer className="border-t border-white/5 py-10 text-center text-xs text-[#8E908C]">
          Doyess Film · análisis cinematográfico personal
        </footer>
      </div>
    </main>
  );
}
