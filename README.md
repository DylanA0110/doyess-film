# Doyess Film

Dashboard personal de cine: importás tu CSV de IMDb, ves **estadísticas con promedios Bayesianos** y descubrís títulos con un **motor de recomendación v3** (perfil por usuario, carriles en Explorar, pick diario en Para vos).

## Stack

- **Next.js** (App Router) · **React** · **TypeScript**
- **Supabase** (Auth Google, Postgres, RLS)
- **Tailwind CSS v4** · **Recharts** · **TanStack Query**
- **TMDB** (discover, keywords, fichas, enriquecimiento)
- Motor: [`lib/recommendation/`](lib/recommendation/) — detalle en [`docs/recommendation-engine.md`](docs/recommendation-engine.md)

## Cómo funciona el algoritmo (resumen)

Todo parte de **tu** historial (`user_ratings` + `movies`, enriquecidos con TMDB cuando hace falta).

1. **Perfil de gustos** (`buildUserRecommendationProfile`, v3)  
   - Notas → Z-score con **decaimiento temporal** (títulos recientes pesan más).  
   - **Géneros y directores**: agregados Bayes (lo que ves en Resumen).  
   - **Keywords** TMDB: TF-IDF + vector sparse (afinidad fina entre títulos).  
   - Cortes **películas** vs **series** (`moviesTaste` / `seriesTaste`).

2. **Scoring de un candidato** (`scoreCandidate`)  
   - Mezcla afinidad por keywords, calidad TMDB (votos/nota) y bonus si el director está en tu top.  
   - “Joyas ocultas”: pocos votos + alta afinidad → boost acotado.

3. **Explorar** (`GET /api/explore` → `buildExplorePage`)  
   - Pools TMDB **discover** filtrados por tus géneros (mapeo IMDb → TMDB, p. ej. Suspense → Thriller).  
   - Cada título del carril debe **coincidir en género** con el nombre del carril.  
   - Carriles de género: los **dos géneros con más % en el gráfico del Resumen** (misma lógica que KPIs).  
   - Carril **series**: género top de `seriesTaste` + solo `tv`.  
   - Carriles opcionales: keywords estables (≥2 títulos en tu historial), patrón/insights, desafío.  
   - **Hero**: el mejor candidato **recalculado en cada request** entre los carriles (no usa el pick diario cacheado).  
   - Excluye lo que ya viste (`seenIds` TMDB).

4. **Para vos**  
   - **Pick del día**: una película/día en `user_daily_picks` (discover + score; motivo se **refresca** al leer con el perfil actual).  
   - **Cartas**: highlights desde tu historial (no TMDB discover).

5. **Calificar** (`POST /api/ratings`)  
   - Guarda nota, póster, géneros, **keywords y directores** TMDB al instante.  
   - Invalida caché cliente + dispara **rebuild** de perfil (service role en local).

Tras import CSV o calificar, conviene tener `SUPABASE_SERVICE_ROLE_KEY` para que el rebuild async actualice `user_taste_profiles` y KPIs.

## Requisitos

- Node.js 20+
- [pnpm](https://pnpm.io/)
- Proyecto [Supabase](https://supabase.com/)
- Google OAuth en Supabase
- `TMDB_API_TOKEN` (Bearer v4)

### SQL

1. Proyecto **nuevo**: [`supabase/schema.sql`](supabase/schema.sql)  
2. Proyecto **existente**: [`supabase/migrate.sql`](supabase/migrate.sql)

### Variables opcionales (`.env`)

| Variable | Uso |
|----------|-----|
| `SUPABASE_SERVICE_ROLE_KEY` | Rebuild de perfil/KPI tras calificar o importar |
| `INNGEST_*` | Jobs en Inngest (sin esto: `after()` en el mismo proceso) |
| `UPSTASH_REDIS_*` | Caché TMDB |

Ver [`docs/architecture-scaling.md`](docs/architecture-scaling.md).

## Local

```bash
cp .env.example .env
# Rellena NEXT_PUBLIC_SUPABASE_*, TMDB_API_TOKEN, y opcional SERVICE_ROLE

pnpm install
pnpm dev
```

Redirect URL en Supabase: `http://localhost:3000/auth/callback`  
OAuth: [`docs/google-oauth-setup.md`](docs/google-oauth-setup.md)

## Scripts

| Comando | Descripción |
|---------|-------------|
| `pnpm dev` | Desarrollo |
| `pnpm build` | Producción |
| `pnpm lint` | ESLint |
| `pnpm test` | Vitest (motor y filtros de género) |

## Dashboard (pestañas)

| Pestaña | Fuente de datos |
|---------|------------------|
| **Resumen** | `cinephile_stats` / KPIs Bayes |
| **Para vos** | Pick diario + cartas de perfil |
| **Explorar** | Perfil + discover TMDB (carriles dinámicos) |
| **Mi biblioteca** | Catálogo importado + filtros |

## Documentación

1. [Sistema de diseño](docs/doyess-film-design-system.md)  
2. [Motor de recomendación](docs/recommendation-engine.md)  
3. [CSV IMDb](docs/imdb-csv-base.md) · [Tutorial export](docs/imdb-export-tutorial.md)  
4. [Contribuir](CONTRIBUTING.md)
