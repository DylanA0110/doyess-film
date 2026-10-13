'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import {
  PENDING_ENRICH_SESSION_KEY,
  runTmdbEnrichPending,
} from '@/lib/imdb/run-tmdb-enrich-batches';

const SILENT_ATTEMPTED_KEY = 'doyess-film-silent-enrich-attempted';

export function useSilentTmdbEnrich(pendingEnrichmentCount: number) {
  const router = useRouter();
  const started = React.useRef(false);

  React.useEffect(() => {
    if (started.current) return;
    if (pendingEnrichmentCount <= 0) return;
    if (typeof window === 'undefined') return;
    if (sessionStorage.getItem(SILENT_ATTEMPTED_KEY)) return;
    if (!sessionStorage.getItem(PENDING_ENRICH_SESSION_KEY)) return;

    started.current = true;
    sessionStorage.setItem(SILENT_ATTEMPTED_KEY, '1');
    sessionStorage.removeItem(PENDING_ENRICH_SESSION_KEY);

    void runTmdbEnrichPending()
      .then(() => router.refresh())
      .catch(() => {
        /* sin banner; el usuario puede reintentar al importar */
      });
  }, [pendingEnrichmentCount, router]);
}
