'use client';

import * as React from 'react';
import Image from 'next/image';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import type { DailyPickResult } from '@/components/dashboard/types';
import { DailyPickHeroCard } from '@/components/dashboard/daily-pick-hero-card';
import { fireDoyessConfetti } from '@/lib/ui/fire-doyess-confetti';

type Step = 'spin' | 'reveal';

type DailyPickSpinRevealProps = {
  pick: DailyPickResult;
  userId: string;
  onComplete: () => void;
};

/**
 * Efecto tipo TCG: carta girando en Y hasta el “pam” + confetti y carta 3D final.
 * (Inspirado en revelaciones de carta coleccionable; no usa assets de Pokémon.)
 */
export function DailyPickSpinReveal({ pick, userId, onComplete }: DailyPickSpinRevealProps) {
  const reduceMotion = useReducedMotion();
  const [step, setStep] = React.useState<Step>('spin');
  const [flash, setFlash] = React.useState(false);
  const completedRef = React.useRef(false);

  const safeComplete = React.useCallback(() => {
    if (completedRef.current) return;
    completedRef.current = true;
    onComplete();
  }, [onComplete]);

  React.useEffect(() => {
    if (reduceMotion) {
      setStep('reveal');
      const t = window.setTimeout(safeComplete, 400);
      return () => window.clearTimeout(t);
    }

    const confettiAt = window.setTimeout(() => {
      setFlash(true);
      void fireDoyessConfetti();
      window.setTimeout(() => setFlash(false), 220);
      setStep('reveal');
    }, 1050);

    const doneAt = window.setTimeout(safeComplete, 2400);

    return () => {
      window.clearTimeout(confettiAt);
      window.clearTimeout(doneAt);
    };
  }, [reduceMotion, safeComplete]);

  return (
    <motion.div
      className="para-vos-ritual-overlay"
      role="presentation"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
    >
      <AnimatePresence>
        {flash ? (
          <motion.div
            key="flash"
            className="pointer-events-none absolute inset-0 z-[70] bg-[#8A0201]/35"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.85, 0] }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
          />
        ) : null}
      </AnimatePresence>

      <div className="relative z-[55] flex w-full max-w-md flex-col items-center justify-center px-4">
        <AnimatePresence mode="wait">
          {step === 'spin' ? (
            <motion.div
              key="spin"
              className="daily-pick-spin-scene"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, scale: 0.92, filter: 'blur(6px)' }}
              transition={{ duration: 0.2 }}
            >
              <motion.div
                className="daily-pick-spin-card"
                initial={{ rotateY: 0, scale: 0.35, y: 40 }}
                animate={{
                  rotateY: [0, 360, 720, 1080],
                  scale: [0.35, 0.95, 1.14, 1],
                  y: [40, -8, 0, 0],
                }}
                transition={{
                  duration: 1.05,
                  times: [0, 0.35, 0.72, 1],
                  ease: [0.22, 1, 0.36, 1],
                }}
                style={{ transformStyle: 'preserve-3d' }}
              >
                <div className="daily-pick-spin-face daily-pick-spin-face--back">
                  <Image
                    src="/doyess-logo.svg"
                    alt=""
                    width={72}
                    height={72}
                    className="opacity-95"
                    priority
                  />
                  <span className="daily-pick-spin-label">Doyess</span>
                </div>
                <div
                  className="daily-pick-spin-face daily-pick-spin-face--front"
                  aria-hidden="true"
                />
              </motion.div>
            </motion.div>
          ) : (
            <motion.div
              key="hero"
              className="daily-pick-hero-reveal w-full"
              initial={{ opacity: 0, scale: 0.88, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{
                type: 'spring',
                stiffness: 280,
                damping: 22,
                mass: 0.9,
              }}
            >
              <DailyPickHeroCard pick={pick} userId={userId} centered immediateEnter />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
