import { describe, expect, it, vi } from 'vitest';
import { QueryClient } from '@tanstack/react-query';
import { invalidateUserCinephileData } from '@/lib/invalidate-user-cinephile';

describe('invalidateUserCinephileData', () => {
  it('invalidates dashboard, stats, taste profile and explore keys', () => {
    const queryClient = new QueryClient();
    const spy = vi.spyOn(queryClient, 'invalidateQueries');

    invalidateUserCinephileData(queryClient, 'user-1');

    expect(spy).toHaveBeenCalledTimes(4);
    expect(spy).toHaveBeenCalledWith({ queryKey: ['dashboard', 'user-1'] });
    expect(spy).toHaveBeenCalledWith({ queryKey: ['cinephile-stats', 'user-1'] });
    expect(spy).toHaveBeenCalledWith({ queryKey: ['taste-profile', 'user-1'] });
    expect(spy).toHaveBeenCalledWith({ queryKey: ['explore', 'user-1'] });
  });
});
