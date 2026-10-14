# Motor de recomendación

Versión: `ALGORITHM_VERSION` en [`lib/recommendation/types.ts`](../lib/recommendation/types.ts) (actualmente **2**).

## Alcance de datos

| Tipo IMDb | Uso en KPIs de cine | Uso en recomendación |
|-----------|---------------------|----------------------|
| Película  | Sí                  | Sí (perfil + película del día) |
| Serie (show) | No (solo catálogo) | No (por ahora) |
| Capítulo  | No                  | No (ingesta futura) |

## Flujo

1. `user_ratings` + `movies` → `CinephileStatsRow[]`
2. `getUserRecommendationProfile(rows)` → solo filas `movie` → `UserVectorProfile`
3. Candidatos TMDB → `rankCandidates(profile, candidates)`

## Fórmulas (v2)

### Z-Score

\[
z = \frac{x - \mu}{\sigma}
\]

Atribución a **géneros** y **directores**: se promedia el Z por título en ese género/director (no la nota cruda), para medir gusto relativo a tu escala.

### Shrinkage Bayesiano adaptativo

\[
\text{Bayes} = \frac{v}{v+m} R + \frac{m}{v+m} C
\]

- Géneros: `R` = media de Z en el género, `C` = 0, `m = adaptiveShrinkageM(n, 3)`.
- Directores: igual con `m` base 2.
- Con pocos ratings, `m` sube ligeramente (más prior); con historial largo, más peso a tus datos.

### Porcentajes en UI

Los % de afinidad en gráficos salen de **softmax** sobre los Z medios por género (siempre positivos y suman ~100), no de notas crudas.

### Vector de usuario

Eje fijo TMDB (`GENRE_AXIS`); cada índice = `max(0, score Bayesiano del género)`; luego **L2**.

### Similitud del coseno

Entre vector de usuario **U** y candidato **M** (géneros TMDB, L2).

### Score final (candidato)

```
finalScore = cosineAffinity + log10(vote_count) * (vote_average/100) + directorBonus
```

## Literatura y próximos pasos

Referencias útiles para afinar el gusto (sin red social masiva hoy; preparan fases futuras):

| Enfoque | Idea | Aplicación en Doyess |
|---------|------|----------------------|
| **Modelos jerárquicos Bayesianos** (Basu et al., SIGIR 2007) | Prior poblacional + perfil individual; shrinkage cuando hay pocos datos | Ya usamos Bayes + `m` adaptativo; fase 3: prior global entre usuarios (opcional, OSS). |
| **Matchbox** (Stern et al., 2009) | Rasgos usuario/ítem, ratings ordinales, drift temporal | Fase 3: peso por antigüedad de la nota; escala personal por usuario. |
| **Matrix factorization Bayesiana** | Factores latentes con incertidumbre | Fase 4 con muchos usuarios y ratings cruzados. |
| **AMP-CF** (Vargas & Castells, 2023) | Varias “personas” latentes por usuario | Explicaría contrastes (ej. terror vs drama); fase 4 para insights “multi-perfil”. |
| **Content-based + CF híbrido** | Géneros/directores + vecinos | Hoy content-based; TMDB descubrimiento + coseno. |

### Mejoras priorizadas (código)

1. **v2 (hecho):** Z en géneros, shrinkage adaptativo, softmax en UI, KPIs solo películas.
2. **v3:** Decaimiento temporal en agregados (Matchbox-style).
3. **v3:** IDF sobre géneros muy frecuentes (evitar que “Drama” domine por etiquetado).
4. **v4:** Personas múltiples (clustering suave de ratings por género/época).

## Consumidores

- Dashboard (`buildDashboardStats`) — solo `movie` en KPIs
- Película del día (`discoverUnwatchedMovie`)
- Explorar — mismos pools + `rankCandidates`

## Tests

```bash
pnpm test
```
