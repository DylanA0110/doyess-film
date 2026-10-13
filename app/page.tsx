import { Suspense } from 'react';
import { LandingPage } from '@/components/home/landing-page';
import { isDevSkipAuth } from '@/lib/auth/dev-mode';
import { fetchLandingHeroAssets } from '@/lib/tmdb/landing-hero';

export const instant = false;

export default async function Home() {
  const heroAssets = await fetchLandingHeroAssets();

  return (
    <Suspense fallback={null}>
      <LandingPage devSkipAuth={isDevSkipAuth()} heroAssets={heroAssets} />
    </Suspense>
  );
}
