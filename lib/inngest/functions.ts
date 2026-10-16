import { inngest } from '@/lib/inngest/client';
import { runBackgroundJob } from '@/lib/jobs/run-background-job';
import type { DoyessJobEvent } from '@/lib/jobs/events';

export const rebuildTasteProfileJob = inngest.createFunction(
  {
    id: 'rebuild-taste-profile',
    debounce: {
      key: 'event.data.userId',
      period: '30s',
    },
    triggers: [{ event: 'doyess/rating.added' }, { event: 'doyess/csv.import.completed' }],
  },
  async ({ event }) => {
    const userId = String(event.data.userId ?? '');
    if (!userId) return { ok: false, reason: 'missing userId' };

    const job: DoyessJobEvent =
      event.name === 'doyess/csv.import.completed'
        ? {
            name: 'csv.import.completed',
            data: { userId, imported: Number(event.data.imported ?? 0) },
          }
        : {
            name: 'rating.added',
            data: {
              userId,
              movieId: String(event.data.movieId ?? ''),
              imdbId: String(event.data.imdbId ?? ''),
            },
          };

    await runBackgroundJob(job);
    return { ok: true };
  },
);

export const inngestFunctions = [rebuildTasteProfileJob];
