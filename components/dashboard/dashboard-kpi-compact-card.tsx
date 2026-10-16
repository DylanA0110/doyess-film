'use client';

import type { ReactNode } from 'react';
import { cn } from 'cn';

type DashboardKpiCompactCardProps = {
  eyebrow: string;
  value: string;
  hint?: string;
  icon: ReactNode;
  onClick?: () => void;
  className?: string;
};

/** KPI editorial Doyess — sin gráfica (solo la nota media lleva aurora). */
export function DashboardKpiCompactCard({
  eyebrow,
  value,
  hint,
  icon,
  onClick,
  className,
}: DashboardKpiCompactCardProps) {
  const Comp = onClick ? 'button' : 'div';

  return (
    <Comp
      type={onClick ? 'button' : undefined}
      onClick={onClick}
      className={cn(
        'df-kpi-compact group w-full text-left',
        onClick && 'cursor-pointer',
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="df-kpi-compact__icon">{icon}</div>
      </div>
      <p className="mt-3 text-[11px] font-medium uppercase tracking-[0.12em] text-zinc-500">
        {eyebrow}
      </p>
      <p className="mt-1 truncate text-xl font-bold tracking-tight text-[#F4F6F3] sm:text-2xl">{value}</p>
      {hint ? <p className="mt-1.5 text-xs text-zinc-400">{hint}</p> : null}
    </Comp>
  );
}
