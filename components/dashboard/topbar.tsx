'use client';

import * as React from 'react';
import { UserAvatarFill } from '@/components/dashboard/user-avatar-fill';
import { Search, Bell, FileSpreadsheet, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TopbarProps {
  onOpenImporter: () => void;
  onOpenMobileNav?: () => void;
  hasData?: boolean;
  avatarUrl: string | null;
  displayName: string;
}

export function Topbar({
  onOpenImporter,
  onOpenMobileNav,
  hasData,
  avatarUrl,
  displayName,
}: TopbarProps) {
  const [searchQuery, setSearchQuery] = React.useState('');
  return (
    <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center justify-between gap-2 border-b border-white/5 bg-[#050000]/90 px-3 backdrop-blur-xl sm:h-16 sm:gap-4 sm:px-6">
      <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
        <button
          type="button"
          className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-white/10 text-zinc-300 hover:bg-white/5 lg:hidden"
          aria-label="Abrir menú de navegación"
          onClick={onOpenMobileNav}
        >
          <Menu className="size-5" />
        </button>
        <div className="relative min-w-0 flex-1 max-w-xl">
          <label className="sr-only" htmlFor="dashboard-search">Buscar en tu biblioteca</label>
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#F4F6F3]/40" />
          <input
            id="dashboard-search"
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar…"
            className="h-9 w-full rounded-full border border-white/8 bg-[#101009]/80 pl-9 pr-3 text-sm text-[#F4F6F3] placeholder-[#F4F6F3]/40 outline-none transition focus:border-[#8A0201]/60 focus:ring-1 focus:ring-[#8A0201]/50 sm:h-10 sm:pl-10 sm:pr-4"
          />
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2 sm:gap-3">
        <Button
          variant="outline"
          size="sm"
          onClick={onOpenImporter}
          className="inline-flex items-center gap-1.5 rounded-full border-[#8A0201]/30 bg-[#8A0201]/10 px-2.5 text-[10px] font-medium text-[#F4F6F3] hover:bg-[#8A0201]/25 sm:gap-2 sm:px-3.5 sm:text-xs"
        >
          <FileSpreadsheet className="size-3.5 text-[#8A0201]" />
          <span className="hidden xs:inline sm:inline">
            {hasData ? 'IMDb ✓' : 'CSV'}
          </span>
        </Button>

        <button
          type="button"
          aria-label="Notificaciones"
          className="relative hidden size-10 items-center justify-center rounded-full border border-white/8 bg-[#101009] text-[#F4F6F3]/70 transition hover:bg-white/10 hover:text-[#F4F6F3] sm:flex"
        >
          <Bell className="size-4" />
          <span className="absolute top-2.5 right-2.5 size-2 rounded-full bg-[#8A0201]" />
        </button>

        <div className="relative size-9 overflow-hidden rounded-full ring-1 ring-white/15 bg-zinc-900 sm:size-10">
          <UserAvatarFill src={avatarUrl} alt={displayName} />
        </div>
      </div>
    </header>
  );
}
