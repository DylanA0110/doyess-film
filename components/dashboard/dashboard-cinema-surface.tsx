import * as React from 'react';
import { cn } from 'cn';

type DashboardCinemaSurfaceProps = {
  children: React.ReactNode;
  className?: string;
  innerClassName?: string;
  as?: 'div' | 'button' | 'article';
  onClick?: React.MouseEventHandler<HTMLElement>;
  type?: 'button';
  'aria-label'?: string;
};

export function DashboardCinemaSurface({
  children,
  className,
  innerClassName,
  as = 'div',
  onClick,
  type,
  'aria-label': ariaLabel,
}: DashboardCinemaSurfaceProps) {
  const Comp = as;
  return (
    <Comp
      type={as === 'button' ? type ?? 'button' : undefined}
      onClick={onClick}
      aria-label={ariaLabel}
      className={cn('df-sunset-card df-cinema-frame', className)}
    >
      <div className={cn('df-sunset-card__glass df-cinema-glass', innerClassName)}>
        {children}
      </div>
    </Comp>
  );
}
