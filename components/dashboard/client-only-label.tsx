'use client';

import * as React from 'react';

/** Evita hydration mismatch en fechas formateadas en el servidor vs cliente. */
export function ClientOnlyLabel({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);
  if (!mounted) return null;
  return <>{children}</>;
}
