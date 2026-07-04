const http = require('http');
const fs = require('fs');
const path = require('path');

const PUBLIC_DIR = path.resolve(process.argv[2] || '.output/public');
const PORT = parseInt(process.argv[3] || '8080', 10);

const mimeTypes = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.mjs': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.webp': 'image/webp',
  '.webmanifest': 'application/manifest+json',
};

function serveFile(res, filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const contentType = mimeTypes[ext] || 'application/octet-stream';
  fs.readFile(filePath, (err, content) => {
    if (err) {
      if (err.code === 'EISDIR') {
        serveIndexOrFallback(res, filePath);
      } else if (err.code === 'ENOENT') {
        serveFallback(res);
      } else {
        res.writeHead(500);
        res.end('Server error');
      }
      return;
    }
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(content);
  });
}

function serveIndexOrFallback(res, dirPath) {
  fs.readFile(path.join(dirPath, 'index.html'), (err, content) => {
    if (err) {
      serveFallback(res);
    } else {
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(content);
    }
  });
}

function serveFallback(res) {
  fs.readFile(path.join(PUBLIC_DIR, 'index.html'), (err, content) => {
    if (err) {
      res.writeHead(404);
      res.end('Not found');
    } else {
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(content);
    }
  });
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  const pathname = decodeURIComponent(url.pathname);
  const relativePath = pathname === '/' ? 'index.html' : pathname;
  let filePath = path.normalize(path.join(PUBLIC_DIR, relativePath));

  if (!filePath.startsWith(path.normalize(PUBLIC_DIR + path.sep))) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  serveFile(res, filePath);
});

server.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`E2E static server running at http://localhost:${PORT} serving ${PUBLIC_DIR}`);
});
