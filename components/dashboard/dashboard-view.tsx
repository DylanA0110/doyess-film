'use client';

import * as React from 'react';
import { Sidebar } from './sidebar';
import { Topbar } from './topbar';
import { CsvImporterDialog } from './csv-importer-dialog';
import { RateTitleInline } from './rate-title-inline';
import { useRateFlowStore } from '@/stores/rate-flow-store';
import { DashboardEmptyState } from './dashboard-empty-state';
import { DashboardExplorar } from './dashboard-explorar';
import { DashboardParaVos } from './dashboard-para-vos';
import { DashboardResumenWithData } from './dashboard-resumen-with-data';
import { DashboardBiblioteca } from './dashboard-biblioteca';
import type {
  DailyPickResult,
  DashboardMovie,
  DashboardStats,
  ProfileHighlight,
} from './types';

const TAB_LABELS: Record<string, string> = {
  resumen: 'Resumen',
  'para-vos': 'Para vos',
  laboratorio: 'Laboratorio de gustos',
  biblioteca: 'Mi biblioteca',
  analista: 'Analista de cine con IA',
  explorar: 'Explorar',
};

const SIDEBAR_COLLAPSED_KEY = 'doyess-sidebar-collapsed';

interface DashboardViewProps {
  userId: string;
  userName: string;
  displayName: string;
  avatarUrl: string | null;
  hasData: boolean;
  stats: DashboardStats;
  recentMovies: DashboardMovie[];
  recentActivity: DashboardMovie[];
  catalogMovies: DashboardMovie[];
  profileHighlights: ProfileHighlight[];
  dailyPick: DailyPickResult | null;
  ritualDateKey: string;
  personMovieLookup: Record<string, DashboardMovie[]>;
  schemaWarning?: string | null;
}

export function DashboardView({
  userId,
  userName,
  displayName,
  avatarUrl,
  hasData,
  stats,
  recentMovies,
  catalogMovies,
  profileHighlights,
  dailyPick,
  ritualDateKey,
  personMovieLookup,
  schemaWarning,
}: DashboardViewProps) {
  const [currentTab, setCurrentTab] = React.useState('resumen');
  const [isImporterOpen, setIsImporterOpen] = React.useState(false);
  const [mobileNavOpen, setMobileNavOpen] = React.useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false);

  React.useEffect(() => {
    try {
      const stored = localStorage.getItem(SIDEBAR_COLLAPSED_KEY);
      if (stored === '1') setSidebarCollapsed(true);
    } catch {
      /* ignore */
    }
  }, []);

  const toggleCollapsed = () => {
    setSidebarCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(SIDEBAR_COLLAPSED_KEY, next ? '1' : '0');
      } catch {
        /* ignore */
      }
      return next;
    });
  };

  const requestSearchFocus = useRateFlowStore((s) => s.requestSearchFocus);

  const movieCountLabel = hasData
    ? `${stats.moviesWatched} películas`
    : 'Sin historial';

  return (
    <div className="min-h-screen bg-[#050000] text-[#F4F6F3] lg:flex lg:items-stretch">
      <div className="hidden shrink-0 lg:sticky lg:top-0 lg:self-start lg:max-h-screen lg:block">
        <Sidebar
          currentTab={currentTab}
          onSelectTab={setCurrentTab}
          onOpenImporter={() => setIsImporterOpen(true)}
          onOpenRate={requestSearchFocus}
          hasData={hasData}
          displayName={displayName}
          avatarUrl={avatarUrl}
          subtitle={movieCountLabel}
          collapsed={sidebarCollapsed}
          onToggleCollapsed={toggleCollapsed}
          includeBiblioteca={hasData}
        />
      </div>

      {mobileNavOpen ? (
        <Sidebar
          className="lg:hidden"
          mobileOpen
          onMobileClose={() => setMobileNavOpen(false)}
          currentTab={currentTab}
          onSelectTab={setCurrentTab}
          onOpenImporter={() => setIsImporterOpen(true)}
          onOpenRate={requestSearchFocus}
          hasData={hasData}
          displayName={displayName}
          avatarUrl={avatarUrl}
          subtitle={movieCountLabel}
          includeBiblioteca={hasData}
        />
      ) : null}

      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar
          onOpenImporter={() => setIsImporterOpen(true)}
          onOpenRate={requestSearchFocus}
          onOpenMobileNav={() => setMobileNavOpen(true)}
          hasData={hasData}
          avatarUrl={avatarUrl}
          displayName={displayName}
        />

        <RateTitleInline userId={userId} />

        <main
          id="dashboard-main"
          className="dashboard-dark-scroll mx-auto w-full max-w-[1600px] flex-1 overflow-x-hidden overflow-y-auto p-4 sm:p-6 lg:p-7"
          tabIndex={-1}
        >
          {currentTab === 'resumen' ? (
            hasData ? (
              <DashboardResumenWithData
                userId={userId}
                userName={userName}
                stats={stats}
                recentMovies={recentMovies}
                catalogMovies={catalogMovies}
                onOpenImporter={() => setIsImporterOpen(true)}
                personMovieLookup={personMovieLookup}
              />
            ) : (
              <DashboardEmptyState
                userName={userName}
                userId={userId}
                schemaWarning={schemaWarning}
              />
            )
          ) : currentTab === 'para-vos' ? (
            hasData ? (
              <DashboardParaVos
                userName={userName}
                userId={userId}
                stats={stats}
                highlights={profileHighlights}
                hasData={hasData}
                dailyPick={dailyPick}
                ritualDateKey={ritualDateKey}
              />
            ) : (
              <DashboardEmptyState
                userName={userName}
                userId={userId}
                schemaWarning={schemaWarning}
              />
            )
          ) : currentTab === 'explorar' ? (
            hasData ? (
              <DashboardExplorar userName={userName} userId={userId} stats={stats} />
            ) : (
              <DashboardEmptyState
                userName={userName}
                userId={userId}
                schemaWarning={schemaWarning}
              />
            )
          ) : currentTab === 'biblioteca' ? (
            hasData ? (
              <DashboardBiblioteca
                userId={userId}
                userName={userName}
                stats={stats}
                catalogMovies={catalogMovies}
              />
            ) : (
              <DashboardEmptyState
                userName={userName}
                userId={userId}
                schemaWarning={schemaWarning}
              />
            )
          ) : (
            <div className="space-y-4 rounded-2xl border border-white/8 bg-[#101009] p-6 text-center sm:p-8">
              <h2 className="text-xl font-bold text-[#F4F6F3] sm:text-2xl">
                {TAB_LABELS[currentTab] ?? 'Próximamente'}
              </h2>
              <p className="mx-auto max-w-md text-sm text-[#F4F6F3]/60">
                Esta sección llegará en una fase posterior. Mientras tanto, usa el resumen y
                importa tu CSV de IMDb cuando quieras.
              </p>
              <button
                type="button"
                onClick={() => setCurrentTab('resumen')}
                className="inline-flex rounded-full bg-[#8A0201] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#a30302]"
              >
                Volver al resumen
              </button>
            </div>
          )}
        </main>
      </div>

      <CsvImporterDialog
        open={isImporterOpen}
        onOpenChange={setIsImporterOpen}
        userId={userId}
      />
    </div>
  );
}
