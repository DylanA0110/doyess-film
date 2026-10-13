import { connection } from 'next/server';
import { redirect } from 'next/navigation';
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
import { buildProfileHighlights } from '@/lib/dashboard/profile-highlights';
import { resolveDailyPick } from '@/lib/dashboard/resolve-daily-pick';
import { loadCinephileStatsRows } from '@/lib/supabase/load-cinephile-stats';

export const instant = false;

export default async function DashboardPage() {
  await connection();

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

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, avatar_url, email')
    .eq('id', user.id)
    .maybeSingle();

  const fullName = getDisplayNameFromUser(user, profile);
  const firstName = fullName.split(' ')[0] ?? fullName;
  const avatarUrl = getAvatarUrlFromUser(user, profile);

  const { rows, schemaWarning } = await loadCinephileStatsRows(supabase, user.id);

  if (schemaWarning && process.env.NODE_ENV === 'development') {
    console.warn('[dashboard]', schemaWarning);
  }

  const hasData = rows.length > 0;
  const stats = buildDashboardStats(rows);
  const catalogMovies = cinephileRowsToMovies(rows);
  const recentMovies = catalogMovies.slice(0, 5);
  const recentActivity = catalogMovies.slice(0, 4);
  const profileHighlights = buildProfileHighlights(rows, stats);
  const dailyPick = hasData
    ? await resolveDailyPick(supabase, user.id, rows, stats)
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
      schemaWarning={schemaWarning}
    />
  );
}
