'use client';

import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Home,
  Sparkles,
  BarChart2,
  BookOpen,
  Bot,
  Compass,
  ChevronDown,
  Upload,
  RotateCcw,
  LogOut,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface SidebarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  onOpenImporter: () => void;
  onResetData: () => void;
  isCustomDataLoaded?: boolean;
}

export function Sidebar({
  currentTab,
  onSelectTab,
  onOpenImporter,
  onResetData,
  isCustomDataLoaded,
}: SidebarProps) {
  const navItems = [
    { id: 'inicio', label: 'Inicio', icon: Home },
    { id: 'para-vos', label: 'Para vos', icon: Sparkles },
    { id: 'laboratorio', label: 'Laboratorio de gustos', icon: BarChart2 },
    { id: 'biblioteca', label: 'Mi biblioteca', icon: BookOpen },
    { id: 'analista', label: 'Analista de cine con IA', icon: Bot },
    { id: 'explorar', label: 'Explorar', icon: Compass },
  ];

  return (
    <aside className="relative flex flex-col justify-between border-r border-white/5 bg-[#050000] p-5 lg:h-screen lg:w-64 lg:shrink-0 overflow-hidden select-none">
      {/* Background geometric emblem watermark */}
      <div className="pointer-events-none absolute -bottom-16 -left-16 size-80 opacity-[0.07] blur-[1px]">
        <Image
          src="/doyess-logo.svg"
          alt=""
          fill
          className="object-contain"
          aria-hidden="true"
        />
      </div>

      <div className="space-y-8 z-10">
        {/* Brand Header */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="flex size-10 items-center justify-center rounded-xl bg-transparent transition group-hover:scale-105">
            <Image
              src="/doyess-logo.svg"
              alt="Doyess Film"
              width={34}
              height={34}
              priority
            />
          </div>
          <span className="text-xl font-bold tracking-tight text-[#F4F6F3]">
            Doyess Film
          </span>
        </Link>

        {/* Navigation items */}
        <nav className="space-y-1.5" aria-label="Navegación principal">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectTab(item.id)}
                className={`group flex w-full items-center gap-3.5 rounded-xl px-4 py-3 text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-[#8A0201] text-white shadow-[0_4px_20px_rgba(138,2,1,0.35)] font-semibold'
                    : 'text-[#F4F6F3]/70 hover:bg-white/5 hover:text-[#F4F6F3]'
                }`}
              >
                <Icon
                  className={`size-4.5 transition-colors ${
                    isActive ? 'text-white' : 'text-[#F4F6F3]/60 group-hover:text-[#F4F6F3]'
                  }`}
                />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* User Profile / Footer */}
      <div className="pt-6 border-t border-white/5 z-10">
        <DropdownMenu>
          <DropdownMenuTrigger className="flex w-full items-center justify-between rounded-2xl p-2 transition hover:bg-white/5 text-left outline-none cursor-pointer">
            <div className="flex items-center gap-3">
              <div className="relative size-10 overflow-hidden rounded-full ring-2 ring-[#8A0201]/40 bg-zinc-900">
                <Image
                  src="/dylan-avatar.svg"
                  alt="Dylan Araica"
                  fill
                  sizes="40px"
                  className="object-cover"
                />
              </div>
              <div>
                <p className="text-sm font-medium text-[#F4F6F3] leading-none">
                  Dylan Araica
                </p>
                <p className="mt-1 text-xs text-[#F4F6F3]/50">
                  {isCustomDataLoaded ? 'Datos IMDb activos' : 'Mi perfil'}
                </p>
              </div>
            </div>
            <ChevronDown className="size-4 text-[#F4F6F3]/40" />
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            side="top"
            className="w-56 border border-white/10 bg-[#101009] text-[#F4F6F3] shadow-2xl backdrop-blur-xl"
          >
            <div className="px-2.5 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-[#F4F6F3]/50">
              Gestión de sesión
            </div>
            <DropdownMenuItem
              onClick={onOpenImporter}
              className="cursor-pointer gap-2 focus:bg-[#8A0201]/30 focus:text-white"
            >
              <Upload className="size-4 text-[#8A0201]" />
              <span>Importar CSV de IMDb</span>
            </DropdownMenuItem>
            {isCustomDataLoaded && (
              <DropdownMenuItem
                onClick={onResetData}
                className="cursor-pointer gap-2 focus:bg-white/10"
              >
                <RotateCcw className="size-4 text-zinc-400" />
                <span>Restablecer a Mockup</span>
              </DropdownMenuItem>
            )}
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
}
