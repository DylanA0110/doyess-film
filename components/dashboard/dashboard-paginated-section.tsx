'use client';

import * as React from 'react';

const PAGE_SIZE = 10;

type DashboardPaginatedSectionProps<T> = {
  title: string;
  subtitle?: string;
  items: T[];
  emptyMessage?: string;
  renderItem: (item: T) => React.ReactNode;
  gridClassName?: string;
  headerAction?: React.ReactNode;
  /** Si se define, solo muestra N ítems (p. ej. vista previa en resumen). */
  previewCount?: number;
};

export function DashboardPaginatedSection<T>({
  title,
  subtitle,
  items,
  emptyMessage = 'Sin datos todavía.',
  renderItem,
  gridClassName = 'grid gap-4 sm:grid-cols-2 lg:grid-cols-3',
  headerAction,
  previewCount,
}: DashboardPaginatedSectionProps<T>) {
  const [visible, setVisible] = React.useState(PAGE_SIZE);
  const shown = items.slice(0, previewCount != null ? previewCount : visible);
  const hasMore = previewCount == null && visible < items.length;

  return (
    <section>
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-base font-semibold text-[#F4F6F3]">{title}</h2>
          {subtitle ? <p className="mt-1 text-sm text-zinc-400">{subtitle}</p> : null}
        </div>
        <div className="flex items-center gap-3">
          {items.length > 0 ? (
            <p className="text-xs text-zinc-500">{items.length} en total</p>
          ) : null}
          {headerAction}
        </div>
      </div>

      {items.length === 0 ? (
        <p className="mt-4 text-sm text-zinc-500">{emptyMessage}</p>
      ) : (
        <>
          <div className={`mt-4 ${gridClassName}`}>{shown.map(renderItem)}</div>
          {hasMore ? (
            <button
              type="button"
              onClick={() => setVisible((v) => v + PAGE_SIZE)}
              className="mt-4 text-sm font-medium text-[#8A0201] hover:underline"
            >
              Ver más ({items.length - visible} restantes)
            </button>
          ) : null}
        </>
      )}
    </section>
  );
}
