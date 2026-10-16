'use client';

import { create } from 'zustand';
import type { TmdbMediaType } from '@/lib/tmdb/find-by-imdb';

export type RateFlowSelection = {
  tmdbId: number;
  mediaType: TmdbMediaType;
  title: string;
  posterPath: string | null;
  year?: number;
};

type RateFlowState = {
  searchQuery: string;
  selected: RateFlowSelection | null;
  /** Incrementa para enfocar el buscador desde el sidebar. */
  focusSearchNonce: number;
  requestSearchFocus: () => void;
  setSearchQuery: (query: string) => void;
  selectTitle: (item: RateFlowSelection) => void;
  clearSelection: () => void;
  reset: () => void;
};

export const useRateFlowStore = create<RateFlowState>((set) => ({
  searchQuery: '',
  selected: null,
  focusSearchNonce: 0,
  requestSearchFocus: () =>
    set((s) => ({ focusSearchNonce: s.focusSearchNonce + 1, selected: null })),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  selectTitle: (selected) => set({ selected }),
  clearSelection: () => set({ selected: null }),
  reset: () =>
    set({
      searchQuery: '',
      selected: null,
    }),
}));
