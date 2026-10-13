# Backlog (post-fases iniciales)

## Hecho en fase CSV + estadísticas

- Import IMDb con `newImdbIds` sin resetear caché TMDB en re-import
- TMDB: cola `pending`, estados `ok` / `not_found` / `skipped`, sin re-llamar API si ya terminó
- Capítulos IMDb → póster de la serie (TMDB `tv_episode_results` → show)
- Enriquecimiento automático al importar + un pase silencioso en dashboard si hay novedades
- Resumen: KPIs clicables, Recharts, directores/reparto/10s, footnote discreta sin botón “Sincronizar”

## Siguiente fase

| Tema | Descripción |
|------|-------------|
| Para vos / FYP | `user_interactions`, algoritmo de recomendaciones en Next.js |
| Laboratorio de gustos | Rankings mayor→menor, filtros por tipo de título |
| Re-enriquecimiento manual | Ajustes → forzar TMDB (opcional) |
| Migraciones | Versionar en `supabase/migrations/` |
| `useFeaturedMovies` | Revisar uso; no aplica a la landing pública |
