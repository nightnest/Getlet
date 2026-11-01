#!/usr/bin/env node
/* Zero-dependency static build.
   src/pages/**.html  ->  dist/<slug>/index.html (plain static HTML)
   Tokens: {{include:x}} {{img:key|sizes|class=..|eager}} {{cfg:a.b}} {{tbc}} {{tbc:Label}} {{town}} {{root}} {{link:path}} */
const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const SRC = path.join(ROOT, 'src');
const DIST = path.join(ROOT, 'dist');
const cfg = JSON.parse(fs.readFileSync(path.join(ROOT, 'site-config.json'), 'utf8'));
const images = JSON.parse(fs.readFileSync(path.join(ROOT, 'assets/images/manifest.json'), 'utf8'));

const base = cfg.site.basePath.endsWith('/') ? cfg.site.basePath : cfg.site.basePath + '/';
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const tbcSpan = (label) => esc(label || 'Set out in your written agreement.');
const get = (obj, p) => p.split('.').reduce((o, k) => (o == null ? o : o[k]), obj);
const link = (p) => {
  p = p.replace(/^\/+/, '');
  if (!p) return base;
  const [noHash, hash] = p.split('#');
  const [pth, query] = noHash.split('?');
  const tail = (query ? '?' + query : '') + (hash ? '#' + hash : '');
  if (/\.[a-z0-9]+$/i.test(pth)) return base + pth + tail;
  const clean = pth.endsWith('/') ? pth : pth + '/';
  return base + (cfg.site.cleanUrls ? clean : clean + 'index.html') + tail;
};

const SVG_ICONS = {"receipt": "<path d=\"M6 3.500h12v17l-3-2-3 2-3-2-3 2z\"/><path d=\"M9 8.500h6M9 12h6\"/>","home": "<path d=\"M3.5 11 12 3.8l8.5 7.2\"/><path d=\"M5.5 9.8V20h13V9.8\"/><path d=\"M10 20v-5.5h4V20\"/>", "key": "<circle cx=\"8\" cy=\"15\" r=\"4\"/><path d=\"m11 12 8.5-8.5M16 6.5l2.5 2.5M14 8.5l2 2\"/>", "users": "<circle cx=\"9\" cy=\"8\" r=\"3.2\"/><path d=\"M3 19.5c.4-3.3 3-5.2 6-5.2s5.600 1.900 6 5.200\"/><circle cx=\"17.200\" cy=\"9\" r=\"2.400\"/><path d=\"M17.500 14.200c2.300.2 3.800 1.700 4.200 4\"/>", "pound": "<circle cx=\"12\" cy=\"12\" r=\"9\"/><path d=\"M14.800 8.200c-.5-1-1.500-1.600-2.700-1.600-1.700 0-2.900 1.200-2.900 2.900 0 1.100.3 1.900.3 3 0 1-.5 1.800-1.400 2.400h6.300M8.300 12.300h5\"/>", "wrench": "<path d=\"M14.700 6.300a4 4 0 0 0 4.900 4.900l-9.500 9.500a2.100 2.100 0 0 1-3-3l9.500-9.500a4 4 0 0 0-1.900-1.900z\"/>", "flame": "<path d=\"M12 3c.5 3-3.500 5-3.500 9a3.500 3.500 0 0 0 7 0c0-1.500-.7-2.300-1.300-3.200C13.500 7.800 12.300 6 12 3z\"/><path d=\"M12 21a2 2 0 0 0 2-2c0-1.200-1.200-1.800-2-3-.8 1.200-2 1.800-2 3a2 2 0 0 0 2 2z\"/>", "bolt": "<path d=\"M13 3 5 13.500h6L10 21l8-10.500h-6z\"/>", "report": "<path d=\"M6 3.500h9l4 4V20.500H6z\"/><path d=\"M14.500 3.500V8H19M9 13h7M9 16.500h7M9 10h2.500\"/>", "shield": "<path d=\"M12 3 4.500 6v5.500c0 4.500 3 7.800 7.500 9.500 4.500-1.700 7.500-5 7.500-9.500V6z\"/><path d=\"m8.800 12 2.300 2.300 4.200-4.600\"/>", "clock": "<circle cx=\"12\" cy=\"12\" r=\"9\"/><path d=\"M12 7v5.200l3.500 2\"/>", "phone": "<path d=\"M6.500 3.500h3l1.500 4-2 1.300a11 11 0 0 0 5.200 5.200l1.300-2 4 1.500v3a2 2 0 0 1-2.200 2A16.500 16.500 0 0 1 4.500 5.700a2 2 0 0 1 2-2.200z\"/>", "mail": "<rect x=\"3.500\" y=\"5.500\" width=\"17\" height=\"13\" rx=\"2\"/><path d=\"m4 7 8 6 8-6\"/>", "check": "<path d=\"m5 12.500 4.500 4.500L19 7.500\"/>", "search": "<circle cx=\"10.500\" cy=\"10.500\" r=\"6.500\"/><path d=\"m15.500 15.500 5 5\"/>", "megaphone": "<path d=\"M4 10v4a1 1 0 0 0 1 1h2.500l7 4V5l-7 4H5a1 1 0 0 0-1 1z\"/><path d=\"M18 9.500a3.500 3.500 0 0 1 0 5\"/>", "file": "<path d=\"M6 3.500h8l4.500 4.500V20.500H6z\"/><path d=\"M14 3.500V8h4.500M9 13h6M9 16.500h6\"/>", "calendar": "<rect x=\"3.500\" y=\"5\" width=\"17\" height=\"15.500\" rx=\"2\"/><path d=\"M3.500 10h17M8 3v4M16 3v4\"/>", "building": "<path d=\"M5 20.500V4.500h9v16M14 9.500h5v11M3.500 20.500h17M8 8h3M8 11.500h3M8 15h3\"/>", "globe": "<circle cx=\"12\" cy=\"12\" r=\"9\"/><path d=\"M3 12h18M12 3c2.600 2.600 3.800 5.600 3.800 9s-1.200 6.400-3.800 9c-2.600-2.600-3.800-5.600-3.800-9S9.400 5.600 12 3z\"/>", "layers": "<path d=\"m12 3.500 9 4.500-9 4.500L3 8z\"/><path d=\"m3 12.500 9 4.500 9-4.500M3 16.500l9 4.500 9-4.500\"/>", "refresh": "<path d=\"M20 12a8 8 0 0 1-14 5.300M4 12a8 8 0 0 1 14-5.300\"/><path d=\"M18.500 3v4h-4M5.500 21v-4h4\"/>", "clipboard": "<rect x=\"5.500\" y=\"4.500\" width=\"13\" height=\"16.500\" rx=\"2\"/><path d=\"M9 4.500V3.500h6v1M8.500 11h7M8.500 14.500h7M8.500 18h4\"/>", "alert": "<path d=\"M12 3.500 21.500 20h-19z\"/><path d=\"M12 10v4.500M12 17.500v.1\"/>", "camera": "<path d=\"M4 8h3l1.500-2.500h7L17 8h3v11H4z\"/><circle cx=\"12\" cy=\"13.500\" r=\"3.500\"/>", "inbox": "<path d=\"M3.500 13.500 6.500 5h11l3 8.500V19h-17z\"/><path d=\"M3.500 13.500H8a4 4 0 0 0 8 0h4.500\"/>", "arrow": "<path d=\"M5 12h14M13 6l6 6-6 6\"/>", "send": "<path d=\"M21 3 10 14M21 3l-7 18-4-7-7-4z\"/>", "wallet": "<path d=\"M4 7.500A2.500 2.500 0 0 1 6.500 5H19v14H6.500A2.500 2.500 0 0 1 4 16.500z\"/><path d=\"M19 9.500h-4a2 2 0 0 0 0 4h4\"/>", "heart": "<path d=\"M12 20s-7.500-4.600-7.500-10.200A4.300 4.300 0 0 1 12 7.500a4.300 4.300 0 0 1 7.500 2.300C19.500 15.400 12 20 12 20z\"/>", "bank": "<path d=\"M3.500 9 12 4l8.500 5M5.500 10v8M10 10v8M14 10v8M18.500 10v8M3.500 20.500h17\"/>"};
const ICONS = {"facebook": "<svg viewBox=\"0 0 24 24\" width=\"20\" height=\"20\" aria-hidden=\"true\"><path fill=\"currentColor\" d=\"M13.5 21v-7.5h2.6l.4-3h-3V8.6c0-.9.3-1.5 1.5-1.5h1.6V4.4c-.3 0-1.2-.1-2.3-.1-2.3 0-3.9 1.4-3.9 4v2.2H7.8v3h2.6V21h3.1z\"/></svg>", "instagram": "<svg viewBox=\"0 0 24 24\" width=\"20\" height=\"20\" aria-hidden=\"true\"><rect x=\"4\" y=\"4\" width=\"16\" height=\"16\" rx=\"4.5\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\"/><circle cx=\"12\" cy=\"12\" r=\"3.6\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\"/><circle cx=\"16.8\" cy=\"7.2\" r=\"1.1\" fill=\"currentColor\"/></svg>", "tiktok": "<svg viewBox=\"0 0 24 24\" width=\"20\" height=\"20\" aria-hidden=\"true\"><path fill=\"currentColor\" d=\"M16.6 4c.3 1.9 1.4 3.2 3.4 3.4v2.7c-1.2.1-2.3-.3-3.4-1v5.6c0 3.5-2.6 5.5-5.3 5.3-3-.2-4.9-3-4-5.8.7-2.1 2.7-3.2 4.7-2.9v2.8c-.3-.1-.6-.1-.9 0-1 .3-1.5 1.4-1.1 2.3.4.9 1.4 1.2 2.3.8.7-.3 1-1 1-1.8V4h3.3z\"/></svg>", "linkedin": "<svg viewBox=\"0 0 24 24\" width=\"20\" height=\"20\" aria-hidden=\"true\"><path fill=\"currentColor\" d=\"M5 9h3v10H5zM6.5 4.5a1.8 1.8 0 1 1 0 3.6 1.8 1.8 0 0 1 0-3.6zM10 9h2.9v1.4c.5-.9 1.6-1.6 3.1-1.6 3 0 3.6 2 3.6 4.6V19h-3v-5c0-1.2-.1-2.6-1.7-2.6S13 12.7 13 14v5h-3z\"/></svg>"};
const read = (rel) => fs.readFileSync(path.join(SRC, rel), 'utf8');
const partials = {};
for (const f of fs.readdirSync(path.join(SRC, 'partials'))) partials[f.replace(/\.html$/, '')] = read('partials/' + f);

function picture(key, args) {
  const m = images[key];
  if (!m) throw new Error('Unknown image key: ' + key);
  let sizes = '100vw', cls = '', eager = false;
  for (const a of args) {
    if (a === 'eager') eager = true;
    else if (a.startsWith('class=')) cls = a.slice(6);
    else sizes = a;
  }
  const srcset = (ext) => m.widths.map((w) => `${base}assets/images/${key}-${w}.${ext} ${w}w`).join(', ');
  const fallback = `${base}assets/images/${key}-1280.jpg`;
  const load = eager ? 'fetchpriority="high"' : 'loading="lazy" decoding="async"';
  return `<picture><source type="image/webp" srcset="${srcset('webp')}" sizes="${esc(sizes)}"><img src="${fallback}" width="${m.w}" height="${m.h}" alt="${esc(m.alt)}" ${load}${cls ? ` class="${cls}"` : ''}></picture>`;
}

function render(tpl, ctx) {
  let out = tpl;
  for (let i = 0; i < 4; i++) {
    out = out.replace(/\{\{include:([\w-]+)\}\}/g, (_, n) => {
      if (!(n in partials)) throw new Error('Missing partial ' + n);
      return partials[n];
    });
  }
  out = out.replace(/\{\{img:([^}]+)\}\}/g, (_, spec) => {
    const [key, ...args] = spec.split('|');
    return picture(key.trim(), args.map((s) => s.trim()));
  });
  out = out.replace(/\{\{icon:([\w-]+)\}\}/g, (_, n) => {
    if (!SVG_ICONS[n]) throw new Error('Unknown icon ' + n);
    return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${SVG_ICONS[n]}</svg>`;
  });
  out = out.replace(/\{\{tbc(?::([^}]+))?\}\}/g, (_, l) => tbcSpan(l));
  out = out.replace(/\{\{cfg:([\w.]+)(?:\|([^}]+))?\}\}/g, (_, p, label) => {
    const v = get(cfg, p);
    return v === '' || v == null ? tbcSpan(label) : esc(v);
  });
  out = out.replace(/\{\{link:([^}]*)\}\}/g, (_, p) => link(p.trim()));
  out = out.replace(/\{\{town\}\}/g, esc(cfg.site.serviceArea));
  out = out.replace(/\{\{root\}\}/g, base);
  out = out.replace(/\{\{brand\}\}/g, esc(cfg.brand.name));
  out = out.replace(/\{\{reviewed\}\}/g, esc(cfg.site.lastReviewedCompliance));
  for (const [k, v] of Object.entries(ctx || {})) out = out.split(`{{${k}}}`).join(v);
  const left = out.match(/\{\{[^}]+\}\}/g);
  if (left) throw new Error('Unresolved tokens: ' + [...new Set(left)].join(', '));
  return out;
}

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? walk(path.join(dir, e.name)) : [path.join(dir, e.name)]);
}
function copyDir(from, to) {
  fs.mkdirSync(to, { recursive: true });
  for (const e of fs.readdirSync(from, { withFileTypes: true })) {
    const a = path.join(from, e.name), b = path.join(to, e.name);
    if (e.isDirectory()) copyDir(a, b); else fs.copyFileSync(a, b);
  }
}

// ---- clean + assets
fs.rmSync(DIST, { recursive: true, force: true });
fs.mkdirSync(DIST, { recursive: true });
copyDir(path.join(ROOT, 'assets'), path.join(DIST, 'assets'));
fs.rmSync(path.join(DIST, 'assets/images/manifest.json'), { force: true });
// root-level files (e.g. Search Console verification) are copied to the dist root as-is
if (fs.existsSync(path.join(ROOT, 'static'))) for (const f of fs.readdirSync(path.join(ROOT, 'static'))) fs.copyFileSync(path.join(ROOT, 'static', f), path.join(DIST, f));

// client-side runtime config (only what the browser needs; no secrets)
const clientCfg = {
  brand: cfg.brand.name,
  forms: { mode: cfg.forms.mode, endpoint: cfg.forms.endpoint },
  email: cfg.contact.email,
  leadsEmail: cfg.forms.leadsEmail || cfg.contact.email,
  gaMeasurementId: cfg.analytics.gaMeasurementId,
  base,
  phone: cfg.contact.phone
};
fs.writeFileSync(path.join(DIST, 'assets/js/config.js'), 'window.GETLET_CONFIG=' + JSON.stringify(clientCfg) + ';\n');

function socialList() {
  const items = Object.entries(cfg.social).filter(([k, v]) => v && ICONS[k]).map(([k, v]) =>
    `<li><a href="${esc(v)}" rel="noopener" target="_blank" aria-label="${cfg.brand.name} on ${k[0].toUpperCase() + k.slice(1)}">${ICONS[k]}</a></li>`);
  return items.length ? `<ul class="social-list">${items.join('')}</ul>` : '';
}
function contactList() {
  const c = cfg.contact, items = [];
  if (c.phone) items.push(`<li>Phone: <a href="tel:${esc(c.phone.replace(/\s+/g, ''))}" data-track="phone_click">${esc(c.phone)}</a></li>`);
  if (c.email) items.push(`<li>Email: <a href="mailto:${esc(c.email)}">${esc(c.email)}</a></li>`);
  if (c.address) items.push(`<li>Address: ${esc(c.address)}</li>`);
  return `<ul class="contact-list">${items.join('')}</ul>`;
}

// ---- pages
const layout = read('layout.html');
const pages = [];
for (const file of walk(path.join(SRC, 'pages')).filter((f) => f.endsWith('.html'))) {
  const raw = fs.readFileSync(file, 'utf8');
  const m = raw.match(/^<!--meta\s*([\s\S]*?)-->\s*/);
  if (!m) throw new Error('No meta block in ' + file);
  const meta = JSON.parse(m[1]);
  const body = raw.slice(m[0].length);
  const slug = meta.slug; // '' for home, 'services', 'landlords/overseas', '404'
  const is404 = slug === '404';
  const url = cfg.site.siteUrl.replace(/\/$/, '') + (slug && !is404 ? '/' + slug + '/' : '/');
  const ogKey = meta.ogImage || 'og-default';
  const ogUrl = cfg.site.siteUrl.replace(/\/$/, '') + '/assets/images/' + (ogKey === 'og-default' ? 'og-default.jpg' : ogKey + '-1280.jpg');
  const nav = meta.nav || '';
  const navCls = (n) => (n === nav ? ' aria-current="page"' : '');
  const ctx = {
    title: esc(meta.title),
    description: esc(meta.description),
    canonical: is404 ? '' : `<link rel="canonical" href="${url}">`,
    robots: meta.noindex || is404 ? '<meta name="robots" content="noindex">' : '',
    ogUrl: url,
    ogImage: ogUrl,
    bodyClass: meta.bodyClass || '',
    pageKey: slug || 'home',
    navHome: navCls('home'), navServices: navCls('services'), navPlans: navCls('plans'),
    navHow: navCls('how'), navAbout: navCls('about'), navContact: navCls('contact'),
    stickyCta: meta.noStickyCta ? '' : '<a class="sticky-cta" href="' + link('contact/?audience=landlord#landlord-form') + '" data-cta="sticky_valuation">Book a Rental Valuation</a>',
    schema: '',
    socialList: socialList(),
    hoursLine: cfg.contact.openingHours ? `<p class="stat-note">Opening hours: ${esc(cfg.contact.openingHours)}</p>` : '',
    contactList: contactList()
  };
  if (cfg.structuredData.localBusinessEnabled && cfg.contact.address && cfg.contact.phone) {
    ctx.schema = '<script type="application/ld+json">' + JSON.stringify({
      '@context': 'https://schema.org', '@type': 'RealEstateAgent', name: cfg.brand.name, url: cfg.site.siteUrl,
      telephone: cfg.contact.phone, address: cfg.contact.address
    }) + '</script>';
  }
  const content = render(body, ctx);
  const html = render(layout, { ...ctx, content });
  const outPath = is404 ? path.join(DIST, '404.html') : path.join(DIST, slug, 'index.html');
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, html);
  pages.push({ slug, url, title: meta.title, keyword: meta.keyword || '', is404, noindex: !!meta.noindex });
}

// ---- sitemap + robots
const sm = pages.filter((p) => !p.is404 && !p.noindex).sort((a, b) => a.slug.localeCompare(b.slug))
  .map((p) => `  <url><loc>${p.url}</loc></url>`).join('\n');
fs.writeFileSync(path.join(DIST, 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${sm}\n</urlset>\n`);
fs.writeFileSync(path.join(DIST, 'robots.txt'),
  `User-agent: *\nAllow: /\nSitemap: ${cfg.site.siteUrl.replace(/\/$/, '')}/sitemap.xml\n`);

// ---- README image table
const readmePath = path.join(ROOT, 'README.md');
if (fs.existsSync(readmePath)) {
  const rows = Object.entries(images).map(([k, m]) =>
    `| \`assets/images/${k}-*.webp/.jpg\` | [${m.source.replace('https://', '')}](${m.source}) | ${m.photographer} | ${m.licence} | ${m.used} |`).join('\n');
  const table = `<!-- IMAGE-TABLE-START -->\n| File | Source URL | Photographer | Licence | Where used |\n|---|---|---|---|---|\n${rows}\n<!-- IMAGE-TABLE-END -->`;
  const r = fs.readFileSync(readmePath, 'utf8');
  fs.writeFileSync(readmePath, r.replace(/<!-- IMAGE-TABLE-START -->[\s\S]*<!-- IMAGE-TABLE-END -->/, table));
}
fs.writeFileSync(path.join(DIST, '.pages.json'), JSON.stringify(pages, null, 1));
console.log(`Built ${pages.length} pages -> dist/`);
