'use client';

import * as React from 'react';
import { cn } from 'cn';

type MetricCol = {
  label: string;
  value: string;
  hint?: string;
  hintTone?: 'up' | 'down' | 'neutral';
};

type DashboardAuroraStatCardProps = {
  title: string;
  subtitle?: string;
  icon: React.ReactNode;
  primary: MetricCol;
  secondary?: MetricCol;
  sparkline?: number[];
  actionLabel?: string;
  onClick?: () => void;
  className?: string;
  valueClassName?: string;
};

function lineOnly(values: number[], width = 300, height = 72): string {
  if (values.length === 0) return '';
  const max = Math.max(...values, 1);
  const step = width / (values.length - 1 || 1);
  const points = values.map((v, i) => {
    const x = i * step;
    const y = height - (v / max) * (height * 0.7) - height * 0.12;
    return `${x},${y}`;
  });
  return `M${points.join(' L')}`;
}

function areaFromLine(linePath: string, width = 300, height = 72): string {
  const body = linePath.replace(/^M/, '');
  return `M0,${height} L${body} L${width},${height} Z`;
}

function hintClass(tone?: MetricCol['hintTone']) {
  if (tone === 'up') return 'text-zinc-400';
  if (tone === 'down') return 'text-red-400/90';
  return 'text-zinc-500';
}

/** KPI con mini gráfica — mismo lenguaje visual que df-kpi-compact. */
export function DashboardAuroraStatCard({
  title,
  subtitle,
  icon,
  primary,
  secondary,
  sparkline,
  onClick,
  className,
  valueClassName,
}: DashboardAuroraStatCardProps) {
  const gradId = React.useId().replace(/:/g, '');
  const showChart = Boolean(sparkline?.length);
  const strokePath = showChart ? lineOnly(sparkline!) : '';
  const areaPath = showChart && strokePath ? areaFromLine(strokePath) : '';

  const Comp = onClick ? 'button' : 'div';

  return (
    <Comp
      type={onClick ? 'button' : undefined}
      onClick={onClick}
      className={cn(
        'df-kpi-compact df-kpi-aurora group w-full text-left',
        onClick && 'cursor-pointer',
        className,
      )}
      aria-label={onClick ? `${title}: ver detalle` : undefined}
    >
      <div className="flex items-start gap-3">
        <div className="df-kpi-compact__icon shrink-0">{icon}</div>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-zinc-500">
            {title}
          </p>
          {subtitle ? <p className="mt-0.5 text-xs text-zinc-600">{subtitle}</p> : null}
        </div>
      </div>

      <div
        className={cn(
          'mt-3 grid gap-3',
          secondary ? 'grid-cols-2' : 'grid-cols-1',
        )}
      >
        <div className="min-w-0">
          <p className="text-[10px] uppercase tracking-wide text-zinc-600">{primary.label}</p>
          <p className={cn('text-xl font-bold tabular-nums text-[#F4F6F3] sm:text-2xl', valueClassName)}>
            {primary.value}
          </p>
          {primary.hint ? (
            <p className={cn('mt-0.5 text-xs', hintClass(primary.hintTone))}>{primary.hint}</p>
          ) : null}
        </div>
        {secondary ? (
          <div className="min-w-0 border-l border-white/[0.06] pl-3">
            <p className="text-[10px] uppercase tracking-wide text-zinc-600">{secondary.label}</p>
            <p className="text-lg font-semibold tabular-nums text-[#F4F6F3]">{secondary.value}</p>
            {secondary.hint ? (
              <p className={cn('mt-0.5 text-xs', hintClass(secondary.hintTone))}>{secondary.hint}</p>
            ) : null}
          </div>
        ) : null}
      </div>

      {showChart && strokePath && areaPath ? (
        <div className="relative mt-3 h-14 w-full sm:h-16" aria-hidden>
          <svg className="h-full w-full" viewBox="0 0 300 72" preserveAspectRatio="none">
            <defs>
              <linearGradient id={gradId} x1={0} y1={0} x2={0} y2={1}>
                <stop offset="0%" stopColor="#8A0201" stopOpacity={0.22} />
                <stop offset="100%" stopColor="#8A0201" stopOpacity={0} />
              </linearGradient>
            </defs>
            <path d={strokePath} fill="none" stroke="#8A0201" strokeWidth={1.75} />
            <path d={areaPath} fill={`url(#${gradId})`} />
          </svg>
        </div>
      ) : null}

      {onClick ? (
        <p className="mt-3 text-[11px] font-medium text-[#8A0201]/80 group-hover:text-[#8A0201]">
          Ver detalle →
        </p>
      ) : null}
    </Comp>
  );
}
