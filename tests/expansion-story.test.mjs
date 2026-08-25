import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import vm from 'node:vm';

const source = await readFile('expansion-story.js', 'utf8');

function loadExpansionStory() {
  const context = vm.createContext({});
  new vm.Script(source, { filename: 'expansion-story.js' }).runInContext(context);
  return context.GEARSTORM_EXPANSION_STORY;
}

const expectedNames = [
  'BASTION RICOCHET',
  'HYDRAULIC WARDEN',
  'HIVE FOREMAN',
  'ECHO FENCER',
  'BREAKER ARRAY',
  'VERTICAL VERDICT',
  'RAIL TYRANT',
  'TRIPLEX HUNTER',
  'GROUND EATER',
  'FLOODLINE LEVIATHAN',
  'CENTRIFUGE ZERO',
  'TEMPEST REGULATOR',
  'ASCENSION FRAME',
  'COUNTERFORGE',
  'CARRIER CATHEDRAL',
  'TWIN GOVERNORS',
  'LOADOUT REACTOR',
  'ORBITAL FAMINE',
  'LOGIC CRUCIBLE',
  'VECTOR VAULT',
  'SKYBORNE BATTERY',
  'ENDURANCE ENGINE',
  'ADAPTIVE ARCHIVIST',
  'NULL CROWN'
];

const expectedDistricts = [
  'Galerie des Parafoudres',
  'Chambre des Mors',
  'Dépôt des Micro-Forges',
  'Salle de Répétition',
  'Station de Délestage',
  'Puits des Contrepoids',
  'Rocade Cargo 7',
  'Couloir Triplex',
  'Chantier de Démolition',
  'Réservoir des Écluses',
  'Anneau Centrifuge',
  'Observatoire Météore',
  'Pilier des Ascensions',
  'Cour du Contrecoup',
  'Cathédrale Mobile',
  'Chambre des Deux Régulateurs',
  'Atelier des Modules',
  'Orbital Terminus',
  'Chambre Booléenne',
  'Chambre des Vecteurs',
  'Batterie Aérostatique',
  'Circuit d’Endurance',
  'Archives Réactives',
  'Trône Zéro'
];

function assertLine(entry, label) {
  assert.equal(typeof entry?.speaker, 'string', `${label}: speaker manquant`);
  assert.ok(entry.speaker.trim().length > 0, `${label}: speaker vide`);
  assert.equal(typeof entry?.text, 'string', `${label}: texte manquant`);
  assert.ok(entry.text.trim().length > 12, `${label}: texte trop court`);
  assert.equal(typeof entry?.channel, 'string', `${label}: canal manquant`);
}

test('expansion-story.js est autonome, immuable et intégré au runtime', () => {
  assert.doesNotMatch(source, /\b(?:document|window|localStorage)\s*[.[]|\bHTMLElement\b/);
  assert.doesNotMatch(source, /^\s*(?:import|export)\s/m);

  const story = loadExpansionStory();
  assert.ok(story, 'globalThis.GEARSTORM_EXPANSION_STORY doit etre expose');
  assert.equal(story.schemaVersion, 1);
  assert.equal(story.contentVersion, '2.10.0');
  assert.equal(story.status, 'runtime-integrated');
  assert.equal(story.runtimeIntegrated, true);
  assert.equal(story.expansionPremise.runtimeIntegrated, true);
  assert.ok(Object.isFrozen(story));
  assert.ok(Object.isFrozen(story.bosses));
  assert.ok(Object.isFrozen(story.bosses[0]));
  assert.ok(Object.isFrozen(story.bosses[0].codex));
  assert.ok(Object.isFrozen(story.bosses[0].interlude));
  assert.ok(Object.isFrozen(story.bosses[0].phaseLines));
  assert.ok(Object.isFrozen(story.masteryContracts));
  assert.ok(Object.isFrozen(story.forgeCircuit));
  assert.ok(Object.isFrozen(story.forgeCircuit.epilogue));
});

test('les entrees 07 a 30 suivent exactement le contrat BOSS_EXPANSION', () => {
  const story = loadExpansionStory();
  const expectedNumbers = Array.from({ length: 24 }, (_, index) => index + 7);
  const expectedCodes = expectedNumbers.map(number => String(number).padStart(2, '0'));

  assert.equal(story.bosses.length, 24);
  assert.deepEqual(Array.from(story.bosses, boss => boss.number), expectedNumbers);
  assert.deepEqual(Array.from(story.bosses, boss => boss.code), expectedCodes);
  assert.deepEqual(Array.from(story.bosses, boss => boss.name), expectedNames);
  assert.deepEqual(Array.from(story.bosses, boss => boss.district), expectedDistricts);
  assert.equal(new Set(Array.from(story.bosses, boss => boss.id)).size, 24);
  assert.equal(new Set(Array.from(story.bosses, boss => boss.civicFunction)).size, 24);
});

test('chaque boss jouable fournit un contrat narratif et mécanique complet', () => {
  const story = loadExpansionStory();
  const observedInterludeOrders = new Set();
  for (const boss of story.bosses) {
    const label = `${boss.code}/${boss.id}`;
    for (const field of ['name', 'district', 'civicFunction', 'shortIntro', 'metaLine', 'journal', 'objective', 'mechanic', 'restoration']) {
      assert.equal(typeof boss[field], 'string', `${label}: ${field} manquant`);
      const minimum = ['name', 'district'].includes(field) ? 4 : 18;
      assert.ok(boss[field].trim().length > minimum, `${label}: ${field} incomplet`);
    }

    assert.equal(boss.phaseTitles.length, 3, `${label}: trois phases requises`);
    assert.equal(new Set(boss.phaseTitles).size, 3, `${label}: phases dupliquees`);
    assert.ok(boss.phaseTitles.every(title => typeof title === 'string' && title.length > 5));
    assert.equal(boss.phaseLines.length, 3, `${label}: trois voix de phase requises`);
    assert.equal(new Set(boss.phaseLines).size, 3, `${label}: voix de phase dupliquees`);
    assert.ok(boss.phaseLines.every(text => typeof text === 'string' && text.length > 35));

    assert.equal(boss.interlude.length, 3, `${label}: interlude tripartite requis`);
    boss.interlude.forEach((entry, index) => assertLine(entry, `${label}/interlude/${index}`));
    const speakers = Array.from(boss.interlude, entry => entry.speaker);
    assert.deepEqual([...speakers].sort(), ['Archive Voltério', 'Nara Vey', 'Riva']);
    observedInterludeOrders.add(speakers.join(' > '));

    assert.deepEqual(Object.keys(boss.codex).sort(), ['hijack', 'impact', 'origin', 'reading', 'title']);
    for (const [field, value] of Object.entries(boss.codex)) {
      assert.equal(typeof value, 'string', `${label}/codex/${field}`);
      assert.ok(value.trim().length > 15, `${label}/codex/${field} incomplet`);
    }
  }
  assert.ok(observedInterludeOrders.size >= 3, 'les 24 interludes ne doivent pas suivre un ordre de voix unique');
});

test('quatre vagues de six boss restent ordonnees et immuables', () => {
  const story = loadExpansionStory();
  assert.equal(story.waves.length, 4);

  for (const wave of story.waves) {
    assert.equal(wave.bossCodes.length, 6);
    assert.ok(Object.isFrozen(wave));
    assert.ok(Object.isFrozen(wave.bossCodes));
    assert.equal(typeof wave.revelation, 'string');
    assert.ok(wave.revelation.length > 60, `${wave.id}: révélation trop faible`);
    const bosses = story.getBossesByWave(wave.id);
    assert.equal(bosses.length, 6);
    assert.ok(Object.isFrozen(bosses));
    assert.deepEqual(Array.from(bosses, boss => boss.code), Array.from(wave.bossCodes));
    assert.equal(story.getWave(wave.number), wave);
    assert.equal(story.getWave(String(wave.number)), wave);
  }

  assert.deepEqual(Array.from(story.bosses, boss => boss.wave), [
    1, 1, 1, 1, 1, 1,
    2, 2, 2, 2, 2, 2,
    3, 3, 3, 3, 3, 3,
    4, 4, 4, 4, 4, 4
  ]);
});

test('le contrat meta diegetique v2.10 couvre chaque boss et chaque anneau', () => {
  const story = loadExpansionStory();
  const metaVocabulary = /\b(?:actes?|cadre|coulisses?|rôles?|scènes?|rappels?|rideau|répliques?|projecteurs?|public|auteur|final|décor|texte|accessoire|règles?|secret|histoire|page|archive|effet|entrées?|écrire|appelle)\b|hors champ|mise en scène|dernier mot/i;
  const forbiddenNarrativeVocabulary = /\b(?:boss|hitbox|jeu|spam|checkpoint|frame|HUD|interface|build|retry|joueuse|compteur|pattern)\b|barre de vie|level design|phase (?:deux|trois|\d)|menu titre|suite cachée/i;
  const metaLines = [];
  const phaseLines = [];

  for (const boss of story.bosses) {
    assert.match(boss.metaLine, metaVocabulary, `${boss.code}: metaLine sans marqueur meta`);
    assert.doesNotMatch(boss.metaLine, /\b(?:Sonic|SEGA|Mario|Eggman|OpenAI)\b/i, `${boss.code}: référence externe interdite`);
    assert.doesNotMatch(boss.metaLine, forbiddenNarrativeVocabulary, `${boss.code}: commentaire meta trop technique`);
    assert.doesNotMatch(boss.journal, forbiddenNarrativeVocabulary, `${boss.code}: journal trop technique`);
    for (const phaseLine of boss.phaseLines) {
      assert.doesNotMatch(phaseLine, forbiddenNarrativeVocabulary, `${boss.code}: voix de phase trop technique`);
      phaseLines.push(phaseLine);
    }
    for (const entry of boss.interlude) {
      assert.doesNotMatch(entry.text, forbiddenNarrativeVocabulary, `${boss.code}/${entry.speaker}: jargon technique dans le dialogue`);
    }
    const civilLine = boss.interlude.find(entry => entry.speaker === 'Nara Vey');
    assert.ok(civilLine, `${boss.code}: Nara Vey absente`);
    assert.equal(civilLine.channel, 'civil');
    assert.doesNotMatch(civilLine.text, forbiddenNarrativeVocabulary, `${boss.code}: Nara doit rester diégétique`);
    metaLines.push(boss.metaLine);
  }

  assert.equal(new Set(metaLines).size, 24, 'chaque boss Forge doit posseder une ligne meta propre');
  assert.equal(new Set(phaseLines).size, 72, 'chaque transformation Forge doit posseder une voix propre');
  for (const wave of story.waves) {
    assert.match(wave.title, / · /, `${wave.id}: titre d'anneau non meta`);
    assert.match(wave.premise, metaVocabulary, `${wave.id}: premise d'anneau non meta`);
    assert.doesNotMatch(wave.premise, forbiddenNarrativeVocabulary, `${wave.id}: premise trop technique`);
    assert.match(wave.revelation, /Cassian|Couronne|Trône Zéro/);
  }
  assert.match(story.expansionPremise.title, /ville continue|hors cadre/i);
  assert.match(story.expansionPremise.playerPromise, /Codex/i);
  assert.match(story.expansionPremise.summary, /Nuit des Six Extinctions/);
  assert.match(story.expansionPremise.summary, /abolition du mandat de la Couronne/);
  assert.match(story.expansionPremise.continuity, /Couronne provisoire/);
  assert.match(story.expansionPremise.playerPromise, /faute de Riva/);
});

test('trois contrats de maitrise uniques existent pour chacun des 24 boss', () => {
  const story = loadExpansionStory();
  const allIds = [];

  for (const boss of story.bosses) {
    const contracts = story.getMasteryContracts(boss.id);
    assert.equal(contracts, boss.masteryContracts);
    assert.equal(contracts.length, 3, `${boss.id}: trois contrats requis`);
    assert.ok(Object.isFrozen(contracts));

    for (const entry of contracts) {
      assert.ok(entry.id.startsWith(`${boss.id}-`), `${entry.id}: prefixe de boss incorrect`);
      assert.ok(entry.title.length > 4);
      assert.ok(entry.objective.length > 18);
      assert.ok(entry.metric.length > 2);
      assert.ok(['number', 'string'].includes(typeof entry.target));
      assert.ok(Object.isFrozen(entry));
      allIds.push(entry.id);
    }
  }

  assert.equal(allIds.length, 72);
  assert.equal(new Set(allIds).size, 72);
  assert.equal(Object.keys(story.masteryContracts).length, 24);
});

test('les contrats de renvoi ouvrent une fenêtre réalisable avant le tir final', () => {
  const story = loadExpansionStory();
  const ids = [
    'bastion-ricochet-reflect-finish',
    'echo-fencer-disc-finish',
    'vector-vault-vector-finish',
    'skyborne-battery-charged-finish'
  ];

  for (const id of ids) {
    const contract = story.bosses
      .flatMap(boss => boss.masteryContracts)
      .find(entry => entry.id === id);
    assert.ok(contract, `${id}: contrat absent`);
    assert.match(contract.objective, /^Ouvrir la dernière fenêtre/);
    assert.match(contract.objective, /puis (?:l’)?achever/i);
    assert.doesNotMatch(contract.objective, /^Porter le coup final.*(?:renvoy|disque|trajectoire)/i);
  }
});

test('les objectifs restent alignes aux mecaniques annoncees dans le plan', () => {
  const story = loadExpansionStory();
  const termsByCode = {
    '07': ['renvoy', 'relais'],
    '08': ['bélier', 'presse'],
    '09': ['drone', 'famille'],
    '10': ['action', 'mémorisée'],
    '11': ['quatre module', 'ordre'],
    '12': ['contrepoids', 'plateforme'],
    '13': ['convoi', 'voie'],
    '14': ['trois voie', 'permut'],
    '15': ['appui', 'sol'],
    '16': ['vanne', 'pression'],
    '17': ['gravité', 'quatre-vingt-dix'],
    '18': ['vent', 'pluie', 'chaleur'],
    '19': ['bras', 'ancrage'],
    '20': ['contre', 'annoncée'],
    '21': ['section', 'cathédrale'],
    '22': ['bouclier', 'une seule cible'],
    '23': ['adaptation', 'équipement'],
    '24': ['réserve', 'condensateur'],
    '25': ['séquence', 'quarante-cinq'],
    '26': ['déflecteur', 'trajectoire'],
    '27': ['torpille', 'verrou'],
    '28': ['six manche', 'reprise'],
    '29': ['adaptation', 's’efface'],
    '30': ['renvoi', 'modules', 'rupture']
  };

  for (const [code, terms] of Object.entries(termsByCode)) {
    const boss = story.getBossById(code);
    const surface = `${boss.objective} ${boss.mechanic}`.toLocaleLowerCase('fr-FR');
    for (const term of terms) assert.ok(surface.includes(term), `${code}: mecanique ${term} absente`);
  }
});

test('la continuite maintient Cassian detenu et fait de NULL CROWN un prototype autonome', () => {
  const story = loadExpansionStory();
  const premise = JSON.stringify(story.expansionPremise).toLocaleLowerCase('fr-FR');
  const nullCrown = JSON.stringify(story.getBossById('null-crown')).toLocaleLowerCase('fr-FR');

  assert.match(premise, /détention|détenu/);
  assert.match(premise, /archives/);
  assert.match(premise, /pas son retour|pas.*résurrection/);
  assert.match(nullCrown, /prototype/);
  assert.match(nullCrown, /(?:pas|ni) son retour/);
  assert.doesNotMatch(nullCrown, /cassian ressuscit/);
});

test('le Circuit Forge ordonne les 24 boss et ses quatre checkpoints de vague', () => {
  const story = loadExpansionStory();
  const circuit = story.forgeCircuit;
  assert.equal(circuit.id, 'forge-circuit-07-30');
  assert.equal(circuit.mode, 'forgeRush');
  assert.equal(circuit.upgradesBetweenBosses, true);
  assert.deepEqual(Array.from(circuit.bossOrder), Array.from(story.bosses, boss => boss.id));
  assert.deepEqual(Array.from(circuit.resumeCheckpoints), ['fight', 'upgrade', 'ending']);
  assert.equal(circuit.waveCheckpoints.length, 4);
  for (const checkpoint of circuit.waveCheckpoints) {
    const waveBosses = story.getBossesByWave(checkpoint.wave);
    assert.equal(checkpoint.firstBossId, waveBosses[0].id);
    assert.equal(checkpoint.finalBossId, waveBosses.at(-1).id);
    assert.ok(checkpoint.title.length > 8);
  }
  assert.match(circuit.epilogue.summary, /vingt-quatre services/i);
  assert.match(circuit.epilogue.summary, /Trône Zéro se tait/i);
  assert.match(circuit.epilogue.outcome, /Cassian reste détenu/);
  assert.match(circuit.epilogue.outcome, /NULL CROWN rejoint les preuves publiques/i);
  assert.match(circuit.epilogue.outcome, /accord des six districts/i);
  assert.match(circuit.epilogue.outcome, /sans clause secrète/i);
  assert.doesNotMatch(circuit.epilogue.outcome, /vingt-quatre services/i, 'l’épilogue ne doit pas répéter son résumé');
});

test('les helpers sont deterministes et ne renvoient aucun conteneur mutable', () => {
  const story = loadExpansionStory();
  const first = story.bosses[0];
  const last = story.bosses.at(-1);

  assert.equal(story.getBossById(first.id), first);
  assert.equal(story.getBossById('07'), first);
  assert.equal(story.getBossByNumber(7), first);
  assert.equal(story.getBossByNumber('30'), last);
  assert.equal(story.getBossById('unknown'), null);
  assert.equal(story.getBossByNumber(99), null);
  assert.equal(story.getWave('unknown'), null);
  assert.equal(story.getPhaseTitle('07', 1), first.phaseTitles[0]);
  assert.equal(story.getPhaseTitle(last.id, 3), last.phaseTitles[2]);
  assert.equal(story.getPhaseTitle('07', 4), null);
  assert.equal(story.getPhaseTitle('unknown', 1), null);

  const emptyBosses = story.getBossesByWave('unknown');
  const emptyContracts = story.getMasteryContracts('unknown');
  assert.equal(emptyBosses.length, 0);
  assert.equal(emptyContracts.length, 0);
  assert.ok(Object.isFrozen(emptyBosses));
  assert.ok(Object.isFrozen(emptyContracts));

  const restorationPlan = story.getRestorationPlan();
  assert.equal(restorationPlan, story.restorationPlan);
  assert.equal(restorationPlan.length, 24);
  assert.ok(Object.isFrozen(restorationPlan));
  assert.ok(Object.isFrozen(restorationPlan[0]));
  assert.deepEqual(Array.from(restorationPlan, entry => entry.code), Array.from(story.bosses, boss => boss.code));
});
