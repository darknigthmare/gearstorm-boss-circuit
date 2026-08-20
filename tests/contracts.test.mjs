import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import {
  APP_RELEASE,
  PREVIOUS_SAVE_KEY,
  REQUIRED_GAME_SYSTEMS,
  REQUIRED_UI_IDS,
  SAVE_KEY,
  SAVE_SCHEMA_VERSION,
  validateApplicationContract,
} from '../scripts/app-contract.mjs';

const [html, css, story, game, readme, design, packageJson, manifest] = await Promise.all([
  readFile('index.html', 'utf8'),
  readFile('styles.css', 'utf8'),
  readFile('story.js', 'utf8'),
  readFile('game.js', 'utf8'),
  readFile('README.md', 'utf8'),
  readFile('DESIGN.md', 'utf8'),
  readFile('package.json', 'utf8').then(JSON.parse),
  readFile('manifest.webmanifest', 'utf8').then(JSON.parse),
]);

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

test('le contrat applicatif v2.4 complet est respecte', () => {
  assert.doesNotThrow(() => validateApplicationContract({ game, story, html, manifest, packageJson }));
  assert.equal(packageJson.version, APP_RELEASE);
});

test('tous les identifiants DOM utilises par le moteur existent et sont uniques', () => {
  const allIds = [...html.matchAll(/\sid="([^"]+)"/g)].map(match => match[1]);
  const ids = new Set(allIds);
  assert.equal(ids.size, allIds.length);
  const references = [...game.matchAll(/getElementById\(["']([^"']+)["']\)/g)].map(match => match[1]);
  assert.ok(references.length > 30);
  for (const id of references) assert.ok(ids.has(id), `id manquant: ${id}`);
  for (const id of REQUIRED_UI_IDS) assert.ok(ids.has(id), `surface v2.4 manquante: ${id}`);
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
});

test('les chronos, retry et sauvegardes suivent les garde-fous', () => {
  assert.match(game, /lastBossTime = currentBossElapsed/);
  assert.match(game, /startFight\(currentBossIndex, \{ retry: true \}\)/);
  assert.match(game, /if \(boss\.defeated\) return/);
  assert.match(game, /Number\.isFinite\(parsed\?\.bestRush\)/);
  assert.match(game, /Object\.hasOwn\(DIFFICULTIES/);
  assert.match(game, /const elapsed=currentBossElapsed/);
  assert.doesNotMatch(game, /const elapsed=performance\.now/);
});

test('les raccourcis PWA sont routes sans demarrer un combat implicitement', () => {
  const urls = new Set(manifest.shortcuts.map(shortcut => shortcut.url));
  assert.ok(urls.has('./?mode=rush'));
  assert.ok(urls.has('./?mode=practice'));
  assert.match(game, /routeLaunchMode/);
  assert.match(game, /URLSearchParams\(location\.search\)/);
  assert.match(game, /get\(["']mode["']\)/);
  assert.ok((game.match(/\brouteLaunchMode\(\)/g) || []).length >= 2, 'routeLaunchMode doit etre appele pendant l initialisation');
  const routeBlock = game.slice(game.indexOf('function routeLaunchMode'), game.indexOf('function applySettings'));
  assert.doesNotMatch(routeBlock, /startRun|startFight|unlockAudio/);
});

test('la liste des systemes v2.4 reste centralisee', () => {
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
