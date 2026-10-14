import type { UserRating } from '@/lib/recommendation/types';

/** Fase 3: evolución del gusto por ventanas de date_rated */
export type TemporalGenreShift = {
  genre: string;
  year: number;
  meanZ: number;
};

export function buildTemporalGenreShifts(_ratings: UserRating[]): TemporalGenreShift[] {
  return [];
}
