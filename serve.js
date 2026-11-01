#!/usr/bin/env node
// Tiny zero-dependency static server for ./dist  (node serve.js [port])
const http = require('http'), fs = require('fs'), path = require('path');
const DIST = path.join(__dirname, 'dist');
const port = Number(process.argv[2]) || 8080;
const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.json': 'application/json', '.webp': 'image/webp', '.jpg': 'image/jpeg', '.png': 'image/png', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.xml': 'application/xml', '.txt': 'text/plain', '.ico': 'image/x-icon' };
http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split('?')[0]);
  let f = path.join(DIST, p);
  if (!f.startsWith(DIST)) { res.writeHead(403); return res.end(); }
  if (fs.existsSync(f) && fs.statSync(f).isDirectory()) f = path.join(f, 'index.html');
  if (!fs.existsSync(f)) {
    res.writeHead(404, { 'Content-Type': types['.html'] });
    return res.end(fs.existsSync(path.join(DIST, '404.html')) ? fs.readFileSync(path.join(DIST, '404.html')) : 'Not found');
  }
  res.writeHead(200, { 'Content-Type': types[path.extname(f)] || 'application/octet-stream', 'Cache-Control': 'no-cache' });
  fs.createReadStream(f).pipe(res);
}).listen(port, () => console.log(`GETLET site on http://localhost:${port}`));
