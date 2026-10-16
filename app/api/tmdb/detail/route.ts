import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { lookupUserRatingByTmdb } from '@/lib/ratings/lookup-user-rating-by-tmdb';
import { fetchTmdbMediaDetail } from '@/lib/tmdb/media-detail';
import type { TmdbMediaType } from '@/lib/tmdb/find-by-imdb';

export async function GET(request: Request) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type') as TmdbMediaType | null;
  const idParam = searchParams.get('id');
  const tmdbId = idParam ? Number(idParam) : NaN;

  if (type !== 'movie' && type !== 'tv') {
    return NextResponse.json({ error: 'type debe ser movie o tv' }, { status: 400 });
  }
  if (!Number.isFinite(tmdbId) || tmdbId <= 0) {
    return NextResponse.json({ error: 'id inválido' }, { status: 400 });
  }

  try {
    const detail = await fetchTmdbMediaDetail(type, tmdbId);
    if (!detail) {
      return NextResponse.json({ error: 'Título no encontrado' }, { status: 404 });
    }
    const userRating = await lookupUserRatingByTmdb(supabase, user.id, type, tmdbId);
    return NextResponse.json(
      { detail, userRating },
      {
        headers: { 'Cache-Control': 'private, max-age=120' },
      },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error al cargar detalle';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
