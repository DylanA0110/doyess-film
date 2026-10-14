'use client';

import * as React from 'react';
import { fireDoyessConfetti } from '@/lib/ui/fire-doyess-confetti';

type ConfettiBurstProps = {
  active: boolean;
  onDone?: () => void;
};

/** Wrapper por si hace falta disparar confetti desde un flag `active`. */
export function ConfettiBurst({ active, onDone }: ConfettiBurstProps) {
  const firedRef = React.useRef(false);

  React.useEffect(() => {
    if (!active) {
      firedRef.current = false;
      return;
    }
    if (firedRef.current) return;
    firedRef.current = true;
    void fireDoyessConfetti();
    const t = window.setTimeout(() => onDone?.(), 1600);
    return () => window.clearTimeout(t);
  }, [active, onDone]);

  return null;
}
