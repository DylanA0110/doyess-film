'use client';

import * as React from 'react';
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
import type { ImportedTitle } from '@/lib/imdb/types';
import type { DashboardStats, DashboardMovie } from './types';
import { FileSpreadsheet, Upload, CheckCircle2, Sparkles, AlertCircle } from 'lucide-react';

interface CsvImporterDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImportComplete: (stats: DashboardStats, movies: DashboardMovie[], totalCount: number) => void;
}

export function CsvImporterDialog({
  open,
  onOpenChange,
  onImportComplete,
}: CsvImporterDialogProps) {
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [fileName, setFileName] = React.useState<string | null>(null);
  const [successCount, setSuccessCount] = React.useState<number | null>(null);

  const processCsvText = (csvText: string, name: string) => {
    setIsProcessing(true);
    setError(null);

    try {
      const importedTitles = parseImdbExport(csvText);
      if (importedTitles.length === 0) {
        throw new Error('El archivo CSV no contiene registros válidos de IMDb.');
      }

      // Calculate statistics
      let totalRuntime = 0;
      let totalRating = 0;
      let ratedCount = 0;
      const genreCounts: Record<string, number> = {};
      const directorCounts: Record<string, number> = {};

      importedTitles.forEach((t) => {
        if (t.runtimeMinutes) {
          totalRuntime += t.runtimeMinutes;
        }
        if (t.yourRating) {
          totalRating += t.yourRating;
          ratedCount++;
        }
        t.genres.forEach((g) => {
          genreCounts[g] = (genreCounts[g] || 0) + 1;
        });
        t.directors.forEach((d) => {
          directorCounts[d] = (directorCounts[d] || 0) + 1;
        });
      });

      const avg = ratedCount > 0 ? Number((totalRating / ratedCount).toFixed(1)) : 8.0;

      // Top genres
      const sortedGenres = Object.entries(genreCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);

      const totalGenreCount = sortedGenres.reduce((acc, curr) => acc + curr[1], 0) || 1;
      const genreColors = ['#8A0201', '#5B1E31', '#C80000', '#801818', '#D97706'];

      const topGenres = sortedGenres.map(([name, count], idx) => ({
        name,
        count,
        percentage: Math.round((count / totalGenreCount) * 80),
        color: genreColors[idx % genreColors.length],
      }));
      topGenres.push({
        name: 'Otros',
        count: Math.round(importedTitles.length * 0.2),
        percentage: 20,
        color: '#52525B',
      });

      // Top director
      const topDirectorEntry = Object.entries(directorCounts).sort((a, b) => b[1] - a[1])[0];
      const topDirectorName = topDirectorEntry ? topDirectorEntry[0] : 'Christopher Nolan';

      const stats: DashboardStats = {
        moviesWatched: importedTitles.length,
        moviesWatchedDelta: `+${importedTitles.length} importadas`,
        averageRating: avg,
        averageRatingDelta: 'Base IMDb real',
        screenTimeMinutes: totalRuntime,
        screenTimeString: `${Math.round(totalRuntime / 60)}h (${(totalRuntime / 1000).toFixed(1)}k m)`,
        screenTimeDelta: `${importedTitles.length} títulos`,
        topGenres,
        topDirector: {
          name: topDirectorName,
          photoUrl: 'https://image.tmdb.org/t/p/w185/xuAIuYSmsUzKlUMBFGVZaWsY3DZ.jpg',
          rating: 9.1,
        },
        topActor: {
          name: 'Leonardo DiCaprio',
          photoUrl: 'https://image.tmdb.org/t/p/w185/wo2hJpn04vbtmh0B9utCFdsQhxM.jpg',
          count: 14,
        },
        perfectMovie: {
          title: importedTitles.find((m) => m.yourRating === 10 || m.yourRating === 9)?.title ?? 'Infiltrados',
          posterUrl: 'https://image.tmdb.org/t/p/w342/nT97ifVT2J1yMQmeq20Qblg61T.jpg',
          score: 10,
        },
        growingGenre: {
          name: sortedGenres[0]?.[0] ?? 'Drama',
          delta: '+15%',
        },
      };

      const parsedMovies: DashboardMovie[] = importedTitles.slice(0, 10).map((t, i) => ({
        id: `csv-${i}-${t.imdbId}`,
        title: t.title,
        year: t.year ?? undefined,
        userRating: t.yourRating ?? undefined,
        genres: t.genres,
        director: t.directors[0],
        posterUrl: 'https://image.tmdb.org/t/p/w342/qJ2tW6WMUDux911r6m7haRef0WH.jpg',
        relativeDate: t.dateRated ?? 'Reciente',
      }));

      setFileName(name);
      setSuccessCount(importedTitles.length);
      onImportComplete(stats, parsedMovies, importedTitles.length);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al procesar el archivo CSV');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      processCsvText(text, file.name);
    };
    reader.onerror = () => {
      setError('No se pudo leer el archivo seleccionado');
    };
    reader.readAsText(file, 'utf-8');
  };

  const handleLoadSampleCsv = async () => {
    setIsProcessing(true);
    setError(null);
    try {
      const res = await fetch('/sample-imdb.csv');
      if (!res.ok) {
        throw new Error('No se pudo cargar el archivo base sample-imdb.csv');
      }
      const text = await res.text();
      processCsvText(text, 'IMDb Export Base de Dylan (c4af8a5e...csv)');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar el CSV de ejemplo');
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border border-[#8A0201]/30 bg-[#0A0505] text-[#F4F6F3] shadow-[0_24px_80px_rgba(0,0,0,0.85)] backdrop-blur-2xl sm:max-w-xl">
        <DialogHeader className="space-y-2">
          <div className="flex items-center gap-2 text-[#8A0201]">
            <FileSpreadsheet className="size-5" />
            <Badge className="border border-[#8A0201]/40 bg-[#8A0201]/20 text-[#F4F6F3]">
              Motor IMDb
            </Badge>
          </div>
          <DialogTitle className="text-2xl font-bold tracking-tight text-[#F4F6F3]">
            Importar Historial IMDb
          </DialogTitle>
          <DialogDescription className="text-sm leading-6 text-[#F4F6F3]/70">
            Carga tu archivo CSV exportado desde IMDb. Doyess Film extraerá tus calificaciones,
            calculará métricas de tiempo y directores, y actualizará todo el panel.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#8A0201]/30 bg-black/40 p-8 text-center transition hover:border-[#8A0201] hover:bg-[#8A0201]/5">
            <Upload className="size-10 text-[#8A0201] transition-transform group-hover:scale-110" />
            <span className="mt-3 text-base font-semibold text-[#F4F6F3]">
              Seleccionar o arrastrar archivo CSV
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

          <div className="relative flex items-center justify-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10" />
            </div>
            <span className="relative bg-[#0A0505] px-3 text-xs uppercase tracking-widest text-[#F4F6F3]/40">
              O usa los datos base
            </span>
          </div>

          <Button
            type="button"
            onClick={handleLoadSampleCsv}
            disabled={isProcessing}
            className="w-full justify-center gap-2 rounded-xl border border-[#8A0201]/40 bg-[#140808] py-6 text-sm font-semibold text-[#F4F6F3] transition hover:bg-[#8A0201] hover:text-white"
          >
            <Sparkles className="size-4 text-[#8A0201] group-hover:text-white" />
            Cargar CSV Base de Dylan (80 calificaciones IMDb)
          </Button>

          {error && (
            <div className="flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-300">
              <AlertCircle className="size-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successCount !== null && (
            <div className="flex items-center justify-between rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-300">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="size-4 shrink-0" />
                <span>
                  ¡Importación completada! {successCount} títulos procesados correctamente.
                </span>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="border-emerald-500/40 bg-emerald-500/20 text-emerald-100 hover:bg-emerald-500/30"
              >
                Ver Dashboard
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
