'use client';

import Image from 'next/image';
import { BarChart3, Download, Star, Upload } from 'lucide-react';
import { DashboardCsvDropzone } from '@/components/dashboard/dashboard-csv-dropzone';
import { Skeleton } from '@/components/ui/skeleton';
import { useRateFlowStore } from '@/stores/rate-flow-store';

type DashboardEmptyStateProps = {
  userName: string;
  userId: string;
  schemaWarning?: string | null;
};

const STEPS = [
  {
    n: '01',
    title: 'Califica en la app',
    body: 'Busca una película o serie y guarda tu nota del 1 al 10.',
    icon: Star,
  },
  {
    n: '02',
    title: 'O importa IMDb',
    body: '¿Ya tienes historial? Sube tu CSV y lo sincronizamos.',
    icon: Upload,
  },
  {
    n: '03',
    title: 'Descubre tus patrones',
    body: 'Géneros, notas y directores que definen tu perfil.',
    icon: BarChart3,
  },
] as const;

export function DashboardEmptyState({
  userName,
  userId,
  schemaWarning,
}: DashboardEmptyStateProps) {
  const requestSearchFocus = useRateFlowStore((s) => s.requestSearchFocus);

  return (
    <div className="space-y-10">
      {schemaWarning ? (
        <div
          className="rounded-2xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-100/90"
          role="status"
        >
          <p className="font-medium">Base de datos pendiente en Supabase</p>
          <p className="mt-1 text-xs leading-relaxed text-amber-100/75">
            Ejecuta <code className="text-amber-50">supabase/migrate.sql</code> (o{' '}
            <code className="text-amber-50">schema.sql</code> si el proyecto es nuevo) en el SQL
            Editor antes de calificar o importar CSV.
          </p>
        </div>
      ) : null}

      <section className="grid gap-8 lg:grid-cols-2 lg:items-center">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8A0201]">
            Hola, {userName}
          </p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-[#F4F6F3] sm:text-4xl">
            Tu historia cinematográfica empieza aquí
          </h1>
          <p className="mt-4 max-w-xl text-sm leading-relaxed text-zinc-400 sm:text-base">
            Califica tus títulos favoritos o importa tu CSV de IMDb. En ambos casos construimos tu
            perfil de gustos y te mostramos patrones en géneros, directores y notas.
          </p>
          <button
            type="button"
            onClick={() => requestSearchFocus()}
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#8A0201] px-6 py-3 text-sm font-semibold text-white shadow-[0_0_24px_rgba(138,2,1,0.35)] transition hover:bg-[#a30302]"
          >
            <Star className="size-4 fill-amber-200 text-amber-200" />
            Calificar mi primer título
          </button>
        </div>
        <div className="relative aspect-[16/10] overflow-hidden rounded-2xl border border-white/8 bg-[#101009] shadow-[0_24px_64px_rgba(0,0,0,0.45)]">
          <Image
            src="/landing/dashboard-preview.webp"
            alt="Vista previa de tu panel Doyess Film"
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover object-left-top"
          />
          <div className="absolute inset-0 bg-gradient-to-tr from-[#050000]/80 via-[#050000]/20 to-transparent" />
          <div className="absolute inset-0 ring-1 ring-inset ring-white/10 rounded-2xl" />
        </div>
      </section>

      <section className="rounded-2xl border border-white/8 bg-[#101009]/60 p-6 sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-[#F4F6F3]">¿Ya tienes IMDb?</h2>
            <p className="mt-1 text-sm text-zinc-500">
              Importa tu exportación CSV como camino alternativo.
            </p>
          </div>
          <a
            href="https://www.imdb.com/list/export"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-xs font-medium text-[#8A0201] hover:underline"
          >
            <Download className="size-3.5" />
            Cómo exportar desde IMDb
          </a>
        </div>
        <div className="mt-6">
          <DashboardCsvDropzone userId={userId} />
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-[#F4F6F3]">¿Cómo funciona?</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {STEPS.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.n}
                className="rounded-2xl border border-white/8 bg-[#101009]/80 p-5"
              >
                <div className="flex items-start justify-between gap-3">
                  <span className="flex size-10 items-center justify-center rounded-lg bg-[#8A0201]/15 text-[#8A0201]">
                    <Icon className="size-5" />
                  </span>
                  <span className="text-xs tabular-nums text-zinc-600">{step.n}</span>
                </div>
                <h3 className="mt-4 text-sm font-semibold text-[#F4F6F3]">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-zinc-400">{step.body}</p>
              </div>
            );
          })}
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-[#F4F6F3]">Un vistazo a tu futuro panel</h2>
        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          <PreviewSkeleton title="Tus géneros favoritos" variant="bars" />
          <PreviewSkeleton title="Distribución de notas" variant="chart" />
          <PreviewSkeleton title="Directores mejor valorados" variant="people" />
        </div>
      </section>
    </div>
  );
}

function PreviewSkeleton({
  title,
  variant,
}: {
  title: string;
  variant: 'bars' | 'chart' | 'people';
}) {
  return (
    <div className="rounded-2xl border border-white/8 bg-[#101009]/80 p-5">
      <p className="text-sm font-medium text-zinc-300">{title}</p>
      <div className="mt-5">
        {variant === 'bars' ? (
          <div className="flex h-28 items-end justify-between gap-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton
                key={i}
                className="w-full rounded-md bg-zinc-800/80"
                style={{ height: `${40 + i * 12}%` }}
              />
            ))}
          </div>
        ) : null}
        {variant === 'chart' ? (
          <div className="flex h-28 items-end justify-between gap-1.5">
            {Array.from({ length: 10 }).map((_, i) => (
              <Skeleton
                key={i}
                className="w-full rounded-sm bg-zinc-800/80"
                style={{ height: `${25 + (i % 4) * 15}%` }}
              />
            ))}
          </div>
        ) : null}
        {variant === 'people' ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="size-10 shrink-0 rounded-full bg-zinc-800/80" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-2.5 w-2/3 rounded bg-zinc-800/80" />
                  <Skeleton className="h-2 w-1/2 rounded bg-zinc-800/80" />
                </div>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
