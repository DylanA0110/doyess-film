'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { FileSpreadsheet, ShieldCheck, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { parseImdbExport } from '@/lib/imdb/parse-csv';
import { useImdbImport } from '@/hooks/use-imdb-import';
import { ImportProgressPanel } from '@/components/dashboard/import-progress-panel';

type DashboardCsvDropzoneProps = {
  userId: string;
};

export function DashboardCsvDropzone({ userId }: DashboardCsvDropzoneProps) {
  const router = useRouter();
  const importMutation = useImdbImport(userId);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [phaseMessage, setPhaseMessage] = React.useState('Leyendo CSV…');
  const [progress, setProgress] = React.useState(10);

  const onPhase = (message: string, pct?: number) => {
    setPhaseMessage(message);
    if (pct != null) setProgress(pct);
  };

  const processFile = async (file: File) => {
    setError(null);
    setPhaseMessage('Leyendo CSV…');
    const text = await file.text();
    try {
      const importedTitles = parseImdbExport(text);
      if (importedTitles.length === 0) {
        throw new Error('El archivo CSV no contiene registros válidos de IMDb.');
      }
      setPhaseMessage('Guardando calificaciones…');
      setProgress(35);
      const result = await importMutation.mutateAsync({
        titles: importedTitles,
        onPhaseChange: onPhase,
      });
      setProgress(100);
      if (result.imported === 0) {
        throw new Error(result.errors[0] ?? 'No se importó ninguna calificación.');
      }
      router.refresh();
    } catch (err) {
      const raw = err instanceof Error ? err.message : 'Error al procesar el CSV';
      if (raw.includes("table 'public.movies'") || raw.includes('schema cache')) {
        setError(
          'Faltan tablas en Supabase. Ejecuta supabase/schema.sql en el SQL Editor y vuelve a importar.',
        );
        return;
      }
      setError(raw);
    }
  };

  const onFiles = (files: FileList | null) => {
    const file = files?.[0];
    if (!file) return;
    void processFile(file);
  };

  const isProcessing = importMutation.isPending;

  if (isProcessing) {
    return (
      <div className="rounded-2xl border border-white/15 bg-[#101009]/60 px-6 py-12">
        <ImportProgressPanel
          phase={phaseMessage}
          progress={progress}
          detail="Guardando notas y pósters TMDB (películas y series)."
        />
      </div>
    );
  }

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragOver(false);
        onFiles(e.dataTransfer.files);
      }}
      className={`rounded-2xl border border-dashed px-6 py-10 sm:px-10 sm:py-12 text-center transition ${
        dragOver
          ? 'border-[#8A0201]/60 bg-[#8A0201]/5'
          : 'border-white/15 bg-[#101009]/60'
      }`}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".csv,text/csv"
        className="hidden"
        onChange={(e) => onFiles(e.target.files)}
      />

      <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-[#8A0201]/15 text-[#8A0201]">
        <FileSpreadsheet className="size-7" />
      </div>
      <h3 className="mt-5 text-lg font-semibold text-[#F4F6F3]">Importa tu historial de IMDb</h3>
      <p className="mx-auto mt-2 max-w-md text-sm text-zinc-400">
        Arrastra tu archivo CSV aquí o selecciónalo desde tu equipo
      </p>

      <Button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="mt-6 rounded-full bg-[#8A0201] px-6 py-5 text-sm font-semibold text-white hover:bg-[#a30302]"
      >
        <Upload className="mr-2 size-4" />
        Seleccionar archivo CSV
      </Button>

      <p className="mt-5 inline-flex items-center justify-center gap-2 text-xs text-zinc-500">
        <ShieldCheck className="size-3.5 text-[#8A0201]" />
        Tus calificaciones se validan antes de sincronizarse
      </p>

      {error ? <p className="mt-4 text-sm text-rose-400">{error}</p> : null}
    </div>
  );
}
