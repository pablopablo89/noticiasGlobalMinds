// Arma el reporte semanal por mail a partir de data/noticias.json.
//
// Formato aprobado: saludo, contador, "El detalle" por autor (titular linkeado + fuente y fecha)
// y cierre. Sin bloque de críticas y sin botón al dashboard. Solo incluye lo publicable (pub >= 55).
//
// El rango va del inicio de la semana (sábado) hasta HOY (hora de Buenos Aires), sin pasar del
// viernes de cierre: si se manda un jueves dice "del 5 al 10", si se manda el viernes "del 5 al 11".
//
// Uso:   node scripts/reporte-semanal.js [repo] [salida.html] [salida.txt]
// Imprime en la primera línea:  ASUNTO: <asunto>
// Termina con código 2 si no hay notas publicables (en ese caso no hay que mandar nada).

const fs = require('fs');
const path = require('path');
const [repo = '.', outHtml = 'reporte.html', outTxt = 'reporte.txt'] = process.argv.slice(2);
const news = JSON.parse(fs.readFileSync(path.join(repo, 'data', 'noticias.json'), 'utf8'));

const MES = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'];
const MESL = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
const esc = s => String(s == null ? '' : s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
const parts = d => d.split('-').map(Number);
const corta = d => { const [, m, dd] = parts(d); return dd + ' ' + MES[m-1]; };
const barra = d => { const [, m, dd] = parts(d); return dd + '/' + m; };

// Hoy en Buenos Aires, como YYYY-MM-DD
const hoy = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Argentina/Buenos_Aires', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
const inicio = news.week.start;
const fin = hoy < news.week.end ? hoy : news.week.end;

const [, mi, di] = parts(inicio);
const [, mf, df] = parts(fin);
const RANGO = mi === mf
  ? di + ' al ' + df + ' de ' + MESL[mf-1]
  : di + ' de ' + MESL[mi-1] + ' al ' + df + ' de ' + MESL[mf-1];
const ASUNTO = 'Monitoreo de noticias Global Minds - Reporte semanal - ' + barra(inicio) + ' al ' + barra(fin);

const items = news.items.filter(n => (n.pub || 0) >= 55);
if (!items.length) { console.log('ASUNTO: ' + ASUNTO); console.error('No hay notas publicables: no mandar el reporte.'); process.exit(2); }

const byA = {};
items.forEach(n => { (byA[n.author] = byA[n.author] || []).push(n); });
const autores = Object.keys(byA).sort((a, b) => byA[b].length - byA[a].length || a.localeCompare(b, 'es'));
autores.forEach(a => byA[a].sort((x, y) => (y.pub || 0) - (x.pub || 0) || new Date(y.date) - new Date(x.date)));

const F = 'font-family:Helvetica,Arial,sans-serif';

const bloque = autores.map(a => {
  const arr = byA[a];
  const filas = arr.map(n =>
    '        <tr><td style="padding:0 0 12px">\n' +
    '          <a href="' + esc(n.url) + '" style="' + F + ';font-size:14px;line-height:20px;color:#1946E3;text-decoration:none">' + esc(n.headline) + '</a><br>\n' +
    '          <span style="' + F + ';font-size:12px;line-height:18px;color:#6B7280">' + esc(n.source) + ' &middot; ' + corta(n.date) + '</span>\n' +
    '        </td></tr>').join('\n');
  return '  <tr><td style="padding:0 0 6px">\n' +
    '    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-top:1px solid #E5E7EB">\n' +
    '      <tr><td style="padding:16px 0 10px">\n' +
    '        <span style="' + F + ';font-size:14px;font-weight:bold;color:#0A0A0A">' + esc(a) + '</span>\n' +
    '        <span style="' + F + ';font-size:12px;color:#9CA3AF">&nbsp;&middot;&nbsp;' + arr.length + ' ' + (arr.length === 1 ? 'nota' : 'notas') + '</span>\n' +
    '      </td></tr>\n' + filas + '\n' +
    '    </table>\n' +
    '  </td></tr>';
}).join('\n');

const html =
'<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:#ffffff">\n' +
'<tr><td align="center" style="padding:24px 12px">\n' +
'<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="560" style="max-width:560px;width:100%">\n\n' +
'  <tr><td style="padding-bottom:16px;border-bottom:1px solid #E5E7EB">\n' +
'    <span style="' + F + ';font-size:16px;font-weight:bold;color:#0A0A0A;letter-spacing:-0.2px">Monitoreo de noticias Global Minds</span>\n' +
'  </td></tr>\n\n' +
'  <tr><td style="padding-top:28px">\n' +
'    <p style="' + F + ';font-size:15px;line-height:24px;color:#0A0A0A;margin:0 0 16px">Hola equipo. Espero que est&eacute;n muy bien.</p>\n' +
'    <p style="' + F + ';font-size:15px;line-height:24px;color:#0A0A0A;margin:0 0 24px">Les env&iacute;o el resumen de las noticias semanales de nuestros Global Minds &mdash; <b style="color:#0A0A0A">' + RANGO + '</b>.</p>\n' +
'  </td></tr>\n\n' +
'  <tr><td style="padding-bottom:8px">\n' +
'    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border:1px solid #E5E7EB;border-radius:10px">\n' +
'      <tr><td style="padding:18px">\n' +
'        <span style="' + F + ';font-size:30px;font-weight:bold;color:#0A0A0A;line-height:32px">' + items.length + '</span><br>\n' +
'        <span style="' + F + ';font-size:12px;color:#6B7280;letter-spacing:0.6px;text-transform:uppercase">Noticias nuevas monitoreadas &middot; ' + autores.length + ' ' + (autores.length === 1 ? 'autor' : 'autores') + '</span>\n' +
'      </td></tr>\n' +
'    </table>\n' +
'  </td></tr>\n\n' +
'  <tr><td style="padding:26px 0 4px">\n' +
'    <span style="' + F + ';font-size:12px;font-weight:bold;color:#6B7280;letter-spacing:0.8px;text-transform:uppercase">El detalle</span>\n' +
'  </td></tr>\n\n' +
bloque + '\n\n' +
'  <tr><td style="padding:26px 0 0;border-top:1px solid #E5E7EB">\n' +
'    <p style="' + F + ';font-size:15px;line-height:24px;color:#0A0A0A;margin:0">Un abrazo, buen fin de semana.</p>\n' +
'  </td></tr>\n\n' +
'</table>\n' +
'</td></tr>\n' +
'</table>';

const texto =
'Hola equipo. Espero que estén muy bien.\n\n' +
'Les envío el resumen de las noticias semanales de nuestros Global Minds - ' + RANGO + '.\n\n' +
items.length + ' noticias nuevas monitoreadas (' + autores.length + ' ' + (autores.length === 1 ? 'autor' : 'autores') + ').\n\n' +
'EL DETALLE\n' +
autores.map(a => '\n' + a + ' (' + byA[a].length + ')\n' +
  byA[a].map(n => '  - ' + n.headline + '\n    ' + n.source + ' - ' + corta(n.date) + ' - ' + n.url).join('\n')).join('\n') +
'\n\nUn abrazo, buen fin de semana.';

// Controles: compatibilidad con Gmail y exclusiones
const bad = [/display:\s*flex/i, /display:\s*grid/i, /<img/i];
bad.forEach(r => { if (r.test(html)) { console.error('HTML incompatible con Gmail: ' + r); process.exit(1); } });
const sinFont = (html.match(/<(p|span|a|div)\b(?![^>]*font-family)[^>]*>/g) || []);
if (sinFont.length) { console.error('Etiquetas sin font-family: ' + sinFont.length); process.exit(1); }
if (/maciel/i.test(html)) { console.error('Aparece Maciel: no mandar.'); process.exit(1); }

fs.writeFileSync(outHtml, html);
fs.writeFileSync(outTxt, texto);
console.log('ASUNTO: ' + ASUNTO);
console.log('RANGO: ' + RANGO + ' | notas: ' + items.length + ' | autores: ' + autores.length);
