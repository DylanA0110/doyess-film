'use client';

import * as React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Heart,
  Star,
  Bookmark,
  Sparkles,
  ArrowRight,
  TrendingUp,
  FileSpreadsheet,
} from 'lucide-react';
import { FaGoogle } from 'react-icons/fa6';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export function LandingPage() {
  const [showAuthInfo, setShowAuthInfo] = React.useState(false);

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#050000] text-[#F4F6F3] select-none font-sans">
      {/* Background Studio Lighting & Glow Effects */}
      <div className="pointer-events-none absolute inset-0 z-0">
        {/* Warm ambient backlight behind monitor on the right */}
        <div className="absolute right-[10%] top-[25%] size-[600px] rounded-full bg-[radial-gradient(circle,rgba(215,60,20,0.18)_0%,rgba(138,2,1,0.12)_45%,transparent_70%)] blur-3xl" />
        {/* Ambient cherry red top glow */}
        <div className="absolute left-[15%] -top-20 size-[500px] rounded-full bg-[radial-gradient(circle,rgba(138,2,1,0.2)_0%,transparent_65%)] blur-3xl" />
        {/* Subtle grid pattern / vignette */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(138,2,1,0.08),transparent_60%)]" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 py-4 sm:px-6 lg:px-8 lg:py-6">
        {/* 1. Header Navigation matching Image 2 */}
        <header className="flex items-center justify-between py-2 sm:py-4">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="flex size-10 items-center justify-center rounded-xl bg-transparent transition group-hover:scale-105">
              <Image
                src="/doyess-logo.svg"
                alt="Doyess Film"
                width={32}
                height={32}
                priority
              />
            </div>
            <span className="text-xl font-bold tracking-tight text-[#F4F6F3]">
              Doyess Film
            </span>
          </Link>

          {/* Navigation items */}
          <nav className="hidden md:flex items-center gap-8 text-sm text-[#F4F6F3]/70 font-medium">
            <Link href="/" className="text-[#F4F6F3] hover:text-white transition">
              Inicio
            </Link>
            <a href="#como-funciona" className="hover:text-[#F4F6F3] transition">
              Cómo funciona
            </a>
            <a href="#caracteristicas" className="hover:text-[#F4F6F3] transition">
              Características
            </a>
          </nav>

          {/* Top Actions */}
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard?demo=true"
              className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs sm:text-sm font-medium text-[#F4F6F3] transition hover:bg-white/10 hover:text-white"
            >
              Iniciar sesión
            </Link>
            <Link
              href="/dashboard?demo=true"
              className="rounded-full bg-[#8A0201] px-4 sm:px-5 py-2 text-xs sm:text-sm font-semibold text-white shadow-[0_4px_20px_rgba(138,2,1,0.4)] transition hover:bg-[#a30302]"
            >
              Comenzar gratis
            </Link>
          </div>
        </header>

        {/* 2. Hero Section matching Image 2 */}
        <section className="grid flex-1 items-center gap-12 py-8 lg:grid-cols-[1.1fr_1.1fr] lg:py-16">
          {/* Left Column: Headlines, Pitch and Google CTA */}
          <div className="space-y-6 max-w-xl">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-[#F4F6F3] leading-[1.08]">
              Tu historia cinematográfica, analizada y redescubierta
            </h1>

            <p className="text-base sm:text-lg leading-relaxed text-[#F4F6F3]/75 font-normal">
              Importa tu historial de IMDb, descubre patrones en tus gustos y encuentra qué ver con nuestro algoritmo personalizado.
            </p>

            {/* CTAs */}
            <div className="space-y-3 pt-2">
              <div className="flex flex-wrap items-center gap-3">
                <Button
                  size="lg"
                  onClick={() => setShowAuthInfo(true)}
                  className="rounded-full bg-[#8A0201] px-6 py-6 text-sm sm:text-base font-bold text-white shadow-[0_8px_32px_rgba(138,2,1,0.5)] transition hover:bg-[#a30302] hover:scale-[1.02]"
                >
                  <FaGoogle className="mr-2.5 size-4" />
                  <span>Comenzar gratis con Google</span>
                  <span className="ml-2 text-xs opacity-80">▶</span>
                </Button>

                <Link
                  href="/dashboard?demo=true"
                  className="inline-flex items-center justify-center rounded-full border border-white/15 bg-white/5 px-6 py-3.5 text-sm font-semibold text-[#F4F6F3] transition hover:border-[#8A0201] hover:bg-[#8A0201]/10 hover:text-white"
                >
                  <Sparkles className="mr-2 size-4 text-[#8A0201]" />
                  <span>Entrar al Dashboard</span>
                </Link>
              </div>

              {/* Subtext matching Mockup */}
              <p className="text-xs text-[#F4F6F3]/50 font-normal">
                Conexión segura vía Supabase • Importación de CSV en 1 minuto
              </p>
            </div>
          </div>

          {/* Right Column: Device Laptop Preview + Floating Infiltrados Card matching Image 2 */}
          <div className="relative flex items-center justify-center lg:justify-end">
            {/* Monitor / Display Frame */}
            <div className="relative w-full max-w-[560px] aspect-[16/10] rounded-2xl sm:rounded-3xl border border-white/15 bg-[#0A0505] shadow-[0_30px_100px_rgba(0,0,0,0.85)] p-2 sm:p-3 overflow-hidden backdrop-blur-2xl ring-1 ring-white/10">
              {/* Laptop Screen Bezel Header / Camera dot */}
              <div className="absolute top-2 left-1/2 -translate-x-1/2 size-1.5 rounded-full bg-white/20" />

              {/* Screen Interior (Mini Dashboard View) */}
              <div className="h-full w-full rounded-xl sm:rounded-2xl border border-white/5 bg-[#050000] overflow-hidden grid grid-cols-[80px_1fr] sm:grid-cols-[100px_1fr]">
                {/* Mini Left Sidebar */}
                <div className="border-r border-white/5 bg-[#0A0505] p-2 sm:p-3 space-y-3">
                  <div className="flex items-center gap-1.5">
                    <Image
                      src="/doyess-logo.svg"
                      alt=""
                      width={16}
                      height={16}
                    />
                    <span className="text-[10px] font-bold text-[#F4F6F3] hidden sm:inline">
                      Doyess
                    </span>
                  </div>

                  <div className="space-y-1 text-[9px] text-[#F4F6F3]/60">
                    <div className="rounded-md bg-[#8A0201] p-1.5 text-white font-semibold">
                      Inicio
                    </div>
                    <div className="p-1.5 hover:text-white">Funciona</div>
                    <div className="p-1.5 hover:text-white">Características</div>
                    <div className="p-1.5 hover:text-white">Géneros</div>
                  </div>
                </div>

                {/* Mini Dashboard Content */}
                <div className="p-2 sm:p-4 space-y-3 overflow-hidden">
                  <h3 className="text-xs sm:text-sm font-bold text-[#F4F6F3]">
                    Dashboard de Cinéfilo
                  </h3>

                  {/* 3 Metrics */}
                  <div className="grid grid-cols-3 gap-2">
                    <div className="rounded-lg border border-white/5 bg-[#101009] p-1.5 sm:p-2">
                      <p className="text-xs sm:text-sm font-black text-[#F4F6F3]">256</p>
                      <p className="text-[8px] text-[#F4F6F3]/50">películas</p>
                    </div>
                    <div className="rounded-lg border border-white/5 bg-[#101009] p-1.5 sm:p-2">
                      <p className="text-xs sm:text-sm font-black text-[#F4F6F3]">7.8</p>
                      <p className="text-[8px] text-[#F4F6F3]/50">Calificación prom.</p>
                    </div>
                    <div className="rounded-lg border border-white/5 bg-[#101009] p-1.5 sm:p-2">
                      <p className="text-xs sm:text-sm font-black text-[#F4F6F3]">1,317 m</p>
                      <p className="text-[8px] text-[#F4F6F3]/50">Películas</p>
                    </div>
                  </div>

                  {/* Red Wave Chart & Genres */}
                  <div className="grid grid-cols-[1.3fr_0.7fr] gap-2">
                    <div className="rounded-lg border border-white/5 bg-[#101009] p-2">
                      <p className="text-[9px] text-[#F4F6F3]/60 font-semibold mb-1">
                        Géneros Favoritos
                      </p>
                      {/* SVG Red Area Wave */}
                      <svg viewBox="0 0 100 40" className="w-full h-8">
                        <defs>
                          <linearGradient id="landing-wave" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#8A0201" stopOpacity="0.8" />
                            <stop offset="100%" stopColor="#8A0201" stopOpacity="0.1" />
                          </linearGradient>
                        </defs>
                        <path
                          d="M0,35 Q20,10 40,30 T70,15 T100,25 L100,40 L0,40 Z"
                          fill="url(#landing-wave)"
                        />
                        <path
                          d="M0,35 Q20,10 40,30 T70,15 T100,25"
                          fill="none"
                          stroke="#C80000"
                          strokeWidth="2"
                        />
                      </svg>
                      <div className="flex justify-between text-[7px] text-[#F4F6F3]/40 mt-1">
                        <span>Drama</span>
                        <span>Crimen</span>
                        <span>Suspense</span>
                      </div>
                    </div>

                    <div className="rounded-lg border border-white/5 bg-[#101009] p-2 space-y-1.5">
                      <p className="text-[9px] text-[#F4F6F3]/60 font-semibold">
                        Géneros
                      </p>
                      <div className="space-y-1 text-[8px] text-[#F4F6F3]/70">
                        <div className="flex justify-between items-center">
                          <span>Drama</span>
                          <span className="h-1 w-6 rounded bg-[#8A0201]" />
                        </div>
                        <div className="flex justify-between items-center">
                          <span>Crimen</span>
                          <span className="h-1 w-4 rounded bg-[#8A0201]/70" />
                        </div>
                        <div className="flex justify-between items-center">
                          <span>Suspenso</span>
                          <span className="h-1 w-3 rounded bg-[#8A0201]/50" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* FYP Bottom Grid */}
                  <div>
                    <p className="text-[9px] text-[#F4F6F3]/60 font-semibold mb-1">FYP</p>
                    <div className="grid grid-cols-4 gap-1.5">
                      {['Infiltrados', 'Origen', 'Dune', 'Zodiac'].map((name, i) => (
                        <div
                          key={name}
                          className="aspect-2/3 rounded-md bg-zinc-900 border border-white/5 overflow-hidden relative"
                        >
                          <Image
                            src={
                              i === 0
                                ? 'https://image.tmdb.org/t/p/w185/nT97ifVT2J1yMQmeq20Qblg61T.jpg'
                                : i === 1
                                ? 'https://image.tmdb.org/t/p/w185/xlaY2zyzMfkhk0HSC5VUwzoZPU1.jpg'
                                : i === 2
                                ? 'https://image.tmdb.org/t/p/w185/6izwz7rsy95ARzTR3poZ8H6c5pp.jpg'
                                : 'https://image.tmdb.org/t/p/w185/74xTEgt7R36Fpooo50r9T25onhq.jpg'
                            }
                            alt=""
                            fill
                            className="object-cover opacity-80"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating Popout Card: INFILTRADOS matching Image 2 */}
            <div className="absolute -left-4 sm:-left-8 bottom-4 sm:bottom-8 w-44 sm:w-56 overflow-hidden rounded-2xl border-2 border-[#8A0201]/60 bg-[#140808] shadow-[0_20px_50px_rgba(138,2,1,0.5)] z-20 transition-transform duration-300 hover:scale-105">
              {/* Infiltrados Poster */}
              <div className="relative aspect-3/4 w-full overflow-hidden bg-black">
                <Image
                  src="https://image.tmdb.org/t/p/w500/nT97ifVT2J1yMQmeq20Qblg61T.jpg"
                  alt="Infiltrados"
                  fill
                  className="object-cover"
                  priority
                />
                <div className="absolute inset-0 bg-linear-to-t from-[#140808] via-transparent to-transparent" />
              </div>

              {/* Card Meta & Buttons matching Mockup */}
              <div className="p-3 space-y-2">
                <div>
                  <h4 className="text-sm font-black text-[#F4F6F3]">Infiltrados</h4>
                  <p className="text-[11px] font-semibold text-[#8A0201]">
                    Afinidad: 94%
                  </p>
                </div>

                <div className="flex items-center gap-1.5 pt-1">
                  <button
                    type="button"
                    className="flex flex-1 items-center justify-center gap-1 rounded-lg bg-[#8A0201] py-1.5 text-[10px] font-bold text-white shadow-sm hover:bg-[#a30302]"
                  >
                    <Heart className="size-3 fill-white" />
                    <span>Me gusta</span>
                  </button>

                  <button
                    type="button"
                    className="flex size-7 items-center justify-center rounded-lg border border-white/10 bg-black/40 text-amber-400 hover:bg-black/60"
                  >
                    <Star className="size-3 fill-amber-400" />
                  </button>

                  <button
                    type="button"
                    className="flex size-7 items-center justify-center rounded-lg border border-white/10 bg-black/40 text-white/80 hover:bg-black/60"
                  >
                    <Bookmark className="size-3" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Google OAuth & Demo Helper Dialog */}
      <Dialog open={showAuthInfo} onOpenChange={setShowAuthInfo}>
        <DialogContent className="border border-[#8A0201]/40 bg-[#0A0505] text-[#F4F6F3] shadow-2xl backdrop-blur-2xl sm:max-w-md">
          <DialogHeader className="space-y-2">
            <div className="flex items-center gap-2 text-[#8A0201]">
              <Image src="/doyess-logo.svg" alt="" width={24} height={24} />
              <Badge className="border border-[#8A0201]/40 bg-[#8A0201]/20 text-[#F4F6F3]">
                Acceso a Doyess Film
              </Badge>
            </div>
            <DialogTitle className="text-xl font-bold text-[#F4F6F3]">
              Iniciar Sesión en Doyess Film
            </DialogTitle>
            <DialogDescription className="text-xs leading-5 text-[#F4F6F3]/70">
              Para usar Google OAuth, el proveedor de Google debe estar habilitado en la consola de Supabase. Mientras tanto, puedes acceder directamente al Dashboard con tu perfil cinematográfico y cargar tu archivo CSV de IMDb.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 pt-3">
            <Link
              href="/dashboard?demo=true"
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#8A0201] py-3 text-sm font-bold text-white shadow-[0_4px_20px_rgba(138,2,1,0.4)] transition hover:bg-[#a30302]"
            >
              <Sparkles className="size-4" />
              <span>Continuar como Dylan Araica (Dashboard Completo)</span>
            </Link>

            <Link
              href="/auth/login"
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 py-3 text-xs font-semibold text-[#F4F6F3] hover:bg-white/10"
            >
              <FaGoogle className="size-3.5" />
              <span>Probar Google OAuth vía Supabase (/auth/login)</span>
            </Link>
          </div>
        </DialogContent>
      </Dialog>
    </main>
  );
}
