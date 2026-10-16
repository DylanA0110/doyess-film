'use client';

import * as React from 'react';
import type { DashboardMovie } from '@/components/dashboard/types';

export type CatalogKindFilter = 'all' | 'movie' | 'series';

export type CatalogSort = 'rating-desc' | 'year-desc' | 'title-asc' | 'recent';

type UseCatalogFiltersOptions = {
  movies: DashboardMovie[];
};

export function useCatalogFilters({ movies }: UseCatalogFiltersOptions) {
  const [query, setQuery] = React.useState('');
  const [kind, setKind] = React.useState<CatalogKindFilter>('all');
  const [genre, setGenre] = React.useState<string | null>(null);
  const [sort, setSort] = React.useState<CatalogSort>('rating-desc');

  const genres = React.useMemo(() => {
    const set = new Set<string>();
    for (const m of movies) {
      for (const g of m.genres) {
        if (g && g !== 'Otros') set.add(g);
      }
    }
    return [...set].sort((a, b) => a.localeCompare(b, 'es'));
  }, [movies]);

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = movies.filter((m) => m.titleKind !== 'episode');

    if (kind === 'movie') {
      list = list.filter((m) => m.titleKind === 'movie' || !m.titleKind);
    } else if (kind === 'series') {
      list = list.filter((m) => m.titleKind === 'series');
    }

    if (genre) {
      list = list.filter((m) => m.genres.includes(genre));
    }

    if (q) {
      list = list.filter(
        (m) =>
          m.title.toLowerCase().includes(q) ||
          (m.director?.toLowerCase().includes(q) ?? false),
      );
    }

    const sorted = [...list];
    sorted.sort((a, b) => {
      switch (sort) {
        case 'year-desc':
          return (b.year ?? 0) - (a.year ?? 0);
        case 'title-asc':
          return a.title.localeCompare(b.title, 'es');
        case 'recent':
          return (b.relativeDate ?? '').localeCompare(a.relativeDate ?? '');
        case 'rating-desc':
        default:
          return (b.userRating ?? 0) - (a.userRating ?? 0);
      }
    });

    return sorted;
  }, [movies, query, kind, genre, sort]);

  return {
    query,
    setQuery,
    kind,
    setKind,
    genre,
    setGenre,
    sort,
    setSort,
    genres,
    filtered,
  };
}
