import type { User } from '@supabase/supabase-js';

type ProfileRow = {
  full_name?: string | null;
  avatar_url?: string | null;
  email?: string | null;
};

function normalizeAvatarUrl(url: string | null | undefined): string | null {
  if (!url?.trim()) return null;
  const trimmed = url.trim();
  if (trimmed.includes('googleusercontent.com')) {
    if (trimmed.includes('=')) return trimmed;
    return `${trimmed}=s96-c`;
  }
  return trimmed;
}

export function getAvatarUrlFromUser(
  user: User,
  profile?: ProfileRow | null,
): string | null {
  const fromProfile = normalizeAvatarUrl(profile?.avatar_url);
  if (fromProfile) return fromProfile;

  const meta = user.user_metadata ?? {};
  return (
    normalizeAvatarUrl(
      typeof meta.avatar_url === 'string'
        ? meta.avatar_url
        : typeof meta.picture === 'string'
          ? meta.picture
          : null,
    ) ?? null
  );
}

export function getDisplayNameFromUser(
  user: User,
  profile?: ProfileRow | null,
): string {
  if (profile?.full_name?.trim()) {
    return profile.full_name.trim();
  }

  const meta = user.user_metadata ?? {};
  if (typeof meta.full_name === 'string' && meta.full_name.trim()) {
    return meta.full_name.trim();
  }
  if (typeof meta.name === 'string' && meta.name.trim()) {
    return meta.name.trim();
  }

  if (user.email) {
    return user.email.split('@')[0] ?? 'Cinéfilo';
  }

  return 'Cinéfilo';
}

export function buildProfileUpsertFromUser(user: User) {
  const fullName = getDisplayNameFromUser(user, null);
  const avatarUrl = getAvatarUrlFromUser(user, null);

  return {
    id: user.id,
    email: user.email ?? null,
    full_name: fullName,
    avatar_url: avatarUrl,
  };
}
