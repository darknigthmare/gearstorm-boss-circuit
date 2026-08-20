import assert from 'node:assert/strict';
import { stat } from 'node:fs/promises';
import { createRequire } from 'node:module';
import test from 'node:test';

const require = createRequire(import.meta.url);
const { createGameServer } = require('../server.js');

async function withServer(run) {
  const server = createGameServer();
  assert.equal(server.listening, false, 'L import du serveur ne doit pas ouvrir de port.');
  await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', resolve);
  });
  const { port } = server.address();
  try {
    await run(`http://127.0.0.1:${port}`);
  } finally {
    await new Promise((resolve, reject) => server.close(error => error ? reject(error) : resolve()));
  }
}

test('le serveur livre le jeu avec la politique de securite complete', async () => {
  await withServer(async origin => {
    const response = await fetch(origin + '/');
    assert.equal(response.status, 200);
    assert.match(response.headers.get('content-type'), /text\/html/);
    assert.equal(response.headers.get('cache-control'), 'public, max-age=0, must-revalidate');
    assert.equal(response.headers.get('x-content-type-options'), 'nosniff');
    assert.equal(response.headers.get('x-frame-options'), 'DENY');
    assert.equal(response.headers.get('x-dns-prefetch-control'), 'off');
    assert.equal(response.headers.get('x-permitted-cross-domain-policies'), 'none');
    assert.equal(response.headers.get('origin-agent-cluster'), '?1');
    assert.equal(response.headers.get('cross-origin-resource-policy'), 'same-origin');
    assert.match(response.headers.get('content-security-policy'), /default-src 'self'/);
    assert.match(await response.text(), /GEARSTORM/);
  });
});

test('les fichiers shell non versions sont toujours revalides', async () => {
  await withServer(async origin => {
    for (const path of ['/game.js?release=2.3.0', '/styles.css', '/manifest.webmanifest']) {
      const response = await fetch(origin + path, { method: 'HEAD' });
      assert.equal(response.status, 200, path);
      assert.equal(response.headers.get('cache-control'), 'public, max-age=0, must-revalidate', path);
      assert.equal(await response.text(), '');
    }
    const worker = await fetch(origin + '/sw.js', { method: 'HEAD' });
    assert.equal(worker.status, 200);
    assert.equal(worker.headers.get('service-worker-allowed'), '/');
    assert.equal(worker.headers.get('cache-control'), 'public, max-age=0, must-revalidate');
  });
});

test('HEAD retourne les metadonnees exactes sans corps', async () => {
  await withServer(async origin => {
    const expectedSize = (await stat('game.js')).size;
    const response = await fetch(origin + '/game.js', { method: 'HEAD' });
    assert.equal(response.status, 200);
    assert.equal(Number(response.headers.get('content-length')), expectedSize);
    assert.match(response.headers.get('content-type'), /text\/javascript/);
    assert.equal(await response.text(), '');
  });
});

test('les assets runtime v2.2 restent publics, types et immuables sous app v2.3', async () => {
  await withServer(async origin => {
    const assetPath = '/assets/generated/v2.2.0/arenas/rammer/far.webp';
    const expectedSize = (await stat('.' + assetPath)).size;
    const response = await fetch(origin + assetPath, { method: 'HEAD' });
    assert.equal(response.status, 200);
    assert.equal(response.headers.get('content-type'), 'image/webp');
    assert.equal(Number(response.headers.get('content-length')), expectedSize);
    assert.equal(response.headers.get('cache-control'), 'public, max-age=31536000, immutable');

    const catalog = await fetch(origin + '/assets/generated/v2.2.0/asset-manifest.json');
    assert.equal(catalog.status, 200);
    assert.match(catalog.headers.get('content-type'), /application\/json/);
    assert.equal(catalog.headers.get('cache-control'), 'public, max-age=31536000, immutable');
    assert.equal((await catalog.json()).summary.runtimeFiles, 103);
  });
});

test('404, fichiers prives, masters, traversal et URL mal formee ne fuient rien', async () => {
  await withServer(async origin => {
    for (const path of [
      '/absent.txt',
      '/package.json',
      '/.env',
      '/assets/generated/arenas/rammer-parallax-openai-v1.png',
      '/assets/generated/v2.2.0/arenas/rammer/far.webp/extra',
      '/..%2Fpackage.json',
      '/%252e%252e%252fpackage.json',
      '/assets%5Cgearstorm-icon.svg',
    ]) {
      const response = await fetch(origin + path);
      assert.equal(response.status, 404, path);
      assert.equal(await response.text(), 'Introuvable');
      assert.equal(response.headers.get('cache-control'), 'no-store');
      assert.equal(response.headers.get('x-content-type-options'), 'nosniff');
    }
    const malformed = await fetch(origin + '/%E0%A4%A');
    assert.equal(malformed.status, 400);
    assert.equal(await malformed.text(), 'Requ\u00eate invalide');
  });
});

test('HEAD conserve les erreurs sans renvoyer de corps', async () => {
  await withServer(async origin => {
    const response = await fetch(origin + '/package.json', { method: 'HEAD' });
    assert.equal(response.status, 404);
    assert.equal(response.headers.get('cache-control'), 'no-store');
    assert.ok(Number(response.headers.get('content-length')) > 0);
    assert.equal(await response.text(), '');
  });
});

test('toutes les methodes mutantes sont refusees explicitement', async () => {
  await withServer(async origin => {
    for (const method of ['POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS']) {
      const response = await fetch(origin + '/', { method });
      assert.equal(response.status, 405, method);
      assert.equal(response.headers.get('allow'), 'GET, HEAD');
      assert.equal(response.headers.get('cache-control'), 'no-store');
      assert.equal(await response.text(), 'M\u00e9thode non autoris\u00e9e');
    }
  });
});
