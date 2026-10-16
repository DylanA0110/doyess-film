import type { CinephileStatsRow } from '@/lib/imdb/build-dashboard-stats';
import { titleKindFromImdbType } from '@/lib/imdb/title-kind';
import type { MediaRef } from '@/lib/recommendation/media-candidate';
import { mediaRef } from '@/lib/recommendation/media-candidate';

export function buildSeenMediaSet(rows: CinephileStatsRow[]): Set<MediaRef> {
  const seen = new Set<MediaRef>();

  for (const row of rows) {
    if (titleKindFromImdbType(row.title_type) === 'episode') continue;

    if (row.tmdb_id != null) {
      const type =
        row.tmdb_media_type === 'tv' ? 'tv' : ('movie' as const);
      seen.add(mediaRef(type, row.tmdb_id));
      continue;
    }

  }

  return seen;
}
