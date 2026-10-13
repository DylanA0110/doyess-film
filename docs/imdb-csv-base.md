# IMDb CSV Base

Base de referencia para el CSV exportado desde IMDb. Este documento sirve para futuras fases de importación, persistencia y enriquecimiento con TMDB.

## Columnas detectadas

- `Const`: identificador IMDb.
- `Your Rating`: calificación del usuario.
- `Date Rated`: fecha en la que se calificó.
- `Title`: título localizado.
- `Original Title`: título original.
- `URL`: enlace IMDb.
- `Title Type`: tipo de contenido.
- `IMDb Rating`: calificación promedio de IMDb.
- `Runtime (mins)`: duración en minutos.
- `Year`: año de estreno.
- `Genres`: géneros separados por coma.
- `Num Votes`: número de votos.
- `Release Date`: fecha de estreno.
- `Directors`: uno o más directores separados por coma.

## Mapeo interno propuesto

- `Const` -> `imdbId`
- `Your Rating` -> `yourRating`
- `Date Rated` -> `dateRated`
- `Title` -> `title`
- `Original Title` -> `originalTitle`
- `URL` -> `url`
- `Title Type` -> `titleType`
- `IMDb Rating` -> `imdbRating`
- `Runtime (mins)` -> `runtimeMinutes`
- `Year` -> `year`
- `Genres` -> `genres[]`
- `Num Votes` -> `numVotes`
- `Release Date` -> `releaseDate`
- `Directors` -> `directors[]`

## Reglas de importación

- No inventar valores si una celda viene vacía.
- Convertir números y fechas con tolerancia a nulos.
- Separar `Genres` y `Directors` por coma.
- Mantener el CSV como fuente de verdad inicial hasta enriquecerlo con TMDB.

## Uso futuro

- Persistencia en base de datos.
- Cruce con TMDB por título y año.
- Construcción de analítica, recomendaciones y estados vacíos.
