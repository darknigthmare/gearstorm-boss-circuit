import assert from 'node:assert/strict';
import { stat } from 'node:fs/promises';
import { createRequire } from 'node:module';
import test from 'node:test';

const require = createRequire(import.meta.url);
const { createGameServer } = require('../server.js');

async function withServer(run) {
  const server = createGameServer();
  assert.equal(server.listening, false, 'L’import du serveur ne doit pas ouvrir de port.');
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

test('le serveur livre le jeu et les en-têtes de sécurité', async () => {
  await withServer(async origin => {
    const response = await fetch(origin + '/');
    assert.equal(response.status, 200);
    assert.match(response.headers.get('content-type'), /text\/html/);
    assert.equal(response.headers.get('x-content-type-options'), 'nosniff');
    assert.equal(response.headers.get('x-frame-options'), 'DENY');
    assert.equal(response.headers.get('cross-origin-resource-policy'), 'same-origin');
    assert.match(response.headers.get('content-security-policy'), /default-src 'self'/);
    assert.match(await response.text(), /GEARSTORM/);
  });
});

test('HEAD retourne les métadonnées sans corps', async () => {
  await withServer(async origin => {
    const expectedSize = (await stat('game.js')).size;
    const response = await fetch(origin + '/game.js', { method: 'HEAD' });
    assert.equal(response.status, 200);
    assert.equal(Number(response.headers.get('content-length')), expectedSize);
    assert.equal(await response.text(), '');
  });
});

test('404, fichier privé, traversal et URL mal formée ne fuient rien', async () => {
  await withServer(async origin => {
    for (const path of ['/absent.txt', '/package.json', '/..%2Fpackage.json']) {
      const response = await fetch(origin + path);
      assert.equal(response.status, 404, path);
      assert.equal(await response.text(), 'Introuvable');
      assert.equal(response.headers.get('x-content-type-options'), 'nosniff');
    }
    const malformed = await fetch(origin + '/%E0%A4%A');
    assert.equal(malformed.status, 400);
    assert.equal(await malformed.text(), 'Requête invalide');
  });
});

test('les méthodes mutantes sont refusées explicitement', async () => {
  await withServer(async origin => {
    for (const method of ['POST', 'PUT', 'DELETE']) {
      const response = await fetch(origin + '/', { method });
      assert.equal(response.status, 405);
      assert.equal(response.headers.get('allow'), 'GET, HEAD');
      assert.equal(await response.text(), 'Méthode non autorisée');
    }
  });
});
