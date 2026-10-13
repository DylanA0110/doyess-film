import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import type { ImportedTitle } from '@/lib/imdb/types';

type ImportBody = {
  titles: ImportedTitle[];
};

function parseDateRated(value: string | null) {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed;
  const parsed = new Date(trimmed);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed.toISOString().slice(0, 10);
}

export async function POST(request: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  let body: ImportBody;
  try {
    body = (await request.json()) as ImportBody;
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 });
  }

  const titles = body.titles ?? [];
  if (!Array.isArray(titles) || titles.length === 0) {
    return NextResponse.json({ error: 'No hay títulos para importar' }, { status: 400 });
  }

  let imported = 0;
  let skipped = 0;
  const errors: string[] = [];
  const newImdbIds: string[] = [];

  for (const title of titles) {
    const imdbId = title.imdbId?.trim();
    if (!imdbId) {
      skipped += 1;
      continue;
    }

    const rating = title.yourRating;
    if (rating == null || rating < 1 || rating > 10) {
      skipped += 1;
      continue;
    }

    const { data: existing } = await supabase
      .from('movies')
      .select('id, enrichment_status')
      .eq('imdb_id', imdbId)
      .maybeSingle();

    const metadata = {
      title: title.title || title.originalTitle || imdbId,
      original_title: title.originalTitle || title.title,
      title_type: title.titleType,
      release_year: title.year,
      runtime_mins: title.runtimeMinutes,
      genres: title.genres.length > 0 ? title.genres : null,
      directors: title.directors.length > 0 ? title.directors : null,
    };

    let movieId: string;

    if (existing) {
      const { error: updateError } = await supabase
        .from('movies')
        .update(metadata)
        .eq('imdb_id', imdbId);

      if (updateError) {
        errors.push(`${imdbId}: ${updateError.message}`);
        skipped += 1;
        continue;
      }
      movieId = existing.id;
      if (existing.enrichment_status === 'pending') {
        newImdbIds.push(imdbId);
      }
    } else {
      const { data: inserted, error: insertError } = await supabase
        .from('movies')
        .insert({
          imdb_id: imdbId,
          ...metadata,
          enrichment_status: 'pending',
        })
        .select('id')
        .single();

      if (insertError || !inserted) {
        errors.push(`${imdbId}: ${insertError?.message ?? 'película no guardada'}`);
        skipped += 1;
        continue;
      }
      movieId = inserted.id;
      newImdbIds.push(imdbId);
    }

    const { error: ratingError } = await supabase.from('user_ratings').upsert(
      {
        user_id: user.id,
        movie_id: movieId,
        rating: Math.round(rating),
        date_rated: parseDateRated(title.dateRated),
      },
      { onConflict: 'user_id,movie_id' },
    );

    if (ratingError) {
      errors.push(`${imdbId}: ${ratingError.message}`);
      skipped += 1;
      continue;
    }

    imported += 1;
  }

  const uniqueNew = [...new Set(newImdbIds)];

  return NextResponse.json({
    imported,
    skipped,
    newImdbIds: uniqueNew,
    errors: errors.slice(0, 20),
  });
}
