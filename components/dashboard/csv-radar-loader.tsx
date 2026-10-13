'use client';

import * as React from 'react';
import styles from './csv-radar-loader.module.css';

const ROTATING_HINTS = [
  'Cargando tu película favorita…',
  'Analizando patrones en tus gustos…',
  'Descifrando géneros dominantes…',
  'Sincronizando pósters con TMDB…',
  'Preparando tu perfil cinéfilo…',
  'Contando horas de pantalla…',
];

type CsvRadarLoaderProps = {
  /** Mensaje principal (fase real del import). */
  phase?: string;
  progress?: number;
};

export function CsvRadarLoader({ phase = 'Procesando tu CSV…', progress }: CsvRadarLoaderProps) {
  const [hintIndex, setHintIndex] = React.useState(0);

  React.useEffect(() => {
    const id = window.setInterval(() => {
      setHintIndex((i) => (i + 1) % ROTATING_HINTS.length);
    }, 2800);
    return () => window.clearInterval(id);
  }, []);

  const clamped =
    progress != null ? Math.min(100, Math.max(0, progress)) : undefined;

  return (
    <div className={styles.wrapper} role="status" aria-live="polite" aria-busy="true">
      <div className={styles.loader} aria-hidden="true">
        <span className={styles.sweep} />
        <div className={`${styles.dot} ${styles.dot1}`} />
        <div className={`${styles.dot} ${styles.dot2}`} />
        <div className={`${styles.dot} ${styles.dot3}`} />
        <div className={`${styles.dot} ${styles.dot4}`} />
        <div className={`${styles.dot} ${styles.dot5}`} />
      </div>
      <div className={styles.textBlock}>
        <p className={styles.primary}>{phase}</p>
        <p className={styles.secondary}>{ROTATING_HINTS[hintIndex]}</p>
        {clamped != null ? (
          <div className={styles.progressTrack} aria-hidden="true">
            <div className={styles.progressFill} style={{ width: `${clamped}%` }} />
          </div>
        ) : null}
      </div>
    </div>
  );
}
