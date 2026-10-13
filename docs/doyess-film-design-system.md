# Doyess Film - Sistema de diseño cinematográfico

## Intención

Doyess Film debe sentirse como una experiencia cinematográfica personal, editorial y sofisticada. No es un dashboard administrativo ni una copia de servicios existentes; es un universo visual de cine construido alrededor de los datos del usuario.

## Principios visuales

- Fondo principal: `#050000`.
- Superficies: `#101009` y `#060704`.
- Acento: `#8A0201`.
- Texto: `#F4F6F3`.
- Tipografía principal: Poppins.
- Composición asimétrica, con ritmo editorial y módulos de alturas distintas.
- Bordes discretos, brillos sutiles y sombras profundas.
- Nada de tarjetas repetidas en masa.

## Lenguaje de interfaz

- Titulares grandes y expresivos.
- Etiquetas compactas para contexto, estado y afinidad.
- Pósteres de TMDB como recurso visual principal.
- Fotogramas panorámicos y mosaicos desenfocados para profundidad narrativa.
- Animaciones suaves, sin exceso de microinteracciones.

## Pantallas del producto

### 1. Dashboard - Mi universo cinematográfico

Objetivo: centro de control personal del cinéfilo.

Debe mostrar:

- saludo personalizado;
- cantidad de películas vistas;
- promedio de puntuación;
- tiempo de pantalla;
- actividad reciente;
- últimos pósteres calificados.

La presentación debe usar números grandes, mini gráficas y bloques editoriales, no dashboards genéricos.

### 2. Para vos - FYP cinematográfico

Objetivo: descubrir películas y series no vistas.

Debe mostrar:

- póster grande;
- sinopsis corta;
- año;
- géneros;
- puntuación de afinidad;
- explicación de por qué podría gustarle al usuario.

Acciones obligatorias:

- `Me gusta`;
- `Ver más tarde`;
- `Descartar`.

### 3. Laboratorio de gustos

Objetivo: convertir historial en análisis visual.

Debe mostrar:

- géneros favoritos;
- evolución de puntuaciones;
- directores mejor valorados;
- actores recurrentes;
- patrones narrativos.

La lectura debe ser clara, con gráficos elegantes y explicaciones breves.

### 4. Mi biblioteca

Objetivo: consultar el historial de forma visual y eficiente.

Debe mostrar:

- buscador;
- filtros;
- orden por puntuación, género, año y director;
- estados: vistas, favoritas, pendientes y descartadas;
- pósteres legibles y navegación rápida.

### 5. Analista de cine con IA

Objetivo: preguntas y respuestas sobre gustos del usuario.

Ejemplos de consultas:

- qué tienen en común mis mejores películas;
- qué director debería descubrir;
- recomendaciones psicológicas poco conocidas;
- qué géneros valoro peor;
- títulos similares con propuesta narrativa distinta.

Las respuestas deben mezclar datos, visualizaciones y explicación cinematográfica.

## Componentes propios

- tarjetas de afinidad;
- chips de géneros;
- barras editoriales de métricas;
- pósters con overlay de contexto;
- bloques de explicación de recomendaciones;
- estados vacíos visuales y atractivos.

## Reglas de implementación

- No inventar estadísticas cuando no existan datos.
- Mostrar estados vacíos claros durante el desarrollo.
- Preparar la interfaz para IMDb, TMDB y recomendaciones híbridas.
- Usar componentes reutilizables.
- Mantener responsive desde el inicio.
- Cada pantalla debe tener personalidad, no solo jerarquía.

## Dirección para IA generativa

Si un modelo debe generar nuevas pantallas o componentes de Doyess Film, debe respetar este orden de prioridad:

1. Claridad funcional.
2. Identidad cinematográfica.
3. Composición editorial.
4. Integración visual con pósters y datos.
5. Minimalismo sofisticado, no UI genérica.
