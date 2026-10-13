import Papa from 'papaparse';
import type { ImdbExportRow, ImportedTitle } from './types';

function splitList(value?: string | null) {
  if (!value) return [];
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function parseNumber(value?: string | null) {
  if (!value) return null;
  const trimmed = value.trim();

  if (!trimmed) {
    return null;
  }

  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : null;
}

function normalizeDate(value?: string | null) {
  if (!value) return null;
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

export function parseImdbExport(csvContent: string): ImportedTitle[] {
  const parsed = Papa.parse<ImdbExportRow>(csvContent, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (header) => header.trim(),
  });

  if (parsed.errors.length > 0 && parsed.data.length === 0) {
    const firstError = parsed.errors[0];
    throw new Error(firstError.message);
  }

  return parsed.data
    .filter((row) => Boolean(row?.Const?.trim()))
    .map((row) => ({
      imdbId: row.Const.trim(),
      yourRating: parseNumber(row['Your Rating']),
      dateRated: normalizeDate(row['Date Rated']),
      title: row.Title?.trim() ?? '',
      originalTitle: row['Original Title']?.trim() ?? row.Title?.trim() ?? '',
      url: row.URL?.trim() ?? '',
      titleType: row['Title Type']?.trim() ?? 'Película',
      imdbRating: parseNumber(row['IMDb Rating']),
      runtimeMinutes: parseNumber(row['Runtime (mins)']),
      year: parseNumber(row.Year),
      genres: splitList(row.Genres),
      numVotes: parseNumber(row['Num Votes']),
      releaseDate: normalizeDate(row['Release Date']),
      directors: splitList(row.Directors),
    }));
}
