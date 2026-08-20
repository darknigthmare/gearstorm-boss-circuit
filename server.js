const http = require('node:http');
const { readFile, realpath, stat } = require('node:fs/promises');
const { extname, resolve, sep } = require('node:path');

const PROJECT_ROOT = resolve(__dirname);
const PUBLIC_FILES = new Set([
  'index.html',
  'styles.css',
  'game.js',
  'manifest.webmanifest',
  'sw.js',
  'favicon.ico',
  'robots.txt',
]);
const MIME_TYPES = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.ico': 'image/x-icon',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
  '.webp': 'image/webp',
};
const SECURITY_HEADERS = {
  'Content-Security-Policy': "default-src 'self'; base-uri 'none'; object-src 'none'; frame-ancestors 'none'; form-action 'self'; script-src 'self'; style-src 'self'; img-src 'self' data: blob:; media-src 'self' blob:; connect-src 'self'; worker-src 'self'; manifest-src 'self'",
  'Cross-Origin-Opener-Policy': 'same-origin',
  'Cross-Origin-Resource-Policy': 'same-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=(), usb=()',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
};

function sendText(request, response, statusCode, message, extraHeaders = {}) {
  const body = Buffer.from(message, 'utf8');
  response.writeHead(statusCode, {
    ...SECURITY_HEADERS,
    ...extraHeaders,
    'Content-Type': 'text/plain; charset=utf-8',
    'Content-Length': body.length,
    'Cache-Control': 'no-store',
  });
  response.end(request.method === 'HEAD' ? undefined : body);
}

function resolvePublicFile(rootDir, requestUrl, host) {
  let pathname;
  try {
    pathname = decodeURIComponent(new URL(requestUrl, `http://${host || 'localhost'}`).pathname);
  } catch {
    return { error: 400 };
  }

  if (pathname.includes('\0') || pathname.includes('\\')) return { error: 404 };
  const segments = pathname.split('/').filter(Boolean);
  if (segments.includes('..')) return { error: 404 };

  const relative = pathname === '/' ? 'index.html' : segments.join('/');
  if (!PUBLIC_FILES.has(relative) && !relative.startsWith('assets/')) return { error: 404 };

  const candidate = resolve(rootDir, relative);
  if (candidate !== rootDir && !candidate.startsWith(rootDir + sep)) return { error: 404 };
  return { candidate, relative };
}

function createGameServer(options = {}) {
  const rootDir = resolve(options.rootDir || PROJECT_ROOT);
  const canonicalRoot = realpath(rootDir);

  return http.createServer(async (request, response) => {
    if (request.method !== 'GET' && request.method !== 'HEAD') {
      sendText(request, response, 405, 'Méthode non autorisée', { Allow: 'GET, HEAD' });
      return;
    }

    const resolved = resolvePublicFile(rootDir, request.url || '/', request.headers.host);
    if (resolved.error) {
      sendText(request, response, resolved.error, resolved.error === 400 ? 'Requête invalide' : 'Introuvable');
      return;
    }

    try {
      const [info, canonicalRootDir, canonicalCandidate] = await Promise.all([
        stat(resolved.candidate),
        canonicalRoot,
        realpath(resolved.candidate),
      ]);
      if (!info.isFile()) throw new Error('not a file');
      if (canonicalCandidate !== canonicalRootDir && !canonicalCandidate.startsWith(canonicalRootDir + sep)) {
        throw new Error('symlink outside public root');
      }
      const body = request.method === 'HEAD' ? null : await readFile(canonicalCandidate);

      const extension = extname(canonicalCandidate).toLowerCase();
      const cacheControl = resolved.relative === 'index.html' || resolved.relative === 'sw.js'
        ? 'public, max-age=0, must-revalidate'
        : 'public, max-age=3600, stale-while-revalidate=86400';
      response.writeHead(200, {
        ...SECURITY_HEADERS,
        'Content-Type': MIME_TYPES[extension] || 'application/octet-stream',
        'Content-Length': body?.length ?? info.size,
        'Cache-Control': cacheControl,
      });

      if (request.method === 'HEAD') {
        response.end();
        return;
      }
      response.end(body);
    } catch {
      sendText(request, response, 404, 'Introuvable');
    }
  });
}

if (require.main === module) {
  const host = process.env.HOST || '127.0.0.1';
  const parsedPort = Number(process.env.PORT || 8080);
  const port = Number.isInteger(parsedPort) && parsedPort >= 0 && parsedPort <= 65_535 ? parsedPort : 8080;
  createGameServer().listen(port, host, () => {
    console.log(`GEARSTORM prêt sur http://${host}:${port}`);
  });
}

module.exports = { createGameServer };
