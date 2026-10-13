'use client';

import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { UserAvatarFill } from '@/components/dashboard/user-avatar-fill';
import {
  LayoutDashboard,
  Sparkles,
  BarChart2,
  BookOpen,
  Bot,
  Compass,
  ChevronDown,
  Upload,
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
  hasData?: boolean;
  displayName: string;
  avatarUrl: string | null;
  subtitle?: string;
  collapsed?: boolean;
  onToggleCollapsed?: () => void;
  mobileOpen?: boolean;
  onMobileClose?: () => void;
  className?: string;
}

export function Sidebar({
  currentTab,
  onSelectTab,
  onOpenImporter,
  hasData,
  displayName,
  avatarUrl,
  subtitle,
  collapsed = false,
  onToggleCollapsed,
  mobileOpen = false,
  onMobileClose,
  className,
}: SidebarProps) {
  const navItems = [
    { id: 'resumen', label: 'Resumen', icon: LayoutDashboard },
    { id: 'para-vos', label: 'Para vos', icon: Sparkles },
    { id: 'laboratorio', label: 'Laboratorio de gustos', icon: BarChart2 },
    { id: 'biblioteca', label: 'Mi biblioteca', icon: BookOpen },
    { id: 'analista', label: 'Analista de cine con IA', icon: Bot },
    { id: 'explorar', label: 'Explorar', icon: Compass },
  ];

  const pickTab = (id: string) => {
    onSelectTab(id);
    onMobileClose?.();
  };

  const shell = (
    <aside
      className={cn(
        'relative flex h-full flex-col justify-between border-r border-white/5 bg-[#050000] overflow-hidden select-none transition-[width] duration-200',
        collapsed ? 'w-[4.25rem] p-3' : 'w-64 p-5',
        className,
      )}
    >
      <div className="pointer-events-none absolute -bottom-16 -left-16 size-80 opacity-[0.07] blur-[1px]">
        <Image src="/doyess-logo.svg" alt="" fill className="object-cover" aria-hidden="true" />
      </div>

      <div className="z-10 space-y-6">
        <div className={cn('flex items-center', collapsed ? 'justify-center' : 'justify-between gap-2')}>
          <Link
            href="/"
            className={cn('flex items-center gap-3 group', collapsed && 'justify-center')}
            onClick={onMobileClose}
          >
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl transition group-hover:scale-105">
              <Image src="/doyess-logo.svg" alt="Doyess Film" width={34} height={34} priority />
            </div>
            {!collapsed ? (
              <span className="text-xl font-bold tracking-tight text-[#F4F6F3]">Doyess Film</span>
            ) : null}
          </Link>
          {mobileOpen && onMobileClose ? (
            <button
              type="button"
              className="rounded-lg p-2 text-zinc-400 hover:bg-white/5 lg:hidden"
              aria-label="Cerrar menú"
              onClick={onMobileClose}
            >
              <X className="size-5" />
            </button>
          ) : null}
        </div>

        <nav className="space-y-1" aria-label="Navegación principal">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;

            return (
              <button
                key={item.id}
                type="button"
                title={collapsed ? item.label : undefined}
                aria-label={item.label}
                aria-current={isActive ? 'page' : undefined}
                onClick={() => pickTab(item.id)}
                className={cn(
                  'group flex w-full items-center rounded-xl text-sm font-medium transition-all',
                  collapsed ? 'justify-center px-0 py-3' : 'gap-3.5 px-4 py-3',
                  isActive
                    ? 'bg-[#8A0201] text-white shadow-[0_4px_20px_rgba(138,2,1,0.35)] font-semibold'
                    : 'text-[#F4F6F3]/70 hover:bg-white/5 hover:text-[#F4F6F3]',
                )}
              >
                <Icon
                  className={cn(
                    'size-5 shrink-0 transition-colors',
                    isActive ? 'text-white' : 'text-[#F4F6F3]/60 group-hover:text-[#F4F6F3]',
                  )}
                />
                {!collapsed ? <span className="truncate text-left">{item.label}</span> : null}
              </button>
            );
          })}
        </nav>

        {onToggleCollapsed ? (
          <button
            type="button"
            onClick={onToggleCollapsed}
            className={cn(
              'hidden w-full items-center rounded-xl border border-white/8 py-2.5 text-xs text-zinc-400 transition hover:bg-white/5 hover:text-zinc-200 lg:flex',
              collapsed ? 'justify-center px-0' : 'gap-2 px-3',
            )}
            aria-label={collapsed ? 'Expandir barra lateral' : 'Ocultar etiquetas del menú'}
          >
            {collapsed ? (
              <PanelLeftOpen className="size-4" />
            ) : (
              <>
                <PanelLeftClose className="size-4" />
                <span>Solo iconos</span>
              </>
            )}
          </button>
        ) : null}
      </div>

      <div className="z-10 border-t border-white/5 pt-4">
        <DropdownMenu>
          <DropdownMenuTrigger
            className={cn(
              'flex w-full items-center rounded-2xl p-2 text-left outline-none transition hover:bg-white/5 cursor-pointer',
              collapsed ? 'justify-center' : 'justify-between',
            )}
            aria-label="Menú de cuenta"
          >
            <div className={cn('flex items-center', collapsed ? '' : 'gap-3')}>
              <div className="relative size-10 shrink-0 overflow-hidden rounded-full ring-2 ring-[#8A0201]/40 bg-zinc-900">
                <UserAvatarFill src={avatarUrl} alt={displayName} />
              </div>
              {!collapsed ? (
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium leading-none text-[#F4F6F3]">
                    {displayName}
                  </p>
                  <p className="mt-1 truncate text-xs text-[#F4F6F3]/50">
                    {subtitle ?? (hasData ? 'Historial importado' : 'Sin historial')}
                  </p>
                </div>
              ) : null}
            </div>
            {!collapsed ? <ChevronDown className="size-4 shrink-0 text-[#F4F6F3]/40" /> : null}
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align={collapsed ? 'center' : 'end'}
            side="top"
            className="w-56 border border-white/10 bg-[#101009] text-[#F4F6F3] shadow-2xl backdrop-blur-xl"
          >
            <div className="px-2.5 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-[#F4F6F3]/50">
              Gestión de sesión
            </div>
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
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
          aria-hidden="true"
          onClick={onMobileClose}
        />
        <div className="fixed inset-y-0 left-0 z-50 h-full lg:hidden">{shell}</div>
      </>
    );
  }

  return shell;
}
