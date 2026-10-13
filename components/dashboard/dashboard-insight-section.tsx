'use client';

type DashboardInsightSectionProps<T> = {
  title: string;
  subtitle?: string;
  items: T[];
  limit: number;
  emptyMessage?: string;
  gridClassName?: string;
  renderItem: (item: T) => React.ReactNode;
};

export function DashboardInsightSection<T>({
  title,
  subtitle,
  items,
  limit,
  emptyMessage = 'Sin datos todavía.',
  gridClassName = 'grid gap-4 sm:grid-cols-2 lg:grid-cols-3',
  renderItem,
}: DashboardInsightSectionProps<T>) {
  const shown = items.slice(0, limit);

  return (
    <section>
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-base font-semibold text-[#F4F6F3]">{title}</h2>
          {subtitle ? <p className="mt-1 text-sm text-zinc-400">{subtitle}</p> : null}
        </div>
        {items.length > limit ? (
          <p className="text-xs text-zinc-500">
            Top {limit} de {items.length}
          </p>
        ) : null}
      </div>

      {items.length === 0 ? (
        <p className="mt-4 text-sm text-zinc-500">{emptyMessage}</p>
      ) : (
        <div className={`mt-4 ${gridClassName}`}>{shown.map(renderItem)}</div>
      )}
    </section>
  );
}
