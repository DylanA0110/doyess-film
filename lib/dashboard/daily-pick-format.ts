const MONTHS_ES = [
  'ENE',
  'FEB',
  'MAR',
  'ABR',
  'MAY',
  'JUN',
  'JUL',
  'AGO',
  'SEP',
  'OCT',
  'NOV',
  'DIC',
] as const;

export type StoredDailyPick = {
  tmdb_id: number;
  imdb_id: string | null;
  title: string;
  release_year: number | null;
  poster_path: string | null;
  overview: string | null;
  reason: string;
  vote_average?: number | null;
};

export function dailyPickDateKey(now: Date): string {
  return now.toLocaleDateString('en-CA', { timeZone: 'America/Mexico_City' });
}

export function dailyPickDayLabel(now: Date) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Mexico_City',
    month: 'numeric',
    day: 'numeric',
  }).formatToParts(now);
  const monthNum = Number(parts.find((p) => p.type === 'month')?.value ?? '1');
  const day = parts.find((p) => p.type === 'day')?.value ?? '1';
  const monthIndex = Math.min(12, Math.max(1, monthNum)) - 1;
  return {
    month: MONTHS_ES[monthIndex] ?? 'HOY',
    day,
  };
}

export function truncateSynopsis(text: string, max: number): string {
  const t = text.replace(/\s+/g, ' ').trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max - 1).trimEnd()}…`;
}
