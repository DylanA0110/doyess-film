import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { persistUserRating } from '@/lib/ratings/persist-user-rating';
import type { TmdbMediaType } from '@/lib/tmdb/find-by-imdb';

type RatingBody = {
  tmdbId: number;
  mediaType: TmdbMediaType;
  rating: number;
};

export async function POST(request: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  let body: RatingBody;
  try {
    body = (await request.json()) as RatingBody;
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 });
  }

  const tmdbId = Number(body.tmdbId);
  const mediaType = body.mediaType;
  const rating = Math.round(Number(body.rating));

  if (!Number.isFinite(tmdbId) || tmdbId <= 0) {
    return NextResponse.json({ error: 'tmdbId inválido' }, { status: 400 });
  }
  if (mediaType !== 'movie' && mediaType !== 'tv') {
    return NextResponse.json({ error: 'mediaType inválido' }, { status: 400 });
  }
  if (rating < 1 || rating > 10) {
    return NextResponse.json({ error: 'La nota debe estar entre 1 y 10' }, { status: 400 });
  }

  try {
    const result = await persistUserRating(supabase, {
      userId: user.id,
      tmdbId,
      mediaType,
      rating,
    });

    return NextResponse.json({
      ok: true,
      movieId: result.movieId,
      imdbId: result.imdbId,
      needsEnrichment: result.needsEnrichment,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error al guardar';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
