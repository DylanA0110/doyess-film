# Doyess Film

Laboratorio personal de cine: importa tu CSV de IMDb, obtén estadísticas con **promedios Bayesianos** y recomendaciones con **similitud del coseno** explicables — en una UI oscura tipo cartelera.

## Stack

- **Next.js** (App Router) · **React** · **TypeScript**
- **Supabase** (Auth Google, Postgres, RLS)
- **Tailwind CSS v4** · **Recharts** · **TanStack Query**
- **TMDB** (enriquecimiento server-side, película del día, Explorar)
- Motor en [`lib/recommendation/`](lib/recommendation/) — ver [`docs/recommendation-engine.md`](docs/recommendation-engine.md)

## Requisitos

- Node.js 20+
- [pnpm](https://pnpm.io/)
- Proyecto [Supabase](https://supabase.com/)
- Google OAuth en Supabase

### SQL (orden)

1. Proyecto nuevo: [`supabase/schema.sql`](supabase/schema.sql)
2. Ya existente: [`supabase/migrate-tmdb-enrichment.sql`](supabase/migrate-tmdb-enrichment.sql), [`supabase/migrate-user-daily-pick.sql`](supabase/migrate-user-daily-pick.sql), opcional [`supabase/migrate-user-taste-profiles.sql`](supabase/migrate-user-taste-profiles.sql)

## Local

```bash
cp .env.example .env.local
# Rellena NEXT_PUBLIC_SUPABASE_* y TMDB_API_TOKEN

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
| `pnpm test` | Vitest (motor de recomendación) |

## Documentación

1. [Sistema de diseño](docs/doyess-film-design-system.md)
2. [Motor de recomendación](docs/recommendation-engine.md)
3. [UVP / posicionamiento](docs/doyess-uvp.md)
4. [CSV IMDb](docs/imdb-csv-base.md) · [Tutorial export](docs/imdb-export-tutorial.md)
5. [Contribuir](CONTRIBUTING.md)

## Flujo

1. Landing → login Google → dashboard
2. Importar CSV IMDb (opcional)
3. Resumen (KPIs Bayes) · Para vos (cartas + película del día) · Explorar (preview)
