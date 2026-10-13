# Exportar calificaciones desde IMDb

Guía para obtener el CSV que Doyess Film importa en el dashboard. La importación es **opcional**: sin archivo, el panel permanece vacío.

## Paso 1 — Exportar desde tu historial

1. Inicia sesión en [IMDb](https://www.imdb.com/).
2. Abre **Tu historial de calificaciones** (películas y series que has calificado).
3. Arriba a la derecha, abre **Acciones** (icono ⋮).
4. Elige **Exportar**.

![Menú Exportar en IMDb](/landing/imdb-export-step-1.png)

## Paso 2 — Descargar el archivo

1. Ve a [Tus exportaciones](https://www.imdb.com/es/exports).
2. En la lista **Your ratings**, pulsa **Listo** (icono de descarga).
3. Guarda el `.csv` en tu equipo.

![Descarga en Tus exportaciones](/landing/imdb-export-step-2.png)

## Paso 3 — Subir en Doyess Film

1. Inicia sesión en Doyess Film con Google.
2. En el dashboard, pulsa **Cargar CSV** o **Importar CSV de IMDb**.
3. Selecciona el archivo descargado.

Solo se importan filas con calificación del 1 al 10. El formato de columnas está documentado en [imdb-csv-base.md](./imdb-csv-base.md).
