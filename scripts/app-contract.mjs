import vm from 'node:vm';

export const APP_RELEASE = '2.4.0';
export const SAVE_SCHEMA_VERSION = 4;
export const SAVE_KEY = 'gearstorm_boss_circuit_save_v4';
export const PREVIOUS_SAVE_KEY = 'gearstorm_boss_circuit_save_v3';
export const OLDER_SAVE_KEY = 'gearstorm_boss_circuit_save_v2';
export const STORY_SCHEMA_VERSION = 1;
export const STORY_CONTENT_VERSION = '1.0.0';
export const MASTERY_CONTRACT_COUNT = 18;
export const DIST_BUDGET_BYTES = 24 * 1024 * 1024;

export const REQUIRED_UI_IDS = Object.freeze([
  'continue-run',
  'codex',
  'codex-screen',
  'codex-grid',
  'codex-progress',
  'campaign-progress',
  'campaign-next',
  'story-screen',
  'story-continue',
  'story-archive',
  'story-archive-progress',
  'combat-objective',
  'combat-hint',
  'pause-build',
  'pause-objective',
  'result-build',
  'result-lore',
  'result-lore-label',
  'result-mastery',
  'radio-comms',
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
  'showIntroStory',
  'showPrologueStory',
  'showInterlude',
  'evaluateMasteryContracts',
  'startMasteryCycle',
  'finishMasteryCycle',
  'combatLabel',
  'STORY',
  'MASTERY_CONTRACT_IDS',
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

export function validateStoryContract(storySource) {
  invariant(typeof storySource === 'string' && storySource.length > 1_000, 'Source narrative story.js absente ou incomplete.');
  invariant(!/^\s*(?:import|export)\s/m.test(storySource), 'story.js doit rester un script classique charge avant game.js.');
  invariant(!/\b(?:document|window|localStorage)\b/.test(storySource), 'story.js doit rester declaratif et independant du DOM.');

  const context = vm.createContext({});
  new vm.Script(storySource, { filename: 'story.js' }).runInContext(context, { timeout: 1_000 });
  const story = context.GEARSTORM_STORY;
  invariant(story && typeof story === 'object', 'globalThis.GEARSTORM_STORY absent.');
  invariant(story.schemaVersion === STORY_SCHEMA_VERSION, `Schema narratif ${STORY_SCHEMA_VERSION} attendu.`);
  invariant(story.contentVersion === STORY_CONTENT_VERSION, `Contenu narratif ${STORY_CONTENT_VERSION} attendu.`);
  invariant(Object.isFrozen(story), 'Le registre narratif public doit etre immuable.');

  const expectedBosses = ['rammer', 'kraken', 'drill', 'mantis', 'cyclotron', 'omega'];
  invariant(Array.isArray(story.bossOrder) && story.bossOrder.join(',') === expectedBosses.join(','), 'Ordre narratif des six boss invalide.');
  invariant(Array.isArray(story.acts) && story.acts.length === expectedBosses.length, 'Les six actes narratifs sont requis.');
  invariant(story.intro?.lines?.length >= 3 && story.prologue?.lines?.length >= 3 && story.epilogue?.lines?.length >= 3, 'Introduction, prologue et epilogue complets requis.');
  for (const field of ['kicker', 'status', 'location', 'objective', 'method', 'continueLabel']) invariant(typeof story.prologue?.[field] === 'string' && story.prologue[field].length > 5, `Champ prologue incomplet : ${field}.`);
  invariant(typeof story.getCombatLabel === 'function', 'Helper public des libelles de combat absent.');
  invariant(expectedBosses.every(bossId => Object.keys(story.combatLabels?.[bossId] || {}).length >= 3), 'Libelles de combat incomplets pour les six boss.');

  const contracts = expectedBosses.flatMap(bossId => story.masteryContracts?.[bossId] || []);
  invariant(contracts.length === MASTERY_CONTRACT_COUNT, `${MASTERY_CONTRACT_COUNT} contrats de maitrise requis.`);
  invariant(new Set(contracts.map(contract => contract.id)).size === MASTERY_CONTRACT_COUNT, 'Identifiants de contrats de maitrise dupliques.');
  invariant(contracts.every(contract => typeof contract.metric === 'string' && ['number', 'string'].includes(typeof contract.target)), 'Contrat de maitrise incomplet.');

  return {
    storySchemaVersion: story.schemaVersion,
    storyContentVersion: story.contentVersion,
    acts: story.acts.length,
    masteryContracts: contracts.length,
  };
}

export function validateApplicationContract({ game, story, html, manifest, packageJson }) {
  invariant(packageJson?.version === APP_RELEASE, `Version application ${APP_RELEASE} attendue.`);
  invariant(typeof game === 'string' && typeof story === 'string' && typeof html === 'string', 'Sources game.js, story.js et index.html requises.');
  const storyContract = validateStoryContract(story);

  const ids = htmlIds(html);
  for (const id of REQUIRED_UI_IDS) invariant(ids.has(id), `Contrat UI v2.4 : #${id} absent.`);
  const domReferences = [...game.matchAll(/getElementById\(["']([^"']+)["']\)/g)].map(match => match[1]);
  for (const id of domReferences) invariant(ids.has(id), `Contrat DOM : #${id} reference par game.js mais absent.`);

  const storyTag = html.search(/<script\s+src=["']story\.js["'][^>]*><\/script>/i);
  const gameTag = html.search(/<script\s+src=["']game\.js["'][^>]*><\/script>/i);
  invariant(storyTag >= 0 && gameTag > storyTag, 'story.js doit etre charge avant game.js.');
  invariant(/globalThis\.GEARSTORM_STORY/.test(game), 'Le moteur doit exiger le registre narratif global.');

  invariant(new RegExp(`const\\s+SAVE_KEY\\s*=\\s*["']${escapeRegExp(SAVE_KEY)}["']`).test(game), `Sauvegarde v${SAVE_SCHEMA_VERSION} absente.`);
  invariant(new RegExp(`const\\s+PREVIOUS_SAVE_KEY\\s*=\\s*["']${escapeRegExp(PREVIOUS_SAVE_KEY)}["']`).test(game), 'Cle de migration v3 absente.');
  invariant(new RegExp(`const\\s+OLDER_SAVE_KEY\\s*=\\s*["']${escapeRegExp(OLDER_SAVE_KEY)}["']`).test(game), 'Cle de migration v2 absente.');
  invariant(/version\s*:\s*4\b/.test(game), 'Schema de sauvegarde version 4 absent.');
  for (const field of ['combatHints', 'codexUnlocked', 'rushSnapshot', 'campaignCleared', 'storySeen', 'mastery']) {
    invariant(new RegExp(`\\b${field}\\b`).test(game), `Champ de sauvegarde v4 absent : ${field}.`);
  }
  invariant(/localStorage\.getItem\(PREVIOUS_SAVE_KEY\)/.test(game), 'La migration doit lire la sauvegarde v3.');
  invariant(/localStorage\.getItem\(OLDER_SAVE_KEY\)/.test(game), 'La migration doit conserver la lecture de la sauvegarde v2.');
  invariant(/localStorage\.setItem\(SAVE_KEY,\s*JSON\.stringify\(safe\)\)/.test(game), 'La migration doit persister la sauvegarde assainie sous la cle v4.');

  for (const marker of REQUIRED_GAME_SYSTEMS) {
    invariant(new RegExp(`\\b${escapeRegExp(marker)}\\b`).test(game), `Systeme v2.4 absent : ${marker}.`);
  }

  invariant(/new URLSearchParams\(location\.search\)/.test(game), 'Le routeur de lancement doit lire la query string.');
  invariant(/get\(["']mode["']\)/.test(game), 'Le routeur de lancement doit lire le parametre mode.');
  invariant((game.match(/\brouteLaunchMode\(\)/g) || []).length >= 2, 'Le routeur de lancement est defini mais jamais appele.');
  const routeBlock = game.slice(game.indexOf('function routeLaunchMode'), game.indexOf('function applySettings'));
  invariant(!/startRun|startFight|unlockAudio/.test(routeBlock), 'Un raccourci PWA ne doit pas demarrer combat ou audio sans geste utilisateur.');
  const shortcuts = new Set((manifest?.shortcuts || []).map(shortcut => shortcut.url));
  for (const url of ['./?mode=rush', './?mode=practice']) invariant(shortcuts.has(url), `Raccourci PWA absent : ${url}.`);

  invariant(html.includes('GEARSTORM: Boss Circuit v2.4'), 'Metadonnees HTML v2.4 absentes.');
  invariant(!/GEARSTORM: Boss Circuit v2\.[23]\b/.test(html), 'Metadonnee HTML encore figee sur une ancienne version.');
  invariant(/qaAllowed[\s\S]+__GEARSTORM_QA__/.test(game), 'Surface QA locale absente ou non protegee.');
  const rigDiagnosticsBlock = game.slice(game.indexOf('function getRigDiagnostics'), game.indexOf('function drawRigDebugOverlay'));
  for (const field of ['phaseCounts', 'hitbox', 'weakPoint', 'feetLocalY', 'muzzle', 'transitionExplosionOnly']) {
    invariant(new RegExp(`\\b${field}\\b`).test(rigDiagnosticsBlock), `Diagnostic de rig incomplet : ${field}.`);
  }
  const qaBlock = game.slice(game.indexOf("Object.defineProperty(window, '__GEARSTORM_QA__'"));
  for (const marker of ['getRigDiagnostics', 'getRushSnapshot', 'resumeRush', 'setRigDebug', 'launchMode']) {
    invariant(new RegExp(`\\b${marker}\\b`).test(qaBlock), `Diagnostic QA v2.4 absent : ${marker}.`);
  }

  return {
    appRelease: APP_RELEASE,
    saveSchemaVersion: SAVE_SCHEMA_VERSION,
    uiIds: REQUIRED_UI_IDS.length,
    gameSystems: REQUIRED_GAME_SYSTEMS.length,
    ...storyContract,
  };
}
