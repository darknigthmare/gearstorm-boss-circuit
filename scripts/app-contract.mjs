export const APP_RELEASE = '2.3.0';
export const SAVE_SCHEMA_VERSION = 3;
export const SAVE_KEY = 'gearstorm_boss_circuit_save_v3';
export const PREVIOUS_SAVE_KEY = 'gearstorm_boss_circuit_save_v2';
export const DIST_BUDGET_BYTES = 24 * 1024 * 1024;

export const REQUIRED_UI_IDS = Object.freeze([
  'continue-run',
  'codex',
  'codex-screen',
  'codex-grid',
  'codex-progress',
  'campaign-progress',
  'campaign-next',
  'combat-objective',
  'combat-hint',
  'pause-build',
  'pause-objective',
  'result-build',
  'result-lore',
  'hints-toggle',
]);

export const REQUIRED_GAME_SYSTEMS = Object.freeze([
  'sanitizeRushSnapshot',
  'saveRushSnapshot',
  'clearRushSnapshot',
  'resumeRushSnapshot',
  'syncContinueRun',
  'buildCodex',
  'syncCombatGuidance',
  'routeLaunchMode',
  'HERO_RIG',
  'BOSS_RIGS',
  'drawRigPart',
  'getRigDiagnostics',
]);

function invariant(condition, message) {
  if (!condition) throw new Error(message);
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function htmlIds(html) {
  const matches = [...html.matchAll(/\sid=["']([^"']+)["']/g)].map(match => match[1]);
  invariant(matches.length === new Set(matches).size, 'Contrat UI : identifiant HTML duplique.');
  return new Set(matches);
}

export function validateApplicationContract({ game, html, manifest, packageJson }) {
  invariant(packageJson?.version === APP_RELEASE, `Version application ${APP_RELEASE} attendue.`);
  invariant(typeof game === 'string' && typeof html === 'string', 'Sources game.js et index.html requises.');

  const ids = htmlIds(html);
  for (const id of REQUIRED_UI_IDS) invariant(ids.has(id), `Contrat UI v2.3 : #${id} absent.`);
  const domReferences = [...game.matchAll(/getElementById\(["']([^"']+)["']\)/g)].map(match => match[1]);
  for (const id of domReferences) invariant(ids.has(id), `Contrat DOM : #${id} reference par game.js mais absent.`);

  invariant(new RegExp(`const\\s+SAVE_KEY\\s*=\\s*["']${escapeRegExp(SAVE_KEY)}["']`).test(game), `Sauvegarde v${SAVE_SCHEMA_VERSION} absente.`);
  invariant(new RegExp(`const\\s+PREVIOUS_SAVE_KEY\\s*=\\s*["']${escapeRegExp(PREVIOUS_SAVE_KEY)}["']`).test(game), 'Cle de migration v2 absente.');
  invariant(/version\s*:\s*3\b/.test(game), 'Schema de sauvegarde version 3 absent.');
  for (const field of ['combatHints', 'codexUnlocked', 'rushSnapshot']) {
    invariant(new RegExp(`\\b${field}\\b`).test(game), `Champ de sauvegarde v3 absent : ${field}.`);
  }
  invariant(/localStorage\.getItem\(PREVIOUS_SAVE_KEY\)/.test(game), 'La migration doit lire la sauvegarde v2.');
  invariant(/localStorage\.setItem\(SAVE_KEY,\s*JSON\.stringify\(safe\)\)/.test(game), 'La migration doit persister immediatement la sauvegarde assainie sous la cle v3.');

  for (const marker of REQUIRED_GAME_SYSTEMS) {
    invariant(new RegExp(`\\b${escapeRegExp(marker)}\\b`).test(game), `Systeme v2.3 absent : ${marker}.`);
  }

  invariant(/new URLSearchParams\(location\.search\)/.test(game), 'Le routeur de lancement doit lire la query string.');
  invariant(/get\(["']mode["']\)/.test(game), 'Le routeur de lancement doit lire le parametre mode.');
  invariant((game.match(/\brouteLaunchMode\(\)/g) || []).length >= 2, 'Le routeur de lancement est defini mais jamais appele.');
  const routeBlock = game.slice(game.indexOf('function routeLaunchMode'), game.indexOf('function applySettings'));
  invariant(!/startRun|startFight|unlockAudio/.test(routeBlock), 'Un raccourci PWA ne doit pas demarrer combat ou audio sans geste utilisateur.');
  const shortcuts = new Set((manifest?.shortcuts || []).map(shortcut => shortcut.url));
  for (const url of ['./?mode=rush', './?mode=practice']) {
    invariant(shortcuts.has(url), `Raccourci PWA absent : ${url}.`);
  }

  invariant(html.includes('GEARSTORM: Boss Circuit v2.3'), 'Metadonnees HTML v2.3 absentes.');
  invariant(!/GEARSTORM: Boss Circuit v2\.2\b/.test(html), 'Metadonnee HTML encore figee en v2.2.');
  invariant(/qaAllowed[\s\S]+__GEARSTORM_QA__/.test(game), 'Surface QA locale absente ou non protegee.');
  const rigDiagnosticsBlock = game.slice(game.indexOf('function getRigDiagnostics'), game.indexOf('function drawRigDebugOverlay'));
  for (const field of ['phaseCounts', 'hitbox', 'weakPoint', 'feetLocalY', 'muzzle', 'transitionExplosionOnly']) {
    invariant(new RegExp(`\\b${field}\\b`).test(rigDiagnosticsBlock), `Diagnostic de rig incomplet : ${field}.`);
  }
  const qaBlock = game.slice(game.indexOf("Object.defineProperty(window, '__GEARSTORM_QA__'"));
  for (const marker of ['getRigDiagnostics', 'getRushSnapshot', 'resumeRush', 'setRigDebug', 'launchMode']) {
    invariant(new RegExp(`\\b${marker}\\b`).test(qaBlock), `Diagnostic QA v2.3 absent : ${marker}.`);
  }

  return {
    appRelease: APP_RELEASE,
    saveSchemaVersion: SAVE_SCHEMA_VERSION,
    uiIds: REQUIRED_UI_IDS.length,
    gameSystems: REQUIRED_GAME_SYSTEMS.length,
  };
}
