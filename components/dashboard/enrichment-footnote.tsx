'use client';

type EnrichmentFootnoteProps = {
  pendingEnrichmentCount: number;
  withoutPosterCount: number;
};

export function EnrichmentFootnote({
  pendingEnrichmentCount,
  withoutPosterCount,
}: EnrichmentFootnoteProps) {
  if (pendingEnrichmentCount > 0) {
    return (
      <p className="text-xs text-zinc-500" role="status">
        Completando pósters TMDB en segundo plano ({pendingEnrichmentCount} pendientes)…
      </p>
    );
  }

  if (withoutPosterCount <= 0) return null;

  return (
    <p className="text-xs text-zinc-500">
      {withoutPosterCount} título{withoutPosterCount === 1 ? '' : 's'} sin póster TMDB (capítulos o
      sin ficha en catálogo). Es normal en historiales IMDb.
    </p>
  );
}
