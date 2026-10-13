import { createSupabaseServerClient } from '@/lib/supabase/server';
import { DashboardView } from '@/components/dashboard/dashboard-view';

export const instant = false;

export default async function DashboardPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const fullName =
    user?.user_metadata?.full_name?.split(' ')[0] ??
    (user?.email ? user.email.split('@')[0] : 'Dylan');

  return <DashboardView userName={fullName} />;
}

