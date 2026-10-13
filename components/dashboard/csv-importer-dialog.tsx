'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { parseImdbExport } from '@/lib/imdb/parse-csv';
import { useImdbImport } from '@/hooks/use-imdb-import';
import { runTmdbEnrichPending } from '@/lib/imdb/run-tmdb-enrich-batches';
import { ImportProgressPanel } from '@/components/dashboard/import-progress-panel';
import { FileSpreadsheet, Upload, CheckCircle2, AlertCircle } from 'lucide-react';

interface CsvImporterDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  onImportSuccess?: () => void;
}

export function CsvImporterDialog({
  open,
  onOpenChange,
  userId,
  onImportSuccess,
}: CsvImporterDialogProps) {
  const router = useRouter();
  const importMutation = useImdbImport(userId);
  const [error, setError] = React.useState<string | null>(null);
  const [fileName, setFileName] = React.useState<string | null>(null);
  const [successCount, setSuccessCount] = React.useState<number | null>(null);
  const [phaseMessage, setPhaseMessage] = React.useState('Leyendo CSV…');
  const [progress, setProgress] = React.useState(12);
  const [enrichRemaining, setEnrichRemaining] = React.useState(0);
  const [retryingTmdb, setRetryingTmdb] = React.useState(false);

  const onPhase = React.useCallback((message: string, pct?: number) => {
    setPhaseMessage(message);
    if (pct != null) setProgress(pct);
  }, []);

  const processCsvText = async (csvText: string, name: string) => {
    setError(null);
    setSuccessCount(null);
    setEnrichRemaining(0);
    setPhaseMessage('Leyendo CSV…');
    setProgress(15);

    try {
      const importedTitles = parseImdbExport(csvText);
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
        throw new Error(
          result.errors[0] ??
            'No se importó ninguna calificación. Revisa que el CSV tenga notas del 1 al 10.',
        );
      }

      setFileName(name);
      setSuccessCount(result.imported);
      setEnrichRemaining(result.enrichRemaining ?? 0);
      onImportSuccess?.();
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al procesar el archivo CSV');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      void processCsvText(text, file.name);
    };
    reader.onerror = () => {
      setError('No se pudo leer el archivo seleccionado');
    };
    reader.readAsText(file, 'utf-8');
  };

  const isProcessing = importMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[min(92vh,44rem)] w-[calc(100vw-1.25rem)] max-w-xl overflow-y-auto border border-[#8A0201]/30 bg-[#0A0505] text-[#F4F6F3] shadow-[0_24px_80px_rgba(0,0,0,0.85)] backdrop-blur-2xl sm:w-full">
        <DialogHeader className="space-y-2">
          <div className="flex items-center gap-2 text-[#8A0201]">
            <FileSpreadsheet className="size-5" />
            <Badge className="border border-[#8A0201]/40 bg-[#8A0201]/20 text-[#F4F6F3]">
              Motor IMDb
            </Badge>
          </div>
          <DialogTitle className="text-2xl font-bold tracking-tight text-[#F4F6F3]">
            Importar historial IMDb
          </DialogTitle>
          <DialogDescription className="text-sm leading-6 text-[#F4F6F3]/70">
            Sube el CSV de calificaciones exportado desde IMDb. Tus datos se guardan en tu cuenta
            y alimentan el panel de estadísticas.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {isProcessing ? (
            <div className="rounded-2xl border border-white/10 bg-black/40 px-6 py-8">
              <ImportProgressPanel
                phase={phaseMessage}
                progress={progress}
                detail="Importación IMDb y enriquecimiento TMDB por lotes."
              />
            </div>
          ) : (
            <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#8A0201]/30 bg-black/40 p-8 text-center transition hover:border-[#8A0201] hover:bg-[#8A0201]/5">
              <Upload className="size-10 text-[#8A0201]" />
              <span className="mt-3 text-base font-semibold text-[#F4F6F3]">
                Seleccionar archivo CSV
              </span>
              <span className="mt-1 text-xs text-[#F4F6F3]/50">
                Exportación estándar de calificaciones IMDb (.csv)
              </span>
              <input
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                className="hidden"
                disabled={isProcessing}
              />
            </label>
          )}

          {fileName && successCount === null && !error && !isProcessing && (
            <p className="text-xs text-[#F4F6F3]/50 text-center">Archivo: {fileName}</p>
          )}

          {error && (
            <div className="flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-300">
              <AlertCircle className="size-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successCount !== null && (
            <div className="space-y-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-300">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="size-4 shrink-0" />
                  <span>
                    {successCount} calificaciones guardadas
                    {fileName ? ` (${fileName})` : ''}.
                  </span>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  className="border-emerald-500/40 bg-emerald-500/20 text-emerald-100 hover:bg-emerald-500/30"
                >
                  Ver dashboard
                </Button>
              </div>
              {enrichRemaining > 0 ? (
                <p className="text-xs text-emerald-200/80">
                  Quedan {enrichRemaining} títulos pendientes de TMDB.{' '}
                  <button
                    type="button"
                    disabled={retryingTmdb}
                    className="font-medium underline hover:no-underline disabled:opacity-50"
                    onClick={() => {
                      setRetryingTmdb(true);
                      void runTmdbEnrichPending(onPhase)
                        .then((r) => {
                          setEnrichRemaining(r.remaining);
                          router.refresh();
                        })
                        .finally(() => setRetryingTmdb(false));
                    }}
                  >
                    {retryingTmdb ? 'Enriqueciendo…' : 'Completar ahora'}
                  </button>
                </p>
              ) : null}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
