'use client';

import * as React from 'react';
import Image from 'next/image';
import { TrendingUp, Flame, ArrowUp } from 'lucide-react';
import type { DashboardStats } from './types';

interface ProfileTrendsCardProps {
  stats: DashboardStats;
}

export function ProfileTrendsCard({ stats }: ProfileTrendsCardProps) {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/8 bg-[#101009] p-6 backdrop-blur-xl">
      {/* Header */}
      <div className="flex items-center gap-2 pb-4 text-[#F4F6F3]">
        <TrendingUp className="size-4 text-[#8A0201]" />
        <h3 className="text-base font-bold tracking-tight">
          Tendencias en tu perfil
        </h3>
      </div>

      {/* Trends List */}
      <div className="space-y-4">
        {/* 1. Director más valorado */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative size-10 overflow-hidden rounded-full border border-white/10 bg-zinc-800">
              <Image
                src={stats.topDirector.photoUrl}
                alt={stats.topDirector.name}
                fill
                sizes="40px"
                className="object-cover"
              />
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-wider text-[#F4F6F3]/50">
                Director más valorado
              </p>
              <p className="text-sm font-semibold text-[#F4F6F3]">
                {stats.topDirector.name}
              </p>
            </div>
          </div>
        </div>

        {/* 2. Actor recurrente */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative size-10 overflow-hidden rounded-full border border-white/10 bg-zinc-800">
              <Image
                src={stats.topActor.photoUrl}
                alt={stats.topActor.name}
                fill
                sizes="40px"
                className="object-cover"
              />
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-wider text-[#F4F6F3]/50">
                Actor recurrente
              </p>
              <p className="text-sm font-semibold text-[#F4F6F3]">
                {stats.topActor.name}
              </p>
            </div>
          </div>
        </div>

        {/* 3. Película 10/10 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative size-10 overflow-hidden rounded-xl border border-white/10 bg-zinc-800">
              <Image
                src={stats.perfectMovie.posterUrl}
                alt={stats.perfectMovie.title}
                fill
                sizes="40px"
                className="object-cover"
              />
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-wider text-[#F4F6F3]/50">
                Película 10/10
              </p>
              <p className="text-sm font-semibold text-[#F4F6F3]">
                {stats.perfectMovie.title}
              </p>
            </div>
          </div>
        </div>

        {/* 4. Género en crecimiento */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl border border-[#8A0201]/30 bg-[#8A0201]/15 text-[#8A0201]">
              <Flame className="size-5" />
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-wider text-[#F4F6F3]/50">
                Género en crecimiento
              </p>
              <p className="text-sm font-semibold text-[#F4F6F3]">
                {stats.growingGenre.name}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-0.5 text-xs font-bold text-[#8A0201]">
            <ArrowUp className="size-3" />
            <span>{stats.growingGenre.delta}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
