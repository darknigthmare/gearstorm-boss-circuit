import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import vm from 'node:vm';

const source = await readFile('pwa-update-v2.9.0.js', 'utf8');

function createHarness({ controlled = true } = {}) {
  const handlers = {
    click: [],
    controllerchange: [],
    load: [],
    statechange: [],
    updatefound: [],
  };
  const counters = { registers: 0, reloads: 0 };
  const messages = [];
  const status = { textContent: '' };
  const updateButton = {
    hidden: true,
    disabled: false,
    textContent: 'Mettre a jour',
    addEventListener(type, handler) {
      handlers[type].push(handler);
    },
  };
  const waiting = {
    postMessage(message) {
      messages.push(message);
    },
  };
  const registration = {
    waiting,
    installing: null,
    addEventListener(type, handler) {
      handlers[type].push(handler);
    },
  };
  const serviceWorker = {
    controller: controlled ? {} : null,
    register: async path => {
      counters.registers += 1;
      assert.equal(path, './sw.js');
      return registration;
    },
    addEventListener(type, handler) {
      handlers[type].push(handler);
    },
  };
  const location = {
    protocol: 'https:',
    reload() {
      counters.reloads += 1;
    },
  };
  const window = {
    location,
    addEventListener(type, handler) {
      handlers[type].push(handler);
    },
  };
  const document = {
    querySelector(selector) {
      if (selector === '#update-app') return updateButton;
      if (selector === '#game-status') return status;
      return null;
    },
  };
  const context = vm.createContext({
    console,
    document,
    location,
    navigator: { serviceWorker },
    window,
  });
  return { context, counters, handlers, messages, registration, status, updateButton };
}

async function settle() {
  await Promise.resolve();
  await Promise.resolve();
}

test('la migration PWA v2.8 vers v2.9 demande un consentement et recharge une fois', async () => {
  const harness = createHarness();
  vm.runInContext(source, harness.context, { filename: 'pwa-update-v2.9.0.js' });
  vm.runInContext(source, harness.context, { filename: 'pwa-update-v2.9.0.js' });

  assert.equal(harness.handlers.load.length, 1);
  assert.equal(harness.handlers.controllerchange.length, 1);
  assert.equal(harness.handlers.click.length, 1);

  harness.handlers.load[0]();
  await settle();
  assert.equal(harness.counters.registers, 1);
  assert.equal(harness.updateButton.hidden, false);
  assert.match(harness.status.textContent, /mise/);

  harness.handlers.click[0]();
  assert.equal(harness.messages.length, 1);
  assert.equal(harness.messages[0].type, 'SKIP_WAITING');
  harness.handlers.controllerchange[0]();
  harness.handlers.controllerchange[0]();
  assert.equal(harness.counters.reloads, 1);
});

test('un premier install reste silencieux sans controleur existant', async () => {
  const harness = createHarness({ controlled: false });
  vm.runInContext(source, harness.context, { filename: 'pwa-update-v2.9.0.js' });
  harness.handlers.load[0]();
  await settle();

  assert.equal(harness.counters.registers, 1);
  assert.equal(harness.updateButton.hidden, true);
  harness.handlers.click[0]();
  harness.handlers.controllerchange[0]();
  assert.deepEqual(harness.messages, []);
  assert.equal(harness.counters.reloads, 0);
});
