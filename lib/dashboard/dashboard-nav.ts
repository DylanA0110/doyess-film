import type { LucideIcon } from 'lucide-react';
import { LayoutDashboard, Sparkles, Compass, BookOpen } from 'lucide-react';

export type DashboardNavItem = {
  id: string;
  label: string;
  shortLabel: string;
  icon: LucideIcon;
};

/** Pestañas con vista implementada en dashboard-view. */
export const DASHBOARD_NAV_ITEMS: DashboardNavItem[] = [
  { id: 'resumen', label: 'Resumen', shortLabel: 'Resumen', icon: LayoutDashboard },
  { id: 'para-vos', label: 'Para vos', shortLabel: 'Para vos', icon: Sparkles },
  { id: 'explorar', label: 'Explorar', shortLabel: 'Explorar', icon: Compass },
];

/** Añadir al menú cuando exista la vista. */
export const DASHBOARD_NAV_BIBLIOTECA: DashboardNavItem = {
  id: 'biblioteca',
  label: 'Mi biblioteca',
  shortLabel: 'Biblioteca',
  icon: BookOpen,
};

export function dashboardNavItems(includeBiblioteca: boolean): DashboardNavItem[] {
  if (!includeBiblioteca) return DASHBOARD_NAV_ITEMS;
  return [...DASHBOARD_NAV_ITEMS, DASHBOARD_NAV_BIBLIOTECA];
}
