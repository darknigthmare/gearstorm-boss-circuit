import vm from 'node:vm';

export const APP_RELEASE = '2.8.0';
export const SAVE_SCHEMA_VERSION = 5;
export const SAVE_KEY = 'gearstorm_boss_circuit_save_v5';
export const PREVIOUS_SAVE_KEY = 'gearstorm_boss_circuit_save_v4';
export const OLDER_SAVE_KEY = 'gearstorm_boss_circuit_save_v3';
export const V2_SAVE_KEY = 'gearstorm_boss_circuit_save_v2';
export const STORY_SCHEMA_VERSION = 1;
export const STORY_CONTENT_VERSION = '1.0.0';
export const EXPANSION_STORY_SCHEMA_VERSION = 1;
export const EXPANSION_STORY_CONTENT_VERSION = '1.0.0';
export const CAMPAIGN_BOSS_COUNT = 6;
export const FORGE_BOSS_COUNT = 24;
export const PLAYABLE_BOSS_COUNT = CAMPAIGN_BOSS_COUNT + FORGE_BOSS_COUNT;
export const PHASE_COUNT = PLAYABLE_BOSS_COUNT * 3;
export const STORY_MASTERY_CONTRACT_COUNT = 18;
export const EXPANSION_MASTERY_CONTRACT_COUNT = 72;
export const MASTERY_CONTRACT_COUNT = STORY_MASTERY_CONTRACT_COUNT + EXPANSION_MASTERY_CONTRACT_COUNT;
export const DIST_BUDGET_BYTES = 24 * 1024 * 1024;

export const CAMPAIGN_BOSS_IDS = Object.freeze(['rammer', 'kraken', 'drill', 'mantis', 'cyclotron', 'omega']);
export const FORGE_BOSS_IDS = Object.freeze([
  'bastion-ricochet', 'hydraulic-warden', 'hive-foreman', 'echo-fencer', 'breaker-array', 'vertical-verdict',
  'rail-tyrant', 'triplex-hunter', 'ground-eater', 'floodline-leviathan', 'centrifuge-zero', 'tempest-regulator',
  'ascension-frame', 'counterforge', 'carrier-cathedral', 'twin-governors', 'loadout-reactor', 'orbital-famine',
  'logic-crucible', 'vector-vault', 'skyborne-battery', 'endurance-engine', 'adaptive-archivist', 'null-crown',
]);
export const PLAYABLE_BOSS_IDS = Object.freeze([...CAMPAIGN_BOSS_IDS, ...FORGE_BOSS_IDS]);

export const REQUIRED_UI_IDS = Object.freeze([
  'export-save',
  'import-save',
  'import-save-file',
  'update-app',
  'continue-run',
  'continue-forge',
  'forge-circuit-card',
  'forge-run-summary',
  'forge-wave-progress',
  'forge-rush-start',
  'forge-ending-screen',
  'forge-ending-summary',
  'forge-ending-stats',
  'forge-ending-restart',
  'forge-ending-menu',
  'forge',
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
  'normalizeSaveData',
  'exportSaveFile',
  'importSaveFile',
  'registerGearstormServiceWorker',
  'sanitizeUpgradeOffer',
  'enduranceRoundGateOpen',
  'sanitizeRushSnapshot',
  'sanitizeForgeRushSnapshot',
  'saveForgeRushSnapshot',
  'clearForgeRushSnapshot',
  'resumeForgeRushSnapshot',
  'syncContinueForge',
  'getForgeRunState',
  'showForgeEnding',
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
  'BOSS_REGISTRY',
  'EXPANSION_STORY',
  'launchForgeBoss',
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
  invariant(!/(?:document|window|localStorage)\s*(?:\.|\[)/.test(storySource), 'story.js doit rester declaratif et independant du DOM.');

  const context = vm.createContext({});
  new vm.Script(storySource, { filename: 'story.js' }).runInContext(context, { timeout: 1_000 });
  const story = context.GEARSTORM_STORY;
  invariant(story && typeof story === 'object', 'globalThis.GEARSTORM_STORY absent.');
  invariant(story.schemaVersion === STORY_SCHEMA_VERSION, `Schema narratif ${STORY_SCHEMA_VERSION} attendu.`);
  invariant(story.contentVersion === STORY_CONTENT_VERSION, `Contenu narratif ${STORY_CONTENT_VERSION} attendu.`);
  invariant(Object.isFrozen(story), 'Le registre narratif public doit etre immuable.');

  const expectedBosses = CAMPAIGN_BOSS_IDS;
  invariant(Array.isArray(story.bossOrder) && story.bossOrder.join(',') === expectedBosses.join(','), 'Ordre narratif des six boss invalide.');
  invariant(Array.isArray(story.acts) && story.acts.length === expectedBosses.length, 'Les six actes narratifs sont requis.');
  invariant(story.intro?.lines?.length >= 3 && story.prologue?.lines?.length >= 3 && story.epilogue?.lines?.length >= 3, 'Introduction, prologue et epilogue complets requis.');
  for (const field of ['kicker', 'status', 'location', 'objective', 'method', 'continueLabel']) invariant(typeof story.prologue?.[field] === 'string' && story.prologue[field].length > 5, `Champ prologue incomplet : ${field}.`);
  invariant(typeof story.getCombatLabel === 'function', 'Helper public des libelles de combat absent.');
  invariant(expectedBosses.every(bossId => Object.keys(story.combatLabels?.[bossId] || {}).length >= 3), 'Libelles de combat incomplets pour les six boss.');

  const contracts = expectedBosses.flatMap(bossId => story.masteryContracts?.[bossId] || []);
  invariant(contracts.length === STORY_MASTERY_CONTRACT_COUNT, `${STORY_MASTERY_CONTRACT_COUNT} contrats de maitrise campagne requis.`);
  invariant(new Set(contracts.map(contract => contract.id)).size === STORY_MASTERY_CONTRACT_COUNT, 'Identifiants de contrats de maitrise campagne dupliques.');
  invariant(contracts.every(contract => typeof contract.metric === 'string' && ['number', 'string'].includes(typeof contract.target)), 'Contrat de maitrise incomplet.');

  return {
    storySchemaVersion: story.schemaVersion,
    storyContentVersion: story.contentVersion,
    campaignBosses: story.acts.length,
    storyMasteryContracts: contracts.length,
  };
}

export function validateExpansionStoryContract(expansionStorySource) {
  invariant(typeof expansionStorySource === 'string' && expansionStorySource.length > 5_000, 'Source narrative expansion-story.js absente ou incomplete.');
  invariant(!/^\s*(?:import|export)\s/m.test(expansionStorySource), 'expansion-story.js doit rester un script classique charge avant game.js.');
  invariant(!/(?:document|window|localStorage)\s*(?:\.|\[)/.test(expansionStorySource), 'expansion-story.js doit rester declaratif et independant du DOM.');

  const context = vm.createContext({});
  new vm.Script(expansionStorySource, { filename: 'expansion-story.js' }).runInContext(context, { timeout: 1_000 });
  const expansion = context.GEARSTORM_EXPANSION_STORY;
  invariant(expansion && typeof expansion === 'object', 'globalThis.GEARSTORM_EXPANSION_STORY absent.');
  invariant(expansion.schemaVersion === EXPANSION_STORY_SCHEMA_VERSION, 'Schema narratif Forge ' + EXPANSION_STORY_SCHEMA_VERSION + ' attendu.');
  invariant(expansion.contentVersion === EXPANSION_STORY_CONTENT_VERSION, 'Contenu narratif Forge ' + EXPANSION_STORY_CONTENT_VERSION + ' attendu.');
  invariant(expansion.runtimeIntegrated === true, 'Le contenu Forge doit etre marque integre au runtime.');
  invariant(Object.isFrozen(expansion), 'Le registre narratif Forge public doit etre immuable.');

  const bosses = Array.from(expansion.bosses || []);
  invariant(bosses.length === FORGE_BOSS_COUNT, FORGE_BOSS_COUNT + ' boss Forge narratifs requis.');
  invariant(bosses.map(boss => boss.id).join(',') === FORGE_BOSS_IDS.join(','), 'Ordre narratif des 24 boss Forge invalide.');
  invariant(bosses.every(boss => Array.isArray(boss.phaseTitles) && boss.phaseTitles.length === 3), 'Trois titres de phase sont requis pour chaque boss Forge.');

  const contracts = bosses.flatMap(boss => Array.from(boss.masteryContracts || []));
  invariant(contracts.length === EXPANSION_MASTERY_CONTRACT_COUNT, EXPANSION_MASTERY_CONTRACT_COUNT + ' contrats Forge requis.');
  invariant(new Set(contracts.map(contract => contract.id)).size === EXPANSION_MASTERY_CONTRACT_COUNT, 'Identifiants de contrats Forge dupliques.');
  invariant(typeof expansion.getBossById === 'function' && typeof expansion.getMasteryContracts === 'function', 'Helpers narratifs Forge absents.');

  return {
    expansionStorySchemaVersion: expansion.schemaVersion,
    expansionStoryContentVersion: expansion.contentVersion,
    forgeBosses: bosses.length,
    expansionMasteryContracts: contracts.length,
  };
}

export function validateBossRosterContract(bossRosterSource) {
  invariant(typeof bossRosterSource === 'string' && bossRosterSource.length > 5_000, 'Source boss-roster.js absente ou incomplete.');
  invariant(!/^\s*(?:import|export)\s/m.test(bossRosterSource), 'boss-roster.js doit rester un script classique charge avant game.js.');

  const context = vm.createContext({});
  new vm.Script(bossRosterSource, { filename: 'boss-roster.js' }).runInContext(context, { timeout: 1_000 });
  const roster = context.GEARSTORM_BOSS_ROSTER;
  invariant(roster && typeof roster === 'object', 'globalThis.GEARSTORM_BOSS_ROSTER absent.');
  invariant(roster.schemaVersion === 1, 'Schema du roster boss 1 attendu.');
  invariant(Object.isFrozen(roster), 'Le roster boss public doit etre immuable.');

  const bosses = Array.from(roster.all || []);
  invariant(bosses.length === PLAYABLE_BOSS_COUNT, PLAYABLE_BOSS_COUNT + ' boss jouables requis.');
  invariant(bosses.map(boss => boss.id).join(',') === PLAYABLE_BOSS_IDS.join(','), 'Ordre des 30 boss jouables invalide.');
  invariant(Array.from(roster.campaign?.() || []).length === CAMPAIGN_BOSS_COUNT, 'Six boss campagne requis.');
  const expanded = Array.from(roster.expanded?.() || []);
  invariant(expanded.length === FORGE_BOSS_COUNT, 'Vingt-quatre boss Forge requis.');
  invariant(bosses.every(boss => Array.isArray(boss.phases) && boss.phases.length === 3), 'Trois phases jouables sont requises par boss.');
  invariant(bosses.reduce((total, boss) => total + boss.phases.length, 0) === PHASE_COUNT, PHASE_COUNT + ' phases jouables requises.');
  invariant(expanded.every(boss => boss.status === 'forge-playable' && boss.productionStatus !== 'planned'), 'Tous les boss Forge doivent etre en statut jouable.');
  invariant(expanded.every(boss => boss.artPack?.status === 'generated' && boss.artPack.bundleId), 'Chaque boss Forge doit utiliser son sprite genere.');
  invariant(expanded.every(boss => boss.codex?.releaseEligible === true), 'Chaque entree Codex Forge doit etre publiable.');

  const mechanicIds = expanded.map(boss => boss.signature?.mechanicId);
  invariant(mechanicIds.every(mechanicId => typeof mechanicId === 'string' && mechanicId.length > 0), 'Chaque boss Forge doit declarer un mechanicId.');
  invariant(new Set(mechanicIds).size === FORGE_BOSS_COUNT, 'Les 24 mechanicId Forge doivent etre uniques.');

  const phaseStateGroups = expanded.map(boss => boss.signature?.phaseStates);
  invariant(phaseStateGroups.every(states => Array.isArray(states) && states.length === 3), 'Chaque signature Forge doit declarer exactement 3 phaseStates.');
  const phaseStates = phaseStateGroups.flat();
  invariant(phaseStates.every(state => typeof state === 'string' && state.length > 0), 'Chaque phaseState Forge doit etre une chaine non vide.');
  invariant(phaseStates.length === FORGE_BOSS_COUNT * 3, '72 phaseStates Forge requis.');
  invariant(new Set(phaseStates).size === FORGE_BOSS_COUNT * 3, 'Les 72 phaseStates Forge doivent etre globalement uniques.');

  invariant(typeof roster.createRuntime === 'function' && expanded.every(boss => roster.createRuntime(boss.id)?.id === boss.id), 'Runtime partage Forge incomplet.');
  invariant(roster.resolveLaunchMode?.('forge') === 'forge', 'Mode de lancement Forge absent.');
  invariant(roster.validate?.().valid === true, 'Le roster boss refuse son propre contrat de validation.');

  return {
    playableBosses: bosses.length,
    playablePhases: PHASE_COUNT,
    forgeSignatures: expanded.length,
    forgeMechanicIds: mechanicIds.length,
    forgePhaseStates: phaseStates.length,
  };
}

export function validateApplicationContract({ game, story, expansionStory, bossRoster, html, manifest, packageJson }) {
  invariant(packageJson?.version === APP_RELEASE, `Version application ${APP_RELEASE} attendue.`);
  invariant(typeof game === 'string' && typeof story === 'string' && typeof html === 'string', 'Sources game.js, story.js et index.html requises.');
  const storyContract = validateStoryContract(story);
  const hasForgeSources = typeof expansionStory === 'string' || typeof bossRoster === 'string';
  invariant(!hasForgeSources || (typeof expansionStory === 'string' && typeof bossRoster === 'string'), 'expansion-story.js et boss-roster.js doivent etre valides ensemble.');
  const expansionStoryContract = hasForgeSources ? validateExpansionStoryContract(expansionStory) : {};
  const bossRosterContract = hasForgeSources ? validateBossRosterContract(bossRoster) : {};

  const ids = htmlIds(html);
  for (const id of REQUIRED_UI_IDS) invariant(ids.has(id), `Contrat UI v2.8 : #${id} absent.`);
  const domReferences = [...game.matchAll(/getElementById\(["']([^"']+)["']\)/g)].map(match => match[1]);
  for (const id of domReferences) invariant(ids.has(id), `Contrat DOM : #${id} reference par game.js mais absent.`);

  const pwaBootstrapTag = html.search(/<script\s+src=["']pwa-update-v2\.8\.0\.js["'][^>]*><\/script>/i);
  const storyTag = html.search(/<script\s+src=["']story\.js["'][^>]*><\/script>/i);
  const expansionStoryTag = html.search(/<script\s+src=["']expansion-story\.js["'][^>]*><\/script>/i);
  const bossRosterTag = html.search(/<script\s+src=["']boss-roster\.js["'][^>]*><\/script>/i);
  const gameTag = html.search(/<script\s+src=["']game\.js["'][^>]*><\/script>/i);
  invariant(pwaBootstrapTag >= 0 && pwaBootstrapTag < storyTag, 'Le bootstrap PWA versionne doit etre charge avant le runtime.');
  invariant(storyTag >= 0 && gameTag > storyTag, 'story.js doit etre charge avant game.js.');
  if (hasForgeSources) {
    invariant(expansionStoryTag > storyTag && bossRosterTag > expansionStoryTag && gameTag > bossRosterTag, 'Ordre shell requis : story, expansion-story, boss-roster, game.');
  }
  invariant(/globalThis\.GEARSTORM_STORY/.test(game), 'Le moteur doit exiger le registre narratif global.');
  if (hasForgeSources) {
    invariant(/globalThis\.GEARSTORM_BOSS_ROSTER/.test(game), 'Le moteur doit charger le roster boss global.');
    invariant(/globalThis\.GEARSTORM_EXPANSION_STORY/.test(game), 'Le moteur doit charger le registre narratif Forge global.');
  }

  invariant(new RegExp(`const\\s+SAVE_KEY\\s*=\\s*["']${escapeRegExp(SAVE_KEY)}["']`).test(game), `Sauvegarde v${SAVE_SCHEMA_VERSION} absente.`);
  invariant(new RegExp(`const\\s+PREVIOUS_SAVE_KEY\\s*=\\s*["']${escapeRegExp(PREVIOUS_SAVE_KEY)}["']`).test(game), 'Cle de migration v3 absente.');
  invariant(new RegExp(`const\\s+OLDER_SAVE_KEY\\s*=\\s*["']${escapeRegExp(OLDER_SAVE_KEY)}["']`).test(game), 'Cle de migration v2 absente.');
  invariant(/version\s*:\s*5\b/.test(game), 'Schema de sauvegarde version 5 absent.');
  for (const field of ['combatHints', 'codexUnlocked', 'rushSnapshot', 'campaignCleared', 'storySeen', 'mastery', 'bestForgeRush', 'forgeCompleted', 'forgeCleared', 'forgeRushSnapshot']) {
    invariant(new RegExp(`\\b${field}\\b`).test(game), `Champ de sauvegarde v5 absent : ${field}.`);
  }
  invariant(/localStorage\.getItem\(PREVIOUS_SAVE_KEY\)/.test(game), 'La migration doit lire la sauvegarde v3.');
  invariant(/localStorage\.getItem\(OLDER_SAVE_KEY\)/.test(game), 'La migration doit conserver la lecture de la sauvegarde v3.');
  invariant(/localStorage\.getItem\(V2_SAVE_KEY\)/.test(game), 'La migration doit conserver la lecture de la sauvegarde v2.');
  invariant(/localStorage\.setItem\(SAVE_KEY,\s*JSON\.stringify\(safe\)\)/.test(game), 'La migration doit persister la sauvegarde assainie sous la cle v5.');

  for (const marker of REQUIRED_GAME_SYSTEMS) {
    invariant(new RegExp(`\\b${escapeRegExp(marker)}\\b`).test(game), `Systeme v2.8 absent : ${marker}.`);
  }

  invariant(/new URLSearchParams\(location\.search\)/.test(game), 'Le routeur de lancement doit lire la query string.');
  invariant(/get\(["']mode["']\)/.test(game), 'Le routeur de lancement doit lire le parametre mode.');
  invariant((game.match(/\brouteLaunchMode\(\)/g) || []).length >= 2, 'Le routeur de lancement est defini mais jamais appele.');
  const routeBlock = game.slice(game.indexOf('function routeLaunchMode'), game.indexOf('function applySettings'));
  invariant(!/startRun|startFight|unlockAudio/.test(routeBlock), 'Un raccourci PWA ne doit pas demarrer combat ou audio sans geste utilisateur.');
  const shortcuts = new Set((manifest?.shortcuts || []).map(shortcut => shortcut.url));
  for (const url of ['./?mode=rush', './?mode=practice', './?mode=forge', './?mode=forgeRush']) invariant(shortcuts.has(url), `Raccourci PWA absent : ${url}.`);

  invariant(html.includes('GEARSTORM: Boss Circuit v2.8'), 'Metadonnees HTML v2.8 absentes.');
  invariant(!/GEARSTORM: Boss Circuit v2\.[2-7]\b/.test(html), 'Metadonnee HTML encore figee sur une ancienne version.');
  invariant(/qaAllowed[\s\S]+__GEARSTORM_QA__/.test(game), 'Surface QA locale absente ou non protegee.');
  const rigDiagnosticsBlock = game.slice(game.indexOf('function getRigDiagnostics'), game.indexOf('function drawRigDebugOverlay'));
  for (const field of ['phaseCounts', 'hitbox', 'weakPoint', 'feetLocalY', 'muzzle', 'transitionExplosionOnly']) {
    invariant(new RegExp(`\\b${field}\\b`).test(rigDiagnosticsBlock), `Diagnostic de rig incomplet : ${field}.`);
  }
  const qaBlock = game.slice(game.indexOf("Object.defineProperty(window, '__GEARSTORM_QA__'"));
  for (const marker of ['getRigDiagnostics', 'getRushSnapshot', 'resumeRush', 'getForgeRunState', 'getForgeContractCoverage', 'processGamepad', 'startForgeRush', 'resumeForgeRush', 'setRigDebug', 'launchMode']) {
    invariant(new RegExp(`\\b${marker}\\b`).test(qaBlock), `Diagnostic QA v2.8 absent : ${marker}.`);
  }

  return {
    appRelease: APP_RELEASE,
    saveSchemaVersion: SAVE_SCHEMA_VERSION,
    uiIds: REQUIRED_UI_IDS.length,
    gameSystems: REQUIRED_GAME_SYSTEMS.length,
    ...storyContract,
    ...expansionStoryContract,
    ...bossRosterContract,
    masteryContracts: STORY_MASTERY_CONTRACT_COUNT + (expansionStoryContract.expansionMasteryContracts || 0),
  };
}
