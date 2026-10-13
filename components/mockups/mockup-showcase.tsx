'use client';

import * as React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Image from 'next/image';
import { parseImdbExport } from '@/lib/imdb/parse-csv';
import type { IconType } from 'react-icons';
import {
  FaBars,
  FaCirclePlay,
  FaFileCsv,
  FaGoogle,
  FaHeart,
  FaHouse,
  FaMagnifyingGlass,
  FaRegBookmark,
  FaRegCircleXmark,
  FaRegStar,
  FaSquareArrowUpRight,
  FaUser,
  FaLock,
} from 'react-icons/fa6';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type ViewKey = 'landing' | 'auth' | 'empty' | 'active';

const views: { key: ViewKey; label: string; description: string }[] = [
  {
    key: 'landing',
    label: 'Landing',
    description: 'Pantalla de inicio pública',
  },
  { key: 'auth', label: 'Auth', description: 'Modal de inicio de sesión' },
  { key: 'empty', label: 'Vacío', description: 'Dashboard sin datos' },
  { key: 'active', label: 'Activo', description: 'Dashboard con datos' },
];

export function MockupShowcase() {
  const [currentView, setCurrentView] = React.useState<ViewKey>('landing');

  return (
    <main className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,rgba(138,2,1,0.32),transparent_28%),linear-gradient(180deg,#050000_0%,#030101_52%,#060704_100%)] px-4 py-4 text-[#F4F6F3] sm:px-6 lg:px-8 lg:py-6">
      <div className="absolute inset-0 -z-10 opacity-90">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(138,2,1,0.16),transparent_24%),radial-gradient(circle_at_80%_10%,rgba(255,255,255,0.06),transparent_18%),linear-gradient(180deg,rgba(5,0,0,0.85),rgba(5,0,0,0.98))]" />
        <div className="absolute inset-0 grid grid-cols-6 gap-2 opacity-20 blur-[1.5px] sm:grid-cols-8 lg:grid-cols-12">
          {Array.from({ length: 12 }).map((_, index) => (
            <div
              key={index}
              className="aspect-2/3 rounded-xl border border-white/5 bg-[linear-gradient(180deg,rgba(255,255,255,0.1),rgba(0,0,0,0.65)),radial-gradient(circle_at_top,rgba(138,2,1,0.65),transparent_45%)] shadow-[0_0_40px_rgba(0,0,0,0.45)]"
              style={{
                transform: `rotate(${(index % 5) - 2}deg) translateY(${index % 3}px)`,
              }}
            />
          ))}
        </div>
      </div>

      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <header className="flex flex-col gap-4 rounded-[28px] border border-[#8A0201]/20 bg-[#060704]/90 p-4 shadow-[0_24px_80px_rgba(0,0,0,0.5)] backdrop-blur-xl lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex size-12 items-center justify-center rounded-2xl border border-[#8A0201]/30 bg-[#050000] shadow-[0_0_30px_rgba(138,2,1,0.25)]">
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
              <h1 className="text-lg font-semibold text-[#F4F6F3] sm:text-xl">
                Showroom visual para la app de cine
              </h1>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {views.map((view) => (
              <Button
                key={view.key}
                type="button"
                onClick={() => setCurrentView(view.key)}
                variant={currentView === view.key ? 'default' : 'outline'}
                className={
                  currentView === view.key
                    ? 'border-[#8A0201]/40 bg-[#8A0201] text-[#F4F6F3] hover:bg-[#8A0201]/90'
                    : 'border-white/10 bg-white/5 text-[#F4F6F3] hover:bg-white/10'
                }
              >
                {view.label}
              </Button>
            ))}
          </div>
        </header>

        <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
          <section className="space-y-4">
            <div className="flex items-center justify-between rounded-[22px] border border-white/10 bg-black/20 px-4 py-3 backdrop-blur-md">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-[#F4F6F3]/45">
                  Vista previa interactiva
                </p>
                <h2 className="text-lg font-semibold text-[#F4F6F3]">
                  {views.find((view) => view.key === currentView)?.description}
                </h2>
              </div>
              <Badge className="border border-[#8A0201]/30 bg-[#8A0201]/10 text-[#F4F6F3]">
                <FaSquareArrowUpRight className="mr-1 size-3.5" />
                Framer Motion activo
              </Badge>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={currentView}
                initial={{ opacity: 0, y: 18, scale: 0.985 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -12, scale: 0.985 }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
                className="overflow-hidden rounded-[32px] border border-[#8A0201]/20 bg-[#060704]/88 shadow-[0_30px_120px_rgba(0,0,0,0.55)] backdrop-blur-xl"
              >
                {currentView === 'landing' ? <LandingMockup /> : null}
                {currentView === 'auth' ? <AuthMockup /> : null}
                {currentView === 'empty' ? <EmptyDashboardMockup /> : null}
                {currentView === 'active' ? <ActiveDashboardMockup /> : null}
              </motion.div>
            </AnimatePresence>
          </section>

          <aside className="grid gap-4">
            <Card className="border-[#8A0201]/20 bg-[#060704]/90 shadow-[0_20px_70px_rgba(0,0,0,0.45)] backdrop-blur-xl">
              <CardHeader className="space-y-2">
                <CardTitle className="text-2xl text-[#F4F6F3]">
                  Estados de la interfaz
                </CardTitle>
                <p className="text-sm leading-6 text-[#F4F6F3]/68">
                  Cuatro pantallas clave del flujo de usuario para revisar la
                  dirección visual antes de construir la Fase 2.
                </p>
              </CardHeader>
              <CardContent className="grid gap-3 sm:grid-cols-2">
                {[
                  ['Landing', 'Portada pública con CTA y mosaico de posters.'],
                  ['Auth', 'Modal ligero para continuar con Google.'],
                  ['Vacío', 'Dashboard inicial con drag & drop de CSV.'],
                  ['Activo', 'Panel con métricas, gráfica y feed FYP.'],
                ].map(([title, description]) => (
                  <div
                    key={title}
                    className="rounded-2xl border border-white/8 bg-black/20 p-4"
                  >
                    <p className="text-sm font-semibold text-[#F4F6F3]">
                      {title}
                    </p>
                    <p className="mt-2 text-sm leading-6 text-[#F4F6F3]/68">
                      {description}
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="border-[#8A0201]/20 bg-[#101009]/85 shadow-[0_20px_70px_rgba(0,0,0,0.45)] backdrop-blur-xl">
              <CardHeader className="space-y-2">
                <CardTitle className="text-2xl text-[#F4F6F3]">
                  Paleta cinematográfica
                </CardTitle>
                <p className="text-sm leading-6 text-[#F4F6F3]/68">
                  Negro absoluto, contenedores oscuros y acento cereza para dar
                  una atmósfera premium.
                </p>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  ['Fondo principal', '#050000'],
                  ['Tarjetas', '#101009 / #060704'],
                  ['Acento', '#8A0201'],
                  ['Texto', '#F4F6F3'],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    className="flex items-center justify-between rounded-2xl border border-white/8 bg-black/20 px-4 py-3"
                  >
                    <span className="text-sm text-[#F4F6F3]/70">{label}</span>
                    <span className="text-sm font-semibold text-[#F4F6F3]">
                      {value}
                    </span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </aside>
        </div>
      </div>
    </main>
  );
}

function CsvImportLoader() {
  return (
    <div
      className="flex flex-col items-center justify-center gap-3"
      aria-label="Loader de importación CSV"
    >
      <svg height="128px" width="128px" viewBox="0 0 128 128" className="pl1">
        <defs>
          <linearGradient y2={1} x2={1} y1={0} x1={0} id="pl-grad">
            <stop stopColor="#000" offset="0%" />
            <stop stopColor="#fff" offset="100%" />
          </linearGradient>
          <mask id="pl-mask">
            <rect fill="url(#pl-grad)" height={128} width={128} y={0} x={0} />
          </mask>
        </defs>
        <g fill="var(--primary, #8A0201)">
          <g className="pl1__g">
            <g transform="translate(20,20) rotate(0,44,44)">
              <g className="pl1__rect-g">
                <rect
                  height={40}
                  width={40}
                  ry={8}
                  rx={8}
                  className="pl1__rect"
                />
                <rect
                  transform="translate(0,48)"
                  height={40}
                  width={40}
                  ry={8}
                  rx={8}
                  className="pl1__rect"
                />
              </g>
              <g transform="rotate(180,44,44)" className="pl1__rect-g">
                <rect
                  height={40}
                  width={40}
                  ry={8}
                  rx={8}
                  className="pl1__rect"
                />
                <rect
                  transform="translate(0,48)"
                  height={40}
                  width={40}
                  ry={8}
                  rx={8}
                  className="pl1__rect"
                />
              </g>
            </g>
          </g>
        </g>
        <g mask="url(#pl-mask)" fill="#F4F6F3">
          <g className="pl1__g">
            <g transform="translate(20,20) rotate(0,44,44)">
              <g className="pl1__rect-g">
                <rect
                  height={40}
                  width={40}
                  ry={8}
                  rx={8}
                  className="pl1__rect"
                />
                <rect
                  transform="translate(0,48)"
                  height={40}
                  width={40}
                  ry={8}
                  rx={8}
                  className="pl1__rect"
                />
              </g>
              <g transform="rotate(180,44,44)" className="pl1__rect-g">
                <rect
                  height={40}
                  width={40}
                  ry={8}
                  rx={8}
                  className="pl1__rect"
                />
                <rect
                  transform="translate(0,48)"
                  height={40}
                  width={40}
                  ry={8}
                  rx={8}
                  className="pl1__rect"
                />
              </g>
            </g>
          </g>
        </g>
      </svg>
      <div className="text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[#F4F6F3]/60">
          Procesando CSV
        </p>
        <p className="mt-2 text-sm leading-6 text-[#F4F6F3]/68">
          Leyendo columnas, validando títulos y preparando tu biblioteca.
        </p>
      </div>

      <style jsx>{`
        .pl1 {
          display: block;
          width: 8em;
          height: 8em;
        }

        .pl1__g,
        .pl1__rect {
          animation: pl1-a 1.5s cubic-bezier(0.65, 0, 0.35, 1) infinite;
        }

        .pl1__g {
          transform-origin: 64px 64px;
        }

        .pl1__rect:first-child {
          animation-name: pl1-b;
        }

        .pl1__rect:nth-child(2) {
          animation-name: pl1-c;
        }

        @keyframes pl1-a {
          from {
            transform: rotate(0);
          }

          80%,
          to {
            animation-timing-function: steps(1, start);
            transform: rotate(90deg);
          }
        }

        @keyframes pl1-b {
          from {
            animation-timing-function: cubic-bezier(0.33, 0, 0.67, 0);
            width: 40px;
            height: 40px;
          }

          20% {
            animation-timing-function: steps(1, start);
            width: 40px;
            height: 0;
          }

          60% {
            animation-timing-function: cubic-bezier(0.65, 0, 0.35, 1);
            width: 0;
            height: 40px;
          }

          80%,
          to {
            width: 40px;
            height: 40px;
          }
        }

        @keyframes pl1-c {
          from {
            animation-timing-function: cubic-bezier(0.33, 0, 0.67, 0);
            width: 40px;
            height: 40px;
            transform: translate(0, 48px);
          }

          20% {
            animation-timing-function: cubic-bezier(0.33, 1, 0.67, 1);
            width: 40px;
            height: 88px;
            transform: translate(0, 0);
          }

          40% {
            animation-timing-function: cubic-bezier(0.33, 0, 0.67, 0);
            width: 40px;
            height: 40px;
            transform: translate(0, 0);
          }

          60% {
            animation-timing-function: cubic-bezier(0.33, 1, 0.67, 1);
            width: 88px;
            height: 40px;
            transform: translate(0, 0);
          }

          80%,
          to {
            width: 40px;
            height: 40px;
            transform: translate(48px, 0);
          }
        }
      `}</style>
    </div>
  );
}

function LandingMockup() {
  return (
    <div className="relative overflow-hidden p-4 sm:p-6 lg:p-8">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(138,2,1,0.18),transparent_32%),linear-gradient(180deg,rgba(255,255,255,0.06),transparent_26%)]" />
      <div className="relative overflow-hidden rounded-[28px] border border-white/8 bg-[linear-gradient(180deg,rgba(5,0,0,0.35),rgba(5,0,0,0.7)),radial-gradient(circle_at_top,rgba(138,2,1,0.2),transparent_35%)] p-5 shadow-[0_30px_100px_rgba(0,0,0,0.55)] sm:p-8">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-2 text-[#8A0201]">
            <Image
              src="/doyess-logo.svg"
              alt="Doyess Film"
              width={22}
              height={22}
              priority
            />
            <span className="text-lg font-semibold">Doyess Film</span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              className="border-white/10 bg-white/5 text-[#F4F6F3]"
            >
              Iniciar sesión
            </Button>
            <Button
              size="sm"
              className="bg-[#8A0201] text-[#F4F6F3] hover:bg-[#8A0201]/90"
            >
              Comenzar gratis
            </Button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div className="space-y-5">
            <Badge className="w-fit border border-white/10 bg-white/5 text-[#F4F6F3]">
              Descubre, analiza y redescubre
            </Badge>
            <h2 className="max-w-3xl text-4xl font-extrabold leading-[0.94] tracking-tight text-[#F4F6F3] sm:text-5xl lg:text-6xl">
              Tu historia cinematográfica, analizada y{' '}
              <span className="bg-linear-to-r from-[#F4F6F3] via-[#8A0201] to-[#d11c1c] bg-clip-text text-transparent">
                redescubierta
              </span>
            </h2>
            <p className="max-w-2xl text-base leading-7 text-[#F4F6F3]/72 sm:text-lg">
              Importa tu historial de IMDb, descubre patrones en tus gustos y
              encuentra qué ver sin perder tiempo.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button className="bg-[#8A0201] px-6 text-[#F4F6F3] hover:bg-[#8A0201]/90">
                <FaGoogle className="size-4" />
                Comenzar gratis con Google
              </Button>
              <Button
                variant="outline"
                className="border-white/10 bg-white/5 text-[#F4F6F3]"
              >
                <FaCirclePlay className="size-4" />
                Ver recorrido
              </Button>
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 -z-10 rounded-[28px] bg-[radial-gradient(circle_at_center,rgba(138,2,1,0.24),transparent_55%)] blur-2xl" />
            <div className="grid grid-cols-3 gap-2 rounded-[28px] border border-white/8 bg-black/25 p-3">
              {Array.from({ length: 9 }).map((_, index) => (
                <div
                  key={index}
                  className="aspect-2/3 rounded-xl border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(0,0,0,0.7)),radial-gradient(circle_at_top,rgba(138,2,1,0.45),transparent_42%)] shadow-[0_10px_30px_rgba(0,0,0,0.45)]"
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function AuthMockup() {
  return (
    <div className="relative grid min-h-180 place-items-center overflow-hidden p-6">
      <div className="absolute inset-0 bg-black/55 backdrop-blur-[18px]" />
      <Card className="relative w-full max-w-md border-[#8A0201]/20 bg-[#101009]/95 shadow-[0_28px_90px_rgba(0,0,0,0.7)]">
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 flex size-12 items-center justify-center rounded-2xl border border-white/8 bg-black/25 text-[#8A0201]">
            <FaUser className="size-5" />
          </div>
          <CardTitle className="text-2xl text-[#F4F6F3]">
            Iniciar sesión en Doyess Film
          </CardTitle>
          <p className="text-sm leading-6 text-[#F4F6F3]/68">
            Para empezar, necesitamos tu historia.
          </p>
        </CardHeader>
        <CardContent className="space-y-4 px-6 pb-6">
          <Button className="h-12 w-full justify-start gap-3 border border-white/10 bg-[#060704] text-[#F4F6F3] hover:bg-white/8">
            <FaGoogle className="size-4 text-white" />
            Continuar con Google
          </Button>
          <div className="rounded-2xl border border-white/8 bg-black/20 p-4 text-sm leading-6 text-[#F4F6F3]/70">
            ¿No tienes cuenta? Regístrate con Google para empezar.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function EmptyDashboardMockup() {
  const [importPreview, setImportPreview] = React.useState<{
    name: string;
    count: number;
    sample: string[];
  } | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  const handleCsvFile = React.useCallback(async (file: File | null) => {
    if (!file) {
      return;
    }

    const text = await file.text();
    const rows = parseImdbExport(text);

    setImportPreview({
      name: file.name,
      count: rows.length,
      sample: rows
        .slice(0, 3)
        .map(
          (row) =>
            `${row.title} · ${row.year ?? 'N/D'} · ${row.yourRating ?? 'N/D'}`,
        ),
    });
  }, []);

  const openFilePicker = React.useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  return (
    <div className="grid min-h-190 lg:grid-cols-[240px_1fr]">
      <aside className="hidden border-r border-white/8 bg-black/25 p-5 lg:block">
        <div className="mb-6 flex items-center gap-2 text-[#8A0201]">
          <Image
            src="/doyess-logo.svg"
            alt="Doyess Film"
            width={20}
            height={20}
            priority
          />
          <span className="text-lg font-semibold">Doyess Film</span>
        </div>
        <nav className="space-y-2 text-sm">
          {(
            [
              [FaHouse, 'Dashboard', true],
              [FaCirclePlay, 'Para vos (FYP)', false],
              [FaRegStar, 'Estadísticas', false],
              [FaBars, 'Biblioteca', false],
            ] as Array<[IconType, string, boolean]>
          ).map(([Icon, label, active]) => (
            <div
              key={label}
              className={`flex items-center justify-between rounded-2xl px-3 py-3 ${active ? 'bg-[#8A0201]/15 text-[#F4F6F3]' : 'text-[#F4F6F3]/48'}`}
            >
              <div className="flex items-center gap-3">
                <Icon className="size-4" />
                <span>{label}</span>
              </div>
              {!active ? <FaLock className="size-3 text-[#F4F6F3]/35" /> : null}
            </div>
          ))}
        </nav>
      </aside>

      <div className="p-5 sm:p-6 lg:p-8">
        <div className="rounded-[28px] border border-[#8A0201]/20 bg-[linear-gradient(180deg,rgba(16,16,9,0.95),rgba(6,7,4,0.9))] p-5 shadow-[0_20px_70px_rgba(0,0,0,0.45)] sm:p-7">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm text-[#F4F6F3]/65">Hola, Dylan</p>
              <h2 className="text-3xl font-bold text-[#F4F6F3]">
                Para empezar, necesitamos tu historia
              </h2>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,text/csv"
              className="hidden"
              onChange={(event) => {
                void handleCsvFile(event.target.files?.[0] ?? null);
              }}
            />
            <Button
              className="bg-[#8A0201] text-[#F4F6F3] hover:bg-[#8A0201]/90"
              onClick={openFilePicker}
            >
              Examinar archivo
            </Button>
          </div>

          <div className="mb-4 grid gap-4 lg:grid-cols-[0.88fr_1.12fr]">
            <Card className="border-[#8A0201]/20 bg-black/20 shadow-[0_16px_50px_rgba(0,0,0,0.35)]">
              <CardContent className="p-5">
                <CsvImportLoader />
              </CardContent>
            </Card>

            <Card className="border-white/8 bg-black/15">
              <CardHeader className="space-y-2">
                <CardTitle className="text-lg text-[#F4F6F3]">
                  Estado de importación
                </CardTitle>
                <p className="text-sm leading-6 text-[#F4F6F3]/68">
                  Este loader queda fijo en la parte de importación para que la
                  Fase 2 tenga una transición clara entre esperar y cargar.
                </p>
              </CardHeader>
              <CardContent className="space-y-3 text-sm leading-6 text-[#F4F6F3]/68">
                <div className="rounded-2xl border border-white/8 bg-black/20 p-4">
                  Paso 1: el usuario sube el CSV de IMDb.
                </div>
                <div className="rounded-2xl border border-white/8 bg-black/20 p-4">
                  Paso 2: validamos columnas, títulos y años.
                </div>
                <div className="rounded-2xl border border-white/8 bg-black/20 p-4">
                  Paso 3: generamos estadísticas, feed y recomendaciones.
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
            <Card className="border-dashed border-[#8A0201]/30 bg-black/15">
              <CardContent className="flex min-h-70 flex-col items-center justify-center gap-4 p-8 text-center">
                <div className="flex size-16 items-center justify-center rounded-full border border-[#8A0201]/20 bg-[#8A0201]/10 text-[#8A0201]">
                  <FaFileCsv className="size-7" />
                </div>
                <div className="space-y-2">
                  <p className="text-xl font-semibold text-[#F4F6F3]">
                    Arrastra tu archivo CSV de IMDb aquí
                  </p>
                  <p className="max-w-xl text-sm leading-6 text-[#F4F6F3]/68">
                    Descarga el historial desde IMDb, súbelo aquí y deja que
                    empecemos a construir tus estadísticas.
                  </p>
                </div>
                <Button
                  className="bg-[#8A0201] text-[#F4F6F3] hover:bg-[#8A0201]/90"
                  onClick={openFilePicker}
                >
                  <FaSquareArrowUpRight className="size-4" />
                  Examinar archivo
                </Button>
              </CardContent>
            </Card>

            <Card className="border-white/8 bg-black/20">
              <CardHeader>
                <CardTitle className="text-lg text-[#F4F6F3]">
                  Guía rápida
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm leading-6 text-[#F4F6F3]/68">
                <div className="rounded-2xl border border-white/8 bg-black/20 p-4">
                  Exporta tu CSV desde IMDb en la sección de historial.
                </div>
                <div className="rounded-2xl border border-white/8 bg-black/20 p-4">
                  Después podremos construir tu laboratorio de gustos.
                </div>
                {importPreview ? (
                  <div className="rounded-2xl border border-[#8A0201]/25 bg-[#8A0201]/10 p-4 text-[#F4F6F3]">
                    <p className="text-xs uppercase tracking-[0.24em] text-[#F4F6F3]/55">
                      Vista previa
                    </p>
                    <p className="mt-2 text-sm font-semibold">
                      {importPreview.name}
                    </p>
                    <p className="mt-1 text-sm text-[#F4F6F3]/72">
                      {importPreview.count} títulos listos para procesar.
                    </p>
                    <div className="mt-3 space-y-2 text-xs text-[#F4F6F3]/65">
                      {importPreview.sample.map((item) => (
                        <div
                          key={item}
                          className="rounded-xl border border-white/8 bg-black/20 px-3 py-2"
                        >
                          {item}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}
              </CardContent>
            </Card>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-3">
            {[
              'Sube tu archivo para ver tus estadísticas',
              'Feed inactivo',
              'Recomendaciones (Esperando datos)',
            ].map((label) => (
              <Card key={label} className="border-white/8 bg-black/15">
                <CardContent className="space-y-3 p-4">
                  <div className="h-3 w-20 rounded-full bg-white/10" />
                  <div className="h-10 rounded-2xl bg-white/5" />
                  <p className="text-sm text-[#F4F6F3]/68">{label}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function ActiveDashboardMockup() {
  return (
    <div className="grid min-h-190 lg:grid-cols-[240px_1fr]">
      <aside className="border-r border-white/8 bg-black/25 p-5">
        <div className="mb-6 flex items-center gap-2 text-[#8A0201]">
          <Image
            src="/doyess-logo.svg"
            alt="Doyess Film"
            width={20}
            height={20}
            priority
          />
          <span className="text-lg font-semibold">Doyess Film</span>
        </div>
        <nav className="space-y-2 text-sm">
          {(
            [
              [FaHouse, 'Dashboard', true],
              [FaCirclePlay, 'Para vos (FYP)', false],
              [FaRegStar, 'Estadísticas', false],
              [FaBars, 'Biblioteca', false],
            ] as Array<[IconType, string, boolean]>
          ).map(([Icon, label, active]) => (
            <div
              key={label}
              className={`flex items-center justify-between rounded-2xl px-3 py-3 ${active ? 'bg-[#8A0201]/15 text-[#F4F6F3]' : 'text-[#F4F6F3]/48'}`}
            >
              <div className="flex items-center gap-3">
                <Icon className="size-4" />
                <span>{label}</span>
              </div>
              {!active ? <FaLock className="size-3 text-[#F4F6F3]/35" /> : null}
            </div>
          ))}
        </nav>
      </aside>

      <div className="p-5 sm:p-6 lg:p-8">
        <div className="space-y-4">
          <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
            CSV de IMDb importado con éxito: 132 películas agregadas.
          </div>

          <div className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
            <Card className="border-[#8A0201]/20 bg-[#101009]/90 shadow-[0_20px_70px_rgba(0,0,0,0.45)]">
              <CardContent className="p-5">
                <div className="flex flex-wrap items-center gap-3">
                  <div className="rounded-2xl border border-white/8 bg-black/20 px-4 py-3">
                    <p className="text-xs uppercase tracking-[0.24em] text-[#F4F6F3]/55">
                      Promedio de notas
                    </p>
                    <p className="mt-2 text-4xl font-semibold text-[#F4F6F3]">
                      7.8
                    </p>
                  </div>
                  <div className="rounded-2xl border border-white/8 bg-black/20 px-4 py-3">
                    <p className="text-xs uppercase tracking-[0.24em] text-[#F4F6F3]/55">
                      Películas vistas
                    </p>
                    <p className="mt-2 text-4xl font-semibold text-[#F4F6F3]">
                      256
                    </p>
                  </div>
                </div>
                <div className="mt-5 grid gap-4 md:grid-cols-[1fr_0.9fr]">
                  <Card className="border-white/8 bg-black/15">
                    <CardHeader>
                      <CardTitle className="text-lg text-[#F4F6F3]">
                        Géneros favoritos
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex h-48 items-end gap-4 rounded-3xl bg-black/20 p-5">
                        {[
                          ['Drama', 'h-[82%]'],
                          ['Crimen', 'h-[64%]'],
                          ['Suspenso', 'h-[56%]'],
                        ].map(([label, height]) => (
                          <div
                            key={label}
                            className="flex flex-1 flex-col items-center justify-end gap-2"
                          >
                            <div
                              className={`w-full rounded-t-3xl bg-[#8A0201] ${height}`}
                            />
                            <span className="text-xs text-[#F4F6F3]/70">
                              {label}
                            </span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-white/8 bg-black/15">
                    <CardHeader>
                      <CardTitle className="text-lg text-[#F4F6F3]">
                        Directores más valorados
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {[
                        ['Steven Spielberg', '9.2'],
                        ['Martin Scorsese', '8.9'],
                        ['Christopher Nolan', '8.7'],
                      ].map(([name, rating]) => (
                        <div
                          key={name}
                          className="flex items-center justify-between rounded-2xl border border-white/8 bg-black/15 px-4 py-3"
                        >
                          <div className="flex items-center gap-3">
                            <div className="flex size-10 items-center justify-center rounded-full bg-[#8A0201]/20 text-sm font-semibold text-[#F4F6F3]">
                              {name.slice(0, 1)}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-[#F4F6F3]">
                                {name}
                              </p>
                              <p className="text-xs text-[#F4F6F3]/55">
                                Promedio ponderado
                              </p>
                            </div>
                          </div>
                          <span className="text-sm font-semibold text-[#F4F6F3]">
                            {rating}
                          </span>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>

            <Card className="border-[#8A0201]/20 bg-[#060704]/90 shadow-[0_20px_70px_rgba(0,0,0,0.45)]">
              <CardHeader>
                <CardTitle className="text-2xl text-[#F4F6F3]">
                  Feed de Descubrimiento
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="overflow-hidden rounded-[26px] border border-white/8 bg-black/20">
                  <div className="aspect-3/4 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(0,0,0,0.7)),radial-gradient(circle_at_top,rgba(138,2,1,0.28),transparent_40%)] p-4">
                    <div className="flex h-full flex-col justify-between">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          size="sm"
                          className="bg-[#8A0201] text-[#F4F6F3] hover:bg-[#8A0201]/90"
                        >
                          <FaHeart className="size-3.5" />
                          Me gusta
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-white/10 bg-white/5 text-[#F4F6F3]"
                        >
                          <FaRegCircleXmark className="size-3.5" />
                          No me interesa
                        </Button>
                      </div>
                      <div className="rounded-3xl border border-white/10 bg-black/55 p-4 backdrop-blur">
                        <h3 className="text-3xl font-semibold text-[#F4F6F3]">
                          Infiltrados, 2006
                        </h3>
                        <p className="mt-2 text-sm leading-6 text-[#F4F6F3]/70">
                          Afinidad estimada: 94% - Recomendada por tu alta
                          valoración de dramas criminales de Martin Scorsese.
                        </p>
                        <div className="mt-4 flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-white/10 bg-white/5 text-[#F4F6F3]"
                          >
                            <FaRegBookmark className="size-3.5" />
                            Ver más tarde
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-white/10 bg-white/5 text-[#F4F6F3]"
                          >
                            <FaMagnifyingGlass className="size-3.5" />
                            Explorar
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="rounded-2xl border border-white/8 bg-black/15 p-4 text-sm text-[#F4F6F3]/68">
                  Este bloque reproduce el primer estado del feed de
                  descubrimiento: acciones rápidas, recomendación contextual y
                  tono inmersivo.
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
