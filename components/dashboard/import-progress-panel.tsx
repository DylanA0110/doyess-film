'use client';

import { CsvRadarLoader } from '@/components/dashboard/csv-radar-loader';

type ImportProgressPanelProps = {
  phase: string;
  progress?: number;
  detail?: string;
};

export function ImportProgressPanel({ phase, progress = 0, detail }: ImportProgressPanelProps) {
  return (
    <div className="py-2">
      <CsvRadarLoader phase={phase} progress={progress} />
      {detail ? (
        <p className="mt-3 text-center text-xs leading-relaxed text-zinc-500">{detail}</p>
      ) : null}
    </div>
  );
}
