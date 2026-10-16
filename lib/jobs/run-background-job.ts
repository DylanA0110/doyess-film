import type { DoyessJobEvent } from '@/lib/jobs/events';
import { rebuildTasteProfileFromDb } from '@/lib/jobs/rebuild-taste-profile';
import { refreshUserKpiCache } from '@/lib/kpi/refresh-user-kpi-cache';
import { createSupabaseAdminClient, isSupabaseAdminConfigured } from '@/lib/supabase/admin';

export async function runBackgroundJob(event: DoyessJobEvent): Promise<void> {
  if (!isSupabaseAdminConfigured()) {
    console.warn('[jobs] SUPABASE_SERVICE_ROLE_KEY ausente; omitiendo rebuild async');
    return;
  }

  const supabase = createSupabaseAdminClient();
  const userId = event.data.userId;
  if (!userId) return;

  await rebuildTasteProfileFromDb(supabase, userId);
  await refreshUserKpiCache(supabase, userId);
}
