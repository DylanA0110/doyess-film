'use client';

import styles from './csv-import-loader.module.css';

type CsvImportLoaderProps = {
  title?: string;
  description?: string;
};

export function CsvImportLoader({
  title = 'Procesando CSV',
  description = 'Leyendo columnas, validando títulos y preparando tu biblioteca.',
}: CsvImportLoaderProps) {
  return (
    <div className={styles.wrapper} aria-label="Loader de importación CSV">
      <svg height="128px" width="128px" viewBox="0 0 128 128" className={styles.pl1}>
        <defs>
          <linearGradient y2={1} x2={1} y1={0} x1={0} id="pl-grad-csv">
            <stop stopColor="#000" offset="0%" />
            <stop stopColor="#fff" offset="100%" />
          </linearGradient>
          <mask id="pl-mask-csv">
            <rect fill="url(#pl-grad-csv)" height={128} width={128} y={0} x={0} />
          </mask>
        </defs>
        <g fill="#8A0201">
          <g className={styles.pl1__g}>
            <g transform="translate(20,20) rotate(0,44,44)">
              <g>
                <rect height={40} width={40} ry={8} rx={8} className={styles.pl1__rect} />
                <rect
                  transform="translate(0,48)"
                  height={40}
                  width={40}
                  ry={8}
                  rx={8}
                  className={styles.pl1__rect}
                />
              </g>
              <g transform="rotate(180,44,44)">
                <rect height={40} width={40} ry={8} rx={8} className={styles.pl1__rect} />
                <rect
                  transform="translate(0,48)"
                  height={40}
                  width={40}
                  ry={8}
                  rx={8}
                  className={styles.pl1__rect}
                />
              </g>
            </g>
          </g>
        </g>
        <g mask="url(#pl-mask-csv)" fill="#F4F6F3">
          <g className={styles.pl1__g}>
            <g transform="translate(20,20) rotate(0,44,44)">
              <g>
                <rect height={40} width={40} ry={8} rx={8} className={styles.pl1__rect} />
                <rect
                  transform="translate(0,48)"
                  height={40}
                  width={40}
                  ry={8}
                  rx={8}
                  className={styles.pl1__rect}
                />
              </g>
              <g transform="rotate(180,44,44)">
                <rect height={40} width={40} ry={8} rx={8} className={styles.pl1__rect} />
                <rect
                  transform="translate(0,48)"
                  height={40}
                  width={40}
                  ry={8}
                  rx={8}
                  className={styles.pl1__rect}
                />
              </g>
            </g>
          </g>
        </g>
      </svg>
      <div className="text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[#F4F6F3]/60">
          {title}
        </p>
        <p className="mt-2 text-sm leading-6 text-[#F4F6F3]/68">{description}</p>
      </div>
    </div>
  );
}
