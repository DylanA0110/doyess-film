import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { searchTmdbMedia } from '@/lib/tmdb/search-media';

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
  const q = searchParams.get('q') ?? searchParams.get('query') ?? '';

  if (q.trim().length < 2) {
    return NextResponse.json({ results: [] });
  }

  try {
    const results = await searchTmdbMedia(q.trim());
    return NextResponse.json({ results });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error de búsqueda';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
