'use client';

import * as React from 'react';
import { Sidebar } from './sidebar';
import { Topbar } from './topbar';
import { GreetingHero } from './greeting-hero';
import { MetricCards } from './metric-cards';
import { FeaturedRecommendation } from './featured-recommendation';
import { UniverseCard } from './universe-card';
import { RecentMoviesRow } from './recent-movies-row';
import { QuoteCard } from './quote-card';
import { RecentActivityCard } from './recent-activity-card';
import { FavoriteGenresChart } from './favorite-genres-chart';
import { ProfileTrendsCard } from './profile-trends-card';
import { CsvImporterDialog } from './csv-importer-dialog';
import {
  initialStats,
  featuredRecommendations,
  recentActivityList,
  recentMoviesGrid,
} from './mock-data';
import type { DashboardStats, DashboardMovie } from './types';

interface DashboardViewProps {
  userName?: string;
}

export function DashboardView({ userName = 'Dylan' }: DashboardViewProps) {
  const [currentTab, setCurrentTab] = React.useState('inicio');
  const [stats, setStats] = React.useState<DashboardStats>(initialStats);
  const [recommendations, setRecommendations] = React.useState<DashboardMovie[]>(
    featuredRecommendations,
  );
  const [recentMovies, setRecentMovies] = React.useState<DashboardMovie[]>(
    recentMoviesGrid,
  );
  const [recentActivity, setRecentActivity] = React.useState<DashboardMovie[]>(
    recentActivityList,
  );
  const [isImporterOpen, setIsImporterOpen] = React.useState(false);
  const [isCustomDataLoaded, setIsCustomDataLoaded] = React.useState(false);

  const handleImportComplete = (
    newStats: DashboardStats,
    parsedMovies: DashboardMovie[],
    totalCount: number,
  ) => {
    setStats(newStats);
    if (parsedMovies.length > 0) {
      setRecentMovies(parsedMovies.slice(0, 5));
      setRecentActivity(parsedMovies.slice(0, 4));
    }
    setIsCustomDataLoaded(true);
  };

  const handleResetData = () => {
    setStats(initialStats);
    setRecommendations(featuredRecommendations);
    setRecentMovies(recentMoviesGrid);
    setRecentActivity(recentActivityList);
    setIsCustomDataLoaded(false);
  };

  return (
    <div className="flex min-h-screen bg-[#050000] text-[#F4F6F3]">
      {/* 1. Left Sidebar */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        onOpenImporter={() => setIsImporterOpen(true)}
        onResetData={handleResetData}
        isCustomDataLoaded={isCustomDataLoaded}
      />

      {/* Main Right Area */}
      <div className="flex flex-1 flex-col min-w-0 overflow-y-auto">
        {/* 2. Top Header */}
        <Topbar
          onOpenImporter={() => setIsImporterOpen(true)}
          isCustomDataLoaded={isCustomDataLoaded}
        />

        {/* 3. Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-7 space-y-6 max-w-[1600px] mx-auto w-full">
          {currentTab === 'inicio' ? (
            <div className="grid grid-cols-1 lg:grid-cols-[1.8fr_1.2fr] gap-6 items-start">
              {/* Central Area (Left in Grid) */}
              <div className="space-y-6 min-w-0">
                {/* Greeting Hero */}
                <GreetingHero userName={userName} />

                {/* 3 Metrics Cards */}
                <MetricCards stats={stats} />

                {/* Big Featured Recommendation */}
                <FeaturedRecommendation recommendations={recommendations} />

                {/* Bottom Row: Universe + Recent Movies */}
                <div className="grid grid-cols-1 md:grid-cols-[0.8fr_1.2fr] gap-6">
                  <UniverseCard />
                  <RecentMoviesRow movies={recentMovies} />
                </div>
              </div>

              {/* Right Panel (Complementary Info) */}
              <div className="space-y-6">
                {/* Editorial Quote */}
                <QuoteCard />

                {/* Recent Activity */}
                <RecentActivityCard activity={recentActivity} />

                {/* Favorite Genres Donut Chart */}
                <FavoriteGenresChart stats={stats} />

                {/* Profile Trends */}
                <ProfileTrendsCard stats={stats} />
              </div>
            </div>
          ) : (
            /* Other Tabs Placeholder / View */
            <div className="rounded-3xl border border-white/8 bg-[#101009] p-8 text-center space-y-4">
              <h2 className="text-2xl font-bold capitalize text-[#F4F6F3]">
                {currentTab.replace('-', ' ')}
              </h2>
              <p className="text-sm text-[#F4F6F3]/60 max-w-md mx-auto">
                Esta sección está conectada al universo cinematográfico de Doyess Film.
                Puedes volver al panel de inicio o importar más datos desde tu archivo IMDb.
              </p>
              <button
                type="button"
                onClick={() => setCurrentTab('inicio')}
                className="inline-flex rounded-full bg-[#8A0201] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#a30302]"
              >
                Volver al Inicio
              </button>
            </div>
          )}
        </main>
      </div>

      {/* CSV Import Modal */}
      <CsvImporterDialog
        open={isImporterOpen}
        onOpenChange={setIsImporterOpen}
        onImportComplete={handleImportComplete}
      />
    </div>
  );
}
