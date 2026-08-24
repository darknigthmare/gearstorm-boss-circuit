import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import vm from 'node:vm';

const source = await readFile('story.js', 'utf8');

function loadStory() {
  const context = vm.createContext({});
  new vm.Script(source, { filename: 'story.js' }).runInContext(context);
  return context.GEARSTORM_STORY;
}

function assertLine(entry, label) {
  assert.equal(typeof entry?.speaker, 'string', `${label}: speaker manquant`);
  assert.ok(entry.speaker.trim().length > 0, `${label}: speaker vide`);
  assert.equal(typeof entry?.text, 'string', `${label}: texte manquant`);
  assert.ok(entry.text.trim().length > 8, `${label}: texte trop court`);
  assert.equal(typeof entry?.channel, 'string', `${label}: canal manquant`);
}

test('story.js est un script classique autonome, compatible VM sans DOM', () => {
  assert.doesNotMatch(source, /\b(?:document|window|HTMLElement|localStorage)\b/);
  assert.doesNotMatch(source, /^\s*(?:import|export)\s/m);
  const story = loadStory();
  assert.ok(story, 'globalThis.GEARSTORM_STORY doit etre expose');
  assert.equal(story.schemaVersion, 1);
  assert.equal(story.contentVersion, '2.9.1');
  assert.ok(Object.isFrozen(story));
  assert.ok(Object.isFrozen(story.acts));
  assert.ok(Object.isFrozen(story.acts[0].codex));
});

test('les six actes sont uniques, ordonnes et alignes aux IDs runtime', () => {
  const story = loadStory();
  const expectedOrder = ['rammer', 'kraken', 'drill', 'mantis', 'cyclotron', 'omega'];
  assert.deepEqual([...story.bossOrder], expectedOrder);
  assert.equal(story.acts.length, expectedOrder.length);
  assert.deepEqual(Array.from(story.acts, act => act.bossId), expectedOrder);
  assert.deepEqual(Array.from(story.acts, act => act.order), [1, 2, 3, 4, 5, 6]);
  assert.equal(new Set(Array.from(story.acts, act => act.id)).size, 6);
  assert.equal(new Set(Array.from(story.acts, act => act.district)).size, 6);
  assert.equal(new Set(Array.from(story.acts, act => act.civicFunction)).size, 6);
  assert.deepEqual(
    Array.from(story.acts, act => act.narrativeBeat),
    ['intrusion', 'recognition', 'suspicion', 'revelation', 'counterplan', 'climax']
  );
});

test('chaque acte fournit le contrat narratif complet', () => {
  const story = loadStory();
  for (const act of story.acts) {
    const label = `${act.bossId}/${act.id}`;
    for (const field of ['bossName', 'district', 'civicFunction', 'narrativeBeat', 'rivaJournal', 'districtConsequence', 'restoration']) {
      assert.equal(typeof act[field], 'string', `${label}: ${field} manquant`);
      const minimum = ['bossName', 'narrativeBeat'].includes(field) ? 3 : 12;
      assert.ok(act[field].trim().length > minimum, `${label}: ${field} incomplet`);
    }

    assert.equal(act.phaseTitles.length, 3, `${label}: trois titres de phase requis`);
    assert.equal(new Set(act.phaseTitles).size, 3, `${label}: titres de phase dupliques`);
    assert.ok(act.phaseTitles.every(title => typeof title === 'string' && title.length > 5));

    assert.ok(act.preFight.length >= 2, `${label}: pre-combat incomplet`);
    act.preFight.forEach((entry, index) => assertLine(entry, `${label}/preFight/${index}`));
    assert.ok(act.preFight.some(entry => entry.speaker === 'Riva'));
    assert.ok(act.preFight.some(entry => entry.speaker === 'Cassian'));

    assert.equal(act.phaseTransitions.length, 2, `${label}: deux transitions requises`);
    assert.deepEqual(Array.from(act.phaseTransitions, transition => transition.toPhase), [2, 3]);
    for (const transition of act.phaseTransitions) {
      assert.equal(typeof transition.title, 'string');
      assert.ok(transition.title.length > 5);
      assert.ok(transition.lines.length >= 2);
      transition.lines.forEach((entry, index) => assertLine(entry, `${label}/phase-${transition.toPhase}/${index}`));
    }

    assert.equal(act.interlude.length, 3, `${label}: interlude tripartite requis`);
    act.interlude.forEach((entry, index) => assertLine(entry, `${label}/interlude/${index}`));
    const interludeSpeakers = new Set(act.interlude.map(entry => entry.speaker));
    for (const speaker of ['Riva', 'Cassian', 'Canal civil']) {
      assert.ok(interludeSpeakers.has(speaker), `${label}: voix ${speaker} absente de l'interlude`);
    }

    assert.deepEqual(Object.keys(act.codex).sort(), ['hijack', 'impact', 'origin', 'reading', 'title']);
    for (const [field, value] of Object.entries(act.codex)) {
      assert.equal(typeof value, 'string', `${label}/codex/${field}`);
      assert.ok(value.trim().length > 12, `${label}/codex/${field} incomplet`);
    }
  }
});

test('introduction, prologue, revelation, contre-plan et epilogue ferment l arc', () => {
  const story = loadStory();
  for (const scene of [story.intro, story.prologue, story.epilogue]) {
    assert.equal(typeof scene.id, 'string');
    assert.equal(typeof scene.title, 'string');
    assert.equal(typeof scene.summary, 'string');
    assert.ok(scene.lines.length >= 3);
    scene.lines.forEach((entry, index) => assertLine(entry, `${scene.id}/${index}`));
  }

  for (const field of ['kicker', 'status', 'location', 'objective', 'method', 'continueLabel']) {
    assert.equal(typeof story.prologue[field], 'string');
    assert.ok(story.prologue[field].length > 5);
  }

  const revelation = story.getActByBossId('mantis');
  const counterplan = story.getActByBossId('cyclotron');
  const climax = story.getActByBossId('omega');
  assert.match(JSON.stringify(revelation), /protocole M-0|programme Couronne/i);
  assert.match(JSON.stringify(counterplan), /contre-phase M-0/i);
  assert.match(JSON.stringify(climax), /détention|commandes locales/i);

  assert.equal(story.epilogue.districtRestorations.length, 6);
  assert.deepEqual(Array.from(story.epilogue.districtRestorations, entry => entry.bossId), [...story.bossOrder]);
  assert.match(story.epilogue.cassianFate, /détention/i);
  assert.match(story.epilogue.rivaChoice, /refuse la Couronne/i);
  assert.match(story.epilogue.lines.at(-1).text, /Pour ceux qui y vivent/);
});

test('le contrat meta diegetique couvre les surfaces narratives sans contaminer le Canal civil', () => {
  const story = loadStory();
  const metaVocabulary = /\b(?:boss|phases?|HUD|menu|pattern|checkpoint|script|build|Codex|générique|prologue|retries?|interface|joueuse|compteur|progression|cadre)\b|hors champ|barre de vie|écran de|meilleur temps|mise en scène|suite cachée|zone sûre/i;
  const forbiddenCivilVocabulary = /\b(?:boss|phases?|HUD|menu|pattern|checkpoint|script|build|Codex|générique|retries?|interface|joueuse|progression)\b|barre de vie|mise en scène|suite cachée/i;

  assert.match(story.intro.lines.map(entry => entry.text).join(' '), metaVocabulary);
  assert.match(story.prologue.lines.map(entry => entry.text).join(' '), metaVocabulary);
  assert.match(JSON.stringify(story.epilogue), metaVocabulary);

  const collectedLines = [];
  const visited = new WeakSet();
  const collectLines = value => {
    if (!value || typeof value !== 'object' || visited.has(value)) return;
    visited.add(value);
    if (typeof value.speaker === 'string' && typeof value.text === 'string') {
      collectedLines.push(value);
      return;
    }
    for (const nested of Object.values(value)) collectLines(nested);
  };
  collectLines(story);
  assert.ok(collectedLines.length > 30, 'les lignes narratives doivent être parcourues');
  for (const entry of collectedLines) {
    const normalizedSpeaker = entry.speaker
      .normalize('NFD')
      .replace(/\p{Diacritic}/gu, '')
      .toLowerCase();
    assert.notEqual(normalizedSpeaker, 'systeme', 'aucune voix générique Système ne doit parler au joueur');
    assert.notEqual(entry.channel, 'system', 'aucun canal narratif générique system ne doit subsister');
  }

  for (const act of story.acts) {
    const label = act.bossId;
    assert.match(act.preFight.map(entry => entry.text).join(' '), metaVocabulary, `${label}: pre-combat non meta`);
    assert.match(act.rivaJournal, metaVocabulary, `${label}: journal non meta`);
    assert.match(
      act.interlude.find(entry => entry.speaker === 'Riva')?.text || '',
      metaVocabulary,
      `${label}: sortie d'arene non meta`
    );
    for (const transition of act.phaseTransitions) {
      assert.match(
        transition.lines.map(entry => entry.text).join(' '),
        metaVocabulary,
        `${label}: transition ${transition.toPhase} non meta`
      );
    }
    const civilLine = act.interlude.find(entry => entry.speaker === 'Canal civil');
    assert.ok(civilLine, `${label}: Canal civil absent`);
    assert.doesNotMatch(civilLine.text, forbiddenCivilVocabulary, `${label}: Canal civil doit rester premier degre`);
  }
});

test('les objectifs et methodes restent litteraux malgre la couche meta', () => {
  const story = loadStory();
  assert.equal(story.prologue.objective, 'Réactiver les six relais de sécurité et reprendre la Couronne.');
  assert.equal(story.prologue.method, 'Lire · Esquiver · Exposer · Surcharger');
  for (const act of story.acts) {
    for (const contract of act.masteryContracts) {
      assert.doesNotMatch(contract.objective, /quatrième mur|générique|menu titre|suite cachée/i);
    }
  }
});

test('les textes corrigent les incoherences de lore et correspondent aux mecaniques annoncees', () => {
  const story = loadStory();
  const serialized = JSON.stringify(story).toLocaleLowerCase('fr-FR');
  for (const forbidden of [
    /six réacteurs/,
    /quatre marteaux/,
    /drones ioniques/,
    /ferraille orbitale/,
    /ralentissements temporels/,
    /toutes les technologies du circuit/
  ]) {
    assert.doesNotMatch(serialized, forbidden);
  }
  assert.match(serialized, /deux marteaux/);

  const mechanicalTerms = {
    rammer: ['salve', 'mine', 'impact'],
    kraken: ['salves ioniques', 'grille', 'condensateur'],
    drill: ['polarité', 'éruption', 'foreuse'],
    mantis: ['trajectoire', 'lames', 'ligne de temps'],
    cyclotron: ['pistons', 'métal en fusion', 'presse'],
    omega: ['roquettes', 'grilles', 'lames', 'mines']
  };
  for (const [bossId, terms] of Object.entries(mechanicalTerms)) {
    const act = story.getActByBossId(bossId);
    const surface = JSON.stringify({ phaseTitles: act.phaseTitles, codex: act.codex }).toLocaleLowerCase('fr-FR');
    for (const term of terms) assert.match(surface, new RegExp(term), `${bossId}: mecanique ${term} absente`);
  }
});

test('trois contrats de maitrise uniques sont fournis pour chaque boss', () => {
  const story = loadStory();
  const allContractIds = [];
  for (const bossId of story.bossOrder) {
    const act = story.getActByBossId(bossId);
    const contracts = story.getMasteryContracts(bossId);
    assert.equal(contracts, act.masteryContracts);
    assert.equal(contracts.length, 3, `${bossId}: trois contrats requis`);
    assert.ok(Object.isFrozen(contracts));
    for (const entry of contracts) {
      assert.ok(entry.id.startsWith(`${bossId}-`));
      assert.ok(entry.title.length > 4);
      assert.ok(entry.objective.length > 15);
      assert.ok(entry.metric.length > 2);
      assert.ok(['number', 'string'].includes(typeof entry.target));
      allContractIds.push(entry.id);
    }
  }
  assert.equal(allContractIds.length, 18);
  assert.equal(new Set(allContractIds).size, 18);
  assert.deepEqual(Object.keys(story.masteryContracts), [...story.bossOrder]);
});

test('les helpers publics sont deterministes et ne divulguent aucun etat mutable', () => {
  const story = loadStory();
  assert.equal(story.getActByBossId('rammer'), story.acts[0]);
  assert.equal(story.getActByOrder(6), story.acts[5]);
  assert.equal(story.getActByBossId('unknown'), null);
  assert.equal(story.getActByOrder(99), null);
  assert.equal(story.getScene(story.intro.id), story.intro);
  assert.equal(story.getScene(story.prologue.id), story.prologue);
  assert.equal(story.getScene(story.acts[2].id), story.acts[2]);
  assert.equal(story.getScene(story.epilogue.id), story.epilogue);
  assert.equal(story.getScene('unknown'), null);
  assert.equal(story.getCombatLabel('cyclotron', 'bombRain'), 'PLUIE DE MÉTAL EN FUSION');
  assert.equal(story.getCombatLabel('unknown', 'idle'), null);
  assert.ok(Object.isFrozen(story.combatLabels));
  const emptyContracts = story.getMasteryContracts('unknown');
  assert.equal(emptyContracts.length, 0);
  assert.ok(Object.isFrozen(emptyContracts));
});
