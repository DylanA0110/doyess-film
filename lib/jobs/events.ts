import { inngest } from '@/lib/inngest/client';
import { runBackgroundJob } from '@/lib/jobs/run-background-job';

export type RatingAddedEvent = {
  name: 'rating.added';
  data: {
    userId: string;
    movieId: string;
    imdbId: string;
  };
};

export type CsvImportCompletedEvent = {
  name: 'csv.import.completed';
  data: {
    userId: string;
    imported: number;
  };
};

export type DoyessJobEvent = RatingAddedEvent | CsvImportCompletedEvent;

function inngestEventName(event: DoyessJobEvent): string {
  return event.name === 'rating.added' ? 'doyess/rating.added' : 'doyess/csv.import.completed';
}

function useInngestCloud(): boolean {
  return Boolean(
    process.env.INNGEST_EVENT_KEY?.trim() || process.env.INNGEST_SIGNING_KEY?.trim(),
  );
}

export async function emitJobEvent(event: DoyessJobEvent): Promise<void> {
  if (useInngestCloud()) {
    await inngest.send({
      name: inngestEventName(event),
      data: event.data,
    });
    return;
  }

  const { after } = await import('next/server');
  after(async () => {
    try {
      await runBackgroundJob(event);
    } catch (err) {
      console.error('[jobs] background rebuild failed', err);
    }
  });
}
