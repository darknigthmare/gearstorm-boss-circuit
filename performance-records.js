(() => {
  'use strict';

  const root = typeof globalThis === 'object' ? globalThis : window;
  const API_VERSION = '1.0.0';
  const SAVE_VERSION = 6;
  const RECORD_SCHEMA_VERSION = 1;
  const HISTORY_LIMIT = 20;
  const MAX_BOSSES = 64;
  const MAX_CATEGORIES = 64;
  const MAX_BUILD_ITEMS = 64;
  const MAX_SPLITS = 64;
  const RANK_VALUES = Object.freeze({ C: 1, B: 2, A: 3, S: 4 });
  const BLOCKED_KEYS = new Set(['__proto__', 'prototype', 'constructor']);
  const MODE_ALIASES = Object.freeze({
    rush: 'rush',
    campaign: 'rush',
    practice: 'practice',
    laboratory: 'practice',
    laboratoire: 'practice',
    forge: 'forge',
    forgerush: 'forgeRush',
    'forge-rush': 'forgeRush',
    forgecircuit: 'forgeRush',
    'forge-circuit': 'forgeRush',
    directive: 'directive'
  });

  function isObject(value) {
    return value !== null && typeof value === 'object' && !Array.isArray(value);
  }

  function safeClone(value) {
    if (value === null || value === undefined) return value;
    if (typeof structuredClone === 'function') return structuredClone(value);
    return JSON.parse(JSON.stringify(value));
  }

  function normalizeToken(value, label, { lower = true, maxLength = 80 } = {}) {
    if (typeof value !== 'string') throw new TypeError(label + ' doit etre une chaine.');
    const trimmed = value.trim();
    if (!trimmed || trimmed.length > maxLength || !/^[A-Za-z0-9][A-Za-z0-9._-]*$/.test(trimmed)) {
      throw new TypeError(label + ' est invalide.');
    }
    const normalized = lower ? trimmed.toLowerCase() : trimmed;
    if (BLOCKED_KEYS.has(normalized)) throw new TypeError(label + ' est reserve.');
    return normalized;
  }

  function normalizeMode(value) {
    const raw = normalizeToken(value, 'mode');
    return MODE_ALIASES[raw] || raw;
  }

  function normalizeCategoryDescriptor(value) {
    if (!isObject(value)) throw new TypeError('La categorie de record est invalide.');
    return {
      balanceVersion: normalizeToken(value.balanceVersion, 'balanceVersion'),
      mode: normalizeMode(value.mode),
      difficulty: normalizeToken(value.difficulty, 'difficulty'),
      variant: normalizeToken(value.variant || 'full', 'variant')
    };
  }

  function makeRecordCategoryKey(value) {
    const category = normalizeCategoryDescriptor(value);
    return [category.balanceVersion, category.mode, category.difficulty, category.variant]
      .map(segment => encodeURIComponent(segment))
      .join('|');
  }

  function parseRecordCategoryKey(value) {
    if (typeof value !== 'string') throw new TypeError('La cle de categorie est invalide.');
    const segments = value.split('|');
    if (segments.length !== 4) throw new TypeError('La cle de categorie est invalide.');
    let decoded;
    try {
      decoded = segments.map(segment => decodeURIComponent(segment));
    } catch {
      throw new TypeError('La cle de categorie est invalide.');
    }
    const category = normalizeCategoryDescriptor({
      balanceVersion: decoded[0],
      mode: decoded[1],
      difficulty: decoded[2],
      variant: decoded[3]
    });
    if (makeRecordCategoryKey(category) !== value) throw new TypeError('La cle de categorie n est pas canonique.');
    return category;
  }

  function resolveCategoryKey(value) {
    if (typeof value === 'string') {
      parseRecordCategoryKey(value);
      return value;
    }
    return makeRecordCategoryKey(value);
  }

  function finiteNonNegative(value, fallback = 0) {
    const number = Number(value);
    return Number.isFinite(number) && number >= 0 ? number : fallback;
  }

  function positiveFinite(value) {
    const number = Number(value);
    return Number.isFinite(number) && number > 0 ? number : null;
  }

  function nonNegativeInteger(value, fallback = 0) {
    return Math.max(0, Math.floor(finiteNonNegative(value, fallback)));
  }

  function normalizeBuild(value) {
    if (!Array.isArray(value)) return [];
    const build = [];
    for (const rawId of value) {
      if (build.length >= MAX_BUILD_ITEMS) break;
      try {
        build.push(normalizeToken(rawId, 'module de build'));
      } catch {
        // Une entree de build invalide ne doit pas invalider tout le record.
      }
    }
    return build;
  }

  function sanitizeSplit(value) {
    if (!isObject(value)) return null;
    let bossId;
    try {
      bossId = normalizeToken(value.bossId, 'bossId');
    } catch {
      return null;
    }
    const time = positiveFinite(value.time);
    if (time === null) return null;
    const rank = Object.hasOwn(RANK_VALUES, value.rank) ? value.rank : null;
    return {
      bossId,
      time,
      rank,
      score: nonNegativeInteger(value.score),
      retries: nonNegativeInteger(value.retries)
    };
  }

  function sanitizeAttemptRecord(value, options = {}) {
    if (!isObject(value)) return null;
    const time = positiveFinite(value.time);
    if (time === null) return null;
    const rank = Object.hasOwn(RANK_VALUES, value.rank) ? value.rank : null;
    const completedAt = positiveFinite(value.completedAt) || positiveFinite(options.now) || Date.now();
    const splits = [];
    if (Array.isArray(value.splits)) {
      for (const rawSplit of value.splits) {
        if (splits.length >= MAX_SPLITS) break;
        const split = sanitizeSplit(rawSplit);
        if (split) splits.push(split);
      }
    }
    let seed = null;
    if (typeof value.seed === 'string' && value.seed.trim()) seed = value.seed.trim().slice(0, 128);
    else if (Number.isFinite(Number(value.seed))) seed = String(Number(value.seed));
    return {
      time,
      rank,
      score: nonNegativeInteger(value.score),
      maxCombo: nonNegativeInteger(value.maxCombo),
      damageTaken: finiteNonNegative(value.damageTaken),
      retries: nonNegativeInteger(value.retries),
      build: normalizeBuild(value.build),
      splits,
      seed,
      completedAt: Math.floor(completedAt)
    };
  }

  function createRecordBucket() {
    return {
      clears: 0,
      last: null,
      bestTime: null,
      bestRank: null,
      bestScore: null
    };
  }

  function sanitizeRecordBucket(value) {
    const bucket = createRecordBucket();
    if (!isObject(value)) return bucket;
    bucket.clears = nonNegativeInteger(value.clears);
    bucket.last = sanitizeAttemptRecord(value.last);
    bucket.bestTime = sanitizeAttemptRecord(value.bestTime);
    bucket.bestRank = sanitizeAttemptRecord(value.bestRank);
    bucket.bestScore = sanitizeAttemptRecord(value.bestScore);
    return bucket;
  }

  function sanitizeLegacyMap(value, validator) {
    const result = {};
    if (!isObject(value)) return result;
    for (const [rawId, rawValue] of Object.entries(value)) {
      if (Object.keys(result).length >= MAX_BOSSES) break;
      let id;
      try {
        id = normalizeToken(rawId, 'bossId');
      } catch {
        continue;
      }
      const normalized = validator(rawValue);
      if (normalized !== null) result[id] = normalized;
    }
    return result;
  }

  function sanitizeLegacyUnscoped(value) {
    const legacy = isObject(value) ? value : {};
    const bestTimes = sanitizeLegacyMap(legacy.bestTimes, positiveFinite);
    const bestRanks = sanitizeLegacyMap(legacy.bestRanks, rank => Object.hasOwn(RANK_VALUES, rank) ? rank : null);
    const bestRush = positiveFinite(legacy.bestRush);
    const bestForgeRush = positiveFinite(legacy.bestForgeRush);
    const migratedFromVersion = nonNegativeInteger(legacy.migratedFromVersion, 5) || 5;
    return { bestTimes, bestRanks, bestRush, bestForgeRush, migratedFromVersion };
  }

  function createRecordBook() {
    return {
      schemaVersion: RECORD_SCHEMA_VERSION,
      legacyUnscoped: sanitizeLegacyUnscoped(null),
      bosses: {},
      circuits: {},
      history: []
    };
  }

  function sanitizeHistoryEntry(value) {
    if (!isObject(value)) return null;
    let categoryKey;
    try {
      categoryKey = resolveCategoryKey(value.categoryKey || value.category);
    } catch {
      return null;
    }
    const attempt = sanitizeAttemptRecord(value.attempt || value);
    if (!attempt) return null;
    let type;
    try {
      type = normalizeToken(value.type || 'circuit', 'type');
    } catch {
      return null;
    }
    let bossId = null;
    if (value.bossId !== null && value.bossId !== undefined) {
      try {
        bossId = normalizeToken(value.bossId, 'bossId');
      } catch {
        bossId = null;
      }
    }
    return { type, categoryKey, bossId, ...attempt };
  }

  function sanitizeRecordBook(value) {
    const book = createRecordBook();
    if (!isObject(value)) return book;
    book.legacyUnscoped = sanitizeLegacyUnscoped(value.legacyUnscoped);

    if (isObject(value.bosses)) {
      for (const [rawBossId, rawCategories] of Object.entries(value.bosses)) {
        if (Object.keys(book.bosses).length >= MAX_BOSSES) break;
        let bossId;
        try {
          bossId = normalizeToken(rawBossId, 'bossId');
        } catch {
          continue;
        }
        if (!isObject(rawCategories)) continue;
        const categories = {};
        for (const [rawKey, rawBucket] of Object.entries(rawCategories)) {
          if (Object.keys(categories).length >= MAX_CATEGORIES) break;
          try {
            const categoryKey = resolveCategoryKey(rawKey);
            categories[categoryKey] = sanitizeRecordBucket(rawBucket);
          } catch {
            // Ignore une categorie corrompue sans supprimer les autres.
          }
        }
        if (Object.keys(categories).length) book.bosses[bossId] = categories;
      }
    }

    if (isObject(value.circuits)) {
      for (const [rawKey, rawBucket] of Object.entries(value.circuits)) {
        if (Object.keys(book.circuits).length >= MAX_CATEGORIES) break;
        try {
          const categoryKey = resolveCategoryKey(rawKey);
          book.circuits[categoryKey] = sanitizeRecordBucket(rawBucket);
        } catch {
          // Ignore une categorie corrompue sans supprimer les autres.
        }
      }
    }

    if (Array.isArray(value.history)) {
      book.history = value.history
        .map(sanitizeHistoryEntry)
        .filter(Boolean)
        .slice(-HISTORY_LIMIT);
    }
    return book;
  }

  function betterRank(candidate, current) {
    if (!current) return true;
    const candidateRank = RANK_VALUES[candidate.rank] || 0;
    const currentRank = RANK_VALUES[current.rank] || 0;
    if (candidateRank !== currentRank) return candidateRank > currentRank;
    return candidate.time < current.time;
  }

  function applyAttempt(bucketValue, attemptValue, now) {
    const bucket = sanitizeRecordBucket(bucketValue);
    const attempt = sanitizeAttemptRecord(attemptValue, { now });
    if (!attempt) throw new TypeError('La tentative de record est invalide.');
    const outcome = {
      firstClear: bucket.clears === 0,
      newBestTime: !bucket.bestTime || attempt.time < bucket.bestTime.time,
      newBestRank: betterRank(attempt, bucket.bestRank),
      newBestScore: !bucket.bestScore || attempt.score > bucket.bestScore.score
        || (attempt.score === bucket.bestScore.score && attempt.time < bucket.bestScore.time)
    };
    bucket.clears += 1;
    bucket.last = safeClone(attempt);
    if (outcome.newBestTime) bucket.bestTime = safeClone(attempt);
    if (outcome.newBestRank) bucket.bestRank = safeClone(attempt);
    if (outcome.newBestScore) bucket.bestScore = safeClone(attempt);
    return { bucket, attempt, outcome };
  }

  function recordBossAttempt(recordBook, options = {}) {
    const book = sanitizeRecordBook(recordBook);
    const bossId = normalizeToken(options.bossId, 'bossId');
    const categoryKey = resolveCategoryKey(options.categoryKey || options.category);
    const previous = book.bosses[bossId]?.[categoryKey];
    const applied = applyAttempt(previous, options.attempt, options.now);
    if (!book.bosses[bossId]) book.bosses[bossId] = {};
    book.bosses[bossId][categoryKey] = applied.bucket;
    return { book, categoryKey, bossId, attempt: applied.attempt, outcome: applied.outcome };
  }

  function appendHistory(recordBook, value) {
    const book = sanitizeRecordBook(recordBook);
    const entry = sanitizeHistoryEntry(value);
    if (!entry) throw new TypeError('L entree d historique est invalide.');
    book.history.push(entry);
    if (book.history.length > HISTORY_LIMIT) book.history.splice(0, book.history.length - HISTORY_LIMIT);
    return book;
  }

  function recordCircuitAttempt(recordBook, options = {}) {
    let book = sanitizeRecordBook(recordBook);
    const categoryKey = resolveCategoryKey(options.categoryKey || options.category);
    const applied = applyAttempt(book.circuits[categoryKey], options.attempt, options.now);
    book.circuits[categoryKey] = applied.bucket;
    if (options.appendHistory !== false) {
      book = appendHistory(book, {
        type: 'circuit',
        categoryKey,
        attempt: applied.attempt
      });
    }
    return { book, categoryKey, attempt: applied.attempt, outcome: applied.outcome };
  }

  function getBossRecord(recordBook, bossIdValue, categoryValue) {
    const book = sanitizeRecordBook(recordBook);
    const bossId = normalizeToken(bossIdValue, 'bossId');
    const categoryKey = resolveCategoryKey(categoryValue);
    const bucket = book.bosses[bossId]?.[categoryKey];
    return bucket ? safeClone(bucket) : null;
  }

  function getCircuitRecord(recordBook, categoryValue) {
    const book = sanitizeRecordBook(recordBook);
    const categoryKey = resolveCategoryKey(categoryValue);
    const bucket = book.circuits[categoryKey];
    return bucket ? safeClone(bucket) : null;
  }

  function migrateLegacyRecords(saveValue) {
    if (!isObject(saveValue)) throw new TypeError('La sauvegarde a migrer est invalide.');
    const book = sanitizeRecordBook(saveValue.records);
    const existing = book.legacyUnscoped;
    const legacy = sanitizeLegacyUnscoped({
      bestTimes: saveValue.bestTimes,
      bestRanks: saveValue.bestRanks,
      bestRush: saveValue.bestRush,
      bestForgeRush: saveValue.bestForgeRush,
      migratedFromVersion: saveValue.version
    });
    book.legacyUnscoped = {
      bestTimes: { ...existing.bestTimes, ...legacy.bestTimes },
      bestRanks: { ...existing.bestRanks, ...legacy.bestRanks },
      bestRush: legacy.bestRush ?? existing.bestRush,
      bestForgeRush: legacy.bestForgeRush ?? existing.bestForgeRush,
      migratedFromVersion: nonNegativeInteger(saveValue.version, existing.migratedFromVersion || 5) || 5
    };
    return book;
  }

  function migrateSaveToV6(saveValue, options = {}) {
    if (!isObject(saveValue)) throw new TypeError('La sauvegarde a migrer est invalide.');
    const migrated = { ...saveValue, version: SAVE_VERSION, records: migrateLegacyRecords(saveValue) };
    if (options.keepLegacyFields !== true) {
      delete migrated.bestTimes;
      delete migrated.bestRanks;
      delete migrated.bestRush;
      delete migrated.bestForgeRush;
    }
    return migrated;
  }

  const api = Object.freeze({
    API_VERSION,
    SAVE_VERSION,
    RECORD_SCHEMA_VERSION,
    HISTORY_LIMIT,
    RANK_VALUES,
    makeRecordCategoryKey,
    parseRecordCategoryKey,
    sanitizeAttemptRecord,
    sanitizeRecordBook,
    createRecordBook,
    recordBossAttempt,
    recordCircuitAttempt,
    appendHistory,
    getBossRecord,
    getCircuitRecord,
    migrateLegacyRecords,
    migrateSaveToV6
  });

  const existing = root.GEARSTORM_PERFORMANCE_RECORDS;
  if (!existing || existing.API_VERSION !== API_VERSION) {
    Object.defineProperty(root, 'GEARSTORM_PERFORMANCE_RECORDS', {
      value: api,
      configurable: true,
      enumerable: true,
      writable: false
    });
  }
  if (typeof module === 'object' && module?.exports) module.exports = api;
})();
