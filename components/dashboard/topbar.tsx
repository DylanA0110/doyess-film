'use client';

import * as React from 'react';
import Image from 'next/image';
import { Search, Bell, Upload, FileSpreadsheet } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TopbarProps {
  onOpenImporter: () => void;
  isCustomDataLoaded?: boolean;
}

export function Topbar({ onOpenImporter, isCustomDataLoaded }: TopbarProps) {
  const [searchQuery, setSearchQuery] = React.useState('');

  return (
    <header className="flex h-16 items-center justify-between gap-4 border-b border-white/5 bg-[#050000]/80 px-6 backdrop-blur-xl z-20">
      {/* Search Bar matching Image 1 */}
      <div className="relative flex-1 max-w-xl">
        <div className="relative flex items-center">
          <Search className="absolute left-3.5 size-4 text-[#F4F6F3]/40 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar películas, directores, actores..."
            className="h-10 w-full rounded-full border border-white/8 bg-[#101009]/80 pl-10 pr-4 text-sm text-[#F4F6F3] placeholder-[#F4F6F3]/40 outline-none transition focus:border-[#8A0201]/60 focus:bg-black focus:ring-1 focus:ring-[#8A0201]/50"
          />
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-3">
        {/* CSV Import Shortcut */}
        <Button
          variant="outline"
          size="sm"
          onClick={onOpenImporter}
          className="hidden sm:inline-flex items-center gap-2 rounded-full border-[#8A0201]/30 bg-[#8A0201]/10 px-3.5 text-xs font-medium text-[#F4F6F3] hover:bg-[#8A0201]/25 hover:border-[#8A0201]"
        >
          <FileSpreadsheet className="size-3.5 text-[#8A0201]" />
          <span>{isCustomDataLoaded ? 'Datos IMDb ✓' : 'Cargar CSV'}</span>
        </Button>

        {/* Notifications */}
        <button
          type="button"
          aria-label="Notificaciones"
          className="relative flex size-10 items-center justify-center rounded-full border border-white/8 bg-[#101009] text-[#F4F6F3]/70 transition hover:bg-white/10 hover:text-[#F4F6F3]"
        >
          <Bell className="size-4" />
          <span className="absolute top-2.5 right-2.5 size-2 rounded-full bg-[#8A0201]" />
        </button>

        {/* User Avatar */}
        <div className="relative size-10 overflow-hidden rounded-full ring-1 ring-white/15 bg-zinc-900">
          <Image
            src="/dylan-avatar.svg"
            alt="Dylan Araica"
            fill
            sizes="40px"
            className="object-cover"
          />
        </div>
      </div>
    </header>
  );
}
