import { NextResponse } from 'next/server';
import { searchTmdbMovies } from '@/lib/tmdb/client';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('query');
  const yearParam = searchParams.get('year');

  if (!query?.trim()) {
    return NextResponse.json({ error: 'query is required' }, { status: 400 });
  }

  const year = yearParam ? Number(yearParam) : undefined;

  if (yearParam && !Number.isFinite(year)) {
    return NextResponse.json(
      { error: 'year must be a valid number' },
      { status: 400 },
    );
  }

  try {
    const results = await searchTmdbMovies(query.trim(), year);

    return NextResponse.json({ results });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unexpected error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
