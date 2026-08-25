import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import vm from 'node:vm';
import {
  APP_RELEASE,
  PREVIOUS_SAVE_KEY,
  REQUIRED_GAME_SYSTEMS,
  REQUIRED_UI_IDS,
  SAVE_KEY,
  SAVE_SCHEMA_VERSION,
  validateApplicationContract,
  validateBossRosterContract,
} from '../scripts/app-contract.mjs';

const [html, css, story, expansionStorySource, game, bossRosterSource, readme, design, packageJson, manifest, artManifest] = await Promise.all([
  readFile('index.html', 'utf8'),
  readFile('styles.css', 'utf8'),
  readFile('story.js', 'utf8'),
  readFile('expansion-story.js', 'utf8'),
  readFile('game.js', 'utf8'),
  readFile('boss-roster.js', 'utf8'),
  readFile('README.md', 'utf8'),
  readFile('DESIGN.md', 'utf8'),
  readFile('package.json', 'utf8').then(JSON.parse),
  readFile('manifest.webmanifest', 'utf8').then(JSON.parse),
  readFile('assets/generated/v2.11.0/asset-manifest.json', 'utf8').then(JSON.parse),
]);

const rosterContext = {};
vm.runInNewContext(expansionStorySource, rosterContext, { filename: 'expansion-story.js' });
vm.runInNewContext(bossRosterSource, rosterContext, { filename: 'boss-roster.js' });
const bossRoster = rosterContext.GEARSTORM_BOSS_ROSTER;
const EXPANSION_BOSS_CONTRACT = [
  ['bastion-ricochet', 'BASTION RICOCHET'], ['hydraulic-warden', 'HYDRAULIC WARDEN'],
  ['hive-foreman', 'HIVE FOREMAN'], ['echo-fencer', 'ECHO FENCER'],
  ['breaker-array', 'BREAKER ARRAY'], ['vertical-verdict', 'VERTICAL VERDICT'],
  ['rail-tyrant', 'RAIL TYRANT'], ['triplex-hunter', 'TRIPLEX HUNTER'],
  ['ground-eater', 'GROUND EATER'], ['floodline-leviathan', 'FLOODLINE LEVIATHAN'],
  ['centrifuge-zero', 'CENTRIFUGE ZERO'], ['tempest-regulator', 'TEMPEST REGULATOR'],
  ['ascension-frame', 'ASCENSION FRAME'], ['counterforge', 'COUNTERFORGE'],
  ['carrier-cathedral', 'CARRIER CATHEDRAL'], ['twin-governors', 'TWIN GOVERNORS'],
  ['loadout-reactor', 'LOADOUT REACTOR'], ['orbital-famine', 'ORBITAL FAMINE'],
  ['logic-crucible', 'LOGIC CRUCIBLE'], ['vector-vault', 'VECTOR VAULT'],
  ['skyborne-battery', 'SKYBORNE BATTERY'], ['endurance-engine', 'ENDURANCE ENGINE'],
  ['adaptive-archivist', 'ADAPTIVE ARCHIVIST'], ['null-crown', 'NULL CROWN'],
];

function extractNamedFunction(source, name) {
  const start = source.indexOf(`function ${name}(`);
  assert.notEqual(start, -1, `fonction introuvable: ${name}`);
  const bodyStart = source.indexOf('{', start);
  let depth = 0;
  for (let index = bodyStart; index < source.length; index += 1) {
    if (source[index] === '{') depth += 1;
    if (source[index] === '}' && --depth === 0) return source.slice(start, index + 1);
  }
  throw new Error(`fonction non fermee: ${name}`);
}

test('la marque et les six boss GEARSTORM sont presents', () => {
  assert.match(html, /GEARSTORM/);
  for (const name of ['RIVET REX', 'SKY SLICER', 'MAGNETRON', 'CHRONO MANTIS', 'FOUNDRY TITAN', 'CROWN ENGINE \u03a9']) {
    assert.match(game, new RegExp(name));
  }
  assert.equal([...game.matchAll(/^\s+id: '(rammer|kraken|drill|mantis|cyclotron|omega)'/gm)].length, 6);
  assert.doesNotMatch(html + readme + design, /GEARGRIN|PROTOTYPE JOUABLE/);
});

test('les libelles de contenu restent alignes aux mecaniques jouables', () => {
  assert.doesNotMatch(html + game + readme + design, /drones ioniques|ferraille orbitale|quatre marteaux|six réacteurs|toutes les technologies du Circuit/i);
  for (const label of ['SALVES IONIQUES', 'ÉRUPTION MAGNÉTIQUE', 'LAMES DÉPHASÉES', 'PLUIE DE MÉTAL EN FUSION', 'CHUTE DE PRESSE']) {
    assert.match(story, new RegExp(label));
  }
  assert.match(game, /STORY\.getCombatLabel/);
});

test('le contrat applicatif complet est respecte', () => {
  assert.doesNotThrow(() => validateApplicationContract({ game, story, expansionStory: expansionStorySource, bossRoster: bossRosterSource, html, manifest, packageJson }));
  assert.equal(packageJson.version, APP_RELEASE);
});

test('le contrat release refuse les signatures Forge dupliquees ou incompletes', () => {
  const summary = validateBossRosterContract(bossRosterSource);
  assert.equal(summary.forgeSignatures, 24);
  assert.equal(summary.forgeMechanicIds, 24);
  assert.equal(summary.forgePhaseStates, 72);

  const internalGate = "  if (!validation.valid) throw new Error('Registre GEARSTORM invalide : ' + validation.errors.join(' | '));";
  const contractOnlySource = bossRosterSource.replace(internalGate, '  if (!validation.valid) void validation;');
  assert.notEqual(contractOnlySource, bossRosterSource);

  const duplicateMechanicId = contractOnlySource.replace("mechanicId: 'pressure-refuge'", "mechanicId: 'relay-bank'");
  assert.throws(() => validateBossRosterContract(duplicateMechanicId), /24 mechanicId Forge doivent etre uniques/);

  const incompletePhaseStates = contractOnlySource.replace(
    "phaseStates: ['angle-lock', 'cross-bank', 'relay-drift']",
    "phaseStates: ['angle-lock', 'cross-bank']"
  );
  assert.throws(() => validateBossRosterContract(incompletePhaseStates), /exactement 3 phaseStates/);

  const duplicatePhaseState = contractOnlySource.replace("'ram-prime'", "'angle-lock'");
  assert.throws(() => validateBossRosterContract(duplicatePhaseState), /72 phaseStates Forge doivent etre globalement uniques/);
});

test('tous les identifiants DOM utilises par le moteur existent et sont uniques', () => {
  const allIds = [...html.matchAll(/\sid="([^"]+)"/g)].map(match => match[1]);
  const ids = new Set(allIds);
  assert.equal(ids.size, allIds.length);
  const references = [...game.matchAll(/getElementById\(["']([^"']+)["']\)/g)].map(match => match[1]);
  assert.ok(references.length > 30);
  for (const id of references) assert.ok(ids.has(id), `id manquant: ${id}`);
  for (const id of REQUIRED_UI_IDS) assert.ok(ids.has(id), `surface v2.9 manquante: ${id}`);
});

test('pause vers titre conserve les ouvreurs Options et Codex pour le retour focus', () => {
  let document;
  class FakeElement {
    constructor(id, parent = null) {
      this.id = id;
      this.parent = parent;
      this.active = false;
      this.hidden = false;
      this.disabled = false;
      this.firstFocusable = null;
      this.classList = { toggle: (name, active) => { if (name === 'active') this.active = active; } };
    }
    contains(element) {
      for (let current = element; current; current = current.parent) if (current === this) return true;
      return false;
    }
    focus() { document.activeElement = this; }
    hasAttribute(name) { return name === 'disabled' && this.disabled; }
    querySelector() { return this.firstFocusable; }
    setAttribute() {}
  }

  const title = new FakeElement('title-screen');
  const pause = new FakeElement('pause-screen');
  const settings = new FakeElement('settings-screen');
  const codex = new FakeElement('codex-screen');
  const start = new FakeElement('start-button', title);
  const quit = new FakeElement('pause-quit', pause);
  const optionsButton = new FakeElement('settings-button', title);
  const codexButton = new FakeElement('codex-button', title);
  const settingsBack = new FakeElement('settings-back', settings);
  const codexBack = new FakeElement('codex-back', codex);
  title.firstFocusable = start;
  pause.firstFocusable = quit;
  settings.firstFocusable = settingsBack;
  codex.firstFocusable = codexBack;
  pause.active = true;
  const screens = [title, pause, settings, codex];
  document = {
    activeElement: quit,
    getElementById: id => screens.find(screen => screen.id === id) || null,
    querySelector: selector => selector === '.screen.active' ? screens.find(screen => screen.active) || null : null,
  };
  const pendingFrames = [];
  const flushFrames = () => { while (pendingFrames.length) pendingFrames.shift()(); };
  const showScreen = vm.runInNewContext(`(${extractNamedFunction(game, 'showScreen')})`, {
    document, HTMLElement: FakeElement, requestAnimationFrame: callback => pendingFrames.push(callback),
    screenOpeners: new Map(), screenTransitionId: 0, screens,
  });

  showScreen('title-screen');
  document.activeElement = optionsButton;
  showScreen('settings-screen');
  document.activeElement = settingsBack;
  showScreen('title-screen');
  flushFrames();
  assert.equal(document.activeElement, optionsButton);

  document.activeElement = codexButton;
  showScreen('codex-screen');
  document.activeElement = codexBack;
  showScreen('title-screen');
  flushFrames();
  assert.equal(document.activeElement, codexButton);
});

test('la sauvegarde v6 migre v5 a v2, preserve l heritage et porte les deux reprises', () => {
  assert.match(game, /gearstorm_boss_circuit_save_v6/);
  assert.match(game, /gearstorm_boss_circuit_save_v5/);
  assert.match(game, /gearstorm_boss_circuit_save_v4/);
  assert.match(game, /gearstorm_boss_circuit_save_v3/);
  assert.match(game, /gearstorm_boss_circuit_save_v2/);
  assert.match(game, /version\s*:\s*6\b/);
  for (const field of ['records', 'combatHints', 'codexUnlocked', 'rushSnapshot', 'forgeRushSnapshot', 'forgeCleared', 'forgeCompleted', 'campaignCleared', 'storySeen', 'mastery', 'splits']) assert.match(game, new RegExp('\\b' + field + '\\b'));
  assert.match(game, /const candidates = \[SAVE_KEY, PREVIOUS_SAVE_KEY, V4_SAVE_KEY, V3_SAVE_KEY, V2_SAVE_KEY, LEGACY_SAVE_KEY\]/);
  assert.match(game, /for \(const key of candidates\)[\s\S]+localStorage\.getItem\(key\)/);
  assert.match(game, /localStorage\.setItem\(SAVE_KEY,\s*JSON\.stringify\(safe\)\)/);
  for (const marker of ['sanitizeRushSnapshot', 'saveRushSnapshot', 'clearRushSnapshot', 'resumeRushSnapshot', 'syncContinueRun', 'sanitizeForgeRushSnapshot', 'saveForgeRushSnapshot', 'clearForgeRushSnapshot', 'resumeForgeRushSnapshot', 'syncContinueForge']) {
    assert.match(game, new RegExp('\\b' + marker + '\\b'));
  }
});

test('une sauvegarde v5 valide reste chargee si sa persistance v6 depasse le quota', () => {
  const legacy = { version: 5, unlocked: 3, completed: false };
  let defaultCalls = 0;
  let writeCalls = 0;
  const localStorage = {
    getItem: key => key === PREVIOUS_SAVE_KEY ? JSON.stringify(legacy) : null,
    setItem: (key, value) => {
      assert.equal(key, SAVE_KEY);
      assert.equal(JSON.parse(value).unlocked, 3);
      writeCalls += 1;
      const error = new Error('quota test');
      error.name = 'QuotaExceededError';
      throw error;
    },
  };
  const loadSave = vm.runInNewContext(`(${extractNamedFunction(game, 'loadSave')})`, {
    SAVE_KEY,
    PREVIOUS_SAVE_KEY,
    V4_SAVE_KEY: 'gearstorm_boss_circuit_save_v4',
    V3_SAVE_KEY: 'gearstorm_boss_circuit_save_v3',
    V2_SAVE_KEY: 'gearstorm_boss_circuit_save_v2',
    LEGACY_SAVE_KEY: 'gearstorm_boss_circuit_save',
    localStorage,
    normalizeSaveData: parsed => ({ ...parsed, normalized: true }),
    createDefaultSave: () => { defaultCalls += 1; return { version: 6, unlocked: 1 }; },
  });

  const restored = loadSave();
  assert.equal(restored.version, 5);
  assert.equal(restored.unlocked, 3);
  assert.equal(restored.normalized, true);
  assert.equal(writeCalls, 1);
  assert.equal(defaultCalls, 0);
});

test('le guidage, le codex et le recapitulatif de campagne sont cables', () => {
  for (const marker of ['buildCodex', 'syncCombatGuidance', 'combatHints', 'codexUnlocked']) {
    assert.match(game, new RegExp(`\\b${marker}\\b`));
  }
  for (const id of ['codex-screen', 'codex-grid', 'codex-progress', 'campaign-progress', 'campaign-next', 'combat-objective', 'combat-mechanic', 'combat-hint', 'pause-build', 'pause-objective', 'result-build', 'result-lore']) {
    assert.match(html, new RegExp(`id=["']${id}["']`));
  }
  assert.match(css, /codex|combat-hint|campaign-progress/);
  for (const marker of ['VOIE ', 'SÛRE', 'PROCHAINE FORME', 'RÉSERVE ORBITALE', 'ENVIRONNEMENT']) assert.match(game, new RegExp(marker));
  assert.match(game, /block\.dataset\.speaker = line\.speaker/);
});

test('le cache raster borne les bundles boss sans expulser le rig de Riva', () => {
  assert.match(game, /const MAX_CACHED_BOSS_BUNDLES = 3/);
  assert.match(game, /function evictGeneratedBossBundles/);
  assert.match(game, /generatedArtBossEntries\(evictedId\)/);
  assert.match(game, /cachedBossIds: \[\.\.\.artRuntime\.bossBundleOrder\]/);
  assert.doesNotMatch(game.slice(game.indexOf('function evictGeneratedBossBundles'), game.indexOf('function preloadGeneratedBossBundle')), /generatedArtCoreEntries\(\)/);
});

test('la passe meta v2.11 reste visible dans la Forge et les quatre tableaux narratifs', () => {
  for (const marker of ['buildForgeCodex', 'syncForgeResultTransmission']) {
    assert.match(game, new RegExp(`\\b${marker}\\b`));
  }
  for (const id of ['result-forge-transmission', 'result-forge-transmission-label', 'result-forge-transmission-copy', 'forge-codex-section', 'forge-codex-progress', 'forge-codex-grid', 'forge-codex-empty']) {
    assert.match(html, new RegExp(`id=["']${id}["']`));
  }
  for (const filename of ['intro-broadcast', 'prologue-m0', 'campaign-ending', 'forge-ending']) {
    assert.match(css, new RegExp(`assets/generated/v2\\.11\\.0/narrative/${filename}\\.webp`));
  }
  const expansion = rosterContext.GEARSTORM_EXPANSION_STORY;
  assert.equal(expansion.bosses.length, 24);
  assert.equal(new Set(expansion.bosses.map(boss => boss.metaLine)).size, 24);
  assert.ok(expansion.bosses.every(boss => boss.metaLine.length > 24));
  assert.ok(expansion.bosses.every(boss => boss.interlude.length >= 3));
  assert.equal(expansion.waves.length, 4);
  assert.ok(expansion.waves.every(wave => wave.title.length > 4 && wave.premise.length > 24));
  assert.ok(expansion.forgeCircuit.epilogue.outcome.length > 40);
  assert.match(game, /profile\.interlude/);
  assert.match(game, /profile\.metaLine/);
});

test('les rigs generes et leur diagnostic QA sont explicites', () => {
  for (const marker of ['heroineRigParts', 'heroAnatomyPose', 'getArenaVisualOffset', 'BOSS_RIGS', 'drawRigPart', 'getRigDiagnostics']) {
    assert.match(game, new RegExp(`\\b${marker}\\b`));
  }
  const rigDiagnosticsBlock = game.slice(game.indexOf('function getRigDiagnostics'), game.indexOf('function drawRigDebugOverlay'));
  for (const field of ['phaseCounts', 'hitbox', 'weakPoint', 'feetLocalY', 'muzzle', 'transitionExplosionOnly']) {
    assert.match(rigDiagnosticsBlock, new RegExp(`\\b${field}\\b`));
  }
  const qaBlock = game.slice(game.indexOf("Object.defineProperty(window, '__GEARSTORM_QA__'"));
  for (const marker of ['getRigDiagnostics', 'getRushSnapshot', 'resumeRush', 'setRigDebug', 'launchMode']) {
    assert.match(qaBlock, new RegExp(`\\b${marker}\\b`));
  }
  assert.match(game, /(?:QA_ALLOWED|qaAllowed)[\s\S]+127\.0\.0\.1[\s\S]+localhost/);
});

test('le rig anatomique OpenAI v2.11 de Riva garde quatorze pieces dont canon et avant-bras independants', () => {
  const playerRenderer = game.slice(game.indexOf('function drawGeneratedPlayer'), game.indexOf('function bossRigPose'));
  assert.match(playerRenderer, /heroineRigParts\(\)/);
  assert.match(playerRenderer, /heroRigContext/);
  assert.match(playerRenderer, /drawRigPart\(parts\[spec\.name\]/);
  assert.match(game, /rigParts\.length === 16/);
  assert.match(game, /anatomyParts\.length === 14/);
  assert.match(game, /const RIVA_RENDER_SCALE = 1\.10/);
  assert.match(game, /const RIVA_ROAD_LIFT = 10/);
  assert.match(game, /const RIVA_CANNON_RECOIL = 12/);
  assert.match(game, /const RIVA_FOOT_OFFSET = 3\.6/);
  assert.match(game, /spawnDust\(player\.x, GROUND - \(heroArtReady\(\) \? RIVA_ROAD_LIFT : 0\), 7\)/);
  assert.match(game, /assets\/generated\/v2\.11\.0\/asset-manifest\.json/);
  assert.match(game, /RIVA_CANNON_MOUNT_PART = 'forearm-near'/);
  assert.match(game, /RIVA_CANNON_PART = 'cannon-near'/);
  assert.doesNotMatch(game, /body-core|firing-arm/);
  assert.match(game, /visualOffsetY/);
  const playerRendererBlock = game.slice(game.indexOf('function playerRenderAlpha'), game.indexOf('function drawBoss'));
  const drawPlayerStart = game.indexOf('function drawPlayer()');
  const shadow = game.slice(
    drawPlayerStart,
    game.indexOf('ctx.translate(player.x, player.y)', drawPlayerStart)
  );
  assert.match(shadow, /const shadowLift = heroArtReady\(\) \? RIVA_ROAD_LIFT : 0/);
  assert.match(shadow, /ellipse\(player\.x, GROUND - 3 - shadowLift, 28 \* shadowScale, 6 \* shadowScale/);
  assert.match(shadow, /shadowBlur = 4/);
  assert.doesNotMatch(shadow, /ctx\.stroke\(\)/);
  assert.match(playerRendererBlock, /function playerRenderAlpha\(subject = player\)/);
  assert.match(playerRendererBlock, /return subject\.dashTime > 0 \? 0\.72 : 0\.46/);
  assert.match(playerRendererBlock, /ctx\.globalAlpha \*= playerRenderAlpha\(\);/);
  assert.ok(
    playerRendererBlock.indexOf('ctx.globalAlpha *= playerRenderAlpha();')
      < playerRendererBlock.indexOf('drawGeneratedPlayer()'),
    'le feedback d invulnerabilite doit envelopper le rendu OpenAI et le fallback'
  );
});

test('le registre data-driven livre les 30 boss et les 24 contrats Forge', () => {
  assert.ok(bossRoster);
  assert.equal(bossRoster.validate().valid, true);
  assert.equal(bossRoster.all.length, 30);
  assert.deepEqual([...bossRoster.legacyIds], ['rammer', 'kraken', 'drill', 'mantis', 'cyclotron', 'omega']);
  assert.deepEqual([...bossRoster.plannedIds], EXPANSION_BOSS_CONTRACT.map(([id]) => id));
  assert.equal(bossRoster.campaign().length, 6);
  assert.equal(bossRoster.expanded().length, 24);
  assert.equal(bossRoster.resolveLaunchMode('expanded'), 'forge');
  assert.equal(bossRoster.resolveLaunchMode('forge-rush'), 'forgeRush');
  assert.equal(bossRoster.apiVersion, '1.0.0');
  assert.equal(bossRoster.schemaVersion, 1);
  assert.equal(bossRoster.validate().stats.signatures, 24);
  assert.equal(bossRoster.validate().stats.signatureStates, 72);
  const mechanicIds = new Set();
  const signatureStates = new Set();

  for (const [id, name] of EXPANSION_BOSS_CONTRACT) {
    const entry = bossRoster.get(id);
    assert.equal(entry.name, name, id);
    assert.equal(entry.engine, 'expanded', id);
    assert.equal(entry.status, 'forge-playable', id);
    assert.notEqual(entry.productionStatus, 'planned', id);
    assert.equal(entry.phases.length, 3, id);
    assert.equal(entry.masteryContracts.length, 3, id);
    assert.ok(entry.signature?.mechanicId, id);
    assert.equal(entry.signature.phaseStates.length, 3, id);
    mechanicIds.add(entry.signature.mechanicId);
    entry.signature.phaseStates.forEach(state => signatureStates.add(state));
    entry.phases.forEach((phase, index) => {
      assert.equal(phase.mechanicId, entry.signature.mechanicId, id);
      assert.equal(phase.signatureState, entry.signature.phaseStates[index], id);
    });
    assert.deepEqual([...entry.masteryContracts].map(contract => contract.id), [...rosterContext.GEARSTORM_EXPANSION_STORY.getMasteryContracts(id)].map(contract => contract.id), id);
    assert.ok(entry.parts.some(part => part.role === 'weak-point' && part.hitbox), id);
    assert.equal(entry.artPack.status, 'generated', id);
    assert.equal(entry.artPack.layout, 'rig-v2', id);
    assert.equal(entry.artPack.bundleId, id, id);
    assert.equal(entry.artPack.proceduralFallback, true, id);
    assert.equal(entry.arenaPack.status, 'generated', id);
    assert.equal(entry.arenaPack.layout, 'parallax-4', id);
    assert.equal(entry.arenaPack.proceduralFallback, true, id);
    assert.equal(entry.codex.releaseEligible, true, id);
    assert.deepEqual(Object.keys(artManifest.bosses[id].parts).sort(), ['appendage-left-root', 'appendage-left-tip', 'appendage-right-root', 'appendage-right-tip', 'armor-shell', 'chassis', 'core']);
    assert.equal(artManifest.bosses[id].parts.core.weakCore, true, id);
    assert.equal(artManifest.arenas[id].kind, 'parallax', id);
    assert.deepEqual(Object.keys(artManifest.arenas[id].layers).sort(), ['far', 'foreground', 'ground', 'mid']);
    for (const layer of ['far', 'mid', 'ground', 'foreground']) assert.match(artManifest.arenas[id].layers[layer].src, new RegExp('/arenas/' + id + '/' + layer + '\\.webp$'));
  }
  assert.equal(mechanicIds.size, 24);
  assert.equal(signatureStates.size, 72);
  assert.equal(artManifest.release, '2.11.0');
});

test('les huit familles ont des boucles, telegraphes et handlers distincts', () => {
  const expectedFamilies = ['gravity-weather', 'lure', 'mimic', 'modules', 'posture-duo', 'puzzle-endgame', 'reflect', 'vertical-lane'];
  const families = [...Object.keys(bossRoster.families)].sort();
  assert.deepEqual(families, expectedFamilies);
  const usedFamilies = [...new Set([...bossRoster.expanded()].flatMap(entry => [...entry.phaseFamilies]))].sort();
  assert.deepEqual(usedFamilies, expectedFamilies);
  for (const family of families) {
    assert.ok(bossRoster.families[family].loop);
    assert.ok(bossRoster.families[family].telegraph);
    assert.match(game, new RegExp("family === '" + family + "'"));
  }
  assert.deepEqual([...bossRoster.stateSequence], ['intro', 'phaseEnter', 'neutral', 'telegraph', 'active', 'recovery', 'vulnerable', 'phaseTransition', 'defeat']);
  for (const marker of ['createRuntime', 'updateExpandedBoss', 'resolveExpandedPlayerShot', 'tryExpandedDashCounter', 'drawExpandedArenaWarnings']) {
    assert.match(game, new RegExp('\\b' + marker + '\\b'));
  }
});

test('la Forge expose selection, lore, chrono, rang, practice et secours procedural', () => {
  const rngA = bossRoster.createRng(7331);
  const rngB = bossRoster.createRng(7331);
  assert.deepEqual(Array.from({ length: 6 }, rngA), Array.from({ length: 6 }, rngB));
  const runtime = bossRoster.createRuntime('carrier-cathedral', { phase: 3, checkpoint: 2, seed: 91 });
  assert.equal(runtime.phase, 3);
  assert.equal(runtime.round, 2);
  assert.notEqual(runtime.parts, bossRoster.get('carrier-cathedral').parts);
  for (const marker of ['installDomHooks', 'launchForgeBoss', 'getBossRoster', 'launchBoss', 'selectedPracticePhase', 'selectedPracticeCheckpoint']) {
    assert.match(game + bossRosterSource, new RegExp('\\b' + marker + '\\b'));
  }
  assert.match(game, /entries\.length < 7/);
  assert.match(game, /generatedMultipartManifest/);
  for (const marker of ['buildForgeRigRenderState', 'generatedForgeRigVisibility', 'getForgeRigVisibility', 'setForgePartDestroyed']) {
    assert.match(game, new RegExp('\\b' + marker + '\\b'));
  }
  const forgeRigBlock = game.slice(game.indexOf('function buildForgeRigRenderState'), game.indexOf('function drawGeneratedBossPreview'));
  assert.match(forgeRigBlock, /\.sort\(\(left, right\) => \(left\[1\]\.z \|\| 0\) - \(right\[1\]\.z \|\| 0\)\)/);
  assert.match(forgeRigBlock, /if \(logicalPartForEntry\(entry\)\?\.destroyed\) return true/);
  assert.match(forgeRigBlock, /currentName = typeof entry\.parent === 'string' \? entry\.parent : null/);
  assert.match(forgeRigBlock, /if \(renderState\.isHidden\(name\)\) return/);
  assert.match(forgeRigBlock, /const x = part\.hitbox\?\.x/);
  assert.match(game, /function drawGeneratedArena\(data, requestedLayers = \['far', 'mid', 'ground'\]\)/);
  assert.match(game, /arena\.layers\?\.\[layerName\]/);
  assert.match(game, /function drawGeneratedArenaForeground/);
  assert.match(game, /default: drawExpandedBoss\(\)/);
  assert.match(game, /const par = \(BOSSES\[currentBossIndex\]\.parTime \|\| 60\)/);
  assert.match(game, /EXPANSION_STORY[\s\S]+shortIntro[\s\S]+objective[\s\S]+restoration[\s\S]+journal/);
  assert.match(game, /aria-pressed/);
  assert.match(game, /const gridBosses = forge \? BOSSES : CAMPAIGN_BOSSES/);
  assert.match(game, /gridBosses\.forEach/);
  assert.match(game, /function evaluateForgeMetric/);
  assert.match(game, /supported: false, value: null, achieved: false/);
  assert.match(game, /NON ÉVALUÉE · TÉLÉMÉTRIE ABSENTE/);
  assert.match(game, /getForgeTelemetry/);
  for (const id of ['rammer', 'kraken', 'drill', 'mantis', 'cyclotron', 'omega']) {
    assert.match(game, new RegExp("case '" + id + "':"));
  }
});

test('les 24 signatures runtime et les 72 contrats Forge sont couverts', () => {
  const expanded = [...bossRoster.expanded()];
  const signatureBlock = game.slice(game.indexOf('function updateExpandedSignature'), game.indexOf('function updateExpandedFamilyActive'));
  for (const entry of expanded) assert.match(signatureBlock, new RegExp("case '" + entry.id + "'"), entry.id);
  const metricBlock = game.slice(game.indexOf('function evaluateForgeMetric'), game.indexOf('function evaluateMasteryContracts'));
  const contracts = expanded.flatMap(entry => [...entry.masteryContracts]);
  assert.equal(contracts.length, 72);
  for (const contract of contracts) assert.match(metricBlock, new RegExp('\\b' + contract.metric + '\\b'), contract.metric);
  for (const metric of ['repairsCompleted', 'fallDamageTaken', 'recoveryFalls', 'openDoorCoreFinish', 'mutualCollisions', 'manualSequenceResets', 'selfRicochetHits']) {
    assert.match(metricBlock, new RegExp('\\b' + metric + '\\b'));
  }
  assert.match(game, /function forgeContractCoverage/);
  assert.match(game, /getForgeContractCoverage/);
});

test('les maîtrises Forge contextuelles reposent sur leur cause exacte, jamais sur un proxy global', () => {
  const telemetryBlock = game.slice(game.indexOf('function createForgeTelemetry'), game.indexOf('function incrementForgeMetric'));
  for (const marker of ['priorityDroneFamilies', 'priorityDroneFailures', 'mimicPhaseTwoSamples', 'mimicPhaseTwoCompleteSamples', 'cleanBreakerModules', 'offlineBreakerModuleHits', 'valvesByPressureCycle', 'maximumValvesInPressureCycle', 'maximumProjectileBounceChain']) {
    assert.match(telemetryBlock, new RegExp('\\b' + marker + '\\b'), marker);
  }

  const telegraphBlock = game.slice(game.indexOf('function prepareExpandedTelegraph'), game.indexOf('function spawnReflectableCharge'));
  assert.match(telegraphBlock, /boss\.data\.id === 'hive-foreman'[\s\S]+runtime\.priorityPartId/);
  assert.match(telegraphBlock, /boss\.data\.id === 'echo-fencer' && boss\.phase === 2[\s\S]+mimicPhaseTwoCompleteSamples/);

  const partBlock = game.slice(game.indexOf('function hitExpandedPart'), game.indexOf('function updatePlayer'));
  assert.match(partBlock, /priorityDroneFailures\.add\(family\)/);
  assert.match(partBlock, /cleanBreakerModules\.add\(part\.id\)/);
  assert.match(partBlock, /shot\.forgeCreatedAt > part\.destroyedAt/);
  assert.match(partBlock, /valvesByPressureCycle\.get\(pressureCycle\)/);

  const projectileBlock = game.slice(game.indexOf('function updateEnemyShots'), game.indexOf('function shotHitsPlayer'));
  assert.match(projectileBlock, /maximumProjectileBounceChain = Math\.max\(currentForgeTelemetry\.maximumProjectileBounceChain, s\.wallBounces \|\| 0\)/);

  const metricBlock = game.slice(game.indexOf('function evaluateForgeMetric'), game.indexOf('function forgeContractCoverage'));
  assert.match(metricBlock, /correctPriorityTargets: telemetry\.priorityDroneFamilies\.size/);
  assert.match(metricBlock, /actionDiversity: telemetry\.mimicPhaseTwoSamples > 0 && telemetry\.mimicPhaseTwoCompleteSamples === telemetry\.mimicPhaseTwoSamples \? 3 : 0/);
  assert.match(metricBlock, /cleanModuleShutdowns: telemetry\.offlineBreakerModuleHits === 0 \? telemetry\.cleanBreakerModules\.size : 0/);
  assert.match(metricBlock, /valvesClosedInCycle: telemetry\.maximumValvesInPressureCycle/);
  assert.match(metricBlock, /maximumBounceChain: telemetry\.maximumProjectileBounceChain/);
  for (const proxy of [
    /correctPriorityTargets: telemetry\.uniquePartIds\.size/,
    /actionDiversity: telemetry\.actions\.size/,
    /cleanModuleShutdowns: telemetry\.destroyedByRole\.module/,
    /valvesClosedInCycle: telemetry\.destroyedByRole\.valve/,
    /maximumBounceChain: telemetry\.maximumReflectionStreak/,
  ]) assert.doesNotMatch(metricBlock, proxy);
});

test('le Circuit Forge enchaine 07 a 30 avec vagues, modules, reprise et epilogue', () => {
  for (const marker of ['forgeRush', 'FORGE_START_INDEX', 'FORGE_FINAL_INDEX', 'saveForgeRushSnapshot', 'resumeForgeRushSnapshot', 'showForgeEnding', 'getForgeRunState']) {
    assert.match(game, new RegExp('\\b' + marker + '\\b'));
  }
  assert.match(game, /runMode === 'forgeRush'[\s\S]+showUpgradeSelection/);
  assert.match(game, /startFight\(currentBossIndex \+ 1\)/);
  assert.equal(rosterContext.GEARSTORM_EXPANSION_STORY.forgeCircuit.bossOrder.length, 24);
  assert.deepEqual([...rosterContext.GEARSTORM_EXPANSION_STORY.forgeCircuit.bossOrder], EXPANSION_BOSS_CONTRACT.map(([id]) => id));
  assert.equal(rosterContext.GEARSTORM_EXPANSION_STORY.forgeCircuit.waveCheckpoints.length, 4);
  assert.deepEqual([...rosterContext.GEARSTORM_EXPANSION_STORY.forgeCircuit.resumeCheckpoints], ['fight', 'upgrade', 'ending']);
  const runStateBlock = game.slice(game.indexOf('function getForgeRunState'), game.indexOf('function unlockCodexEntry'));
  for (const field of ['mode', 'index', 'bossIndex', 'wave', 'completed', 'finished', 'snapshot']) {
    assert.match(runStateBlock, new RegExp('\\b' + field + '\\b'), field);
  }
  assert.match(game, /runtime\.signatureCycle \+= 1/);
  assert.match(game, /enduranceRounds\.add\(6\)/);
});

test('les checkpoints conservent retries et offre atelier sans reroll', () => {
  const rushSanitizer = game.slice(game.indexOf('function sanitizeRushSnapshot'), game.indexOf('function sanitizeForgeRushSnapshot'));
  const forgeSanitizer = game.slice(game.indexOf('function sanitizeForgeRushSnapshot'), game.indexOf('function createDefaultSave'));
  for (const block of [rushSanitizer, forgeSanitizer]) {
    assert.match(block, /currentBossRetries/);
    assert.match(block, /sanitizeUpgradeOffer\(value\.upgradeOffer, installed\)/);
  }
  const campaignResume = game.slice(game.indexOf('function resumeRushSnapshot'), game.indexOf('function resumeForgeRushSnapshot'));
  const forgeResume = game.slice(game.indexOf('function resumeForgeRushSnapshot'), game.indexOf('function getForgeRunState'));
  for (const block of [campaignResume, forgeResume]) {
    assert.match(block, /currentBossRetries = snapshot\.currentBossRetries/);
    assert.match(block, /lastBossRetryPenalty = currentBossRetries \* RUSH_RETRY_PENALTY/);
    assert.match(block, /startFight\(snapshot\.bossIndex, \{ preserveRetries: true \}\)/);
  }
  const startFightBlock = game.slice(game.indexOf('function startFight'), game.indexOf('function retryFight'));
  assert.match(startFightBlock, /preserveRetries = false/);
  assert.match(startFightBlock, /if \(!preserveRetries\) currentBossRetries = 0/);
  const workshop = game.slice(game.indexOf('function showUpgradeSelection'), game.indexOf('function installUpgrade'));
  assert.match(workshop, /persistedOffer/);
  assert.match(workshop, /upgradeOffer: \[\.\.\.lastUpgradeOffer\]/);
  assert.match(workshop, /BUILD MAXIMAL/);
});

test('Endurance Engine impose bien ses six manches avant les planchers de phase', () => {
  const floorBlock = game.slice(game.indexOf('function enduranceRoundGateOpen'), game.indexOf('function beginPhaseTransition'));
  assert.match(floorBlock, /enduranceRounds\.has\(phase \* 2\)/);
  assert.match(floorBlock, /1: 5 \/ 6, 2: 1 \/ 2, 3: 1 \/ 6/);
  const transitionBlock = game.slice(game.indexOf('function beginPhaseTransition'), game.indexOf('function updateBoss'));
  assert.match(transitionBlock, /boss\.data\.id === 'endurance-engine'/);
  assert.match(transitionBlock, /boss\.runtime\.signatureCycle = 0/);
  assert.match(transitionBlock, /boss\.runtime\.roundGateAnnounced = false/);
  const createBossBlock = game.slice(game.indexOf('function createBoss'), game.indexOf('function isSequentialRun'));
  assert.match(createBossBlock, /const firstRound = \(phase - 1\) \* 2 \+ 1/);
  assert.match(createBossBlock, /runtime\.round = clamp/);
  assert.match(createBossBlock, /runtime\.signatureCycle = runtime\.round - firstRound/);
  const retryBlock = game.slice(game.indexOf('function retryFight'), game.indexOf('function configureIntro'));
  assert.match(retryBlock, /endurancePractice/);
  assert.match(retryBlock, /phase: retryPhase, checkpoint: retryCheckpoint/);
  const damageBlock = game.slice(game.indexOf('function damageBoss'), game.indexOf('function defeatBoss'));
  assert.match(damageBlock, /const phaseGateOpen = enduranceRoundGateOpen\(\)/);
  assert.match(damageBlock, /boss\.phase < 3 && phaseGateOpen/);
  assert.match(damageBlock, /MANCHE ' \+ \(boss\.phase \* 2\) \+ ' REQUISE/);
});

test('la sauvegarde portable reste normalisee et respecte les preferences systeme au premier lancement', () => {
  const normalizer = game.slice(game.indexOf('function createDefaultSave'), game.indexOf('function persistSave'));
  assert.match(normalizer, /prefers-reduced-motion: reduce/);
  assert.match(normalizer, /prefers-contrast: more/);
  assert.match(normalizer, /function normalizeSaveData/);
  assert.match(normalizer, /if \(!raw\) continue/);
  assert.match(normalizer, /return createDefaultSave\(true\)/);
  const portability = game.slice(game.indexOf('function exportSaveFile'), game.indexOf('function rebuildRunBuild'));
  assert.match(portability, /JSON\.stringify\(normalizeSaveData\(save\), null, 2\)/);
  assert.match(portability, /normalizeSaveData\(JSON\.parse\(await file\.text\(\)\)\)/);
  assert.match(portability, /file\.size > 1024 \* 1024/);
  assert.match(portability, /if \(!persistSave\(\)\)/);
  assert.match(portability, /save = previousSave/);
  assert.match(portability, /Sauvegarde exportée au format JSON version 6\./);
  assert.doesNotMatch(portability, /JSON version 5/);
  assert.doesNotMatch(portability, /innerHTML|insertAdjacentHTML/);
});

test('les cartes boss utilisent les vrais sprites et la PWA attend une validation utilisateur', () => {
  assert.match(game, /class="boss-card-art"/);
  assert.match(game, /aria-hidden="true"/);
  for (const part of ['chassis', 'fuselage', 'carapace', 'torso', 'furnace-torso', 'crown-hull']) assert.match(game, new RegExp(`['"]${part}['"]`));
  const pwaStart = game.indexOf('function registerGearstormServiceWorker');
  const pwa = game.slice(pwaStart, game.indexOf('  applySettings();', pwaStart));
  assert.match(pwa, /updatefound/);
  assert.match(pwa, /registration\.waiting/);
  assert.match(pwa, /navigator\.serviceWorker\.controller/);
  assert.match(pwa, /postMessage\(\{ type: 'SKIP_WAITING' \}\)/);
  assert.match(pwa, /controllerchange/);
  assert.match(pwa, /updateAccepted = true/);
  assert.match(pwa, /if \(!updateAccepted \|\| refreshing\) return/);
});

test('le combat ne demarre jamais sous la plaque d introduction', () => {
  assert.match(game, /configureIntro\(retry\)/);
  assert.match(game, /introTimer = retry \? 1\.25/);
  assert.match(game, /if \(boss\.state === 'intro'\) \{[\s\S]+updateBoss\(scaled\);[\s\S]+return;/);
  assert.match(game, /if \(introTimer <= 0\) \{[\s\S]+startFightClock\(\)/);
  assert.doesNotMatch(game, /boss\.stateTime > 2\.45/);
});

test('les systemes campagne, entrees et accessibilite restent cables', () => {
  for (const marker of ['showUpgradeSelection', 'activateOverload', 'navigator.getGamepads', 'pointer.attack', "touchWasPressed('overload')", 'showEnding']) {
    assert.match(game, new RegExp(marker.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  }
  assert.match(css, /\.upgrade-grid/);
  assert.match(css, /#result-screen \.result-panel/);
  assert.match(css, /#pause-screen \.pause-panel/);
  assert.doesNotMatch(css, /\.result-screen \.result-panel|\.pause-screen \.pause-panel/);
  for (const id of ['upgrade-screen', 'prologue-screen', 'ending-screen']) assert.match(html, new RegExp(`id="${id}"`));
  assert.match(html, /aria-live="polite"/);
  assert.match(html, /id="toast"[^>]+aria-hidden="true"/);
  assert.doesNotMatch(html, /id="toast"[^>]+aria-live/);
  assert.match(html, /id="game-status"[^>]+aria-live="polite"/);
  assert.match(html, /prefers-reduced-motion|motion-toggle/);
  const gamepadBlock = game.slice(game.indexOf('function pollGamepad'), game.indexOf('function playerMuzzlePosition'));
  assert.match(gamepadBlock, /Array\.from\(navigator\.getGamepads/);
  assert.match(gamepadBlock, /\.find\(Boolean\)/);
  assert.match(gamepadBlock, /:not\(\[type=\"hidden\"\]\)/);
  assert.match(gamepadBlock, /active\.type === 'range'/);
  assert.match(gamepadBlock, /dispatchEvent\(new Event\('input'/);
  assert.match(game, /screen\.inert = !active/);
  assert.match(css, /body:has\(\.screen\[aria-modal="true"\]\.active\) \.skip-link/);
  assert.match(css, /top: calc\(var\(--safe-top\) \+ 9\.55rem \+ 56\.25vw \+ 0\.5rem\)/);
});

test('les chronos, retry et sauvegardes suivent les garde-fous', () => {
  assert.match(game, /lastBossTime = currentBossElapsed/);
  assert.match(game, /startFight\(currentBossIndex, \{ retry: true, phase: retryPhase, checkpoint: retryCheckpoint \}\)/);
  assert.match(game, /if \(boss\.defeated\) return/);
  assert.match(game, /PERFORMANCE_RECORDS\.migrateSaveToV6/);
  assert.match(game, /PERFORMANCE_RECORDS\.recordBossAttempt/);
  assert.match(game, /PERFORMANCE_RECORDS\.recordCircuitAttempt/);
  assert.match(game, /activeDifficultyId = snapshot\.difficulty/);
  assert.doesNotMatch(game, /save\.bestTimes|save\.bestRanks|save\.bestRush|save\.bestForgeRush/);
  assert.match(game, /Object\.hasOwn\(DIFFICULTIES/);
  const startRunStart = game.indexOf('function startRun');
  const startRunBlock = game.slice(startRunStart, game.indexOf('function startFight(', startRunStart));
  assert.match(startRunBlock, /sanitizeRushSnapshot\(save\.rushSnapshot\)/);
  assert.match(startRunBlock, /sanitizeForgeRushSnapshot\(save\.forgeRushSnapshot\)/);
  assert.match(startRunBlock, /confirm\('Un ' \+ label/);
  assert.match(game, /const elapsed=currentBossElapsed/);
  assert.doesNotMatch(game, /const elapsed=performance\.now/);
});
test('le mixage audio separe musique, effets et limite les pics', () => {
  for (const id of ['master-volume', 'master-volume-value', 'music-volume', 'music-volume-value', 'sfx-volume', 'sfx-volume-value']) {
    assert.match(html, new RegExp('id=["\\\']' + id + '["\\\']'));
  }
  assert.match(game, /musicVolume:\s*0\.68/);
  assert.match(game, /sfxVolume:\s*0\.9/);
  assert.match(game, /createDynamicsCompressor\(\)/);
  assert.match(game, /MUSIC_PROFILES/);
  assert.match(game, /boss\?\.runtime\?\.family/);
  assert.match(game, /save\.settings\.volume \* save\.settings\.sfxVolume/);
  assert.match(game, /save\.settings\.volume \* save\.settings\.musicVolume/);
  assert.match(game, /linearRampToValueAtTime/);
  assert.match(game, /audioContext\?\.state === 'running'/);
});


test('les raccourcis PWA sont routes sans demarrer un combat implicitement', () => {
  const urls = new Set(manifest.shortcuts.map(shortcut => shortcut.url));
  assert.ok(urls.has('./?mode=rush'));
  assert.ok(urls.has('./?mode=practice'));
  assert.ok(urls.has('./?mode=forge'));
  assert.match(game, /routeLaunchMode/);
  assert.match(game, /URLSearchParams\(location\.search\)/);
  assert.match(game, /get\(["']mode["']\)/);
  assert.ok((game.match(/\brouteLaunchMode\(\)/g) || []).length >= 2, 'routeLaunchMode doit etre appele pendant l initialisation');
  const routeBlock = game.slice(game.indexOf('function routeLaunchMode'), game.indexOf('function applySettings'));
  assert.doesNotMatch(routeBlock, /startRun|startFight|unlockAudio/);
});

test('la liste des systemes reste centralisee', () => {
  for (const marker of REQUIRED_GAME_SYSTEMS) assert.match(game, new RegExp(`\\b${marker}\\b`));
});

test('le récit de campagne reste distinct du Laboratoire', () => {
  const openingFlow = game.slice(game.indexOf('function showIntroStory'), game.indexOf('function showInterlude'));
  assert.match(openingFlow, /showPrologueStory/);
  assert.match(openingFlow, /showScreen\('prologue-screen'\)/);
  assert.match(openingFlow, /#prologue-dialogue/);

  const archiveBlock = game.slice(game.indexOf('function buildStoryArchive'), game.indexOf('function showRadioExchange'));
  assert.match(archiveBlock, /STORY\.intro/);
  assert.match(archiveBlock, /STORY\.prologue/);
  assert.match(archiveBlock, /STORY\.epilogue/);
  assert.match(html, /Archives M-0 — neuf transmissions, aucune scène coupée/);
  assert.match(html, /id=["']story-archive-progress["'][^>]*>0 \/ 9 transmissions/);
  assert.match(html, /aria-label=["']Introduction, prologue, interludes et épilogue["']/);
  assert.match(archiveBlock, /createElement\('details'\)/);
  assert.match(archiveBlock, /entry\.lines\.map\(createStoryLine\)/);
  assert.match(archiveBlock, /de l’introduction à l’épilogue/);

  const phaseBlock = game.slice(game.indexOf('function phaseNarrative'), game.indexOf('function syncCampaignUi'));
  assert.match(phaseBlock, /runMode !== 'rush'/);
  assert.match(phaseBlock, /profile\?\.phaseLines/);
  assert.doesNotMatch(phaseBlock, /profile\.metaLine|PHASE \${phase}/);
  assert.doesNotMatch(phaseBlock, /text: profile\.mechanic/);

  assert.match(game, /snapshot\.bossIndex \+ 2/);
  assert.doesNotMatch(game, /snapshot\.bossIndex - FORGE_START_INDEX \+ 2/);
  const catalogueNumberBlock = game.slice(game.indexOf('function bossCatalogueNumber'), game.indexOf('const LEGACY_BOSS_IDS'));
  assert.match(catalogueNumberBlock, /index < FORGE_START_INDEX/);
  assert.match(catalogueNumberBlock, /'MACHINE '/);
  assert.match(catalogueNumberBlock, /'FORGE '/);
  const catalogueGridBlock = game.slice(game.indexOf('function buildBossGrid'), game.indexOf('function setBossMode'));
  assert.match(catalogueGridBlock, /const number = bossCatalogueNumber\(index\)/);
  assert.match(html, /Campagne · boss déjà débloqués/);
  assert.match(html, /Le Catalogue intégral permet de choisir librement parmi les 30 boss/);
  assert.match(bossRosterSource, /Arbitre final déjà visible dans le Catalogue/);
  assert.match(bossRosterSource, /renvoyer les charges, choisir l’ordre des modules, puis rompre sa posture/);
  assert.doesNotMatch(html, /<strong>\s*Syst[eè]me\s*<\/strong>/iu);

  const introBlock = game.slice(game.indexOf('function configureIntro'), game.indexOf('function startMasteryCycle'));
  assert.match(introBlock, /runMode === 'rush'/);
  assert.match(introBlock, /civicFunction/);

  const resultBlock = game.slice(game.indexOf('function showResult'), game.indexOf('function continueAfterResult'));
  assert.match(resultBlock, /practiceResult/);
  assert.match(resultBlock, /progression de campagne reste inchangée/);

  const transitionBlock = game.slice(game.indexOf('function updateTransition'), game.indexOf('function evaluateMasteryContracts'));
  assert.match(transitionBlock, /if \(runMode === 'rush'\) \{[\s\S]+save\.unlocked/);
  assert.doesNotMatch(transitionBlock, /save\.unlocked[\s\S]+if \(runMode === 'rush'/);
});

test('la Forge canonique, ses archives et ses voix restent cohérentes', () => {
  assert.match(game, /function forgeNarrativeUnlocked\(\)[\s\S]+save\.completed/);
  const forgeSyncBlock = game.slice(game.indexOf('function forgeNarrativeUnlocked'), game.indexOf('function syncContinueRun'));
  assert.match(forgeSyncBlock, /startButton\.disabled = !narrativeUnlocked/);
  const startRunStart = game.indexOf('function startRun');
  const startRunBlock = game.slice(startRunStart, game.indexOf('function startFight', startRunStart));
  assert.match(startRunBlock, /mode === 'forgeRush' && !forgeNarrativeUnlocked\(\)/);
  assert.match(html, /id="forge-rush-start"[^>]*disabled/);
  assert.match(html, /30 simulations hors chronologie/);

  const forgeCodexBlock = game.slice(game.indexOf('function buildForgeCodex'), game.indexOf('function buildCodex'));
  assert.match(forgeCodexBlock, /wave\.revelation/);
  assert.match(forgeCodexBlock, /profile\.journal/);
  const forgeTransmissionBlock = game.slice(game.indexOf('function syncForgeResultTransmission'), game.indexOf('function showResult'));
  assert.match(forgeTransmissionBlock, /wave\.revelation/);
  assert.doesNotMatch(forgeTransmissionBlock, /profile\.metaLine/);

  const campaignInterludeBlock = game.slice(game.indexOf('function showCampaignInterlude'), game.indexOf('function buildStoryArchive'));
  assert.doesNotMatch(campaignInterludeBlock, /Le jeu archive|barre de vie|L’interlude existe à l’écran/);
  const resultBlock = game.slice(game.indexOf('function showResult'), game.indexOf('function continueAfterResult'));
  assert.doesNotMatch(resultBlock, /commentaire de design|L’écran de résultat|barre de vie archivée/);
  const endingBlock = game.slice(game.indexOf('function showEnding'), game.indexOf('function openLaboratory'));
  assert.match(endingBlock, /endingStats/);
  assert.doesNotMatch(endingBlock, /Build final|générique rend la ville/);
});

test('les contrats de cycle mesurent un cycle terminé et les finitions réelles', () => {
  for (const marker of ['startMasteryCycle', 'finishMasteryCycle', 'noteMasteryCycleHit', 'currentBossPerfectCycles']) {
    assert.match(game, new RegExp(`\\b${marker}\\b`));
  }
  assert.match(game, /damageBoss\(runBuild\.dashDamage, 'dash'\)/);
  assert.match(game, /finishMasteryCycle\('eruption'\)[\s\S]+setBossState\('exposed'\)/);
  assert.match(game, /finishMasteryCycle\('dash'\)[\s\S]+setBossState\('overheat'\)/);
  assert.match(game, /currentBossPerfectCycles\.eruption/);
  assert.match(game, /currentBossPerfectCycles\.dash/);
});
