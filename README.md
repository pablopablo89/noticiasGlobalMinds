# Noticias Global Minds — Dashboard (NODS)

**Objetivo único del monitoreo: detectar y generar contenido de valor, positivo y útil para
nuestras redes sociales.** No hay ningún otro objetivo. El sistema no vigila riesgo
reputacional, no puntúa crisis y no genera alertas: busca material publicable sobre los
19 autores de Global Minds.

Sitio estático (deploy en Vercel), tres pestañas:

- **Para publicar** — el material que sirve para redes, ordenado por valor. Es la vista principal.
- **Todo el monitoreo** — todo lo detectado en la semana, con filtros por autor, formato y utilidad.
- **Archivadas** — las semanas ya cerradas.

## Cómo se evalúa cada nota

Cada item lleva un campo `pub` de 0 a 100: qué tan bien sirve para publicar.

| Rango | Etiqueta | Qué significa |
|---|---|---|
| 80–100 | **Listo para publicar** | Se puede armar el posteo hoy, casi sin trabajo previo |
| 55–79 | **Buen material** | Sirve, pero hay que darle un ángulo o buscarle imagen |
| 0–54 | *(registro)* | No entra a la pestaña de publicar; queda como contexto |

Sube el puntaje: que el autor sea el protagonista y no una cita al pasar; que haya una frase
textual fuerte; contenido propio (entrevista, columna, anuncio, evento con fecha); que esté en
español o portugués; que el medio tenga alcance en LatAm o España; que ya venga con estructura
visual (una lista, un video, imágenes propias).

Baja el puntaje: que el autor aparezca solo mencionado; papers académicos sin traducción;
material sin gancho visual; polémica política; nada que sea negativo sobre el autor.

## Estructura

```
global-minds-dashboard/
├─ index.html               # la app (una sola página, sin build)
├─ vercel.json
├─ assets/nods-logo.png
└─ data/
   ├─ noticias.json         # la semana en curso
   └─ history/
      ├─ index.json         # índice de semanas cerradas
      └─ <inicio>_<fin>.json
```

### Formato de datos

`data/noticias.json`
```json
{ "week": {"start":"2026-08-29","end":"2026-09-04","label":"Del 29 de agosto al 4 de septiembre"},
  "updated": "04 sep 2026 · 08:11 (BA)", "sample": false,
  "items": [ {
    "author":"Anna Lembke",
    "headline":"…", "source":"…", "date":"2026-08-29", "url":"https://…",
    "type":"Prensa|Social|Research|Evento",
    "sentiment":"positive|neutral",
    "pub": 90,
    "format":"Cita|Carrusel|Reel|Video|Nota + link|Dato",
    "angle":"por qué funciona como posteo, en una frase",
    "quote":"cita textual, si la nota trae una buena (opcional)",
    "note":"observación editorial suelta (opcional)"
  } ] }
```

`data/history/index.json`
```json
{ "weeks": [ { "start":"2026-08-22","end":"2026-08-28","label":"Del 22 al 28 de agosto",
    "file":"2026-08-22_2026-08-28.json","noticias":26 } ] }
```

Los archivos de historia guardan `{start, end, label, noticias:[...]}`.

Con `"sample": true` el sitio muestra un aviso de "datos de ejemplo".

## Deploy en Vercel

- Framework Preset: **Other** (importante — si queda en "Node" el build falla con
  `No entrypoint found`, porque busca un `server.js` que no está en el repo).
- Build Command y Output Directory: vacíos.

Cada `git push` al repo redeploya solo.

## Automatización (rutinas en la nube)

Corren en la nube de Anthropic — no requieren tener la PC encendida.

| Rutina | Cuándo | Estado | Qué hace |
|---|---|---|---|
| Critical Watch | Lun y Mié, 08:00 (BA) | activa | Lee las alertas y actualiza el dashboard |
| Viernes: actualizar + enviar | Vie, 08:00 (BA) | **pausada** | Actualizaba y enviaba el reporte por mail |
| Auto-archivar alertas | Cada 4 h | activa | Etiqueta `GMP` y archiva las alertas del inbox |

La semana va de **sábado a viernes**. Las corridas suman al archivo de la semana en curso
(dedupe por url) y la semana se cierra el lunes siguiente.

### Verificación de links (obligatoria en cada corrida)

Google Alerts genera falsos positivos: matchea texto de barras laterales, notas relacionadas
y reproductores de podcast embebidos, no solo el cuerpo de la nota. Antes de guardar cualquier
item, la rutina tiene que extraer la URL real del wrapper `google.com/url?…&url=`, bajar la
página y confirmar que el apellido del autor aparece en el texto. Si no aparece, se descarta.
La fecha sale de `article:published_time` de la página, no del correo.

## Fuera de alcance

Marcial Maciel y los Legionarios de Cristo / Regnum Christi **no se monitorean**. Fueron dados
de baja el 4 de septiembre de 2026. Las rutinas tienen una cláusula de exclusión explícita.
