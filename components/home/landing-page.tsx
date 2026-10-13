'use client';

import Image from 'next/image';
import Link from 'next/link';
import {
  FaCirclePlay,
  FaGoogle,
  FaHeart,
  FaShieldHalved,
  FaStar,
} from 'react-icons/fa6';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getTmdbPosterUrl } from '@/lib/tmdb/images';
import { useFeaturedMovies } from '@/hooks/use-featured-movies';
import type { FeaturedMovieCard } from '@/lib/tmdb/featured-movies';

export function LandingPage({ featuredMovies }: LandingPageProps) {
  const featuredMoviesQuery = useFeaturedMovies();
  const featuredMovies = featuredMoviesQuery.data ?? [];
  const featuredMovie =
    featuredMovies.find((item) => item.label === 'Infiltrados')?.movie ??
    featuredMovies.find((item) => item.movie)?.movie ??
    null;
  const featuredAccent =
    featuredMovies.find((item) => item.label === 'Infiltrados')?.accent ??
    featuredMovies[0]?.accent ??
    'Afinidad visual';

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#050000] text-[#F4F6F3]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(138,2,1,0.26),transparent_32%),linear-gradient(180deg,#050000_0%,#030101_48%,#060704_100%)]" />
      <div className="absolute inset-x-0 bottom-0 h-168 bg-[radial-gradient(circle_at_bottom,rgba(138,2,1,0.16),transparent_55%)]" />
      <div className="absolute inset-x-0 bottom-0 h-52 bg-[linear-gradient(180deg,transparent,rgba(0,0,0,0.72))]" />

      <div className="relative mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 py-4 sm:px-6 lg:px-8 lg:py-6">
        <header className="flex flex-col gap-4 rounded-[28px] border border-white/8 bg-black/55 px-4 py-4 shadow-[0_18px_80px_rgba(0,0,0,0.48)] backdrop-blur-xl lg:flex-row lg:items-center lg:justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex size-12 items-center justify-center rounded-2xl border border-[#8A0201]/30 bg-[#050000] shadow-[0_0_30px_rgba(138,2,1,0.28)]">
              <Image
                src="/doyess-logo.svg"
                alt="Doyess Film"
                width={28}
                height={28}
                priority
              />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.32em] text-[#F4F6F3]/45">
                Doyess Film
              </p>
              <p className="text-sm text-[#F4F6F3]/72">
                Tu historial de cine, convertido en una experiencia visual.
              </p>
            </div>
          </Link>

          <nav className="flex flex-wrap items-center gap-6 text-sm text-[#F4F6F3]/72">
            <span className="transition hover:text-[#F4F6F3]">Inicio</span>
            <span className="transition hover:text-[#F4F6F3]">
              Cómo funciona
            </span>
            <span className="transition hover:text-[#F4F6F3]">
              Características
            </span>
          </nav>

          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              className="border-white/10 bg-white/5 text-[#F4F6F3] hover:bg-white/10"
            >
              Iniciar sesión
            </Button>
            <Button className="bg-[#8A0201] text-[#F4F6F3] shadow-[0_0_28px_rgba(138,2,1,0.35)] hover:bg-[#a10302]">
              Comenzar gratis
            </Button>
          </div>
        </header>

        <section className="grid flex-1 gap-10 py-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-center lg:py-12">
          <div className="space-y-8">
            <div className="space-y-5">
              <Badge className="border border-[#8A0201]/25 bg-[#8A0201]/10 text-[#F4F6F3]">
                <FaShieldHalved className="mr-1.5 size-3.5" />
                Conexión segura vía Supabase · importación en un minuto
              </Badge>
              <h1 className="max-w-3xl text-5xl font-black leading-[0.92] tracking-tight text-[#F4F6F3] sm:text-6xl xl:text-7xl">
                Tu historia cinematográfica,
                <span className="block bg-linear-to-r from-[#F4F6F3] via-[#8A0201] to-[#d11c1c] bg-clip-text text-transparent">
                  analizada y redescubierta
                </span>
              </h1>
              <p className="max-w-2xl text-base leading-8 text-[#F4F6F3]/72 sm:text-lg">
                Importa tu historial de IMDb, descubre patrones en tus gustos y
                encuentra qué ver con nuestro algoritmo personalizado.
                Construimos una experiencia más cinematográfica que una interfaz
                tradicional.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button className="h-12 rounded-full bg-[#8A0201] px-6 text-[#F4F6F3] shadow-[0_12px_36px_rgba(138,2,1,0.32)] hover:bg-[#9f0201]">
                <FaGoogle className="size-4" />
                Comenzar gratis con Google
              </Button>
              <Button
                variant="outline"
                className="h-12 rounded-full border-white/10 bg-white/5 px-6 text-[#F4F6F3] hover:bg-white/10"
              >
                <FaCirclePlay className="size-4" />
                Ver cómo funciona
              </Button>
            </div>

            <div className="flex flex-wrap gap-3 text-sm text-[#F4F6F3]/62">
              {[
                'CSV de IMDb',
                'TMDB API',
                'Dashboard activo',
                'Afinidad por género',
              ].map((item) => (
                <div
                  key={item}
                  className="rounded-full border border-white/8 bg-black/20 px-4 py-2"
                >
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-10 rounded-full bg-[radial-gradient(circle,rgba(138,2,1,0.35),transparent_65%)] blur-3xl" />
            <div className="relative overflow-hidden rounded-[34px] border border-[#8A0201]/20 bg-[linear-gradient(180deg,rgba(16,16,9,0.92),rgba(6,7,4,0.88))] p-4 shadow-[0_28px_120px_rgba(0,0,0,0.65)]">
              <div className="grid gap-4 lg:grid-cols-[1.02fr_0.98fr]">
                <Card className="overflow-hidden border-[#8A0201]/20 bg-black/25 shadow-[0_16px_40px_rgba(0,0,0,0.3)]">
                  <CardContent className="p-0">
                    <div className="relative aspect-3/4 overflow-hidden">
                      <Image
                        src={getTmdbPosterUrl(
                          featuredMovie?.poster_path,
                          'w780',
                        )}
                        alt={featuredMovie?.title ?? 'Infiltrados'}
                        fill
                        priority
                        sizes="(max-width: 1024px) 100vw, 420px"
                        className="object-cover"
                      />
                      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(5,0,0,0.08),rgba(5,0,0,0.62)),radial-gradient(circle_at_top,transparent,rgba(0,0,0,0.4))]" />
                      <div className="absolute inset-x-0 bottom-0 p-4">
                        <div className="rounded-[24px] border border-white/10 bg-black/60 p-4 backdrop-blur-xl">
                          <div className="flex items-end justify-between gap-3">
                            <div>
                              <p className="text-xs uppercase tracking-[0.28em] text-[#F4F6F3]/55">
                                Recomendación destacada
                              </p>
                              <p className="mt-2 text-[10px] uppercase tracking-[0.24em] text-[#F4F6F3]/50">
                                {featuredAccent}
                              </p>
                              <h2 className="mt-2 text-2xl font-black text-[#F4F6F3]">
                                {featuredMovie?.title ?? 'Infiltrados'}
                              </h2>
                              <p className="mt-2 text-sm text-[#F4F6F3]/70">
                                {featuredMovie?.overview?.slice(0, 110) ??
                                  'Afinidad estimada 94% por tu historial de crimen y drama.'}
                                ...
                              </p>
                            </div>
                            <div className="rounded-2xl border border-[#8A0201]/30 bg-[#8A0201]/15 px-3 py-2 text-right">
                              <p className="text-[10px] uppercase tracking-[0.24em] text-[#F4F6F3]/55">
                                Afinidad
                              </p>
                              <p className="text-2xl font-black text-[#F4F6F3]">
                                94%
                              </p>
                            </div>
                          </div>
                          <div className="mt-4 flex flex-wrap gap-2">
                            <Button
                              size="sm"
                              className="rounded-full bg-[#8A0201] text-[#F4F6F3] hover:bg-[#9f0201]"
                            >
                              <FaHeart className="size-3.5" />
                              Me gusta
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="rounded-full border-white/10 bg-white/5 text-[#F4F6F3] hover:bg-white/10"
                            >
                              <FaStar className="size-3.5" />
                              Guardar
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="space-y-4">
                  <Card className="border-[#8A0201]/20 bg-black/25 shadow-[0_16px_40px_rgba(0,0,0,0.28)]">
                    <CardContent className="p-4">
                      <div className="grid grid-cols-3 gap-3">
                        {[
                          { label: 'Películas', value: '256' },
                          { label: 'Calificación promedio', value: '7.8' },
                          { label: 'Afinidad', value: '94%' },
                        ].map((stat) => (
                          <div
                            key={stat.label}
                            className="rounded-2xl border border-white/8 bg-black/20 p-3"
                          >
                            <p className="text-[10px] uppercase tracking-[0.24em] text-[#F4F6F3]/55">
                              {stat.label}
                            </p>
                            <p className="mt-2 text-2xl font-black text-[#F4F6F3]">
                              {stat.value}
                            </p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-[#8A0201]/20 bg-black/25 shadow-[0_16px_40px_rgba(0,0,0,0.28)]">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm uppercase tracking-[0.24em] text-[#F4F6F3]/55">
                        Géneros favoritos
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {[
                        ['Drama', 'w-[92%]'],
                        ['Crimen', 'w-[76%]'],
                        ['Suspenso', 'w-[64%]'],
                      ].map(([label, width]) => (
                        <div key={label} className="space-y-2">
                          <div className="flex items-center justify-between text-sm text-[#F4F6F3]/72">
                            <span>{label}</span>
                            <span>Top</span>
                          </div>
                          <div className="h-2 rounded-full bg-white/10">
                            <div
                              className={`h-full rounded-full bg-linear-to-r from-[#8A0201] to-[#d11c1c] ${width}`}
                            />
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  <Card className="border-[#8A0201]/20 bg-black/25 shadow-[0_16px_40px_rgba(0,0,0,0.28)]">
                    <CardContent className="grid grid-cols-4 gap-2 p-3">
                      {(featuredMoviesQuery.isLoading
                        ? Array.from({ length: 4 }).map((_, index) => ({
                            label: `placeholder-${index}`,
                            accent: 'Cargando',
                            movie: null,
                          }))
                        : featuredMovies
                      )
                        .slice(0, 4)
                        .map((item) => (
                          <div
                            key={item.label}
                            className="overflow-hidden rounded-2xl border border-white/8 bg-black/30"
                          >
                            <div className="relative aspect-2/3">
                              <Image
                                src={getTmdbPosterUrl(
                                  item.movie?.poster_path,
                                  'w342',
                                )}
                                alt={item.label}
                                fill
                                sizes="120px"
                                className="object-cover"
                              />
                              <div className="absolute inset-x-0 bottom-0 bg-[linear-gradient(180deg,transparent,rgba(0,0,0,0.85))] p-2">
                                <p className="text-[10px] uppercase tracking-[0.22em] text-[#F4F6F3]/60">
                                  {item.accent}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
