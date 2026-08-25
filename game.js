(() => {
  'use strict';

  const canvas = document.getElementById('game');
  const ctx = canvas.getContext('2d');
  const W = 1280;
  const H = 720;
  const GROUND = 620;
  const TAU = Math.PI * 2;
  const STORY = globalThis.GEARSTORM_STORY;
  if (!STORY || !Array.isArray(STORY.acts) || STORY.acts.length !== 6) throw new Error('Registre narratif GEARSTORM indisponible.');
  const EXPANSION_STORY = globalThis.GEARSTORM_EXPANSION_STORY || null;
  const MASTERY_CONTRACT_IDS = new Set(Object.values(STORY.masteryContracts).flat().map(contract => contract.id));
  const STORY_SCENE_IDS = new Set([STORY.intro.id, STORY.prologue.id, ...STORY.acts.map(act => act.id), STORY.epilogue.id]);

  const LEGACY_BOSSES = [
    {
      id: 'rammer',
      name: 'RIVET REX',
      epithet: 'Le bélier mono-roue à marteaux variables',
      color: '#ff8b42',
      accent: '#fff0a6',
      hp: 120,
      arena: 'Rocade des Rivets',
      quote: '« Riva Spark ! J’ai donné deux marteaux à la Rocade et retiré tous ses freins. Appelle cela une entrée en scène. »',
      description: 'Charges, marteaux, mines et impacts sismiques.',
      transmission: 'Nara Vey confirme le retour des convois : le premier verrou du Circuit vient de céder.'
    },
    {
      id: 'kraken',
      name: 'SKY SLICER',
      epithet: 'Le rapace bombardier à géométrie variable',
      color: '#2bc9e8',
      accent: '#b7fbff',
      hp: 145,
      arena: 'Couloir des Hautes-Tensions',
      quote: '« Le ciel n’est plus une route, Spark. C’est mon plafond, et chaque éclair y signe mon nom. »',
      description: 'Salves ioniques, lignes de foudre et condensateur exposé.',
      transmission: 'Le brouillage aérien est tombé. Nara relie de nouveau les voix des districts du nord.'
    },
    {
      id: 'drill',
      name: 'MAGNETRON',
      epithet: 'L’araignée magnétique qui replie l’arène',
      color: '#b777ff',
      accent: '#f2dcff',
      hp: 160,
      arena: 'Fosse Ferromagnétique',
      quote: '« La Fosse ramène chacun à la place que je lui ai écrite. Même le métal connaît son rôle. »',
      description: 'Inversions de polarité, éruptions et débris magnétiques.',
      transmission: 'Les rails d’évacuation sont libérés. Les habitants quittent les gradins forcés et reprennent les trains.'
    },
    {
      id: 'mantis',
      name: 'CHRONO MANTIS',
      epithet: 'La mante temporelle aux lames déphasées',
      color: '#ff4f7b',
      accent: '#ffd0dc',
      hp: 175,
      arena: 'Horloge de la Faille',
      quote: '« Je corrige l’heure, l’archive et le moment où tu croyais gagner. Qui contestera un instant que j’ai effacé ? »',
      description: 'Ruées, téléportations, engrenages et ralentissements.',
      transmission: 'Les horloges redémarrent et six copies de l’archive circulent. Voltério ne peut plus retirer une seconde du récit.'
    },
    {
      id: 'cyclotron',
      name: 'FOUNDRY TITAN',
      epithet: 'Le colosse-fonderie qui remodèle le sol',
      color: '#ffb12e',
      accent: '#fff0b7',
      hp: 205,
      arena: 'Fournaise des Pistons',
      quote: '« Tout ce que la ville fabrique finit dans ma Fournaise. Ta révolte en sortira frappée à mon nom. »',
      description: 'Pistons, lave, flammes et pluie de métal en fusion.',
      transmission: 'La Fournaise refroidit. Cinq districts détiennent désormais chacun un fragment de la contre-phase M-0.'
    },
    {
      id: 'omega',
      name: 'CROWN ENGINE Ω',
      epithet: 'La forteresse finale aux trois formes',
      color: '#8f78ff',
      accent: '#fff4ad',
      hp: 280,
      arena: 'Citadelle Voltério',
      quote: '« Tes réponses, mes machines, un seul trône : tu as répété exactement la conclusion que j’avais écrite. »',
      description: 'Trois formes mêlant roquettes, grilles laser, débris magnétiques, chrono-pièges et mines.',
      transmission: 'Les six équipes révoquent ensemble la Couronne provisoire. Le Circuit appartient de nouveau à ceux qui y vivent.'
    }
  ];
  const BOSS_REGISTRY = globalThis.GEARSTORM_BOSS_ROSTER || null;
  const BOSSES = BOSS_REGISTRY?.list?.() || LEGACY_BOSSES;
  const CAMPAIGN_BOSSES = BOSS_REGISTRY?.campaign?.() || LEGACY_BOSSES;
  const EXPANDED_BOSSES = BOSS_REGISTRY?.expanded?.() || [];
  const FORGE_START_INDEX = CAMPAIGN_BOSSES.length;
  const FORGE_FINAL_INDEX = BOSSES.length - 1;
  function bossCatalogueNumber(index) {
    const prefix = index < FORGE_START_INDEX ? 'MACHINE ' : 'FORGE ';
    return prefix + String(index + 1).padStart(2, '0');
  }
  const LEGACY_BOSS_IDS = new Set(BOSS_REGISTRY?.legacyIds || LEGACY_BOSSES.map(entry => entry.id));
  const LEGACY_CARD_ART_PARTS = Object.freeze({
    rammer: 'chassis',
    kraken: 'fuselage',
    drill: 'carapace',
    mantis: 'torso',
    cyclotron: 'furnace-torso',
    omega: 'crown-hull'
  });

  const DIFFICULTIES = {
    casual: { enemySpeed: 0.82, bossHealth: 0.86, playerHealth: 8, scoreMultiplier: 0.82, parMultiplier: 1.18, name: 'Pilote' },
    standard: { enemySpeed: 1, bossHealth: 1, playerHealth: 6, scoreMultiplier: 1, parMultiplier: 1, name: 'Ingénieur' },
    overdrive: { enemySpeed: 1.18, bossHealth: 1.18, playerHealth: 5, scoreMultiplier: 1.32, parMultiplier: 0.9, name: 'Overdrive' }
  };
  const RUSH_RETRY_PENALTY = 12;
  const RUSH_RETRY_SCORE_PENALTY = 750;

  const SAVE_KEY = 'gearstorm_boss_circuit_save_v5';
  const PREVIOUS_SAVE_KEY = 'gearstorm_boss_circuit_save_v4';
  const OLDER_SAVE_KEY = 'gearstorm_boss_circuit_save_v3';
  const V2_SAVE_KEY = 'gearstorm_boss_circuit_save_v2';
  const LEGACY_SAVE_KEY = 'geargrin_overdrive_save';
  const RANK_VALUES = Object.freeze({ C: 1, B: 2, A: 3, S: 4 });
  const QA_ALLOWED = new URLSearchParams(location.search).get('qa') === '1' && ['127.0.0.1', 'localhost'].includes(location.hostname);
  const requestedModeValue = new URLSearchParams(location.search).get('mode');
  const requestedLaunchMode = BOSS_REGISTRY?.resolveLaunchMode?.(requestedModeValue)
    || (['rush', 'practice'].includes(requestedModeValue) ? requestedModeValue : null);
  const UPGRADES = [
    { id: 'rapid', maxStacks: 3, icon: 'electric-arcs', name: 'Cadence polarisée', description: 'Réduit de 22 % le délai entre deux tirs.', apply: build => { build.fireRate *= 0.78; } },
    { id: 'core', maxStacks: 2, icon: 'explosion-core', name: 'Noyau auxiliaire', description: 'Ajoute deux points de vie au prochain châssis.', apply: build => { build.maxHpBonus += 2; } },
    { id: 'dash', maxStacks: 3, icon: 'dash-shockwave', name: 'Ruée vectorielle', description: 'Réduit le délai de ruée et augmente son impact.', apply: build => { build.dashCooldown *= 0.78; build.dashDamage += 4; } },
    { id: 'split', maxStacks: 1, icon: 'muzzle-cyan', name: 'Canon bifurqué', description: 'Ajoute deux impulsions obliques à chaque salve.', apply: build => { build.multishot = Math.min(3, build.multishot + 2); } },
    { id: 'amplifier', maxStacks: 3, icon: 'impact-metal', name: 'Amplificateur de noyau', description: 'Augmente les dégâts des tirs de 25 %.', apply: build => { build.shotDamage *= 1.25; } },
    { id: 'overload', maxStacks: 3, icon: 'overload-bloom', name: 'Condensateur Overdrive', description: 'Charge plus vite et prolonge la surcharge.', apply: build => { build.overloadGain *= 1.35; build.overloadDuration += 1.1; } },
    { id: 'aegis', maxStacks: 2, icon: 'shield-hit', name: 'Égide capacitive', description: 'Absorbe gratuitement un impact par niveau et par machine.', apply: build => { build.shieldCharges += 1; } },
    { id: 'thrusters', maxStacks: 2, icon: 'magnetic-spark', name: 'Propulseurs synchrones', description: 'Améliore accélération, vitesse maximale et impulsion de saut.', apply: build => { build.moveAccel *= 1.12; build.maxSpeed += 38; build.jumpPower += 50; } },
    { id: 'precision', maxStacks: 2, icon: 'warning-pulse', name: 'Séquence de précision', description: 'Chaque cinquième puis quatrième impact de noyau inflige une surtension.', apply: build => { build.precisionEvery = build.precisionEvery ? Math.max(4, build.precisionEvery - 1) : 5; build.precisionBonus += 0.45; } },
    { id: 'feedback', maxStacks: 2, icon: 'chrono-fracture', name: 'Boucle de feedback', description: 'Prolonge le combo et accélère légèrement la charge Overdrive.', apply: build => { build.comboWindow += 0.5; build.overloadGain *= 1.1; } },
    { id: 'salvage', maxStacks: 2, icon: 'scrap-glow', name: 'Auto-réparation de phase', description: 'Restaure un noyau de Riva à chaque transformation ennemie.', apply: build => { build.phaseRepair += 1; } }
  ];

  function createRunBuild() {
    return {
      maxHpBonus: 0,
      shotDamage: 6,
      fireRate: 0.17,
      dashDamage: 14,
      dashCooldown: 0.9,
      multishot: 1,
      overloadGain: 1,
      overloadDuration: 4.2,
      moveAccel: 2350,
      maxSpeed: 390,
      jumpPower: 720,
      projectileSpeed: 920,
      shieldCharges: 0,
      precisionEvery: 0,
      precisionBonus: 0,
      comboWindow: 2.15,
      phaseRepair: 0,
      installed: []
    };
  }

  const DEFAULT_SAVE = {
    version: 5,
    unlocked: 1,
    bestTimes: {},
    bestRanks: {},
    bestRush: null,
    completed: false,
    bestForgeRush: null,
    forgeCompleted: false,
    forgeCleared: [],
    campaignCleared: [],
    storySeen: [],
    mastery: {},
    codexUnlocked: [],
    rushSnapshot: null,
    forgeRushSnapshot: null,
    settings: {
      difficulty: 'standard',
      audio: true,
      volume: 0.78,
      shake: true,
      reduceMotion: false,
      highContrast: false,
      combatHints: true
    }
  };

  let save = loadSave();
  let state = 'menu';
  let runMode = 'rush';
  let selectionMode = ['forge', 'forgeRush'].includes(requestedLaunchMode) ? 'forge' : 'practice';
  let selectedPracticePhase = 1;
  let selectedPracticeCheckpoint = 1;
  let currentBossIndex = 0;
  let currentBossStart = 0;
  let rushStart = 0;
  let rushElapsedBeforeBoss = 0;
  let lastBossTime = 0;
  let score = 0;
  let damageTaken = 0;
  let lastTime = performance.now();
  let timeScale = 1;
  let transitionTimer = 0;
  let toastTimer = 0;
  let introTimer = 0;
  let screenShake = 0;
  let flash = 0;
  let audioContext = null;
  let musicBeat = 0;
  let musicStep = 0;
  let currentBossElapsed = 0;
  let scoreAtBossStart = 0;
  let runBuild = createRunBuild();
  let fightClockStartedAt = 0;
  let fightClockAccumulated = 0;
  let fightClockRunning = false;
  let rushRetryPenalty = 0;
  let runRetryCount = 0;
  let currentBossRetries = 0;
  let lastBossRetryPenalty = 0;
  let combo = 0;
  let comboTimer = 0;
  let maxCombo = 0;
  let lastUpgradeOffer = [];
  let rigDebug = false;
  let pendingStoryAction = null;
  let currentStoryKey = null;
  let commsTimer = 0;
  let currentBossFinishSource = null;
  let currentBossOverloadFinish = false;
  let currentBossOverloadOpening = false;
  let currentBossHazardHits = Object.create(null);
  let currentBossPerfectCycles = Object.create(null);
  let currentBossCycleState = Object.create(null);
  let currentForgeTelemetry = createForgeTelemetry();

  const keys = Object.create(null);
  const pressed = new Set();
  const touch = { left: false, right: false, jump: false, dash: false, attack: false, overload: false };
  const touchPressed = new Set();
  const pointer = { attack: false };
  const controller = {
    left: false, right: false, attack: false,
    jumpPressed: false, dashPressed: false, overloadPressed: false, pausePressed: false,
    menuUpPressed: false, menuDownPressed: false, menuLeftPressed: false, menuRightPressed: false,
    confirmPressed: false, cancelPressed: false
  };
  let lastGamepadButtons = [];
  let lastGamepadAxes = [0, 0];

  let player = null;
  let boss = null;
  let playerShots = [];
  let enemyShots = [];
  let particles = [];
  let floatingTexts = [];
  let ambient = [];

  const screens = [...document.querySelectorAll('.screen')];
  const screenOpeners = new Map();
  const touchControls = document.getElementById('touch-controls');
  const bossIntro = document.getElementById('boss-intro');
  const toast = document.getElementById('toast');
  const announcer = document.querySelector('#game-status, #game-announcer, #sr-announcer, [data-game-announcer]');
  const volumeControl = document.querySelector('#master-volume, #volume-control, #volume-slider');
  const volumeOutput = document.querySelector('#master-volume-value');
  const mobilePlayerHp = document.querySelector('#mobile-player-hp');
  const mobileBossHp = document.querySelector('#mobile-boss-hp');
  const mobileOverload = document.querySelector('#mobile-overload');
  const combatObjective = document.querySelector('#combat-objective');
  const combatHint = document.querySelector('#combat-hint');
  const combatMechanic = document.querySelector('#combat-mechanic');
  const pauseBuild = document.querySelector('#pause-build');
  const resultLore = document.querySelector('#result-lore');
  const resultLoreLabel = document.querySelector('#result-lore-label');
  const resultMastery = document.querySelector('#result-mastery');
  const radioComms = document.querySelector('#radio-comms');
  const radioSpeaker = document.querySelector('#radio-speaker');
  const radioLine = document.querySelector('#radio-line');
  const storyContinue = document.querySelector('#story-continue');
  const storyBack = document.querySelector('#story-back');
  const storyArchive = document.querySelector('#story-archive');
  const storyArchiveProgress = document.querySelector('#story-archive-progress');


  const ART_MANIFEST_URL = 'assets/generated/v2.10.0/asset-manifest.json';
  const artLoader = document.querySelector('#art-loader');
  const artLoaderLabel = document.querySelector('#art-loader-label');
  const artLoaderProgress = document.querySelector('#art-loader-progress');
  const artRuntime = {
    manifest: null,
    manifestReady: false,
    ready: false,
    activeBossId: 'rammer',
    images: new Map(),
    pending: new Map(),
    failed: new Set(),
    requested: new Set(),
    currentAssets: new Set(),
    bundlePromises: new Map(),
    bossBundleOrder: [],
    effects: [],
    parallaxTime: 0,
    initialPromise: null
  };
  const MAX_CACHED_BOSS_BUNDLES = 3;

  const RIVA_RENDER_SCALE = 1.10;
  const RIVA_FOOT_OFFSET = 3.6;
  const RIVA_ROAD_LIFT = 10;
  const RIVA_CANNON_RECOIL = 12;
  // Fallback mesure sur l'axe coude -> emetteur de l'asset OpenAI. Le runtime
  // recalcule cette valeur depuis le manifest pour rester juste si l'art evolue.
  const RIVA_CANNON_BASE_ROTATION = -2.1573086184800845;
  const RIVA_CANNON_PART = 'forearm-cannon-near';
  const RIVA_MUZZLE = Object.freeze({ x: 45, y: -8 });
  const HERO_EFFECT_PARTS = Object.freeze(new Set(['dash-trail', 'overload-halo']));
  const HERO_RIG_BUFFER_SIZE = 512;
  const heroRigCanvas = document.createElement('canvas');
  heroRigCanvas.width = heroRigCanvas.height = HERO_RIG_BUFFER_SIZE;
  const heroRigContext = heroRigCanvas.getContext('2d');
  const BOSS_WEAK_POINTS = Object.freeze({
    rammer: Object.freeze({ x: 20, y: -42, r: 30, part: 'core' }),
    kraken: Object.freeze({ x: 0, y: 5, r: 34, part: 'core' }),
    drill: Object.freeze({ x: 0, y: -56, r: 31, part: 'core' }),
    mantis: Object.freeze({ x: 0, y: -5, r: 31, part: 'core' }),
    cyclotron: Object.freeze({ x: 0, y: -12, r: 34, part: 'molten-core' }),
    omega: Object.freeze({ x: 0, y: 8, r: 39, part: 'omega-core' })
  });

  function rigPart(name, phase, joint, pivot, scale, bbox, motion = 'static', sourceRect = null) {
    return Object.freeze({
      name,
      phase,
      joint: Object.freeze(joint),
      pivot: Object.freeze(pivot),
      scale,
      bbox: Object.freeze(bbox),
      motion,
      sourceRect: sourceRect ? Object.freeze(sourceRect) : null
    });
  }

  const BOSS_RIGS = Object.freeze({
    rammer: Object.freeze({
      parts: Object.freeze([
        rigPart('wheel', 1, [38, 58], [226, 235], 0.27, [34, 47, 418, 418], 'spin'),
        rigPart('ram', 1, [-70, 25], [340, 275], 0.32, [2, 128, 376, 418], 'recoil'),
        rigPart('hammer-left', 1, [-40, -15], [330, 320], 0.2, [48, 0, 386, 355], 'limb-left'),
        rigPart('hammer-right', 1, [40, -15], [80, 320], 0.2, [16, 62, 416, 353], 'limb-right'),
        rigPart('chassis', 1, [0, 18], [195, 295], 0.44, [4, 172, 386, 418]),
        rigPart('rivet-pod', 2, [70, -4], [209, 240], 0.18, [47, 0, 371, 418], 'hover'),
        rigPart('mine-seismic', 2, [8, 58], [208, 186], 0.17, [36, 45, 381, 327], 'pulse'),
        rigPart('overdrive', 3, [0, 4], [178, 178], 0.37, [0, 0, 355, 357], 'pulse'),
        rigPart('core', 1, [20, -42], [225, 158], 0.13, [31, 0, 418, 315], 'core')
      ])
    }),
    kraken: Object.freeze({
      parts: Object.freeze([
        rigPart('tail-thruster', 1, [72, 12], [231, 212], 0.25, [48, 30, 414, 395], 'hover'),
        rigPart('wing-left', 1, [-38, 10], [218, 224], 0.28, [44, 29, 391, 418], 'limb-left'),
        rigPart('wing-right', 1, [38, 10], [188, 218], 0.28, [21, 25, 354, 412], 'limb-right'),
        rigPart('fuselage', 1, [0, 2], [217, 246], 0.48, [16, 152, 418, 341]),
        rigPart('cockpit', 1, [-28, -12], [209, 249], 0.22, [0, 151, 418, 346]),
        rigPart('ion-emitter', 2, [-46, 24], [215, 198], 0.17, [36, 0, 394, 395], 'pulse'),
        rigPart('bomb-pod', 2, [48, 30], [195, 196], 0.18, [39, 114, 351, 277], 'hover'),
        rigPart('laser-blades', 3, [-82, 0], [217, 191], 0.28, [16, 56, 418, 327], 'pulse'),
        rigPart('core', 1, [0, 5], [197, 201], 0.13, [0, 11, 393, 391], 'core')
      ])
    }),
    drill: Object.freeze({
      parts: Object.freeze([
        rigPart('legs-rear', 1, [0, 40], [195, 250], 0.34, [21, 82, 368, 418], 'legs'),
        rigPart('legs-front-left', 1, [-48, 43], [190, 105], 0.22, [0, 74, 364, 410], 'limb-left'),
        rigPart('legs-front-right', 1, [48, 43], [210, 95], 0.22, [42, 36, 389, 350], 'limb-right'),
        rigPart('carapace', 1, [0, 0], [231, 241], 0.38, [44, 105, 418, 377]),
        rigPart('cockpit', 1, [-38, -18], [174, 229], 0.22, [0, 88, 347, 370]),
        rigPart('magnetic-coil', 2, [52, 15], [157, 210], 0.18, [19, 7, 295, 418], 'pulse'),
        rigPart('polarity-claws', 2, [0, 40], [229, 152], 0.28, [46, 11, 411, 293], 'limb'),
        rigPart('scrap-ring', 3, [0, 0], [204, 152], 0.42, [46, 0, 361, 304], 'spin'),
        rigPart('core', 1, [0, -56], [166, 154], 0.16, [3, 0, 328, 308], 'core')
      ])
    }),
    mantis: Object.freeze({
      parts: Object.freeze([
        rigPart('legs-left', 1, [-28, 0], [180, 75], 0.29, [83, 31, 265, 391], 'limb-left'),
        rigPart('legs-right', 1, [28, 0], [135, 75], 0.29, [49, 32, 227, 391], 'limb-right'),
        rigPart('torso', 1, [0, 0], [210, 225], 0.3, [81, 56, 339, 395]),
        rigPart('scythe-left', 1, [-25, -25], [295, 130], 0.28, [38, 46, 381, 416], 'limb-left'),
        rigPart('scythe-right', 1, [25, -25], [100, 130], 0.28, [35, 25, 379, 418], 'limb-right'),
        rigPart('cockpit', 1, [0, -55], [200, 210], 0.2, [32, 36, 369, 383]),
        rigPart('time-emitter', 2, [20, -5], [350, 180], 0.22, [0, 57, 386, 308], 'pulse'),
        rigPart('chrono-halo', 3, [0, -10], [226, 182], 0.42, [35, 0, 418, 363], 'spin'),
        rigPart('core', 1, [0, -5], [196, 179], 0.14, [28, 29, 363, 329], 'core')
      ])
    }),
    cyclotron: Object.freeze({
      parts: Object.freeze([
        rigPart('leg-left', 1, [-42, 45], [240, 80], 0.26, [10, 21, 294, 385], 'limb-left'),
        rigPart('leg-right', 1, [42, 45], [150, 80], 0.26, [59, 22, 325, 386], 'limb-right'),
        rigPart('piston-left', 1, [-55, -5], [300, 110], 0.22, [10, 25, 365, 418], 'limb-left'),
        rigPart('piston-right', 1, [55, -5], [110, 100], 0.22, [79, 14, 378, 418], 'limb-right'),
        rigPart('furnace-torso', 1, [0, 0], [223, 213], 0.38, [49, 18, 397, 408]),
        rigPart('cockpit', 1, [0, -55], [204, 239], 0.18, [52, 116, 356, 362]),
        rigPart('stacks-hopper', 2, [45, -55], [202, 180], 0.23, [29, 0, 375, 363], 'hover'),
        rigPart('overarmor', 3, [0, 0], [186, 185], 0.42, [0, 14, 372, 356], 'pulse'),
        rigPart('molten-core', 1, [0, -12], [217, 184], 0.16, [15, 4, 418, 364], 'core')
      ])
    }),
    omega: Object.freeze({
      parts: Object.freeze([
        rigPart('stabilizers', 1, [0, 55], [243, 248], 0.34, [67, 130, 418, 365], 'hover'),
        rigPart('battery-left', 1, [-62, 12], [190, 244], 0.22, [0, 103, 379, 384], 'hover'),
        rigPart('battery-right', 1, [62, 12], [225, 203], 0.22, [31, 75, 418, 331], 'hover'),
        rigPart('crown-hull', 1, [0, 0], [230, 230], 0.38, [42, 51, 418, 408]),
        rigPart('throne-cockpit', 1, [0, -58], [209, 237], 0.2, [0, 60, 418, 413]),
        rigPart('blade-ring', 2, [0, 0], [179, 201], 0.38, [0, 25, 357, 377], 'spin'),
        rigPart('combined-arsenal', 2, [0, 10], [229, 173], 0.32, [39, 20, 418, 326], 'pulse'),
        rigPart('ruptured-armor', 3, [0, 0], [186, 160], 0.42, [8, 0, 363, 320], 'pulse'),
        rigPart('omega-core', 1, [0, 8], [213, 170], 0.16, [63, 0, 362, 339], 'core')
      ])
    })
  });

  function updateArtLoader() {
    const done = artRuntime.images.size + artRuntime.failed.size;
    const total = artRuntime.requested.size;
    if (artLoaderProgress) {
      if ('max' in artLoaderProgress) artLoaderProgress.max = Math.max(1, total);
      if ('value' in artLoaderProgress) artLoaderProgress.value = Math.min(done, Math.max(1, total));
      artLoaderProgress.setAttribute('aria-valuemax', String(Math.max(1, total)));
      artLoaderProgress.setAttribute('aria-valuenow', String(Math.min(done, Math.max(1, total))));
    }
    if (artLoaderLabel) {
      artLoaderLabel.textContent = artRuntime.manifestReady
        ? 'Illustrations HD ' + done + ' / ' + Math.max(done, total)
        : (artRuntime.ready ? 'Mode vectoriel actif' : 'Chargement des illustrations...');
    }
    if (artLoader) {
      artLoader.hidden = artRuntime.ready;
      artLoader.setAttribute('aria-busy', artRuntime.ready ? 'false' : 'true');
    }
  }

  function generatedArtCoreEntries() {
    if (!artRuntime.manifest) return [];
    return [
      ...Object.values(artRuntime.manifest.heroine?.parts || {}),
      ...Object.values(artRuntime.manifest.vfx || {})
    ];
  }

  function generatedArtBossEntries(id) {
    if (!artRuntime.manifest) return [];
    const arenaManifest = artRuntime.manifest.arenas?.[id] || {};
    const arena = arenaManifest.layers || (arenaManifest.backdrop ? { backdrop: arenaManifest.backdrop } : {});
    const parts = artRuntime.manifest.bosses?.[id]?.parts || {};
    return [...Object.values(arena), ...Object.values(parts)];
  }

  function loadGeneratedImage(entry) {
    const src = entry?.src;
    if (!src) return Promise.resolve(null);
    artRuntime.requested.add(src);
    updateArtLoader();
    if (artRuntime.images.has(src)) return Promise.resolve(artRuntime.images.get(src));
    if (artRuntime.pending.has(src)) return artRuntime.pending.get(src);
    if (artRuntime.failed.has(src)) return Promise.resolve(null);

    const pending = new Promise(resolve => {
      const image = new Image();
      image.decoding = 'async';
      image.onload = () => {
        artRuntime.images.set(src, image);
        artRuntime.pending.delete(src);
        updateArtLoader();
        resolve(image);
      };
      image.onerror = () => {
        artRuntime.failed.add(src);
        artRuntime.pending.delete(src);
        updateArtLoader();
        resolve(null);
      };
      image.src = src;
    });
    artRuntime.pending.set(src, pending);
    return pending;
  }

  function preloadGeneratedEntries(entries) {
    const unique = new Map();
    for (const entry of entries) if (entry?.src) unique.set(entry.src, entry);
    return Promise.all([...unique.values()].map(loadGeneratedImage));
  }

  function touchGeneratedBossBundle(id) {
    const previous = artRuntime.bossBundleOrder.indexOf(id);
    if (previous >= 0) artRuntime.bossBundleOrder.splice(previous, 1);
    artRuntime.bossBundleOrder.push(id);
  }

  function evictGeneratedBossBundles(protectedIds = new Set()) {
    while (artRuntime.bossBundleOrder.length > MAX_CACHED_BOSS_BUNDLES) {
      const index = artRuntime.bossBundleOrder.findIndex(id => !protectedIds.has(id));
      if (index < 0) break;
      const [evictedId] = artRuntime.bossBundleOrder.splice(index, 1);
      for (const entry of generatedArtBossEntries(evictedId)) {
        if (!entry?.src || artRuntime.currentAssets.has(entry.src) || artRuntime.pending.has(entry.src)) continue;
        artRuntime.images.delete(entry.src);
        artRuntime.requested.delete(entry.src);
        artRuntime.failed.delete(entry.src);
      }
      artRuntime.bundlePromises.delete(evictedId);
    }
    updateArtLoader();
  }

  function preloadGeneratedBossBundle(id) {
    if (!artRuntime.manifest || !id) return Promise.resolve([]);
    if (artRuntime.bundlePromises.has(id)) {
      touchGeneratedBossBundle(id);
      return artRuntime.bundlePromises.get(id);
    }
    const pending = preloadGeneratedEntries(generatedArtBossEntries(id)).then(images => {
      touchGeneratedBossBundle(id);
      evictGeneratedBossBundles(new Set([artRuntime.activeBossId, id]));
      return images;
    });
    artRuntime.bundlePromises.set(id, pending);
    return pending;
  }

  function queueGeneratedArtForBoss(id, markCurrent = true) {
    if (id) artRuntime.activeBossId = id;
    if (!artRuntime.manifest) return Promise.resolve([]);
    const activeId = id || artRuntime.activeBossId || 'rammer';
    touchGeneratedBossBundle(activeId);
    const coreEntries = generatedArtCoreEntries();
    const bossEntries = generatedArtBossEntries(activeId);
    if (markCurrent) {
      artRuntime.ready = false;
      artRuntime.currentAssets = new Set([...coreEntries, ...bossEntries].map(entry => entry.src).filter(Boolean));
      updateArtLoader();
    }
    const ready = Promise.all([
      preloadGeneratedEntries(coreEntries),
      preloadGeneratedBossBundle(activeId)
    ]).then(result => {
      if (markCurrent && artRuntime.activeBossId === activeId) {
        artRuntime.ready = true;
        updateArtLoader();
        const index = BOSSES.findIndex(entry => entry.id === activeId);
        if (index >= 0 && index + 1 < BOSSES.length) {
          void preloadGeneratedBossBundle(BOSSES[index + 1].id);
        }
      }
      return result;
    });
    return ready;
  }

  async function initializeGeneratedArt() {
    updateArtLoader();
    try {
      const response = await fetch(ART_MANIFEST_URL, { cache: 'no-cache' });
      if (!response.ok) throw new Error('Manifest HTTP ' + response.status);
      const manifest = await response.json();
      if (!manifest || !manifest.arenas || !manifest.bosses || !manifest.heroine?.parts || !manifest.vfx) {
        throw new Error('Manifest raster invalide');
      }
      artRuntime.manifest = manifest;
      artRuntime.manifestReady = true;
      const activeId = boss?.data?.id || artRuntime.activeBossId || 'rammer';
      await queueGeneratedArtForBoss(activeId, true);
    } catch (error) {
      artRuntime.failed.add(ART_MANIFEST_URL);
      artRuntime.ready = true;
      updateArtLoader();
      console.warn('Illustrations GEARSTORM indisponibles, rendu vectoriel conserve.', error);
    }
  }

  function getGeneratedArtState() {
    return {
      release: artRuntime.manifest?.release || null,
      manifestReady: artRuntime.manifestReady,
      ready: artRuntime.ready,
      loaded: [...artRuntime.images.keys()],
      loadedCount: artRuntime.images.size,
      failed: [...artRuntime.failed],
      currentAssets: [...artRuntime.currentAssets],
      cachedBossIds: [...artRuntime.bossBundleOrder]
    };
  }

  function generatedImage(entry) {
    return entry?.src ? artRuntime.images.get(entry.src) || null : null;
  }

  function drawGeneratedPart(entry, x, y, size, rotation = 0, scale = 1, alpha = 1) {
    const image = generatedImage(entry);
    if (!image) return false;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotation);
    ctx.scale(scale, scale);
    ctx.globalAlpha *= alpha;
    ctx.imageSmoothingEnabled = true;
    ctx.drawImage(image, -size / 2, -size / 2, size, size);
    ctx.restore();
    return true;
  }

  function drawRigPart(entry, spec, pose = {}, target = ctx) {
    const image = generatedImage(entry);
    if (!image || !spec) return false;
    const joint = pose.joint || spec.joint;
    const scale = spec.scale * (pose.scale ?? 1);
    target.save();
    target.translate(joint[0] + (pose.x || 0), joint[1] + (pose.y || 0));
    target.rotate((pose.rotation || 0) + (pose.baseRotation || 0));
    target.scale((pose.flipX ? -1 : 1) * scale, scale);
    target.globalAlpha *= pose.alpha ?? 1;
    target.imageSmoothingEnabled = true;
    // Le carre 418 px reste intact en memoire, mais le pivot semantique compense
    // sa marge alpha asymetrique. Aucun master ni atlas source n'est dessine.
    if (spec.sourceRect) {
      const [sx, sy, sw, sh] = spec.sourceRect;
      target.drawImage(image, sx, sy, sw, sh, sx - spec.pivot[0], sy - spec.pivot[1], sw, sh);
    } else {
      target.drawImage(image, -spec.pivot[0], -spec.pivot[1]);
    }
    target.restore();
    return true;
  }

  function heroineRigParts() {
    const declared = artRuntime.manifest?.heroine?.rig?.parts;
    const specs = Array.isArray(declared) ? declared : Object.values(declared || {});
    return specs
      .filter(spec => spec
        && typeof spec.name === 'string'
        && Array.isArray(spec.joint) && spec.joint.length === 2 && spec.joint.every(Number.isFinite)
        && Array.isArray(spec.pivot) && spec.pivot.length === 2 && spec.pivot.every(Number.isFinite)
        && Array.isArray(spec.bbox) && spec.bbox.length === 4 && spec.bbox.every(Number.isFinite)
        && Number.isFinite(spec.scale) && spec.scale > 0)
      .sort((left, right) => (Number(left.z) || 0) - (Number(right.z) || 0));
  }

  function isHeroEffectPart(spec) {
    return HERO_EFFECT_PARTS.has(spec?.name) || ['trail', 'halo'].includes(spec?.motion);
  }

  function heroineAnatomyParts() {
    return heroineRigParts().filter(spec => !isHeroEffectPart(spec));
  }

  function heroineRigMuzzle() {
    const declared = artRuntime.manifest?.heroine?.rig?.muzzle;
    if (declared && typeof declared.part === 'string' && Array.isArray(declared.point)
      && declared.point.length === 2 && declared.point.every(Number.isFinite)) {
      return { part: declared.part, point: [...declared.point] };
    }
    const x = Array.isArray(declared) ? Number(declared[0]) : Number(declared?.x);
    const y = Array.isArray(declared) ? Number(declared[1]) : Number(declared?.y);
    return Number.isFinite(x) && Number.isFinite(y) ? { x, y } : null;
  }

  function rotateRigVector(x, y, rotation) {
    const cosine = Math.cos(rotation);
    const sine = Math.sin(rotation);
    return {
      x: x * cosine - y * sine,
      y: x * sine + y * cosine
    };
  }

  function heroCannonRestRotation(spec, declared = heroineRigMuzzle()) {
    if (spec && declared?.part === spec.name && Array.isArray(declared.point)) {
      const axisX = declared.point[0] - spec.pivot[0];
      const axisY = declared.point[1] - spec.pivot[1];
      if (Math.hypot(axisX, axisY) > 0.001) return -Math.atan2(axisY, axisX);
    }
    return RIVA_CANNON_BASE_ROTATION;
  }

  function normalizeRigAngle(rotation) {
    return Math.atan2(Math.sin(rotation), Math.cos(rotation));
  }

  function heroPoseInputs(subject = player) {
    const reduceMotion = save.settings.reduceMotion;
    const velocityY = Number(subject?.vy) || 0;
    const onGround = subject?.onGround !== false;
    const maxSpeed = Math.max(1, Number(runBuild?.maxSpeed) || 1);
    return {
      reduceMotion,
      gait: reduceMotion || !onGround ? 0 : Math.sin(Number(subject?.anim) || 0),
      speedPose: reduceMotion ? 0 : Math.min(1, Math.abs(Number(subject?.vx) || 0) / maxSpeed),
      airborne: onGround ? 0 : clamp(velocityY / 900, -0.65, 0.65),
      jumpBlend: onGround ? 0 : 1,
      rising: onGround || reduceMotion ? 0 : clamp(-velocityY / 760, 0, 1),
      falling: onGround || reduceMotion ? 0 : clamp(velocityY / 760, 0, 1),
      aim: reduceMotion ? 0 : clamp(Number(subject?.poseAim) || 0, 0, 1),
      recoil: reduceMotion ? 0 : clamp(Number(subject?.poseRecoil) || 0, 0, 1),
      landing: reduceMotion ? 0 : clamp(Number(subject?.poseLand) || 0, 0, 1),
      dashing: !reduceMotion && Number(subject?.dashTime) > 0
    };
  }

  function heroRootRotation(animation) {
    return (animation.dashing ? -0.11 : 0) + animation.airborne * 0.065;
  }

  function heroAnatomyPose(spec, animation) {
    const name = spec.name.toLowerCase();
    const side = spec.side === 'far' || name.endsWith('-far') ? -1 : 1;
    const stride = animation.gait * animation.speedPose;
    const pose = { rotation: 0, x: 0, y: 0, scale: 1, alpha: 1 };

    if (name === 'pelvis') pose.rotation = -stride * 0.055 + animation.airborne * 0.018;
    else if (name === 'torso') pose.rotation = stride * 0.045 + animation.speedPose * 0.035 - animation.airborne * 0.042 - animation.landing * 0.035;
    else if (name === 'head') pose.rotation = -stride * 0.035 + animation.airborne * 0.025 + animation.landing * 0.025;
    else if (name.startsWith('upper-arm')) {
      const swing = side * stride * 0.18;
      pose.rotation = name.endsWith('-near') ? swing * 0.38 - animation.aim * 0.055 : swing;
    } else if (name === 'forearm-far') {
      pose.rotation = 0.10 - side * stride * 0.14 + animation.jumpBlend * 0.055;
    } else if (name === RIVA_CANNON_PART) {
      // Le tir central n'a pas de visee verticale : le canon garde donc son axe
      // balistique et exprime le recul par translation, sans faux coup de nez.
      pose.rotation = RIVA_CANNON_BASE_ROTATION;
      pose.x = -animation.recoil * RIVA_CANNON_RECOIL;
    } else if (name.startsWith('thigh')) {
      pose.rotation = side * stride * 0.30 - side * animation.rising * 0.17 + side * animation.falling * 0.08 + side * animation.landing * 0.11;
    } else if (name.startsWith('shin')) {
      pose.rotation = -side * stride * 0.23 + Math.max(0, side * stride) * 0.12
        + animation.jumpBlend * (side > 0 ? 0.27 : 0.16) + animation.landing * 0.16;
    } else if (name.startsWith('boot')) {
      pose.rotation = side * stride * 0.11 - animation.rising * 0.08 + animation.falling * 0.045 - animation.landing * 0.08;
    }
    return pose;
  }

  function resolveHeroRigPose(rigParts = heroineRigParts(), animation = heroPoseInputs()) {
    const byName = new Map(rigParts.map(spec => [spec.name, spec]));
    const resolved = new Map();
    const resolving = new Set();
    const rootRotation = heroRootRotation(animation);
    const cannonMuzzle = heroineRigMuzzle();

    function resolve(spec) {
      if (resolved.has(spec.name)) return resolved.get(spec.name);
      if (resolving.has(spec.name)) return null;
      resolving.add(spec.name);
      let localPose;
      if (spec.name === 'dash-trail') {
        localPose = { rotation: 0, x: 0, y: 0, scale: 1 + animation.speedPose * 0.1, alpha: 0.84 };
      } else if (spec.name === 'overload-halo') {
        const pulse = animation.reduceMotion ? 1 : 1 + Math.sin((Number(player?.anim) || 0) * 2.4) * 0.055;
        localPose = { rotation: 0, x: 0, y: 0, scale: pulse, alpha: 0.9 };
      } else {
        localPose = heroAnatomyPose(spec, animation);
      }

      const parentSpec = typeof spec.parent === 'string' ? byName.get(spec.parent) : null;
      const parentPose = parentSpec ? resolve(parentSpec) : null;
      let joint = [spec.joint[0] + (localPose.x || 0), spec.joint[1] + (localPose.y || 0)];
      let rotation = localPose.rotation || 0;
      if (parentSpec && parentPose) {
        const offset = rotateRigVector(
          spec.joint[0] - parentSpec.joint[0] + (localPose.x || 0),
          spec.joint[1] - parentSpec.joint[1] + (localPose.y || 0),
          parentPose.rotation
        );
        joint = [parentPose.joint[0] + offset.x, parentPose.joint[1] + offset.y];
        rotation += parentPose.rotation;
      }
      if (spec.name === RIVA_CANNON_PART) {
        // Le coude et le recul suivent toujours la hierarchie. Seule la rotation
        // finale compense bras, torse et inclinaison racine afin que l'emetteur
        // reste colineaire au vecteur reel du projectile.
        rotation = heroCannonRestRotation(spec, cannonMuzzle) - rootRotation;
      }
      const worldPose = { ...localPose, x: 0, y: 0, joint, rotation };
      resolving.delete(spec.name);
      resolved.set(spec.name, worldPose);
      return worldPose;
    }

    for (const spec of rigParts) resolve(spec);
    return { animation, rootRotation, parts: resolved };
  }
  function renderedHeroCannonAngle() {
    const declared = heroineRigMuzzle();
    if (!declared?.part || !declared.point) return 0;
    const rigParts = heroineRigParts();
    const spec = rigParts.find(candidate => candidate.name === declared.part);
    if (!spec) return 0;
    const snapshot = resolveHeroRigPose(rigParts);
    const pose = snapshot.parts.get(spec.name);
    if (!pose) return 0;
    const sourceAxis = Math.atan2(
      declared.point[1] - spec.pivot[1],
      declared.point[0] - spec.pivot[0]
    );
    return normalizeRigAngle(sourceAxis + pose.rotation + snapshot.rootRotation);
  }


  function renderedHeroMuzzle() {
    const declared = heroineRigMuzzle();
    if (!declared) return { ...RIVA_MUZZLE };
    if (declared.part && declared.point) {
      const rigParts = heroineRigParts();
      const spec = rigParts.find(candidate => candidate.name === declared.part);
      const snapshot = resolveHeroRigPose(rigParts);
      const pose = spec ? snapshot.parts.get(spec.name) : null;
      if (spec && pose) {
        const endpoint = rotateRigVector(
          (declared.point[0] - spec.pivot[0]) * spec.scale * (pose.scale ?? 1),
          (declared.point[1] - spec.pivot[1]) * spec.scale * (pose.scale ?? 1),
          pose.rotation
        );
        const rooted = rotateRigVector(pose.joint[0] + endpoint.x, pose.joint[1] + endpoint.y, snapshot.rootRotation);
        return {
          x: rooted.x * RIVA_RENDER_SCALE,
          y: rooted.y * RIVA_RENDER_SCALE - RIVA_FOOT_OFFSET - RIVA_ROAD_LIFT
        };
      }
    }
    return {
      x: declared.x * RIVA_RENDER_SCALE,
      y: declared.y * RIVA_RENDER_SCALE - RIVA_FOOT_OFFSET - RIVA_ROAD_LIFT
    };
  }

  function getArenaVisualOffset(id) {
    const value = Number(artRuntime.manifest?.arenas?.[id]?.visualOffsetY);
    return Number.isFinite(value) ? clamp(value, -H, H) : 0;
  }

  function drawArenaImageWithOffset(image, x, y, width, height, offsetY, fillTop = false) {
    const shiftedY = y + offsetY;
    if (fillTop && shiftedY > 0) {
      const sourceWidth = image.naturalWidth || image.width;
      const sourceHeight = image.naturalHeight || image.height;
      const gapHeight = Math.min(H, shiftedY);
      const sourceGap = Math.max(1, Math.min(sourceHeight, Math.ceil(gapHeight * sourceHeight / Math.max(1, height))));
      ctx.drawImage(image, 0, 0, sourceWidth, sourceGap, x, 0, width, gapHeight);
    }
    ctx.drawImage(image, x, shiftedY, width, height);
  }

  function drawGeneratedArena(data) {
    const arena = artRuntime.manifest?.arenas?.[data.id];
    if (!arena) return false;
    void preloadGeneratedBossBundle(data.id);
    const visualOffsetY = getArenaVisualOffset(data.id);
    const backdrop = generatedImage(arena.backdrop);
    if (backdrop) {
      ctx.save();
      ctx.imageSmoothingEnabled = true;
      drawArenaImageWithOffset(backdrop, 0, 0, W, H, visualOffsetY, true);
      ctx.restore();
      return true;
    }
    let painted = false;
    const layers = ['far', 'mid', 'ground', 'foreground'];
    for (let index = 0; index < layers.length; index++) {
      const layerName = layers[index];
      const layer = arena.layers?.[layerName];
      const image = generatedImage(layer);
      if (!image) continue;
      const speed = Number(layer.speed) || 0;
      const margin = 30 + speed * 170;
      const phase = artRuntime.parallaxTime * (0.38 + speed * 4.2) + index * 0.75;
      const shift = save.settings.reduceMotion ? 0 : Math.sin(phase) * Math.min(margin * 0.72, speed * 185);
      const combatFade = layerName === 'foreground' && player && boss && ['fight', 'dead', 'paused'].includes(state) ? (save.settings.highContrast ? 0.1 : 0.24) : 1;
      ctx.save();
      ctx.globalAlpha = combatFade;
      ctx.imageSmoothingEnabled = true;
      drawArenaImageWithOffset(image, -margin + shift, -margin * 0.3, W + margin * 2, H + margin * 0.6, visualOffsetY, layerName === 'far');
      ctx.restore();
      painted = true;
    }
    return painted;
  }

  function heroArtReady() {
    const parts = artRuntime.manifest?.heroine?.parts;
    const rigParts = heroineRigParts();
    const anatomyParts = rigParts.filter(spec => !isHeroEffectPart(spec));
    return !!parts
      && !!heroRigContext
      && rigParts.length === 15
      && anatomyParts.length === 13
      && rigParts.every(spec => generatedImage(parts[spec.name]));
  }

  function drawGeneratedPlayer() {
    const parts = artRuntime.manifest?.heroine?.parts;
    if (!heroArtReady()) return false;
    const rigParts = heroineRigParts();
    const poseSnapshot = resolveHeroRigPose(rigParts);
    const center = HERO_RIG_BUFFER_SIZE / 2;

    heroRigContext.clearRect(0, 0, HERO_RIG_BUFFER_SIZE, HERO_RIG_BUFFER_SIZE);
    heroRigContext.save();
    heroRigContext.translate(center, center - RIVA_FOOT_OFFSET - RIVA_ROAD_LIFT);
    heroRigContext.scale(RIVA_RENDER_SCALE, RIVA_RENDER_SCALE);
    heroRigContext.rotate(poseSnapshot.rootRotation);
    for (const spec of rigParts) {
      if (spec.name === 'dash-trail') {
        if (player.dashTime <= 0) continue;
      } else if (spec.name === 'overload-halo') {
        if (player.overloadTime <= 0) continue;
      }
      const pose = poseSnapshot.parts.get(spec.name);
      if (!pose) continue;
      drawRigPart(parts[spec.name], spec, pose, heroRigContext);
    }
    heroRigContext.restore();

    ctx.save();
    ctx.filter = save.settings.highContrast
      ? 'drop-shadow(0px 3px 2px rgba(0,0,0,1)) drop-shadow(0px 0px 4px rgba(255,255,255,0.9))'
      : 'drop-shadow(0px 3px 2px rgba(0,0,0,0.96)) drop-shadow(0px 0px 3px rgba(102,235,255,0.44))';
    ctx.drawImage(heroRigCanvas, -center, -center);
    ctx.restore();
    return true;
  }

  function bossRigPose(spec, index, activeCount) {
    const t = save.settings.reduceMotion ? 0 : boss.totalTime;
    const pose = { joint: [...spec.joint], rotation: 0, scale: 1, x: 0, y: 0 };
    if (spec.motion === 'spin') pose.rotation = t * 0.24;
    else if (spec.motion === 'limb-left') pose.rotation = -Math.sin(t * 2.3 + index) * 0.035;
    else if (spec.motion === 'limb-right') pose.rotation = Math.sin(t * 2.3 + index) * 0.035;
    else if (spec.motion === 'limb' || spec.motion === 'legs') pose.rotation = Math.sin(t * 2 + index) * 0.025;
    else if (spec.motion === 'hover') pose.y = Math.sin(t * 2.1 + index) * 1.6;
    else if (spec.motion === 'recoil') pose.x = Math.sin(t * 1.4) * 1.5;
    else if (spec.motion === 'pulse') pose.scale += Math.sin(t * 3.8 + index) * 0.018;

    const weak = BOSS_WEAK_POINTS[boss.data.id];
    if (spec.name === weak.part) {
      const phaseScale = 1 + (boss.phase - 1) * 0.045;
      pose.joint = [weak.x / phaseScale, weak.y / phaseScale];
      if (boss.vulnerable) pose.scale += save.settings.reduceMotion ? 0.055 : 0.075 + Math.sin(t * 7) * 0.035;
    }

    // L'eclatement est strictement reserve a l'etat de transformation.
    if (boss.state === 'phaseTransition') {
      const duration = save.settings.reduceMotion ? 0.65 : 1.15;
      const progress = clamp(boss.stateTime / duration, 0, 1);
      const burst = Math.sin(progress * Math.PI) * (32 + index * 2.6);
      const angle = index / Math.max(1, activeCount) * TAU + 0.35;
      pose.x += Math.cos(angle) * burst;
      pose.y += Math.sin(angle) * burst;
      pose.rotation += Math.sin(angle) * burst * 0.011;
    }
    return pose;
  }

  function drawGeneratedBoss() {
    const parts = artRuntime.manifest?.bosses?.[boss?.data?.id]?.parts;
    if (!parts) return false;
    if (isExpandedBoss()) {
      const manifestBoss = artRuntime.manifest?.bosses?.[boss.data.id];
      const rig = manifestBoss?.rig || {};
      const entries = Object.entries(parts)
        .filter(([, entry]) => entry?.src)
        .sort((left, right) => (left[1].z || 0) - (right[1].z || 0));
      if (entries.length < 4 || !entries.every(([, entry]) => generatedImage(entry))) return false;

      const defaultSize = rig.drawSize || entries[0][1].drawSize || { width: 236, height: 236 };
      const weakVisual = rig.weakCore || { x: 0.5, y: 0.5 };
      const weakTarget = boss.data.weakPoint || { x: 0, y: -8 };
      const rigOffsetX = weakTarget.x - (weakVisual.x - 0.5) * defaultSize.width;
      const rigOffsetY = weakTarget.y - (weakVisual.y - 0.5) * defaultSize.height;
      const transitioning = boss.state === 'phaseTransition';
      const duration = save.settings.reduceMotion ? 0.65 : 1.15;
      const progress = transitioning ? clamp(boss.stateTime / duration, 0, 1) : 0;
      const burst = transitioning ? Math.sin(progress * Math.PI) : 0;
      const time = save.settings.reduceMotion ? 0 : boss.totalTime;
      const phaseSpread = (boss.phase - 1) * 0.045;

      ctx.save();
      ctx.translate(rigOffsetX, rigOffsetY);
      ctx.filter = boss.hitFlash > 0
        ? 'brightness(2.2) saturate(0.3) drop-shadow(0px 5px 3px rgba(0,0,0,0.92))'
        : 'drop-shadow(0px 6px 4px rgba(0,0,0,0.94)) drop-shadow(0px 0px 4px rgba(255,255,255,0.18))';

      entries.forEach(([name, entry], index) => {
        const image = generatedImage(entry);
        const drawSize = entry.drawSize || defaultSize;
        const width = drawSize.width || defaultSize.width;
        const height = drawSize.height || defaultSize.height;
        const joint = entry.joint || entry.pivot || { x: 0.5, y: 0.5 };
        const jointX = (Number(joint.x) || 0.5) * width - width / 2;
        const jointY = (Number(joint.y) || 0.5) * height - height / 2;
        const side = name.endsWith('left') ? -1 : name.endsWith('right') ? 1 : 0;
        let x = 0;
        let y = 0;
        let rotation = 0;
        let scale = 1;

        if (side) rotation = side * (phaseSpread + Math.sin(time * 2.2 + index) * 0.026);
        else if (name === 'chassis') rotation = Math.sin(time * 1.25) * 0.012;
        else if (entry.weakCore === true || entry.role === 'weak-core') {
          scale += (boss.phase - 1) * 0.035;
          if (boss.vulnerable) scale += save.settings.reduceMotion ? 0.04 : 0.055 + Math.sin(time * 7) * 0.025;
        }

        if (transitioning) {
          const angle = index / Math.max(1, entries.length) * TAU + 0.35;
          const distance = burst * (20 + index * 5);
          x += Math.cos(angle) * distance;
          y += Math.sin(angle) * distance;
          rotation += Math.sin(angle) * burst * 0.12;
        }

        ctx.save();
        ctx.globalAlpha = transitioning ? 0.86 + (1 - burst) * 0.14 : 1;
        ctx.translate(x + jointX, y + jointY);
        ctx.rotate(rotation);
        ctx.scale(scale, scale);
        ctx.translate(-jointX, -jointY);
        ctx.drawImage(image, -width / 2, -height / 2, width, height);
        ctx.restore();
      });
      ctx.restore();

      // Les marqueurs restent cales sur les vraies hitboxes, independamment du rig peint.
      for (const part of boss.runtime?.parts || []) {
        if (part.role === 'armor' || part.role === 'weak-point' || part.destroyed) continue;
        const x = part.hitbox?.x ?? part.anchor?.x ?? 0;
        const y = part.hitbox?.y ?? part.anchor?.y ?? 0;
        const radius = part.hitbox?.r || 20;
        ctx.save();
        ctx.strokeStyle = part.state === 'damaged' ? '#ffd0d8' : boss.data.accent;
        ctx.fillStyle = part.state === 'damaged' ? 'rgba(139,84,98,0.32)' : 'rgba(8,15,28,0.24)';
        ctx.lineWidth = save.settings.highContrast ? 5 : 3;
        ctx.beginPath();
        ctx.rect(x - radius, y - radius, radius * 2, radius * 2);
        ctx.fill();
        ctx.stroke();
        ctx.restore();
      }
      return true;
    }

    const rig = BOSS_RIGS[boss?.data?.id];
    if (!rig) return false;
    const active = rig.parts.filter(spec => spec.phase <= boss.phase);
    if (!active.every(spec => generatedImage(parts[spec.name]))) return false;
    ctx.save();
    ctx.filter = boss.hitFlash > 0
      ? 'brightness(2.2) saturate(0.3) drop-shadow(0px 5px 3px rgba(0,0,0,0.92))'
      : 'drop-shadow(0px 5px 3px rgba(0,0,0,0.92)) drop-shadow(0px 0px 3px rgba(255,255,255,0.14))';
    for (let index = 0; index < active.length; index++) {
      const spec = active[index];
      drawRigPart(parts[spec.name], spec, bossRigPose(spec, index, active.length));
    }
    ctx.restore();
    return true;
  }

  function drawGeneratedBossPreview(data) {
    const parts = artRuntime.manifest?.bosses?.[data.id]?.parts;
    void preloadGeneratedBossBundle(data.id);
    if (data.engine === 'expanded') {
      const manifestBoss = artRuntime.manifest?.bosses?.[data.id];
      const entries = Object.values(parts || {})
        .filter(entry => entry?.src)
        .sort((left, right) => (left.z || 0) - (right.z || 0));
      if (entries.length < 4 || !entries.every(entry => generatedImage(entry))) return false;
      const baseSize = manifestBoss?.rig?.drawSize || entries[0].drawSize || { width: 236, height: 236 };
      const scale = 150 / Math.max(baseSize.width, baseSize.height);
      ctx.save();
      ctx.scale(scale, scale);
      ctx.filter = 'drop-shadow(0px 6px 4px rgba(0,0,0,0.95))';
      for (const entry of entries) {
        const image = generatedImage(entry);
        const drawSize = entry.drawSize || baseSize;
        ctx.drawImage(image, -drawSize.width / 2, -drawSize.height / 2, drawSize.width, drawSize.height);
      }
      ctx.restore();
      return true;
    }

    const rig = BOSS_RIGS[data.id];
    if (!rig || !parts) return false;
    const active = rig.parts.filter(spec => spec.phase === 1);
    if (!active.every(spec => generatedImage(parts[spec.name]))) return false;
    ctx.save();
    ctx.scale(0.52, 0.52);
    ctx.filter = 'drop-shadow(0px 6px 4px rgba(0,0,0,0.95))';
    for (const spec of active) drawRigPart(parts[spec.name], spec);
    ctx.restore();
    return true;
  }

  function staticRigBounds(specs, bboxFormat = 'ltrb') {
    if (!specs.length) return { left: 0, top: 0, right: 0, bottom: 0 };
    const bounds = { left: Infinity, top: Infinity, right: -Infinity, bottom: -Infinity };
    for (const spec of specs) {
      const [left, top, third, fourth] = spec.bbox;
      const right = bboxFormat === 'xywh' ? left + third : third;
      const bottom = bboxFormat === 'xywh' ? top + fourth : fourth;
      bounds.left = Math.min(bounds.left, spec.joint[0] + (left - spec.pivot[0]) * spec.scale);
      bounds.top = Math.min(bounds.top, spec.joint[1] + (top - spec.pivot[1]) * spec.scale);
      bounds.right = Math.max(bounds.right, spec.joint[0] + (right - spec.pivot[0]) * spec.scale);
      bounds.bottom = Math.max(bounds.bottom, spec.joint[1] + (bottom - spec.pivot[1]) * spec.scale);
    }
    return Object.fromEntries(Object.entries(bounds).map(([key, value]) => [key, Math.round(value * 10) / 10]));
  }

  function heroRigHierarchyDiagnostics(specs) {
    const byName = new Map(specs.map(spec => [spec.name, spec]));
    const states = new Map();
    const cycles = [];
    const missingParents = [];

    function visit(name, trail = []) {
      const state = states.get(name) || 0;
      if (state === 2) return;
      if (state === 1) {
        cycles.push([...trail, name]);
        return;
      }
      states.set(name, 1);
      const spec = byName.get(name);
      if (spec?.parent) {
        if (!byName.has(spec.parent)) missingParents.push({ child: name, parent: spec.parent });
        else visit(spec.parent, [...trail, name]);
      }
      states.set(name, 2);
    }

    for (const name of byName.keys()) visit(name);
    const roots = specs.filter(spec => !spec.parent).map(spec => spec.name);
    const reachesPelvis = specs.every(spec => {
      let current = spec;
      const seen = new Set();
      while (current?.parent && !seen.has(current.name)) {
        seen.add(current.name);
        current = byName.get(current.parent);
      }
      return current?.name === 'pelvis';
    });
    return {
      acyclic: cycles.length === 0,
      cycles,
      missingParents,
      roots,
      reachesPelvis,
      chains: [
        ['pelvis', 'torso', 'head'],
        ['pelvis', 'thigh-far', 'shin-far', 'boot-far'],
        ['pelvis', 'thigh-near', 'shin-near', 'boot-near'],
        ['torso', 'upper-arm-far', 'forearm-far'],
        ['torso', 'upper-arm-near', 'forearm-cannon-near']
      ]
    };
  }

  function getRigDiagnostics() {
    const heroParts = heroineRigParts();
    const anatomyParts = heroParts.filter(spec => !isHeroEffectPart(spec));
    const bootParts = anatomyParts.filter(spec => spec.name.startsWith('boot-'));
    const measuredFeet = bootParts.length
      ? Math.max(...bootParts.map(spec => spec.joint[1] + (spec.bbox[1] + spec.bbox[3] - spec.pivot[1]) * spec.scale))
      : 36;
    const declaredFeet = Number(artRuntime.manifest?.heroine?.rig?.feetLocalY);
    const feetLocalY = Number.isFinite(declaredFeet) ? declaredFeet : measuredFeet;
    const hierarchy = heroRigHierarchyDiagnostics(anatomyParts);
    const renderedCannonAngle = renderedHeroCannonAngle();
    const cannonProjectileAngle = 0;
    const activeArenaId = boss?.data?.id || artRuntime.activeBossId || 'rammer';
    const visualOffsetY = getArenaVisualOffset(activeArenaId);
    const arenaVisualOffsets = Object.fromEntries(Object.keys(artRuntime.manifest?.arenas || {})
      .map(id => [id, getArenaVisualOffset(id)]));
    const muzzle = heroineRigMuzzle() || RIVA_MUZZLE;
    const bossHitboxes = {
      rammer: [190, 160], kraken: [190, 160], drill: [190, 160],
      mantis: [190, 160], cyclotron: [230, 160], omega: [190, 220]
    };
    const bosses = {};
    for (const [id, rig] of Object.entries(BOSS_RIGS)) {
      const weak = BOSS_WEAK_POINTS[id];
      const core = rig.parts.find(spec => spec.name === weak.part);
      bosses[id] = {
        parts: rig.parts.length,
        phaseCounts: [1, 2, 3].map(phase => rig.parts.filter(spec => spec.phase <= phase).length),
        phase1Bounds: staticRigBounds(rig.parts.filter(spec => spec.phase === 1)),
        hitbox: { width: bossHitboxes[id][0], height: bossHitboxes[id][1] },
        corePart: weak.part,
        coreVisualTarget: { x: weak.x, y: weak.y },
        weakPoint: { x: weak.x, y: weak.y, radius: weak.r },
        corePivotMeasured: core ? [...core.pivot] : null,
        transitionExplosionOnly: true
      };
    }
    for (const entry of BOSS_REGISTRY?.expanded?.() || []) {
      const manifestBoss = artRuntime.manifest?.bosses?.[entry.id];
      const manifestParts = Object.values(manifestBoss?.parts || {});
      const weak = entry.weakPoint;
      const weakVisual = manifestBoss?.rig?.weakCore;
      bosses[entry.id] = {
        parts: entry.parts.length,
        phaseCounts: [1, 2, 3].map(phase => entry.parts.filter(part => part.appearsInPhase <= phase).length),
        phase1Bounds: null,
        hitbox: { width: entry.hitbox.w, height: entry.hitbox.h },
        corePart: weak.part,
        coreVisualTarget: { x: weak.x, y: weak.y },
        weakPoint: { x: weak.x, y: weak.y, radius: weak.r },
        corePivotMeasured: weakVisual ? [weakVisual.x, weakVisual.y] : null,
        generatedMultipartManifest: manifestParts.length === 4,
        generatedMultipartLoaded: manifestParts.length === 4 && manifestParts.every(part => generatedImage(part)),
        generatedPartRoles: manifestParts.map(part => part.role),
        proceduralFallback: true,
        transitionExplosionOnly: true
      };
    }
    return {
      heroine: {
        parts: heroParts.length,
        anatomyParts: anatomyParts.length,
        effectParts: heroParts.length - anatomyParts.length,
        partNames: heroParts.map(spec => spec.name),
        anatomyPartNames: anatomyParts.map(spec => spec.name),
        parentLinks: anatomyParts.filter(spec => spec.parent).map(spec => ({ child: spec.name, parent: spec.parent })),
        hierarchy,
        hierarchical: hierarchy.acyclic && hierarchy.missingParents.length === 0 && hierarchy.reachesPelvis,
        zOrder: heroParts.map(spec => ({ name: spec.name, z: Number(spec.z) || 0 })),
        bodyBounds: staticRigBounds(anatomyParts, 'xywh'),
        hitbox: { width: 42, height: 72, groundLocalY: 36 },
        hurtboxPolicy: 'forgiving-lower-core',
        feet: Math.round(feetLocalY * 10) / 10,
        feetLocalY: Math.round(feetLocalY * 10) / 10,
        renderScale: RIVA_RENDER_SCALE,
        footOffset: RIVA_FOOT_OFFSET,
        roadLift: RIVA_ROAD_LIFT,
        renderedFeetLocalY: Math.round((feetLocalY * RIVA_RENDER_SCALE - RIVA_FOOT_OFFSET - RIVA_ROAD_LIFT) * 10) / 10,
        muzzle: { ...muzzle },
        renderedMuzzle: renderedHeroMuzzle(),
        renderedCannonAngle,
        cannonProjectileAngle,
        cannonAimError: normalizeRigAngle(renderedCannonAngle - cannonProjectileAngle),
        cannonBaseRotation: RIVA_CANNON_BASE_ROTATION,
        cannonRecoil: RIVA_CANNON_RECOIL,
        poseState: player ? heroPoseInputs() : null,
        loadedParts: heroParts.filter(spec => generatedImage(artRuntime.manifest?.heroine?.parts?.[spec.name])).length,
        artReady: heroArtReady(),
        visualOffsetY,
        facingMirroredAtRoot: true
      },
      activeArenaId,
      visualOffsetY,
      arenaVisualOffsets,
      bosses
    };
  }

  function drawRigDebugOverlay() {
    ctx.save();
    ctx.setLineDash([7, 5]);
    ctx.lineWidth = 2;
    if (player) {
      ctx.strokeStyle = '#70efff';
      ctx.strokeRect(player.x - player.w / 2, player.y - player.h / 2, player.w, player.h);
      const muzzle = playerMuzzlePosition();
      ctx.beginPath();
      ctx.arc(muzzle.x, muzzle.y, 7, 0, TAU);
      ctx.stroke();
    }
    if (boss) {
      ctx.strokeStyle = '#ffb14a';
      ctx.strokeRect(boss.x - boss.w / 2, boss.y - boss.h / 2, boss.w, boss.h);
      ctx.strokeStyle = boss.data.accent;
      ctx.beginPath();
      ctx.arc(boss.weakX, boss.weakY, boss.weakR, 0, TAU);
      ctx.stroke();
    }
    ctx.setLineDash([]);
    ctx.restore();
  }

  function spawnGeneratedVfx(key, x, y, options = {}) {
    const entry = artRuntime.manifest?.vfx?.[key];
    if (!entry) return false;
    void loadGeneratedImage(entry);
    artRuntime.effects.push({
      key,
      x,
      y,
      age: 0,
      duration: Math.max(0.08, options.duration || 0.34),
      size: options.size || 86,
      rotation: options.rotation || 0,
      alpha: options.alpha ?? 1,
      growth: options.growth ?? 0.45
    });
    return true;
  }

  function updateGeneratedEffects(dt) {
    for (let index = artRuntime.effects.length - 1; index >= 0; index--) {
      const effect = artRuntime.effects[index];
      effect.age += dt;
      if (effect.age >= effect.duration) artRuntime.effects.splice(index, 1);
    }
  }

  function drawGeneratedEffects() {
    for (const effect of artRuntime.effects) {
      const entry = artRuntime.manifest?.vfx?.[effect.key];
      const image = generatedImage(entry);
      if (!image) continue;
      const progress = clamp(effect.age / effect.duration, 0, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const scale = save.settings.reduceMotion ? 1 : 0.72 + eased * effect.growth;
      ctx.save();
      ctx.translate(effect.x, effect.y);
      ctx.rotate(save.settings.reduceMotion ? effect.rotation : effect.rotation + progress * 0.18);
      ctx.globalAlpha = (1 - progress) * effect.alpha;
      ctx.imageSmoothingEnabled = true;
      ctx.drawImage(image, -effect.size * scale / 2, -effect.size * scale / 2, effect.size * scale, effect.size * scale);
      ctx.restore();
    }
  }

  function sanitizeUpgradeOffer(value, installed = []) {
    const installedCounts = new Map();
    for (const id of installed) installedCounts.set(id, (installedCounts.get(id) || 0) + 1);
    const choices = [];
    for (const rawId of Array.isArray(value) ? value : []) {
      const upgrade = UPGRADES.find(entry => entry.id === rawId);
      if (!upgrade || choices.includes(rawId) || (installedCounts.get(rawId) || 0) >= upgrade.maxStacks) continue;
      choices.push(rawId);
      if (choices.length === 3) break;
    }
    return choices;
  }

  function sanitizeRushSnapshot(value) {
    if (!value || typeof value !== 'object') return null;
    const bossIndex = Math.floor(Number(value.bossIndex));
    if (!Number.isFinite(bossIndex) || bossIndex < 0 || bossIndex >= CAMPAIGN_BOSSES.length) return null;
    const counts = new Map();
    const installed = [];
    for (const rawId of Array.isArray(value.installed) ? value.installed : []) {
      const upgrade = UPGRADES.find(entry => entry.id === rawId);
      const count = counts.get(rawId) || 0;
      if (!upgrade || count >= upgrade.maxStacks) continue;
      counts.set(rawId, count + 1);
      installed.push(rawId);
    }
    let checkpoint = ['fight', 'interlude', 'upgrade'].includes(value.checkpoint)
      ? value.checkpoint
      : value.pendingUpgrade === true ? 'upgrade' : 'fight';
    if (bossIndex === CAMPAIGN_BOSSES.length - 1 && checkpoint === 'upgrade') checkpoint = 'interlude';
    const upgradeOffer = checkpoint === 'upgrade' ? sanitizeUpgradeOffer(value.upgradeOffer, installed) : [];
    return {
      version: 2,
      bossIndex,
      checkpoint,
      pendingUpgrade: checkpoint === 'upgrade' && bossIndex < CAMPAIGN_BOSSES.length - 1,
      score: Math.max(0, Math.floor(Number(value.score) || 0)),
      rushElapsedBeforeBoss: Math.max(0, Number(value.rushElapsedBeforeBoss) || 0),
      rushRetryPenalty: Math.max(0, Number(value.rushRetryPenalty) || 0),
      runRetryCount: Math.max(0, Math.floor(Number(value.runRetryCount) || 0)),
      currentBossRetries: Math.max(0, Math.floor(Number(value.currentBossRetries) || 0)),
      installed,
      upgradeOffer,
      difficulty: Object.hasOwn(DIFFICULTIES, value.difficulty) ? value.difficulty : 'standard',
      savedAt: Math.max(0, Math.floor(Number(value.savedAt) || Date.now()))
    };
  }

  function sanitizeForgeRushSnapshot(value) {
    if (!value || typeof value !== 'object' || EXPANDED_BOSSES.length !== 24) return null;
    const bossIndex = Math.floor(Number(value.bossIndex));
    if (!Number.isFinite(bossIndex) || bossIndex < FORGE_START_INDEX || bossIndex > FORGE_FINAL_INDEX) return null;
    const counts = new Map();
    const installed = [];
    for (const rawId of Array.isArray(value.installed) ? value.installed : []) {
      const upgrade = UPGRADES.find(entry => entry.id === rawId);
      const count = counts.get(rawId) || 0;
      if (!upgrade || count >= upgrade.maxStacks) continue;
      counts.set(rawId, count + 1);
      installed.push(rawId);
    }
    let checkpoint = ['fight', 'upgrade', 'ending'].includes(value.checkpoint) ? value.checkpoint : 'fight';
    let completedBosses = clamp(
      Math.floor(Number(value.completedBosses) || (bossIndex - FORGE_START_INDEX + (checkpoint === 'upgrade' ? 1 : 0))),
      0,
      EXPANDED_BOSSES.length
    );
    const finalBoss = bossIndex === FORGE_FINAL_INDEX;
    if (checkpoint === 'ending' && (!finalBoss || completedBosses < EXPANDED_BOSSES.length)) {
      checkpoint = 'fight';
      completedBosses = Math.max(0, bossIndex - FORGE_START_INDEX);
    } else if (finalBoss && checkpoint === 'upgrade' && completedBosses >= EXPANDED_BOSSES.length) {
      checkpoint = 'ending';
      completedBosses = EXPANDED_BOSSES.length;
    }
    const upgradeOffer = checkpoint === 'upgrade' ? sanitizeUpgradeOffer(value.upgradeOffer, installed) : [];
    return {
      version: 1,
      bossIndex,
      checkpoint,
      completedBosses,
      wave: BOSSES[bossIndex]?.wave || 1,
      score: Math.max(0, Math.floor(Number(value.score) || 0)),
      rushElapsedBeforeBoss: Math.max(0, Number(value.rushElapsedBeforeBoss) || 0),
      rushRetryPenalty: Math.max(0, Number(value.rushRetryPenalty) || 0),
      runRetryCount: Math.max(0, Math.floor(Number(value.runRetryCount) || 0)),
      currentBossRetries: Math.max(0, Math.floor(Number(value.currentBossRetries) || 0)),
      installed,
      upgradeOffer,
      difficulty: Object.hasOwn(DIFFICULTIES, value.difficulty) ? value.difficulty : 'standard',
      savedAt: Math.max(0, Math.floor(Number(value.savedAt) || Date.now()))
    };
  }

  function createDefaultSave(useSystemPreferences = false) {
    const fresh = structuredClone(DEFAULT_SAVE);
    if (useSystemPreferences) {
      fresh.settings.reduceMotion = globalThis.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches === true;
      fresh.settings.highContrast = globalThis.matchMedia?.('(prefers-contrast: more)')?.matches === true;
    }
    return fresh;
  }

  function normalizeSaveData(parsed) {
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) throw new TypeError('Sauvegarde GEARSTORM invalide.');
    const safe = createDefaultSave();
    safe.unlocked = Math.floor(clamp(Number(parsed.unlocked) || 1, 1, CAMPAIGN_BOSSES.length));
    safe.bestRush = Number.isFinite(parsed.bestRush) && parsed.bestRush > 0 ? parsed.bestRush : null;
    safe.completed = parsed.completed === true;
    if (safe.completed) safe.unlocked = CAMPAIGN_BOSSES.length;
    safe.bestForgeRush = Number.isFinite(parsed.bestForgeRush) && parsed.bestForgeRush > 0 ? parsed.bestForgeRush : null;
    safe.forgeCompleted = parsed.forgeCompleted === true;
    safe.forgeRushSnapshot = sanitizeForgeRushSnapshot(parsed.forgeRushSnapshot);
    const explicitForgeCleared = Array.isArray(parsed.forgeCleared)
      ? parsed.forgeCleared.filter(id => EXPANDED_BOSSES.some(entry => entry.id === id))
      : [];
    safe.forgeCleared = safe.forgeCompleted
      ? EXPANDED_BOSSES.map(entry => entry.id)
      : [...new Set(explicitForgeCleared)];
    safe.bestTimes = {};
    safe.bestRanks = {};
    for (const entry of BOSSES) {
      const time = Number(parsed.bestTimes?.[entry.id]);
      if (Number.isFinite(time) && time > 0) safe.bestTimes[entry.id] = time;
      const rank = parsed.bestRanks?.[entry.id];
      if (Object.hasOwn(RANK_VALUES, rank)) safe.bestRanks[entry.id] = rank;
    }
    const explicitCodex = Array.isArray(parsed.codexUnlocked)
      ? parsed.codexUnlocked.filter(id => BOSSES.some(entry => entry.id === id))
      : [];
    const migratedCodex = safe.completed
      ? CAMPAIGN_BOSSES.map(entry => entry.id)
      : CAMPAIGN_BOSSES.slice(0, Math.max(0, safe.unlocked - 1)).map(entry => entry.id);
    safe.codexUnlocked = [...new Set([...explicitCodex, ...migratedCodex, ...safe.forgeCleared])];
    safe.rushSnapshot = sanitizeRushSnapshot(parsed.rushSnapshot);
    const explicitCampaign = Array.isArray(parsed.campaignCleared)
      ? parsed.campaignCleared.filter(id => LEGACY_BOSS_IDS.has(id))
      : [];
    const inferredCampaignCount = safe.completed
      ? CAMPAIGN_BOSSES.length
      : safe.rushSnapshot
        ? Math.min(CAMPAIGN_BOSSES.length, safe.rushSnapshot.bossIndex + (safe.rushSnapshot.checkpoint === 'fight' ? 0 : 1))
        : 0;
    safe.campaignCleared = [...new Set([...explicitCampaign, ...CAMPAIGN_BOSSES.slice(0, inferredCampaignCount).map(entry => entry.id)])];
    const explicitStory = Array.isArray(parsed.storySeen) ? parsed.storySeen.filter(id => STORY_SCENE_IDS.has(id)) : [];
    const inferredStory = safe.campaignCleared.length
      ? [STORY.intro.id, STORY.prologue.id, ...safe.campaignCleared.map(id => STORY.getActByBossId(id)?.id).filter(Boolean)]
      : [];
    if (safe.completed) inferredStory.push(STORY.epilogue.id);
    safe.storySeen = [...new Set([...explicitStory, ...inferredStory])];
    safe.mastery = {};
    for (const entry of BOSSES) {
      const contracts = LEGACY_BOSS_IDS.has(entry.id)
        ? STORY.getMasteryContracts(entry.id)
        : EXPANSION_STORY?.getMasteryContracts?.(entry.id) || entry.masteryContracts || [];
      const allowed = new Set(contracts.map(contract => contract.id));
      const earned = Array.isArray(parsed.mastery?.[entry.id]) ? parsed.mastery[entry.id] : [];
      safe.mastery[entry.id] = [...new Set(earned.filter(id => allowed.has(id)))];
    }
    const settings = parsed.settings && typeof parsed.settings === 'object' ? parsed.settings : {};
    safe.settings.difficulty = Object.hasOwn(DIFFICULTIES, settings.difficulty) ? settings.difficulty : 'standard';
    for (const key of ['audio', 'shake', 'reduceMotion', 'highContrast', 'combatHints']) {
      if (typeof settings[key] === 'boolean') safe.settings[key] = settings[key];
    }
    const volume = Number(settings.volume);
    if (Number.isFinite(volume)) safe.settings.volume = clamp(volume, 0, 1);
    return safe;
  }

  function loadSave() {
    const candidates = [SAVE_KEY, PREVIOUS_SAVE_KEY, OLDER_SAVE_KEY, V2_SAVE_KEY, LEGACY_SAVE_KEY];
    for (const key of candidates) {
      let raw = null;
      try {
        raw = localStorage.getItem(key);
      } catch {
        return createDefaultSave(true);
      }
      if (!raw) continue;
      let safe = null;
      try {
        safe = normalizeSaveData(JSON.parse(raw));
      } catch {
        // Un slot corrompu ne doit pas masquer une sauvegarde antérieure encore valide.
        continue;
      }
      if (key !== SAVE_KEY) {
        try {
          localStorage.setItem(SAVE_KEY, JSON.stringify(safe));
        } catch {
          // La migration reste jouable en mémoire si le stockage v5 est plein ou interdit.
        }
      }
      return safe;
    }
    return createDefaultSave(true);
  }

  function persistSave() {
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(save));
    } catch {
      showToast('SAUVEGARDE HORS CADRE // LE CHECKPOINT N’A PAS DE DISQUE', 'Sauvegarde locale indisponible.');
      return false;
    }
    syncContinueRun();
    syncContinueForge();
    return true;
  }

  function exportSaveFile() {
    try {
      const payload = JSON.stringify(normalizeSaveData(save), null, 2);
      const url = URL.createObjectURL(new Blob([payload], { type: 'application/json' }));
      const link = document.createElement('a');
      link.href = url;
      link.download = 'gearstorm-save-v5-' + new Date().toISOString().slice(0, 10) + '.json';
      link.hidden = true;
      document.body.appendChild(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 0);
      showToast('SAUVEGARDE EXPORTÉE // LE CHECKPOINT QUITTE LE NAVIGATEUR', 'Sauvegarde exportée au format JSON version 5.');
      return true;
    } catch {
      showToast('EXPORT BLOQUÉ // LE CHECKPOINT RESTE DANS CET ÉCRAN', 'Export de sauvegarde impossible.');
      return false;
    }
  }

  async function importSaveFile(file) {
    if (!file) return false;
    try {
      if (file.size > 1024 * 1024) throw new RangeError('Fichier trop volumineux.');
      const imported = normalizeSaveData(JSON.parse(await file.text()));
      const previousSave = save;
      save = imported;
      if (!persistSave()) {
        save = previousSave;
        showToast('IMPORT ANNULÉ // LE CHECKPOINT REFUSE UNE FAUSSE ENTRÉE', 'Import valide, mais stockage local indisponible. Progression inchangée.');
        return false;
      }
      applySettings();
      buildBossGrid(selectionMode);
      buildCodex();
      buildStoryArchive();
      syncContinueRun();
      syncContinueForge();
      showToast('SAUVEGARDE IMPORTÉE // LE MENU RELIT SON CHECKPOINT', 'Sauvegarde GEARSTORM importée et validée.');
      announce('Sauvegarde GEARSTORM importée et validée.');
      return true;
    } catch {
      showToast('IMPORT REFUSÉ // CE FICHIER N’ENTRE PAS DANS LE CANON', 'Import refusé. Le fichier de sauvegarde est invalide.');
      announce('Import refusé. Le fichier de sauvegarde est invalide.');
      return false;
    }
  }

  function rebuildRunBuild(installed = []) {
    const build = createRunBuild();
    const counts = new Map();
    for (const id of installed) {
      const upgrade = UPGRADES.find(entry => entry.id === id);
      const count = counts.get(id) || 0;
      if (!upgrade || count >= upgrade.maxStacks) continue;
      upgrade.apply(build);
      build.installed.push(id);
      counts.set(id, count + 1);
    }
    return build;
  }

  function saveRushSnapshot(overrides = {}) {
    if (runMode !== 'rush') return null;
    const snapshot = sanitizeRushSnapshot({
      bossIndex: currentBossIndex,
      checkpoint: 'fight',
      score,
      rushElapsedBeforeBoss,
      rushRetryPenalty,
      runRetryCount,
      currentBossRetries,
      installed: [...runBuild.installed],
      difficulty: save.settings.difficulty,
      savedAt: Date.now(),
      ...overrides
    });
    save.rushSnapshot = snapshot;
    persistSave();
    return snapshot;
  }

  function clearRushSnapshot() {
    save.rushSnapshot = null;
    persistSave();
  }

  function saveForgeRushSnapshot(overrides = {}) {
    if (runMode !== 'forgeRush') return null;
    const snapshot = sanitizeForgeRushSnapshot({
      bossIndex: currentBossIndex,
      checkpoint: 'fight',
      completedBosses: Math.max(0, currentBossIndex - FORGE_START_INDEX),
      score,
      rushElapsedBeforeBoss,
      rushRetryPenalty,
      runRetryCount,
      currentBossRetries,
      installed: [...runBuild.installed],
      difficulty: save.settings.difficulty,
      savedAt: Date.now(),
      ...overrides
    });
    save.forgeRushSnapshot = snapshot;
    persistSave();
    return snapshot;
  }

  function clearForgeRushSnapshot() {
    save.forgeRushSnapshot = null;
    persistSave();
  }

  function forgeNarrativeUnlocked() {
    return save.completed || QA_ALLOWED;
  }

  function syncContinueForge() {
    const button = document.querySelector('#continue-forge');
    const startButton = document.querySelector('#forge-rush-start');
    const summary = document.querySelector('#forge-run-summary');
    const progress = document.querySelector('#forge-wave-progress');
    const snapshot = sanitizeForgeRushSnapshot(save.forgeRushSnapshot);
    const narrativeUnlocked = forgeNarrativeUnlocked();
    if (button) {
      button.hidden = !snapshot;
      button.disabled = !snapshot || !narrativeUnlocked;
      const title = button.querySelector('.button-copy strong');
      const detail = button.querySelector('.button-copy small, [data-forge-continue-detail]');
      if (title) title.textContent = !narrativeUnlocked
        ? 'Forge en attente de la campagne'
        : snapshot?.checkpoint === 'ending'
          ? 'Relire la fin Forge'
          : snapshot?.checkpoint === 'upgrade' ? 'Reprendre l’Atelier' : 'Reprendre la Forge';
      if (detail && snapshot) detail.textContent = !narrativeUnlocked
        ? 'Libère les six districts ; ce point de reprise sera conservé.'
        : snapshot.checkpoint === 'ending'
          ? 'Les vingt-quatre services ont été restitués.'
          : snapshot.checkpoint === 'upgrade'
            ? 'L’offre conservée précède FORGE ' + String(snapshot.bossIndex + 2).padStart(2, '0')
            : bossCatalogueNumber(snapshot.bossIndex) + ' · ' + BOSSES[snapshot.bossIndex].name + ' attend sa reprise.';
    }
    if (startButton) {
      startButton.disabled = !narrativeUnlocked;
      startButton.setAttribute('aria-disabled', String(!narrativeUnlocked));
      if (startButton.firstChild) startButton.firstChild.textContent = narrativeUnlocked
        ? (save.forgeCompleted ? 'Retraverser le Circuit Forge ' : 'Lancer le Circuit Forge ')
        : 'Terminer la campagne pour ouvrir la Forge ';
    }
    const liveIndex = runMode === 'forgeRush' ? currentBossIndex : snapshot?.bossIndex;
    const entry = Number.isInteger(liveIndex) ? BOSSES[liveIndex] : null;
    const completed = runMode === 'forgeRush'
      ? Math.max(0, liveIndex - FORGE_START_INDEX + (['result', 'upgrade', 'ending'].includes(state) ? 1 : 0))
      : snapshot?.completedBosses || save.forgeCleared.length;
    if (summary) summary.textContent = !narrativeUnlocked
      ? 'Suite canonique verrouillée : libère les six districts. Les 30 simulations du Catalogue restent jouables.'
      : save.forgeCompleted
        ? 'Circuit Forge terminé · meilleure traversée ' + formatTime(save.bestForgeRush)
        : snapshot
          ? completed + ' / 24 machines stabilisées · ' + snapshot.installed.length + ' modules conservés'
          : 'Après l’abolition de la Couronne : 24 machines, quatre anneaux et autant de services à restituer.';
    if (progress) {
      if (!narrativeUnlocked) {
        progress.textContent = 'SUITE CANONIQUE VERROUILLÉE // SIX DISTRICTS À LIBÉRER';
        progress.setAttribute('aria-valuenow', '0');
      } else {
        const wave = entry?.wave || Math.min(4, Math.floor(completed / 6) + 1);
        const nextForgeIndex = Math.min(FORGE_FINAL_INDEX, FORGE_START_INDEX + completed);
        progress.textContent = 'ANNEAU ' + wave + ' / 4 // PROCHAINE MACHINE ' + bossCatalogueNumber(nextForgeIndex);
        progress.setAttribute('aria-valuenow', String(completed));
      }
      progress.setAttribute('aria-valuemax', '24');
    }
  }

  function syncContinueRun() {
    const button = document.querySelector('#continue-run');
    if (!button) return;
    const snapshot = sanitizeRushSnapshot(save.rushSnapshot);
    button.hidden = !snapshot;
    button.disabled = !snapshot;
    if (!snapshot) return;
    const machine = String(snapshot.bossIndex + 1).padStart(2, '0');
    const title = button.querySelector('.button-copy strong');
    const detail = document.querySelector('#continue-run-detail');
    const labels = {
      fight: ['Reprendre le direct', 'La barre de vie de MACHINE ' + machine + ' revient au début'],
      interlude: ['Lire la scène suivante', 'La transmission après MACHINE ' + machine + ' attend hors combat'],
      upgrade: ['Reprendre l’Atelier', 'L’offre figée précède MACHINE ' + String(Math.min(CAMPAIGN_BOSSES.length, snapshot.bossIndex + 2)).padStart(2, '0')]
    };
    const [heading, copy] = labels[snapshot.checkpoint] || labels.fight;
    if (title) title.textContent = heading;
    if (detail) detail.textContent = copy;
  }

  function resumeRushSnapshot() {
    const snapshot = sanitizeRushSnapshot(save.rushSnapshot);
    if (!snapshot) {
      syncContinueRun();
      return false;
    }
    unlockAudio();
    runMode = 'rush';
    currentBossIndex = snapshot.bossIndex;
    score = snapshot.score;
    scoreAtBossStart = score;
    damageTaken = 0;
    rushStart = performance.now() / 1000;
    rushElapsedBeforeBoss = snapshot.rushElapsedBeforeBoss;
    rushRetryPenalty = snapshot.rushRetryPenalty;
    runRetryCount = snapshot.runRetryCount;
    currentBossRetries = snapshot.currentBossRetries;
    lastBossRetryPenalty = currentBossRetries * RUSH_RETRY_PENALTY;
    lastUpgradeOffer = snapshot.checkpoint === 'upgrade' ? [...snapshot.upgradeOffer] : [];
    runBuild = rebuildRunBuild(snapshot.installed);
    save.settings.difficulty = snapshot.difficulty;
    applySettings();
    if (snapshot.checkpoint === 'interlude') {
      showInterlude(snapshot.bossIndex);
      showToast('CHECKPOINT RELU // LA TRANSMISSION REPREND SA LIGNE', 'Circuit restauré. Transmission sécurisée.');
    } else if (snapshot.checkpoint === 'upgrade') {
      showUpgradeSelection();
      showToast('CHECKPOINT RELU // L’ATELIER GARDE LA MÊME OFFRE', 'Circuit restauré. Choisissez le prochain module.');
    } else {
      startFight(snapshot.bossIndex, { preserveRetries: true });
      showToast('CHECKPOINT RELU // MACHINE ' + String(snapshot.bossIndex + 1).padStart(2, '0') + ' REMET SA BARRE DE VIE', 'Circuit restauré. Machine ' + String(snapshot.bossIndex + 1).padStart(2, '0') + '.');
    }
    return true;
  }

  function resumeForgeRushSnapshot() {
    if (!forgeNarrativeUnlocked()) {
      selectionMode = 'forge';
      buildBossGrid('forge');
      showScreen('boss-select-screen');
      showToast('CHRONOLOGIE VERROUILLÉE // SIX DISTRICTS D’ABORD', 'Le point de reprise Forge est conservé ; le Catalogue reste libre en simulation.');
      return false;
    }
    const snapshot = sanitizeForgeRushSnapshot(save.forgeRushSnapshot);
    if (!snapshot) {
      syncContinueForge();
      return false;
    }
    unlockAudio();
    runMode = 'forgeRush';
    selectionMode = 'forge';
    currentBossIndex = snapshot.bossIndex;
    score = snapshot.score;
    scoreAtBossStart = score;
    damageTaken = 0;
    rushStart = performance.now() / 1000;
    rushElapsedBeforeBoss = snapshot.rushElapsedBeforeBoss;
    rushRetryPenalty = snapshot.rushRetryPenalty;
    runRetryCount = snapshot.runRetryCount;
    currentBossRetries = snapshot.currentBossRetries;
    lastBossRetryPenalty = currentBossRetries * RUSH_RETRY_PENALTY;
    lastUpgradeOffer = snapshot.checkpoint === 'upgrade' ? [...snapshot.upgradeOffer] : [];
    runBuild = rebuildRunBuild(snapshot.installed);
    save.settings.difficulty = snapshot.difficulty;
    applySettings();
    if (snapshot.checkpoint === 'ending') {
      showForgeEnding(snapshot.rushElapsedBeforeBoss);
      showToast('CHECKPOINT FORGE RELU // LA FIN RESTE ACQUISE', 'Circuit Forge restauré. Conclusion sécurisée.');
    } else if (snapshot.checkpoint === 'upgrade' && snapshot.bossIndex < FORGE_FINAL_INDEX) {
      showUpgradeSelection();
      showToast('CHECKPOINT FORGE RELU // L’ATELIER NE REROLL PAS', 'Circuit Forge restauré. Choisissez le prochain module.');
    } else {
      startFight(snapshot.bossIndex, { preserveRetries: true });
      const forgeNumber = bossCatalogueNumber(snapshot.bossIndex);
      showToast('CHECKPOINT FORGE RELU // ' + forgeNumber + ' · ' + BOSSES[snapshot.bossIndex].name + ' RECHARGE SON PATTERN', 'Circuit Forge restauré. ' + forgeNumber + ', ' + BOSSES[snapshot.bossIndex].name + '.');
    }
    syncContinueForge();
    return true;
  }

  function getForgeRunState() {
    const snapshot = sanitizeForgeRushSnapshot(save.forgeRushSnapshot);
    const live = runMode === 'forgeRush';
    const bossIndex = live ? currentBossIndex : snapshot?.bossIndex ?? null;
    const entry = Number.isInteger(bossIndex) ? BOSSES[bossIndex] : null;
    const completed = live
      ? save.forgeCompleted && !snapshot && ['ending', 'menu'].includes(state)
        ? EXPANDED_BOSSES.length
        : Math.max(0, bossIndex - FORGE_START_INDEX + (['result', 'upgrade', 'ending'].includes(state) ? 1 : 0))
      : snapshot?.completedBosses ?? (save.forgeCompleted ? EXPANDED_BOSSES.length : save.forgeCleared.length);
    return {
      mode: live || snapshot ? 'forgeRush' : null,
      runtimeMode: runMode,
      active: live && ['fight', 'result', 'upgrade'].includes(state),
      index: Number.isInteger(bossIndex) ? bossIndex - FORGE_START_INDEX : null,
      bossIndex,
      bossId: entry?.id || null,
      forgeIndex: Number.isInteger(bossIndex) ? bossIndex - FORGE_START_INDEX : null,
      wave: entry?.wave || null,
      completed: clamp(completed, 0, EXPANDED_BOSSES.length),
      finished: save.forgeCompleted === true,
      cleared: [...save.forgeCleared],
      snapshot
    };
  }

  function unlockCodexEntry(id) {
    if (!BOSSES.some(entry => entry.id === id) || save.codexUnlocked.includes(id)) return false;
    save.codexUnlocked.push(id);
    persistSave();
    buildCodex();
    return true;
  }

  function recordBestRank(id, rank) {
    if (!Object.hasOwn(RANK_VALUES, rank)) return false;
    const previous = save.bestRanks[id];
    if (previous && RANK_VALUES[previous] >= RANK_VALUES[rank]) return false;
    save.bestRanks[id] = rank;
    persistSave();
    return true;
  }

  function markStorySeen(id) {
    if (!id || save.storySeen.includes(id)) return false;
    save.storySeen.push(id);
    persistSave();
    buildStoryArchive();
    return true;
  }

  function createStoryLine(line) {
    const block = document.createElement('blockquote');
    block.className = 'story-line';
    block.dataset.channel = line.channel || 'radio';
    block.dataset.speaker = line.speaker;
    const speaker = document.createElement('strong');
    speaker.textContent = line.speaker;
    const copy = document.createElement('span');
    copy.textContent = line.text;
    block.append(speaker, copy);
    return block;
  }

  function renderStoryScene(scene, options = {}) {
    const dialogue = document.querySelector('#story-dialogue');
    const summary = document.querySelector('#story-summary');
    const consequence = document.querySelector('#story-consequence');
    const panel = document.querySelector('#story-panel');
    if (!scene || !dialogue || !summary || !consequence || !panel) return false;
    document.querySelector('#story-kicker').textContent = options.kicker || 'ARCHIVE NARRATIVE // LIGNE M-0';
    document.querySelector('#story-chapter').textContent = scene.chapter || 'TRANSMISSION';
    document.querySelector('#story-status').textContent = options.status || 'SIGNAL RESTAURÉ';
    document.querySelector('#story-title').textContent = scene.title + (options.titleSuffix || '');
    document.querySelector('#story-location').textContent = options.location || 'Réseau civil du Circuit';
    summary.textContent = (scene.summary || '') + (options.metaSummary || '');
    dialogue.textContent = '';
    for (const line of scene.lines || []) dialogue.appendChild(createStoryLine(line));
    consequence.textContent = options.consequence || '';
    consequence.hidden = !options.consequence;
    panel.dataset.tone = options.tone || 'signal';
    const storyScreen = document.querySelector('#story-screen');
    if (storyScreen) storyScreen.dataset.narrativeScene = options.art || 'intro';
    currentStoryKey = options.storyKey || scene.id;
    pendingStoryAction = options.onContinue || null;
    if (storyContinue) storyContinue.textContent = options.continueLabel || 'Continuer';
    if (storyBack) storyBack.hidden = options.allowBack === false;
    showScreen('story-screen');
    announce((scene.chapter || 'Transmission') + '. ' + scene.title + '.');
    return true;
  }

  function showIntroStory() {
    return renderStoryScene(STORY.intro, {
      art: 'intro',
      titleSuffix: ' — Cassian croit déjà tenir le cadre',
      metaSummary: ' Pourtant, M-0 court hors champ et refuse encore sa version des faits.',
      kicker: 'INTRODUCTION // ÉMISSION PERMANENTE',
      status: 'LIGNE M-0',
      location: 'Circuit central · Minuit réseau',
      storyKey: STORY.intro.id,
      continueLabel: 'Couper le direct · suivre M-0 →',
      consequence: 'Six relais civils répondent encore à la ligne manuelle de Riva. Chacun rouvrira le district suivant.',
      allowBack: true,
      onContinue: () => {
        markStorySeen(STORY.intro.id);
        pendingStoryAction = null;
        showPrologueStory();
      }
    });
  }

  function showPrologueStory() {
    const scene = STORY.prologue;
    const dialogue = document.querySelector('#prologue-dialogue');
    if (!scene || !dialogue) return false;
    document.querySelector('#prologue-kicker').textContent = scene.kicker;
    document.querySelector('#prologue-chapter').textContent = scene.chapter;
    document.querySelector('#prologue-title').textContent = scene.title;
    document.querySelector('#prologue-summary').textContent = scene.summary;
    document.querySelector('#prologue-objective').textContent = scene.objective;
    document.querySelector('#prologue-method').textContent = scene.method;
    dialogue.replaceChildren(...(scene.lines || []).map(createStoryLine));
    const startButton = document.querySelector('#prologue-start');
    if (startButton) startButton.firstChild.textContent = 'Suivre M-0 · Affronter Rivet Rex ';
    currentStoryKey = scene.id;
    pendingStoryAction = null;
    showScreen('prologue-screen');
    announce(scene.chapter + '. ' + scene.title + '. ' + scene.objective);
    return true;
  }

  function showInterlude(index) {
    const act = STORY.getActByOrder(index + 1);
    if (!act) return false;
    const scene = {
      id: act.id,
      chapter: 'INTERLUDE ' + String(index + 1).padStart(2, '0'),
      title: act.district + ' · commande rendue',
      summary: act.districtConsequence,
      lines: act.interlude
    };
    return renderStoryScene(scene, {
      titleSuffix: ' — le district reprend sa voix',
      metaSummary: '',
      kicker: 'DISTRICT RESTAURÉ // LIGNE M-0',
      status: act.civicFunction,
      location: act.district,
      storyKey: act.id,
      continueLabel: index === CAMPAIGN_BOSSES.length - 1 ? 'Rejoindre les six équipes →' : 'Rejoindre l’Atelier mobile →',
      consequence: act.restoration + ' · M-0 scelle cette restitution dans les archives partagées.',
      tone: index === CAMPAIGN_BOSSES.length - 1 ? 'resolution' : 'district',
      allowBack: false,
      onContinue: () => {
        markStorySeen(act.id);
        pendingStoryAction = null;
        if (index === CAMPAIGN_BOSSES.length - 1) showEnding();
        else {
          saveRushSnapshot({ checkpoint: 'upgrade' });
          showUpgradeSelection();
        }
      }
    });
  }

  function buildStoryArchive() {
    if (!storyArchive) return;
    const entries = [
      { ...STORY.intro },
      { ...STORY.prologue, consequence: STORY.prologue.objective },
      ...STORY.acts.map((act, index) => ({
        id: act.id,
        chapter: 'INTERLUDE ' + String(index + 1).padStart(2, '0'),
        title: act.district + ' · commande rendue',
        summary: act.districtConsequence,
        lines: act.interlude,
        consequence: act.restoration
      })),
      { ...STORY.epilogue, consequence: STORY.epilogue.rivaChoice }
    ];
    storyArchive.textContent = '';
    let restored = 0;

    for (const entry of entries) {
      const unlocked = save.storySeen.includes(entry.id);
      if (unlocked) restored += 1;
      const item = document.createElement('li');
      item.dataset.state = unlocked ? 'available' : 'locked';

      if (!unlocked) {
        const chapter = document.createElement('span');
        chapter.textContent = 'SIGNAL CHIFFRÉ';
        const title = document.createElement('strong');
        title.textContent = 'Transmission encore hors de portée';
        item.append(chapter, title);
        storyArchive.appendChild(item);
        continue;
      }

      const details = document.createElement('details');
      const heading = document.createElement('summary');
      const chapter = document.createElement('span');
      chapter.textContent = entry.chapter;
      const title = document.createElement('strong');
      title.textContent = entry.title;
      heading.append(chapter, title);
      heading.setAttribute('aria-label', 'Relire ' + entry.chapter + ' · ' + entry.title);
      details.appendChild(heading);

      if (entry.summary) {
        const summary = document.createElement('p');
        summary.className = 'story-archive-summary';
        summary.textContent = entry.summary;
        details.appendChild(summary);
      }

      if (entry.lines?.length) {
        const dialogue = document.createElement('div');
        dialogue.className = 'story-archive-dialogue';
        dialogue.replaceChildren(...entry.lines.map(createStoryLine));
        details.appendChild(dialogue);
      }

      if (entry.consequence) {
        const consequence = document.createElement('p');
        consequence.className = 'story-archive-consequence';
        consequence.textContent = entry.consequence;
        details.appendChild(consequence);
      }

      item.appendChild(details);
      storyArchive.appendChild(item);
    }

    if (storyArchiveProgress) {
      storyArchiveProgress.textContent = restored + ' / ' + entries.length
        + ' transmissions · de l’introduction à l’épilogue';
    }
  }

  function showRadioExchange(title, lines, duration = 5.2) {
    if (!radioComms || !radioSpeaker || !radioLine || !lines?.length) return;
    radioSpeaker.textContent = title;
    radioLine.textContent = lines.map(line => line.speaker + ' — ' + line.text).join('  ·  ');
    radioComms.hidden = false;
    commsTimer = duration;
  }

  function hideRadioExchange() {
    commsTimer = 0;
    if (radioComms) radioComms.hidden = true;
  }

  function phaseNarrative(phase) {
    if (isExpandedBoss()) {
      const profile = EXPANSION_STORY?.getBossById?.(boss.data.id);
      const title = profile?.phaseTitles?.[phase - 1];
      const voice = profile?.phaseLines?.[phase - 1];
      if (!title || !voice) return null;
      return {
        toPhase: phase,
        title,
        lines: [
          { speaker: 'Riva', text: voice, channel: 'maintenance' },
          { speaker: 'M-0', text: `RÈGLE ACTIVE · ${profile.objective}`, channel: 'tactical' }
        ]
      };
    }
    if (runMode !== 'rush') return null;
    const act = STORY.getActByOrder(currentBossIndex + 1);
    const transition = act?.phaseTransitions?.find(entry => entry.toPhase === phase);
    if (!transition) return null;
    return { ...transition, title: act.phaseTitles?.[phase - 1] || transition.title };
  }

  function combatLabel(stateName, fallback, includePhase = false) {
    const label = STORY.getCombatLabel?.(boss?.data?.id, stateName) || fallback;
    return includePhase && boss ? 'PHASE ' + boss.phase + ' · ' + label : label;
  }

  function syncCampaignUi() {
    const liberated = save.campaignCleared.filter(id => LEGACY_BOSS_IDS.has(id)).length;
    const next = CAMPAIGN_BOSSES.find(entry => !save.campaignCleared.includes(entry.id));
    const campaignProgress = document.querySelector('#campaign-progress');
    const campaignNext = document.querySelector('#campaign-next');
    const labProgress = document.querySelector('#lab-progress');
    const startButton = document.querySelector('#start-rush');
    if (campaignProgress) campaignProgress.textContent = liberated + ' / ' + CAMPAIGN_BOSSES.length + ' districts libérés · le compteur assume la progression';
    if (campaignNext) {
      campaignNext.textContent = next
        ? 'Prochaine scène jouable : ' + next.arena + ' · ' + next.name
        : 'Circuit libéré · six commandes civiles · aucun boss caché';
    }
    if (startButton) startButton.firstChild.textContent = save.completed ? 'Rejouer sans annuler la fin ' : 'Relancer le prologue · Nouveau Circuit ';
    if (labProgress) {
      const files = save.codexUnlocked.length;
      labProgress.textContent = save.unlocked + ' / ' + CAMPAIGN_BOSSES.length + ' boss de campagne relus · ' + BOSSES.length + ' profils jouables · ' + files + ' dossier' + (files > 1 ? 's' : '') + ' que le Codex accepte de montrer.';
    }
  }

  function buildForgeCodex() {
    const grid = document.querySelector('#forge-codex-grid');
    const progress = document.querySelector('#forge-codex-progress');
    if (!grid) return;
    const section = document.querySelector('#forge-codex-section');
    let ringOverview = section?.querySelector('.forge-ring-overview');
    if (section && !ringOverview) {
      ringOverview = document.createElement('div');
      ringOverview.className = 'forge-ring-overview';
      section.insertBefore(ringOverview, grid);
    }
    if (ringOverview) {
      const ringFragment = document.createDocumentFragment();
      for (const wave of Array.from(EXPANSION_STORY?.waves || [])) {
        const ring = document.createElement('article');
        const title = document.createElement('h4');
        const premise = document.createElement('p');
        const revelation = document.createElement('p');
        const waveBossIds = wave.bossCodes
          .map(code => EXPANSION_STORY?.getBossById?.(code)?.id)
          .filter(Boolean);
        const waveCompleted = waveBossIds.length === wave.bossCodes.length
          && waveBossIds.every(id => save.forgeCleared.includes(id));
        title.textContent = wave.title;
        premise.textContent = wave.premise;
        revelation.className = 'ring-revelation';
        revelation.textContent = waveCompleted
          ? 'RÉVÉLATION RESTAURÉE · ' + wave.revelation
          : 'RÉVÉLATION CHIFFRÉE · stabilise les six services de cet anneau.';
        ring.dataset.state = waveCompleted ? 'revealed' : 'encrypted';
        ring.append(title, premise, revelation);
        ringFragment.appendChild(ring);
      }
      ringOverview.replaceChildren(ringFragment);
    }
    const profiles = Array.from(EXPANSION_STORY?.bosses || []);
    const unlockedIds = new Set(save.codexUnlocked);
    let unlockedCount = 0;
    const fragment = document.createDocumentFragment();

    for (const profile of profiles) {
      const unlocked = unlockedIds.has(profile.id);
      if (unlocked) unlockedCount += 1;
      const entry = BOSSES.find(candidate => candidate.id === profile.id);
      const earned = save.mastery[profile.id] || [];
      const card = document.createElement('article');
      card.className = 'forge-codex-card';
      card.dataset.bossId = profile.id;
      card.dataset.state = unlocked ? 'available' : 'encrypted';

      const header = document.createElement('header');
      const number = document.createElement('span');
      const status = document.createElement('strong');
      const catalogueIndex = BOSSES.findIndex(candidate => candidate.id === profile.id);
      number.textContent = bossCatalogueNumber(catalogueIndex) + ' · ANNEAU ' + profile.wave;
      status.textContent = unlocked ? 'RELU' : 'CHIFFRÉ';
      header.append(number, status);

      const title = document.createElement('h3');
      title.textContent = profile.codex?.title || entry?.name || profile.id;
      const arena = document.createElement('p');
      arena.textContent = profile.district + ' · ' + profile.civicFunction;
      card.append(header, title, arena);

      if (unlocked) {
        const meta = document.createElement('p');
        meta.className = 'meta-line';
        meta.textContent = profile.metaLine;
        const details = document.createElement('dl');
        for (const [label, value] of [
          ['Origine', profile.codex?.origin],
          ['Détournement', profile.codex?.hijack],
          ['Lecture', profile.codex?.reading],
          ['Impact', profile.codex?.impact],
          ['Journal de Riva', profile.journal]
        ]) {
          const term = document.createElement('dt');
          const copy = document.createElement('dd');
          term.textContent = label;
          copy.textContent = value || 'Donnée indisponible.';
          details.append(term, copy);
        }
        const record = document.createElement('p');
        record.className = 'codex-record';
        record.textContent = 'Record relu : rang ' + (save.bestRanks[profile.id] || '—')
          + ' · ' + formatTime(save.bestTimes[profile.id])
          + ' · Maîtrise ' + earned.length + '/' + (profile.masteryContracts?.length || 3);
        const transmission = document.createElement('p');
        transmission.className = 'codex-transmission';
        transmission.textContent = 'Transmission restaurée · ' + (profile.interlude || [])
          .map(line => line.speaker + ' — ' + line.text).join('  ·  ');
        card.append(meta, transmission, details, record);
      } else {
        const lock = document.createElement('p');
        lock.className = 'meta-line';
        lock.textContent = 'Dossier chiffré · cette règle attend encore sa victoire à l’écran.';
        card.append(lock);
      }
      fragment.appendChild(card);
    }

    grid.replaceChildren(fragment);
    if (progress) {
      progress.textContent = unlockedCount + ' / ' + profiles.length
        + ' dossiers relus · ' + (profiles.length - unlockedCount) + ' règles encore hors cadre';
    }
  }
  function buildCodex() {
    const grid = document.querySelector('#codex-grid');
    const progress = document.querySelector('#codex-progress');
    const meter = document.querySelector('#codex-progress-meter');
    const unlockedCount = save.codexUnlocked.filter(id => LEGACY_BOSS_IDS.has(id)).length;
    if (progress) progress.textContent = unlockedCount + ' / ' + CAMPAIGN_BOSSES.length + ' machines identifiées · la campagne relit ses propres règles';
    if (meter) {
      meter.max = CAMPAIGN_BOSSES.length;
      meter.value = unlockedCount;
      meter.textContent = unlockedCount + ' sur ' + CAMPAIGN_BOSSES.length;
    }
    if (grid) {
      CAMPAIGN_BOSSES.forEach((entry, index) => {
        const card = grid.querySelector('[data-boss-id="' + entry.id + '"]');
        if (!card) return;
        const act = STORY.getActByOrder(index + 1);
        const unlocked = save.codexUnlocked.includes(entry.id);
        const earned = save.mastery[entry.id] || [];
        card.dataset.state = unlocked ? 'available' : 'encrypted';
        card.dataset.bestRank = save.bestRanks[entry.id] || '';
        card.classList.toggle('locked', !unlocked);
        const status = card.querySelector('header strong');
        if (status) status.textContent = unlocked ? 'ACCESSIBLE' : 'CHIFFRÉE';
        const lockCopy = card.querySelector('.codex-lock-copy');
        if (lockCopy && act) lockCopy.textContent = unlocked ? act.codex.origin : act.civicFunction + ' · données chiffrées par Voltério.';
        const details = card.querySelector('.codex-details');
        if (details && act) {
          details.hidden = !unlocked;
          details.innerHTML = '<dt>Origine</dt><dd>' + act.codex.origin + '</dd>'
            + '<dt>Détournement</dt><dd>' + act.codex.hijack + '</dd>'
            + '<dt>Lecture</dt><dd>' + act.codex.reading + '</dd>'
            + '<dt>Impact</dt><dd>' + act.codex.impact + '</dd>'
            + '<dt>Mémoire M-0</dt><dd>' + act.memoryFragment + '</dd>'
            + '<dt>Journal de Riva</dt><dd>' + act.rivaJournal + '</dd>';
        }
        let record = card.querySelector('.codex-record');
        if (!record) {
          record = document.createElement('p');
          record.className = 'codex-record';
          card.appendChild(record);
        }
        record.hidden = !unlocked;
        if (unlocked) {
          record.textContent = 'Record : rang ' + (save.bestRanks[entry.id] || '—') + ' · ' + formatTime(save.bestTimes[entry.id])
            + ' · Maîtrise ' + earned.length + '/' + (act?.masteryContracts.length || 3);
        }
      });
    }
    buildForgeCodex();
    buildStoryArchive();
    syncCampaignUi();
  }

  function routeLaunchMode() {
    if (requestedLaunchMode === 'rush') {
      showIntroStory();
      return 'story-screen';
    }
    if (requestedLaunchMode === 'forgeRush') {
      selectionMode = 'forge';
      buildBossGrid('forge');
      showScreen('boss-select-screen');
      return 'boss-select-screen';
    }
    if (requestedLaunchMode === 'practice' || requestedLaunchMode === 'forge') {
      selectionMode = requestedLaunchMode;
      buildBossGrid(selectionMode);
      showScreen('boss-select-screen');
      return 'boss-select-screen';
    }
    return null;
  }

  function applySettings() {
    document.body.classList.toggle('reduce-motion', save.settings.reduceMotion);
    document.body.classList.toggle('high-contrast', save.settings.highContrast);
    document.getElementById('difficulty-select').value = save.settings.difficulty;
    document.getElementById('audio-toggle').checked = save.settings.audio;
    document.getElementById('shake-toggle').checked = save.settings.shake;
    document.getElementById('motion-toggle').checked = save.settings.reduceMotion;
    document.getElementById('contrast-toggle').checked = save.settings.highContrast;
    const hintsToggle = document.querySelector('#hints-toggle');
    if (hintsToggle) hintsToggle.checked = save.settings.combatHints;
    if (combatHint) combatHint.hidden = !save.settings.combatHints;
    if (volumeControl) {
      const max = Number(volumeControl.max || 1);
      volumeControl.value = String(max > 1 ? Math.round(save.settings.volume * max) : save.settings.volume);
      if (volumeOutput) volumeOutput.textContent = Math.round(save.settings.volume * 100) + ' %';
    }
  }

  function showScreen(id) {
    const source = document.querySelector('.screen.active');
    const target = document.getElementById(id);
    const activeElement = document.activeElement instanceof HTMLElement && source?.contains(document.activeElement)
      ? document.activeElement
      : null;
    const returnTarget = source?.id ? screenOpeners.get(source.id) : null;
    const isReturning = returnTarget instanceof HTMLElement && target?.contains(returnTarget);
    if (!isReturning && target && activeElement instanceof HTMLElement) {
      // Une navigation avant appartient au contrôle réellement activé dans l'écran courant.
      // Ne propage jamais l'ouvreur historique d'un écran intermédiaire (pause -> titre).
      screenOpeners.set(id, activeElement);
    }
    screens.forEach(screen => {
      const active = screen.id === id;
      screen.classList.toggle('active', active);
      screen.inert = !active;
      screen.setAttribute('aria-hidden', String(!active));
    });
    requestAnimationFrame(() => {
      const active = document.getElementById(id);
      if (isReturning && returnTarget instanceof HTMLElement && !returnTarget.hidden && !returnTarget.hasAttribute('disabled')) {
        screenOpeners.delete(source.id);
        returnTarget.focus({ preventScroll: true });
        return;
      }
      const focused = active?.querySelector('button:not(:disabled):not([hidden]), select:not(:disabled), input:not(:disabled)');
      focused?.focus({ preventScroll: true });
    });
  }

  function closeScreens() {
    screens.forEach(screen => {
      screen.classList.remove('active');
      screen.inert = true;
      screen.setAttribute('aria-hidden', 'true');
    });
  }

  function announce(message) {
    if (!announcer) return;
    announcer.textContent = '';
    requestAnimationFrame(() => { announcer.textContent = message; });
  }

  function setTextIfChanged(element, value) {
    if (element && element.textContent !== value) element.textContent = value;
  }

  function syncAccessibleHud() {
    if (!player || !boss || state !== 'fight') return;
    setTextIfChanged(mobilePlayerHp, player.hp + ' / ' + player.maxHp + (player.barrier > 0 ? ' · Égide ' + player.barrier : ''));
    setTextIfChanged(mobileBossHp, Math.ceil(100 * boss.hp / boss.maxHp) + ' % · P' + boss.phase);
    setTextIfChanged(mobileOverload, Math.round(player.overloadTime > 0 ? 100 : player.overload) + ' %');
    syncCombatGuidance();
  }

  function syncCombatGuidance() {
    if (!player || !boss || state !== 'fight') return;
    const expansionStory = EXPANSION_STORY?.getBossById?.(boss.data.id);
    const runtime = boss.runtime;
    const family = runtime?.family;
    let objective = expansionStory?.objective || 'Survis au cycle et attends l’ouverture du noyau.';
    if (boss.state === 'intro') objective = expansionStory
      ? expansionStory.shortIntro + ' · OBJECTIF · ' + expansionStory.objective
      : 'Analyse la machine et prépare ton premier déplacement.';
    else if (boss.state === 'phaseTransition' || boss.state === 'phaseEnter') objective = 'Transformation en cours · les projectiles sont neutralisés.';
    else if (boss.state === 'telegraph') objective = 'TÉLÉGRAPHE · lis la forme et gagne la zone sûre.';
    else if (boss.state === 'active' && boss.runtime) objective = boss.attackLabel + ' · progression ' + boss.runtime.mechanicProgress + '/' + boss.runtime.mechanicTarget + '.';
    else if (boss.vulnerable) objective = 'NOYAU OUVERT · concentre tirs et ruée sur la cible lumineuse.';
    else if (['slamTelegraph', 'crashTelegraph', 'dashTelegraph'].includes(boss.state)) objective = 'DANGER IMMINENT · quitte la zone marquée.';
    else if (boss.hidden) objective = 'Machine enfouie · repère le cercle d’éruption.';

    let mechanic = '';
    if (runtime && ['telegraph', 'active'].includes(boss.state)) {
      if (family === 'vertical-lane') {
        const laneNames = ['gauche', 'centre', 'droite'];
        mechanic = 'VOIE ' + (runtime.safeLane + 1) + ' SÛRE · ' + laneNames[runtime.safeLane] + ' · les zones hachurées vont frapper.';
        objective = mechanic;
      } else if (family === 'puzzle-endgame' && runtime.puzzleSequence?.length) {
        const shapeName = id => ['carré', 'cercle', 'triangle'][id % 3];
        const sequence = runtime.puzzleSequence.map(id => shapeName(id) + ' ' + (id + 1)).join(' → ');
        const expected = runtime.puzzleSequence[runtime.puzzleIndex];
        mechanic = expected === undefined
          ? 'SÉQUENCE RÉSOLUE · le noyau peut s’ouvrir.'
          : 'PROCHAINE FORME · ' + shapeName(expected) + ' ' + (expected + 1) + ' · ordre ' + sequence + '.';
        objective = mechanic;
      } else if (family === 'gravity-weather') {
        const environment = String(runtime.environment || 'stable').replaceAll('-', ' ').toUpperCase();
        mechanic = 'ENVIRONNEMENT · ' + environment + ' · les flèches indiquent la poussée.';
      }
    }
    if (boss.data.id === 'orbital-famine' && runtime) {
      const reserve = Math.round(clamp(Number.isFinite(runtime.resource) ? runtime.resource : 100, 0, 100));
      mechanic = 'RÉSERVE ORBITALE · ' + reserve + ' % · ' + (reserve <= 25 ? 'SEUIL CRITIQUE, vise un condensateur.' : 'marge disponible.');
      objective = mechanic;
    }

    const bossHints = {
      rammer: 'Écarte-toi de sa verticale, saute l’onde puis contre-attaque.',
      kraken: 'Lis les bandes laser avant de choisir saut ou ruée.',
      drill: 'Sors du cercle orange avant l’éruption magnétique.',
      mantis: 'Change de hauteur pendant le tracé chrono.',
      cyclotron: 'Reste mobile : les mines ferment progressivement l’arène.',
      omega: 'Traite chaque grille comme un rythme : observe, puis traverse.'
    };
    let hint = bossHints[boss.data.id] || BOSS_REGISTRY?.families?.[family]?.loop || boss.data.fairnessRule;
    if (player.overload >= 100 && player.overloadTime <= 0) hint = 'SURCHARGE PRÊTE · L / X pour amplifier les dégâts et dissiper les menaces.';
    else if (player.barrier > 0) hint = 'Égide active : ' + player.barrier + ' impact' + (player.barrier > 1 ? 's' : '') + ' absorbé' + (player.barrier > 1 ? 's' : '') + '.';

    setTextIfChanged(combatObjective, objective);
    if (combatMechanic) {
      combatMechanic.hidden = !mechanic;
      if (mechanic) setTextIfChanged(combatMechanic, mechanic);
    }
    if (combatHint) {
      combatHint.hidden = !save.settings.combatHints;
      if (save.settings.combatHints) setTextIfChanged(combatHint, hint);
    }
  }
  function showToast(message, announcement = message) {
    toast.textContent = message;
    toast.classList.add('visible');
    toastTimer = 2.3;
    announce(announcement);
  }

  function hideToast() {
    toastTimer = 0;
    toast.classList.remove('visible');
    toast.textContent = '';
  }

  function formatTime(seconds) {
    if (!Number.isFinite(seconds)) return '—';
    const minutes = Math.floor(seconds / 60);
    const sec = Math.floor(seconds % 60).toString().padStart(2, '0');
    const centi = Math.floor((seconds % 1) * 100).toString().padStart(2, '0');
    return `${minutes}:${sec}.${centi}`;
  }

  function wallNow() { return performance.now() / 1000; }
  function resetFightClock() {
    fightClockStartedAt = 0;
    fightClockAccumulated = 0;
    fightClockRunning = false;
    currentBossElapsed = 0;
  }
  function startFightClock() {
    if (fightClockRunning) return;
    fightClockStartedAt = wallNow();
    fightClockRunning = true;
  }
  function pauseFightClock() {
    if (fightClockRunning) {
      fightClockAccumulated += Math.max(0, wallNow() - fightClockStartedAt);
      fightClockRunning = false;
    }
    currentBossElapsed = fightClockAccumulated;
  }
  function readFightClock() {
    return fightClockAccumulated + (fightClockRunning ? Math.max(0, wallNow() - fightClockStartedAt) : 0);
  }
  function buildBossGrid(mode = selectionMode) {
    const grid = document.getElementById('boss-grid');
    if (!grid) return;
    selectionMode = mode === 'forge' ? 'forge' : 'practice';
    const forge = selectionMode === 'forge';
    grid.textContent = '';
    const gridBosses = forge ? BOSSES : CAMPAIGN_BOSSES;
    gridBosses.forEach((entry, visibleIndex) => {
      const index = BOSSES.findIndex(candidate => candidate.id === entry.id);
      const campaignEntry = LEGACY_BOSS_IDS.has(entry.id);
      const unlocked = forge || visibleIndex < save.unlocked;
      const expansionStory = campaignEntry ? null : EXPANSION_STORY?.getBossById?.(entry.id);
      const intro = expansionStory?.shortIntro || entry.description;
      const objective = expansionStory?.objective || entry.description;
      const cardCopy = intro + (objective && objective !== intro ? ' OBJECTIF · ' + objective : '')
        + (forge ? ' · SIMULATION HORS CHRONOLOGIE · aucune restitution canonique.' : '');
      const button = document.createElement('button');
      button.className = 'boss-card';
      button.dataset.bossId = entry.id;
      button.dataset.bossEngine = entry.engine || (campaignEntry ? 'legacy' : 'expanded');
      button.style.setProperty('--boss-color', entry.color);
      button.disabled = !unlocked;
      const number = bossCatalogueNumber(index);
      const status = forge ? ' · SIMULATION HORS CHRONOLOGIE' : '';
      button.setAttribute('aria-label', unlocked
        ? number + ' · ' + entry.name + ' · ' + objective
        : 'Machine ' + String(visibleIndex + 1).padStart(2, '0') + ' verrouillée');
      const artPart = LEGACY_CARD_ART_PARTS[entry.id] || 'chassis';
      const artMarkup = unlocked
        ? '<img class="boss-card-art" src="assets/generated/v2.10.0/bosses/' + entry.id + '/' + artPart + '.webp" alt="" aria-hidden="true" width="192" height="192" loading="lazy" decoding="async" draggable="false">'
        : '';
      button.innerHTML = artMarkup + '<span><span class="boss-number">' + (unlocked ? number + status : 'VERROUILLÉE') + '</span>'
        + '<strong>' + (unlocked ? entry.name : 'SIGNATURE INCONNUE') + '</strong>'
        + '<em>' + (unlocked ? entry.arena : 'Termine la machine précédente') + '</em></span>'
        + '<span><small>' + (unlocked ? cardCopy : 'Données chiffrées par Voltério.') + '</small>'
        + '<span class="best">' + (unlocked ? 'Meilleur temps : ' + formatTime(save.bestTimes[entry.id]) + ' · Rang ' + (save.bestRanks[entry.id] || '—') : '') + '</span></span>';
      if (unlocked) button.addEventListener('click', () => startRun(forge ? 'forge' : 'practice', index));
      grid.appendChild(button);
    });
    syncCampaignUi();

    const forgeRunSummary = document.querySelector('#forge-circuit-card');
    if (forgeRunSummary) forgeRunSummary.hidden = !forge;
    if (forge) syncContinueForge();

    const eyebrow = document.querySelector('#boss-select-eyebrow');
    const title = document.querySelector('#boss-select-title');
    const progress = document.querySelector('#boss-select-progress, #lab-progress');
    if (eyebrow) eyebrow.textContent = forge ? 'CATALOGUE INTÉGRAL // 30 SIMULATIONS HORS CHRONOLOGIE' : 'LABORATOIRE // LE CANON N’AVANCE PAS';
    if (title) title.textContent = forge ? 'Catalogue intégral · choisir librement sans modifier l’histoire' : 'Laboratoire de campagne · rejouer sans réécrire';
    if (progress) progress.textContent = forge
      ? BOSSES.length + ' profils jouables en simulation · ces combats n’altèrent ni les six districts ni la suite canonique de la Forge.'
      : Math.min(save.unlocked, CAMPAIGN_BOSSES.length) + ' / ' + CAMPAIGN_BOSSES.length + ' boss relus · le Laboratoire n’altère aucun district.';
    grid.setAttribute('aria-label', forge ? 'Catalogue complet des 30 boss' : 'Machines de campagne débloquées');
    document.querySelectorAll('#boss-select-screen [data-gearstorm-mode]').forEach(tab => {
      const tabMode = BOSS_REGISTRY?.resolveLaunchMode?.(tab.dataset.gearstormMode || tab.dataset.bossMode);
      tab.setAttribute('aria-pressed', String(tabMode === selectionMode));
    });
  }

  function difficulty() {
    return DIFFICULTIES[save.settings.difficulty] || DIFFICULTIES.standard;
  }

  function resetWorld() {
    playerShots = [];
    enemyShots = [];
    particles = [];
    floatingTexts = [];
    ambient = [];
    screenShake = 0;
    flash = 0;
    timeScale = 1;
    transitionTimer = 0;
    artRuntime.effects = [];
  }

  function createPlayer() {
    const cfg = difficulty();
    const maxHp = cfg.playerHealth + runBuild.maxHpBonus;
    return {
      x: 210,
      y: GROUND - 36,
      vx: 0,
      vy: 0,
      w: 42,
      h: 72,
      facing: 1,
      onGround: true,
      jumpsLeft: 2,
      hp: maxHp,
      maxHp,
      invuln: 0,
      shotCooldown: 0,
      poseAim: 0,
      poseRecoil: 0,
      poseLand: 0,
      dashCooldown: 0,
      dashTime: 0,
      dashHitLock: 0,
      overload: 0,
      overloadTime: 0,
      slowTime: 0,
      barrier: runBuild.shieldCharges,
      precisionHits: 0,
      anim: 0,
      landed: false
    };
  }

  function createBoss(index, initialPhase = 1, checkpoint = 1) {
    const data = BOSSES[index];
    const maxHp = Math.round(data.hp * difficulty().bossHealth);
    const phase = clamp(Math.floor(Number(initialPhase) || 1), 1, 3);
    const startingHp = phase === 1 ? maxHp : phase === 2 ? Math.ceil(maxHp * 2 / 3) : Math.ceil(maxHp / 3);
    const expanded = data.engine === 'expanded';
    const runtime = expanded && BOSS_REGISTRY ? BOSS_REGISTRY.createRuntime(data.id, { phase, checkpoint, attempt: currentBossRetries }) : null;
    if (data.id === 'endurance-engine' && runtime) {
      const firstRound = (phase - 1) * 2 + 1;
      runtime.round = clamp(Math.floor(Number(checkpoint) || firstRound), firstRound, firstRound + 1);
      runtime.signatureCycle = runtime.round - firstRound;
    }
    return {
      data,
      x: 960,
      y: 330,
      vx: 0,
      vy: 0,
      w: data.hitbox?.w || (data.id === 'cyclotron' ? 230 : 190),
      h: data.hitbox?.h || (data.id === 'omega' ? 220 : 160),
      maxHp,
      hp: startingHp,
      state: 'intro',
      stateTime: 0,
      totalTime: 0,
      cycle: 0,
      subCount: 0,
      events: Object.create(null),
      vulnerable: false,
      weakX: 960,
      weakY: 320,
      weakR: 32,
      hidden: false,
      hitFlash: 0,
      attackLabel: 'INITIALISATION',
      direction: -1,
      rotation: 0,
      phase,
      dashHitCooldown: 0,
      collisionEnabled: true,
      runtime,
      defeated: false
    };
  }

  function isSequentialRun(mode = runMode) {
    return mode === 'rush' || mode === 'forgeRush';
  }

  function startRun(mode, index = 0, options = {}) {
    if (mode === 'forgeRush' && !forgeNarrativeUnlocked()) {
      selectionMode = 'forge';
      buildBossGrid('forge');
      showScreen('boss-select-screen');
      showToast('CHRONOLOGIE VERROUILLÉE // SIX DISTRICTS D’ABORD', 'Le Catalogue reste libre en simulation ; le Circuit Forge commence après l’abolition de la Couronne.');
      return false;
    }
    const campaignResume = mode === 'rush' && sanitizeRushSnapshot(save.rushSnapshot);
    const forgeResume = mode === 'forgeRush' && sanitizeForgeRushSnapshot(save.forgeRushSnapshot);
    if (!options.force && (campaignResume || forgeResume)) {
      const label = mode === 'forgeRush' ? 'Circuit Forge' : 'Circuit';
      if (!confirm('Un ' + label + ' est déjà en cours. Lancer une nouvelle tentative remplacera ce point de reprise. Continuer ?')) {
        showScreen('title-screen');
        syncContinueRun();
        syncContinueForge();
        return false;
      }
    }
    unlockAudio();
    runMode = mode === 'forgeRush' ? 'forgeRush' : mode === 'forge' ? 'forge' : mode;
    selectionMode = ['forge', 'forgeRush'].includes(runMode) ? 'forge' : 'practice';
    selectedPracticePhase = isSequentialRun() ? 1 : clamp(Math.floor(Number(options.phase) || 1), 1, 3);
    selectedPracticeCheckpoint = isSequentialRun() ? 1 : Math.max(1, Math.floor(Number(options.checkpoint) || 1));
    if (runMode === 'rush') save.rushSnapshot = null;
    if (runMode === 'forgeRush') save.forgeRushSnapshot = null;
    const requestedIndex = runMode === 'forgeRush' ? Math.max(FORGE_START_INDEX, index) : index;
    currentBossIndex = clamp(requestedIndex, 0, BOSSES.length - 1);
    score = 0;
    damageTaken = 0;
    rushStart = performance.now() / 1000;
    rushElapsedBeforeBoss = 0;
    runBuild = createRunBuild();
    rushRetryPenalty = 0;
    runRetryCount = 0;
    currentBossRetries = 0;
    lastBossRetryPenalty = 0;
    lastUpgradeOffer = [];
    startFight(currentBossIndex);
    syncContinueForge();
    return true;
  }

  function startFight(index, { retry = false, preserveRetries = false, phase = selectedPracticePhase, checkpoint = selectedPracticeCheckpoint } = {}) {
    currentBossIndex = index;
    if (retry) score = scoreAtBossStart;
    else {
      scoreAtBossStart = score;
      if (!preserveRetries) currentBossRetries = 0;
    }
    damageTaken = 0;
    currentBossFinishSource = null;
    currentBossOverloadFinish = false;
    currentBossOverloadOpening = false;
    currentBossHazardHits = Object.create(null);
    currentBossPerfectCycles = Object.create(null);
    currentBossCycleState = Object.create(null);
    currentForgeTelemetry = createForgeTelemetry();
    hideRadioExchange();
    combo = 0;
    comboTimer = 0;
    maxCombo = 0;
    resetFightClock();
    resetWorld();
    player = createPlayer();
    boss = createBoss(index, isSequentialRun() ? 1 : phase, checkpoint);
    void queueGeneratedArtForBoss(boss.data.id, true);
    currentBossStart = performance.now() / 1000;
    state = 'fight';
    closeScreens();
    touchControls.classList.add('in-game');
    const briefing = document.querySelector('#combat-briefing');
    if (briefing) briefing.hidden = false;
    configureIntro(retry);
    if (runMode === 'rush' && !retry) saveRushSnapshot();
    if (runMode === 'forgeRush' && !retry) saveForgeRushSnapshot();
    syncContinueForge();
  }

  function retryFight() {
    const penalized = isSequentialRun();
    const endurancePractice = !penalized && boss?.data.id === 'endurance-engine' && boss.runtime;
    const retryPhase = endurancePractice ? boss.phase : selectedPracticePhase;
    const firstRound = endurancePractice ? (retryPhase - 1) * 2 + 1 : selectedPracticeCheckpoint;
    const retryCheckpoint = endurancePractice
      ? clamp(Math.floor(Number(boss.runtime.round) || firstRound), firstRound, firstRound + 1)
      : selectedPracticeCheckpoint;
    currentBossRetries += 1;
    if (penalized) {
      runRetryCount += 1;
      rushRetryPenalty += RUSH_RETRY_PENALTY;
    }
    startFight(currentBossIndex, { retry: true, phase: retryPhase, checkpoint: retryCheckpoint });
    if (penalized) {
      score = Math.max(0, score - RUSH_RETRY_SCORE_PENALTY);
      scoreAtBossStart = score;
      if (runMode === 'rush') saveRushSnapshot();
      else saveForgeRushSnapshot();
      showToast('RETRY // +' + RUSH_RETRY_PENALTY + ' s · -' + RUSH_RETRY_SCORE_PENALTY + ' pts · LE CHECKPOINT A TOUT COMPTÉ', 'Nouvelle tentative. Pénalité de ' + RUSH_RETRY_PENALTY + ' secondes et ' + RUSH_RETRY_SCORE_PENALTY + ' points.');
    }
  }

  function configureIntro(retry = false) {
    const data = BOSSES[currentBossIndex];
    const act = runMode === 'rush' ? STORY.getActByOrder(currentBossIndex + 1) : null;
    const expansionStory = data.engine === 'expanded' ? EXPANSION_STORY?.getBossById?.(data.id) : null;
    const wave = expansionStory ? EXPANSION_STORY?.waves?.find(entry => entry.number === expansionStory.wave) : null;
    const firstInWave = !!expansionStory && EXPANSION_STORY?.forgeCircuit?.waveCheckpoints
      ?.some(checkpoint => checkpoint.firstBossId === data.id);
    const functionLabel = expansionStory?.civicFunction || act?.civicFunction || data.epithet || data.arena;
    const ringPrelude = firstInWave && wave ? wave.premise + ' · ' : '';
    const briefing = expansionStory
      ? ringPrelude + expansionStory.shortIntro + ' · OBJECTIF — ' + expansionStory.objective
        + ' · HORS CADRE — ' + expansionStory.metaLine
      : act?.preFight?.map(line => line.speaker + ' — ' + line.text).join('  ·  ')
        || data.quote + ' · HORS CADRE — Le Laboratoire garde la barre de vie et retire les conséquences.';
    document.getElementById('intro-index').textContent = expansionStory
      ? (runMode === 'forge' ? 'SIMULATION ' : '') + 'FORGE ' + String(expansionStory.number).padStart(2, '0') + ' · ANNEAU ' + expansionStory.wave
      : data.arena + ' · MACHINE ' + String(currentBossIndex + 1).padStart(2, '0');
    document.getElementById('intro-name').textContent = data.name;
    document.getElementById('intro-epithet').textContent = wave ? wave.title + ' · ' + functionLabel : functionLabel;
    document.getElementById('intro-quote').textContent = briefing;
    bossIntro.classList.add('visible');
    bossIntro.setAttribute('aria-hidden', 'false');
    introTimer = retry ? 1.25 : expansionStory ? (matchMedia('(max-width: 820px)').matches ? 7.4 : 6) : (matchMedia('(max-width: 820px)').matches ? 5.2 : 3.8);
    announce(data.name + '. ' + functionLabel);
  }

  function startMasteryCycle(kind) {
    currentBossCycleState[kind] = { hits: 0 };
  }

  function finishMasteryCycle(kind) {
    const cycle = currentBossCycleState[kind];
    if (!cycle) return;
    if (cycle.hits === 0) currentBossPerfectCycles[kind] = (currentBossPerfectCycles[kind] || 0) + 1;
    delete currentBossCycleState[kind];
  }

  function noteMasteryCycleHit(source) {
    if (!boss || boss.phase !== 3) return;
    if (boss.data.id === 'drill' && currentBossCycleState.eruption) currentBossCycleState.eruption.hits += 1;
    if (boss.data.id === 'mantis' && source === 'bossDash' && currentBossCycleState.dash) currentBossCycleState.dash.hits += 1;
  }

  function setBossState(next) {
    boss.state = next;
    boss.stateTime = 0;
    boss.events = Object.create(null);
    boss.vulnerable = false;
  }

  function bossEvent(key, at, callback) {
    if (boss.stateTime >= at && !boss.events[key]) {
      boss.events[key] = true;
      callback();
    }
  }

  function inputDown(...codes) {
    return codes.some(code => keys[code]);
  }

  function inputPressed(...codes) {
    for (const code of codes) {
      if (pressed.has(code)) {
        pressed.delete(code);
        return true;
      }
    }
    return false;
  }

  function touchDown(name) { return touch[name]; }
  function touchWasPressed(name) {
    if (touchPressed.has(name)) {
      touchPressed.delete(name);
      return true;
    }
    return false;
  }

  function pollGamepad() {
    const pad = Array.from(navigator.getGamepads?.() || []).find(Boolean);
    if (!pad) {
      controller.left = controller.right = controller.attack = false;
      controller.jumpPressed = controller.dashPressed = controller.overloadPressed = controller.pausePressed = false;
      controller.menuUpPressed = controller.menuDownPressed = controller.menuLeftPressed = controller.menuRightPressed = false;
      controller.confirmPressed = controller.cancelPressed = false;
      lastGamepadButtons = [];
      lastGamepadAxes = [0, 0];
      return;
    }
    const buttons = pad.buttons.map(button => button.pressed);
    const justPressed = index => buttons[index] && !lastGamepadButtons[index];
    const axisX = pad.axes[0] || 0;
    const axisY = pad.axes[1] || 0;
    controller.left = axisX < -0.25 || buttons[14];
    controller.right = axisX > 0.25 || buttons[15];
    controller.attack = buttons[2];
    controller.jumpPressed = justPressed(0);
    controller.dashPressed = justPressed(1);
    controller.overloadPressed = justPressed(3);
    controller.pausePressed = justPressed(9);
    controller.menuUpPressed = justPressed(12) || (axisY < -0.58 && lastGamepadAxes[1] >= -0.58);
    controller.menuDownPressed = justPressed(13) || (axisY > 0.58 && lastGamepadAxes[1] <= 0.58);
    controller.menuLeftPressed = justPressed(14) || (axisX < -0.58 && lastGamepadAxes[0] >= -0.58);
    controller.menuRightPressed = justPressed(15) || (axisX > 0.58 && lastGamepadAxes[0] <= 0.58);
    controller.confirmPressed = justPressed(0);
    controller.cancelPressed = justPressed(1);
    lastGamepadButtons = buttons;
    lastGamepadAxes = [axisX, axisY];
  }
  function handleGamepadMenus() {
    const activeScreen = document.querySelector('.screen.active');
    if (!activeScreen) return;
    if (activeScreen.id === 'codex-screen' && (controller.menuUpPressed || controller.menuDownPressed)) {
      const panel = activeScreen.querySelector('.codex-panel') || activeScreen;
      const direction = controller.menuDownPressed ? 1 : -1;
      panel.scrollBy?.({ top: direction * Math.max(220, panel.clientHeight * 0.58), behavior: save.settings.reduceMotion ? 'auto' : 'smooth' });
    }
    const focusables = [...activeScreen.querySelectorAll('button:not(:disabled):not([hidden]), select:not(:disabled):not([hidden]), input:not(:disabled):not([hidden]):not([type="hidden"])')];
    if (!focusables.length) return;
    let index = focusables.indexOf(document.activeElement);
    if (index < 0) index = 0;
    const active = focusables[index];
    const horizontal = controller.menuLeftPressed || controller.menuRightPressed;
    if (horizontal && active instanceof HTMLSelectElement) {
      const direction = controller.menuRightPressed ? 1 : -1;
      active.selectedIndex = clamp(active.selectedIndex + direction, 0, active.options.length - 1);
      active.dispatchEvent(new Event('change', { bubbles: true }));
    } else if (horizontal && active instanceof HTMLInputElement && active.type === 'range') {
      const direction = controller.menuRightPressed ? 1 : -1;
      const minimum = Number(active.min) || 0;
      const maximum = Number(active.max) || 100;
      const step = Number(active.step) || 1;
      active.value = String(clamp(Number(active.value) + direction * step, minimum, maximum));
      active.dispatchEvent(new Event('input', { bubbles: true }));
      active.dispatchEvent(new Event('change', { bubbles: true }));
    } else if (controller.menuUpPressed || controller.menuLeftPressed) {
      focusables[(index - 1 + focusables.length) % focusables.length].focus({ preventScroll: true });
    } else if (controller.menuDownPressed || controller.menuRightPressed) {
      focusables[(index + 1) % focusables.length].focus({ preventScroll: true });
    }
    if (controller.confirmPressed) {
      const target = document.activeElement instanceof HTMLElement ? document.activeElement : focusables[0];
      target.click();
      controller.jumpPressed = false;
    }
    if (controller.cancelPressed) {
      controller.dashPressed = false;
      if (state === 'paused') resumeGame();
      else {
        const back = activeScreen.querySelector('[data-back]');
        if (back) back.click();
        else if (['result-screen', 'gameover-screen', 'ending-screen'].includes(activeScreen.id)) returnToMenu();
      }
    }
  }

  function playerMuzzlePosition() {
    const muzzle = heroArtReady() ? renderedHeroMuzzle() : RIVA_MUZZLE;
    return {
      x: player.x + player.facing * muzzle.x,
      y: player.y + muzzle.y
    };
  }

  function activateOverload() {
    if (!player || player.overload < 100 || player.overloadTime > 0) return;
    player.overload = 0;
    player.overloadTime = runBuild.overloadDuration;
    if (boss?.vulnerable) currentBossOverloadOpening = true;
    player.invuln = Math.max(player.invuln, 0.45);
    enemyShots.forEach(shot => { shot.life = Math.min(shot.life, 1.4); });
    spawnBurst(player.x, player.y, '#fff39a', 34, 430);
    spawnGeneratedVfx('overload-bloom', player.x, player.y, { size: 174, duration: 0.62, growth: 0.72 });
    spawnGeneratedVfx('electric-arcs', player.x, player.y, { size: 128, duration: 0.48, growth: 0.3 });
    addFloatingText(player.x, player.y - 72, 'SURCHARGE', '#fff39a');
    shake(12);
    haptic([35, 25, 55]);
    sfx('overload');
  }

  function createForgeTelemetry() {
    return {
      actions: new Set(),
      actionSequence: [],
      familyCompletions: Object.create(null),
      perfectFamilyCycles: Object.create(null),
      familyHits: Object.create(null),
      signatureCompletions: Object.create(null),
      signatureStates: new Set(),
      partsDestroyed: new Set(),
      uniquePartIds: new Set(),
      destroyedByRole: Object.create(null),
      firstWindowByRole: Object.create(null),
      priorityDroneFamilies: new Set(),
      priorityDroneFailures: new Set(),
      mimicPhaseTwoSamples: 0,
      mimicPhaseTwoCompleteSamples: 0,
      cleanBreakerModules: new Set(),
      offlineBreakerModuleHits: 0,
      valvesByPressureCycle: new Map(),
      maximumValvesInPressureCycle: 0,
      maximumProjectileBounceChain: 0,
      reflectionHits: 0,
      reflectionStreak: 0,
      maximumReflectionStreak: 0,
      reflectionTargets: new Set(),
      lurePresses: 0,
      dashCounters: 0,
      puzzlePerfectSequences: 0,
      puzzleErrors: 0,
      adaptations: new Set(),
      laneHits: new Set(),
      gravityQuadrants: new Set(),
      openings: 0,
      finalPhaseOpenings: 0,
      minimumReservePercent: 100,
      healsUsed: 0,
      repairsCompleted: 0,
      fallDamageTaken: 0,
      recoveryFalls: 0,
      doorsOpened: new Set(),
      mutualCollisions: 0,
      manualSequenceResets: 0,
      selfRicochetHits: 0,
      enduranceRounds: new Set(),
      cycleStartDamage: 0,
      cycleStartPuzzleErrors: 0,
      lastMechanicFamily: null,
      lastEnvironment: 'stable',
      finish: null
    };
  }

  function incrementForgeMetric(bucket, key, amount = 1) {
    bucket[key] = (bucket[key] || 0) + amount;
    return bucket[key];
  }

  function forgeTelemetrySnapshot() {
    const telemetry = currentForgeTelemetry;
    return {
      actions: [...telemetry.actions],
      familyCompletions: { ...telemetry.familyCompletions },
      perfectFamilyCycles: { ...telemetry.perfectFamilyCycles },
      familyHits: { ...telemetry.familyHits },
      signatureCompletions: { ...telemetry.signatureCompletions },
      signatureStates: [...telemetry.signatureStates],
      partsDestroyed: [...telemetry.partsDestroyed],
      destroyedByRole: { ...telemetry.destroyedByRole },
      priorityDroneFamilies: [...telemetry.priorityDroneFamilies],
      priorityDroneFailures: [...telemetry.priorityDroneFailures],
      mimicPhaseTwoSamples: telemetry.mimicPhaseTwoSamples,
      mimicPhaseTwoCompleteSamples: telemetry.mimicPhaseTwoCompleteSamples,
      cleanBreakerModules: [...telemetry.cleanBreakerModules],
      offlineBreakerModuleHits: telemetry.offlineBreakerModuleHits,
      valvesByPressureCycle: Object.fromEntries([...telemetry.valvesByPressureCycle].map(([key, parts]) => [key, [...parts]])),
      maximumValvesInPressureCycle: telemetry.maximumValvesInPressureCycle,
      maximumProjectileBounceChain: telemetry.maximumProjectileBounceChain,
      reflectionHits: telemetry.reflectionHits,
      maximumReflectionStreak: telemetry.maximumReflectionStreak,
      reflectionTargets: [...telemetry.reflectionTargets],
      lurePresses: telemetry.lurePresses,
      dashCounters: telemetry.dashCounters,
      puzzlePerfectSequences: telemetry.puzzlePerfectSequences,
      puzzleErrors: telemetry.puzzleErrors,
      adaptations: [...telemetry.adaptations],
      laneHits: [...telemetry.laneHits],
      gravityQuadrants: [...telemetry.gravityQuadrants],
      openings: telemetry.openings,
      finalPhaseOpenings: telemetry.finalPhaseOpenings,
      minimumReservePercent: telemetry.minimumReservePercent,
      healsUsed: telemetry.healsUsed,
      repairsCompleted: telemetry.repairsCompleted,
      fallDamageTaken: telemetry.fallDamageTaken,
      recoveryFalls: telemetry.recoveryFalls,
      doorsOpened: [...telemetry.doorsOpened],
      mutualCollisions: telemetry.mutualCollisions,
      manualSequenceResets: telemetry.manualSequenceResets,
      selfRicochetHits: telemetry.selfRicochetHits,
      enduranceRounds: [...telemetry.enduranceRounds],
      mechanicId: boss?.runtime?.mechanicId || null,
      signatureState: boss?.runtime?.signatureState || null,
      finish: telemetry.finish ? { ...telemetry.finish } : null
    };
  }

  const EXPANDED_ATTACKABLE_ROLES = new Set(['module', 'drone', 'anchor', 'coupling', 'section', 'valve', 'condensator', 'null-module']);

  function isExpandedBoss(data = boss?.data) {
    return data?.engine === 'expanded' && Boolean(BOSS_REGISTRY);
  }

  function expandedPhase() {
    return isExpandedBoss() ? BOSS_REGISTRY.getPhase(boss.data.id, boss.phase) : null;
  }

  function expandedFamily() {
    return boss?.runtime?.family || expandedPhase()?.family || boss?.data?.family || null;
  }

  function expandedRandom(min = 0, max = 1) {
    const value = boss?.runtime?.rng ? boss.runtime.rng() : Math.random();
    return min + (max - min) * value;
  }

  function noteExpandedInput(kind) {
    if (!isExpandedBoss() || !boss.runtime?.inputTelemetry || !Object.hasOwn(boss.runtime.inputTelemetry, kind)) return;
    boss.runtime.inputTelemetry[kind] += 1;
    currentForgeTelemetry.actions.add(kind);
    currentForgeTelemetry.actionSequence.push(kind);
    if (currentForgeTelemetry.actionSequence.length > 3) currentForgeTelemetry.actionSequence.shift();
  }

  function applyExpandedArenaForces(dt) {
    if (!isExpandedBoss() || !boss.runtime || !player) return;
    const environment = boss.runtime.environment;
    if (environment === 'wind-left') player.vx -= 430 * dt;
    else if (environment === 'wind-right') player.vx += 430 * dt;
    else if (environment === 'gravity-left') player.vx -= 620 * dt;
    else if (environment === 'gravity-right') player.vx += 620 * dt;
    else if (environment === 'fluid-high') {
      player.vx *= Math.pow(0.36, dt);
      player.vy -= 310 * dt;
    }
    if (boss.data.id === 'orbital-famine' && boss.state === 'active') {
      boss.runtime.resource = Math.max(0, boss.runtime.resource - dt * (8 + boss.phase * 2));
      currentForgeTelemetry.minimumReservePercent = Math.min(currentForgeTelemetry.minimumReservePercent, boss.runtime.resource);
      if (boss.runtime.resource <= 0 && !boss.runtime.resourceEmpty) {
        boss.runtime.resourceEmpty = true;
        hurtPlayer(1, player.x < W / 2 ? 1 : -1, 'energyDrain');
        boss.runtime.resource = 38;
      }
    }
  }

  function resetExpandedParts() {
    if (!boss?.runtime?.parts) return;
    for (const part of boss.runtime.parts) {
      part.hp = part.maxHp;
      part.state = 'intact';
      part.destroyed = false;
      delete part.destroyedAt;
    }
  }

  function configureExpandedPhase() {
    if (!isExpandedBoss()) return;
    const previousSeed = boss.runtime?.seed || BOSS_REGISTRY.seedFor(boss.data.id, currentBossRetries);
    const checkpoint = boss.runtime?.round || selectedPracticeCheckpoint;
    boss.runtime = BOSS_REGISTRY.createRuntime(boss.data.id, { phase: boss.phase, checkpoint, seed: previousSeed + boss.phase * 7919 });
    boss.x = 930;
    boss.y = expandedFamily() === 'vertical-lane' ? 315 : 390;
    boss.vx = 0;
    boss.vy = 0;
    boss.hidden = false;
    boss.collisionEnabled = true;
    boss.attackLabel = 'PHASE ' + boss.phase + ' · CALIBRAGE FORGE';
  }

  function prepareExpandedTelegraph() {
    const runtime = boss.runtime;
    const phase = expandedPhase();
    if (!runtime || !phase) return;
    runtime.family = phase.family;
    runtime.selectedPattern = phase.patterns[boss.cycle % phase.patterns.length];
    runtime.mechanicComplete = false;
    runtime.mechanicProgress = 0;
    runtime.mechanicId = phase.mechanicId || runtime.mechanicId;
    runtime.signatureState = 'telegraph:' + (phase.signatureState || runtime.selectedPattern);
    currentForgeTelemetry.signatureStates.add(boss.data.id + ':' + runtime.signatureState);
    currentForgeTelemetry.cycleStartDamage = damageTaken;
    currentForgeTelemetry.cycleStartPuzzleErrors = currentForgeTelemetry.puzzleErrors;
    runtime.mechanicTarget = phase.mechanicTarget || 1;
    runtime.attemptResolved = false;
    runtime.environment = 'stable';
    const family = runtime.family;
    if (family === 'lure') {
      runtime.lureTargetX = clamp(player.x, 72, W - 72);
      runtime.lureDirection = Math.sign(runtime.lureTargetX - boss.x) || -1;
    } else if (family === 'modules') {
      const attackable = runtime.parts.filter(part => EXPANDED_ATTACKABLE_ROLES.has(part.role));
      if (attackable.every(part => part.destroyed)) resetExpandedParts();
      runtime.mechanicTarget = Math.max(1, attackable.filter(part => !part.destroyed).length);
      if (boss.data.id === 'hive-foreman') {
        runtime.priorityPartId = attackable[Math.min(attackable.length - 1, Math.max(0, boss.phase - 1))]?.id || null;
        runtime.priorityFamily = runtime.selectedPattern;
        runtime.firstPartDestroyedInCycle = false;
      }
    } else if (family === 'mimic') {
      const sampledActions = Object.values(runtime.inputTelemetry).filter(value => value > 0).length;
      if (boss.data.id === 'echo-fencer' && boss.phase === 2) {
        currentForgeTelemetry.mimicPhaseTwoSamples += 1;
        if (sampledActions === 3) currentForgeTelemetry.mimicPhaseTwoCompleteSamples += 1;
      }
      runtime.adaptation = Object.entries(runtime.inputTelemetry).sort((a, b) => b[1] - a[1])[0]?.[0] || 'shot';
      runtime.inputTelemetry = { shot: 0, jump: 0, dash: 0 };
    } else if (family === 'vertical-lane') {
      runtime.safeLane = Math.floor(expandedRandom(0, 3));
      runtime.dangerLanes = [0, 1, 2].filter(lane => lane !== runtime.safeLane);
    } else if (family === 'gravity-weather') {
      const arenaType = boss.data.arenaController?.type;
      if (arenaType === 'fluid') runtime.environment = boss.phase >= 2 ? 'fluid-high' : 'fluid-low';
      else if (arenaType === 'gravity') runtime.environment = boss.cycle % 2 ? 'gravity-left' : 'gravity-right';
      else if (arenaType === 'energy') runtime.environment = 'energy-drain';
      else runtime.environment = ['wind-left', 'conductive-rain', 'heat'][boss.cycle % 3];
    } else if (family === 'posture-duo') {
      const pilotScale = save.settings.difficulty === 'casual' ? 0.66 : 1;
      runtime.posture = Math.max(1, Math.ceil(runtime.mechanicTarget * pilotScale));
      runtime.mechanicTarget = runtime.posture;
    } else if (family === 'puzzle-endgame') {
      const count = Math.min(5, Math.max(3, runtime.mechanicTarget));
      runtime.puzzleSequence = Array.from({ length: count }, (_, index) => index);
      for (let index = count - 1; index > 0; index--) {
        const swap = Math.floor(expandedRandom(0, index + 1));
        [runtime.puzzleSequence[index], runtime.puzzleSequence[swap]] = [runtime.puzzleSequence[swap], runtime.puzzleSequence[index]];
      }
      runtime.puzzleIndex = 0;
      runtime.puzzleNodes = Array.from({ length: count }, (_, index) => ({
        id: index,
        x: 180 + index * (900 / Math.max(1, count - 1)),
        y: GROUND - 118 - (index % 2) * 92,
        r: 27,
        active: false
      }));
    }
    boss.attackLabel = 'PHASE ' + boss.phase + ' · ' + (BOSS_REGISTRY.families[family]?.label || runtime.selectedPattern);
    sfx('warning');
  }

  function spawnReflectableCharge(index = 0) {
    const phase = expandedPhase();
    const speed = 205 + boss.phase * 28;
    const angle = Math.atan2(player.y - boss.y, player.x - boss.x) + (index - 1) * 0.08;
    const charge = {
      type: 'reflectOrb', shape: index % 3, x: boss.x, y: boss.y,
      vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, r: 17,
      age: 0, life: 6, damage: 1, friendly: false, reflected: false,
      pattern: phase?.patterns?.[0] || 'reflect'
    };
    enemyShots.push(charge);
    return charge;
  }

  function startExpandedActive() {
    const runtime = boss.runtime;
    const family = expandedFamily();
    if (!runtime) return;
    boss.attackLabel = 'PHASE ' + boss.phase + ' · ' + runtime.selectedPattern.toUpperCase().replaceAll('-', ' ');
    setExpandedSignatureState('active');
    if (family === 'reflect') {
      spawnReflectableCharge(0);
    } else if (family === 'modules') {
      spawnFan(boss.x, boss.y + 18, 3 + boss.phase, 190 + boss.phase * 15, 2.2, 3.9, 'orb');
    } else if (family === 'mimic') {
      showToast('RÉPONSE MIMÉTIQUE · ' + runtime.adaptation.toUpperCase());
    } else if (family === 'vertical-lane') {
      for (const lane of runtime.dangerLanes) spawnBeamV(213 + lane * 427, 0.18, 0.7);
    } else if (family === 'gravity-weather') {
      showToast('ENVIRONNEMENT · ' + runtime.environment.toUpperCase().replaceAll('-', ' '));
      if (runtime.environment === 'conductive-rain') spawnBeamV(clamp(player.x, 120, 1160), 0.35, 0.5);
      if (runtime.environment === 'heat') spawnBeamH(GROUND - 42, 0.42, 0.52);
    } else if (family === 'puzzle-endgame') {
      spawnFan(boss.x, boss.y, 3 + boss.phase, 175, 2.35, 3.85, 'orb');
    }
  }

  function completeExpandedMechanic(message = 'OUVERTURE VALIDÉE') {
    if (!boss?.runtime || boss.runtime.mechanicComplete) return;
    boss.runtime.mechanicComplete = true;
    boss.runtime.mechanicProgress = Math.max(boss.runtime.mechanicProgress, boss.runtime.mechanicTarget);
    const family = expandedFamily();
    incrementForgeMetric(currentForgeTelemetry.familyCompletions, family);
    if (boss.runtime.mechanicId) incrementForgeMetric(currentForgeTelemetry.signatureCompletions, boss.runtime.mechanicId);
    if (boss.data.id === 'carrier-cathedral' && boss.phase <= 2) currentForgeTelemetry.doorsOpened.add('door-' + boss.phase);
    if (boss.data.id === 'endurance-engine') currentForgeTelemetry.enduranceRounds.add(boss.runtime.round);
    if (damageTaken === currentForgeTelemetry.cycleStartDamage) {
      incrementForgeMetric(currentForgeTelemetry.perfectFamilyCycles, family);
      if (boss.phase === 3) incrementForgeMetric(currentForgeTelemetry.perfectFamilyCycles, 'phase3');
    }
    if (family === 'puzzle-endgame' && currentForgeTelemetry.puzzleErrors === currentForgeTelemetry.cycleStartPuzzleErrors) {
      currentForgeTelemetry.puzzlePerfectSequences += 1;
    }
    if (family === 'mimic' && boss.runtime.adaptation) currentForgeTelemetry.adaptations.add(boss.runtime.adaptation);
    currentForgeTelemetry.lastMechanicFamily = family;
    currentForgeTelemetry.lastEnvironment = boss.runtime.environment;
    score += Math.round((boss.data.scoreRules?.mechanicBonus || 400) * difficulty().scoreMultiplier);
    addFloatingText(boss.x, boss.y - 110, message, boss.data.accent);
    sfx('heavyHit');
  }

  function enterExpandedVulnerability() {
    if (!boss || boss.state === 'vulnerable') return;
    boss.runtime.environment = 'stable';
    currentForgeTelemetry.openings += 1;
    if (boss.phase === 3) currentForgeTelemetry.finalPhaseOpenings += 1;
    setBossState('vulnerable');
    boss.vulnerable = true;
    boss.attackLabel = 'PHASE ' + boss.phase + ' · NOYAU FORGE OUVERT';
    showToast(boss.data.name + ' · NOYAU OUVERT');
  }

  function tagNewestShots(startIndex, source, extra = {}) {
    for (let index = startIndex; index < enemyShots.length; index++) Object.assign(enemyShots[index], { source, ...extra });
  }

  function spawnSignatureBeamV(x, telegraph, active, source) {
    const start = enemyShots.length;
    spawnBeamV(x, telegraph, active);
    tagNewestShots(start, source);
  }

  function spawnSignatureBeamH(y, telegraph, active, source) {
    const start = enemyShots.length;
    spawnBeamH(y, telegraph, active);
    tagNewestShots(start, source);
  }

  function spawnSignatureFan(x, y, count, speed, startAngle, endAngle, type, source) {
    const start = enemyShots.length;
    spawnFan(x, y, count, speed, startAngle, endAngle, type);
    tagNewestShots(start, source);
  }

  function spawnSignatureMine(x, y, source) {
    const start = enemyShots.length;
    spawnMine(x, y);
    tagNewestShots(start, source);
  }

  function setExpandedSignatureState(stage) {
    const runtime = boss?.runtime;
    const phase = expandedPhase();
    if (!runtime || !phase?.signatureState) return;
    runtime.signatureState = stage + ':' + phase.signatureState;
    currentForgeTelemetry.signatureStates.add(boss.data.id + ':' + runtime.signatureState);
  }

  function repairHiveDrone() {
    const runtime = boss?.runtime;
    if (!runtime) return false;
    const candidates = runtime.parts.filter(part => part.role === 'drone' && (part.destroyed || part.hp < part.maxHp));
    const target = candidates.sort((a, b) => a.hp - b.hp)[0];
    if (!target) return false;
    if (target.destroyed) {
      target.destroyed = false;
      target.hp = Math.max(1, Math.ceil(target.maxHp * 0.42));
    } else {
      target.hp = Math.min(target.maxHp, target.hp + Math.max(4, Math.ceil(target.maxHp * 0.3)));
    }
    target.state = target.hp <= target.maxHp * 0.5 ? 'damaged' : 'intact';
    currentForgeTelemetry.repairsCompleted += 1;
    incrementForgeMetric(runtime.signatureCounters, 'repairsCompleted');
    addFloatingText(boss.x, boss.y - 108, 'DRONE RÉPARÉ', '#ffe38a');
    return true;
  }

  // Automates secondaires propres aux 24 profils. Chaque case ajoute un état,
  // une cadence ou une règle de résolution qui n'existe sur aucun autre boss.
  function updateExpandedSignature(dt) {
    const runtime = boss?.runtime;
    const phase = expandedPhase();
    if (!runtime || !phase?.mechanicId) return;
    setExpandedSignatureState('active');
    const key = 'signature:' + phase.mechanicId + ':';
    const event = (name, at, callback) => bossEvent(key + name, at, callback);
    const p = boss.phase;
    switch (boss.data.id) {
      case 'bastion-ricochet':
        event('split-charge', 0.46, () => { const charge = spawnReflectableCharge(p + boss.cycle); charge.vy -= 42 + p * 12; });
        boss.rotation = Math.sin(boss.totalTime * 1.7) * 0.08;
        break;
      case 'hydraulic-warden':
        event('left-press', 0.34, () => spawnSignatureBeamV(118 + p * 18, 0.44, 0.46, 'wallPress'));
        event('right-press', 1.08, () => spawnSignatureBeamV(W - 118 - p * 18, 0.44, 0.46, 'wallPress'));
        break;
      case 'hive-foreman':
        event('repair-cycle', 1.02, repairHiveDrone);
        event('ammo-drone', 0.48, () => spawnSignatureFan(boss.x, boss.y, 2 + p, 180, 2.35, 3.8, 'orb', 'ammoDrone'));
        break;
      case 'echo-fencer':
        event('echo-response', 0.62, () => {
          if (runtime.adaptation === 'jump') spawnSignatureBeamH(GROUND - 112, 0.34, 0.5, 'echoJump');
          else if (runtime.adaptation === 'dash') spawnSignatureBeamV(clamp(player.x, 100, W - 100), 0.34, 0.5, 'echoDash');
          else spawnSignatureFan(boss.x, boss.y, 3 + p, 225, 2.25, 3.9, 'orb', 'echoShot');
        });
        break;
      case 'breaker-array':
        boss.rotation += dt * (0.28 + p * 0.08);
        event('breaker-grid', 0.72, () => spawnSignatureBeamV(220 + ((boss.cycle + p) % 3) * 420, 0.42, 0.48, 'breakerGrid'));
        break;
      case 'vertical-verdict':
        event('counterweight-drop', 1.0, () => spawnSignatureBeamH(GROUND - 34, 0.52, 0.5, 'fallDamage'));
        break;
      case 'rail-tyrant':
        boss.x = 760 + ((boss.totalTime * (150 + p * 24)) % 430);
        event('cargo-pass', 0.7, () => { const start = enemyShots.length; spawnRocket(boss.x, boss.y); tagNewestShots(start, 'cargoPass'); });
        break;
      case 'triplex-hunter':
        event('cross-lock', 0.58, () => {
          const crossing = (runtime.safeLane + 1 + boss.cycle) % 3;
          spawnSignatureBeamV(213 + crossing * 427, 0.38, 0.48, 'lanePermutation');
          spawnSignatureBeamH(GROUND - 154, 0.46, 0.42, 'lanePermutation');
        });
        break;
      case 'ground-eater':
        event('support-collapse', 0.82, () => { spawnSignatureMine(clamp(player.x + expandedRandom(-90, 90), 80, W - 80), GROUND - 18, 'floorCollapse'); spawnShockwaves(boss.x, 2); });
        break;
      case 'floodline-leviathan':
        event('pressure-surge', 0.92, () => spawnSignatureBeamH(GROUND - (p >= 2 ? 116 : 62), 0.5, 0.48, 'pressureSurge'));
        break;
      case 'centrifuge-zero':
        runtime.environment = boss.cycle % 2 ? 'gravity-left' : 'gravity-right';
        event('gravity-fall', 1.04, () => spawnSignatureBeamH(GROUND - 38, 0.5, 0.46, 'fallDamage'));
        break;
      case 'tempest-regulator':
        event('weather-pulse', 0.76, () => {
          if (runtime.environment === 'heat') spawnSignatureBeamH(GROUND - 48, 0.4, 0.5, 'heatDome');
          else if (runtime.environment === 'conductive-rain') spawnSignatureBeamV(clamp(player.x, 100, W - 100), 0.4, 0.5, 'chargedRain');
          else spawnSignatureFan(boss.x, boss.y, 3, 205, 2.45, 3.7, 'orb', 'windShear');
        });
        break;
      case 'ascension-frame':
        event('route-check', 1.12, () => {
          if (player.x < 92 || player.x > W - 92) {
            const fallDirection = player.x < W / 2 ? 1 : -1;
            currentForgeTelemetry.recoveryFalls += 1;
            incrementForgeMetric(runtime.signatureCounters, 'recoveryFalls');
            player.x = W / 2;
            player.y = GROUND - player.h / 2;
            player.vx = 0;
            player.vy = 0;
            hurtPlayer(1, fallDirection, 'recoveryFall');
          }
        });
        break;
      case 'counterforge':
        event('counter-ring', 0.72, () => spawnSignatureFan(boss.x, boss.y, 3 + p, 215, 2.18, 3.96, 'blade', 'counterRing'));
        break;
      case 'carrier-cathedral':
        event('section-door', 0.88, () => spawnSignatureBeamV(180 + ((p + boss.cycle) % 3) * 450, 0.52, 0.44, 'sectionDoor'));
        break;
      case 'twin-governors':
        event('dual-crossfire', 0.66, () => {
          spawnSignatureFan(boss.x - 90, boss.y, 2 + p, 190, 2.3, 3.72, 'orb', 'governorLeft');
          spawnSignatureFan(boss.x + 90, boss.y, 2 + p, 190, 2.56, 3.98, 'orb', 'governorRight');
        });
        break;
      case 'loadout-reactor':
        event('build-counter', 0.7, () => {
          const response = runBuild.installed[0] || 'baseline';
          runtime.signatureCounters.loadoutResponse = response;
          if (response === 'dash') spawnSignatureBeamV(clamp(player.x, 100, W - 100), 0.46, 0.42, 'loadoutDash');
          else if (response === 'core' || response === 'aegis') spawnSignatureMine(player.x, GROUND - 18, 'loadoutDefense');
          else spawnSignatureFan(boss.x, boss.y, 3 + p, 210, 2.3, 3.85, 'orb', 'loadoutFire');
        });
        break;
      case 'orbital-famine':
        event('energy-tax', 0.86, () => spawnSignatureMine(clamp(player.x + expandedRandom(-120, 120), 80, W - 80), GROUND - 18, 'energyTax'));
        break;
      case 'logic-crucible':
        for (let index = 0; index < runtime.puzzleNodes.length; index++) {
          runtime.puzzleNodes[index].y += Math.sin(boss.totalTime * 2 + index) * dt * (12 + p * 3);
        }
        event('logic-pressure', 1.0, () => spawnSignatureBeamH(GROUND - 132, 0.48, 0.42, 'logicPressure'));
        break;
      case 'vector-vault':
        event('wall-vector', 0.5, () => {
          const charge = spawnReflectableCharge(p + 4);
          charge.wallRicochet = true;
          charge.maxWallBounces = 4;
          charge.life = Math.max(charge.life, 9);
          charge.vx = (player.x < charge.x ? -1 : 1) * 760;
          charge.vy = 0;
          charge.source = 'selfRicochet';
        });
        break;
      case 'skyborne-battery':
        boss.y = 270 + Math.sin(boss.totalTime * 2.4) * 105;
        event('torpedo-lock', 0.64, () => { const start = enemyShots.length; spawnRocket(boss.x, boss.y); tagNewestShots(start, 'aerialTorpedo'); });
        break;
      case 'endurance-engine': {
        const round = clamp((p - 1) * 2 + Math.min(2, runtime.signatureCycle + 1), 1, 6);
        runtime.round = round;
        runtime.signatureState = 'active:round-' + round;
        currentForgeTelemetry.signatureStates.add(boss.data.id + ':' + runtime.signatureState);
        event('round-combo', 0.62, () => {
          if (round % 3 === 1) spawnSignatureFan(boss.x, boss.y, 3 + p, 205, 2.3, 3.85, 'orb', 'roundVolley');
          else if (round % 3 === 2) spawnSignatureBeamV(clamp(player.x, 100, W - 100), 0.42, 0.45, 'roundGrid');
          else spawnSignatureMine(player.x, GROUND - 18, 'roundMine');
        });
        break;
      }
      case 'adaptive-archivist':
        event('adaptive-response', 0.7, () => {
          if (runtime.adaptation === 'shot') spawnSignatureFan(boss.x, boss.y, 5, 225, 2.2, 3.95, 'orb', 'adaptiveShot');
          else if (runtime.adaptation === 'jump') spawnSignatureBeamH(GROUND - 102, 0.4, 0.46, 'adaptiveJump');
          else spawnSignatureBeamV(clamp(player.x, 100, W - 100), 0.4, 0.46, 'adaptiveDash');
        });
        break;
      case 'null-crown':
        event('crown-synthesis', 0.56, () => {
          if (p === 1) { const charge = spawnReflectableCharge(7); charge.wallRicochet = true; }
          else if (p === 2) spawnSignatureFan(boss.x, boss.y, 6, 220, 2.18, 3.98, 'orb', 'nullModules');
          else spawnSignatureBeamH(GROUND - 126, 0.38, 0.5, 'nullBreak');
        });
        break;
    }
  }

  function updateExpandedFamilyActive(dt) {
    const runtime = boss.runtime;
    const phase = expandedPhase();
    const family = expandedFamily();
    if (!runtime || !phase) return;
    updateExpandedSignature(dt);
    if (family === 'reflect') {
      const count = Math.min(5, 1 + boss.phase);
      for (let index = 1; index < count; index++) bossEvent('reflect-' + index, index * 0.58, () => spawnReflectableCharge(index));
      boss.y = 340 + Math.sin(boss.totalTime * 2.2) * 48;
    } else if (family === 'lure') {
      boss.x += runtime.lureDirection * (540 + boss.phase * 70) * dt * difficulty().enemySpeed;
      boss.y = 485;
      if (!runtime.attemptResolved && (boss.x < 135 || boss.x > W - 135 || boss.stateTime > phase.activeSeconds * 0.78)) {
        runtime.attemptResolved = true;
        const pressHit = runtime.lureTargetX < 165 || runtime.lureTargetX > W - 165;
        boss.x = clamp(boss.x, 105, W - 105);
        spawnShockwaves(boss.x, 2);
        shake(11);
        if (pressHit) {
          currentForgeTelemetry.lurePresses += 1;
          completeExpandedMechanic('PRESSE AMORCÉE');
        }
      }
    } else if (family === 'modules') {
      boss.x = 910 + Math.sin(boss.totalTime * 1.4) * 125;
      boss.y = 370 + Math.cos(boss.totalTime * 1.8) * 36;
      bossEvent('module-volley', 1.05, () => spawnFan(boss.x, boss.y, 4 + boss.phase, 210, 2.25, 3.9, 'orb'));
      const attackable = runtime.parts.filter(part => EXPANDED_ATTACKABLE_ROLES.has(part.role));
      if (attackable.length && attackable.every(part => part.destroyed)) completeExpandedMechanic('RÉSEAU DÉMONTÉ');
    } else if (family === 'mimic') {
      if (runtime.adaptation === 'shot') bossEvent('mimic-shot', 0.25, () => spawnFan(boss.x, boss.y, 5 + boss.phase, 245, 2.15, 3.95, 'orb'));
      else if (runtime.adaptation === 'jump') bossEvent('mimic-jump', 0.25, () => spawnBeamH(GROUND - 98, 0.38, 0.55));
      else bossEvent('mimic-dash', 0.25, () => { spawnBeamV(clamp(player.x - 150, 100, 1180), 0.38, 0.52); spawnBeamV(clamp(player.x + 150, 100, 1180), 0.38, 0.52); });
      if (boss.stateTime >= phase.activeSeconds * 0.82) completeExpandedMechanic('RÉPONSE SURVÉCUE');
    } else if (family === 'vertical-lane') {
      boss.x = 940 + Math.sin(boss.totalTime * 1.6) * 95;
      boss.y = 300 + Math.sin(boss.totalTime * 2.1) * 150;
      if (boss.phase >= 2) bossEvent('lane-cross', 1.15, () => spawnBeamH(GROUND - 150, 0.42, 0.5));
      if (boss.stateTime >= phase.activeSeconds * 0.82) completeExpandedMechanic('AXE SÛR FRANCHI');
    } else if (family === 'gravity-weather') {
      boss.x = 930 + Math.sin(boss.totalTime * 1.25) * 135;
      boss.y = 315 + Math.cos(boss.totalTime * 1.75) * 70;
      if (boss.phase >= 2) bossEvent('environment-orb', 0.95, () => spawnFan(boss.x, boss.y, 4, 195, 2.25, 3.85, 'orb'));
      if (boss.stateTime >= phase.activeSeconds * 0.84) completeExpandedMechanic('ZONE STABILISÉE');
    } else if (family === 'posture-duo') {
      boss.x = lerp(boss.x, clamp(player.x + (boss.direction * 104), 170, 1110), 1 - Math.pow(0.012, dt));
      boss.y = 500;
      if (boss.stateTime > 0.8) bossEvent('duo-counter', 0.82, () => spawnFan(boss.x, boss.y, 4, 205, 2.2, 3.9, 'blade'));
      if (runtime.posture <= 0) completeExpandedMechanic('POSTURE ROMPUE');
    } else if (family === 'puzzle-endgame') {
      boss.x = 925 + Math.sin(boss.totalTime * 1.2) * 120;
      boss.y = 330 + Math.cos(boss.totalTime * 1.7) * 55;
      if (boss.phase >= 2) bossEvent('puzzle-pressure', 1.1, () => spawnMine(clamp(player.x + expandedRandom(-130, 130), 70, 1210), GROUND - 18));
      if (runtime.puzzleIndex >= runtime.puzzleSequence.length) completeExpandedMechanic('SÉQUENCE RÉSOLUE');
    }
  }

  function updateExpandedBoss(dt) {
    const phase = expandedPhase();
    if (!phase || !boss.runtime) return;
    if (boss.state === 'phaseEnter') {
      bossEvent('phase-config', 0, configureExpandedPhase);
      boss.vulnerable = false;
      boss.attackLabel = 'PHASE ' + boss.phase + ' · SYNCHRONISATION';
      if (boss.stateTime > (save.settings.reduceMotion ? 0.42 : 0.72)) setBossState('neutral');
    } else if (boss.state === 'neutral') {
      boss.vulnerable = false;
      boss.x = lerp(boss.x, 930, 1 - Math.pow(0.01, dt));
      boss.y = lerp(boss.y, 380, 1 - Math.pow(0.01, dt));
      boss.attackLabel = 'PHASE ' + boss.phase + ' · POSITIONNEMENT';
      if (boss.stateTime > 0.55) {
        prepareExpandedTelegraph();
        setBossState('telegraph');
      }
    } else if (boss.state === 'telegraph') {
      boss.vulnerable = false;
      const priorityLabel = boss.runtime.priorityPartId ? ' · PRIORITÉ ' + boss.runtime.priorityPartId.toUpperCase().replaceAll('-', ' ') : '';
      boss.attackLabel = 'PHASE ' + boss.phase + ' · TÉLÉGRAPHE ' + boss.runtime.selectedPattern.toUpperCase().replaceAll('-', ' ') + priorityLabel;
      if (boss.stateTime >= phase.telegraphSeconds * (save.settings.difficulty === 'casual' ? 1.25 : 1)) {
        setBossState('active');
        startExpandedActive();
      }
    } else if (boss.state === 'active') {
      boss.vulnerable = false;
      updateExpandedFamilyActive(dt);
      if (boss.runtime.mechanicComplete) enterExpandedVulnerability();
      else if (boss.stateTime >= phase.activeSeconds) setBossState('recovery');
    } else if (boss.state === 'recovery') {
      boss.vulnerable = false;
      boss.runtime.environment = 'stable';
      boss.attackLabel = 'PHASE ' + boss.phase + ' · RÉCUPÉRATION';
      if (boss.stateTime >= phase.recoverySeconds) {
        if (boss.runtime.mechanicComplete) enterExpandedVulnerability();
        else { boss.cycle += 1; setBossState('neutral'); }
      }
    } else if (boss.state === 'vulnerable') {
      boss.vulnerable = true;
      boss.x = lerp(boss.x, 920, 1 - Math.pow(0.004, dt));
      boss.y = lerp(boss.y, 430, 1 - Math.pow(0.004, dt));
      boss.attackLabel = 'PHASE ' + boss.phase + ' · NOYAU FORGE OUVERT';
      if (boss.stateTime >= phase.vulnerabilitySeconds) {
        boss.cycle += 1;
        boss.runtime.signatureCycle += 1;
        boss.runtime.mechanicComplete = false;
        boss.runtime.mechanicProgress = 0;
        boss.runtime.environment = 'stable';
        if (expandedFamily() === 'modules') resetExpandedParts();
        setBossState('neutral');
      }
    }
  }

  function tryExpandedDashCounter() {
    if (!isExpandedBoss() || expandedFamily() !== 'posture-duo' || !['telegraph', 'active'].includes(boss.state)) return false;
    const runtime = boss.runtime;
    runtime.posture = Math.max(0, runtime.posture - 1);
    currentForgeTelemetry.dashCounters += 1;
    if (boss.data.id === 'twin-governors') {
      currentForgeTelemetry.mutualCollisions += 1;
      incrementForgeMetric(runtime.signatureCounters, 'mutualCollisions');
      addFloatingText(boss.x, boss.y - 120, 'GOUVERNEURS EN COLLISION', boss.data.accent);
    }
    runtime.mechanicProgress = runtime.mechanicTarget - runtime.posture;
    addFloatingText(boss.x, boss.y - 92, 'RUPTURE ' + runtime.mechanicProgress + '/' + runtime.mechanicTarget, boss.data.accent);
    spawnBurst(boss.x, boss.y, boss.data.accent, 16, 270);
    if (runtime.posture <= 0) {
      completeExpandedMechanic('POSTURE ROMPUE');
      enterExpandedVulnerability();
    }
    return true;
  }

  function expandedPartWorldHitbox(part) {
    const hitbox = part.hitbox || { x: part.anchor?.x || 0, y: part.anchor?.y || 0, r: 20 };
    return { x: boss.x + hitbox.x, y: boss.y + hitbox.y, r: hitbox.r || 20 };
  }

  function hitExpandedPart(part, amount) {
    if (!part || part.destroyed || !Number.isFinite(part.hp)) return false;
    part.hp = Math.max(0, part.hp - Math.max(1, amount));
    part.state = part.hp <= 0 ? 'destroyed' : part.hp <= part.maxHp * 0.5 ? 'damaged' : 'intact';
    part.destroyed = part.hp <= 0;
    const hitbox = expandedPartWorldHitbox(part);
    spawnBurst(hitbox.x, hitbox.y, part.destroyed ? boss.data.accent : '#dce5f6', part.destroyed ? 16 : 6, part.destroyed ? 260 : 120);
    addFloatingText(hitbox.x, hitbox.y - 20, part.destroyed ? 'PIÈCE DÉTRUITE' : 'MODULE', boss.data.accent);
    if (part.destroyed) {
      part.destroyedAt = boss.totalTime;
      boss.runtime.mechanicProgress += 1;
      currentForgeTelemetry.partsDestroyed.add(boss.phase + ':' + part.id);
      currentForgeTelemetry.uniquePartIds.add(part.id);
      incrementForgeMetric(currentForgeTelemetry.destroyedByRole, part.role);
      if (boss.cycle === 0) incrementForgeMetric(currentForgeTelemetry.firstWindowByRole, part.role);
      if (boss.data.id === 'hive-foreman' && part.role === 'drone' && !boss.runtime.firstPartDestroyedInCycle) {
        boss.runtime.firstPartDestroyedInCycle = true;
        const family = boss.runtime.priorityFamily || boss.runtime.selectedPattern;
        if (!currentForgeTelemetry.priorityDroneFamilies.has(family) && !currentForgeTelemetry.priorityDroneFailures.has(family)) {
          if (part.id === boss.runtime.priorityPartId) currentForgeTelemetry.priorityDroneFamilies.add(family);
          else currentForgeTelemetry.priorityDroneFailures.add(family);
        }
      }
      if (boss.data.id === 'breaker-array' && part.role === 'module') currentForgeTelemetry.cleanBreakerModules.add(part.id);
      if (boss.data.id === 'floodline-leviathan' && part.role === 'valve') {
        const pressureCycle = boss.phase + ':' + boss.cycle;
        if (!currentForgeTelemetry.valvesByPressureCycle.has(pressureCycle)) currentForgeTelemetry.valvesByPressureCycle.set(pressureCycle, new Set());
        const valves = currentForgeTelemetry.valvesByPressureCycle.get(pressureCycle);
        valves.add(part.id);
        currentForgeTelemetry.maximumValvesInPressureCycle = Math.max(currentForgeTelemetry.maximumValvesInPressureCycle, valves.size);
      }
      if (part.role === 'condensator') {
        boss.runtime.resource = Math.min(100, boss.runtime.resource + 38);
        boss.runtime.resourceEmpty = false;
      }
      if (expandedFamily() === 'modules') {
        const remaining = boss.runtime.parts.filter(candidate => EXPANDED_ATTACKABLE_ROLES.has(candidate.role) && !candidate.destroyed);
        boss.runtime.mechanicTarget = Math.max(boss.runtime.mechanicProgress, boss.runtime.mechanicProgress + remaining.length);
        if (!remaining.length) completeExpandedMechanic('RÉSEAU DÉMONTÉ');
      }
    }
    return true;
  }

  function resolveExpandedPlayerShot(shot) {
    if (!isExpandedBoss() || !boss.runtime || boss.defeated) return false;
    for (const projectile of enemyShots) {
      if (projectile.type !== 'reflectOrb' || projectile.friendly) continue;
      if (!circleHit(shot.x, shot.y, shot.r, projectile.x, projectile.y, projectile.r + 5)) continue;
      const angle = Math.atan2(boss.weakY - projectile.y, boss.weakX - projectile.x);
      const speed = 660 + boss.phase * 45;
      projectile.vx = Math.cos(angle) * speed;
      projectile.vy = Math.sin(angle) * speed;
      projectile.friendly = true;
      projectile.reflected = true;
      projectile.damage = 0;
      projectile.life = Math.max(projectile.life, 2.2);
      spawnBurst(projectile.x, projectile.y, boss.data.accent, 10, 210);
      sfx('deflect');
      return true;
    }
    if (expandedFamily() === 'puzzle-endgame' && ['telegraph', 'active'].includes(boss.state)) {
      for (const node of boss.runtime.puzzleNodes) {
        if (node.active || !circleHit(shot.x, shot.y, shot.r, node.x, node.y, node.r)) continue;
        const expected = boss.runtime.puzzleSequence[boss.runtime.puzzleIndex];
        if (node.id === expected) {
          node.active = true;
          boss.runtime.puzzleIndex += 1;
          boss.runtime.mechanicProgress = boss.runtime.puzzleIndex;
          boss.runtime.mechanicTarget = boss.runtime.puzzleSequence.length;
          addFloatingText(node.x, node.y - 32, 'FORME ' + boss.runtime.puzzleIndex, boss.data.accent);
          if (boss.runtime.puzzleIndex >= boss.runtime.puzzleSequence.length) completeExpandedMechanic('SÉQUENCE RÉSOLUE');
        } else {
          currentForgeTelemetry.puzzleErrors += 1;
          if (boss.data.id === 'logic-crucible') {
            currentForgeTelemetry.manualSequenceResets += 1;
            boss.runtime.puzzleIndex = 0;
            boss.runtime.mechanicProgress = 0;
            boss.runtime.puzzleNodes.forEach(candidate => { candidate.active = false; });
            addFloatingText(node.x, node.y - 32, 'SÉQUENCE RÉINITIALISÉE', '#f5d59f');
          } else {
            addFloatingText(node.x, node.y - 32, 'ORDRE INCHANGÉ', '#f5d59f');
          }
        }
        return true;
      }
    }
    if (!['intro', 'phaseEnter', 'phaseTransition', 'defeat'].includes(boss.state)) {
      for (const part of boss.runtime.parts) {
        if (!EXPANDED_ATTACKABLE_ROLES.has(part.role)) continue;
        const hitbox = expandedPartWorldHitbox(part);
        if (!circleHit(shot.x, shot.y, shot.r, hitbox.x, hitbox.y, hitbox.r)) continue;
        if (part.destroyed) {
          const firedAfterShutdown = Number.isFinite(shot.forgeCreatedAt) && Number.isFinite(part.destroyedAt) && shot.forgeCreatedAt > part.destroyedAt;
          if (boss.data.id === 'breaker-array' && part.role === 'module' && firedAfterShutdown) {
            currentForgeTelemetry.offlineBreakerModuleHits += 1;
            addFloatingText(hitbox.x, hitbox.y - 20, 'MODULE HORS LIGNE', '#f5d59f');
            return true;
          }
          continue;
        }
        return hitExpandedPart(part, shot.damage || runBuild.shotDamage);
      }
    }
    return false;
  }

  function updatePlayer(dt) {
    const moveLeft = inputDown('ArrowLeft', 'KeyA', 'KeyQ') || touchDown('left') || controller.left;
    const moveRight = inputDown('ArrowRight', 'KeyD') || touchDown('right') || controller.right;
    const jumpPress = inputPressed('ArrowUp', 'KeyW', 'Space') || touchWasPressed('jump') || controller.jumpPressed;
    const dashPress = inputPressed('ShiftLeft', 'ShiftRight', 'KeyK') || touchWasPressed('dash') || controller.dashPressed;
    const overloadPress = inputPressed('KeyL', 'KeyX') || touchWasPressed('overload') || controller.overloadPressed;
    const attackHeld = inputDown('KeyJ', 'KeyZ', 'KeyC') || touchDown('attack') || pointer.attack || controller.attack;

    player.anim += dt * (Math.abs(player.vx) > 20 ? 12 : 4);
    player.invuln = Math.max(0, player.invuln - dt);
    player.shotCooldown = Math.max(0, player.shotCooldown - dt);
    player.poseRecoil = Math.max(0, player.poseRecoil - dt * 12);
    player.poseLand = Math.max(0, player.poseLand - dt * 7.5);
    player.dashCooldown = Math.max(0, player.dashCooldown - dt);
    player.dashTime = Math.max(0, player.dashTime - dt);
    player.dashHitLock = Math.max(0, player.dashHitLock - dt);
    player.overloadTime = Math.max(0, player.overloadTime - dt);
    player.slowTime = Math.max(0, player.slowTime - dt);
    const aimResponse = 1 - Math.pow(0.00008, dt);
    player.poseAim += ((attackHeld ? 1 : 0) - player.poseAim) * aimResponse;
    const chronoFactor = player.slowTime > 0 ? 0.58 : 1;
    if (overloadPress) activateOverload();

    if (moveLeft !== moveRight && player.dashTime <= 0) {
      const direction = moveRight ? 1 : -1;
      player.facing = direction;
      player.vx += direction * runBuild.moveAccel * chronoFactor * dt;
    } else if (player.dashTime <= 0) {
      player.vx *= Math.pow(0.0008, dt);
    }

    if (jumpPress && player.jumpsLeft > 0) {
      noteExpandedInput('jump');
      player.vy = -runBuild.jumpPower;
      player.jumpsLeft -= 1;
      player.onGround = false;
      spawnBurst(player.x, player.y + 30, '#8defff', 8, 150);
      sfx('jump');
    }

    if (dashPress && player.dashCooldown <= 0) {
      noteExpandedInput('dash');
      player.dashTime = 0.19;
      player.dashCooldown = runBuild.dashCooldown;
      player.invuln = Math.max(player.invuln, 0.24);
      player.vx = player.facing * 940;
      player.vy *= 0.25;
      spawnBurst(player.x, player.y, '#65e8ff', 14, 270);
      spawnGeneratedVfx('dash-shockwave', player.x - player.facing * 12, player.y + 8, {
        size: 112,
        duration: 0.3,
        rotation: player.facing < 0 ? Math.PI : 0,
        growth: 0.7
      });
      shake(5);
      haptic(18);
      sfx('dash');
    }

    if (attackHeld && player.shotCooldown <= 0) {
      noteExpandedInput('shot');
      player.shotCooldown = runBuild.fireRate;
      player.poseRecoil = 1;
      const spread = runBuild.multishot === 1 ? [0] : [-0.11, 0, 0.11];
      const muzzle = playerMuzzlePosition();
      for (const angle of spread) {
        playerShots.push({
          x: muzzle.x,
          y: muzzle.y,
          vx: player.facing * runBuild.projectileSpeed,
          vy: angle * runBuild.projectileSpeed,
          r: 7,
          damage: runBuild.shotDamage,
          forgeCreatedAt: boss?.totalTime ?? null,
          life: 1.25,
          trail: 0
        });
      }
      spawnGeneratedVfx('muzzle-cyan', muzzle.x, muzzle.y, {
        size: 52,
        duration: 0.16,
        rotation: player.facing < 0 ? Math.PI : 0,
        growth: 0.25
      });
      sfx('shot');
    }

    if (player.dashTime <= 0) {
      player.vx = clamp(player.vx, -runBuild.maxSpeed * chronoFactor, runBuild.maxSpeed * chronoFactor);
      player.vy += 1880 * dt;
    } else {
      particles.push({ x: player.x - player.facing * 24, y: player.y + rand(-20, 20), vx: -player.facing * rand(120, 280), vy: rand(-50, 50), life: 0.28, max: 0.28, size: rand(3, 8), color: '#77efff' });
    }

    applyExpandedArenaForces(dt);
    player.x += player.vx * dt;
    player.y += player.vy * dt;
    player.x = clamp(player.x, 28, W - 28);

    const floorY = GROUND - player.h / 2;
    player.landed = false;
    if (player.y >= floorY) {
      if (!player.onGround && player.vy > 220) {
        player.landed = true;
        player.poseLand = 1;
        spawnDust(player.x, GROUND - (heroArtReady() ? RIVA_ROAD_LIFT : 0), 7);
      }
      player.y = floorY;
      player.vy = 0;
      player.onGround = true;
      player.jumpsLeft = 2;
    } else {
      player.onGround = false;
    }

    if (player.y > H + 80) {
      hurtPlayer(1, player.x < W / 2 ? 1 : -1);
      player.x = 180;
      player.y = 300;
      player.vy = 0;
    }

    if (boss && !boss.hidden && !boss.defeated && overlapsPlayerBoss()) {
      if (player.dashTime > 0 && player.dashHitLock <= 0 && boss.dashHitCooldown <= 0 && tryExpandedDashCounter()) {
        player.dashHitLock = 0.5;
        boss.dashHitCooldown = 0.5;
        player.vx = -player.facing * 520;
        player.vy = -320;
      } else if (player.dashTime > 0 && boss.vulnerable && player.dashHitLock <= 0 && boss.dashHitCooldown <= 0) {
        damageBoss(runBuild.dashDamage, 'dash');
        player.dashHitLock = 0.5;
        boss.dashHitCooldown = 0.5;
        player.vx = -player.facing * 520;
        player.vy = -320;
      } else {
        hurtPlayer(1, player.x < boss.x ? -1 : 1, boss.data.id === 'mantis' && boss.state === 'dash' ? 'bossDash' : 'contact');
      }
    }
  }

  function updatePlayerShots(dt) {
    for (let i = playerShots.length - 1; i >= 0; i--) {
      const shot = playerShots[i];
      shot.x += shot.vx * dt;
      shot.y += shot.vy * dt;
      shot.life -= dt;
      shot.trail += dt;
      if (shot.trail >= 0.025) {
        shot.trail = 0;
        particles.push({ x: shot.x, y: shot.y, vx: -shot.vx * 0.05 + rand(-30,30), vy: rand(-25,25), life: 0.22, max: 0.22, size: rand(2,5), color: '#8defff' });
      }
      if (resolveExpandedPlayerShot(shot)) {
        playerShots.splice(i, 1);
        continue;
      }
      if (boss && !boss.hidden && !boss.defeated && circleHit(shot.x, shot.y, shot.r, boss.weakX, boss.weakY, boss.weakR)) {
        if (boss.vulnerable) {
          let shotDamage = shot.damage || runBuild.shotDamage;
          let precision = false;
          if (player && runBuild.precisionEvery > 0) {
            player.precisionHits += 1;
            precision = player.precisionHits % runBuild.precisionEvery === 0;
            if (precision) shotDamage *= 1 + runBuild.precisionBonus;
          }
          damageBoss(shotDamage, 'shot');
          addFloatingText(shot.x, shot.y - 18, precision ? 'SURTENSION' : 'CORE HIT', precision ? '#fff39a' : boss.data.accent);
        } else {
          spawnBurst(shot.x, shot.y, '#dce5f6', 5, 115);
          spawnGeneratedVfx('shield-hit', shot.x, shot.y, { size: 64, duration: 0.28, growth: 0.42 });
          addFloatingText(shot.x, shot.y - 12, 'BLINDAGE', '#a9b2cc');
          sfx('deflect');
        }
        playerShots.splice(i, 1);
        if (boss?.defeated || boss?.state === 'phaseTransition') {
          playerShots.length = 0;
          break;
        }
      } else if (shot.life <= 0 || shot.x < -40 || shot.x > W + 40) {
        playerShots.splice(i, 1);
      }
    }
  }

  function enduranceRoundGateOpen(phase = boss?.phase ?? 1) {
    return boss?.data.id !== 'endurance-engine' || currentForgeTelemetry.enduranceRounds.has(phase * 2);
  }

  function phaseHealthFloor(phase = boss?.phase ?? 1) {
    if (!boss) return 0;
    if (boss.data.id === 'endurance-engine' && !enduranceRoundGateOpen(phase)) {
      const trainingFloors = { 1: 5 / 6, 2: 1 / 2, 3: 1 / 6 };
      return Math.ceil(boss.maxHp * trainingFloors[phase]);
    }
    if (phase >= 3) return 0;
    return phase === 1 ? Math.ceil(boss.maxHp * 2 / 3) : Math.ceil(boss.maxHp / 3);
  }

  function beginPhaseTransition(nextPhase) {
    if (!boss || boss.defeated || nextPhase <= boss.phase || boss.state === 'phaseTransition') return false;
    boss.phase = Math.min(3, nextPhase);
    boss.state = 'phaseTransition';
    boss.stateTime = 0;
    boss.events = Object.create(null);
    boss.vulnerable = false;
    if (boss.data.id === 'endurance-engine' && boss.runtime) {
      boss.runtime.signatureCycle = 0;
      boss.runtime.roundGateAnnounced = false;
    }
    boss.hidden = false;
    boss.vx = 0;
    boss.vy = 0;
    const narrative = phaseNarrative(boss.phase);
    boss.attackLabel = narrative ? narrative.title : 'TRANSFORMATION · PHASE ' + boss.phase;
    if (narrative) showRadioExchange('PHASE ' + boss.phase + ' · ' + narrative.title, narrative.lines);
    if (player && runBuild.phaseRepair > 0 && player.hp < player.maxHp) {
      const repaired = Math.min(runBuild.phaseRepair, player.maxHp - player.hp);
      player.hp += repaired;
      if (isExpandedBoss()) currentForgeTelemetry.healsUsed += repaired;
      spawnGeneratedVfx('scrap-glow', player.x, player.y, { size: 92, duration: 0.55, growth: 0.45 });
      addFloatingText(player.x, player.y - 54, '+' + repaired + ' NOYAU', '#8dffb2');
      announce('Auto-réparation : ' + repaired + ' noyau restauré.');
    }
    if (!fightClockRunning) startFightClock();
    playerShots.length = 0;
    enemyShots.length = 0;
    flash = 0.2;
    shake(12);
    showToast(boss.data.name + ' · TRANSFORMATION PHASE ' + boss.phase);
    spawnBurst(boss.x, boss.y, boss.data.accent, 32, 390);
    sfx('overload');
    return true;
  }

  function updateBoss(dt) {
    if (!boss || boss.defeated) return;
    boss.stateTime += dt;
    boss.totalTime += dt;
    boss.hitFlash = Math.max(0, boss.hitFlash - dt);
    boss.dashHitCooldown = Math.max(0, boss.dashHitCooldown - dt);
    boss.rotation += dt;

    if (boss.state === 'phaseTransition') {
      boss.vulnerable = false;
      boss.hidden = false;
      boss.attackLabel = 'TRANSFORMATION · PHASE ' + boss.phase;
      boss.x = lerp(boss.x, 930, 1 - Math.pow(0.004, dt));
      boss.y = lerp(boss.y, 350, 1 - Math.pow(0.004, dt));
      updateWeakPoint();
      if (boss.stateTime > (save.settings.reduceMotion ? 0.65 : 1.15)) {
        setBossState(initialStateForBoss());
        if (boss.phase === 3 && boss.data.id === 'drill') startMasteryCycle('eruption');
        if (boss.phase === 3 && boss.data.id === 'mantis') startMasteryCycle('dash');
      }
      return;
    }

    if (boss.state === 'intro') {
      boss.attackLabel = 'ANALYSE DU PILOTE';
      boss.x = 990 + Math.sin(boss.totalTime * 2) * 12;
      boss.y = 330 + Math.sin(boss.totalTime * 2.8) * 9;
      updateWeakPoint();
      if (introTimer <= 0) {
        setBossState(initialStateForBoss());
        startFightClock();
      }
      return;
    }

    switch (boss.data.id) {
      case 'rammer': updateRammer(dt); break;
      case 'kraken': updateKraken(dt); break;
      case 'drill': updateDrill(dt); break;
      case 'mantis': updateMantis(dt); break;
      case 'cyclotron': updateCyclotron(dt); break;
      case 'omega': updateOmega(dt); break;
      default: updateExpandedBoss(dt); break;
    }
    updateWeakPoint();
  }

  function initialStateForBoss() {
    return {
      rammer: 'patrol',
      kraken: 'orbit',
      drill: 'burrow',
      mantis: 'dashTelegraph',
      cyclotron: 'roll',
      omega: 'arsenal'
    }[boss.data.id] || (isExpandedBoss() ? 'phaseEnter' : 'neutral');
  }

  function updateRammer(dt) {
    if (boss.state === 'patrol') {
      boss.attackLabel = combatLabel('patrol', 'SALVE DE RIVETS', true);
      boss.vulnerable = false;
      boss.x = 970 + Math.sin(boss.totalTime * 1.8) * 95;
      boss.y = 455 + Math.sin(boss.totalTime * 3.2) * 14;
      const rocketTimings = boss.phase === 1 ? [0.45, 1.2] : boss.phase === 2 ? [0.32, 0.88, 1.44] : [0.22, 0.65, 1.08, 1.51];
      rocketTimings.forEach((time, index) => bossEvent('rocket' + index, time, () => spawnRocket(boss.x - 70 + index * 28, boss.y - 35 - index * 5)));
      if (boss.stateTime > 2.2 - boss.phase * 0.12) setBossState('slamTelegraph');
    } else if (boss.state === 'slamTelegraph') {
      boss.attackLabel = combatLabel('slamTelegraph', 'IMPACT EN APPROCHE');
      const target = clamp(player.x, 520, 1110);
      boss.x = lerp(boss.x, target, 1 - Math.pow(0.002, dt));
      boss.y = lerp(boss.y, 260, 1 - Math.pow(0.002, dt));
      if (boss.stateTime > 0.85) {
        boss.vy = 0;
        setBossState('slam');
      }
    } else if (boss.state === 'slam') {
      boss.attackLabel = combatLabel('slam', 'FERRO-IMPACT');
      boss.vy += (2450 + boss.phase * 260) * dt;
      boss.y += boss.vy * dt;
      if (boss.y >= 510) {
        boss.y = 510;
        boss.vy = 0;
        spawnShockwaves(boss.x, boss.phase === 1 ? 2 : 3);
        spawnBurst(boss.x, GROUND - 20, '#ffb14a', 26, 400);
        shake(14);
        flash = 0.13;
        sfx('slam');
        setBossState('exposed');
      }
    } else if (boss.state === 'exposed') {
      boss.attackLabel = combatLabel('exposed', 'RÉACTEUR OUVERT');
      boss.vulnerable = true;
      boss.y = 510 + Math.sin(boss.stateTime * 7) * 3;
      bossEvent('mine', 0.72, () => spawnMine(boss.x - 130, GROUND - 18));
      if (boss.phase >= 2) bossEvent('mine2', 1.18, () => spawnMine(boss.x + 140, GROUND - 18));
      if (boss.stateTime > 2.75 - boss.phase * 0.2) {
        boss.cycle++;
        setBossState('patrol');
      }
    }
  }

  function updateKraken(dt) {
    if (boss.state === 'orbit') {
      boss.attackLabel = combatLabel('orbit', 'SALVES IONIQUES', true);
      boss.x = 890 + Math.cos(boss.totalTime * 1.15) * 165;
      boss.y = 250 + Math.sin(boss.totalTime * 1.8) * 75;
      const fanTimings = boss.phase === 1 ? [0.4, 1.25, 2.1] : boss.phase === 2 ? [0.3, 0.95, 1.6, 2.25] : [0.22, 0.75, 1.28, 1.81, 2.34];
      fanTimings.forEach((time, index) => bossEvent('fan' + index, time, () => spawnFan(boss.x, boss.y + 20, 4 + boss.phase, 220 + boss.phase * 28, 2.05, 3.82, 'orb')));
      if (boss.stateTime > 2.65) setBossState('beam');
    } else if (boss.state === 'beam') {
      boss.attackLabel = combatLabel('beam', 'GRILLE DE FOUDRE');
      boss.x = lerp(boss.x, 970, 1 - Math.pow(0.01, dt));
      boss.y = lerp(boss.y, 230, 1 - Math.pow(0.01, dt));
      bossEvent('beam1', 0.15, () => spawnBeamV(clamp(player.x, 120, 1160), 0.75, 0.55));
      bossEvent('beam2', 0.62, () => spawnBeamV(clamp(player.x + rand(-180, 180), 100, 1180), 0.68, 0.5));
      bossEvent('beam3', 1.02, () => spawnBeamH(GROUND - 92, 0.7, 0.48));
      if (boss.phase >= 2) bossEvent('beam4', 1.35, () => spawnBeamV(210 + boss.phase * 170, 0.62, 0.5));
      if (boss.phase >= 3) bossEvent('beam5', 1.62, () => spawnBeamH(GROUND - 168, 0.58, 0.46));
      if (boss.stateTime > 2.05) setBossState('exposed');
    } else if (boss.state === 'exposed') {
      boss.attackLabel = combatLabel('exposed', 'CONDENSATEUR DÉPLOYÉ');
      boss.vulnerable = true;
      boss.x = lerp(boss.x, 930, 1 - Math.pow(0.003, dt));
      boss.y = lerp(boss.y, 425, 1 - Math.pow(0.003, dt));
      bossEvent('orb', 1.05, () => spawnFan(boss.x, boss.y, 4, 185, 2.4, 3.88, 'orb'));
      if (boss.stateTime > 2.75 - boss.phase * 0.2) {
        boss.cycle++;
        setBossState('orbit');
      }
    }
  }

  function updateDrill(dt) {
    if (boss.state === 'burrow') {
      boss.attackLabel = combatLabel('burrow', 'POLARITÉ SOUTERRAINE', true);
      boss.hidden = true;
      boss.vulnerable = false;
      if (boss.phase >= 2) {
        const polarity = boss.cycle % 2 === 0 ? 1 : -1;
        player.vx += clamp((boss.targetX - player.x) * 0.9 * polarity, -520, 520) * dt;
      }
      bossEvent('warning', 0.05, () => {
        boss.targetX = clamp(player.x + rand(-90, 90), 150, 1130);
        enemyShots.push({ type: 'warningCircle', x: boss.targetX, y: GROUND - 8, age: 0, life: 1.05, r: 74, damage: 0 });
      });
      if (boss.stateTime > 0.92) {
        boss.x = boss.targetX;
        boss.y = GROUND + 100;
        boss.vy = -1060;
        boss.hidden = false;
        setBossState('erupt');
      }
    } else if (boss.state === 'erupt') {
      boss.attackLabel = combatLabel('erupt', 'ÉRUPTION MAGNÉTIQUE');
      boss.vy += 1560 * dt;
      boss.y += boss.vy * dt;
      bossEvent('rocks', 0.05, () => {
        for (let i = 0; i < 4 + boss.phase * 2; i++) spawnRock(boss.x + rand(-100, 100), GROUND - rand(20, 80), rand(-330, 330), rand(-740, -400));
        spawnShockwaves(boss.x, 1);
        shake(10);
        sfx('slam');
      });
      if (boss.y > GROUND + 115 && boss.stateTime > 0.9) {
        boss.subCount++;
        if (boss.subCount >= 1 + boss.phase) {
          boss.subCount = 0;
          boss.x = 920;
          boss.y = 500;
          if (boss.phase === 3) finishMasteryCycle('eruption');
          setBossState('exposed');
        } else {
          setBossState('burrow');
        }
      }
    } else if (boss.state === 'exposed') {
      boss.hidden = false;
      boss.attackLabel = combatLabel('exposed', 'FOREUSE EN SURCHAUFFE');
      boss.vulnerable = true;
      boss.x = lerp(boss.x, 920, 1 - Math.pow(0.003, dt));
      boss.y = lerp(boss.y, 500, 1 - Math.pow(0.003, dt));
      bossEvent('debris1', 0.45, () => spawnRock(player.x + rand(-120, 120), -30, rand(-80, 80), 80));
      bossEvent('debris2', 1.1, () => spawnRock(player.x + rand(-180, 180), -30, rand(-80, 80), 70));
      if (boss.phase >= 2) bossEvent('polarityBeam', 1.45, () => spawnBeamV(clamp(player.x, 100, 1180), 0.62, 0.42));
      if (boss.phase >= 3) bossEvent('polarityBurst', 1.9, () => spawnFan(boss.x, boss.y, 8, 190, 0, TAU, 'orb'));
      if (boss.stateTime > 2.75) {
        if (boss.phase === 3) startMasteryCycle('eruption');
        boss.cycle++;
        setBossState('burrow');
      }
    }
  }

  function updateMantis(dt) {
    if (boss.state === 'dashTelegraph') {
      boss.attackLabel = combatLabel('dashTelegraph', 'TRAJECTOIRE CHRONO', true);
      boss.x = boss.direction < 0 ? 1100 : 180;
      boss.y = 430 - boss.subCount * 70;
      if (boss.phase >= 2) bossEvent('chronoField', 0.04, () => spawnChronoField(clamp(player.x, 110, 1170), GROUND - 42, boss.phase === 3 ? 112 : 92));
      if (boss.stateTime > 0.74 - boss.phase * 0.1) {
        boss.vx = boss.direction * (1120 + boss.phase * 180);
        setBossState('dash');
      }
    } else if (boss.state === 'dash') {
      boss.attackLabel = combatLabel('dash', 'LAMES DÉPHASÉES');
      boss.x += boss.vx * dt * difficulty().enemySpeed;
      bossEvent('blade1', 0.08, () => spawnBlade(boss.x, boss.y + 15, -boss.direction * 370, -120));
      bossEvent('blade2', 0.34, () => spawnBlade(boss.x, boss.y - 25, -boss.direction * 330, 90));
      if (boss.phase >= 2) bossEvent('chronoGear', 0.2, () => spawnBlade(boss.x, boss.y - 70, -boss.direction * 420, -40));
      if ((boss.direction < 0 && boss.x < 125) || (boss.direction > 0 && boss.x > 1155)) {
        boss.direction *= -1;
        boss.subCount++;
        shake(6);
        if (boss.subCount >= 2 + boss.phase) {
          boss.subCount = 0;
          if (boss.phase === 3) finishMasteryCycle('dash');
          setBossState('overheat');
        } else {
          setBossState('dashTelegraph');
        }
      }
    } else if (boss.state === 'overheat') {
      boss.attackLabel = combatLabel('overheat', 'SERVOMOTEURS EXPOSÉS');
      boss.vulnerable = true;
      boss.x = lerp(boss.x, 930, 1 - Math.pow(0.003, dt));
      boss.y = lerp(boss.y, 440, 1 - Math.pow(0.003, dt));
      bossEvent('blade', 0.9, () => spawnFan(boss.x, boss.y, 2 + boss.phase, 180 + boss.phase * 18, 2.45, 3.82, 'blade'));
      if (boss.phase >= 3) bossEvent('timeLine', 1.45, () => spawnBeamH(GROUND - 142, 0.72, 0.5));
      if (boss.stateTime > 2.65) {
        if (boss.phase === 3) startMasteryCycle('dash');
        boss.cycle++;
        setBossState('dashTelegraph');
      }
    }
  }

  function updateCyclotron(dt) {
    if (boss.state === 'roll') {
      boss.attackLabel = combatLabel('roll', 'PISTONS EN MARCHE', true);
      boss.vulnerable = false;
      const speed = (260 + boss.phase * 60) * difficulty().enemySpeed;
      boss.x += boss.direction * speed * dt;
      boss.y = 485 + Math.sin(boss.rotation * 3) * 7;
      boss.rotation += dt * boss.direction * 2.7;
      if (boss.x < 250 || boss.x > 1080) {
        boss.direction *= -1;
        boss.x = clamp(boss.x, 250, 1080);
        spawnShockwaves(boss.x, 1);
        shake(8);
      }
      const mineCount = 2 + boss.phase;
      for (let index = 0; index < mineCount; index++) bossEvent('mine' + index, 0.45 + index * 0.62, () => spawnMine(boss.x + rand(-90, 90), GROUND - 20));
      if (boss.phase >= 3) bossEvent('lavaLine', 1.75, () => spawnBeamH(GROUND - 34, 0.78, 0.55));
      if (boss.stateTime > 3.3) setBossState('bombRain');
    } else if (boss.state === 'bombRain') {
      boss.attackLabel = combatLabel('bombRain', 'PLUIE DE MÉTAL EN FUSION');
      boss.x = lerp(boss.x, 900, 1 - Math.pow(0.01, dt));
      boss.y = lerp(boss.y, 270, 1 - Math.pow(0.01, dt));
      for (let i = 0; i < 4 + boss.phase * 2; i++) {
        bossEvent(`bomb${i}`, 0.2 + i * 0.32, () => spawnBomb(120 + ((i * 173 + boss.cycle * 91) % 1020), -30));
      }
      if (boss.phase >= 2) bossEvent('piston', 1.5, () => spawnBeamV(clamp(player.x + 180, 100, 1180), 0.65, 0.5));
      if (boss.stateTime > 2.5) setBossState('crashTelegraph');
    } else if (boss.state === 'crashTelegraph') {
      boss.attackLabel = combatLabel('crashTelegraph', 'CHUTE DE PRESSE EN APPROCHE');
      boss.x = lerp(boss.x, clamp(player.x, 300, 1080), 1 - Math.pow(0.006, dt));
      boss.y = lerp(boss.y, 230, 1 - Math.pow(0.006, dt));
      if (boss.stateTime > 0.82) {
        boss.vy = 0;
        setBossState('crash');
      }
    } else if (boss.state === 'crash') {
      boss.attackLabel = combatLabel('crash', 'CHUTE DE PRESSE');
      boss.vy += (2600 + boss.phase * 280) * dt;
      boss.y += boss.vy * dt;
      if (boss.y >= 492) {
        boss.y = 492;
        boss.vy = 0;
        spawnShockwaves(boss.x, 2);
        spawnBurst(boss.x, GROUND - 20, '#bd6cff', 32, 450);
        shake(16);
        flash = 0.15;
        sfx('slam');
        setBossState('exposed');
      }
    } else if (boss.state === 'exposed') {
      boss.attackLabel = combatLabel('exposed', 'NOYAU DE PRESSE OUVERT');
      boss.vulnerable = true;
      boss.y = 492 + Math.sin(boss.stateTime * 8) * 5;
      if (boss.stateTime > 2.55) {
        boss.cycle++;
        setBossState('roll');
      }
    }
  }

  function updateOmega(dt) {
    const speedBonus = 1 + (boss.phase - 1) * 0.12;

    if (boss.state === 'arsenal') {
      boss.attackLabel = combatLabel('arsenal', 'ARSENAL ROYAL', true);
      boss.x = 900 + Math.sin(boss.totalTime * 1.25 * speedBonus) * 150;
      boss.y = 245 + Math.cos(boss.totalTime * 1.9) * 55;
      const timings = boss.phase === 1 ? [0.35, 1.1, 1.85] : boss.phase === 2 ? [0.25, 0.85, 1.45, 2.05] : [0.2, 0.65, 1.1, 1.55, 2.0];
      timings.forEach((t, i) => bossEvent(`arsenal${i}`, t, () => {
        if (i % 2 === 0) spawnRocket(boss.x + rand(-45,45), boss.y - 25);
        else spawnFan(boss.x, boss.y + 20, 5 + boss.phase, 230 + boss.phase * 15, 2.15, 3.8, 'orb');
      }));
      if (boss.phase >= 2) bossEvent('magneticDebris', 0.52, () => spawnRock(player.x + rand(-120, 120), -30, rand(-65, 65), 90));
      if (boss.phase >= 3) bossEvent('chronoTrap', 1.28, () => spawnChronoField(clamp(player.x, 120, 1160), GROUND - 42, 98));
      if (boss.stateTime > 2.55) setBossState('laserGrid');
    } else if (boss.state === 'laserGrid') {
      boss.attackLabel = combatLabel('laserGrid', 'ÉCHIQUIER LASER', true);
      boss.x = lerp(boss.x, 960, 1 - Math.pow(0.008, dt));
      boss.y = lerp(boss.y, 220, 1 - Math.pow(0.008, dt));
      const columns = boss.phase + 1;
      for (let i = 0; i < columns; i++) {
        bossEvent(`gridv${i}`, 0.12 + i * 0.34, () => spawnBeamV(clamp(player.x + (i - columns / 2) * 170, 90, 1190), 0.62, 0.46));
      }
      bossEvent('gridh', 0.7, () => spawnBeamH(GROUND - (boss.phase === 3 ? 138 : 92), 0.68, 0.46));
      if (boss.phase >= 2) bossEvent('roadShock', 1.05, () => spawnShockwaves(boss.x, 2));
      if (boss.phase >= 3) bossEvent('foundryMine', 1.48, () => spawnMine(clamp(player.x + 130, 80, 1200), GROUND - 18));
      if (boss.stateTime > 1.55 + columns * 0.2) setBossState('coreOpen');
    } else if (boss.state === 'coreOpen') {
      boss.attackLabel = combatLabel('coreOpen', 'NOYAU OMÉGA OUVERT', true);
      boss.vulnerable = true;
      boss.x = lerp(boss.x, 910, 1 - Math.pow(0.003, dt));
      boss.y = lerp(boss.y, 390, 1 - Math.pow(0.003, dt));
      if (boss.phase >= 2) bossEvent('counter1', 0.8, () => spawnBlade(boss.x - 80, boss.y, -320, -80));
      if (boss.phase >= 3) bossEvent('counter2', 1.35, () => spawnMine(player.x + rand(-90, 90), GROUND - 18));
      const window = boss.phase === 1 ? 2.55 : boss.phase === 2 ? 2.25 : 1.95;
      if (boss.stateTime > window) {
        boss.cycle++;
        setBossState('arsenal');
      }
    }
  }

  function updateWeakPoint() {
    const weak = BOSS_WEAK_POINTS[boss.data.id] || boss.data.weakPoint || { x: 0, y: -8, r: 32 };
    boss.weakX = boss.x + weak.x;
    boss.weakY = boss.y + weak.y;
    boss.weakR = weak.r;
  }

  function damageBoss(amount, source = 'shot') {
    if (!boss || boss.defeated || boss.state === 'phaseTransition') return 0;
    const overloadMultiplier = player?.overloadTime > 0 ? 1.65 : 1;
    const requested = Math.max(1, Math.round(amount * overloadMultiplier));
    const previousHp = boss.hp;
    const floor = phaseHealthFloor();
    const phaseGateOpen = enduranceRoundGateOpen();
    boss.hp = Math.max(floor, boss.hp - requested);
    const actualDamage = previousHp - boss.hp;
    if (actualDamage <= 0) {
      if (!phaseGateOpen && boss.state === 'vulnerable' && !boss.runtime?.roundGateAnnounced) {
        boss.runtime.roundGateAnnounced = true;
        showToast('ENDURANCE · MANCHE ' + (boss.phase * 2) + ' REQUISE');
        announce('Endurance Engine : termine la seconde manche de cette phase.');
      }
      return 0;
    }
    if (isExpandedBoss() && player) {
      if (expandedFamily() === 'vertical-lane') currentForgeTelemetry.laneHits.add(Math.min(2, Math.floor(player.x / (W / 3))));
      if (expandedFamily() === 'gravity-weather') {
        const quadrant = (player.x < W / 2 ? 'left' : 'right') + (player.y < GROUND - 120 ? '-high' : '-low');
        currentForgeTelemetry.gravityQuadrants.add(quadrant);
      }
    }
    combo = comboTimer > 0 ? combo + 1 : 1;
    comboTimer = runBuild.comboWindow;
    maxCombo = Math.max(maxCombo, combo);
    if (player) player.overload = clamp(player.overload + actualDamage * 1.75 * runBuild.overloadGain, 0, 100);
    boss.hitFlash = 0.12;
    const comboMultiplier = 1 + Math.min(1.5, Math.max(0, combo - 1) * 0.06);
    score += Math.round(actualDamage * 25 * comboMultiplier * difficulty().scoreMultiplier);
    shake(actualDamage >= 10 ? 8 : 3);
    spawnBurst(boss.weakX, boss.weakY, boss.data.accent, actualDamage >= 10 ? 18 : 9, actualDamage >= 10 ? 310 : 180);
    spawnGeneratedVfx(player?.overloadTime > 0 ? 'magnetic-spark' : 'impact-metal', boss.weakX, boss.weakY, {
      size: actualDamage >= 10 ? 98 : 68,
      duration: actualDamage >= 10 ? 0.42 : 0.27,
      growth: actualDamage >= 10 ? 0.66 : 0.4
    });
    sfx(actualDamage >= 10 ? 'heavyHit' : 'hit');
    if (boss.hp <= 0) {
      currentBossFinishSource = source;
      currentBossOverloadFinish = player?.overloadTime > 0;
      defeatBoss();
    } else if (boss.hp <= floor && boss.phase < 3 && phaseGateOpen) beginPhaseTransition(boss.phase + 1);
    return actualDamage;
  }

  function defeatBoss() {
    pauseFightClock();
    if (isExpandedBoss()) {
      currentForgeTelemetry.finish = {
        bossId: boss.data.id,
        source: currentBossFinishSource,
        family: expandedFamily(),
        afterMechanic: boss.runtime?.mechanicComplete === true,
        lastMechanicFamily: currentForgeTelemetry.lastMechanicFamily,
        environment: currentForgeTelemetry.lastEnvironment,
        resource: boss.runtime?.resource ?? 0,
        openDoors: currentForgeTelemetry.doorsOpened.size,
        enduranceRounds: currentForgeTelemetry.enduranceRounds.size,
        variedActions: new Set(currentForgeTelemetry.actionSequence).size,
        preservedSections: boss.runtime?.parts?.filter(part => part.role === 'section' && !part.destroyed).length || 0
      };
    }
    boss.defeated = true;
    boss.vulnerable = false;
    boss.attackLabel = 'DÉSINTÉGRATION';
    boss.collisionEnabled = false;
    if (boss.runtime) boss.runtime.environment = 'stable';
    if (isExpandedBoss()) { boss.state = 'defeat'; boss.hidden = true; }
    unlockCodexEntry(boss.data.id);
    enemyShots = [];
    playerShots = [];
    transitionTimer = 2.45;
    timeScale = save.settings.reduceMotion ? 1 : 0.35;
    flash = 0.35;
    shake(20);
    spawnGeneratedVfx('explosion-core', boss.x, boss.y, { size: 244, duration: 0.72, growth: 0.9 });
    spawnGeneratedVfx('explosion-final', boss.x, boss.y, { size: 350, duration: 1.25, growth: 0.85, alpha: 0.92 });
    for (let i = 0; i < 80; i++) {
      particles.push({
        x: boss.x + rand(-90,90), y: boss.y + rand(-75,75),
        vx: rand(-500,500), vy: rand(-620,180),
        life: rand(0.7,1.8), max: 1.8, size: rand(3,14),
        color: Math.random() < 0.5 ? boss.data.color : boss.data.accent,
        gravity: 600
      });
    }
    sfx('explode');
  }

  function hurtPlayer(amount, direction = -1, source = 'unknown') {
    if (!player || player.invuln > 0 || state !== 'fight') return;
    if (isExpandedBoss()) incrementForgeMetric(currentForgeTelemetry.familyHits, expandedFamily());
    const phaseKey = source + ':phase' + (boss?.phase || 1);
    currentBossHazardHits[phaseKey] = (currentBossHazardHits[phaseKey] || 0) + 1;
    noteMasteryCycleHit(source);
    if (player.barrier > 0) {
      player.barrier -= 1;
      player.invuln = 0.78;
      spawnBurst(player.x, player.y, '#bffaff', 12, 230);
      spawnGeneratedVfx('shield-hit', player.x, player.y, { size: 108, duration: 0.48, growth: 0.52 });
      addFloatingText(player.x, player.y - 50, 'ÉGIDE', '#bffaff');
      shake(4);
      haptic(20);
      sfx('deflect');
      announce('Égide capacitive : impact absorbé. Charges restantes ' + player.barrier + '.');
      return;
    }
    if (isExpandedBoss() && source === 'fallDamage') currentForgeTelemetry.fallDamageTaken += amount;
    player.hp -= amount;
    combo = 0;
    comboTimer = 0;
    player.invuln = 1.05;
    player.vx = direction * 420;
    player.vy = -420;
    damageTaken += amount;
    flash = 0.08;
    shake(10);
    haptic([45, 30, 70]);
    spawnBurst(player.x, player.y, '#ff6682', 16, 280);
    spawnGeneratedVfx('shield-hit', player.x, player.y, { size: 88, duration: 0.4, growth: 0.5 });
    addFloatingText(player.x, player.y - 50, '-1 CORE', '#ff8398');
    sfx('hurt');
    announce('Riva : ' + Math.max(0, player.hp) + ' noyaux sur ' + player.maxHp + '.');
    if (player.hp <= 0) {
      pauseFightClock();
      state = 'dead';
      transitionTimer = 1.35;
      touchControls.classList.remove('in-game');
      const briefing = document.querySelector('#combat-briefing');
      if (briefing) briefing.hidden = true;
      const gameoverHint = document.querySelector('#gameover-hint');
      if (gameoverHint) gameoverHint.textContent = (combatHint?.textContent || 'Observe le télégraphe') + ' Repars au début de la machine sans perdre ton build.';
    }
  }

  function updateEnemyShots(dt) {
    const speedFactor = difficulty().enemySpeed;
    for (let i = enemyShots.length - 1; i >= 0; i--) {
      const s = enemyShots[i];
      s.age += dt;
      s.life -= dt;

      if (s.type === 'reflectOrb') {
        s.x += s.vx * dt * speedFactor;
        s.y += s.vy * dt * speedFactor;
        if (s.wallRicochet && !s.friendly && (s.x <= 30 || s.x >= W - 30) && (s.wallBounces || 0) < (s.maxWallBounces || 2)) {
          s.x = clamp(s.x, 30, W - 30);
          s.vx *= -1;
          s.wallBounces = (s.wallBounces || 0) + 1;
          s.selfRicochet = true;
          s.source = 'selfRicochet';
          spawnBurst(s.x, s.y, boss?.data?.accent || '#cef2ff', 8, 140);
        }
        if (s.friendly && boss && !boss.defeated && circleHit(s.x, s.y, s.r, boss.weakX, boss.weakY, boss.weakR + 24)) {
          boss.runtime.mechanicProgress += 1;
          currentForgeTelemetry.reflectionHits += 1;
          currentForgeTelemetry.reflectionStreak += 1;
          currentForgeTelemetry.maximumReflectionStreak = Math.max(currentForgeTelemetry.maximumReflectionStreak, currentForgeTelemetry.reflectionStreak);
          if (boss.data.id === 'vector-vault') {
            currentForgeTelemetry.maximumProjectileBounceChain = Math.max(currentForgeTelemetry.maximumProjectileBounceChain, s.wallBounces || 0);
          }
          currentForgeTelemetry.reflectionTargets.add(boss.phase + ':' + (s.shape || 0));
          spawnBurst(s.x, s.y, boss.data.accent, 18, 320);
          addFloatingText(s.x, s.y - 24, 'RENVOI ' + boss.runtime.mechanicProgress + '/' + boss.runtime.mechanicTarget, boss.data.accent);
          s.life = 0;
          if (boss.runtime.mechanicProgress >= boss.runtime.mechanicTarget) completeExpandedMechanic('RELAIS SURCHARGÉS');
        }
      } else if (s.type === 'orb') {
        s.x += s.vx * dt * speedFactor;
        s.y += s.vy * dt * speedFactor;
      } else if (s.type === 'rocket') {
        if (s.age > 0.25) {
          const targetAngle = Math.atan2(player.y - s.y, player.x - s.x);
          const currentAngle = Math.atan2(s.vy, s.vx);
          const delta = normalizeAngle(targetAngle - currentAngle);
          const angle = currentAngle + clamp(delta, -1.45 * dt, 1.45 * dt);
          const speed = Math.hypot(s.vx, s.vy);
          s.vx = Math.cos(angle) * speed;
          s.vy = Math.sin(angle) * speed;
        }
        s.x += s.vx * dt * speedFactor;
        s.y += s.vy * dt * speedFactor;
        if (Math.random() < 0.7) particles.push({ x: s.x, y: s.y, vx: rand(-55,55), vy: rand(-35,35), life: 0.28, max: 0.28, size: rand(3,7), color: '#ffb14a' });
      } else if (s.type === 'shock') {
        s.x += s.vx * dt * speedFactor;
      } else if (s.type === 'blade') {
        s.x += s.vx * dt * speedFactor;
        s.y += s.vy * dt * speedFactor;
        s.vy += (s.gravity || 0) * dt;
        s.rotation += dt * 9;
      } else if (s.type === 'rock' || s.type === 'bomb') {
        s.x += s.vx * dt * speedFactor;
        s.y += s.vy * dt * speedFactor;
        s.vy += (s.gravity || 880) * dt * speedFactor;
        s.rotation += dt * 5;
        if (s.y >= GROUND - s.r) {
          if (s.type === 'bomb') {
            spawnBurst(s.x, GROUND - 12, '#ff7a8f', 18, 300);
            spawnGeneratedVfx('explosion-small', s.x, GROUND - 18, { size: 112, duration: 0.48, growth: 0.78 });
            spawnFan(s.x, GROUND - 25, 5, 210, Math.PI + 0.15, TAU - 0.15, 'orb');
            shake(7);
            sfx('smallExplosion');
          } else {
            spawnDust(s.x, GROUND, 5);
          }
          s.life = 0;
        }
      } else if (s.type === 'mine') {
        s.pulse += dt;
        if (s.life < 0.55 && !s.triggered) {
          s.triggered = true;
          spawnFan(s.x, s.y - 12, 8, 185, 0, TAU, 'orb');
          spawnBurst(s.x, s.y, '#d987ff', 14, 220);
          spawnGeneratedVfx('explosion-small', s.x, s.y, { size: 98, duration: 0.42, growth: 0.68 });
          shake(5);
          sfx('smallExplosion');
        }
      } else if (s.type === 'chronoField') {
        const active = s.age >= s.telegraph;
        if (active && Math.hypot(player.x - s.x, player.y - s.y) <= s.r) player.slowTime = Math.max(player.slowTime, 0.16);
      } else if (s.type === 'beamV' || s.type === 'beamH') {
        // Position fixe : la collision n’est active qu’après le télégraphe.
      } else if (s.type === 'warningCircle') {
        // Visuel uniquement.
      }

      if (s.damage > 0 && shotHitsPlayer(s)) {
        if (s.type === 'reflectOrb' && !s.friendly) currentForgeTelemetry.reflectionStreak = 0;
        if (boss?.data?.id === 'vector-vault' && s.selfRicochet && player.invuln <= 0) currentForgeTelemetry.selfRicochetHits += 1;
        hurtPlayer(s.damage, player.x < (s.x || W / 2) ? -1 : 1, s.source || s.type);
        if (!['beamV', 'beamH'].includes(s.type)) s.life = 0;
      }

      if (s.life <= 0 || s.x < -220 || s.x > W + 220 || s.y > H + 180) {
        if (s.type === 'reflectOrb' && !s.friendly) currentForgeTelemetry.reflectionStreak = 0;
        enemyShots.splice(i, 1);
      }
    }
  }

  function shotHitsPlayer(s) {
    if (player.invuln > 0) return false;
    const px = player.x;
    const py = player.y;
    if (s.type === 'beamV') {
      const active = s.age >= s.telegraph && s.age <= s.telegraph + s.active;
      return active && Math.abs(px - s.x) < s.width / 2 + player.w * 0.35;
    }
    if (s.type === 'beamH') {
      const active = s.age >= s.telegraph && s.age <= s.telegraph + s.active;
      return active && Math.abs(py - s.y) < s.width / 2 + player.h * 0.3;
    }
    if (s.friendly || s.type === 'warningCircle') return false;
    if (s.type === 'shock') {
      return Math.abs(px - s.x) < 25 + player.w / 2 && Math.abs((py + player.h / 2) - GROUND) < 48;
    }
    const r = s.r || 18;
    return circleRectHit(s.x, s.y, r, px - player.w / 2, py - player.h / 2, player.w, player.h);
  }

  function updateParticles(dt) {
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.life -= dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      if (p.gravity) p.vy += p.gravity * dt;
      p.vx *= Math.pow(0.12, dt);
      if (p.life <= 0) particles.splice(i, 1);
    }
    const maxParticles = save.settings.reduceMotion ? 80 : 260;
    if (particles.length > maxParticles) particles.splice(0, particles.length - maxParticles);
  }

  function updateFloatingTexts(dt) {
    for (let i = floatingTexts.length - 1; i >= 0; i--) {
      const f = floatingTexts[i];
      f.life -= dt;
      f.y -= 34 * dt;
      if (f.life <= 0) floatingTexts.splice(i, 1);
    }
  }

  function updateTransition(dt) {
    if (transitionTimer <= 0) return;
    transitionTimer -= dt;
    if (transitionTimer > 0) return;

    if (state === 'dead') {
      showScreen('gameover-screen');
      return;
    }

    if (boss && boss.defeated) {
      timeScale = 1;
      currentBossElapsed = readFightClock();
      lastBossTime = currentBossElapsed;
      lastBossRetryPenalty = isSequentialRun() ? currentBossRetries * RUSH_RETRY_PENALTY : 0;
      const rankedBossTime = lastBossTime + lastBossRetryPenalty;
      save.bestTimes[boss.data.id] = Math.min(save.bestTimes[boss.data.id] ?? Infinity, rankedBossTime);
      if (runMode === 'rush') {
        save.unlocked = Math.max(save.unlocked, Math.min(CAMPAIGN_BOSSES.length, currentBossIndex + 2));
        if (!save.campaignCleared.includes(boss.data.id)) save.campaignCleared.push(boss.data.id);
      } else if (runMode === 'forgeRush' && !save.forgeCleared.includes(boss.data.id)) {
        save.forgeCleared.push(boss.data.id);
      }
      persistSave();
      buildBossGrid();
      showResult();
    }
  }

  const FORGE_MAXIMUM_METRICS = new Set([
    'damageTaken', 'finalOpeningsUsed', 'coreOpeningsUsed', 'mimicCounterHits',
    'laneCollisions', 'collapsingSectionHits', 'pressureHits', 'adaptedCounterHits',
    'adaptiveCounterHits', 'sectionRetries', 'checkpointRetries', 'healsUsed',
    'repairsCompleted', 'fallDamageTaken', 'recoveryFalls', 'manualSequenceResets', 'selfRicochetHits'
  ]);

  function evaluateForgeMetric(metric, target, rankedTime) {
    const telemetry = currentForgeTelemetry;
    const finish = telemetry.finish || {};
    const familyHits = telemetry.familyHits;
    const counts = {
      damageTaken,
      timeSeconds: rankedTime,
      mechanicCycles: Object.values(telemetry.familyCompletions).reduce((sum, value) => sum + value, 0),
      relaysDisabledByReflection: telemetry.reflectionHits,
      distinctRamsPressed: telemetry.lurePresses,
      perfectFinalCycle: telemetry.perfectFamilyCycles.phase3 || 0,
      correctPriorityTargets: telemetry.priorityDroneFamilies.size,
      finalOpeningsUsed: telemetry.finalPhaseOpenings,
      actionDiversity: telemetry.mimicPhaseTwoSamples > 0 && telemetry.mimicPhaseTwoCompleteSamples === telemetry.mimicPhaseTwoSamples ? 3 : 0,
      mimicCounterHits: familyHits.mimic || 0,
      cleanModuleShutdowns: telemetry.offlineBreakerModuleHits === 0 ? telemetry.cleanBreakerModules.size : 0,
      coreOpeningsUsed: telemetry.finalPhaseOpenings,
      weightsReturned: telemetry.familyCompletions['vertical-lane'] || 0,
      couplersDestroyed: telemetry.destroyedByRole.coupling || 0,
      laneCollisions: familyHits['vertical-lane'] || 0,
      distinctLaneHits: telemetry.laneHits.size,
      perfectPermutationCycle: telemetry.perfectFamilyCycles['vertical-lane'] || 0,
      selfDestroyedSupports: telemetry.lurePresses,
      collapsingSectionHits: familyHits.lure || 0,
      valvesClosedInCycle: telemetry.maximumValvesInPressureCycle,
      pressureHits: boss?.data?.id === 'floodline-leviathan' ? familyHits['gravity-weather'] || 0 : 0,
      distinctGravityQuadrants: telemetry.gravityQuadrants.size,
      firstWindowModules: telemetry.firstWindowByRole.module || 0,
      anchorsFirstWindow: telemetry.firstWindowByRole.anchor || 0,
      perfectCounters: telemetry.dashCounters,
      civilSectionsPreserved: finish.preservedSections || 0,
      sectionRetries: currentBossRetries,
      adaptationsExploited: telemetry.adaptations.size,
      adaptedCounterHits: familyHits.mimic || 0,
      condensatorsCollected: telemetry.destroyedByRole.condensator || 0,
      minimumReservePercent: telemetry.minimumReservePercent,
      perfectSequences: telemetry.puzzlePerfectSequences,
      maximumBounceChain: telemetry.maximumProjectileBounceChain,
      distinctBatteriesHit: telemetry.reflectionTargets.size,
      checkpointRetries: currentBossRetries,
      healsUsed: telemetry.healsUsed,
      repairsCompleted: telemetry.repairsCompleted,
      fallDamageTaken: telemetry.fallDamageTaken,
      recoveryFalls: telemetry.recoveryFalls,
      mutualCollisions: telemetry.mutualCollisions,
      manualSequenceResets: telemetry.manualSequenceResets,
      selfRicochetHits: telemetry.selfRicochetHits,
      distinctAdaptationsExpired: telemetry.adaptations.size,
      adaptiveCounterHits: familyHits.mimic || 0,
      distinctRelaysReflected: telemetry.reflectionTargets.size,
      uniqueModulesDisabled: telemetry.destroyedByRole['null-module'] || 0
    };

    if (Object.hasOwn(counts, metric)) {
      const value = counts[metric];
      const maximum = FORGE_MAXIMUM_METRICS.has(metric) || metric === 'timeSeconds';
      const achieved = metric === 'timeSeconds'
        ? save.settings.difficulty !== 'casual' && value <= target
        : metric === 'minimumReservePercent'
          ? value >= target
          : maximum ? value <= target : value >= target;
      return { supported: true, value, achieved };
    }

    const finishChecks = {
      dashFinish: finish.source === 'dash',
      reflectedFinish: finish.bossId === 'bastion-ricochet' && finish.lastMechanicFamily === 'reflect',
      discFinish: finish.bossId === 'echo-fencer' && finish.lastMechanicFamily === 'mimic',
      summitFinish: finish.bossId === 'vertical-verdict' && finish.lastMechanicFamily === 'vertical-lane',
      turbineStopFinish: finish.bossId === 'floodline-leviathan' && String(finish.environment).startsWith('fluid'),
      axisLockFinish: finish.bossId === 'centrifuge-zero' && String(finish.environment).startsWith('gravity'),
      heatDissipationFinish: finish.bossId === 'tempest-regulator' && finish.environment === 'heat',
      postureBreakFinish: finish.bossId === 'counterforge' && finish.lastMechanicFamily === 'posture-duo',
      openDoorCoreFinish: finish.bossId === 'carrier-cathedral' && finish.openDoors >= 2,
      interruptedTransferFinish: finish.bossId === 'twin-governors' && finish.lastMechanicFamily === 'posture-duo',
      openConfigurationFinish: finish.bossId === 'loadout-reactor' && finish.lastMechanicFamily === 'mimic',
      fullReserveFinish: finish.bossId === 'orbital-famine' && finish.resource >= 99,
      previewedVectorFinish: finish.bossId === 'vector-vault' && finish.lastMechanicFamily === 'reflect',
      chargedReturnFinish: finish.bossId === 'skyborne-battery' && finish.lastMechanicFamily === 'reflect',
      variedSequenceFinish: finish.bossId === 'adaptive-archivist' && finish.variedActions >= 3,
      nullBreakFinish: finish.bossId === 'null-crown' && finish.lastMechanicFamily === 'posture-duo'
    };
    if (Object.hasOwn(finishChecks, metric)) return { supported: true, value: finishChecks[metric] ? 1 : 0, achieved: finishChecks[metric] === true };
    return { supported: false, value: null, achieved: false };
  }

  function forgeContractCoverage() {
    const rows = EXPANDED_BOSSES.flatMap(entry => (EXPANSION_STORY?.getMasteryContracts?.(entry.id) || entry.masteryContracts || [])
      .map(contract => ({
        bossId: entry.id,
        contractId: contract.id,
        metric: contract.metric,
        supported: evaluateForgeMetric(contract.metric, contract.target, 0).supported
      })));
    return {
      total: rows.length,
      supported: rows.filter(row => row.supported).length,
      unsupported: rows.filter(row => !row.supported),
      rows
    };
  }

  function evaluateMasteryContracts(rankedTime) {
    const act = runMode === 'rush' ? STORY.getActByOrder(currentBossIndex + 1) : null;
    const bossId = BOSSES[currentBossIndex].id;
    const expansionAct = BOSSES[currentBossIndex].engine === 'expanded' ? EXPANSION_STORY?.getBossById?.(bossId) : null;
    const contracts = act?.masteryContracts || expansionAct?.masteryContracts || BOSSES[currentBossIndex].masteryContracts || [];
    const previous = new Set(save.mastery[bossId] || []);
    const results = contracts.map(contract => {
      let supported = true;
      let achieved = false;
      let value = null;
      if (expansionAct) {
        const evaluation = evaluateForgeMetric(contract.metric, contract.target, rankedTime);
        supported = evaluation.supported;
        achieved = evaluation.achieved;
        value = evaluation.value;
      } else if (contract.metric === 'timeSeconds') achieved = save.settings.difficulty !== 'casual' && rankedTime <= contract.target;
      else if (contract.metric === 'damageTaken') achieved = damageTaken <= contract.target;
      else if (contract.metric === 'dashFinish') achieved = currentBossFinishSource === 'dash';
      else if (contract.metric === 'overloadDuringOpening') achieved = currentBossOverloadOpening;
      else if (contract.metric === 'perfectEruptionCycle') achieved = (currentBossPerfectCycles.eruption || 0) >= contract.target;
      else if (contract.metric === 'perfectDashCycle') achieved = (currentBossPerfectCycles.dash || 0) >= contract.target;
      else if (contract.metric === 'minesTriggered') achieved = (currentBossHazardHits['mine:phase3'] || 0) <= contract.target;
      else if (contract.metric === 'overloadFinish') achieved = currentBossOverloadFinish;
      else supported = false;
      const earnedNow = supported && achieved && !previous.has(contract.id);
      if (supported && achieved) previous.add(contract.id);
      return { ...contract, supported, achieved: supported && achieved, earnedNow, value };
    });
    const before = (save.mastery[bossId] || []).length;
    save.mastery[bossId] = [...previous];
    const gained = save.mastery[bossId].length - before;
    if (gained > 0) {
      score += gained * 500;
      persistSave();
    }
    return results;
  }

  function renderMasteryResults(results) {
    if (!resultMastery) return;
    resultMastery.textContent = '';
    for (const contract of results) {
      const card = document.createElement('article');
      card.className = 'mastery-contract';
      const unlocked = contract.achieved || (save.mastery[BOSSES[currentBossIndex].id] || []).includes(contract.id);
      card.dataset.earned = String(unlocked);
      card.dataset.supported = String(contract.supported !== false);
      const status = document.createElement('span');
      status.textContent = contract.supported === false
        ? 'NON ÉVALUÉE · TÉLÉMÉTRIE ABSENTE · LE CONTRAT REFUSE SON SOUS-TITRE'
        : contract.earnedNow ? 'NOUVEAU · +500 · LE SCORE A LU LA CONDITION' : unlocked ? 'ARCHIVÉ · LE JEU S’EN SOUVIENT' : 'À REFAIRE · LE CONTRAT RESTE À L’ÉCRAN';
      const title = document.createElement('strong');
      title.textContent = contract.title;
      const objective = document.createElement('small');
      objective.textContent = contract.objective;
      card.append(status, title, objective);
      resultMastery.appendChild(card);
    }
  }

  function calculateRank(time, hits, retries) {
    const par = (BOSSES[currentBossIndex].parTime || 60) * difficulty().parMultiplier;
    const performanceRatio = time / par;
    const rating = 108 - performanceRatio * 48 - hits * 9 - retries * 17 + (difficulty().scoreMultiplier - 1) * 12;
    if (rating >= 76 && hits === 0 && retries === 0) return 'S';
    if (rating >= 60) return 'A';
    if (rating >= 42) return 'B';
    return 'C';
  }

  function describeBuild() {
    if (!runBuild.installed.length) return 'Configuration d’origine · aucun module hors champ';
    const counts = new Map();
    for (const id of runBuild.installed) counts.set(id, (counts.get(id) || 0) + 1);
    return [...counts].map(([id, count]) => {
      const upgrade = UPGRADES.find(entry => entry.id === id);
      return (upgrade?.name || id) + (count > 1 ? ' ×' + count : '');
    }).join(' · ');
  }

  function syncForgeResultTransmission(profile) {
    const article = document.querySelector('#result-forge-transmission');
    const label = document.querySelector('#result-forge-transmission-label');
    const copy = document.querySelector('#result-forge-transmission-copy');
    if (!article) return;
    article.hidden = !profile;
    if (!profile) {
      if (copy) copy.textContent = '';
      return;
    }
    const wave = EXPANSION_STORY?.waves?.find(entry => entry.number === profile.wave);
    const closesWave = wave?.bossCodes?.at(-1) === profile.code;
    if (label) label.textContent = (wave?.title || 'Transmission Forge')
      + (closesWave ? ' // révélation de l’anneau restaurée' : ' // service rendu à son équipe');
    if (copy) {
      const restoredLines = (profile.interlude || [])
        .map(line => line.speaker + ' — ' + line.text)
        .join('  ·  ');
      copy.textContent = restoredLines + (closesWave && wave?.revelation
        ? '  ·  RÉVÉLATION DE L’ANNEAU — ' + wave.revelation
        : '');
    }
  }
  function showResult() {
    hideToast();
    hideRadioExchange();
    state = 'result';
    touchControls.classList.remove('in-game');
    const finalBoss = currentBossIndex === CAMPAIGN_BOSSES.length - 1;
    const rushComplete = runMode === 'rush' && finalBoss;
    const forgeComplete = runMode === 'forgeRush' && currentBossIndex === FORGE_FINAL_INDEX;
    const rankedTime = lastBossTime + lastBossRetryPenalty;
    const medal = calculateRank(rankedTime, damageTaken, currentBossRetries);
    const practiceResult = !isSequentialRun();
    const act = runMode === 'rush' ? STORY.getActByOrder(currentBossIndex + 1) : null;
    const expansionStory = boss.data.engine === 'expanded' ? EXPANSION_STORY?.getBossById?.(boss.data.id) : null;
    recordBestRank(BOSSES[currentBossIndex].id, medal);
    const masteryResults = evaluateMasteryContracts(rankedTime);
    document.getElementById('result-eyebrow').textContent = practiceResult
      ? 'SIMULATION TERMINÉE // HORS CHRONOLOGIE'
      : forgeComplete
        ? 'TRÔNE ZÉRO NEUTRALISÉ // SIX CLÉS DISTRIBUÉES'
        : rushComplete ? 'MANDAT RÉVOQUÉ // SIX DISTRICTS AUTONOMES' : 'SERVICE STABILISÉ // TRANSMISSION M-0';
    document.getElementById('result-title').textContent = forgeComplete
      ? 'NULL CROWN rend ses clés'
      : rushComplete ? 'Crown Engine Ω est tombé' : BOSSES[currentBossIndex].name + ' · service stabilisé';
    const resultSummary = practiceResult
      ? 'Données de combat archivées. La progression de campagne reste inchangée.'
      : expansionStory?.restoration || act?.districtConsequence || BOSSES[currentBossIndex].transmission;
    document.getElementById('result-summary').textContent = practiceResult
      ? resultSummary + ' · Simulation hors chronologie : aucune restitution n’est modifiée.'
      : resultSummary;
    const briefing = document.querySelector('#combat-briefing');
    if (briefing) briefing.hidden = true;
    const resultBuild = document.querySelector('#result-build');
    if (resultBuild) resultBuild.textContent = describeBuild();
    if (resultLoreLabel) resultLoreLabel.textContent = practiceResult
      ? 'Rapport de simulation // hors chronologie'
      : expansionStory ? 'Journal de Riva // restitution Forge' : 'Journal de Riva // après l’arrêt';
    if (resultLore) resultLore.textContent = practiceResult
      ? 'Profil mécanique : ' + BOSSES[currentBossIndex].description
      : expansionStory?.journal || act?.rivaJournal || BOSSES[currentBossIndex].transmission;
    syncForgeResultTransmission(practiceResult ? null : expansionStory);
    renderMasteryResults(masteryResults);

    if (runMode === 'rush') {
      saveRushSnapshot({
        checkpoint: 'interlude',
        rushElapsedBeforeBoss: rushElapsedBeforeBoss + lastBossTime
      });
    } else if (runMode === 'forgeRush') {
      saveForgeRushSnapshot({
        checkpoint: forgeComplete ? 'ending' : 'upgrade',
        completedBosses: currentBossIndex - FORGE_START_INDEX + 1,
        rushElapsedBeforeBoss: rushElapsedBeforeBoss + lastBossTime
      });
    }
    buildCodex();
    syncContinueForge();
    const timeLabel = lastBossRetryPenalty > 0 ? formatTime(rankedTime) + ' (+' + lastBossRetryPenalty + ' s)' : formatTime(rankedTime);
    document.getElementById('result-stats').innerHTML = '<div><strong>' + timeLabel + '</strong><small>Temps classé · checkpoint compris</small></div>'
      + '<div><strong>' + score.toLocaleString('fr-FR') + '</strong><small>Score · le HUD a tout compté · combo max ×' + maxCombo + '</small></div>'
      + '<div><strong>' + medal + '</strong><small>Rang · ' + difficulty().name + ' · le résultat signe</small></div>';
    announce(boss.data.name + ' neutralisé. Rang ' + medal + '. Temps ' + formatTime(rankedTime) + '.');

    const continueButton = document.getElementById('continue-button');
    continueButton.textContent = runMode === 'forgeRush'
      ? forgeComplete ? 'Lire la fin des quatre anneaux' : 'Ouvrir l’Atelier · offre figée'
      : runMode !== 'rush' ? 'Revenir au catalogue · progression intacte' : 'Lire la transmission · le district continue';
    continueButton.hidden = false;
    showScreen('result-screen');
  }

  function continueAfterResult() {
    if (runMode === 'rush') {
      rushElapsedBeforeBoss += lastBossTime;
      saveRushSnapshot({ checkpoint: 'interlude', rushElapsedBeforeBoss });
      showInterlude(currentBossIndex);
    } else if (runMode === 'forgeRush') {
      rushElapsedBeforeBoss += lastBossTime;
      if (currentBossIndex >= FORGE_FINAL_INDEX) showForgeEnding(rushElapsedBeforeBoss);
      else {
        saveForgeRushSnapshot({
          checkpoint: 'upgrade',
          completedBosses: currentBossIndex - FORGE_START_INDEX + 1,
          rushElapsedBeforeBoss
        });
        showUpgradeSelection();
      }
    } else {
      state = 'menu';
      player = null;
      boss = null;
      buildBossGrid(runMode === 'forge' ? 'forge' : 'practice');
      showScreen('boss-select-screen');
    }
  }

  function showUpgradeSelection() {
    state = 'upgrade';
    const checkpointSnapshot = runMode === 'rush'
      ? sanitizeRushSnapshot(save.rushSnapshot)
      : runMode === 'forgeRush' ? sanitizeForgeRushSnapshot(save.forgeRushSnapshot) : null;
    player = null;
    boss = null;
    resetWorld();
    const grid = document.getElementById('upgrade-grid');
    grid.textContent = '';
    const eligible = UPGRADES.filter(upgrade => runBuild.installed.filter(id => id === upgrade.id).length < upgrade.maxStacks);
    const pool = [...eligible];
    const persistedOffer = checkpointSnapshot?.checkpoint === 'upgrade'
      ? sanitizeUpgradeOffer(checkpointSnapshot.upgradeOffer, runBuild.installed)
      : [];
    let choices = persistedOffer.map(id => eligible.find(upgrade => upgrade.id === id)).filter(Boolean);
    if (!choices.length) {
      for (let i = pool.length - 1; i > 0; i--) {
        const random = globalThis.crypto?.getRandomValues
          ? globalThis.crypto.getRandomValues(new Uint32Array(1))[0] / 4294967296
          : Math.random();
        const index = Math.floor(random * (i + 1));
        [pool[i], pool[index]] = [pool[index], pool[i]];
      }
      choices = pool.slice(0, 3);
      if (lastUpgradeOffer.length === choices.length && choices.every(choice => lastUpgradeOffer.includes(choice.id)) && pool.length > 3) {
        choices[2] = pool[3];
      }
    }
    lastUpgradeOffer = choices.map(choice => choice.id);
    if (!choices.length) {
      showToast('BUILD MAXIMAL // LE MENU N’A PLUS RIEN À AJOUTER', 'Build maximal. Lancement de la prochaine machine.');
      startFight(currentBossIndex + 1);
      return;
    }
    if (runMode === 'rush') saveRushSnapshot({ checkpoint: 'upgrade', upgradeOffer: [...lastUpgradeOffer] });
    if (runMode === 'forgeRush') saveForgeRushSnapshot({
      checkpoint: 'upgrade',
      completedBosses: currentBossIndex - FORGE_START_INDEX + 1,
      rushElapsedBeforeBoss,
      upgradeOffer: [...lastUpgradeOffer]
    });
    const summary = document.querySelector('#upgrade-screen .result-summary');
    const nextBoss = BOSSES[Math.min(currentBossIndex + 1, BOSSES.length - 1)];
    const waveChanged = runMode === 'forgeRush' && nextBoss?.wave > BOSSES[currentBossIndex]?.wave;
    const nextWave = runMode === 'forgeRush'
      ? EXPANSION_STORY?.waves?.find(entry => entry.number === nextBoss?.wave)
      : null;
    if (summary) summary.textContent = waveChanged
      ? (nextWave?.title || 'Anneau suivant') + '. ' + (nextWave?.premise || '')
        + ' · Build conservé par le checkpoint : ' + describeBuild() + '.'
      : 'Le build relit sa propre fiche : ' + describeBuild() + '. Choisis le module que le checkpoint devra conserver.';
    if (waveChanged) showToast(
      (nextWave?.title || 'ANNEAU SUIVANT').toUpperCase() + ' // CHECKPOINT SÉCURISÉ',
      'Anneau suivant. Checkpoint sécurisé.'
    );
    const upgradeProgress = document.querySelector('#upgrade-progress');
    const upgradeBuild = document.querySelector('#upgrade-build');
    const nextRoster = runMode === 'forgeRush' ? BOSSES : CAMPAIGN_BOSSES;
    const nextEntry = nextRoster[Math.min(currentBossIndex + 1, nextRoster.length - 1)];
    if (upgradeProgress) upgradeProgress.textContent = runMode === 'forgeRush'
      ? (nextWave?.title || 'Anneau ' + (nextEntry?.wave || 4)) + ' · prochaine barre de vie : ' + (nextEntry?.arena || 'Trône Zéro')
      : 'Prochaine scène jouable : ' + (nextEntry?.arena || 'Citadelle');
    if (upgradeBuild) upgradeBuild.textContent = 'Build relu par le checkpoint : ' + describeBuild();
    for (const upgrade of choices) {
      const button = document.createElement('button');
      button.className = 'upgrade-card';
      const stacks = runBuild.installed.filter(id => id === upgrade.id).length;
      button.innerHTML = '<span><img class="upgrade-icon" src="assets/generated/v2.10.0/vfx/' + upgrade.icon + '.webp" alt="" width="64" height="64" decoding="async"><strong>' + upgrade.name + '</strong><small>' + upgrade.description + '</small></span><em>' + (stacks ? 'NIVEAU ' + (stacks + 1) : 'INSTALLER') + '</em>';
      button.addEventListener('click', () => installUpgrade(upgrade));
      grid.appendChild(button);
    }
    showScreen('upgrade-screen');
  }

  function installUpgrade(upgrade) {
    const stacks = runBuild.installed.filter(id => id === upgrade.id).length;
    if (stacks >= upgrade.maxStacks) return;
    upgrade.apply(runBuild);
    runBuild.installed.push(upgrade.id);
    showToast(upgrade.name.toUpperCase() + ' // LE BUILD RESTE CANON', upgrade.name + ' installé.');
    startFight(currentBossIndex + 1);
  }

  function showForgeEnding(elapsedOverride = null) {
    hideToast();
    hideRadioExchange();
    state = 'ending';
    touchControls.classList.remove('in-game');
    const totalElapsed = Number.isFinite(elapsedOverride) ? elapsedOverride : rushElapsedBeforeBoss;
    const total = totalElapsed + rushRetryPenalty;
    save.forgeCompleted = true;
    if (save.bestForgeRush === null || total < save.bestForgeRush) save.bestForgeRush = total;
    save.forgeCleared = EXPANDED_BOSSES.map(entry => entry.id);
    save.forgeRushSnapshot = null;
    persistSave();
    buildCodex();
    const epilogue = EXPANSION_STORY?.forgeCircuit?.epilogue;
    const title = document.querySelector('#forge-ending-title');
    const transmission = document.querySelector('#forge-ending-screen .ending-transmission');
    const summary = document.querySelector('#forge-ending-summary');
    const stats = document.querySelector('#forge-ending-stats');
    if (title && epilogue) title.textContent = epilogue.title;
    if (transmission && epilogue) transmission.textContent = 'Riva — ' + epilogue.riva;
    if (summary) summary.textContent = epilogue
      ? epilogue.summary + ' ' + epilogue.outcome
      : 'Les quatre anneaux et leurs vingt-quatre services répondent de nouveau aux districts.';
    if (stats) {
      const masteryTotal = Object.values(save.mastery).reduce((sum, contracts) => sum + (Array.isArray(contracts) ? contracts.length : 0), 0);
      const cards = [
        ['Boss archivés', '24 / 24'],
        ['Temps que la fin retient', formatTime(total)],
        ['Score final', score.toLocaleString('fr-FR')],
        ['Contrats réellement lus', Math.min(90, masteryTotal) + ' / 90'],
        ['Reprises conservées', runRetryCount.toLocaleString('fr-FR')]
      ];
      const fragment = document.createDocumentFragment();
      for (const [label, value] of cards) {
        const card = document.createElement('article');
        const caption = document.createElement('span');
        const result = document.createElement('strong');
        caption.textContent = label;
        result.textContent = value;
        card.append(caption, result);
        fragment.appendChild(card);
      }
      stats.replaceChildren(fragment);
      stats.setAttribute('aria-label', 'Bilan du Circuit Forge. Configuration finale : ' + describeBuild());
    }
    player = null;
    boss = null;
    resetWorld();
    syncContinueForge();
    showScreen(document.querySelector('#forge-ending-screen') ? 'forge-ending-screen' : 'title-screen');
    announce('Circuit Forge terminé. Vingt-quatre machines neutralisées en ' + formatTime(total) + '.');
  }

  function showEnding() {
    hideToast();
    hideRadioExchange();
    state = 'ending';
    touchControls.classList.remove('in-game');
    const briefing = document.querySelector('#combat-briefing');
    if (briefing) briefing.hidden = true;
    const total = rushElapsedBeforeBoss + rushRetryPenalty;
    save.completed = true;
    if (save.bestRush === null || total < save.bestRush) save.bestRush = total;
    if (!save.storySeen.includes(STORY.epilogue.id)) save.storySeen.push(STORY.epilogue.id);
    save.rushSnapshot = null;
    persistSave();
    buildCodex();

    document.getElementById('ending-title').textContent = STORY.epilogue.title;
    const transmission = document.querySelector('.ending-transmission');
    if (transmission) transmission.textContent = STORY.epilogue.lines.map(line => line.speaker + ' — ' + line.text).join('  ·  ');
    const resolution = document.querySelector('.ending-resolution');
    if (resolution) {
      resolution.innerHTML = '<article><span>Citadelle</span><strong>' + STORY.epilogue.cassianFate + '</strong></article>'
        + '<article><span>Choix de Riva</span><strong>' + STORY.epilogue.rivaChoice + '</strong></article>';
    }
    const districts = document.querySelector('#ending-districts');
    if (districts) {
      districts.textContent = '';
      STORY.epilogue.districtRestorations.forEach((entry, index) => {
        const item = document.createElement('li');
        item.innerHTML = '<span>' + String(index + 1).padStart(2, '0') + '</span><strong>' + entry.district + '</strong><small>' + entry.restoration + '</small>';
        districts.appendChild(item);
      });
    }
    document.getElementById('ending-summary').textContent = STORY.epilogue.summary;
    const endingStats = document.querySelector('#ending-stats');
    if (endingStats) {
      const cards = [
        ['Temps total', formatTime(total)],
        ['Score final', score.toLocaleString('fr-FR')],
        ['Reprises', runRetryCount.toLocaleString('fr-FR')],
        ['Configuration finale', describeBuild()]
      ];
      const fragment = document.createDocumentFragment();
      for (const [label, value] of cards) {
        const card = document.createElement('article');
        const caption = document.createElement('span');
        const result = document.createElement('strong');
        caption.textContent = label;
        result.textContent = value;
        card.append(caption, result);
        fragment.appendChild(card);
      }
      endingStats.replaceChildren(fragment);
      endingStats.setAttribute('aria-label', 'Bilan de campagne. Configuration finale : ' + describeBuild());
    }
    announce('Circuit libéré en ' + formatTime(total) + '. Score final ' + score + '.');
    player = null;
    boss = null;
    resetWorld();
    showScreen('ending-screen');
  }

  function openLaboratory() {
    hideToast();
    state = 'menu';
    selectionMode = 'practice';
    buildBossGrid('practice');
    showScreen('boss-select-screen');
  }

  function returnToMenu() {
    hideToast();
    pauseFightClock();
    state = 'menu';
    boss = null;
    player = null;
    resetWorld();
    touchControls.classList.remove('in-game');
    const briefing = document.querySelector('#combat-briefing');
    if (briefing) briefing.hidden = true;
    bossIntro.classList.remove('visible');
    bossIntro.setAttribute('aria-hidden', 'true');
    const bestRushText = save.bestRush ? 'Le menu se souvient du meilleur Circuit : ' + formatTime(save.bestRush) : 'Sauvegarde locale // le checkpoint se souvient';
    document.getElementById('save-note').textContent = bestRushText;
    syncContinueForge();
    showScreen('title-screen');
  }

  function syncPauseHelp() {
    const help = document.querySelector('.pause-quick-help');
    if (!help) return;
    const touchLayout = matchMedia('(pointer: coarse), (max-width: 640px)').matches;
    help.innerHTML = touchLayout
      ? '<span><kbd>TIR</kbd><small>Attaque</small></span><span><kbd>RUÉE</kbd><small>Esquive</small></span><span><kbd>SURCH.</kbd><small>Overdrive</small></span><span><kbd>Ⅱ</kbd><small>Reprendre</small></span>'
      : '<span><kbd>J</kbd><small>Tir</small></span><span><kbd>K</kbd><small>Ruée</small></span><span><kbd>L</kbd><small>Surcharge</small></span><span><kbd>Échap</kbd><small>Reprendre</small></span>';
  }

  function pauseGame() {
    if (state !== 'fight' || boss?.defeated) return;
    pauseFightClock();
    state = 'paused';
    touchControls.classList.remove('in-game');
    const briefing = document.querySelector('#combat-briefing');
    if (briefing) briefing.hidden = true;
    bossIntro.classList.remove('visible');
    bossIntro.setAttribute('aria-hidden', 'true');
    hideRadioExchange();
    syncPauseHelp();
    const pauseObjective = document.querySelector('#pause-objective');
    if (pauseObjective) pauseObjective.textContent = combatObjective?.textContent || 'Exposer le noyau après le cycle d’attaque';
    if (pauseBuild) {
      pauseBuild.textContent = 'Build : ' + describeBuild() + ' · Égide ' + (player?.barrier || 0) + ' · Surcharge ' + Math.round(player?.overload || 0) + ' %.';
    }
    showScreen('pause-screen');
    announce('Jeu en pause.');
  }

  function resumeGame() {
    if (state !== 'paused') return;
    state = 'fight';
    if (boss?.state !== 'intro') startFightClock();
    closeScreens();
    touchControls.classList.add('in-game');
    if (boss?.state === 'intro' && introTimer > 0) {
      bossIntro.classList.add('visible');
      bossIntro.setAttribute('aria-hidden', 'false');
    }
    const briefing = document.querySelector('#combat-briefing');
    if (briefing) briefing.hidden = false;
    syncCombatGuidance();
    lastTime = performance.now();
    announce('Combat repris.');
  }

  function update(dt) {
    if (commsTimer > 0) {
      commsTimer -= dt;
      if (commsTimer <= 0) hideRadioExchange();
    }
    if (toastTimer > 0) {
      toastTimer -= dt;
      if (toastTimer <= 0) toast.classList.remove('visible');
    }
    if (introTimer > 0 && state !== 'paused') {
      introTimer -= dt;
      if (introTimer <= 0) { bossIntro.classList.remove('visible'); bossIntro.setAttribute('aria-hidden', 'true'); }
    }
    flash = Math.max(0, flash - dt);
    screenShake = Math.max(0, screenShake - dt * 28);
    if (!save.settings.reduceMotion && state !== 'paused') artRuntime.parallaxTime += dt;
    if (state !== 'paused') updateGeneratedEffects(dt);

    if (state !== 'fight' && state !== 'dead') {
      updateAmbient(dt);
      updateParticles(dt);
      return;
    }

    const scaled = dt * timeScale;
    comboTimer = Math.max(0, comboTimer - dt);
    if (comboTimer <= 0) combo = 0;
    currentBossElapsed = readFightClock();
    syncAccessibleHud();
    updateParticles(scaled);
    updateFloatingTexts(scaled);
    updateTransition(dt);

    if (state === 'dead' || !boss || boss.defeated) return;
    if (boss.state === 'intro') {
      updateBoss(scaled);
      return;
    }
    updatePlayer(scaled);
    updatePlayerShots(scaled);
    if (boss.defeated) return;
    const enemyTimeFactor = player.overloadTime > 0 ? 0.55 : 1;
    updateBoss(scaled * enemyTimeFactor);
    if (boss.defeated) return;
    updateEnemyShots(scaled * enemyTimeFactor);
  }

  function updateAmbient(dt) {
    if (ambient.length < 24 && Math.random() < dt * 5) {
      ambient.push({ x: rand(0,W), y: H + 30, speed: rand(15,45), size: rand(1,4), phase: rand(0,TAU) });
    }
    ambient.forEach(a => { a.y -= a.speed * dt; a.x += Math.sin(a.phase + a.y * 0.01) * 6 * dt; });
    ambient = ambient.filter(a => a.y > -30);
  }

  function draw() {
    ctx.save();
    const shakeAmount = save.settings.shake && !save.settings.reduceMotion ? screenShake : 0;
    if (shakeAmount > 0) ctx.translate(rand(-shakeAmount, shakeAmount), rand(-shakeAmount, shakeAmount));

    const data = boss?.data || BOSSES[Math.floor(performance.now() / 5500) % BOSSES.length];
    drawBackground(data);
    if (state === 'menu' || state === 'result' || state === 'upgrade' || state === 'ending') drawAttractMachine(data);

    const combatVisible = player && boss && ['fight', 'dead', 'paused'].includes(state);
    if (combatVisible) {
      drawArenaWarnings();
      drawEnemyShots();
      if (!boss.hidden) drawBoss();
      drawPlayerShots();
      drawPlayer();
      drawParticles();
      drawGeneratedEffects();
      drawFloatingTexts();
      if (rigDebug) drawRigDebugOverlay();
      drawHUD();
    } else {
      drawAmbient();
      drawParticles();
      drawGeneratedEffects();
    }

    if (flash > 0) {
      ctx.fillStyle = `rgba(255,255,255,${Math.min(0.7, flash * 2.1)})`;
      ctx.fillRect(-30, -30, W + 60, H + 60);
    }
    ctx.restore();
  }

  function drawBackground(data) {
    const gradient = ctx.createLinearGradient(0, 0, 0, H);
    gradient.addColorStop(0, mixColor(data.color, '#060918', 0.82));
    gradient.addColorStop(0.62, '#101630');
    gradient.addColorStop(1, '#070a14');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, W, H);

    const t = save.settings.reduceMotion ? 0 : performance.now() / 1000;
    ctx.globalAlpha = 0.25;
    ctx.fillStyle = data.color;
    for (let i = 0; i < 7; i++) {
      const x = (i * 250 + Math.sin(t * 0.25 + i) * 50) % (W + 200) - 100;
      const y = 90 + i % 3 * 90;
      ctx.beginPath();
      ctx.arc(x, y, 70 + i * 7, 0, TAU);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    ctx.fillStyle = 'rgba(6,8,18,0.72)';
    const skylineSeed = BOSSES.indexOf(data) + 1;
    for (let i = 0; i < 18; i++) {
      const width = 45 + ((i * 37 + skylineSeed * 21) % 70);
      const height = 90 + ((i * 83 + skylineSeed * 59) % 180);
      const x = i * 82 - 30;
      ctx.fillRect(x, GROUND - height, width, height);
      ctx.fillStyle = `rgba(255,255,255,${0.03 + (i % 3) * 0.015})`;
      for (let wy = GROUND - height + 24; wy < GROUND - 20; wy += 34) ctx.fillRect(x + 12, wy, 6, 10);
      ctx.fillStyle = 'rgba(6,8,18,0.72)';
    }

    ctx.fillStyle = '#151a28';
    ctx.fillRect(0, GROUND, W, H - GROUND);
    ctx.fillStyle = '#252d3c';
    ctx.fillRect(0, GROUND, W, 8);
    ctx.strokeStyle = 'rgba(255,255,255,0.08)';
    ctx.lineWidth = 2;
    for (let x = -100; x < W + 100; x += 90) {
      ctx.beginPath();
      ctx.moveTo(x, GROUND + 100);
      ctx.lineTo(x + 70, GROUND);
      ctx.stroke();
    }
    ctx.strokeStyle = hexToRgba(data.color, 0.2);
    ctx.beginPath();
    ctx.moveTo(0, GROUND - 3);
    ctx.lineTo(W, GROUND - 3);
    ctx.stroke();

    const generatedArena = drawGeneratedArena(data);
    if (generatedArena) {
      ctx.strokeStyle = hexToRgba(data.accent, 0.36);
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(0, GROUND);
      ctx.lineTo(W, GROUND);
      ctx.stroke();
    }

    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    ctx.fillRect(0, 0, W, 52);
    ctx.font = '800 15px system-ui';
    ctx.fillStyle = hexToRgba(data.accent, 0.82);
    ctx.fillText(`SECTEUR // ${data.arena.toUpperCase()}`, 28, 33);
  }

  function drawAttractMachine(data) {
    const t = save.settings.reduceMotion ? 0 : performance.now() / 1000;
    ctx.save();
    ctx.globalAlpha = 0.88;
    ctx.translate(965, 350 + Math.sin(t * 1.6) * 12);
    ctx.scale(1.65, 1.65);
    if (!drawGeneratedBossPreview(data)) drawGenericCogMachine(data, t);
    ctx.restore();
    ctx.fillStyle = 'rgba(3,5,12,0.25)';
    ctx.fillRect(0, 0, W, H);
  }

  function drawGenericCogMachine(data, t) {
    ctx.save();
    ctx.rotate(Math.sin(t * 0.8) * 0.05);
    ctx.fillStyle = '#1f2738';
    ctx.strokeStyle = data.color;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.arc(0, 0, 78, 0, TAU);
    ctx.fill(); ctx.stroke();
    for (let i = 0; i < 10; i++) {
      ctx.save();
      ctx.rotate(i / 10 * TAU + t * 0.2);
      ctx.fillStyle = data.color;
      ctx.fillRect(67, -8, 28, 16);
      ctx.restore();
    }
    ctx.fillStyle = hexToRgba(data.accent, 0.92);
    ctx.beginPath(); ctx.arc(0, 0, 27, 0, TAU); ctx.fill();
    ctx.restore();
  }

  function drawPlayer() {
    const airborneHeight = Math.max(0, GROUND - (player.y + player.h / 2));
    const shadowScale = clamp(1 - airborneHeight / 420, 0.48, 1);
    const shadowLift = heroArtReady() ? RIVA_ROAD_LIFT : 0;
    ctx.save();
    ctx.fillStyle = 'rgba(0,0,0,0.52)';
    ctx.shadowColor = 'rgba(0,0,0,0.52)';
    ctx.shadowBlur = 4;
    ctx.beginPath();
    ctx.ellipse(player.x, GROUND - 3 - shadowLift, 28 * shadowScale, 6 * shadowScale, 0, 0, TAU);
    ctx.fill();
    ctx.restore();
    const blink = player.invuln > 0 && Math.floor(player.invuln * 16) % 2 === 0;
    ctx.save();
    ctx.translate(player.x, player.y);
    if (player.overloadTime > 0 && !heroArtReady()) {
      ctx.strokeStyle = 'rgba(255,243,154,0.75)';
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.arc(0, 0, 48 + Math.sin(player.anim * 2) * 4, 0, TAU);
      ctx.stroke();
    }
    ctx.scale(player.facing, 1);
    const bob = heroArtReady() ? 0 : player.onGround ? Math.sin(player.anim) * Math.min(1.5, Math.abs(player.vx) / 140) : 0;
    ctx.translate(0, bob);

    if (player.dashTime > 0 && !heroArtReady()) {
      ctx.globalAlpha = 0.25;
      for (let i = 1; i <= 4; i++) {
        ctx.fillStyle = '#58e6ff';
        ctx.beginPath();
        ctx.ellipse(-i * 18, 0, 20, 34, 0, 0, TAU);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    }

    if (!drawGeneratedPlayer()) {
    // Bottes cinétiques
    if (blink) ctx.globalAlpha = player.dashTime > 0 ? 0.72 : 0.46;
    ctx.fillStyle = '#ffad4a';
    roundedRect(-19, 24, 22, 18, 6); ctx.fill();
    roundedRect(3, 24, 22, 18, 6); ctx.fill();
    ctx.fillStyle = '#87f3ff';
    ctx.fillRect(-17, 38, 16, 5);
    ctx.fillRect(7, 38, 16, 5);

    // Corps
    ctx.fillStyle = '#2a5fb8';
    roundedRect(-18, -19, 36, 50, 14); ctx.fill();
    ctx.fillStyle = '#80efff';
    ctx.beginPath(); ctx.moveTo(-13,-11); ctx.lineTo(14,-3); ctx.lineTo(4,11); ctx.lineTo(-15,4); ctx.closePath(); ctx.fill();

    // Tête et visière
    ctx.fillStyle = '#f2c5a5';
    ctx.beginPath(); ctx.arc(0, -33, 17, 0, TAU); ctx.fill();
    ctx.fillStyle = '#14244a';
    ctx.beginPath(); ctx.arc(-3, -39, 18, Math.PI, TAU); ctx.lineTo(15,-30); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#aaf7ff';
    roundedRect(2, -37, 18, 8, 4); ctx.fill();

    // Bras/canon
    ctx.strokeStyle = '#f2c5a5';
    ctx.lineWidth = 8;
    ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(13,-5); ctx.lineTo(26, 2); ctx.stroke();
    ctx.fillStyle = '#23314d';
    roundedRect(22, -4, 21, 12, 5); ctx.fill();
    ctx.fillStyle = '#7ef0ff';
    ctx.fillRect(38, -1, 8, 6);
    }
    ctx.restore();
  }

  function drawBoss() {
    const hoverHeight = Math.max(0, GROUND - (boss.y + boss.h / 2));
    const shadowScale = clamp(1 - hoverHeight / 520, 0.3, 1);
    const shadowRadius = Math.max(34, boss.w * 0.38) * shadowScale;
    ctx.save();
    ctx.fillStyle = save.settings.highContrast ? 'rgba(0,0,0,0.94)' : 'rgba(0,0,0,0.62)';
    ctx.beginPath();
    ctx.ellipse(boss.x, GROUND + 2, shadowRadius, Math.max(5, shadowRadius * 0.16), 0, 0, TAU);
    ctx.fill();
    ctx.restore();
    ctx.save();
    ctx.translate(boss.x, boss.y);
    const phaseScale = 1 + (boss.phase - 1) * 0.045;
    ctx.scale(phaseScale, phaseScale);
    if (boss.phase > 1) {
      ctx.strokeStyle = hexToRgba(boss.data.accent, 0.28 + boss.phase * 0.1);
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.arc(0, 0, 105 + boss.phase * 9 + Math.sin(boss.totalTime * 5) * 5, 0, TAU);
      ctx.stroke();
    }
    if (boss.hitFlash > 0) ctx.filter = 'brightness(2.2) saturate(0.25)';
    const generatedBoss = drawGeneratedBoss();
    if (!generatedBoss) {
      switch (boss.data.id) {
        case 'rammer': drawRammer(); break;
        case 'kraken': drawKraken(); break;
        case 'drill': drawDrill(); break;
        case 'mantis': drawMantis(); break;
        case 'cyclotron': drawCyclotron(); break;
        case 'omega': drawOmega(); break;
        default: drawExpandedBoss(); break;
      }
    }
    if (!generatedBoss && boss.phase >= 2) {
      ctx.fillStyle = hexToRgba(boss.data.accent, 0.65);
      for (const side of [-1, 1]) {
        ctx.save();
        ctx.translate(side * 92, -18);
        ctx.rotate(side * (0.35 + boss.totalTime * 0.8));
        ctx.fillRect(-18, -7, 36, 14);
        ctx.restore();
      }
    }
    if (!generatedBoss && boss.phase >= 3) {
      ctx.strokeStyle = boss.data.accent;
      ctx.lineWidth = 4;
      ctx.setLineDash([14, 10]);
      ctx.beginPath();
      ctx.arc(0, 0, 128, boss.totalTime, boss.totalTime + Math.PI * 1.55);
      ctx.stroke();
      ctx.setLineDash([]);
    }
    ctx.restore();

    drawWeakPointFeedback();
  }

  function drawExpandedBoss() {
    const runtime = boss.runtime;
    const family = expandedFamily();
    const t = save.settings.reduceMotion ? 0 : boss.totalTime;
    ctx.save();
    ctx.rotate(Math.sin(t * 1.4) * 0.035);
    ctx.fillStyle = '#1c2535';
    ctx.strokeStyle = boss.data.color;
    ctx.lineWidth = save.settings.highContrast ? 7 : 5;
    ctx.beginPath();
    const sides = family === 'puzzle-endgame' ? 8 : family === 'modules' ? 6 : 5;
    for (let index = 0; index < sides; index++) {
      const angle = -Math.PI / 2 + index / sides * TAU;
      const radius = 76 + (index % 2) * 13;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      if (index === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.fillStyle = hexToRgba(boss.data.color, 0.32);
    ctx.fillRect(-88, 38, 176, 28);
    for (const part of runtime?.parts || []) {
      if (part.role === 'armor' || part.role === 'weak-point' || part.destroyed) continue;
      const x = part.hitbox?.x || part.anchor?.x || 0;
      const y = part.hitbox?.y || part.anchor?.y || 0;
      const radius = part.hitbox?.r || 20;
      ctx.fillStyle = part.state === 'damaged' ? '#8b5462' : '#303d55';
      ctx.strokeStyle = part.state === 'damaged' ? '#ffd0d8' : boss.data.accent;
      ctx.lineWidth = 4;
      ctx.beginPath(); ctx.rect(x - radius, y - radius, radius * 2, radius * 2); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#ffffff';
      ctx.font = '900 11px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText(String(part.id).split('-').at(-1), x, y + 4);
    }
    if (family === 'posture-duo') {
      for (const side of [-1, 1]) {
        ctx.fillStyle = side < 0 ? boss.data.color : boss.data.accent;
        ctx.beginPath(); ctx.arc(side * 116, -18 + Math.sin(t * 2 + side) * 16, 28, 0, TAU); ctx.fill();
      }
    }
    drawMachineCore(boss.data.weakPoint?.x || 0, boss.data.weakPoint?.y || -8, boss.data.weakPoint?.r || 32, boss.data.accent, boss.vulnerable);
    ctx.fillStyle = boss.data.accent;
    ctx.font = '950 13px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText(String(boss.data.order).padStart(2, '0'), 0, 7);
    ctx.restore();
  }

  function drawExpandedArenaWarnings() {
    const runtime = boss.runtime;
    if (!runtime) return;
    const family = expandedFamily();
    const pulse = save.settings.reduceMotion ? 0.7 : 0.55 + Math.sin(boss.totalTime * 8) * 0.15;
    ctx.save();
    if (boss.data.id === 'orbital-famine') {
      const reserve = clamp(Number.isFinite(runtime.resource) ? runtime.resource : 100, 0, 100);
      ctx.fillStyle = 'rgba(7,12,28,0.88)';
      ctx.fillRect(W - 330, 104, 270, 54);
      ctx.strokeStyle = reserve <= 25 ? '#ff8398' : boss.data.accent;
      ctx.lineWidth = 3;
      ctx.strokeRect(W - 330, 104, 270, 54);
      ctx.fillStyle = reserve <= 25 ? '#ff6682' : boss.data.accent;
      ctx.fillRect(W - 318, 136, 246 * reserve / 100, 10);
      ctx.fillStyle = '#ffffff';
      ctx.font = '950 14px system-ui';
      ctx.textAlign = 'left';
      ctx.fillText('RÉSERVE ORBITALE ' + Math.round(reserve) + ' %', W - 318, 126);
    }
    if (!['telegraph', 'active'].includes(boss.state)) {
      ctx.restore();
      return;
    }
    ctx.lineWidth = save.settings.highContrast ? 7 : 5;
    ctx.strokeStyle = hexToRgba(boss.data.accent, 0.82);
    ctx.fillStyle = hexToRgba(boss.data.color, 0.13 + pulse * 0.08);
    ctx.setLineDash(boss.state === 'telegraph' ? [16, 12] : []);
    if (family === 'reflect') {
      ctx.beginPath(); ctx.moveTo(boss.x, boss.y); ctx.lineTo(player.x, player.y); ctx.stroke();
      ctx.fillRect(player.x - 34, player.y - 34, 68, 68);
    } else if (family === 'lure') {
      ctx.fillRect(0, 160, 165, GROUND - 160);
      ctx.fillRect(W - 165, 160, 165, GROUND - 160);
      ctx.strokeRect(runtime.lureTargetX - 58, 110, 116, GROUND - 110);
    } else if (family === 'vertical-lane') {
      for (let lane = 0; lane < 3; lane++) {
        const x = lane * (W / 3);
        const safe = lane === runtime.safeLane;
        ctx.fillStyle = safe ? 'rgba(120,255,190,0.16)' : hexToRgba(boss.data.color, 0.23);
        ctx.fillRect(x, 52, W / 3, GROUND - 52);
        ctx.strokeRect(x + 6, 58, W / 3 - 12, GROUND - 64);
        if (!safe) {
          ctx.lineWidth = 2;
          ctx.strokeStyle = 'rgba(255,255,255,0.42)';
          for (let y = 72; y < GROUND - 40; y += 54) {
            for (let stripe = x + 16; stripe < x + W / 3 - 20; stripe += 54) {
              ctx.beginPath();
              ctx.moveTo(stripe, y);
              ctx.lineTo(Math.min(stripe + 34, x + W / 3 - 12), y + 34);
              ctx.stroke();
            }
          }
        }
        ctx.fillStyle = '#ffffff';
        ctx.font = '950 17px system-ui';
        ctx.textAlign = 'center';
        ctx.fillText('VOIE ' + (lane + 1) + (safe ? ' · SÛRE' : ' · DANGER'), x + W / 6, 88);
      }
    } else if (family === 'posture-duo') {
      ctx.beginPath(); ctx.arc(boss.x, boss.y, 118 + pulse * 14, 0, TAU); ctx.stroke();
    } else if (family === 'puzzle-endgame') {
      for (const node of runtime.puzzleNodes) {
        ctx.fillStyle = node.active ? 'rgba(140,255,190,0.4)' : 'rgba(12,18,38,0.85)';
        ctx.beginPath();
        if (node.id % 3 === 0) ctx.rect(node.x - node.r, node.y - node.r, node.r * 2, node.r * 2);
        else if (node.id % 3 === 1) ctx.arc(node.x, node.y, node.r, 0, TAU);
        else { ctx.moveTo(node.x, node.y - node.r); ctx.lineTo(node.x + node.r, node.y + node.r); ctx.lineTo(node.x - node.r, node.y + node.r); ctx.closePath(); }
        ctx.fill(); ctx.stroke();
        ctx.fillStyle = '#fff'; ctx.font = '900 16px system-ui'; ctx.textAlign = 'center'; ctx.fillText(String(node.id + 1), node.x, node.y + 6);
      }
      ctx.fillStyle = '#ffffff';
      ctx.font = '950 15px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText('ORDRE · ' + runtime.puzzleSequence.map(id => String(id + 1)).join(' → ') + ' · ÉTAPE ' + Math.min(runtime.puzzleIndex + 1, runtime.puzzleSequence.length) + '/' + runtime.puzzleSequence.length, W / 2, 164);
    } else if (family === 'gravity-weather') {
      const direction = runtime.environment.endsWith('left') ? -1 : runtime.environment.endsWith('right') ? 1 : 0;
      if (direction) {
        for (let y = 180; y < GROUND; y += 90) { ctx.beginPath(); ctx.moveTo(W / 2, y); ctx.lineTo(W / 2 + direction * 180, y); ctx.stroke(); }
      }
      ctx.fillStyle = '#ffffff';
      ctx.font = '950 15px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText('ENVIRONNEMENT · ' + String(runtime.environment || 'stable').replaceAll('-', ' ').toUpperCase(), W / 2, 164);
    }
    ctx.setLineDash([]);
    ctx.fillStyle = '#fff';
    ctx.font = '950 16px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText(BOSS_REGISTRY.families[family]?.label || runtime.selectedPattern, W / 2, 205);
    ctx.restore();
  }

  function drawWeakPointFeedback() {
    if (!boss || boss.defeated || boss.hidden || ['intro', 'phaseEnter', 'phaseTransition', 'defeat'].includes(boss.state)) return;
    const time = save.settings.reduceMotion ? 0 : performance.now() / 1000;
    const pulse = save.settings.reduceMotion ? 0 : Math.sin(time * 7);
    const radius = boss.weakR + (boss.vulnerable ? 12 + pulse * 3 : 8);
    ctx.save();
    ctx.translate(boss.weakX, boss.weakY);
    ctx.lineWidth = save.settings.highContrast ? 4 : 3;
    if (boss.vulnerable) {
      ctx.shadowColor = boss.data.accent;
      ctx.shadowBlur = 18;
      ctx.strokeStyle = boss.data.accent;
      ctx.globalAlpha = 0.82;
      ctx.beginPath();
      ctx.arc(0, 0, radius, -Math.PI * 0.42, Math.PI * 1.42);
      ctx.stroke();
      ctx.globalAlpha = 0.2;
      ctx.fillStyle = boss.data.accent;
      ctx.beginPath();
      ctx.arc(0, 0, Math.max(9, boss.weakR * 0.52), 0, TAU);
      ctx.fill();
      ctx.globalAlpha = 1;
      ctx.shadowBlur = 5;
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.font = '900 11px system-ui';
      ctx.fillText('NOYAU OUVERT', 0, -radius - 10);
    } else {
      ctx.strokeStyle = save.settings.highContrast ? 'rgba(240,246,255,0.92)' : 'rgba(183,196,222,0.56)';
      ctx.setLineDash([7, 7]);
      ctx.beginPath();
      ctx.arc(0, 0, radius, 0, TAU);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.globalAlpha = save.settings.highContrast ? 0.92 : 0.68;
      ctx.fillStyle = '#11182a';
      ctx.strokeStyle = '#dbe6ff';
      ctx.lineWidth = 2;
      ctx.fillRect(-9, -1, 18, 15);
      ctx.strokeRect(-9, -1, 18, 15);
      ctx.beginPath();
      ctx.arc(0, -1, 7, Math.PI, 0);
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawMachineCore(x, y, r, color, open = false) {
    ctx.save();
    ctx.translate(x, y);
    ctx.fillStyle = '#0c1120';
    ctx.strokeStyle = open ? color : '#6d768a';
    ctx.lineWidth = 5;
    ctx.beginPath(); ctx.arc(0,0,r,0,TAU); ctx.fill(); ctx.stroke();
    ctx.fillStyle = open ? color : '#323b50';
    ctx.shadowColor = open ? color : 'transparent';
    ctx.shadowBlur = open ? 22 : 0;
    ctx.beginPath(); ctx.arc(0,0,r*0.52,0,TAU); ctx.fill();
    ctx.restore();
  }

  function drawCockpit(x, y, scale = 1) {
    ctx.save();
    ctx.translate(x,y);
    ctx.scale(scale,scale);
    const g = ctx.createLinearGradient(0,-26,0,26);
    g.addColorStop(0,'rgba(183,244,255,0.86)');
    g.addColorStop(1,'rgba(44,100,136,0.72)');
    ctx.fillStyle = g;
    ctx.strokeStyle = '#91e8ff';
    ctx.lineWidth = 3;
    ctx.beginPath(); ctx.ellipse(0,0,32,25,0,Math.PI,TAU); ctx.lineTo(30,18); ctx.lineTo(-30,18); ctx.closePath(); ctx.fill(); ctx.stroke();
    // Silhouette de Cassian Voltério
    ctx.fillStyle = '#2b1835';
    ctx.beginPath(); ctx.arc(0,0,10,0,TAU); ctx.fill();
    ctx.strokeStyle = '#f7d4a4'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(-7,5); ctx.quadraticCurveTo(-19,12,-26,5); ctx.moveTo(7,5); ctx.quadraticCurveTo(19,12,26,5); ctx.stroke();
    ctx.restore();
  }

  function drawRammer() {
    ctx.save();
    ctx.fillStyle = '#282f3f';
    roundedRect(-90, 5, 180, 82, 28); ctx.fill();
    ctx.fillStyle = '#151a26';
    for (const x of [-57, 0, 57]) { ctx.beginPath(); ctx.arc(x,66,25,0,TAU); ctx.fill(); ctx.strokeStyle='#627087'; ctx.lineWidth=5; ctx.stroke(); }
    ctx.fillStyle = boss.data.color;
    ctx.beginPath(); ctx.moveTo(-88,20); ctx.lineTo(-150,52); ctx.lineTo(-88,74); ctx.closePath(); ctx.fill();
    ctx.fillStyle = boss.data.accent;
    ctx.beginPath(); ctx.moveTo(-142,52); ctx.lineTo(-178,36); ctx.lineTo(-160,54); ctx.lineTo(-178,70); ctx.closePath(); ctx.fill();
    drawCockpit(24,-30,0.95);
    drawMachineCore(20,-42,27,boss.data.accent,boss.vulnerable);
    ctx.fillStyle='#3a455c';
    ctx.fillRect(58,-44,52,20); ctx.fillRect(62,-15,45,17);
    ctx.restore();
  }

  function drawKraken() {
    ctx.save();
    for (let i=0;i<6;i++) {
      const a = i/6*TAU + Math.sin(boss.totalTime*2+i)*0.18;
      ctx.save(); ctx.rotate(a);
      ctx.strokeStyle = '#36495c'; ctx.lineWidth=18; ctx.lineCap='round';
      ctx.beginPath(); ctx.moveTo(42,0); ctx.quadraticCurveTo(78,12,100,40*Math.sin(a+boss.totalTime)); ctx.stroke();
      ctx.fillStyle=boss.data.color; ctx.beginPath(); ctx.arc(101,40*Math.sin(a+boss.totalTime),12,0,TAU); ctx.fill();
      ctx.restore();
    }
    ctx.fillStyle='#202b3b'; ctx.strokeStyle=boss.data.color; ctx.lineWidth=6;
    ctx.beginPath(); ctx.arc(0,0,68,0,TAU); ctx.fill(); ctx.stroke();
    drawCockpit(0,-58,0.78);
    drawMachineCore(0,5,31,boss.data.accent,boss.vulnerable);
    ctx.restore();
  }

  function drawDrill() {
    ctx.save();
    ctx.fillStyle='#2d3443';
    roundedRect(-70,-50,140,110,36); ctx.fill();
    ctx.fillStyle=boss.data.color;
    ctx.beginPath(); ctx.moveTo(0,100); ctx.lineTo(-58,34); ctx.lineTo(58,34); ctx.closePath(); ctx.fill();
    ctx.strokeStyle=boss.data.accent; ctx.lineWidth=6;
    for (let y=48;y<88;y+=14) { ctx.beginPath(); ctx.moveTo(-42+(y-48)*0.8,y); ctx.lineTo(42-(y-48)*0.8,y); ctx.stroke(); }
    drawCockpit(0,-64,0.9);
    drawMachineCore(0,-56,29,boss.data.accent,boss.vulnerable);
    ctx.fillStyle='#202635'; ctx.fillRect(-94,-18,34,68); ctx.fillRect(60,-18,34,68);
    ctx.restore();
  }

  function drawMantis() {
    ctx.save();
    const armSwing = Math.sin(boss.totalTime*5)*0.22;
    for (const side of [-1,1]) {
      ctx.save(); ctx.scale(side,1); ctx.rotate(armSwing*side);
      ctx.strokeStyle='#343b4c'; ctx.lineWidth=17; ctx.lineCap='round';
      ctx.beginPath(); ctx.moveTo(36,-25); ctx.lineTo(82,-60); ctx.lineTo(120,-25); ctx.stroke();
      ctx.fillStyle=boss.data.color;
      ctx.beginPath(); ctx.moveTo(104,-38); ctx.lineTo(152,-66); ctx.lineTo(122,-14); ctx.closePath(); ctx.fill();
      ctx.restore();
    }
    ctx.strokeStyle='#3b4354'; ctx.lineWidth=14;
    ctx.beginPath(); ctx.moveTo(-28,38); ctx.lineTo(-56,92); ctx.moveTo(28,38); ctx.lineTo(56,92); ctx.stroke();
    ctx.fillStyle='#242b3a'; ctx.strokeStyle=boss.data.color; ctx.lineWidth=5;
    ctx.beginPath(); ctx.moveTo(0,-70); ctx.lineTo(54,-20); ctx.lineTo(34,55); ctx.lineTo(-34,55); ctx.lineTo(-54,-20); ctx.closePath(); ctx.fill(); ctx.stroke();
    drawCockpit(0,-75,0.72);
    drawMachineCore(0,-5,29,boss.data.accent,boss.vulnerable);
    ctx.restore();
  }

  function drawCyclotron() {
    ctx.save();
    ctx.rotate(boss.rotation * (save.settings.reduceMotion ? 0.35 : 1));
    ctx.strokeStyle='#343c50'; ctx.lineWidth=25;
    ctx.beginPath(); ctx.arc(0,0,95,0,TAU); ctx.stroke();
    ctx.strokeStyle=boss.data.color; ctx.lineWidth=6;
    ctx.beginPath(); ctx.arc(0,0,95,0,TAU); ctx.stroke();
    for (let i=0;i<10;i++) {
      ctx.save(); ctx.rotate(i/10*TAU);
      ctx.fillStyle=i%2?boss.data.color:'#4a5368';
      roundedRect(79,-11,38,22,6); ctx.fill();
      ctx.restore();
    }
    ctx.strokeStyle='#596177'; ctx.lineWidth=6;
    for(let i=0;i<6;i++){ ctx.save(); ctx.rotate(i/6*TAU); ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(86,0); ctx.stroke(); ctx.restore(); }
    ctx.rotate(-boss.rotation * (save.settings.reduceMotion ? 0.35 : 1));
    ctx.fillStyle='#252c3c'; ctx.beginPath(); ctx.arc(0,0,53,0,TAU); ctx.fill();
    drawCockpit(0,-42,0.8);
    drawMachineCore(0,-12,31,boss.data.accent,boss.vulnerable);
    ctx.restore();
  }

  function drawOmega() {
    ctx.save();
    for (let i=0;i<8;i++) {
      ctx.save(); ctx.rotate(i/8*TAU + boss.totalTime*0.22);
      ctx.fillStyle=i%2?boss.data.color:'#3f4a5e';
      ctx.beginPath(); ctx.moveTo(52,-12); ctx.lineTo(112,0); ctx.lineTo(52,12); ctx.closePath(); ctx.fill();
      ctx.restore();
    }
    ctx.fillStyle='#222b38'; ctx.strokeStyle=boss.data.color; ctx.lineWidth=7;
    ctx.beginPath(); ctx.moveTo(-90,15); ctx.lineTo(-55,-82); ctx.lineTo(0,-108); ctx.lineTo(55,-82); ctx.lineTo(90,15); ctx.lineTo(58,87); ctx.lineTo(-58,87); ctx.closePath(); ctx.fill(); ctx.stroke();
    drawCockpit(0,-85,1.05);
    drawMachineCore(0,8,36,boss.data.accent,boss.vulnerable);
    ctx.fillStyle='#384456';
    roundedRect(-128,32,62,27,8); ctx.fill();
    roundedRect(66,32,62,27,8); ctx.fill();
    ctx.fillStyle=boss.data.color;
    for (const x of [-114,-90,90,114]) { ctx.beginPath(); ctx.arc(x,46,7,0,TAU); ctx.fill(); }
    ctx.restore();
  }

  function drawEnemyShots() {
    for (const s of enemyShots) {
      ctx.save();
      if (s.type === 'reflectOrb') {
        ctx.translate(s.x, s.y);
        ctx.rotate(Math.atan2(s.vy, s.vx));
        ctx.fillStyle = s.friendly ? '#fff39a' : boss?.data?.color || '#ffb24c';
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 4;
        ctx.beginPath();
        const sides = 3 + (s.shape || 0);
        for (let index = 0; index < sides; index++) {
          const angle = index / sides * TAU;
          const x = Math.cos(angle) * s.r;
          const y = Math.sin(angle) * s.r;
          if (index === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.closePath(); ctx.fill(); ctx.stroke();
        ctx.fillStyle = '#fff'; ctx.fillRect(-3, -s.r - 13, 6, 10);
      } else if (s.type === 'orb') {
        ctx.shadowColor = '#78eaff'; ctx.shadowBlur = 14;
        ctx.fillStyle = '#88f4ff'; ctx.beginPath(); ctx.arc(s.x,s.y,s.r,0,TAU); ctx.fill();
        ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(s.x-3,s.y-3,s.r*0.35,0,TAU); ctx.fill();
      } else if (s.type === 'rocket') {
        ctx.translate(s.x,s.y); ctx.rotate(Math.atan2(s.vy,s.vx));
        ctx.fillStyle='#ff9c49'; ctx.beginPath(); ctx.moveTo(18,0); ctx.lineTo(-12,-9); ctx.lineTo(-12,9); ctx.closePath(); ctx.fill();
        ctx.fillStyle='#fff0a6'; ctx.fillRect(-18,-4,8,8);
      } else if (s.type === 'shock') {
        ctx.translate(s.x,s.y);
        ctx.fillStyle='#ffb24c';
        ctx.beginPath(); ctx.moveTo(-24,14); ctx.lineTo(-11,-20); ctx.lineTo(0,3); ctx.lineTo(12,-25); ctx.lineTo(25,14); ctx.closePath(); ctx.fill();
      } else if (s.type === 'blade') {
        ctx.translate(s.x,s.y); ctx.rotate(s.rotation);
        ctx.fillStyle='#ff6686';
        for(let i=0;i<4;i++){ctx.rotate(Math.PI/2);ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(30,-7);ctx.lineTo(22,8);ctx.closePath();ctx.fill();}
        ctx.fillStyle='#f8e3e8';ctx.beginPath();ctx.arc(0,0,7,0,TAU);ctx.fill();
      } else if (s.type === 'rock') {
        ctx.translate(s.x,s.y);ctx.rotate(s.rotation);ctx.fillStyle='#6b6253';ctx.strokeStyle='#d1bd75';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(-s.r,-4);ctx.lineTo(-6,-s.r);ctx.lineTo(s.r,-7);ctx.lineTo(s.r*0.7,s.r);ctx.lineTo(-s.r*0.7,s.r*0.8);ctx.closePath();ctx.fill();ctx.stroke();
      } else if (s.type === 'bomb') {
        ctx.translate(s.x,s.y);ctx.rotate(s.rotation);ctx.fillStyle='#553252';ctx.strokeStyle='#ff7d9a';ctx.lineWidth=4;ctx.beginPath();ctx.arc(0,0,s.r,0,TAU);ctx.fill();ctx.stroke();ctx.fillStyle='#ffe7a7';ctx.fillRect(-4,-s.r-9,8,11);
      } else if (s.type === 'mine') {
        const pulse = 1 + Math.sin(s.pulse*10)*0.12;
        ctx.translate(s.x,s.y);ctx.scale(pulse,pulse);ctx.fillStyle='#42284e';ctx.strokeStyle='#d987ff';ctx.lineWidth=4;ctx.beginPath();ctx.arc(0,0,s.r,0,TAU);ctx.fill();ctx.stroke();
        for(let i=0;i<6;i++){ctx.save();ctx.rotate(i/6*TAU);ctx.fillRect(s.r-2,-3,12,6);ctx.restore();}
      } else if (s.type === 'chronoField') {
        const active = s.age >= s.telegraph;
        const pulse = 0.94 + Math.sin(s.age * 9) * 0.05;
        ctx.translate(s.x, s.y);
        ctx.fillStyle = active ? 'rgba(255,79,123,0.16)' : 'rgba(255,208,220,0.07)';
        ctx.strokeStyle = active ? 'rgba(255,112,150,0.92)' : 'rgba(255,208,220,0.6)';
        ctx.lineWidth = active ? 5 : 3;
        ctx.setLineDash(active ? [] : [12, 10]);
        ctx.beginPath(); ctx.arc(0, 0, s.r * pulse, 0, TAU); ctx.fill(); ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = 'rgba(255,230,238,0.82)';
        ctx.font = '900 18px system-ui';
        ctx.textAlign = 'center';
        ctx.fillText(active ? 'TEMPS DÉPHASÉ' : 'CHAMP CHRONO', 0, 6);
      } else if (s.type === 'beamV') {
        const active = s.age >= s.telegraph;
        ctx.fillStyle = active ? 'rgba(106,239,255,0.72)' : 'rgba(106,239,255,0.17)';
        ctx.fillRect(s.x-s.width/2,52,s.width,H-52);
        ctx.strokeStyle='rgba(225,255,255,0.9)';ctx.lineWidth=active?4:2;ctx.setLineDash(active?[]:[10,12]);ctx.beginPath();ctx.moveTo(s.x,52);ctx.lineTo(s.x,H);ctx.stroke();
      } else if (s.type === 'beamH') {
        const active = s.age >= s.telegraph;
        ctx.fillStyle = active ? 'rgba(106,239,255,0.7)' : 'rgba(106,239,255,0.16)';
        ctx.fillRect(0,s.y-s.width/2,W,s.width);
        ctx.strokeStyle='rgba(225,255,255,0.9)';ctx.lineWidth=active?4:2;ctx.setLineDash(active?[]:[10,12]);ctx.beginPath();ctx.moveTo(0,s.y);ctx.lineTo(W,s.y);ctx.stroke();
      } else if (s.type === 'warningCircle') {
        const progress = clamp(s.age / Math.max(0.01, s.age+s.life),0,1);
        ctx.strokeStyle=`rgba(255,200,80,${0.35+progress*0.55})`;ctx.lineWidth=5;ctx.setLineDash([10,8]);ctx.beginPath();ctx.ellipse(s.x,s.y,s.r*(1-progress*0.25),s.r*0.28*(1-progress*0.25),0,0,TAU);ctx.stroke();
      }
      ctx.restore();
    }
  }

  function drawArenaWarnings() {
    if (!boss) return;
    if (isExpandedBoss()) drawExpandedArenaWarnings();
    const pulse = save.settings.reduceMotion ? 0.5 : 0.5 + Math.sin(performance.now() / 85) * 0.18;
    if (boss.state === 'slamTelegraph' || boss.state === 'crashTelegraph') {
      const duration = boss.state === 'slamTelegraph' ? 0.85 : 0.82;
      const progress = clamp(boss.stateTime / duration, 0, 1);
      const halfWidth = 72 + progress * 18;
      ctx.save();
      const warning = save.settings.highContrast ? 0.34 : 0.18 + progress * 0.12;
      ctx.fillStyle = `rgba(255,128,48,${warning})`;
      ctx.fillRect(boss.x - halfWidth, boss.y + 58, halfWidth * 2, GROUND - boss.y - 38);
      ctx.strokeStyle = `rgba(255,226,122,${0.72 + pulse * 0.2})`;
      ctx.lineWidth = 5;
      ctx.setLineDash([16, 12]);
      ctx.beginPath();
      ctx.moveTo(boss.x - halfWidth, boss.y + 62);
      ctx.lineTo(boss.x - halfWidth, GROUND);
      ctx.moveTo(boss.x + halfWidth, boss.y + 62);
      ctx.lineTo(boss.x + halfWidth, GROUND);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = `rgba(255,187,70,${0.24 + progress * 0.24})`;
      ctx.beginPath();
      ctx.ellipse(boss.x, GROUND - 5, halfWidth, 18, 0, 0, TAU);
      ctx.fill();
      ctx.restore();
    }
    if (boss.state === 'dashTelegraph') {
      const duration = Math.max(0.32, 0.74 - boss.phase * 0.1);
      const progress = clamp(boss.stateTime / duration, 0, 1);
      ctx.save();
      ctx.fillStyle = `rgba(255,56,108,${(save.settings.highContrast ? 0.28 : 0.13) + progress * 0.11})`;
      ctx.fillRect(0, boss.y - 42, W, 84);
      ctx.strokeStyle = `rgba(255,231,240,${0.74 + pulse * 0.2})`;
      ctx.lineWidth = 7;
      ctx.setLineDash([22, 14]);
      ctx.beginPath();
      ctx.moveTo(0, boss.y - 42);
      ctx.lineTo(W, boss.y - 42);
      ctx.moveTo(0, boss.y + 42);
      ctx.lineTo(W, boss.y + 42);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = '#fff';
      ctx.font = '900 12px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText('TRAJECTOIRE CHRONO', W / 2, boss.y - 52);
      ctx.restore();
    }
  }

  function drawPlayerShots() {
    for (const shot of playerShots) {
      ctx.save();ctx.shadowColor='#75eaff';ctx.shadowBlur=16;ctx.fillStyle='#bffaff';ctx.beginPath();ctx.arc(shot.x,shot.y,shot.r,0,TAU);ctx.fill();ctx.restore();
    }
  }

  function drawParticles() {
    for (const p of particles) {
      ctx.globalAlpha = clamp(p.life / (p.max || 1), 0, 1);
      ctx.fillStyle = p.color;
      ctx.beginPath();ctx.arc(p.x,p.y,p.size,0,TAU);ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  function drawFloatingTexts() {
    ctx.textAlign='center';ctx.font='900 15px system-ui';
    for(const f of floatingTexts){ctx.globalAlpha=clamp(f.life/0.75,0,1);ctx.fillStyle=f.color;ctx.fillText(f.text,f.x,f.y);}ctx.globalAlpha=1;ctx.textAlign='left';
  }

  function drawAmbient() {
    ctx.fillStyle='rgba(178,238,255,0.4)';
    for(const a of ambient){ctx.beginPath();ctx.arc(a.x,a.y,a.size,0,TAU);ctx.fill();}
  }

  function drawHUD() {
    if (matchMedia('(orientation: portrait) and (max-width: 820px)').matches) return;
    ctx.save();
    // Player core
    panelRect(24,72,330,122);
    ctx.fillStyle='#fff';ctx.font='900 17px system-ui';ctx.fillText('RIVA // NOYAU CINÉTIQUE',44,103);
    for(let i=0;i<player.maxHp;i++){
      const x=45+i*34;ctx.fillStyle=i<player.hp?'#73efff':'#252b3e';ctx.strokeStyle=i<player.hp?'#c5fbff':'#4a5268';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(x,121);ctx.lineTo(x+11,114);ctx.lineTo(x+23,121);ctx.lineTo(x+20,143);ctx.lineTo(x+3,143);ctx.closePath();ctx.fill();ctx.stroke();
    }
    if(player.barrier>0){ctx.fillStyle='#d7f8ff';ctx.font='900 11px system-ui';ctx.textAlign='right';ctx.fillText('ÉGIDE ×'+player.barrier,330,137);ctx.textAlign='left';}
    const dashReady=1-clamp(player.dashCooldown/runBuild.dashCooldown,0,1);ctx.fillStyle='#1b2233';roundedRect(44,149,260,6,3);ctx.fill();ctx.fillStyle='#ffb24c';roundedRect(44,149,260*dashReady,6,3);ctx.fill();
    ctx.fillStyle='#9aa6c3';ctx.font='800 10px system-ui';ctx.fillText(player.overloadTime>0?'SURCHARGE ACTIVE':'SURCHARGE',44,171);
    ctx.fillStyle='#1b2233';roundedRect(44,178,260,9,4);ctx.fill();ctx.fillStyle=player.overload>=100||player.overloadTime>0?'#fff39a':'#6fe7ff';roundedRect(44,178,260*(player.overloadTime>0?1:player.overload/100),9,4);ctx.fill();

    // Boss health
    panelRect(744,72,512,92);
    ctx.fillStyle=boss.data.accent;ctx.font='900 16px system-ui';ctx.fillText(boss.data.name,766,100);
    ctx.fillStyle='#9aa6c3';ctx.font='700 12px system-ui';ctx.fillText('PHASE '+boss.phase+'/3 · '+boss.attackLabel.replace(/^PHASE \d · /,''),766,121);
    ctx.fillStyle='#1b2233';roundedRect(766,134,462,14,7);ctx.fill();
    const hpRatio=clamp(boss.hp/boss.maxHp,0,1);ctx.fillStyle=boss.data.color;roundedRect(766,134,462*hpRatio,14,7);ctx.fill();
    if(boss.vulnerable){ctx.strokeStyle=boss.data.accent;ctx.lineWidth=2;roundedRect(764,132,466,18,9);ctx.stroke();}

    // Temps/score
    panelRect(484,72,240,92);
    const elapsed=currentBossElapsed=readFightClock();ctx.textAlign='center';ctx.fillStyle='#fff';ctx.font='900 26px ui-monospace, monospace';ctx.fillText(formatTime(elapsed),604,113);ctx.fillStyle=combo>1?'#fff39a':'#9aa6c3';ctx.font='800 12px system-ui';ctx.fillText(score.toLocaleString('fr-FR')+' PTS · '+difficulty().name.toUpperCase()+(combo>1?' · COMBO ×'+combo:''),604,140);ctx.textAlign='left';

    ctx.restore();
  }

  function panelRect(x,y,w,h){ctx.fillStyle='rgba(8,12,28,0.78)';ctx.strokeStyle='rgba(160,228,255,0.22)';ctx.lineWidth=2;roundedRect(x,y,w,h,16);ctx.fill();ctx.stroke();}

  function spawnRocket(x,y) {
    const angle = Math.atan2(player.y-y, player.x-x) + rand(-0.18,0.18);
    enemyShots.push({type:'rocket',x,y,vx:Math.cos(angle)*260,vy:Math.sin(angle)*260,r:13,age:0,life:6,damage:1});
    sfx('launch');
  }
  function spawnFan(x,y,count,speed,start,end,type='orb') {
    for(let i=0;i<count;i++){
      const a=count===1?(start+end)/2:lerp(start,end,i/(count-1));
      enemyShots.push({type,x,y,vx:Math.cos(a)*speed,vy:Math.sin(a)*speed,r:type==='blade'?19:11,age:0,life:5,damage:1,rotation:0,gravity:0});
    }
  }
  function spawnShockwaves(x,count=2){
    enemyShots.push({type:'shock',x:x-50,y:GROUND-22,vx:-390,r:24,age:0,life:4,damage:1});
    if(count>1)enemyShots.push({type:'shock',x:x+50,y:GROUND-22,vx:390,r:24,age:0,life:4,damage:1});
  }
  function spawnMine(x,y){enemyShots.push({type:'mine',x:clamp(x,60,W-60),y,r:22,age:0,life:2.5,damage:1,pulse:0,triggered:false});}
  function spawnChronoField(x,y,r=96){enemyShots.push({type:'chronoField',x:clamp(x,r,W-r),y,r,age:0,life:2.25,telegraph:0.58,damage:0});sfx('warning');}
  function spawnBlade(x,y,vx,vy){enemyShots.push({type:'blade',x,y,vx,vy,r:22,age:0,life:4,damage:1,rotation:0,gravity:70});}
  function spawnRock(x,y,vx,vy){enemyShots.push({type:'rock',x,y,vx,vy,r:rand(14,25),age:0,life:5,damage:1,rotation:rand(0,TAU),gravity:900});}
  function spawnBomb(x,y){enemyShots.push({type:'bomb',x,y,vx:rand(-35,35),vy:120,r:20,age:0,life:5,damage:1,rotation:0,gravity:760});}
  function spawnBeamV(x,telegraph=0.7,active=0.5){enemyShots.push({type:'beamV',x,y:0,width:42,age:0,life:telegraph+active,telegraph,active,damage:1});sfx('warning');}
  function spawnBeamH(y,telegraph=0.7,active=0.5){enemyShots.push({type:'beamH',x:0,y,width:36,age:0,life:telegraph+active,telegraph,active,damage:1});sfx('warning');}

  function spawnBurst(x,y,color,count=10,speed=200){
    const actual=save.settings.reduceMotion?Math.ceil(count*0.45):count;
    for(let i=0;i<actual;i++){
      const a=rand(0,TAU),s=rand(speed*0.35,speed);
      particles.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,life:rand(0.25,0.7),max:0.7,size:rand(2,7),color,gravity:180});
    }
  }
  function spawnDust(x,y,count=8){
    const actual=save.settings.reduceMotion?Math.ceil(count*0.5):count;
    for(let i=0;i<actual;i++)particles.push({x:x+rand(-20,20),y:y-rand(0,8),vx:rand(-90,90),vy:rand(-130,-30),life:rand(0.3,0.55),max:0.55,size:rand(3,8),color:'#8791a4',gravity:170});
  }
  function addFloatingText(x,y,text,color){floatingTexts.push({x,y,text,color,life:0.75});}
  function shake(amount){screenShake=Math.max(screenShake,amount);}
  function haptic(pattern){
    if (!save.settings.shake || typeof navigator.vibrate !== 'function') return false;
    try { return navigator.vibrate(pattern); } catch { return false; }
  }

  function overlapsPlayerBoss(){
    if (!boss?.collisionEnabled) return false;
    const bx=boss.x-boss.w/2,by=boss.y-boss.h/2;
    const px=player.x-player.w/2,py=player.y-player.h/2;
    return px<bx+boss.w&&px+player.w>bx&&py<by+boss.h&&py+player.h>by;
  }
  function circleHit(x1,y1,r1,x2,y2,r2){const dx=x1-x2,dy=y1-y2;return dx*dx+dy*dy<=(r1+r2)*(r1+r2);}
  function circleRectHit(cx,cy,r,rx,ry,rw,rh){const nx=clamp(cx,rx,rx+rw),ny=clamp(cy,ry,ry+rh);const dx=cx-nx,dy=cy-ny;return dx*dx+dy*dy<=r*r;}
  function clamp(v,min,max){return Math.max(min,Math.min(max,v));}
  function lerp(a,b,t){return a+(b-a)*t;}
  function rand(min,max){return Math.random()*(max-min)+min;}
  function normalizeAngle(a){while(a>Math.PI)a-=TAU;while(a<-Math.PI)a+=TAU;return a;}

  function roundedRect(x,y,w,h,r){
    const radius=Math.min(r,Math.abs(w)/2,Math.abs(h)/2);
    ctx.beginPath();ctx.moveTo(x+radius,y);ctx.arcTo(x+w,y,x+w,y+h,radius);ctx.arcTo(x+w,y+h,x,y+h,radius);ctx.arcTo(x,y+h,x,y,radius);ctx.arcTo(x,y,x+w,y,radius);ctx.closePath();
  }

  function hexToRgba(hex,alpha){
    const clean=hex.replace('#','');const full=clean.length===3?clean.split('').map(c=>c+c).join(''):clean;const n=parseInt(full,16);return `rgba(${(n>>16)&255},${(n>>8)&255},${n&255},${alpha})`;
  }
  function mixColor(a,b,t){
    const parse=h=>{const n=parseInt(h.replace('#',''),16);return[(n>>16)&255,(n>>8)&255,n&255];};
    const A=parse(a),B=parse(b);return `rgb(${Math.round(lerp(A[0],B[0],t))},${Math.round(lerp(A[1],B[1],t))},${Math.round(lerp(A[2],B[2],t))})`;
  }

  function unlockAudio(){
    if(!save.settings.audio)return;
    try{audioContext=audioContext||new (window.AudioContext||window.webkitAudioContext)();if(audioContext.state==='suspended')audioContext.resume();}catch{audioContext=null;}
  }
  function sfx(type){
    if(!save.settings.audio)return;
    unlockAudio();if(!audioContext)return;
    const map={
      jump:[420,0.08,'square',0.035],dash:[170,0.12,'sawtooth',0.05],shot:[690,0.045,'square',0.025],deflect:[1200,0.04,'square',0.025],hit:[260,0.06,'square',0.04],heavyHit:[110,0.13,'sawtooth',0.07],hurt:[95,0.18,'sawtooth',0.065],launch:[190,0.09,'sawtooth',0.035],warning:[860,0.08,'sine',0.025],slam:[62,0.24,'square',0.08],smallExplosion:[75,0.18,'sawtooth',0.055],explode:[48,0.52,'sawtooth',0.095],overload:[980,0.34,'sawtooth',0.075]
    };
    const [freq,duration,wave,volume]=map[type]||map.shot;
    const osc=audioContext.createOscillator(),gain=audioContext.createGain();
    osc.type=wave;osc.frequency.setValueAtTime(freq,audioContext.currentTime);osc.frequency.exponentialRampToValueAtTime(Math.max(35,freq*0.55),audioContext.currentTime+duration);
    gain.gain.setValueAtTime(volume * save.settings.volume,audioContext.currentTime);gain.gain.exponentialRampToValueAtTime(0.0001,audioContext.currentTime+duration);
    osc.connect(gain).connect(audioContext.destination);osc.start();osc.stop(audioContext.currentTime+duration);
  }

  function updateMusic(dt) {
    if (!save.settings.audio || !audioContext || state !== 'fight' || boss?.state === 'intro') return;
    musicBeat -= dt;
    if (musicBeat > 0) return;
    const sequence = [110, 138.59, 164.81, 220, 185, 146.83];
    const frequency = sequence[musicStep % sequence.length] * (1 + ((boss?.phase || 1) - 1) * 0.06);
    musicStep += 1;
    musicBeat = 0.24;
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();
    osc.type = musicStep % 4 === 0 ? 'sawtooth' : 'triangle';
    osc.frequency.value = frequency;
    gain.gain.setValueAtTime(0.012 * save.settings.volume, audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + 0.2);
    osc.connect(gain).connect(audioContext.destination);
    osc.start();
    osc.stop(audioContext.currentTime + 0.21);
  }

  function frame(now){
    const dt=Math.min(0.033,(now-lastTime)/1000||0);lastTime=now;
    pollGamepad();
    handleGamepadMenus();
    if (controller.pausePressed) {
      if (state === 'fight') pauseGame();
      else if (state === 'paused') resumeGame();
    }
    updateMusic(dt);update(dt);draw();pressed.clear();touchPressed.clear();requestAnimationFrame(frame);
  }

  window.addEventListener('keydown',event=>{
    const inFight = state === 'fight';
    if (inFight && ['ArrowLeft','ArrowRight','ArrowUp','Space'].includes(event.code)) event.preventDefault();
    if (inFight) {
      if(!keys[event.code])pressed.add(event.code);
      keys[event.code]=true;
    }
    if(event.code==='Escape'||event.code==='KeyP'){
      if(state==='fight')pauseGame();else if(state==='paused')resumeGame();
    }
  });
  window.addEventListener('keyup',event=>{keys[event.code]=false;});
  function clearHeldInputs() {
    Object.keys(keys).forEach(code => { keys[code] = false; });
    Object.keys(touch).forEach(name => { touch[name] = false; });
    pointer.attack = false;
    controller.left = false;
    controller.right = false;
    controller.attack = false;
    pressed.clear();
    touchPressed.clear();
  }
  window.addEventListener('blur',()=>{clearHeldInputs();if(state==='fight')pauseGame();});
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) return;
    clearHeldInputs();
    if (state === 'fight') pauseGame();
  });
  canvas.addEventListener('pointerdown',event=>{if(event.button===0){event.preventDefault();unlockAudio();pointer.attack=true;}});
  window.addEventListener('pointerup',event=>{if(event.button===0)pointer.attack=false;});
  canvas.addEventListener('contextmenu',event=>event.preventDefault());

  document.querySelectorAll('[data-touch]').forEach(button=>{
    const name=button.dataset.touch;
    const down=e=>{e.preventDefault();unlockAudio();if(!touch[name])touchPressed.add(name);touch[name]=true;};
    const up=e=>{e.preventDefault();touch[name]=false;};
    button.addEventListener('pointerdown',down);button.addEventListener('pointerup',up);button.addEventListener('pointercancel',up);button.addEventListener('pointerleave',up);
  });

  document.getElementById('start-rush').addEventListener('click', showIntroStory);
  document.getElementById('prologue-start')?.addEventListener('click',()=>{markStorySeen(STORY.prologue.id);pendingStoryAction=null;startRun('rush',0);});
  storyContinue?.addEventListener('click',()=>{const action=pendingStoryAction; if(action) action();});
  storyBack?.addEventListener('click',()=>{pendingStoryAction=null;currentStoryKey=null;showScreen('title-screen');});
  document.getElementById('practice').addEventListener('click',()=>{selectionMode='practice';buildBossGrid('practice');showScreen('boss-select-screen');});
  document.querySelector('#continue-run')?.addEventListener('click', resumeRushSnapshot);
  document.querySelector('#forge-rush-start')?.addEventListener('click', () => startRun('forgeRush', FORGE_START_INDEX));
  document.querySelector('#continue-forge')?.addEventListener('click', resumeForgeRushSnapshot);
  document.querySelector('#codex')?.addEventListener('click',()=>{buildCodex();showScreen('codex-screen');});
  document.getElementById('how-to').addEventListener('click',()=>showScreen('how-screen'));
  document.getElementById('settings').addEventListener('click',()=>showScreen('settings-screen'));
  document.querySelectorAll('[data-back]').forEach(button=>button.addEventListener('click',()=>showScreen(button.dataset.back)));
  document.getElementById('resume-button').addEventListener('click',resumeGame);
  document.getElementById('retry-button').addEventListener('click',retryFight);
  document.getElementById('quit-button').addEventListener('click',returnToMenu);
  document.getElementById('gameover-retry').addEventListener('click',retryFight);
  document.getElementById('gameover-menu').addEventListener('click',returnToMenu);
  document.getElementById('continue-button').addEventListener('click',continueAfterResult);
  document.getElementById('result-menu-button').addEventListener('click',returnToMenu);
  document.getElementById('ending-lab').addEventListener('click',openLaboratory);
  document.getElementById('ending-menu').addEventListener('click',returnToMenu);
  document.querySelector('#forge-ending-restart')?.addEventListener('click', () => startRun('forgeRush', FORGE_START_INDEX, { force: true }));
  document.querySelector('#forge-ending-menu')?.addEventListener('click', returnToMenu);

  document.getElementById('difficulty-select').addEventListener('change',event=>{save.settings.difficulty=event.target.value;persistSave();showToast(`Difficulté : ${difficulty().name}`);});
  document.getElementById('audio-toggle').addEventListener('change',event=>{save.settings.audio=event.target.checked;persistSave();if(save.settings.audio){unlockAudio();sfx('hit');}});
  document.getElementById('shake-toggle').addEventListener('change',event=>{save.settings.shake=event.target.checked;persistSave();});
  document.getElementById('motion-toggle').addEventListener('change',event=>{save.settings.reduceMotion=event.target.checked;applySettings();persistSave();});
  document.getElementById('contrast-toggle').addEventListener('change',event=>{save.settings.highContrast=event.target.checked;applySettings();persistSave();});
  document.querySelector('#hints-toggle')?.addEventListener('change',event=>{save.settings.combatHints=event.target.checked;applySettings();persistSave();syncCombatGuidance();});
  volumeControl?.addEventListener('input', event => {
    const max = Number(event.target.max || 1);
    save.settings.volume = clamp(Number(event.target.value) / (max > 1 ? max : 1), 0, 1);
    if (volumeOutput) volumeOutput.textContent = Math.round(save.settings.volume * 100) + ' %';
    persistSave();
  });
  document.querySelector('#touch-pause')?.addEventListener('click', event => {
    event.preventDefault();
    if (state === 'fight') pauseGame();
  });
  const exportSaveButton = document.querySelector('#export-save');
  const importSaveButton = document.querySelector('#import-save');
  const importSaveInput = document.querySelector('#import-save-file');
  exportSaveButton?.addEventListener('click', exportSaveFile);
  importSaveButton?.addEventListener('click', () => importSaveInput?.click());
  importSaveInput?.addEventListener('change', async event => {
    const file = event.currentTarget.files?.[0] || null;
    event.currentTarget.value = '';
    await importSaveFile(file);
  });
  document.getElementById('reset-save').addEventListener('click',()=>{
    if(!confirm('Effacer toute la progression locale : campagne, Circuit Forge, checkpoints, records, maîtrises, Codex et scènes vues ? Exportez d’abord la sauvegarde si vous souhaitez la conserver.'))return;
    const settings={...save.settings};save=structuredClone(DEFAULT_SAVE);save.settings=settings;persistSave();applySettings();buildBossGrid();buildCodex();syncContinueRun();syncContinueForge();showToast('PROGRESSION RÉINITIALISÉE // LE MENU OUBLIE SES CHECKPOINTS', 'Progression réinitialisée.');
  });

  BOSS_REGISTRY?.installDomHooks?.({
    root: document,
    onMode: mode => {
      if (!['practice', 'forge'].includes(mode)) return;
      selectionMode = mode;
      buildBossGrid(mode);
      showScreen('boss-select-screen');
    },
    onSelect: (entry, options) => {
      const index = BOSSES.findIndex(candidate => candidate.id === entry.id);
      if (index >= 0) startRun(entry.engine === 'expanded' ? 'forge' : selectionMode, index, options);
    }
  });

  function launchForgeBoss(id, options = {}) {
    const index = BOSSES.findIndex(entry => entry.id === id);
    if (index < 0) return false;
    return startRun(LEGACY_BOSS_IDS.has(id) && options.mode === 'practice' ? 'practice' : 'forge', index, options);
  }

  const qaAllowed = QA_ALLOWED;
  if (qaAllowed) Object.defineProperty(window, '__GEARSTORM_QA__', {
    value: Object.freeze({
      getState: () => ({ state, runMode, launchMode: requestedLaunchMode, bossIndex: currentBossIndex, bossId: boss?.data.id ?? null, boss: boss?.data.name ?? null, bossState: boss?.state ?? null, currentBossRetries, enduranceRound: boss?.runtime?.round ?? null, signatureCycle: boss?.runtime?.signatureCycle ?? null, bossFamily: boss?.runtime?.family ?? null, mechanicId: boss?.runtime?.mechanicId ?? null, signatureState: boss?.runtime?.signatureState ?? null, mechanicProgress: boss?.runtime?.mechanicProgress ?? null, mechanicTarget: boss?.runtime?.mechanicTarget ?? null, phase: boss?.phase ?? null, hp: boss?.hp ?? null, maxHp: boss?.maxHp ?? null, overload: player?.overload ?? null, barrier: player?.barrier ?? null, installed: [...runBuild.installed], rushSnapshot: sanitizeRushSnapshot(save.rushSnapshot), forgeRushSnapshot: sanitizeForgeRushSnapshot(save.forgeRushSnapshot), activeScreen: document.querySelector('.screen.active')?.id ?? null, art: getGeneratedArtState() }),
      getBossRoster: () => BOSSES.map(entry => ({ id: entry.id, name: entry.name, engine: entry.engine, family: entry.family, wave: entry.wave, mechanicId: entry.signature?.mechanicId || null, phaseStates: entry.signature?.phaseStates ? [...entry.signature.phaseStates] : [] })),
      getForgeTelemetry: () => forgeTelemetrySnapshot(),
      getForgeRunState: () => getForgeRunState(),
      getForgeRushSnapshot: () => sanitizeForgeRushSnapshot(save.forgeRushSnapshot),
      getForgeContractCoverage: () => forgeContractCoverage(),
      processGamepad: () => {
        pollGamepad();
        handleGamepadMenus();
        return document.activeElement?.id || null;
      },
      startForgeRush: (options = {}) => startRun('forgeRush', FORGE_START_INDEX, { ...options, force: true }),
      resumeForgeRush: () => resumeForgeRushSnapshot(),
      launchBoss: (id, options = {}) => launchForgeBoss(id, options),
      launchBossPhase: (id, phase = 1, checkpoint = 1) => launchForgeBoss(id, { phase, checkpoint }),
      retryCurrentFight: () => {
        if (state !== 'fight' || !boss) return false;
        retryFight();
        return true;
      },
      get art() { return getGeneratedArtState(); },
      get ready() { return artRuntime.ready; },
      get loaded() { return [...artRuntime.images.keys()]; },
      get failed() { return [...artRuntime.failed]; },
      get currentAssets() { return [...artRuntime.currentAssets]; },
      getArtState: () => getGeneratedArtState(),
      getRigDiagnostics: () => getRigDiagnostics(),
      setHeroPoseState: pose => {
        if (!player || state !== 'fight' || !pose || typeof pose !== 'object') return false;
        if (Number.isFinite(Number(pose.vx))) player.vx = Number(pose.vx);
        if (Number.isFinite(Number(pose.vy))) player.vy = Number(pose.vy);
        if (Number.isFinite(Number(pose.anim))) player.anim = Number(pose.anim);
        if (Number.isFinite(Number(pose.poseAim))) player.poseAim = clamp(Number(pose.poseAim), 0, 1);
        if (Number.isFinite(Number(pose.poseRecoil))) player.poseRecoil = clamp(Number(pose.poseRecoil), 0, 1);
        if (Number.isFinite(Number(pose.poseLand))) player.poseLand = clamp(Number(pose.poseLand), 0, 1);
        if (Number.isFinite(Number(pose.dashTime))) player.dashTime = Math.max(0, Number(pose.dashTime));
        if (typeof pose.onGround === 'boolean') player.onGround = pose.onGround;
        return getRigDiagnostics().heroine;
      },
      getRushSnapshot: () => sanitizeRushSnapshot(save.rushSnapshot),
      resumeRush: () => resumeRushSnapshot(),
      protectPlayer: () => {
        if (state !== 'fight' || !player) return false;
        player.hp = player.maxHp;
        player.invuln = Math.max(player.invuln, 600);
        return true;
      },
      completePhaseTransition: () => {
        if (state !== 'fight' || !boss || boss.state !== 'phaseTransition') return false;
        boss.stateTime = 999;
        updateBoss(0);
        return boss.state !== 'phaseTransition';
      },
      jumpToPhase: phase => {
        if (state !== 'fight' || !boss || !isExpandedBoss()) return false;
        const target = clamp(Math.floor(Number(phase) || 1), 1, 3);
        boss.phase = target;
        boss.hp = target === 1 ? boss.maxHp : target === 2 ? Math.ceil(boss.maxHp * 2 / 3) : Math.ceil(boss.maxHp / 3);
        setBossState('phaseEnter');
        configureExpandedPhase();
        return true;
      },
      completeForgeMechanic: () => {
        if (state !== 'fight' || !isExpandedBoss() || !boss.runtime) return false;
        completeExpandedMechanic('QA · MÉCANIQUE VALIDÉE');
        enterExpandedVulnerability();
        return true;
      },
      setRigDebug: enabled => { rigDebug = enabled === true; return rigDebug; },
      skipIntro: () => { if (!boss || state !== 'fight') return false; introTimer = 0; bossIntro.classList.remove('visible'); bossIntro.setAttribute('aria-hidden', 'true'); if (boss.state === 'intro') boss.stateTime = 10; return true; },
      setBossHealthRatio: ratio => {
        if (!boss || boss.defeated || state !== 'fight') return false;
        const requestedRatio = clamp(Number(ratio), 0.01, 1);
        const targetPhase = requestedRatio > 2 / 3 ? 1 : requestedRatio > 1 / 3 ? 2 : 3;
        if (targetPhase > boss.phase) {
          boss.hp = phaseHealthFloor();
          beginPhaseTransition(boss.phase + 1);
        } else {
          boss.hp = Math.max(1, Math.round(boss.maxHp * requestedRatio));
        }
        return true;
      },
      chargeOverload: () => { if (!player || state !== 'fight') return false; player.overload = 100; activateOverload(); return player.overloadTime > 0; },
      defeatBoss: () => {
        if (!boss || boss.defeated || state !== 'fight') return false;
        introTimer = 0;
        bossIntro.classList.remove('visible');
        bossIntro.setAttribute('aria-hidden', 'true');
        boss.phase = 3;
        if (boss.data.id === 'endurance-engine') currentForgeTelemetry.enduranceRounds.add(6);
        boss.state = 'coreOpen';
        boss.vulnerable = true;
        boss.hp = 1;
        damageBoss(1);
        transitionTimer = 0.01;
        return true;
      }
    })
  });

  function registerInstallPrompt() {
    const button = document.querySelector('#install-app');
    if (!button) return;
    let promptEvent = null;
    const isStandalone = () => matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
    button.hidden = true;
    window.addEventListener('beforeinstallprompt', event => {
      event.preventDefault();
      promptEvent = event;
      button.hidden = isStandalone();
      button.disabled = false;
    });
    window.addEventListener('appinstalled', () => {
      promptEvent = null;
      button.hidden = true;
      showToast('INSTALLATION TERMINÉE // LE CIRCUIT GARDE SON PROPRE ÉCRAN', 'GEARSTORM est installé.');
    });
    button.addEventListener('click', async () => {
      if (!promptEvent) return;
      button.disabled = true;
      try {
        await promptEvent.prompt();
        const choice = await promptEvent.userChoice;
        promptEvent = null;
        button.hidden = true;
        if (choice?.outcome !== 'accepted') showToast('INSTALLATION REPORTÉE // LE CIRCUIT RESTE DANS CET ONGLET', 'Installation annulée.');
      } finally {
        button.disabled = false;
      }
    });
  }

  function syncFullscreenControl() {
    const button = document.querySelector('#fullscreen-toggle');
    if (!button) return;
    const target = document.documentElement;
    if (typeof target.requestFullscreen !== 'function' || typeof document.exitFullscreen !== 'function') {
      button.hidden = true;
      return;
    }
    const syncLabel = () => {
      const active = Boolean(document.fullscreenElement);
      button.setAttribute('aria-pressed', String(active));
      button.textContent = active
        ? 'Quitter le plein écran · revenir au cadre'
        : 'Plein écran · agrandir l’arène';
    };
    button.addEventListener('click', async () => {
      try {
        if (document.fullscreenElement) await document.exitFullscreen();
        else await target.requestFullscreen();
      } catch {
        showToast('PLEIN ÉCRAN REFUSÉ // LE CADRE RESTE VISIBLE', 'Le plein écran est indisponible.');
      }
    });
    document.addEventListener('fullscreenchange', syncLabel);
    syncLabel();
  }

  function registerGearstormServiceWorker() {
    if (!('serviceWorker' in navigator) || !/^https?:$/.test(location.protocol)) return;
    const marker = '__GEARSTORM_PWA_UPDATE_V2_10_0__';
    if (globalThis[marker]) return;
    globalThis[marker] = true;
    const updateButton = document.querySelector('#update-app');
    let refreshing = false;
    let updateAccepted = false;
    let activeRegistration = null;
    const revealUpdate = registration => {
      if (!registration?.waiting || !navigator.serviceWorker.controller || !updateButton) return;
      activeRegistration = registration;
      updateButton.hidden = false;
      updateButton.disabled = false;
    };
    updateButton?.addEventListener('click', () => {
      const waiting = activeRegistration?.waiting;
      if (!waiting) return;
      updateAccepted = true;
      updateButton.disabled = true;
      updateButton.textContent = 'Mise à jour · le shell change de scène…';
      waiting.postMessage({ type: 'SKIP_WAITING' });
    });
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (!updateAccepted || refreshing) return;
      refreshing = true;
      window.location.reload();
    });
    navigator.serviceWorker.register('./sw.js').then(registration => {
      if (registration.waiting) revealUpdate(registration);
      registration.addEventListener('updatefound', () => {
        const installing = registration.installing;
        installing?.addEventListener('statechange', () => {
          if (installing.state === 'installed') revealUpdate(registration);
        });
      });
    }).catch(() => {
      console.warn('Service worker GEARSTORM indisponible.');
    });
  }

  window.addEventListener('load', registerGearstormServiceWorker, { once: true });

  applySettings();
  artRuntime.initialPromise = initializeGeneratedArt();
  registerInstallPrompt();
  syncFullscreenControl();
  buildBossGrid();
  buildCodex();
  syncContinueRun();
  syncContinueForge();
  const bestRushText=save.bestRush?`Le menu se souvient du meilleur Circuit : ${formatTime(save.bestRush)}`:'Sauvegarde locale // le checkpoint se souvient';
  document.getElementById('save-note').textContent=bestRushText;
  if (!routeLaunchMode()) showScreen("title-screen");
  requestAnimationFrame(frame);
})();
