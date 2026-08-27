# Noticias Global Minds — Dashboard (NODS)

Sitio estático (deploy en Vercel) con tres pestañas para el monitoreo de los 20 autores de Global Minds:

- **Urgencias reales** — solo lo crítico (riesgo reputacional, niveles Rojo/Naranja). **Acumulativo**: las críticas nunca se archivan, las nuevas quedan arriba.
- **Noticias Global Minds** — todas las menciones de la corrida actual, con filtros por autor, tipo e institución.
- **Archivadas** — snapshots de las corridas anteriores de noticias.

## Estructura

```
global-minds-dashboard/
├─ index.html               # la app (una sola página, sin build)
├─ vercel.json              # config de deploy
├─ assets/nods-logo.png
├─ data/
│  ├─ urgencias.json        # pestaña Urgencias (acumulativo)
│  ├─ noticias.json         # pestaña Noticias (corrida actual)
│  └─ history/
│     ├─ index.json         # índice de corridas archivadas
│     └─ <fecha>-noticias.json
└─ server.js                # solo para preview local (gitignored, no se usa en Vercel)
```

No hay build ni dependencias: es HTML + JS que lee los JSON con `fetch`.

## Deploy en Vercel

- Framework Preset: **Other** (importante — si queda en "Node" el build falla con
  `No entrypoint found`, porque busca un `server.js` que no está en el repo).
- Build Command y Output Directory: vacíos.

Cada `git push` al repo redeploya solo.

## Automatización (rutinas en la nube)

Corren en la nube de Anthropic — **no requieren tener la PC encendida**.

| Rutina | Cuándo | Qué hace |
|---|---|---|
| Critical Watch | Lun y Mié, 08:00 (BA) | Actualiza el dashboard |
| Viernes: actualizar + enviar | Vie, 08:00 (BA) | Actualiza el dashboard **y después** envía el reporte por Gmail |
| Auto-archivar alertas | Cada 4 h | Etiqueta `GMP` + archiva las alertas del inbox |

La corrida lee el Gmail (Google Alerts + Talkwalker), archiva las noticias de la corrida anterior
en `data/history/`, reescribe `noticias.json`, **agrega** las críticas nuevas arriba de
`urgencias.json`, y hace commit + push → Vercel redeploya.

En la rutina del viernes, si la actualización falla el mail **no** se envía (para no reportar
datos desactualizados).

### Formato de datos

`data/urgencias.json`
```json
{ "updated": "27 ago 2026 · 15:10 (BA)", "sample": false,
  "items": [ { "level":"rojo|naranja", "score":88, "author":"…", "priority":"P0",
    "vertical":"…", "headline":"…", "source":"…", "date":"2026-08-28",
    "url":"https://…", "why":"controversy · polémica", "action":"…" } ] }
```

`data/noticias.json`
```json
{ "updated":"27 ago 2026 · 15:10 (BA)", "sample": false,
  "items": [ { "author":"…", "priority":"P0|P1|P2", "institution":true,
    "type":"Prensa|Social|Research|Evento", "sentiment":"positive|neutral|negative",
    "headline":"…", "source":"…", "date":"2026-08-27", "url":"https://…",
    "note":"observación editorial opcional" } ] }
```

`data/history/index.json`
```json
{ "weeks": [ { "date":"2026-08-27", "label":"Corrida del 27 de agosto",
    "newsFile":"2026-08-27-noticias.json", "noticias":17 } ] }
```

Con `"sample": true` en cualquiera de los dos, el sitio muestra un aviso de "datos de ejemplo".

## Preview local

```bash
node server.js   # http://localhost:4321
```
