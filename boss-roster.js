(() => {
  'use strict';

  const root = globalThis;
  const API_VERSION = '1.0.0';
  const SCHEMA_VERSION = 1;
  const LEGACY_IDS = Object.freeze(['rammer', 'kraken', 'drill', 'mantis', 'cyclotron', 'omega']);
  const COMMON_STATE_SEQUENCE = Object.freeze([
    'intro',
    'phaseEnter',
    'neutral',
    'telegraph',
    'active',
    'recovery',
    'vulnerable',
    'phaseTransition',
    'defeat'
  ]);

  function deepFreeze(value) {
    if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
    Object.freeze(value);
    Object.values(value).forEach(deepFreeze);
    return value;
  }

  const PATTERN_FAMILIES = deepFreeze({
    reflect: {
      id: 'reflect',
      label: 'RENVOI CINÉTIQUE',
      loop: 'Identifier une charge marquée, la dévier, puis toucher le relais ou le noyau.',
      telegraph: 'Trajectoire pointillée, chevrons et signal audio montant.',
      verbs: ['viser', 'renvoyer', 'repositionner']
    },
    lure: {
      id: 'lure',
      label: 'LEURRE D’ARÈNE',
      loop: 'Attirer la charge vers une presse ou un appui signalé avant de sortir de l’axe.',
      telegraph: 'Couloir hachuré, refuge encadré et verrouillage tardif de la cible.',
      verbs: ['attirer', 'esquiver', 'punir']
    },
    modules: {
      id: 'modules',
      label: 'RÉSEAU MODULAIRE',
      loop: 'Détruire des pièces possédant chacune une hitbox et un état de dégâts.',
      telegraph: 'Anneau numéroté sur chaque pièce active et état intact/endommagé/détruit.',
      verbs: ['prioriser', 'démonter', 'exposer']
    },
    mimic: {
      id: 'mimic',
      label: 'DUEL MIMÉTIQUE',
      loop: 'Varier tir, saut et ruée pour éviter une réponse spécialisée du boss.',
      telegraph: 'Action observée nommée avant que la réponse correspondante ne soit armée.',
      verbs: ['varier', 'observer', 'adapter']
    },
    'vertical-lane': {
      id: 'vertical-lane',
      label: 'AXES ET VOIES',
      loop: 'Lire les voies condamnées et traverser l’axe sûr avant verrouillage.',
      telegraph: 'Voies numérotées, bandes hachurées et zone sûre toujours visible.',
      verbs: ['changer de voie', 'monter', 'traverser']
    },
    'gravity-weather': {
      id: 'gravity-weather',
      label: 'ENVIRONNEMENT PILOTÉ',
      loop: 'Composer avec un seul état de gravité, fluide, énergie ou météo à la fois.',
      telegraph: 'Pictogramme, texte et impulsion sonore indépendants de la couleur.',
      verbs: ['compenser', 'stabiliser', 'neutraliser']
    },
    'posture-duo': {
      id: 'posture-duo',
      label: 'RUPTURE ET DUO',
      loop: 'Ruer pendant la fenêtre de contre ou viser la cible alimentée pour rompre la posture.',
      telegraph: 'Anneau de contre, cible principale nommée et jauge de posture explicite.',
      verbs: ['parer', 'rompre', 'alterner']
    },
    'puzzle-endgame': {
      id: 'puzzle-endgame',
      label: 'LOGIQUE ET ENDGAME',
      loop: 'Résoudre une courte séquence de formes pendant que la machine reste active.',
      telegraph: 'Formes, chiffres et trajectoires ; aucune information ne dépend de la couleur.',
      verbs: ['déduire', 'ordonner', 'survivre']
    }
  });

  const LEGACY_SOURCE = [
    {
      id: 'rammer', name: 'RIVET REX', epithet: 'Le bélier mono-roue à marteaux variables',
      color: '#ff8b42', accent: '#fff0a6', hp: 120, parTime: 44, arena: 'Rocade des Rivets',
      quote: '« Riva Spark ! Trois phases, deux marteaux et absolument aucun frein. Admire le génie de Voltério ! »',
      description: 'Charges, marteaux, mines et impacts sismiques.',
      transmission: 'Le premier verrou du Circuit vient de céder. Voltério comprend enfin que tu n’es pas une variable de laboratoire.',
      weakPoint: { x: 20, y: -42, r: 30, part: 'core' }, hitbox: { w: 190, h: 160 },
      patterns: [['patrol', 'slam'], ['patrol', 'slam', 'mines'], ['patrol', 'slam', 'seismic-mines']]
    },
    {
      id: 'kraken', name: 'SKY SLICER', epithet: 'Le rapace bombardier à géométrie variable',
      color: '#2bc9e8', accent: '#b7fbff', hp: 145, parTime: 52, arena: 'Couloir des Hautes-Tensions',
      quote: '« Le ciel est mon laboratoire, Spark. Essaie donc d’esquiver une équation qui vole ! »',
      description: 'Salves ioniques, lignes de foudre et condensateur exposé.',
      transmission: 'Le brouillage aérien est tombé. Les districts du nord reçoivent de nouveau le signal de Riva.',
      weakPoint: { x: 0, y: 5, r: 34, part: 'core' }, hitbox: { w: 190, h: 160 },
      patterns: [['orbit', 'beam'], ['orbit', 'beam-grid'], ['orbit', 'beam-grid-cross']]
    },
    {
      id: 'drill', name: 'MAGNETRON', epithet: 'L’araignée magnétique qui replie l’arène',
      color: '#b777ff', accent: '#f2dcff', hp: 160, parTime: 58, arena: 'Fosse Ferromagnétique',
      quote: '« Attraction, répulsion… et humiliation. La physique a déjà choisi son camp ! »',
      description: 'Inversions de polarité, éruptions et débris magnétiques.',
      transmission: 'Les rails d’évacuation sont libérés. Les habitants commencent à quitter les gradins forcés.',
      weakPoint: { x: 0, y: -56, r: 31, part: 'core' }, hitbox: { w: 190, h: 160 },
      patterns: [['burrow', 'erupt'], ['polarity', 'erupt'], ['polarity', 'erupt', 'debris']]
    },
    {
      id: 'mantis', name: 'CHRONO MANTIS', epithet: 'La mante temporelle aux lames déphasées',
      color: '#ff4f7b', accent: '#ffd0dc', hp: 175, parTime: 54, arena: 'Horloge de la Faille',
      quote: '« J’ai ralenti le temps autour de toi. Techniquement, ta défaite dure déjà depuis plusieurs minutes. »',
      description: 'Ruées, téléportations, engrenages et ralentissements.',
      transmission: 'Les horloges du Circuit redémarrent. Voltério ne peut plus effacer les secondes où tu le dépasses.',
      weakPoint: { x: 0, y: -5, r: 31, part: 'core' }, hitbox: { w: 190, h: 160 },
      patterns: [['dash', 'blades'], ['dash', 'chrono-field'], ['dash', 'chrono-grid']]
    },
    {
      id: 'cyclotron', name: 'FOUNDRY TITAN', epithet: 'Le colosse-fonderie qui remodèle le sol',
      color: '#ffb12e', accent: '#fff0b7', hp: 205, parTime: 66, arena: 'Fournaise des Pistons',
      quote: '« Mon Titan recycle une ville entière avant le petit-déjeuner. Toi, tu seras l’échantillon de démonstration. »',
      description: 'Pistons, lave, flammes et pluie de métal en fusion.',
      transmission: 'La fonderie est froide. Pour la première fois, le Circuit n’est plus alimenté par la peur.',
      weakPoint: { x: 0, y: -12, r: 34, part: 'molten-core' }, hitbox: { w: 230, h: 160 },
      patterns: [['roll', 'bomb-rain'], ['roll', 'bomb-rain', 'piston'], ['roll', 'lava-line', 'crash']]
    },
    {
      id: 'omega', name: 'CROWN ENGINE Ω', epithet: 'La forteresse finale aux trois formes',
      color: '#8f78ff', accent: '#fff4ad', hp: 280, parTime: 82, arena: 'Citadelle Voltério',
      quote: '« Toutes mes inventions, un seul trône, et moi au centre. La conclusion était inévitable ! »',
      description: 'Trois formes mêlant roquettes, grilles laser, débris magnétiques, chrono-pièges et mines.',
      transmission: 'La Couronne est brisée. Le Circuit Voltério appartient de nouveau à ceux qui y vivent.',
      weakPoint: { x: 0, y: 8, r: 39, part: 'omega-core' }, hitbox: { w: 190, h: 220 },
      patterns: [['arsenal', 'laser-grid'], ['arsenal', 'magnetic-grid'], ['arsenal', 'chrono-grid', 'core-open']]
    }
  ];

  const EXPANSION_SOURCE = [
    { order: 7, id: 'bastion-ricochet', name: 'BASTION RICOCHET', wave: 1, family: 'reflect', arena: 'Galerie des Parafoudres', hp: 150, parTime: 58, color: '#f58b47', accent: '#ffe38a', partCount: 3, partRole: 'relay', patterns: ['single-angle', 'double-ricochet', 'mobile-relays'], rule: 'Trois relais ; chaque charge renvoyable porte chevrons et son propre signal.' },
    { order: 8, id: 'hydraulic-warden', name: 'HYDRAULIC WARDEN', wave: 1, family: 'lure', arena: 'Chambre des Mors', hp: 165, parTime: 60, color: '#df5d49', accent: '#ffd0a3', partCount: 2, partRole: 'press-arm', patterns: ['single-ram', 'cross-press', 'fast-safe-press'], rule: 'Une zone de refuge reste visible et le télégraphe ne raccourcit jamais.' },
    { order: 9, id: 'hive-foreman', name: 'HIVE FOREMAN', wave: 1, family: 'modules', arena: 'Dépôt des Micro-Forges', hp: 170, parTime: 64, color: '#d9b83e', accent: '#fff4a8', partCount: 3, partRole: 'drone', patterns: ['guard-drone', 'repair-drone', 'ammo-drone'], rule: 'Une seule famille de drones est active par vague et sa fonction est nommée.' },
    { order: 10, id: 'echo-fencer', name: 'ECHO FENCER', wave: 1, family: 'mimic', arena: 'Salle de Répétition', hp: 160, parTime: 57, color: '#bd6cff', accent: '#f0ceff', patterns: ['echo-shot', 'echo-jump', 'echo-dash'], rule: 'La copie est annoncée ; aucune commande de Riva n’est désactivée.' },
    { order: 11, id: 'breaker-array', name: 'BREAKER ARRAY', wave: 1, family: 'modules', arena: 'Station de Délestage', hp: 190, parTime: 68, color: '#5cc8e8', accent: '#c6f7ff', partCount: 4, partRole: 'module', patterns: ['free-order-modules', 'order-remix', 'mobile-modules'], rule: 'Les quatre modules ont des hitboxes et aucun ordre ne crée de choix perdant.' },
    { order: 12, id: 'vertical-verdict', name: 'VERTICAL VERDICT', wave: 1, family: 'vertical-lane', arena: 'Puits des Contrepoids', hp: 180, parTime: 66, color: '#4fa6ff', accent: '#d3edff', arenaType: 'vertical', patterns: ['counterweight-rise', 'double-warning-floor', 'moving-safe-platform'], rule: 'Le bas n’est dangereux qu’après deux avertissements et une voie sûre existe.' },

    { order: 13, id: 'rail-tyrant', name: 'RAIL TYRANT', wave: 2, family: 'vertical-lane', arena: 'Rocade Cargo 7', hp: 195, parTime: 69, color: '#e45b3d', accent: '#ffd0a8', arenaType: 'scroll', partCount: 4, partRole: 'coupling', patterns: ['pursuit', 'couplings', 'engine-pass'], rule: 'Aucun obstacle impossible ne partage une voie ; une voie reste ouverte.' },
    { order: 14, id: 'triplex-hunter', name: 'TRIPLEX HUNTER', wave: 2, family: 'vertical-lane', arena: 'Couloir Triplex', hp: 185, parTime: 63, color: '#3bc7b7', accent: '#c7fff7', arenaType: 'lanes', patterns: ['front-lock', 'cross-lock', 'flank-shot'], rule: 'Les trois voies sont numérotées et toute permutation précède le verrouillage.' },
    { order: 15, id: 'ground-eater', name: 'GROUND EATER', wave: 2, family: 'lure', arena: 'Chantier de Démolition', hp: 205, parTime: 72, color: '#a87b4a', accent: '#f5d59f', arenaType: 'destructible', patterns: ['break-support', 'rolling-rebuild', 'support-feint'], rule: 'La reconstruction tourne et conserve toujours au moins 35 % de sol praticable.' },
    { order: 16, id: 'floodline-leviathan', name: 'FLOODLINE LEVIATHAN', wave: 2, family: 'gravity-weather', arena: 'Réservoir des Écluses', hp: 210, parTime: 75, color: '#287fc7', accent: '#b9e9ff', arenaType: 'fluid', partCount: 3, partRole: 'valve', patterns: ['low-water', 'pressure-current', 'high-water-valves'], rule: 'La pression remplace l’oxygène et aucune variation non signalée ne tue instantanément.' },
    { order: 17, id: 'centrifuge-zero', name: 'CENTRIFUGE ZERO', wave: 2, family: 'gravity-weather', arena: 'Anneau Centrifuge', hp: 205, parTime: 73, color: '#7c68e8', accent: '#ded7ff', arenaType: 'gravity', patterns: ['quarter-turn', 'half-cycle', 'rotor-window'], rule: 'La gravité tourne par quarts ; en mouvement réduit la caméra reste stable.' },
    { order: 18, id: 'tempest-regulator', name: 'TEMPEST REGULATOR', wave: 2, family: 'gravity-weather', arena: 'Observatoire Météore', hp: 215, parTime: 76, color: '#44b7d7', accent: '#e2fbff', arenaType: 'weather', partCount: 3, partRole: 'module', patterns: ['wind', 'conductive-rain', 'heat'], rule: 'Un seul danger météo est actif et chaque état a texte, pictogramme et son.' },

    { order: 19, id: 'ascension-frame', name: 'ASCENSION FRAME', wave: 3, family: 'vertical-lane', arena: 'Pilier des Ascensions', hp: 230, parTime: 80, color: '#dd8246', accent: '#ffe1b7', arenaType: 'vertical', partCount: 3, partRole: 'anchor', patterns: ['left-arm-route', 'right-arm-route', 'central-anchor'], rule: 'Trois routes courtes ; une chute ramène toujours vers une plateforme de reprise.' },
    { order: 20, id: 'counterforge', name: 'COUNTERFORGE', wave: 3, family: 'posture-duo', arena: 'Cour du Contrecoup', hp: 205, parTime: 67, color: '#ef4f67', accent: '#ffd0d8', patterns: ['dash-counter', 'delayed-counter', 'posture-burst'], rule: 'La fenêtre de contre possède signal visuel, sonore et haptique ; Pilote l’élargit.' },
    { order: 21, id: 'carrier-cathedral', name: 'CARRIER CATHEDRAL', wave: 3, family: 'vertical-lane', arena: 'Cathédrale Mobile', hp: 250, parTime: 88, color: '#536ca8', accent: '#dbe5ff', arenaType: 'colossus', partCount: 3, partRole: 'section', patterns: ['outer-deck', 'engine-nave', 'heart-vault'], rule: 'Chaque section est courte et constitue un checkpoint interne du Laboratoire.', checkpoints: ['outer-deck', 'engine-nave', 'heart-vault'] },
    { order: 22, id: 'twin-governors', name: 'TWIN GOVERNORS', wave: 3, family: 'posture-duo', arena: 'Chambre des Deux Régulateurs', hp: 225, parTime: 78, color: '#4fa8a0', accent: '#d5fff8', partCount: 2, partRole: 'governor', patterns: ['shield-pass', 'power-pass', 'mutual-collision'], rule: 'Une seule cible principale est vulnérable et l’alimentation active est nommée.' },
    { order: 23, id: 'loadout-reactor', name: 'LOADOUT REACTOR', wave: 3, family: 'mimic', arena: 'Atelier des Modules', hp: 220, parTime: 74, color: '#e38b3d', accent: '#ffe5b8', patterns: ['observe-build', 'single-adaptation', 'counter-window'], rule: 'Une seule mécanique du build influence la réponse ; aucun hard counter.' },
    { order: 24, id: 'orbital-famine', name: 'ORBITAL FAMINE', wave: 3, family: 'gravity-weather', arena: 'Orbital Terminus', hp: 235, parTime: 82, color: '#556fe8', accent: '#dbe0ff', arenaType: 'energy', partCount: 3, partRole: 'condensator', patterns: ['energy-drain', 'risky-recharge', 'guaranteed-condensator'], rule: 'Une recharge apparaît à cadence garantie et sa réserve reste distincte de la vie.' },

    { order: 25, id: 'logic-crucible', name: 'LOGIC CRUCIBLE', wave: 4, family: 'puzzle-endgame', arena: 'Chambre Booléenne', hp: 215, parTime: 76, color: '#ba5ce8', accent: '#f1d6ff', patterns: ['shape-sequence', 'logic-pairs', 'moving-sequence'], rule: 'La séquence dure moins de 45 secondes, utilise formes et chiffres, et ne régresse pas sur dégâts.' },
    { order: 26, id: 'vector-vault', name: 'VECTOR VAULT', wave: 4, family: 'reflect', arena: 'Chambre des Vecteurs', hp: 225, parTime: 79, color: '#42a9df', accent: '#cef2ff', partCount: 3, partRole: 'deflector', patterns: ['single-vector', 'preview-ricochet', 'moving-deflectors'], rule: 'Pilote prévisualise la trajectoire et la machine reste active pendant la résolution.' },
    { order: 27, id: 'skyborne-battery', name: 'SKYBORNE BATTERY', wave: 4, family: 'reflect', arena: 'Batterie Aérostatique', hp: 230, parTime: 81, color: '#4599ce', accent: '#d3f0ff', arenaType: 'flight', patterns: ['mobile-fire', 'torpedo-return', 'assisted-volley'], rule: 'Les torpilles portent un verrou lisible et l’assistance vise le renvoi, jamais l’esquive.' },
    { order: 28, id: 'endurance-engine', name: 'ENDURANCE ENGINE', wave: 4, family: 'puzzle-endgame', arena: 'Circuit d’Endurance', hp: 260, parTime: 96, color: '#cf6a35', accent: '#ffe0a8', patterns: ['rounds-1-2', 'rounds-3-4', 'rounds-5-6'], rule: 'Six manches courtes et annoncées ; le Laboratoire reprend au début de la manche.', checkpoints: ['round-1', 'round-2', 'round-3', 'round-4', 'round-5', 'round-6'] },
    { order: 29, id: 'adaptive-archivist', name: 'ADAPTIVE ARCHIVIST', wave: 4, family: 'mimic', arena: 'Archives Réactives', hp: 240, parTime: 83, color: '#7d69d6', accent: '#e8ddff', patterns: ['sample-input', 'visible-adaptation', 'reset-response'], rule: 'L’adaptation est visible, locale à la tentative et limitée à une réponse.' },
    { order: 30, id: 'null-crown', name: 'NULL CROWN', wave: 4, family: 'puzzle-endgame', phaseFamilies: ['reflect', 'modules', 'posture-duo'], arena: 'Trône Zéro', hp: 300, parTime: 105, color: '#7656c9', accent: '#fff0a8', partCount: 4, partRole: 'null-module', patterns: ['null-reflection', 'null-modules', 'null-rupture'], rule: 'Arbitre final déjà visible dans le Catalogue : renvoyer les charges, choisir l’ordre des modules, puis rompre sa posture.', secret: false, checkpoints: ['phase-1', 'phase-2', 'phase-3'] }
  ];

  // Une signature par machine : les familles restent un vocabulaire commun,
  // mais chaque profil possède son propre automate secondaire et ses propres états.
  const SIGNATURE_PROFILES = deepFreeze({
    'bastion-ricochet': { mechanicId: 'relay-bank', phaseStates: ['angle-lock', 'cross-bank', 'relay-drift'], hazard: 'reflect-split', cadence: 0.58, intensity: 2 },
    'hydraulic-warden': { mechanicId: 'pressure-refuge', phaseStates: ['ram-prime', 'alternating-press', 'total-lock'], hazard: 'wall-press', cadence: 0.72, intensity: 2 },
    'hive-foreman': { mechanicId: 'drone-priority', phaseStates: ['guard-shift', 'repair-shift', 'ammo-shift'], hazard: 'repair-cycle', cadence: 0.84, intensity: 3 },
    'echo-fencer': { mechanicId: 'action-echo', phaseStates: ['sample-step', 'delayed-copy', 'saturated-copy'], hazard: 'input-copy', cadence: 0.66, intensity: 2 },
    'breaker-array': { mechanicId: 'breaker-order', phaseStates: ['free-order', 'order-remix', 'mobile-order'], hazard: 'module-grid', cadence: 0.76, intensity: 4 },
    'vertical-verdict': { mechanicId: 'counterweight-climb', phaseStates: ['weight-rise', 'double-warning', 'summit-shift'], hazard: 'fall-line', cadence: 0.82, intensity: 2 },
    'rail-tyrant': { mechanicId: 'cargo-pursuit', phaseStates: ['convoy-lock', 'coupling-break', 'engine-pass'], hazard: 'rail-pass', cadence: 0.70, intensity: 4 },
    'triplex-hunter': { mechanicId: 'lane-permutation', phaseStates: ['front-lock', 'cross-permutation', 'triple-flank'], hazard: 'lane-cross', cadence: 0.64, intensity: 3 },
    'ground-eater': { mechanicId: 'rotating-rebuild', phaseStates: ['support-mark', 'rolling-collapse', 'support-feint'], hazard: 'floor-collapse', cadence: 0.80, intensity: 3 },
    'floodline-leviathan': { mechanicId: 'pressure-valves', phaseStates: ['low-water', 'conductive-current', 'turbine-flood'], hazard: 'pressure-surge', cadence: 0.86, intensity: 3 },
    'centrifuge-zero': { mechanicId: 'quarter-gravity', phaseStates: ['quarter-turn', 'offset-mass', 'axis-zero'], hazard: 'gravity-fall', cadence: 0.74, intensity: 4 },
    'tempest-regulator': { mechanicId: 'weather-triad', phaseStates: ['wind-shear', 'charged-rain', 'heat-dome'], hazard: 'weather-cycle', cadence: 0.78, intensity: 3 },
    'ascension-frame': { mechanicId: 'recovery-climb', phaseStates: ['left-route', 'right-route', 'central-anchor'], hazard: 'recovery-fall', cadence: 0.82, intensity: 3 },
    counterforge: { mechanicId: 'counter-posture', phaseStates: ['dash-counter', 'delayed-counter', 'posture-burst'], hazard: 'counter-ring', cadence: 0.62, intensity: 3 },
    'carrier-cathedral': { mechanicId: 'section-traverse', phaseStates: ['outer-deck', 'engine-nave', 'heart-vault'], hazard: 'door-traverse', cadence: 0.88, intensity: 3 },
    'twin-governors': { mechanicId: 'governor-transfer', phaseStates: ['shield-transfer', 'power-transfer', 'mutual-impact'], hazard: 'dual-crossfire', cadence: 0.68, intensity: 2 },
    'loadout-reactor': { mechanicId: 'build-response', phaseStates: ['loadout-read', 'single-adaptation', 'counter-window'], hazard: 'build-counter', cadence: 0.76, intensity: 2 },
    'orbital-famine': { mechanicId: 'reserve-economy', phaseStates: ['reserve-drain', 'risky-recharge', 'solar-window'], hazard: 'energy-tax', cadence: 0.84, intensity: 3 },
    'logic-crucible': { mechanicId: 'boolean-sequence', phaseStates: ['entry-clause', 'logic-pair', 'moving-proof'], hazard: 'sequence-reset', cadence: 0.72, intensity: 4 },
    'vector-vault': { mechanicId: 'vector-preview', phaseStates: ['incident-vector', 'compound-deflection', 'inverse-path'], hazard: 'wall-ricochet', cadence: 0.60, intensity: 3 },
    'skyborne-battery': { mechanicId: 'torpedo-return', phaseStates: ['mobile-fire', 'captive-torpedo', 'assisted-volley'], hazard: 'aerial-lock', cadence: 0.64, intensity: 3 },
    'endurance-engine': { mechanicId: 'six-round-gauntlet', phaseStates: ['rounds-one-two', 'rounds-three-four', 'rounds-five-six'], hazard: 'round-combination', cadence: 0.70, intensity: 6 },
    'adaptive-archivist': { mechanicId: 'expiring-adaptation', phaseStates: ['observe-page', 'adaptive-margin', 'contested-archive'], hazard: 'adaptive-response', cadence: 0.74, intensity: 3 },
    'null-crown': { mechanicId: 'distributed-authority', phaseStates: ['reflected-authority', 'ownerless-modules', 'zero-throne-break'], hazard: 'crown-synthesis', cadence: 0.58, intensity: 4 }
  });

  function makeParts(source) {
    const weak = source.weakPoint || { x: 0, y: -8, r: 32, part: 'core' };
    const parts = [
      { id: 'chassis', parent: null, drawOrder: 10, anchor: { x: 0, y: 0 }, pivot: { x: 0.5, y: 0.5 }, hitbox: { x: 0, y: 0, r: Math.max(56, (source.hitbox?.w || 196) * 0.34) }, hp: null, role: 'armor', appearsInPhase: 1 },
      { id: weak.part || 'core', parent: 'chassis', drawOrder: 30, anchor: { x: weak.x, y: weak.y }, pivot: { x: 0.5, y: 0.5 }, hitbox: { x: weak.x, y: weak.y, r: weak.r }, hp: null, role: 'weak-point', appearsInPhase: 1 }
    ];
    const count = Math.max(0, source.partCount || 0);
    for (let index = 0; index < count; index++) {
      const angle = -Math.PI * 0.82 + (count === 1 ? 0 : index / (count - 1)) * Math.PI * 1.64;
      parts.push({
        id: (source.partRole || 'module') + '-' + (index + 1),
        parent: 'chassis',
        drawOrder: 20,
        anchor: { x: Math.round(Math.cos(angle) * 94), y: Math.round(Math.sin(angle) * 64) },
        pivot: { x: 0.5, y: 0.5 },
        hitbox: { x: Math.round(Math.cos(angle) * 94), y: Math.round(Math.sin(angle) * 64), r: 24 },
        hp: 18 + (source.wave || 0) * 3,
        role: source.partRole || 'module',
        appearsInPhase: 1
      });
    }
    return parts;
  }

  function phaseContract(source, index) {
    const number = index + 1;
    const family = source.phaseFamilies?.[index] || source.family;
    const baseTarget = family === 'modules'
      ? Math.max(2, source.partCount || 3)
      : family === 'puzzle-endgame'
        ? 3 + index
        : ['reflect', 'posture-duo'].includes(family)
          ? 1 + number
          : 1;
    const signature = SIGNATURE_PROFILES[source.id];
    return {
      id: source.id + '-phase-' + number,
      number,
      family,
      healthFloor: number === 1 ? 2 / 3 : number === 2 ? 1 / 3 : 0,
      patterns: [source.patterns[index]],
      telegraphSeconds: Math.max(0.68, 1.02 - index * 0.12),
      activeSeconds: 2.1 + index * 0.28,
      recoverySeconds: Math.max(0.52, 0.72 - index * 0.08),
      vulnerabilitySeconds: Math.max(1.9, 2.65 - index * 0.25),
      mechanicTarget: baseTarget,
      mechanicId: signature?.mechanicId || null,
      signatureState: signature?.phaseStates?.[index] || null,
      signatureHazard: signature?.hazard || null,
      signatureCadence: signature ? Math.max(0.42, signature.cadence - index * 0.04) : null,
      signatureIntensity: signature ? signature.intensity + index : null
    };
  }

  function commonEntry(source, engine) {
    const family = engine === 'legacy' ? 'legacy' : source.family;
    const weakPoint = source.weakPoint || { x: 0, y: -8, r: 32, part: 'core' };
    const phases = engine === 'legacy'
      ? source.patterns.map((patterns, index) => ({
        id: source.id + '-phase-' + (index + 1),
        number: index + 1,
        family: 'legacy',
        healthFloor: index === 0 ? 2 / 3 : index === 1 ? 1 / 3 : 0,
        patterns
      }))
      : [0, 1, 2].map(index => phaseContract(source, index));
    const mechanics = PATTERN_FAMILIES[family];
    const authoredMastery = engine === 'expanded'
      ? root.GEARSTORM_EXPANSION_STORY?.getMasteryContracts?.(source.id)
      : null;
    return {
      id: source.id,
      name: source.name,
      workName: source.name,
      status: engine === 'legacy' ? 'present' : 'forge-playable',
      productionStatus: engine === 'legacy' ? 'present' : 'playable',
      engine,
      wave: source.wave || 0,
      order: source.order || LEGACY_IDS.indexOf(source.id) + 1,
      family,
      phaseFamilies: source.phaseFamilies || [family, family, family],
      signature: engine === 'expanded' ? SIGNATURE_PROFILES[source.id] : null,
      color: source.color,
      accent: source.accent,
      hp: source.hp,
      difficulty: { casual: 0.86, standard: 1, overdrive: 1.18 },
      parTime: source.parTime,
      scoreRules: { basePerDamage: 25, noHitBonus: 2500, mechanicBonus: 400 },
      arena: source.arena,
      arenaController: {
        type: source.arenaType || (engine === 'legacy' ? 'legacy' : 'flat'),
        logicalWidth: 1280,
        logicalHeight: 720,
        safeFloorRatio: source.id === 'ground-eater' ? 0.35 : 1,
        resetOnRetry: true
      },
      quote: source.quote || ('« Profil Forge ' + String(source.order).padStart(2, '0') + ' chargé. Résous sa boucle, Spark. »'),
      description: source.description || mechanics?.loop || 'Machine expérimentale de la Forge.',
      transmission: source.transmission || ('Simulation Forge terminée : ' + source.name + ' a validé sa boucle de combat.'),
      fairnessRule: source.rule || 'Les ouvertures et dangers restent télégraphiés.',
      hitbox: source.hitbox || { w: 196, h: 168 },
      weakPoint,
      parts: makeParts(source),
      phases,
      transitionRules: { healthFractions: [2 / 3, 1 / 3], clearProjectiles: true, lockAttacks: true },
      artPack: {
        status: 'generated',
        bundleId: source.id,
        layout: engine === 'legacy' ? 'multipart-9' : 'multipart-4',
        proceduralFallback: true
      },
      arenaPack: {
        status: 'generated',
        bundleId: source.id,
        layout: engine === 'legacy' ? 'parallax-4' : 'backdrop',
        proceduralFallback: true
      },
      telegraphs: {
        visual: mechanics?.telegraph || 'Télégraphe historique propre à la machine.',
        audio: true,
        shapeRedundant: true,
        minimumSeconds: engine === 'legacy' ? 0.58 : 0.68
      },
      accessibility: {
        colorIndependent: true,
        reducedMotion: true,
        highContrast: true,
        casualWindowMultiplier: 1.25
      },
      masteryContracts: authoredMastery?.length === 3
        ? authoredMastery.map(contract => ({ ...contract }))
        : [
          { id: source.id + '-forge-time', title: 'Cadence Forge', objective: 'Terminer sous le temps de référence.', metric: 'timeSeconds', target: source.parTime },
          { id: source.id + '-forge-integrity', title: 'Intégrité du pilote', objective: 'Subir au plus deux impacts.', metric: 'damageTaken', target: 2 },
          { id: source.id + '-forge-mechanic', title: 'Règle maîtrisée', objective: 'Résoudre trois cycles mécaniques.', metric: 'mechanicCycles', target: 3 }
        ],
      reward: engine === 'legacy' ? { type: 'campaign', id: source.id + '-district' } : { type: 'forge-record', id: source.id + '-verified' },
      codex: {
        title: source.name,
        summary: source.description || mechanics?.loop,
        releaseEligible: true
      },
      narrative: {
        campaignEligible: engine === 'legacy',
        secret: source.secret === true,
        links: engine === 'legacy' ? ['story-act-' + (source.order || LEGACY_IDS.indexOf(source.id) + 1)] : []
      },
      practice: {
        enabled: true,
        checkpoints: source.checkpoints || ['phase-1', 'phase-2', 'phase-3']
      }
    };
  }

  const ROSTER = deepFreeze([
    ...LEGACY_SOURCE.map(source => commonEntry(source, 'legacy')),
    ...EXPANSION_SOURCE.map(source => commonEntry(source, 'expanded'))
  ]);
  const BY_ID = new Map(ROSTER.map(entry => [entry.id, entry]));

  function list(filters = {}) {
    const status = filters.status;
    const engine = filters.engine;
    const family = filters.family;
    const wave = Number.isFinite(filters.wave) ? Number(filters.wave) : null;
    return Object.freeze(ROSTER.filter(entry => (
      (!status || entry.status === status || entry.productionStatus === status)
      && (!engine || entry.engine === engine)
      && (!family || entry.family === family || entry.phaseFamilies.includes(family))
      && (wave === null || entry.wave === wave)
    )));
  }

  function get(id) {
    return BY_ID.get(String(id || '').toLowerCase()) || null;
  }

  function getPhase(id, phase = 1) {
    const entry = get(id);
    if (!entry) return null;
    const index = Math.max(0, Math.min(2, Math.floor(Number(phase) || 1) - 1));
    return entry.phases[index];
  }

  function hashSeed(value) {
    const text = String(value);
    let hash = 2166136261;
    for (let index = 0; index < text.length; index++) {
      hash ^= text.charCodeAt(index);
      hash = Math.imul(hash, 16777619);
    }
    return hash >>> 0;
  }

  function createRng(seed = 1) {
    let state = (Number(seed) >>> 0) || 0x9e3779b9;
    return () => {
      state ^= state << 13;
      state ^= state >>> 17;
      state ^= state << 5;
      return (state >>> 0) / 4294967296;
    };
  }

  function createRuntime(id, options = {}) {
    const entry = get(id);
    if (!entry) throw new RangeError('Boss GEARSTORM inconnu : ' + id);
    const phase = Math.max(1, Math.min(3, Math.floor(Number(options.phase) || 1)));
    const seed = Number.isFinite(options.seed) ? Number(options.seed) : hashSeed(entry.id + ':' + (options.attempt || 0));
    return {
      id: entry.id,
      phase,
      family: getPhase(entry.id, phase).family,
      seed,
      rng: createRng(seed),
      mechanicProgress: 0,
      mechanicTarget: getPhase(entry.id, phase).mechanicTarget || 1,
      mechanicComplete: false,
      selectedPattern: getPhase(entry.id, phase).patterns[0],
      mechanicId: getPhase(entry.id, phase).mechanicId || null,
      signatureState: getPhase(entry.id, phase).signatureState || null,
      signatureHazard: getPhase(entry.id, phase).signatureHazard || null,
      signatureCadence: getPhase(entry.id, phase).signatureCadence || 0.8,
      signatureIntensity: getPhase(entry.id, phase).signatureIntensity || 1,
      signatureCycle: 0,
      signatureCounters: Object.create(null),
      inputTelemetry: { shot: 0, jump: 0, dash: 0 },
      adaptation: null,
      safeLane: 1,
      dangerLanes: [],
      posture: getPhase(entry.id, phase).mechanicTarget || 1,
      environment: 'stable',
      resource: 100,
      round: Math.max(1, Math.floor(Number(options.checkpoint) || 1)),
      puzzleIndex: 0,
      puzzleSequence: [],
      puzzleNodes: [],
      parts: entry.parts.map(part => ({
        ...part,
        anchor: { ...part.anchor },
        pivot: { ...part.pivot },
        hitbox: part.hitbox ? { ...part.hitbox } : null,
        maxHp: part.hp,
        hp: part.hp,
        state: 'intact',
        destroyed: false
      }))
    };
  }

  function validate(entries = ROSTER) {
    const errors = [];
    const ids = new Set();
    const mechanicIds = new Set();
    const signatureStates = new Set();
    entries.forEach((entry, index) => {
      if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(entry.id)) errors.push('id invalide: ' + entry.id);
      if (ids.has(entry.id)) errors.push('id dupliqué: ' + entry.id);
      ids.add(entry.id);
      if (entry.order !== index + 1) errors.push('ordre incohérent: ' + entry.id);
      if (!entry.name || !entry.arena || !entry.description) errors.push('contenu incomplet: ' + entry.id);
      if (!Number.isFinite(entry.hp) || entry.hp <= 0 || !Number.isFinite(entry.parTime)) errors.push('équilibrage invalide: ' + entry.id);
      if (!Array.isArray(entry.parts) || !entry.parts.some(part => part.role === 'weak-point' && part.hitbox)) errors.push('weak-point manquant: ' + entry.id);
      if (!Array.isArray(entry.phases) || entry.phases.length !== 3) errors.push('trois phases requises: ' + entry.id);
      if (entry.engine === 'expanded' && !entry.phaseFamilies.every(family => PATTERN_FAMILIES[family])) errors.push('famille inconnue: ' + entry.id);
      if (entry.engine === 'expanded' && (!entry.artPack.proceduralFallback || entry.artPack.status !== 'generated' || entry.artPack.bundleId !== entry.id || entry.artPack.layout !== 'multipart-4')) errors.push('pack visuel expansion invalide: ' + entry.id);
      if (entry.engine === 'expanded' && (!entry.arenaPack.proceduralFallback || entry.arenaPack.status !== 'generated' || entry.arenaPack.bundleId !== entry.id || entry.arenaPack.layout !== 'backdrop')) errors.push('pack arene expansion invalide: ' + entry.id);
      if (entry.engine === 'expanded' && entry.productionStatus === 'planned') errors.push('boss expansion encore planifie: ' + entry.id);
      if (entry.engine === 'expanded' && entry.codex.releaseEligible !== true) errors.push('codex expansion non publiable: ' + entry.id);
      if (entry.engine === 'expanded' && entry.masteryContracts.length !== 3) errors.push('trois contrats Forge requis: ' + entry.id);
      if (entry.engine === 'expanded') {
        if (!entry.signature?.mechanicId || entry.signature.phaseStates?.length !== 3) errors.push('signature gameplay incomplète: ' + entry.id);
        if (mechanicIds.has(entry.signature?.mechanicId)) errors.push('signature gameplay dupliquée: ' + entry.signature?.mechanicId);
        mechanicIds.add(entry.signature?.mechanicId);
        for (const state of entry.signature?.phaseStates || []) {
          if (signatureStates.has(state)) errors.push('état signature dupliqué: ' + state);
          signatureStates.add(state);
        }
      }
    });
    LEGACY_IDS.forEach((id, index) => {
      if (entries[index]?.id !== id) errors.push('compatibilité historique rompue: ' + id);
    });
    if (entries.length !== 30) errors.push('le registre doit contenir 30 boss');
    const expandedFamilies = new Set(entries.filter(entry => entry.engine === 'expanded').flatMap(entry => entry.phaseFamilies));
    if (expandedFamilies.size < 8) errors.push('huit familles de patterns requises');
    return deepFreeze({
      valid: errors.length === 0,
      errors,
      stats: {
        total: entries.length,
        legacy: entries.filter(entry => entry.engine === 'legacy').length,
        expanded: entries.filter(entry => entry.engine === 'expanded').length,
        families: expandedFamilies.size,
        signatures: mechanicIds.size,
        signatureStates: signatureStates.size
      }
    });
  }

  function resolveLaunchMode(value) {
    const mode = String(value || '').toLowerCase();
    if (mode === 'expanded') return 'forge';
    if (['forgerush', 'forge-rush', 'circuit-forge'].includes(mode)) return 'forgeRush';
    return ['rush', 'practice', 'forge'].includes(mode) ? mode : null;
  }

  function installDomHooks(options = {}) {
    const domRoot = options.root || root.document;
    if (!domRoot?.querySelectorAll) return Object.freeze({ count: 0, destroy() {} });
    const controller = new AbortController();
    let count = 0;
    domRoot.querySelectorAll('[data-gearstorm-mode], [data-boss-mode]').forEach(element => {
      element.addEventListener('click', event => {
        const mode = resolveLaunchMode(event.currentTarget.dataset.gearstormMode || event.currentTarget.dataset.bossMode);
        if (mode) options.onMode?.(mode, event.currentTarget);
      }, { signal: controller.signal });
      count += 1;
    });
    domRoot.querySelectorAll('[data-gearstorm-boss], [data-boss-launch]').forEach(element => {
      element.addEventListener('click', event => {
        const id = event.currentTarget.dataset.gearstormBoss || event.currentTarget.dataset.bossLaunch;
        const entry = get(id);
        if (!entry) return;
        const phase = Math.max(1, Math.min(3, Math.floor(Number(event.currentTarget.dataset.bossPhase) || 1)));
        const checkpoint = Math.max(1, Math.floor(Number(event.currentTarget.dataset.bossCheckpoint) || 1));
        options.onSelect?.(entry, { phase, checkpoint }, event.currentTarget);
      }, { signal: controller.signal });
      count += 1;
    });
    return Object.freeze({ count, destroy: () => controller.abort() });
  }

  const validation = validate();
  if (!validation.valid) throw new Error('Registre GEARSTORM invalide : ' + validation.errors.join(' | '));

  const api = deepFreeze({
    apiVersion: API_VERSION,
    schemaVersion: SCHEMA_VERSION,
    stateSequence: COMMON_STATE_SEQUENCE,
    families: PATTERN_FAMILIES,
    signatures: SIGNATURE_PROFILES,
    legacyIds: LEGACY_IDS,
    plannedIds: Object.freeze(EXPANSION_SOURCE.map(entry => entry.id)),
    all: ROSTER,
    list,
    get,
    has: id => BY_ID.has(String(id || '').toLowerCase()),
    indexOf: id => ROSTER.findIndex(entry => entry.id === String(id || '').toLowerCase()),
    campaign: () => Object.freeze(ROSTER.filter(entry => entry.engine === 'legacy')),
    expanded: () => Object.freeze(ROSTER.filter(entry => entry.engine === 'expanded')),
    getPhase,
    createRng,
    seedFor: (id, salt = 0) => hashSeed(String(id) + ':' + String(salt)),
    createRuntime,
    validate,
    resolveLaunchMode,
    installDomHooks
  });

  const existing = root.GEARSTORM_BOSS_ROSTER;
  if (!existing || existing.apiVersion !== API_VERSION) {
    Object.defineProperty(root, 'GEARSTORM_BOSS_ROSTER', {
      value: api,
      configurable: true,
      enumerable: true,
      writable: false
    });
  }
  if (typeof module === 'object' && module?.exports) module.exports = api;
})();
