import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import vm from 'node:vm';

const scope = 'https://gearstorm.test/';
const workerSource = await readFile('sw.js', 'utf8');

function response(contentType = 'application/octet-stream', body = 'ok') {
  const headers = new Headers({ 'content-type': contentType });
  return {
    body,
    headers,
    ok: true,
    status: 200,
    type: 'basic',
    clone() {
      return response(contentType, body);
    },
  };
}

function createWorker() {
  const handlers = new Map();
  const stores = new Map();
  const normalize = input => new URL(typeof input === 'string' ? input : input.url, scope).href;

  class MemoryCache {
    constructor() {
      this.entries = new Map();
    }

    async addAll(inputs) {
      for (const input of inputs) this.entries.set(normalize(input), response('application/octet-stream', normalize(input)));
    }

    async match(input) {
      return this.entries.get(normalize(input));
    }

    async put(input, value) {
      this.entries.set(normalize(input), value.clone());
    }
  }

  const caches = {
    async open(name) {
      if (!stores.has(name)) stores.set(name, new MemoryCache());
      return stores.get(name);
    },
    async keys() {
      return [...stores.keys()];
    },
    async delete(name) {
      return stores.delete(name);
    },
    async match(input) {
      for (const cache of stores.values()) {
        const hit = await cache.match(input);
        if (hit) return hit;
      }
      return undefined;
    },
  };

  const counters = { claims: 0, skips: 0 };
  const self = {
    registration: { scope },
    location: { origin: new URL(scope).origin },
    clients: { async claim() { counters.claims += 1; } },
    async skipWaiting() { counters.skips += 1; },
    addEventListener(type, handler) { handlers.set(type, handler); },
  };
  const context = vm.createContext({
    URL,
    Request,
    Response,
    Headers,
    caches,
    console,
    fetch: async () => response(),
    self,
  });
  vm.runInContext(workerSource, context, { filename: 'sw.js' });
  return { caches, context, counters, handlers, stores };
}

async function dispatchExtendable(handler, payload = {}) {
  let pending;
  handler({
    ...payload,
    waitUntil(value) { pending = Promise.resolve(value); },
  });
  if (pending) await pending;
}

async function dispatchFetch(handler, request) {
  let responsePromise;
  const background = [];
  handler({
    request,
    respondWith(value) { responsePromise = Promise.resolve(value); },
    waitUntil(value) { background.push(Promise.resolve(value)); },
  });
  const result = responsePromise ? await responsePromise : undefined;
  await Promise.all(background);
  return result;
}

test('installation PWA precache uniquement le shell et le petit catalogue', async () => {
  const worker = createWorker();
  await dispatchExtendable(worker.handlers.get('install'));
  assert.equal(worker.counters.skips, 1);
  const keys = await worker.caches.keys();
  assert.deepEqual(keys, ['gearstorm-shell-v2.4.0']);
  const shell = worker.stores.get(keys[0]);
  assert.equal(shell.entries.size, 10);
  assert.ok([...shell.entries.keys()].some(key => key.endsWith('/story.js')));
  assert.ok([...shell.entries.keys()].some(key => key.endsWith('/assets/generated/v2.2.0/asset-manifest.json')));
  assert.ok([...shell.entries.keys()].every(key => !key.endsWith('.webp')));
});

test('activation supprime les anciens caches GEARSTORM seulement', async () => {
  const worker = createWorker();
  await dispatchExtendable(worker.handlers.get('install'));
  await worker.caches.open('gearstorm-shell-v2.2.0');
  await worker.caches.open('gearstorm-runtime-v2.2.0');
  await worker.caches.open('cache-unrelated');
  await dispatchExtendable(worker.handlers.get('activate'));
  assert.equal(worker.counters.claims, 1);
  assert.deepEqual((await worker.caches.keys()).sort(), ['cache-unrelated', 'gearstorm-shell-v2.4.0']);
});

test('les WebP versionnes utilisent un cache-first canonique sans variantes de query', async () => {
  const worker = createWorker();
  await dispatchExtendable(worker.handlers.get('install'));
  let fetches = 0;
  worker.context.fetch = async () => {
    fetches += 1;
    return response('image/webp', 'webp');
  };
  const handler = worker.handlers.get('fetch');
  const base = scope + 'assets/generated/v2.2.0/arenas/rammer/far.webp';
  const first = await dispatchFetch(handler, new Request(base + '?a=1'));
  const second = await dispatchFetch(handler, new Request(base + '?a=2'));
  assert.equal(first.body, 'webp');
  assert.equal(second.body, 'webp');
  assert.equal(fetches, 1);
  assert.ok((await worker.caches.keys()).includes('gearstorm-runtime-v2.4.0'));
});

test('une reponse non WebP ne pollue jamais le cache runtime', async () => {
  const worker = createWorker();
  await dispatchExtendable(worker.handlers.get('install'));
  let fetches = 0;
  worker.context.fetch = async () => {
    fetches += 1;
    return response('image/png', 'wrong');
  };
  const handler = worker.handlers.get('fetch');
  const url = scope + 'assets/generated/v2.2.0/vfx/not-catalogued.webp';
  await dispatchFetch(handler, new Request(url));
  await dispatchFetch(handler, new Request(url));
  assert.equal(fetches, 2);
});

test('le shell est servi immediatement puis revalide en arriere-plan', async () => {
  const worker = createWorker();
  await dispatchExtendable(worker.handlers.get('install'));
  let fetches = 0;
  worker.context.fetch = async () => {
    fetches += 1;
    return response('text/css', 'fresh-css');
  };
  const url = scope + 'styles.css';
  const served = await dispatchFetch(worker.handlers.get('fetch'), new Request(url));
  assert.match(served.body, /styles\.css$/);
  assert.equal(fetches, 1);
  const shell = worker.stores.get('gearstorm-shell-v2.4.0');
  assert.equal((await shell.match(new Request(url))).body, 'fresh-css');
});

test('navigation hors ligne retombe sur index et les requetes hors liste ne sont pas interceptees', async () => {
  const worker = createWorker();
  await dispatchExtendable(worker.handlers.get('install'));
  worker.context.fetch = async () => { throw new Error('offline'); };
  const handler = worker.handlers.get('fetch');
  const offline = await dispatchFetch(handler, { method: 'GET', mode: 'navigate', url: scope + '?mode=rush' });
  assert.ok(offline);
  assert.match(offline.body, /index\.html$/);

  assert.equal(await dispatchFetch(handler, new Request(scope + 'unknown.json')), undefined);
  assert.equal(await dispatchFetch(handler, new Request('https://outside.test/file.js')), undefined);
  assert.equal(await dispatchFetch(handler, new Request(scope + 'game.js', { method: 'POST' })), undefined);
});
