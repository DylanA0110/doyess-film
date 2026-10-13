'use client';

import * as React from 'react';
import Image from 'next/image';
import { Star, ChevronRight, ArrowRight } from 'lucide-react';
import type { DashboardMovie } from './types';

interface RecentActivityCardProps {
  activity: DashboardMovie[];
}

export function RecentActivityCard({ activity }: RecentActivityCardProps) {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/8 bg-[#101009] p-6 backdrop-blur-xl">
      {/* Header */}
      <div className="flex items-center justify-between pb-4">
        <h3 className="text-base font-bold tracking-tight text-[#F4F6F3]">
          Actividad reciente
        </h3>
        <button
          type="button"
          className="group flex items-center gap-1 text-xs text-[#F4F6F3]/50 hover:text-[#F4F6F3] transition"
        >
          <span>Ver todo</span>
          <ArrowRight className="size-3 text-[#F4F6F3]/40 group-hover:translate-x-0.5 transition" />
        </button>
      </div>

      {/* Activity List */}
      <div className="space-y-3">
        {activity.map((item) => (
          <div
            key={item.id}
            className="group flex items-center justify-between rounded-2xl border border-transparent p-2 transition hover:border-white/5 hover:bg-white/5"
          >
            <div className="flex items-center gap-3">
              {/* Mini Poster */}
              <div className="relative size-12 shrink-0 overflow-hidden rounded-xl border border-white/10 bg-zinc-900">
                <Image
                  src={item.posterUrl}
                  alt={item.title}
                  fill
                  sizes="48px"
                  className="object-cover"
                />
              </div>

              {/* Title & Metadata */}
              <div>
                <p className="text-sm font-semibold text-[#F4F6F3] group-hover:text-white transition">
                  {item.title}
                </p>
                <div className="mt-0.5 flex items-center gap-1.5 text-xs text-[#F4F6F3]/50">
                  <Star className="size-3 text-amber-400 fill-amber-400" />
                  <span className="font-medium text-[#F4F6F3]/80">
                    {item.userRating?.toFixed(1) ?? '8.5'}
                  </span>
                  <span>·</span>
                  <span>{item.relativeDate ?? 'Reciente'}</span>
                </div>
              </div>
            </div>

            <ChevronRight className="size-4 text-[#F4F6F3]/30 transition group-hover:text-[#F4F6F3]/70 group-hover:translate-x-0.5" />
          </div>
        ))}
      </div>
    </div>
  );
}
