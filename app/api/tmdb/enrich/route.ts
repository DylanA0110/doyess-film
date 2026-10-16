import { NextRequest, NextResponse } from 'next/server';
import { connection } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { enrichMovieFromImdbId } from '@/lib/tmdb/enrich-movie';
import { upsertMediaKeywordVector } from '@/lib/recommendation/sync-media-keyword-vector';
import { ENRICH_BATCH_SIZE } from '@/lib/tmdb/enrich-batch';
import {
  isTerminalEnrichmentStatus,
  shouldSkipTmdbWithoutAttempt,
} from '@/lib/imdb/enrichment-eligibility';

type Body = {
  imdbIds?: string[];
};

type MovieJoin = {
  imdb_id: string;
  enrichment_status: string | null;
};

function normalizeMovieJoin(
  movies: MovieJoin | MovieJoin[] | null,
): MovieJoin | null {
  if (!movies) return null;
  return Array.isArray(movies) ? movies[0] ?? null : movies;
}

async function getUserMovieRows(
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
  userId: string,
) {
  const { data } = await supabase
    .from('user_ratings')
    .select('movies ( imdb_id, enrichment_status )')
    .eq('user_id', userId);

  const rows: MovieJoin[] = [];
  for (const row of data ?? []) {
    const movie = normalizeMovieJoin(
      (row as { movies: MovieJoin | MovieJoin[] | null }).movies,
    );
    if (movie?.imdb_id) rows.push(movie);
  }
  return rows;
}

function isPendingStatus(status: string | null | undefined): boolean {
  return !status || status === 'pending';
}

export async function POST(request: NextRequest) {
  await connection();

  if (!process.env.TMDB_API_TOKEN?.trim()) {
    return NextResponse.json(
      { error: 'TMDB_API_TOKEN no está configurado en el servidor (.env)' },
      { status: 503 },
    );
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  let body: Body = {};
  try {
    body = (await request.json()) as Body;
  } catch {
    body = {};
  }

  const allMovies = await getUserMovieRows(supabase, user.id);
  const allowedIds = new Set(allMovies.map((m) => m.imdb_id));
  const pendingIds = allMovies
    .filter((m) => isPendingStatus(m.enrichment_status))
    .map((m) => m.imdb_id);

  let imdbIds = (body.imdbIds ?? []).filter(Boolean).slice(0, ENRICH_BATCH_SIZE);

  if (imdbIds.length === 0) {
    imdbIds = pendingIds.slice(0, ENRICH_BATCH_SIZE);
  } else {
    imdbIds = imdbIds.filter((id) => {
      const row = allMovies.find((m) => m.imdb_id === id);
      return row && isPendingStatus(row.enrichment_status);
    });
  }

  if (imdbIds.length === 0) {
    return NextResponse.json({
      enriched: 0,
      failed: 0,
      skipped: 0,
      remaining: pendingIds.length,
      totalRated: allMovies.length,
    });
  }

  let enriched = 0;
  let failed = 0;
  let skipped = 0;
  const errors: string[] = [];
  const now = new Date().toISOString();

  for (const imdbId of imdbIds) {
    if (!allowedIds.has(imdbId)) {
      failed += 1;
      errors.push(`${imdbId}: no está en tu historial`);
      continue;
    }

    const { data: meta } = await supabase
      .from('movies')
      .select('title_type, enrichment_status')
      .eq('imdb_id', imdbId)
      .maybeSingle();

    if (meta && isTerminalEnrichmentStatus(meta.enrichment_status)) {
      skipped += 1;
      continue;
    }

    if (shouldSkipTmdbWithoutAttempt(meta?.title_type)) {
      const { error: skipError } = await supabase
        .from('movies')
        .update({
          enrichment_status: 'skipped',
          enriched_at: now,
          enrichment_attempted_at: now,
        })
        .eq('imdb_id', imdbId);
      if (skipError) {
        failed += 1;
        errors.push(`${imdbId}: ${skipError.message}`);
      } else {
        skipped += 1;
      }
      continue;
    }

    try {
      const payload = await enrichMovieFromImdbId(imdbId, meta?.title_type);
      if (!payload) {
        const { error: nfError } = await supabase
          .from('movies')
          .update({
            enrichment_status: 'not_found',
            enriched_at: now,
            enrichment_attempted_at: now,
          })
          .eq('imdb_id', imdbId);
        if (nfError) {
          failed += 1;
          errors.push(`${imdbId}: ${nfError.message}`);
        } else {
          failed += 1;
          errors.push(`${imdbId}: sin match TMDB`);
        }
        continue;
      }

      const { error: updateError } = await supabase
        .from('movies')
        .update({
          tmdb_id: payload.tmdb_id,
          tmdb_media_type: payload.tmdb_media_type,
          tmdb_keywords: payload.tmdb_keywords,
          poster_path: payload.poster_path,
          backdrop_path: payload.backdrop_path,
          cast_snapshot: payload.cast_snapshot,
          crew_snapshot: payload.crew_snapshot,
          enriched_at: now,
          enrichment_attempted_at: now,
          enrichment_status: 'ok',
        })
        .eq('imdb_id', imdbId);

      if (updateError) {
        failed += 1;
        errors.push(`${imdbId}: ${updateError.message}`);
        continue;
      }

      await upsertMediaKeywordVector(
        supabase,
        payload.tmdb_id,
        payload.tmdb_media_type,
        payload.tmdb_keywords,
      ).catch(() => {
        /* pgvector opcional si falta migración Fase 6 */
      });

      enriched += 1;
    } catch (err) {
      failed += 1;
      errors.push(
        `${imdbId}: ${err instanceof Error ? err.message : 'error TMDB'}`,
      );
    }
  }

  const refreshed = await getUserMovieRows(supabase, user.id);
  const remaining = refreshed.filter((m) => isPendingStatus(m.enrichment_status)).length;

  return NextResponse.json({
    enriched,
    failed,
    skipped,
    remaining,
    errors: errors.slice(0, 10),
  });
}
