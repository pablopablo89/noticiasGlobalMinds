# Global Minds Intelligence — Dashboard (NODS)

Sitio estático (deploy en Vercel) con dos pestañas para el monitoreo de los 18 autores de Global Minds:

- **🚨 Urgencias reales** — solo lo crítico (riesgo reputacional, niveles Rojo/Naranja).
- **📰 Noticias Global Minds** — todas las menciones, con filtros por autor, tipo e institución.

## Estructura

```
global-minds-dashboard/
├─ index.html          # la app (una sola página, sin build)
├─ vercel.json         # config de deploy (cache de /data)
├─ data/
│  ├─ urgencias.json   # alimenta la pestaña Urgencias
│  └─ noticias.json    # alimenta la pestaña Noticias
└─ server.js           # solo para previsualizar local (no se usa en Vercel)
```

No hay build ni dependencias: es HTML + JS que lee los dos JSON con `fetch`.

## Deploy en Vercel (una vez)

1. Subí esta carpeta a un repo de GitHub.
2. En Vercel → **Add New → Project → Import** el repo.
3. Framework Preset: **Other** · Root Directory: `global-minds-dashboard` (si el repo tiene más cosas) o la raíz.
4. Build Command: *(vacío)* · Output Directory: *(vacío / raíz)*. Deploy.

Cada `git push` al repo redeploya solo.

## Actualización semanal (automática)

La rutina en la nube **"Global Minds · Critical Watch (semanal)"** corre cada lunes, lee el Gmail
(Google Alerts + Talkwalker de los últimos 7 días), clasifica las menciones y **reescribe
`data/urgencias.json` y `data/noticias.json`**, luego hace commit + push → Vercel redeploya.

### Formato de datos

`data/urgencias.json`
```json
{ "week": "Semana 24–31 ago 2026", "updated": "27 ago 2026 · 13:04 UTC",
  "items": [ { "level":"rojo|naranja", "score":88, "author":"…", "priority":"P0",
    "vertical":"…", "headline":"…", "source":"…", "date":"2026-08-28",
    "url":"https://…", "why":"controversy · polémica", "action":"…" } ] }
```

`data/noticias.json`
```json
{ "updated":"27 ago 2026 · 13:04 UTC",
  "items": [ { "author":"…", "priority":"P0|P1|P2", "institution":true,
    "type":"Prensa|Social|Research|Evento", "sentiment":"positive|neutral|negative",
    "headline":"…", "source":"…", "date":"2026-08-27", "url":"https://…" } ] }
```

Con `"sample": true` en cualquiera de los dos, el sitio muestra un aviso de "datos de ejemplo".

## Preview local

```bash
node server.js   # http://localhost:4321
```
