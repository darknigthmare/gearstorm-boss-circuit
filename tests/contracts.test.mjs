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
  readFile('assets/generated/v2.6.0/asset-manifest.json', 'utf8').then(JSON.parse),
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

test('le contrat applicatif v2.6 complet est respecte', () => {
  assert.doesNotThrow(() => validateApplicationContract({ game, story, expansionStory: expansionStorySource, bossRoster: bossRosterSource, html, manifest, packageJson }));
  assert.equal(packageJson.version, APP_RELEASE);
});

test('tous les identifiants DOM utilises par le moteur existent et sont uniques', () => {
  const allIds = [...html.matchAll(/\sid="([^"]+)"/g)].map(match => match[1]);
  const ids = new Set(allIds);
  assert.equal(ids.size, allIds.length);
  const references = [...game.matchAll(/getElementById\(["']([^"']+)["']\)/g)].map(match => match[1]);
  assert.ok(references.length > 30);
  for (const id of references) assert.ok(ids.has(id), `id manquant: ${id}`);
  for (const id of REQUIRED_UI_IDS) assert.ok(ids.has(id), `surface v2.6 manquante: ${id}`);
});

test('la sauvegarde v4 migre les v3 et v2 et porte la reprise narrative', () => {
  assert.match(game, new RegExp(SAVE_KEY));
  assert.match(game, new RegExp(PREVIOUS_SAVE_KEY));
  assert.match(game, new RegExp(`version\\s*:\\s*${SAVE_SCHEMA_VERSION}\\b`));
  for (const field of ['combatHints', 'codexUnlocked', 'rushSnapshot', 'campaignCleared', 'storySeen', 'mastery']) assert.match(game, new RegExp(`\\b${field}\\b`));
  assert.match(game, /localStorage\.getItem\(PREVIOUS_SAVE_KEY\)/);
  assert.match(game, /localStorage\.setItem\(SAVE_KEY,\s*JSON\.stringify\(safe\)\)/);
  for (const marker of ['sanitizeRushSnapshot', 'saveRushSnapshot', 'clearRushSnapshot', 'resumeRushSnapshot', 'syncContinueRun']) {
    assert.match(game, new RegExp(`\\b${marker}\\b`));
  }
});

test('le guidage, le codex et le recapitulatif de campagne sont cables', () => {
  for (const marker of ['buildCodex', 'syncCombatGuidance', 'combatHints', 'codexUnlocked']) {
    assert.match(game, new RegExp(`\\b${marker}\\b`));
  }
  for (const id of ['codex-screen', 'codex-grid', 'codex-progress', 'campaign-progress', 'campaign-next', 'combat-objective', 'combat-hint', 'pause-build', 'pause-objective', 'result-build', 'result-lore']) {
    assert.match(html, new RegExp(`id=["']${id}["']`));
  }
  assert.match(css, /codex|combat-hint|campaign-progress/);
});

test('les rigs generes et leur diagnostic QA sont explicites', () => {
  for (const marker of ['HERO_RIG', 'BOSS_RIGS', 'drawRigPart', 'getRigDiagnostics']) {
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
  assert.match(game, /qaAllowed[\s\S]+127\.0\.0\.1[\s\S]+localhost/);
});

test('le rig composite OpenAI v4 de Riva garde les semelles et l avant-bras coherents', () => {
  const playerRenderer = game.slice(game.indexOf('function drawGeneratedPlayer'), game.indexOf('function bossRigPose'));
  assert.match(playerRenderer, /drawRigPart\(parts\['body-core'\]/);
  assert.match(playerRenderer, /drawRigPart\(parts\['firing-arm'\]/);
  for (const legacyPart of ['head', 'torso', 'legs', 'boots', 'arm-near', 'pulse-cannon', 'arm-far']) {
    assert.doesNotMatch(playerRenderer, new RegExp("drawRigPart\\(parts(?:\\.|\\[')" + legacyPart));
  }
  assert.match(game, /'body-core': rigPart\('body-core', 1, \[0, 36\], \[209, 409\], 0\.3, \[138, 9, 280, 409\], 'body'\)/);
  assert.match(game, /'firing-arm': rigPart\('firing-arm', 1, \[16, -56\], \[70, 180\], 0\.135, \[24, 119, 394, 298\], 'weapon'\)/);
  assert.match(game, /assets\/generated\/v2\.6\.0\/asset-manifest\.json/);
  assert.match(game, /visibleArmSources:[\s\S]+body-core:openai-v4[\s\S]+firing-arm:openai-v4/);
  const shadow = game.slice(game.indexOf('function drawPlayer()'), game.indexOf('const blink', game.indexOf('function drawPlayer()')));
  assert.match(shadow, /ellipse\(player\.x, GROUND \+ 1, 18 \* shadowScale, 3 \* shadowScale/);
  assert.doesNotMatch(shadow, /ctx\.stroke\(\)/);
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

  for (const [id, name] of EXPANSION_BOSS_CONTRACT) {
    const entry = bossRoster.get(id);
    assert.equal(entry.name, name, id);
    assert.equal(entry.engine, 'expanded', id);
    assert.equal(entry.status, 'forge-playable', id);
    assert.notEqual(entry.productionStatus, 'planned', id);
    assert.equal(entry.phases.length, 3, id);
    assert.equal(entry.masteryContracts.length, 3, id);
    assert.deepEqual([...entry.masteryContracts].map(contract => contract.id), [...rosterContext.GEARSTORM_EXPANSION_STORY.getMasteryContracts(id)].map(contract => contract.id), id);
    assert.ok(entry.parts.some(part => part.role === 'weak-point' && part.hitbox), id);
    assert.equal(entry.artPack.status, 'generated', id);
    assert.equal(entry.artPack.bundleId, id, id);
    assert.equal(entry.artPack.proceduralFallback, true, id);
    assert.equal(entry.arenaPack.status, 'missing', id);
    assert.equal(entry.arenaPack.proceduralFallback, true, id);
    assert.equal(entry.codex.releaseEligible, true, id);
    assert.match(artManifest.bosses[id].parts.sprite.src, new RegExp('/bosses/' + id + '/sprite\\.webp$'));
  }
  assert.equal(artManifest.release, '2.6.0');
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
  assert.match(game, /generatedImage\(parts\.sprite\)/);
  assert.match(game, /drawImage\(sprite, -size \/ 2, -size \/ 2, size, size\)/);
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
  assert.match(html, /prefers-reduced-motion|motion-toggle/);
  assert.match(game, /screen\.inert = !active/);
  assert.match(css, /body:has\(\.screen\[aria-modal="true"\]\.active\) \.skip-link/);
  assert.match(css, /top: calc\(var\(--safe-top\) \+ 9\.55rem \+ 56\.25vw \+ 0\.5rem\)/);
});

test('les chronos, retry et sauvegardes suivent les garde-fous', () => {
  assert.match(game, /lastBossTime = currentBossElapsed/);
  assert.match(game, /startFight\(currentBossIndex, \{ retry: true \}\)/);
  assert.match(game, /if \(boss\.defeated\) return/);
  assert.match(game, /Number\.isFinite\(parsed\?\.bestRush\)/);
  assert.match(game, /Object\.hasOwn\(DIFFICULTIES/);
  assert.match(game, /sanitizeRushSnapshot\(save\.rushSnapshot\)[\s\S]+confirm\('Un Circuit est déjà en cours/);
  assert.match(game, /const elapsed=currentBossElapsed/);
  assert.doesNotMatch(game, /const elapsed=performance\.now/);
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

test('la liste des systemes v2.6 reste centralisee', () => {
  for (const marker of REQUIRED_GAME_SYSTEMS) assert.match(game, new RegExp(`\\b${marker}\\b`));
});

test('le récit de campagne reste distinct du Laboratoire', () => {
  const openingFlow = game.slice(game.indexOf('function showIntroStory'), game.indexOf('function showInterlude'));
  assert.match(openingFlow, /showPrologueStory/);
  assert.match(openingFlow, /renderStoryScene\(STORY\.prologue/);

  const phaseBlock = game.slice(game.indexOf('function phaseNarrative'), game.indexOf('function syncCampaignUi'));
  assert.match(phaseBlock, /runMode !== 'rush'/);

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
