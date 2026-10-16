import { connection } from 'next/server';
import { redirect } from 'next/navigation';
import { createSupabaseAdminClient, isSupabaseAdminConfigured } from '@/lib/supabase/admin';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { DashboardView } from '@/components/dashboard/dashboard-view';
import {
  buildDashboardStats,
  cinephileRowsToMovies,
} from '@/lib/imdb/build-dashboard-stats';
import { isDevSkipAuth } from '@/lib/auth/dev-mode';
import { DEV_USER } from '@/lib/auth/dev-user';
import {
  buildProfileUpsertFromUser,
  getAvatarUrlFromUser,
  getDisplayNameFromUser,
} from '@/lib/auth/user-profile';
import { buildPersonMovieLookup } from '@/lib/dashboard/person-movie-lookup';
import { buildProfileHighlights } from '@/lib/dashboard/profile-highlights';
import { dailyPickDateKey } from '@/lib/dashboard/daily-pick-format';
import { resolveDailyPick } from '@/lib/dashboard/resolve-daily-pick';
import {
  purgeKnownQaTmdbRatings,
  purgeSyntheticRatingsWhenImported,
} from '@/lib/ratings/purge-synthetic-ratings';
import { isSyntheticImdbId, rowsForImportedDisplay } from '@/lib/ratings/synthetic-imdb-id';
import { loadCinephileStatsRows } from '@/lib/supabase/load-cinephile-stats';
import { loadOrBuildProfile } from '@/lib/recommendation/load-profile-snapshot';

export const instant = false;

export default async function DashboardPage() {
  await connection();

  const ritualDateKey = dailyPickDateKey(new Date());

  if (isDevSkipAuth()) {
    const stats = buildDashboardStats([]);
    return (
      <DashboardView
        userId={DEV_USER.id}
        userName={DEV_USER.firstName}
        displayName={DEV_USER.displayName}
        avatarUrl={DEV_USER.avatarUrl}
        hasData={false}
        stats={stats}
        recentMovies={[]}
        recentActivity={[]}
        catalogMovies={[]}
        profileHighlights={[]}
        dailyPick={null}
        ritualDateKey={ritualDateKey}
        personMovieLookup={{}}
      />
    );
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/?from=/dashboard');
  }

  await supabase.from('profiles').upsert(buildProfileUpsertFromUser(user), {
    onConflict: 'id',
  });

  const { data: userProfileRow } = await supabase
    .from('profiles')
    .select('full_name, avatar_url, email')
    .eq('id', user.id)
    .maybeSingle();

  const fullName = getDisplayNameFromUser(user, userProfileRow);
  const firstName = fullName.split(' ')[0] ?? fullName;
  const avatarUrl = getAvatarUrlFromUser(user, userProfileRow);

  let { rows, schemaWarning } = await loadCinephileStatsRows(supabase, user.id);

  const importedOnly = rows.filter((r) => !isSyntheticImdbId(r.imdb_id));
  if (importedOnly.length > 0) {
    const purgeDb =
      isSupabaseAdminConfigured() ? createSupabaseAdminClient() : supabase;
    await purgeSyntheticRatingsWhenImported(purgeDb, user.id, importedOnly.length);
    await purgeKnownQaTmdbRatings(purgeDb, user.id, importedOnly.length);
    const reloaded = await loadCinephileStatsRows(supabase, user.id);
    rows = reloaded.rows;
    schemaWarning = reloaded.schemaWarning;
  }

  if (schemaWarning && process.env.NODE_ENV === 'development') {
    console.warn('[dashboard]', schemaWarning);
  }

  const historyRows = rowsForImportedDisplay(rows);
  const hasData = historyRows.length > 0;
  const tasteProfile = hasData
    ? await loadOrBuildProfile(supabase, user.id, historyRows)
    : null;
  const stats = buildDashboardStats(historyRows, tasteProfile);
  const catalogMovies = cinephileRowsToMovies(historyRows);
  const recentMovies = catalogMovies.slice(0, 5);
  const recentActivity = catalogMovies.slice(0, 4);
  const personMovieLookup = buildPersonMovieLookup(historyRows);
  const profileHighlights = buildProfileHighlights(historyRows, stats);
  const dailyPick = hasData
    ? await resolveDailyPick(supabase, user.id, historyRows, stats)
    : null;

  return (
    <DashboardView
      userId={user.id}
      userName={firstName}
      displayName={fullName}
      avatarUrl={avatarUrl}
      hasData={hasData}
      stats={stats}
      recentMovies={recentMovies}
      recentActivity={recentActivity}
      catalogMovies={catalogMovies}
      profileHighlights={profileHighlights}
      dailyPick={dailyPick}
      ritualDateKey={ritualDateKey}
      personMovieLookup={personMovieLookup}
      schemaWarning={schemaWarning}
    />
  );
}
