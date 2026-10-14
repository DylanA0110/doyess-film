'use client';

import * as React from 'react';
import type { DailyPickResult } from '@/components/dashboard/types';
import { DailyPickHeroCard } from '@/components/dashboard/daily-pick-hero-card';
import { DailyPickDoodleButton } from '@/components/dashboard/para-vos/daily-pick-doodle-button';
import { DailyPickSpinReveal } from '@/components/dashboard/para-vos/daily-pick-spin-reveal';
type Phase = 'cta' | 'loading' | 'ritual' | 'shown';

function ritualStorageKey(userId: string, dateKey: string) {
  return `doyess-daily-ritual:${userId}:${dateKey}`;
}

type DailyPickRevealStageProps = {
  userId: string;
  initialPick: DailyPickResult | null;
  /** Clave del día (America/Mexico_City); debe venir del servidor para evitar new Date() en el cliente. */
  ritualDateKey: string;
};

export function DailyPickRevealStage({
  userId,
  initialPick,
  ritualDateKey,
}: DailyPickRevealStageProps) {
  const dateKey = ritualDateKey;
  const [pick, setPick] = React.useState<DailyPickResult | null>(initialPick);
  const [phase, setPhase] = React.useState<Phase>('cta');

  React.useEffect(() => {
    setPick(initialPick);
  }, [initialPick]);

  React.useLayoutEffect(() => {
    try {
      const key = ritualStorageKey(userId, dateKey);
      const done = localStorage.getItem(key) === '1';
      const hasPick = Boolean(initialPick ?? pick);
      if (done && hasPick) {
        setPhase('shown');
      } else if (done && !hasPick) {
        localStorage.removeItem(key);
        setPhase('cta');
      }
    } catch {
      /* ignore */
    }
  }, [userId, dateKey, initialPick, pick]);

  const finishRitual = React.useCallback(() => {
    try {
      localStorage.setItem(ritualStorageKey(userId, dateKey), '1');
    } catch {
      /* ignore */
    }
    setPhase('shown');
  }, [userId, dateKey]);

  const runRitual = React.useCallback(() => {
    if (!pick) return;
    setPhase('ritual');
  }, [pick]);

  const handleGenerate = async () => {
    if (phase === 'loading' || phase === 'ritual') return;

    if (pick) {
      runRitual();
      return;
    }

    setPhase('loading');
    try {
      const res = await fetch('/api/daily-pick', { method: 'POST' });
      if (!res.ok) throw new Error('pick failed');
      const data = (await res.json()) as { pick: DailyPickResult | null };
      if (!data.pick) {
        setPhase('cta');
        return;
      }
      setPick(data.pick);
      setPhase('ritual');
    } catch {
      setPhase('cta');
    }
  };

  if (phase === 'shown' && pick) {
    return (
      <section
        className="para-vos-daily-hero para-vos-daily-hero--has-pick"
        aria-label="Película del día"
      >
        <DailyPickHeroCard pick={pick} userId={userId} centered immediateEnter />
      </section>
    );
  }

  return (
    <section className="para-vos-daily-hero relative" aria-label="Revelar película del día">
      <div className="doodle-hero-stack">
        <DailyPickDoodleButton
          onClick={handleGenerate}
          loading={phase === 'loading'}
          disabled={phase === 'loading' || phase === 'ritual'}
        />
        <p className="doodle-hero-copy">
          Una sugerencia nueva cada día, fuera de tu historial IMDb.
        </p>
        {phase === 'loading' ? (
          <p className="doodle-hero-loading" aria-live="polite">
            Preparando tu pick…
          </p>
        ) : null}
      </div>

      {phase === 'ritual' && pick ? (
        <DailyPickSpinReveal pick={pick} userId={userId} onComplete={finishRitual} />
      ) : null}
    </section>
  );
}
