'use client';

import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { UserAvatarFill } from '@/components/dashboard/user-avatar-fill';
import { dashboardNavItems } from '@/lib/dashboard/dashboard-nav';
import {
  ChevronDown,
  Upload,
  Star,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
  X,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from 'cn';

interface SidebarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  onOpenImporter: () => void;
  onOpenRate?: () => void;
  hasData?: boolean;
  displayName: string;
  avatarUrl: string | null;
  subtitle?: string;
  collapsed?: boolean;
  onToggleCollapsed?: () => void;
  mobileOpen?: boolean;
  onMobileClose?: () => void;
  className?: string;
  includeBiblioteca?: boolean;
}

export function Sidebar({
  currentTab,
  onSelectTab,
  onOpenImporter,
  onOpenRate,
  hasData,
  displayName,
  avatarUrl,
  subtitle,
  collapsed = false,
  onToggleCollapsed,
  mobileOpen = false,
  onMobileClose,
  className,
  includeBiblioteca = false,
}: SidebarProps) {
  const navItems = dashboardNavItems(includeBiblioteca);

  const pickTab = (id: string) => {
    onSelectTab(id);
    onMobileClose?.();
  };

  const shell = (
    <aside
      className={cn(
        'relative flex min-h-screen flex-col border-r border-white/8 bg-[#0a0a09] select-none transition-[width] duration-200',
        collapsed ? 'w-[4.75rem] px-2 py-4' : 'w-[min(100%,17.5rem)] px-4 py-4 sm:w-72',
        className,
      )}
    >
      <div className="pointer-events-none absolute -bottom-16 -left-16 size-80 opacity-[0.06] blur-[1px]">
        <Image src="/doyess-logo.svg" alt="" fill className="object-cover" aria-hidden="true" />
      </div>

      <div className="z-10 flex min-h-0 flex-1 flex-col gap-6">
        <div
          className={cn(
            'flex shrink-0 gap-2',
            collapsed ? 'flex-col items-center' : 'items-center',
          )}
        >
          <div className={cn('flex w-full items-center gap-2', collapsed && 'justify-center')}>
            <Link
              href="/"
              className={cn(
                'flex min-w-0 items-center gap-2.5 group',
                collapsed ? 'justify-center' : 'flex-1',
              )}
              onClick={onMobileClose}
            >
              <div className="flex size-9 shrink-0 items-center justify-center rounded-xl transition group-hover:scale-105 sm:size-10">
                <Image src="/doyess-logo.svg" alt="Doyess Film" width={32} height={32} priority />
              </div>
              {!collapsed ? (
                <span className="truncate text-lg font-bold tracking-tight text-[#F4F6F3] sm:text-xl">
                  Doyess Film
                </span>
              ) : null}
            </Link>

            {mobileOpen && onMobileClose ? (
              <button
                type="button"
                className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-white/10 text-zinc-300 hover:bg-white/5 lg:hidden"
                aria-label="Cerrar menú"
                onClick={onMobileClose}
              >
                <X className="size-5" />
              </button>
            ) : null}

            {onToggleCollapsed && !mobileOpen && !collapsed ? (
              <button
                type="button"
                onClick={onToggleCollapsed}
                className="hidden size-8 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/[0.03] text-zinc-400 transition hover:border-white/20 hover:bg-white/[0.06] hover:text-[#F4F6F3] lg:flex"
                aria-label="Contraer menú"
                title="Solo iconos"
              >
                <PanelLeftClose className="size-3.5" />
              </button>
            ) : null}
          </div>

          {onToggleCollapsed && !mobileOpen && collapsed ? (
            <button
              type="button"
              onClick={onToggleCollapsed}
              className="hidden w-full items-center justify-center rounded-lg border border-white/10 bg-white/[0.03] py-2 text-zinc-400 transition hover:border-white/20 hover:bg-white/[0.06] hover:text-[#F4F6F3] lg:flex"
              aria-label="Expandir menú"
              title="Expandir menú"
            >
              <PanelLeftOpen className="size-4" />
            </button>
          ) : null}
        </div>

        <nav className="min-h-0 flex-1 space-y-0.5 overflow-y-auto overscroll-contain pr-0.5" aria-label="Navegación principal">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;

            return (
              <button
                key={item.id}
                type="button"
                title={item.label}
                aria-label={item.label}
                aria-current={isActive ? 'page' : undefined}
                onClick={() => pickTab(item.id)}
                className={cn(
                  'group flex w-full items-center rounded-xl text-sm font-medium transition-all',
                  collapsed ? 'justify-center px-0 py-2.5' : 'gap-3 px-3 py-2.5',
                  isActive
                    ? 'bg-[#8A0201] text-white shadow-[0_4px_16px_rgba(138,2,1,0.3)]'
                    : 'text-zinc-400 hover:bg-white/[0.06] hover:text-[#F4F6F3]',
                )}
              >
                <Icon
                  className={cn(
                    'size-[1.125rem] shrink-0 sm:size-5',
                    isActive ? 'text-white' : 'text-zinc-500 group-hover:text-[#F4F6F3]',
                  )}
                />
                {!collapsed ? (
                  <span className="min-w-0 text-left leading-snug">
                    <span className="hidden xl:inline">{item.label}</span>
                    <span className="xl:hidden">{item.shortLabel}</span>
                  </span>
                ) : null}
              </button>
            );
          })}
        </nav>

      </div>

      <div className="z-10 mt-4 shrink-0 border-t border-white/8 pt-4">
        <DropdownMenu>
          <DropdownMenuTrigger
            className={cn(
              'flex w-full items-center rounded-2xl p-2 text-left outline-none transition hover:bg-white/[0.06] cursor-pointer',
              collapsed ? 'justify-center' : 'justify-between gap-2',
            )}
            aria-label="Menú de cuenta"
          >
            <div className={cn('flex min-w-0 items-center', collapsed ? '' : 'gap-3')}>
              <div className="relative size-10 shrink-0 overflow-hidden rounded-full ring-2 ring-[#8A0201]/40 bg-zinc-800">
                <UserAvatarFill src={avatarUrl} alt={displayName} />
              </div>
              {!collapsed ? (
                <div className="min-w-0">
                  <p
                    suppressHydrationWarning
                    className="truncate text-sm font-medium leading-none text-[#F4F6F3]"
                  >
                    {displayName}
                  </p>
                  <p suppressHydrationWarning className="mt-1 truncate text-xs text-zinc-500">
                    {subtitle ?? (hasData ? 'Historial importado' : 'Sin historial')}
                  </p>
                </div>
              ) : null}
            </div>
            {!collapsed ? <ChevronDown className="size-4 shrink-0 text-zinc-500" /> : null}
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align={collapsed ? 'center' : 'end'}
            side="top"
            className="w-56 border border-white/10 bg-zinc-900 text-[#F4F6F3] shadow-2xl"
          >
            {onOpenRate ? (
              <DropdownMenuItem
                onClick={() => {
                  onOpenRate();
                  onMobileClose?.();
                }}
                className="cursor-pointer gap-2 focus:bg-[#8A0201]/30 focus:text-white"
              >
                <Star className="size-4 text-amber-400" />
                <span>Calificar título</span>
              </DropdownMenuItem>
            ) : null}
            <DropdownMenuItem
              onClick={() => {
                onOpenImporter();
                onMobileClose?.();
              }}
              className="cursor-pointer gap-2 focus:bg-[#8A0201]/30 focus:text-white"
            >
              <Upload className="size-4 text-[#8A0201]" />
              <span>Importar CSV de IMDb</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-white/10" />
            <DropdownMenuItem
              className="cursor-pointer gap-2 focus:bg-rose-900/40 focus:text-rose-200"
              onClick={() => {
                window.location.href = '/auth/logout';
              }}
            >
              <LogOut className="size-4 text-rose-400" />
              <span>Cerrar sesión</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </aside>
  );

  if (mobileOpen) {
    return (
      <>
        <div
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-[2px] lg:hidden"
          aria-hidden="true"
          onClick={onMobileClose}
        />
        <div className="fixed inset-y-0 left-0 z-50 h-full w-[min(100vw-2.5rem,18rem)] shadow-2xl lg:hidden">
          {shell}
        </div>
      </>
    );
  }

  return shell;
}
