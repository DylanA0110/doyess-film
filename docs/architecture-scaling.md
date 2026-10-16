# Escalabilidad (Fase 6)

## SQL

Ejecuta **`supabase/migrate.sql`** (secciones 5–6) en Supabase: extensión `vector`, `media_keyword_vectors`, RPC `match_media_neighbors`, tabla `user_kpi_cache`, columna `keyword_vector` en `user_taste_profiles`.

## 6.1 Jobs (Inngest + fallback)

| Pieza | Ubicación |
|-------|-----------|
| Inngest serve | `app/api/inngest/route.ts` |
| Función debounced 30s | `lib/inngest/functions.ts` → `rebuildTasteProfileJob` |
| Emitir eventos | `lib/jobs/events.ts` |
| Worker | `lib/jobs/run-background-job.ts` |

**Variables**

- Producción con Inngest: `INNGEST_SIGNING_KEY`, `INNGEST_EVENT_KEY` (según dashboard Inngest).
- Worker en BD: `SUPABASE_SERVICE_ROLE_KEY` (obligatorio para rebuild async).
- Sin Inngest: `emitJobEvent` usa `after()` de Next.js en el mismo deploy.

Tras `POST /api/ratings` o import CSV: se invalida snapshot + KPI cache y se encola rebuild (perfil + `user_kpi_cache`).

## 6.2 pgvector

- Embeddings densos 256D desde keywords: `lib/recommendation/dense-keyword-vector.ts`.
- Upsert catálogo al enrich: `lib/recommendation/sync-media-keyword-vector.ts`.
- Vecinos: `lib/recommendation/pgvector-neighbors.ts` + `match_media_neighbors`.
- Carriles mezclan vecinos + discover: `getRecommendedLane` (pasar `supabase` en `options`). Desactivar con `ENABLE_PGVECTOR=false`.

## 6.3 KPI cache

- Tabla `user_kpi_cache` (JSON de `DashboardStats`).
- Refresh en worker: `lib/kpi/refresh-user-kpi-cache.ts`.
- Lectura RSC: `lib/kpi/load-user-kpi-cache.ts` en `app/dashboard/page.tsx`.

## 6.4 Redis (Upstash)

- Cliente: `lib/cache/tmdb-redis.ts`.
- Búsqueda / discover: `lib/tmdb/search-media.ts`, `lib/tmdb/discover-media.ts` vía `lib/tmdb/fetch-cached.ts`.

**Variables:** `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`.

## Cliente

TanStack Query = SSOT remoto. Zustand solo flujo calificar.
