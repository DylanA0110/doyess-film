# Motor de recomendación

Versión: `ALGORITHM_VERSION` en [`lib/recommendation/types.ts`](../lib/recommendation/types.ts) (**3**).

## Hub central

Un solo perfil (`buildUserRecommendationProfile` / `getUserRecommendationProfile`) alimenta:

- KPIs del dashboard (`buildDashboardStats` — misma forma `DashboardStats`, sin cambios de UI)
- Highlights / cards (`profile-highlights`, `computeAffinity`)
- Insights (`buildCinephileInsights`)
- Película del día (`discoverUnwatchedMovie`)
- Carriles (`getRecommendedLane`)

Caché opcional: tabla `user_taste_profiles` vía `loadOrBuildProfile`.

## Alcance de datos

| Tipo IMDb | KPIs conteo/runtime | Perfil + scoring |
|-----------|---------------------|------------------|
| Película  | Sí                  | Sí               |
| Serie     | Bloque series       | Sí               |
| Capítulo  | Solo conteo         | No               |

## Perfil v3

1. `user_ratings` + `movies` (+ `tmdb_keywords`, `tmdb_media_type`) → ratings
2. Z-score por nota; **time decay** `exp(-(ln2/halfLife)*days)` con half-life 1095 días
3. Keywords: títulos con `z * decay > 0.5` → TF-IDF (IDF global genéricas + IDF local)
4. Géneros/directores: agregados con Z ponderado por decay (Bayes como v2)
5. `keywordVector` sparse L2-normalizado

## Scoring candidato (`scoreCandidate`)

```
base = 0.6*affinity + 0.3*qualityNorm + 0.1*directorBonus
final = min(base * hiddenGemMultiplier, 1.0)
```

- **Afinidad:** coseno sparse entre keywords usuario y candidato
- **Calidad:** `normalizeVoteQuality(voteAverageAdj, voteCount)`; TV: `voteAverage - 0.5`
- **Hidden gem:** `voteCount < 1500` y afinidad `> 0.8` → `×1.5` antes del clamp

## Explorar (UI)

- Carriles: géneros Bayes del usuario, series (`tv`) si hay `seriesTaste`, joyas ocultas (sin rellenar con populares si hay &lt;4 candidatos), patrones e insights.
- Badge en tarjetas: `formatExploreMatchBadge` — porcentaje solo con afinidad híbrida (keywords + fallback género); si no hay señal fuerte, etiqueta legible.
- Al **calificar** desde el dashboard: `persistUserRating` guarda `tmdb_keywords` y directores de TMDB de inmediato; invalida caché explore y dispara rebuild de perfil (requiere `SUPABASE_SERVICE_ROLE_KEY` para el job async).

## Carriles / discover (anti rate-limit)

1. Filtrar `seenIdsSet` (`m_` / `t_` TMDB)
2. Pre-rank con `scoreCandidatePartial` (calidad + director)
3. Top 15 → fetch keywords TMDB (concurrencia limitada)
4. Score completo → top N

## Tests

```bash
pnpm test
```
