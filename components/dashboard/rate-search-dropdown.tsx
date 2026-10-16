'use client';

import * as React from 'react';
import Image from 'next/image';
import { useMediaSearch } from '@/hooks/use-media-search';
import { getTmdbPosterUrl } from '@/lib/tmdb/images';
import { useRateFlowStore } from '@/stores/rate-flow-store';

function useDebouncedValue(value: string, delayMs: number) {
  const [debounced, setDebounced] = React.useState(value);
  React.useEffect(() => {
    const t = window.setTimeout(() => setDebounced(value), delayMs);
    return () => window.clearTimeout(t);
  }, [value, delayMs]);
  return debounced;
}

type RateSearchDropdownProps = {
  query: string;
  open: boolean;
  onSelect: () => void;
};

export function RateSearchDropdown({ query, open, onSelect }: RateSearchDropdownProps) {
  const debounced = useDebouncedValue(query, 280);
  const { data: results = [], isFetching } = useMediaSearch(debounced);
  const selectTitle = useRateFlowStore((s) => s.selectTitle);

  if (!open || debounced.trim().length < 2) return null;

  return (
    <div
      className="absolute left-0 right-0 top-[calc(100%+0.35rem)] z-50 max-h-[min(50vh,18rem)] overflow-y-auto overscroll-contain rounded-xl border border-white/10 bg-[#101009] py-1 shadow-2xl"
      role="listbox"
      aria-label="Resultados de búsqueda"
    >
      {isFetching ? (
        <p className="px-4 py-5 text-center text-xs text-zinc-500">Buscando…</p>
      ) : results.length === 0 ? (
        <p className="px-4 py-5 text-center text-xs text-zinc-500">Sin resultados.</p>
      ) : (
        <ul className="space-y-0.5 p-1">
          {results.map((hit) => {
            const poster = hit.posterPath ? getTmdbPosterUrl(hit.posterPath, 'w342') : null;
            return (
              <li key={`${hit.mediaType}-${hit.tmdbId}`}>
                <button
                  type="button"
                  role="option"
                  className="flex w-full gap-3 rounded-lg px-2 py-2 text-left transition hover:bg-white/[0.06]"
                  onClick={() => {
                    selectTitle({
                      tmdbId: hit.tmdbId,
                      mediaType: hit.mediaType,
                      title: hit.title,
                      posterPath: hit.posterPath,
                      year: hit.year,
                    });
                    onSelect();
                  }}
                >
                  <div className="relative h-12 w-9 shrink-0 overflow-hidden rounded bg-zinc-900">
                    {poster ? (
                      <Image src={poster} alt="" fill sizes="36px" className="object-cover" />
                    ) : null}
                  </div>
                  <div className="min-w-0 flex-1 py-0.5">
                    <p className="truncate text-sm font-medium text-[#F4F6F3]">{hit.title}</p>
                    <p className="text-xs text-zinc-500">
                      {hit.year ?? '—'} · {hit.mediaType === 'tv' ? 'Serie' : 'Película'}
                    </p>
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
