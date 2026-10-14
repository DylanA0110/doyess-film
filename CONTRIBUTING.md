# Contribuir a Doyess Film

Gracias por interesarte en el proyecto. Este repositorio es un laboratorio personal de cine con motor de recomendación transparente (TypeScript).

## Ramas

- `feat/descripcion-corta` — nueva funcionalidad
- `fix/descripcion` — corrección de bugs
- `docs/...` — documentación
- `chore/...` — tooling, dependencias

## Commits

Usa [Conventional Commits](https://www.conventionalcommits.org/):

- `feat: añade carril Explorar por director`
- `fix: corrige Z-score con stdDev cero`
- `test: cubre bayesianAverage`
- `docs: actualiza recommendation-engine`

## Pull requests

1. Describe el cambio y adjunta capturas si toca UI.
2. Ejecuta antes de abrir el PR:

```bash
pnpm lint
pnpm exec tsc --noEmit
pnpm test
```

3. Cambios en `lib/recommendation/` deben incluir o actualizar tests en `lib/recommendation/*.test.ts`.
4. Si modificas fórmulas, incrementa `ALGORITHM_VERSION` en `lib/recommendation/types.ts`.

## Etiquetas de Issues (GitHub)

| Etiqueta | Uso |
|----------|-----|
| `good first issue` | Docs, copy, tests pequeños |
| `help wanted` | UI, animaciones, Explorar |
| `algorithm` | Motor Bayes / Z / coseno |
| `supabase` | SQL, RLS, migraciones |

## Áreas sensibles

- `lib/recommendation/` — motor matemático
- `supabase/` — esquema y migraciones
- Auth y rutas API

Abre un issue antes de refactors grandes.
