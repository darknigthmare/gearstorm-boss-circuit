import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import test from 'node:test';

const require = createRequire(import.meta.url);
const records = require('../performance-records.js');

const STANDARD_RUSH = {
  balanceVersion: '2.11-b1',
  mode: 'rush',
  difficulty: 'standard',
  variant: 'full'
};

function attempt(overrides = {}) {
  return {
    time: 60,
    rank: 'A',
    score: 12_000,
    maxCombo: 14,
    damageTaken: 1,
    retries: 0,
    build: ['rapid', 'core'],
    completedAt: 1_800_000_000_000,
    ...overrides
  };
}

test('la cle canonique segmente version d equilibrage, mode, difficulte et variante', () => {
  const key = records.makeRecordCategoryKey(STANDARD_RUSH);
  assert.equal(key, '2.11-b1|rush|standard|full');
  assert.deepEqual(records.parseRecordCategoryKey(key), STANDARD_RUSH);
  assert.equal(
    records.makeRecordCategoryKey({ ...STANDARD_RUSH, mode: 'forge-rush' }),
    '2.11-b1|forgeRush|standard|full'
  );
  assert.throws(() => records.makeRecordCategoryKey({ ...STANDARD_RUSH, difficulty: '../casual' }), /invalide/);
  assert.throws(() => records.parseRecordCategoryKey('rush|standard'), /invalide/);
});

test('les meilleurs temps, rang et score restent des tentatives atomiques distinctes', () => {
  const empty = records.createRecordBook();
  const first = records.recordBossAttempt(empty, {
    bossId: 'rammer',
    category: STANDARD_RUSH,
    attempt: attempt({ time: 60, rank: 'A', score: 12_000 })
  });
  const second = records.recordBossAttempt(first.book, {
    bossId: 'rammer',
    category: STANDARD_RUSH,
    attempt: attempt({ time: 54, rank: 'B', score: 10_000, completedAt: 1_800_000_000_100 })
  });
  const third = records.recordBossAttempt(second.book, {
    bossId: 'rammer',
    category: STANDARD_RUSH,
    attempt: attempt({ time: 68, rank: 'S', score: 9_000, completedAt: 1_800_000_000_200 })
  });

  const bucket = records.getBossRecord(third.book, 'rammer', STANDARD_RUSH);
  assert.equal(bucket.clears, 3);
  assert.deepEqual(
    { time: bucket.bestTime.time, rank: bucket.bestTime.rank, score: bucket.bestTime.score },
    { time: 54, rank: 'B', score: 10_000 }
  );
  assert.deepEqual(
    { time: bucket.bestRank.time, rank: bucket.bestRank.rank, score: bucket.bestRank.score },
    { time: 68, rank: 'S', score: 9_000 }
  );
  assert.deepEqual(
    { time: bucket.bestScore.time, rank: bucket.bestScore.rank, score: bucket.bestScore.score },
    { time: 60, rank: 'A', score: 12_000 }
  );
  assert.equal(bucket.last.time, 68);
  assert.equal(first.outcome.firstClear, true);
  assert.equal(second.outcome.newBestTime, true);
  assert.equal(second.outcome.newBestRank, false);
  assert.equal(third.outcome.newBestRank, true);
  assert.deepEqual(empty, records.createRecordBook(), 'l API ne mute pas le registre fourni');
});

test('les modes, difficultes, variantes et versions ne partagent jamais leur case', () => {
  const categories = [
    STANDARD_RUSH,
    { ...STANDARD_RUSH, mode: 'practice' },
    { ...STANDARD_RUSH, difficulty: 'casual' },
    { ...STANDARD_RUSH, variant: 'phase-3-checkpoint-1' },
    { ...STANDARD_RUSH, balanceVersion: '2.12-b1' }
  ];
  let book = records.createRecordBook();
  categories.forEach((category, index) => {
    book = records.recordBossAttempt(book, {
      bossId: 'rammer',
      category,
      attempt: attempt({ time: 50 + index, completedAt: 1_800_000_001_000 + index })
    }).book;
  });
  assert.equal(Object.keys(book.bosses.rammer).length, categories.length);
  categories.forEach((category, index) => {
    assert.equal(records.getBossRecord(book, 'rammer', category).bestTime.time, 50 + index);
  });
});

test('la migration v5 conserve les anciens records comme heritage non classe', () => {
  const source = {
    version: 5,
    unlocked: 6,
    bestTimes: { rammer: 41.25, omega: 0, '__proto__': 7 },
    bestRanks: { rammer: 'S', omega: 'Z' },
    bestRush: 355.5,
    bestForgeRush: 1_944.25,
    settings: { difficulty: 'overdrive' }
  };
  const migrated = records.migrateSaveToV6(source);

  assert.equal(migrated.version, 6);
  assert.equal(migrated.unlocked, 6);
  assert.deepEqual(migrated.settings, source.settings);
  assert.equal(Object.hasOwn(migrated, 'bestTimes'), false);
  assert.deepEqual(migrated.records.legacyUnscoped.bestTimes, { rammer: 41.25 });
  assert.deepEqual(migrated.records.legacyUnscoped.bestRanks, { rammer: 'S' });
  assert.equal(migrated.records.legacyUnscoped.bestRush, 355.5);
  assert.equal(migrated.records.legacyUnscoped.bestForgeRush, 1_944.25);
  assert.equal(migrated.records.legacyUnscoped.migratedFromVersion, 5);
  assert.deepEqual(migrated.records.bosses, {});
  assert.deepEqual(migrated.records.circuits, {});
  assert.deepEqual(source.bestTimes, { rammer: 41.25, omega: 0 }, 'la migration ne mute pas la sauvegarde source');
});

test('une categorie corrompue est ignoree sans effacer les autres', () => {
  const validKey = records.makeRecordCategoryKey(STANDARD_RUSH);
  const sanitized = records.sanitizeRecordBook({
    bosses: {
      rammer: {
        [validKey]: { clears: 1, bestTime: attempt(), last: attempt() },
        'categorie-cassee': { clears: 99, bestTime: attempt({ time: 1 }) }
      }
    },
    circuits: {
      [validKey]: { clears: 1, bestTime: attempt({ time: 300 }) },
      nope: { clears: 1, bestTime: attempt({ time: 1 }) }
    }
  });
  assert.deepEqual(Object.keys(sanitized.bosses.rammer), [validKey]);
  assert.deepEqual(Object.keys(sanitized.circuits), [validKey]);
});

test('les circuits possedent leurs propres records et un historique borne aux vingt derniers', () => {
  let book = records.createRecordBook();
  for (let index = 1; index <= 25; index++) {
    book = records.recordCircuitAttempt(book, {
      category: STANDARD_RUSH,
      attempt: attempt({
        time: 300 + index,
        score: 20_000 + index,
        completedAt: 1_800_000_010_000 + index,
        splits: [
          { bossId: 'rammer', time: 40 + index, rank: 'A', score: 2_000, retries: 0 },
          { bossId: 'kraken', time: 50 + index, rank: 'B', score: 2_500, retries: 1 }
        ]
      })
    }).book;
  }

  assert.equal(book.history.length, records.HISTORY_LIMIT);
  assert.equal(book.history[0].time, 306);
  assert.equal(book.history.at(-1).time, 325);
  assert.equal(book.history.at(-1).splits.length, 2);
  const circuit = records.getCircuitRecord(book, STANDARD_RUSH);
  assert.equal(circuit.clears, 25);
  assert.equal(circuit.bestTime.time, 301);
  assert.equal(circuit.bestScore.score, 20_025);
  assert.equal(records.getBossRecord(book, 'rammer', STANDARD_RUSH), null);
});

test('la normalisation d un historique importe conserve les vingt entrees les plus recentes', () => {
  const key = records.makeRecordCategoryKey(STANDARD_RUSH);
  const history = Array.from({ length: 27 }, (_, index) => ({
    type: 'circuit',
    categoryKey: key,
    ...attempt({ time: 200 + index, completedAt: 1_800_000_020_000 + index })
  }));
  const book = records.sanitizeRecordBook({ history });
  assert.equal(book.history.length, 20);
  assert.equal(book.history[0].time, 207);
  assert.equal(book.history.at(-1).time, 226);
});
