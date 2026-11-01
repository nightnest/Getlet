#!/usr/bin/env node
/* QA: internal links/assets, external link status, titles/meta/H1, forbidden claims.  node _tools/check.js [--external] */
const fs = require('fs'), path = require('path'), https = require('https'), http = require('http');
const DIST = path.join(__dirname, '..', 'dist');
const external = process.argv.includes('--external');
const problems = [];
const warn = (m) => problems.push(m);

const htmlFiles = [];
(function walk(d) { for (const e of fs.readdirSync(d, { withFileTypes: true })) { const p = path.join(d, e.name); e.isDirectory() ? walk(p) : p.endsWith('.html') && htmlFiles.push(p); } })(DIST);

const exists = (urlPath) => {
  let p = decodeURIComponent(urlPath.split('#')[0].split('?')[0]);
  let f = path.join(DIST, p);
  if (fs.existsSync(f) && fs.statSync(f).isDirectory()) f = path.join(f, 'index.html');
  return fs.existsSync(f);
};
const ext = new Set();
const titles = new Map(), descs = new Map();
const FORBIDDEN = [/guarantee(?!d? (?:standard|that|rent))/i, /years of experience/i, /award[- ]winning/i, /market[- ]leader|leading letting|number one|#1/i, /\bUK-wide law\b/i, /rightmove[^<]{0,40}£\s?500/i, /£\s?150/i];
const ALLOW_GUARANTEE = /not (?:an independently verified )?guarantee|isn.?t a guarantee|never.{0,30}guarantee|no guarantee|not a promise/i;

for (const f of htmlFiles) {
  const rel = path.relative(DIST, f).replace(/\\/g, '/');
  const html = fs.readFileSync(f, 'utf8');
  const text = html.replace(/<script[\s\S]*?<\/script>/g, '').replace(/<style[\s\S]*?<\/style>/g, '');
  const h1 = (text.match(/<h1[\s>]/g) || []).length;
  if (h1 !== 1) warn(`${rel}: ${h1} <h1> elements`);
  const title = (html.match(/<title>([^<]*)<\/title>/) || [])[1];
  const desc = (html.match(/<meta name="description" content="([^"]*)"/) || [])[1];
  if (!title) warn(`${rel}: missing title`); else { if (titles.has(title)) warn(`${rel}: duplicate title with ${titles.get(title)}`); titles.set(title, rel); if (title.length > 70) warn(`${rel}: title ${title.length} chars`); }
  if (!desc) warn(`${rel}: missing description`); else { if (descs.has(desc)) warn(`${rel}: duplicate description`); descs.set(desc, rel); if (desc.length > 170) warn(`${rel}: description ${desc.length} chars`); }
  if (rel !== '404.html' && !/rel="canonical"/.test(html)) warn(`${rel}: missing canonical`);
  if (!/property="og:image"/.test(html)) warn(`${rel}: missing og:image`);
  // heading order
  const hs = [...text.matchAll(/<h([1-6])[\s>]/g)].map((m) => +m[1]);
  for (let i = 1; i < hs.length; i++) if (hs[i] - hs[i - 1] > 1) { warn(`${rel}: heading jump h${hs[i - 1]} -> h${hs[i]}`); break; }
  // images without alt
  for (const m of html.matchAll(/<img\b[^>]*>/g)) if (!/\balt="/.test(m[0])) warn(`${rel}: img without alt`);
  // ids duplicate
  const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]);
  const dup = ids.filter((x, i) => ids.indexOf(x) !== i);
  if (dup.length) warn(`${rel}: duplicate ids ${[...new Set(dup)].join(', ')}`);
  // links + assets
  for (const m of html.matchAll(/\s(?:href|src)="([^"]+)"/g)) {
    const u = m[1];
    if (/^(mailto:|tel:|javascript:|data:|#)/.test(u)) continue;
    if (/^https?:\/\//.test(u)) { if (!/example\.com/.test(u)) ext.add(u); continue; }
    if (u.startsWith('/')) { if (!exists(u)) warn(`${rel}: broken internal ${u}`); }
    else warn(`${rel}: relative URL ${u}`);
    // anchor target exists?
    if (u.includes('#') && u.startsWith('/')) {
      const [p, h] = u.split('#'); const target = p && p !== '/' ? p : '';
      const file = target ? path.join(DIST, target.split('?')[0], 'index.html') : f;
      const dest = (target ? fs.existsSync(file) && fs.readFileSync(file, 'utf8') : html) || '';
      if (h && !new RegExp(`id="${h}"`).test(dest)) warn(`${rel}: anchor #${h} missing on ${target || rel}`);
    }
  }
  for (const m of html.matchAll(/srcset="([^"]+)"/g)) for (const part of m[1].split(',')) { const u = part.trim().split(/\s+/)[0]; if (!exists(u)) warn(`${rel}: broken srcset ${u}`); }
  // forbidden claims
  const plain = text.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
  for (const re of FORBIDDEN) {
    const m = plain.match(new RegExp('.{0,60}' + re.source + '.{0,60}', re.flags));
    if (m && !(re.source.startsWith('guarantee') && ALLOW_GUARANTEE.test(m[0]))) warn(`${rel}: forbidden claim /${re.source}/ near "${m[0].trim()}"`);
  }
  if (/\b(testimonial|5-star|trusted by \d)/i.test(plain)) warn(`${rel}: possible fake social proof`);
}
// sitemap pages exist
const sm = fs.readFileSync(path.join(DIST, 'sitemap.xml'), 'utf8');
for (const m of sm.matchAll(/<loc>([^<]+)<\/loc>/g)) { const p = new URL(m[1]).pathname; if (!exists(p)) warn(`sitemap: ${p} missing`); }

(async () => {
  if (external) {
    const check = (u) => new Promise((res) => {
      const lib = u.startsWith('https') ? https : http;
      const req = lib.request(u, { method: 'GET', headers: { 'User-Agent': 'Mozilla/5.0 link-check' }, timeout: 15000 }, (r) => { res([u, r.statusCode]); r.resume(); });
      req.on('error', (e) => res([u, e.code])); req.on('timeout', () => { req.destroy(); res([u, 'timeout']); }); req.end();
    });
    for (const u of ext) { const [, s] = await check(u); const ok = typeof s === 'number' && s < 400; console.log((ok ? 'OK   ' : 'FAIL ') + s + ' ' + u); if (!ok) warn(`external ${s}: ${u}`); }
  }
  console.log(`Checked ${htmlFiles.length} pages, ${ext.size} external links.`);
  if (problems.length) { console.log('\nPROBLEMS:\n' + problems.map((p) => ' - ' + p).join('\n')); process.exitCode = 1; } else console.log('No problems found.');
})();
