import type { QueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';

export function invalidateUserCinephileData(queryClient: QueryClient, userId: string) {
  void queryClient.invalidateQueries({ queryKey: queryKeys.dashboard(userId) });
  void queryClient.invalidateQueries({ queryKey: queryKeys.cinephileStats(userId) });
  void queryClient.invalidateQueries({ queryKey: queryKeys.tasteProfile(userId) });
  void queryClient.invalidateQueries({ queryKey: queryKeys.explore(userId) });
}
