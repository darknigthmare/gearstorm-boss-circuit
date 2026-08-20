(() => {
  'use strict';

  const canvas = document.getElementById('game');
  const ctx = canvas.getContext('2d');
  const W = 1280;
  const H = 720;
  const GROUND = 620;
  const TAU = Math.PI * 2;

  const BOSSES = [
    {
      id: 'rammer',
      name: 'RIVET REX',
      epithet: 'Le bélier mono-roue à marteaux variables',
      color: '#ff8b42',
      accent: '#fff0a6',
      hp: 120,
      arena: 'Rocade des Rivets',
      quote: '« Riva Spark ! Trois phases, quatre marteaux et absolument aucun frein. Admire le génie de Voltério ! »',
      description: 'Charges, marteaux, mines et impacts sismiques.',
      transmission: 'Le premier verrou du Circuit vient de céder. Voltério comprend enfin que tu n’es pas une variable de laboratoire.'
    },
    {
      id: 'kraken',
      name: 'SKY SLICER',
      epithet: 'Le rapace bombardier à géométrie variable',
      color: '#2bc9e8',
      accent: '#b7fbff',
      hp: 145,
      arena: 'Couloir des Hautes-Tensions',
      quote: '« Le ciel est mon laboratoire, Spark. Essaie donc d’esquiver une équation qui vole ! »',
      description: 'Drones ioniques, piqués, bombes et grilles laser.',
      transmission: 'Le brouillage aérien est tombé. Les districts du nord reçoivent de nouveau le signal de Riva.'
    },
    {
      id: 'drill',
      name: 'MAGNETRON',
      epithet: 'L’araignée magnétique qui replie l’arène',
      color: '#b777ff',
      accent: '#f2dcff',
      hp: 160,
      arena: 'Fosse Ferromagnétique',
      quote: '« Attraction, répulsion… et humiliation. La physique a déjà choisi son camp ! »',
      description: 'Tractions magnétiques, ferraille orbitale et surgissements.',
      transmission: 'Les rails d’évacuation sont libérés. Les habitants commencent à quitter les gradins forcés.'
    },
    {
      id: 'mantis',
      name: 'CHRONO MANTIS',
      epithet: 'La mante temporelle aux lames déphasées',
      color: '#ff4f7b',
      accent: '#ffd0dc',
      hp: 175,
      arena: 'Horloge de la Faille',
      quote: '« J’ai ralenti le temps autour de toi. Techniquement, ta défaite dure déjà depuis plusieurs minutes. »',
      description: 'Ruées, téléportations, engrenages et ralentissements.',
      transmission: 'Les horloges du Circuit redémarrent. Voltério ne peut plus effacer les secondes où tu le dépasses.'
    },
    {
      id: 'cyclotron',
      name: 'FOUNDRY TITAN',
      epithet: 'Le colosse-fonderie qui remodèle le sol',
      color: '#ffb12e',
      accent: '#fff0b7',
      hp: 205,
      arena: 'Fournaise des Pistons',
      quote: '« Mon Titan recycle une ville entière avant le petit-déjeuner. Toi, tu seras l’échantillon de démonstration. »',
      description: 'Pistons, lave, flammes et pluie de métal en fusion.',
      transmission: 'La fonderie est froide. Pour la première fois, le Circuit n’est plus alimenté par la peur.'
    },
    {
      id: 'omega',
      name: 'CROWN ENGINE Ω',
      epithet: 'La forteresse finale aux trois formes',
      color: '#8f78ff',
      accent: '#fff4ad',
      hp: 280,
      arena: 'Citadelle Voltério',
      quote: '« Toutes mes inventions, un seul trône, et moi au centre. La conclusion était inévitable ! »',
      description: 'Trois formes combinant toutes les technologies du Circuit.',
      transmission: 'La Couronne est brisée. Le Circuit Voltério appartient de nouveau à ceux qui y vivent.'
    }
  ];

  const DIFFICULTIES = {
    casual: { enemySpeed: 0.82, bossHealth: 0.86, playerHealth: 8, scoreMultiplier: 0.82, parMultiplier: 1.18, name: 'Pilote' },
    standard: { enemySpeed: 1, bossHealth: 1, playerHealth: 6, scoreMultiplier: 1, parMultiplier: 1, name: 'Ingénieur' },
    overdrive: { enemySpeed: 1.18, bossHealth: 1.18, playerHealth: 5, scoreMultiplier: 1.32, parMultiplier: 0.9, name: 'Overdrive' }
  };
  const BOSS_PAR_TIMES = [44, 52, 58, 54, 66, 82];
  const RUSH_RETRY_PENALTY = 12;
  const RUSH_RETRY_SCORE_PENALTY = 750;

  const SAVE_KEY = 'gearstorm_boss_circuit_save_v2';
  const LEGACY_SAVE_KEY = 'geargrin_overdrive_save';
  const UPGRADES = [
    { id: 'rapid', maxStacks: 3, icon: '⚡', name: 'Cadence polarisée', description: 'Réduit de 22 % le délai entre deux tirs.', apply: build => { build.fireRate *= 0.78; } },
    { id: 'core', maxStacks: 2, icon: '◆', name: 'Noyau auxiliaire', description: 'Ajoute deux points de vie au prochain châssis.', apply: build => { build.maxHpBonus += 2; } },
    { id: 'dash', maxStacks: 3, icon: '➜', name: 'Ruée vectorielle', description: 'Réduit le délai de ruée et augmente son impact.', apply: build => { build.dashCooldown *= 0.78; build.dashDamage += 4; } },
    { id: 'split', maxStacks: 1, icon: '✦', name: 'Canon bifurqué', description: 'Ajoute deux impulsions obliques à chaque salve.', apply: build => { build.multishot = Math.min(3, build.multishot + 2); } },
    { id: 'amplifier', maxStacks: 3, icon: '⬢', name: 'Amplificateur de noyau', description: 'Augmente les dégâts des tirs de 25 %.', apply: build => { build.shotDamage *= 1.25; } },
    { id: 'overload', maxStacks: 3, icon: '◎', name: 'Condensateur Overdrive', description: 'Charge plus vite et prolonge la surcharge.', apply: build => { build.overloadGain *= 1.35; build.overloadDuration += 1.1; } }
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
      installed: []
    };
  }

  const DEFAULT_SAVE = {
    version: 2,
    unlocked: 1,
    bestTimes: {},
    bestRush: null,
    completed: false,
    settings: {
      difficulty: 'standard',
      audio: true,
      volume: 0.78,
      shake: true,
      reduceMotion: false,
      highContrast: false
    }
  };

  let save = loadSave();
  let state = 'menu';
  let runMode = 'rush';
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
  const touchControls = document.getElementById('touch-controls');
  const bossIntro = document.getElementById('boss-intro');
  const toast = document.getElementById('toast');
  const announcer = document.querySelector('#game-status, #game-announcer, #sr-announcer, [data-game-announcer]');
  const volumeControl = document.querySelector('#master-volume, #volume-control, #volume-slider');
  const volumeOutput = document.querySelector('#master-volume-value');
  const mobilePlayerHp = document.querySelector('#mobile-player-hp');
  const mobileBossHp = document.querySelector('#mobile-boss-hp');
  const mobileOverload = document.querySelector('#mobile-overload');


  const ART_MANIFEST_URL = 'assets/generated/v2.2.0/asset-manifest.json';
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
    effects: [],
    parallaxTime: 0,
    initialPromise: null
  };

  const HERO_ART_PRESET = {
    'dash-trail': { x: -42, y: 4, size: 112 },
    'overload-halo': { x: 0, y: -7, size: 122 },
    'arm-far': { x: -15, y: -7, size: 55 },
    legs: { x: 0, y: 22, size: 60 },
    boots: { x: 0, y: 37, size: 58 },
    torso: { x: 0, y: -7, size: 61 },
    head: { x: 0, y: -42, size: 47 },
    'arm-near': { x: 17, y: -6, size: 57 },
    'pulse-cannon': { x: 31, y: -5, size: 58 }
  };

  const BOSS_ART_PRESETS = {
    rammer: {
      parts: [
        ['wheel', 14, 54, 124, 1], ['chassis', 0, 10, 178, 1], ['ram', -100, 18, 105, 1],
        ['hammer-left', -49, -53, 92, 1], ['hammer-right', 54, -53, 92, 1],
        ['rivet-pod', 76, -18, 88, 2], ['mine-seismic', 5, 66, 75, 2],
        ['core', 21, -31, 70, 1], ['overdrive', 0, 0, 216, 3]
      ]
    },
    kraken: {
      parts: [
        ['tail-thruster', 0, 50, 98, 1], ['wing-left', -78, 0, 145, 1], ['wing-right', 78, 0, 145, 1],
        ['fuselage', 0, 5, 160, 1], ['cockpit', 0, -47, 78, 1],
        ['ion-emitter', -48, 30, 82, 2], ['bomb-pod', 50, 30, 82, 2],
        ['core', 0, 8, 68, 1], ['laser-blades', 0, 0, 225, 3]
      ]
    },
    drill: {
      parts: [
        ['legs-rear', 0, 51, 174, 1], ['legs-front-left', -65, 38, 130, 1],
        ['legs-front-right', 65, 38, 130, 1], ['carapace', 0, 2, 169, 1],
        ['cockpit', 0, -55, 80, 1], ['magnetic-coil', 0, 18, 112, 2],
        ['polarity-claws', 0, 58, 184, 2], ['core', 0, -31, 70, 1],
        ['scrap-ring', 0, 0, 224, 3]
      ]
    },
    mantis: {
      parts: [
        ['legs-left', -43, 54, 151, 1], ['legs-right', 43, 54, 151, 1],
        ['torso', 0, 3, 145, 1], ['scythe-left', -76, -23, 164, 1],
        ['scythe-right', 76, -23, 164, 1], ['cockpit', 0, -62, 74, 1],
        ['time-emitter', 0, 13, 90, 2], ['core', 0, -7, 68, 1],
        ['chrono-halo', 0, -18, 220, 3]
      ]
    },
    cyclotron: {
      parts: [
        ['leg-left', -53, 61, 137, 1], ['leg-right', 53, 61, 137, 1],
        ['furnace-torso', 0, 3, 177, 1], ['piston-left', -82, 0, 124, 1],
        ['piston-right', 82, 0, 124, 1], ['cockpit', 0, -64, 79, 1],
        ['stacks-hopper', 0, -77, 121, 2], ['molten-core', 0, 6, 88, 1],
        ['overarmor', 0, 0, 229, 3]
      ]
    },
    omega: {
      parts: [
        ['stabilizers', 0, 64, 188, 1], ['crown-hull', 0, 2, 197, 1],
        ['battery-left', -87, 16, 124, 1], ['battery-right', 87, 16, 124, 1],
        ['throne-cockpit', 0, -76, 94, 1], ['blade-ring', 0, 0, 226, 2],
        ['combined-arsenal', 0, 13, 203, 2], ['omega-core', 0, 6, 92, 1],
        ['ruptured-armor', 0, 0, 237, 3]
      ]
    }
  };

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
    const arena = artRuntime.manifest.arenas?.[id]?.layers || {};
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

  function preloadGeneratedBossBundle(id) {
    if (!artRuntime.manifest || !id) return Promise.resolve([]);
    if (artRuntime.bundlePromises.has(id)) return artRuntime.bundlePromises.get(id);
    const pending = preloadGeneratedEntries(generatedArtBossEntries(id));
    artRuntime.bundlePromises.set(id, pending);
    return pending;
  }

  function queueGeneratedArtForBoss(id, markCurrent = true) {
    if (id) artRuntime.activeBossId = id;
    if (!artRuntime.manifest) return Promise.resolve([]);
    const activeId = id || artRuntime.activeBossId || 'rammer';
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
      currentAssets: [...artRuntime.currentAssets]
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

  function drawGeneratedArena(data) {
    const arena = artRuntime.manifest?.arenas?.[data.id];
    if (!arena) return false;
    void preloadGeneratedBossBundle(data.id);
    let painted = false;
    const layers = ['far', 'mid', 'ground', 'foreground'];
    for (let index = 0; index < layers.length; index++) {
      const layer = arena.layers?.[layers[index]];
      const image = generatedImage(layer);
      if (!image) continue;
      const speed = Number(layer.speed) || 0;
      const margin = 30 + speed * 170;
      const phase = artRuntime.parallaxTime * (0.38 + speed * 4.2) + index * 0.75;
      const shift = save.settings.reduceMotion ? 0 : Math.sin(phase) * Math.min(margin * 0.72, speed * 185);
      ctx.save();
      ctx.imageSmoothingEnabled = true;
      ctx.drawImage(image, -margin + shift, -margin * 0.3, W + margin * 2, H + margin * 0.6);
      ctx.restore();
      painted = true;
    }
    return painted;
  }

  function heroArtReady() {
    const parts = artRuntime.manifest?.heroine?.parts;
    return !!parts && ['head', 'torso', 'legs', 'boots', 'arm-near', 'arm-far', 'pulse-cannon']
      .every(name => generatedImage(parts[name]));
  }

  function drawGeneratedPlayer() {
    const parts = artRuntime.manifest?.heroine?.parts;
    if (!heroArtReady()) return false;
    const gait = player.onGround ? Math.sin(player.anim) : 0;
    const speedPose = Math.min(1, Math.abs(player.vx) / 330);
    const airborne = player.onGround ? 0 : clamp(player.vy / 900, -0.65, 0.65);
    const firing = player.shotCooldown > runBuild.fireRate * 0.52 ? 1 : 0;
    const dashPose = player.dashTime > 0 ? -0.13 : 0;
    const wholeTilt = dashPose + airborne * 0.09;

    if (player.dashTime > 0) {
      const trail = HERO_ART_PRESET['dash-trail'];
      drawGeneratedPart(parts['dash-trail'], trail.x, trail.y, trail.size, 0, 1 + speedPose * 0.12, 0.82);
    }
    if (player.overloadTime > 0) {
      const halo = HERO_ART_PRESET['overload-halo'];
      const pulse = save.settings.reduceMotion ? 1 : 1 + Math.sin(player.anim * 2.4) * 0.06;
      drawGeneratedPart(parts['overload-halo'], halo.x, halo.y, halo.size, 0, pulse, 0.88);
    }

    ctx.save();
    ctx.rotate(wholeTilt);
    let pose = HERO_ART_PRESET['arm-far'];
    drawGeneratedPart(parts['arm-far'], pose.x, pose.y + gait * 1.5, pose.size, -gait * 0.11 * speedPose);
    pose = HERO_ART_PRESET.legs;
    drawGeneratedPart(parts.legs, pose.x, pose.y + Math.abs(gait) * 1.5, pose.size, gait * 0.045 * speedPose);
    pose = HERO_ART_PRESET.boots;
    drawGeneratedPart(parts.boots, pose.x + gait * 1.8 * speedPose, pose.y, pose.size, gait * 0.035 * speedPose);
    pose = HERO_ART_PRESET.torso;
    drawGeneratedPart(parts.torso, pose.x, pose.y, pose.size, -gait * 0.018 * speedPose);
    pose = HERO_ART_PRESET.head;
    drawGeneratedPart(parts.head, pose.x, pose.y, pose.size, -wholeTilt * 0.35);
    pose = HERO_ART_PRESET['arm-near'];
    drawGeneratedPart(parts['arm-near'], pose.x - firing * 2, pose.y, pose.size, gait * 0.08 * speedPose - firing * 0.07);
    pose = HERO_ART_PRESET['pulse-cannon'];
    drawGeneratedPart(parts['pulse-cannon'], pose.x - firing * 4, pose.y, pose.size, -firing * 0.045);
    ctx.restore();
    return true;
  }

  function bossPartMotion(name, baseX, baseY, baseSize, index) {
    const t = save.settings.reduceMotion ? 0 : boss.totalTime;
    const side = name.includes('left') ? -1 : name.includes('right') ? 1 : 0;
    let x = baseX;
    let y = baseY;
    let rotation = 0;
    let scale = 1;
    if (/wheel|ring|halo|blade/.test(name)) rotation += t * (side || 1) * 0.42;
    if (/hammer|scythe|wing|piston|leg/.test(name)) rotation += side * Math.sin(t * 2.7 + index) * 0.065;
    if (/thruster|emitter|hopper|battery/.test(name)) y += Math.sin(t * 3.1 + index) * 2.4;
    if (/core/.test(name) && boss.vulnerable) scale += (save.settings.reduceMotion ? 0.04 : 0.055 + Math.sin(t * 7) * 0.035);
    if (boss.state === 'phaseTransition') {
      const progress = clamp(boss.stateTime / 1.05, 0, 1);
      const burst = Math.sin(progress * Math.PI) * (20 + index * 1.25);
      const angle = index / 9 * TAU + 0.45;
      x += Math.cos(angle) * burst;
      y += Math.sin(angle) * burst;
      rotation += Math.sin(angle) * burst * 0.012;
    }
    return { x, y, size: baseSize, rotation, scale };
  }

  function drawGeneratedBoss() {
    const preset = BOSS_ART_PRESETS[boss?.data?.id];
    const parts = artRuntime.manifest?.bosses?.[boss?.data?.id]?.parts;
    if (!preset || !parts) return false;
    const active = preset.parts.filter(spec => spec[4] <= boss.phase);
    if (!active.every(spec => generatedImage(parts[spec[0]]))) return false;
    for (let index = 0; index < active.length; index++) {
      const spec = active[index];
      const pose = bossPartMotion(spec[0], spec[1], spec[2], spec[3], index);
      drawGeneratedPart(parts[spec[0]], pose.x, pose.y, pose.size, pose.rotation, pose.scale);
    }
    return true;
  }

  function drawGeneratedBossPreview(data) {
    const preset = BOSS_ART_PRESETS[data.id];
    const parts = artRuntime.manifest?.bosses?.[data.id]?.parts;
    if (!preset || !parts) return false;
    void preloadGeneratedBossBundle(data.id);
    const active = preset.parts.filter(spec => spec[4] <= 2);
    if (!active.every(spec => generatedImage(parts[spec[0]]))) return false;
    ctx.save();
    ctx.scale(0.56, 0.56);
    for (let index = 0; index < active.length; index++) {
      const spec = active[index];
      const sway = save.settings.reduceMotion ? 0 : Math.sin(artRuntime.parallaxTime * 1.7 + index) * 0.018;
      drawGeneratedPart(parts[spec[0]], spec[1], spec[2], spec[3], sway);
    }
    ctx.restore();
    return true;
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

  function loadSave() {
    try {
      const raw = localStorage.getItem(SAVE_KEY) ?? localStorage.getItem(LEGACY_SAVE_KEY);
      if (!raw) return structuredClone(DEFAULT_SAVE);
      const parsed = JSON.parse(raw);
      const safe = structuredClone(DEFAULT_SAVE);
      safe.unlocked = Math.floor(clamp(Number(parsed?.unlocked) || 1, 1, BOSSES.length));
      safe.bestRush = Number.isFinite(parsed?.bestRush) && parsed.bestRush > 0 ? parsed.bestRush : null;
      safe.completed = parsed?.completed === true;
      safe.bestTimes = {};
      for (const entry of BOSSES) {
        const time = Number(parsed?.bestTimes?.[entry.id]);
        if (Number.isFinite(time) && time > 0) safe.bestTimes[entry.id] = time;
      }
      const settings = parsed?.settings && typeof parsed.settings === 'object' ? parsed.settings : {};
      safe.settings.difficulty = Object.hasOwn(DIFFICULTIES, settings.difficulty) ? settings.difficulty : 'standard';
      for (const key of ['audio', 'shake', 'reduceMotion', 'highContrast']) {
        if (typeof settings[key] === 'boolean') safe.settings[key] = settings[key];
      }
      const volume = Number(settings.volume);
      if (Number.isFinite(volume)) safe.settings.volume = clamp(volume, 0, 1);
      return safe;
    } catch {
      return structuredClone(DEFAULT_SAVE);
    }
  }

  function persistSave() {
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(save));
    } catch {
      showToast('Sauvegarde locale indisponible');
    }
  }

  function applySettings() {
    document.body.classList.toggle('reduce-motion', save.settings.reduceMotion);
    document.body.classList.toggle('high-contrast', save.settings.highContrast);
    document.getElementById('difficulty-select').value = save.settings.difficulty;
    document.getElementById('audio-toggle').checked = save.settings.audio;
    document.getElementById('shake-toggle').checked = save.settings.shake;
    document.getElementById('motion-toggle').checked = save.settings.reduceMotion;
    document.getElementById('contrast-toggle').checked = save.settings.highContrast;
    if (volumeControl) {
      const max = Number(volumeControl.max || 1);
      volumeControl.value = String(max > 1 ? Math.round(save.settings.volume * max) : save.settings.volume);
      if (volumeOutput) volumeOutput.textContent = Math.round(save.settings.volume * 100) + ' %';
    }
  }

  function showScreen(id) {
    screens.forEach(screen => screen.classList.toggle('active', screen.id === id));
    requestAnimationFrame(() => {
      const active = document.getElementById(id);
      const focused = active?.querySelector('button:not(:disabled):not([hidden]), select:not(:disabled), input:not(:disabled)');
      focused?.focus({ preventScroll: true });
    });
  }

  function closeScreens() {
    screens.forEach(screen => screen.classList.remove('active'));
  }

  function announce(message) {
    if (!announcer) return;
    announcer.textContent = '';
    requestAnimationFrame(() => { announcer.textContent = message; });
  }
  function syncAccessibleHud() {
    if (!player || !boss || state !== 'fight') return;
    if (mobilePlayerHp) mobilePlayerHp.textContent = player.hp + ' / ' + player.maxHp;
    if (mobileBossHp) mobileBossHp.textContent = Math.ceil(100 * boss.hp / boss.maxHp) + ' % · P' + boss.phase;
    if (mobileOverload) mobileOverload.textContent = Math.round(player.overloadTime > 0 ? 100 : player.overload) + ' %';
  }
  function showToast(message) {
    toast.textContent = message;
    toast.classList.add('visible');
    toastTimer = 2.3;
    announce(message);
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
  function buildBossGrid() {
    const grid = document.getElementById('boss-grid');
    grid.textContent = '';
    BOSSES.forEach((entry, index) => {
      const unlocked = index < save.unlocked;
      const button = document.createElement('button');
      button.className = 'boss-card';
      button.style.setProperty('--boss-color', entry.color);
      button.disabled = !unlocked;
      button.innerHTML = `
        <span>
          <span class="boss-number">${unlocked ? `MACHINE ${String(index + 1).padStart(2, '0')}` : 'VERROUILLÉE'}</span>
          <strong>${unlocked ? entry.name : 'SIGNATURE INCONNUE'}</strong>
          <em>${unlocked ? entry.arena : 'Termine la machine précédente'}</em>
        </span>
        <span>
          <small>${unlocked ? entry.description : 'Données chiffrées par Voltério.'}</small>
          <span class="best">${unlocked ? `Meilleur temps : ${formatTime(save.bestTimes[entry.id])}` : ''}</span>
        </span>`;
      if (unlocked) button.addEventListener('click', () => startRun('practice', index));
      grid.appendChild(button);
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
      dashCooldown: 0,
      dashTime: 0,
      dashHitLock: 0,
      overload: 0,
      overloadTime: 0,
      anim: 0,
      landed: false
    };
  }

  function createBoss(index) {
    const data = BOSSES[index];
    const maxHp = Math.round(data.hp * difficulty().bossHealth);
    return {
      data,
      x: 960,
      y: 330,
      vx: 0,
      vy: 0,
      w: data.id === 'cyclotron' ? 230 : 190,
      h: data.id === 'omega' ? 220 : 160,
      maxHp,
      hp: maxHp,
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
      phase: 1,
      dashHitCooldown: 0,
      defeated: false
    };
  }

  function startRun(mode, index = 0) {
    unlockAudio();
    runMode = mode;
    currentBossIndex = index;
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
    startFight(index);
  }

  function startFight(index, { retry = false } = {}) {
    currentBossIndex = index;
    if (retry) score = scoreAtBossStart;
    else {
      scoreAtBossStart = score;
      currentBossRetries = 0;
    }
    damageTaken = 0;
    combo = 0;
    comboTimer = 0;
    maxCombo = 0;
    resetFightClock();
    resetWorld();
    player = createPlayer();
    boss = createBoss(index);
    void queueGeneratedArtForBoss(boss.data.id, true);
    currentBossStart = performance.now() / 1000;
    state = 'fight';
    closeScreens();
    touchControls.classList.add('in-game');
    configureIntro();
  }

  function retryFight() {
    const penalized = runMode === 'rush';
    if (penalized) {
      currentBossRetries += 1;
      runRetryCount += 1;
      rushRetryPenalty += RUSH_RETRY_PENALTY;
    }
    startFight(currentBossIndex, { retry: true });
    if (penalized) {
      score = Math.max(0, score - RUSH_RETRY_SCORE_PENALTY);
      scoreAtBossStart = score;
      showToast('Retry : +' + RUSH_RETRY_PENALTY + ' s · -' + RUSH_RETRY_SCORE_PENALTY + ' pts');
    }
  }

  function configureIntro() {
    const data = BOSSES[currentBossIndex];
    document.getElementById('intro-index').textContent = `${data.arena} · MACHINE ${String(currentBossIndex + 1).padStart(2, '0')}`;
    document.getElementById('intro-name').textContent = data.name;
    document.getElementById('intro-epithet').textContent = data.epithet;
    document.getElementById('intro-quote').textContent = data.quote;
    bossIntro.classList.add('visible');
    bossIntro.setAttribute('aria-hidden', 'false');
    introTimer = 2.6;
    announce(data.name + '. ' + data.epithet);
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
    const pad = navigator.getGamepads?.()[0];
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
    const focusables = [...activeScreen.querySelectorAll('button:not(:disabled):not([hidden]), select:not(:disabled), input:not(:disabled)')];
    if (!focusables.length) return;
    let index = focusables.indexOf(document.activeElement);
    if (index < 0) index = 0;
    const active = focusables[index];
    const horizontal = controller.menuLeftPressed || controller.menuRightPressed;
    if (horizontal && active instanceof HTMLSelectElement) {
      const direction = controller.menuRightPressed ? 1 : -1;
      active.selectedIndex = clamp(active.selectedIndex + direction, 0, active.options.length - 1);
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

  function activateOverload() {
    if (!player || player.overload < 100 || player.overloadTime > 0) return;
    player.overload = 0;
    player.overloadTime = runBuild.overloadDuration;
    player.invuln = Math.max(player.invuln, 0.45);
    enemyShots.forEach(shot => { shot.life = Math.min(shot.life, 1.4); });
    spawnBurst(player.x, player.y, '#fff39a', 34, 430);
    spawnGeneratedVfx('overload-bloom', player.x, player.y, { size: 174, duration: 0.62, growth: 0.72 });
    spawnGeneratedVfx('electric-arcs', player.x, player.y, { size: 128, duration: 0.48, growth: 0.3 });
    addFloatingText(player.x, player.y - 72, 'SURCHARGE', '#fff39a');
    shake(12);
    sfx('overload');
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
    player.dashCooldown = Math.max(0, player.dashCooldown - dt);
    player.dashTime = Math.max(0, player.dashTime - dt);
    player.dashHitLock = Math.max(0, player.dashHitLock - dt);
    player.overloadTime = Math.max(0, player.overloadTime - dt);
    if (overloadPress) activateOverload();

    if (moveLeft !== moveRight && player.dashTime <= 0) {
      const direction = moveRight ? 1 : -1;
      player.facing = direction;
      player.vx += direction * runBuild.moveAccel * dt;
    } else if (player.dashTime <= 0) {
      player.vx *= Math.pow(0.0008, dt);
    }

    if (jumpPress && player.jumpsLeft > 0) {
      player.vy = -720;
      player.jumpsLeft -= 1;
      player.onGround = false;
      spawnBurst(player.x, player.y + 30, '#8defff', 8, 150);
      sfx('jump');
    }

    if (dashPress && player.dashCooldown <= 0) {
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
      sfx('dash');
    }

    if (attackHeld && player.shotCooldown <= 0) {
      player.shotCooldown = runBuild.fireRate;
      const spread = runBuild.multishot === 1 ? [0] : [-0.11, 0, 0.11];
      for (const angle of spread) {
        playerShots.push({
          x: player.x + player.facing * 32,
          y: player.y - 10,
          vx: player.facing * 920,
          vy: angle * 920,
          r: 7,
          damage: runBuild.shotDamage,
          life: 1.25,
          trail: 0
        });
      }
      spawnGeneratedVfx('muzzle-cyan', player.x + player.facing * 38, player.y - 10, {
        size: 46,
        duration: 0.16,
        rotation: player.facing < 0 ? Math.PI : 0,
        growth: 0.25
      });
      sfx('shot');
    }

    if (player.dashTime <= 0) {
      player.vx = clamp(player.vx, -390, 390);
      player.vy += 1880 * dt;
    } else {
      particles.push({ x: player.x - player.facing * 24, y: player.y + rand(-20, 20), vx: -player.facing * rand(120, 280), vy: rand(-50, 50), life: 0.28, max: 0.28, size: rand(3, 8), color: '#77efff' });
    }

    player.x += player.vx * dt;
    player.y += player.vy * dt;
    player.x = clamp(player.x, 28, W - 28);

    const floorY = GROUND - player.h / 2;
    player.landed = false;
    if (player.y >= floorY) {
      if (!player.onGround && player.vy > 220) {
        player.landed = true;
        spawnDust(player.x, GROUND, 7);
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
      if (player.dashTime > 0 && boss.vulnerable && player.dashHitLock <= 0 && boss.dashHitCooldown <= 0) {
        damageBoss(runBuild.dashDamage);
        player.dashHitLock = 0.5;
        boss.dashHitCooldown = 0.5;
        player.vx = -player.facing * 520;
        player.vy = -320;
      } else {
        hurtPlayer(1, player.x < boss.x ? -1 : 1);
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
      if (boss && !boss.hidden && !boss.defeated && circleHit(shot.x, shot.y, shot.r, boss.weakX, boss.weakY, boss.weakR)) {
        if (boss.vulnerable) {
          damageBoss(shot.damage || runBuild.shotDamage);
          addFloatingText(shot.x, shot.y - 18, 'CORE HIT', boss.data.accent);
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

  function phaseHealthFloor(phase = boss?.phase ?? 1) {
    if (!boss || phase >= 3) return 0;
    return phase === 1 ? Math.ceil(boss.maxHp * 2 / 3) : Math.ceil(boss.maxHp / 3);
  }

  function beginPhaseTransition(nextPhase) {
    if (!boss || boss.defeated || nextPhase <= boss.phase || boss.state === 'phaseTransition') return false;
    boss.phase = Math.min(3, nextPhase);
    boss.state = 'phaseTransition';
    boss.stateTime = 0;
    boss.events = Object.create(null);
    boss.vulnerable = false;
    boss.hidden = false;
    boss.vx = 0;
    boss.vy = 0;
    boss.attackLabel = 'TRANSFORMATION · PHASE ' + boss.phase;
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
      if (boss.stateTime > (save.settings.reduceMotion ? 0.65 : 1.15)) setBossState(initialStateForBoss());
      return;
    }

    if (boss.state === 'intro') {
      boss.attackLabel = 'ANALYSE DU PILOTE';
      boss.x = 990 + Math.sin(boss.totalTime * 2) * 12;
      boss.y = 330 + Math.sin(boss.totalTime * 2.8) * 9;
      updateWeakPoint();
      if (boss.stateTime > 2.45) {
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
    }[boss.data.id];
  }

  function updateRammer(dt) {
    if (boss.state === 'patrol') {
      boss.attackLabel = 'PHASE ' + boss.phase + ' · SALVE DE RIVETS';
      boss.vulnerable = false;
      boss.x = 970 + Math.sin(boss.totalTime * 1.8) * 95;
      boss.y = 455 + Math.sin(boss.totalTime * 3.2) * 14;
      const rocketTimings = boss.phase === 1 ? [0.45, 1.2] : boss.phase === 2 ? [0.32, 0.88, 1.44] : [0.22, 0.65, 1.08, 1.51];
      rocketTimings.forEach((time, index) => bossEvent('rocket' + index, time, () => spawnRocket(boss.x - 70 + index * 28, boss.y - 35 - index * 5)));
      if (boss.stateTime > 2.2 - boss.phase * 0.12) setBossState('slamTelegraph');
    } else if (boss.state === 'slamTelegraph') {
      boss.attackLabel = 'IMPACT EN APPROCHE';
      const target = clamp(player.x, 520, 1110);
      boss.x = lerp(boss.x, target, 1 - Math.pow(0.002, dt));
      boss.y = lerp(boss.y, 260, 1 - Math.pow(0.002, dt));
      if (boss.stateTime > 0.85) {
        boss.vy = 0;
        setBossState('slam');
      }
    } else if (boss.state === 'slam') {
      boss.attackLabel = 'FERRO-IMPACT';
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
      boss.attackLabel = 'RÉACTEUR OUVERT';
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
      boss.attackLabel = 'PHASE ' + boss.phase + ' · ESCADRILLE IONIQUE';
      boss.x = 890 + Math.cos(boss.totalTime * 1.15) * 165;
      boss.y = 250 + Math.sin(boss.totalTime * 1.8) * 75;
      const fanTimings = boss.phase === 1 ? [0.4, 1.25, 2.1] : boss.phase === 2 ? [0.3, 0.95, 1.6, 2.25] : [0.22, 0.75, 1.28, 1.81, 2.34];
      fanTimings.forEach((time, index) => bossEvent('fan' + index, time, () => spawnFan(boss.x, boss.y + 20, 4 + boss.phase, 220 + boss.phase * 28, 2.05, 3.82, 'orb')));
      if (boss.stateTime > 2.65) setBossState('beam');
    } else if (boss.state === 'beam') {
      boss.attackLabel = 'GRILLE DE FOUDRE';
      boss.x = lerp(boss.x, 970, 1 - Math.pow(0.01, dt));
      boss.y = lerp(boss.y, 230, 1 - Math.pow(0.01, dt));
      bossEvent('beam1', 0.15, () => spawnBeamV(clamp(player.x, 120, 1160), 0.75, 0.55));
      bossEvent('beam2', 0.62, () => spawnBeamV(clamp(player.x + rand(-180, 180), 100, 1180), 0.68, 0.5));
      bossEvent('beam3', 1.02, () => spawnBeamH(GROUND - 92, 0.7, 0.48));
      if (boss.phase >= 2) bossEvent('beam4', 1.35, () => spawnBeamV(210 + boss.phase * 170, 0.62, 0.5));
      if (boss.phase >= 3) bossEvent('beam5', 1.62, () => spawnBeamH(GROUND - 168, 0.58, 0.46));
      if (boss.stateTime > 2.05) setBossState('exposed');
    } else if (boss.state === 'exposed') {
      boss.attackLabel = 'CONDENSATEUR DÉPLOYÉ';
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
      boss.attackLabel = 'PHASE ' + boss.phase + ' · POLARITÉ SOUTERRAINE';
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
      boss.attackLabel = 'ÉRUPTION À MÈCHE';
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
          setBossState('exposed');
        } else {
          setBossState('burrow');
        }
      }
    } else if (boss.state === 'exposed') {
      boss.hidden = false;
      boss.attackLabel = 'FOREUSE EN SURCHAUFFE';
      boss.vulnerable = true;
      boss.x = lerp(boss.x, 920, 1 - Math.pow(0.003, dt));
      boss.y = lerp(boss.y, 500, 1 - Math.pow(0.003, dt));
      bossEvent('debris1', 0.45, () => spawnRock(player.x + rand(-120, 120), -30, rand(-80, 80), 80));
      bossEvent('debris2', 1.1, () => spawnRock(player.x + rand(-180, 180), -30, rand(-80, 80), 70));
      if (boss.phase >= 2) bossEvent('polarityBeam', 1.45, () => spawnBeamV(clamp(player.x, 100, 1180), 0.62, 0.42));
      if (boss.phase >= 3) bossEvent('polarityBurst', 1.9, () => spawnFan(boss.x, boss.y, 8, 190, 0, TAU, 'orb'));
      if (boss.stateTime > 2.75) {
        boss.cycle++;
        setBossState('burrow');
      }
    }
  }

  function updateMantis(dt) {
    if (boss.state === 'dashTelegraph') {
      boss.attackLabel = 'PHASE ' + boss.phase + ' · TRAJECTOIRE CHRONO';
      boss.x = boss.direction < 0 ? 1100 : 180;
      boss.y = 430 - boss.subCount * 70;
      if (boss.stateTime > 0.74 - boss.phase * 0.1) {
        boss.vx = boss.direction * (1120 + boss.phase * 180);
        setBossState('dash');
      }
    } else if (boss.state === 'dash') {
      boss.attackLabel = 'LAME SUPERSONIQUE';
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
          setBossState('overheat');
        } else {
          setBossState('dashTelegraph');
        }
      }
    } else if (boss.state === 'overheat') {
      boss.attackLabel = 'SERVOMOTEURS EXPOSÉS';
      boss.vulnerable = true;
      boss.x = lerp(boss.x, 930, 1 - Math.pow(0.003, dt));
      boss.y = lerp(boss.y, 440, 1 - Math.pow(0.003, dt));
      bossEvent('blade', 0.9, () => spawnFan(boss.x, boss.y, 2 + boss.phase, 180 + boss.phase * 18, 2.45, 3.82, 'blade'));
      if (boss.phase >= 3) bossEvent('timeLine', 1.45, () => spawnBeamH(GROUND - 142, 0.72, 0.5));
      if (boss.stateTime > 2.65) {
        boss.cycle++;
        setBossState('dashTelegraph');
      }
    }
  }

  function updateCyclotron(dt) {
    if (boss.state === 'roll') {
      boss.attackLabel = 'PHASE ' + boss.phase + ' · PISTONS EN MARCHE';
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
      boss.attackLabel = 'PLUIE DE CONFETTIS EXPLOSIFS';
      boss.x = lerp(boss.x, 900, 1 - Math.pow(0.01, dt));
      boss.y = lerp(boss.y, 270, 1 - Math.pow(0.01, dt));
      for (let i = 0; i < 4 + boss.phase * 2; i++) {
        bossEvent(`bomb${i}`, 0.2 + i * 0.32, () => spawnBomb(120 + ((i * 173 + boss.cycle * 91) % 1020), -30));
      }
      if (boss.phase >= 2) bossEvent('piston', 1.5, () => spawnBeamV(clamp(player.x + 180, 100, 1180), 0.65, 0.5));
      if (boss.stateTime > 2.5) setBossState('crashTelegraph');
    } else if (boss.state === 'crashTelegraph') {
      boss.attackLabel = 'FREINAGE THÉORIQUE';
      boss.x = lerp(boss.x, clamp(player.x, 300, 1080), 1 - Math.pow(0.006, dt));
      boss.y = lerp(boss.y, 230, 1 - Math.pow(0.006, dt));
      if (boss.stateTime > 0.82) {
        boss.vy = 0;
        setBossState('crash');
      }
    } else if (boss.state === 'crash') {
      boss.attackLabel = 'ATTRACTION FINALE';
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
      boss.attackLabel = 'CABINE DÉVERROUILLÉE';
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
      boss.attackLabel = `PHASE ${boss.phase} · ARSENAL ROYAL`;
      boss.x = 900 + Math.sin(boss.totalTime * 1.25 * speedBonus) * 150;
      boss.y = 245 + Math.cos(boss.totalTime * 1.9) * 55;
      const timings = boss.phase === 1 ? [0.35, 1.1, 1.85] : boss.phase === 2 ? [0.25, 0.85, 1.45, 2.05] : [0.2, 0.65, 1.1, 1.55, 2.0];
      timings.forEach((t, i) => bossEvent(`arsenal${i}`, t, () => {
        if (i % 2 === 0) spawnRocket(boss.x + rand(-45,45), boss.y - 25);
        else spawnFan(boss.x, boss.y + 20, 5 + boss.phase, 230 + boss.phase * 15, 2.15, 3.8, 'orb');
      }));
      if (boss.stateTime > 2.55) setBossState('laserGrid');
    } else if (boss.state === 'laserGrid') {
      boss.attackLabel = `PHASE ${boss.phase} · ÉCHIQUIER LASER`;
      boss.x = lerp(boss.x, 960, 1 - Math.pow(0.008, dt));
      boss.y = lerp(boss.y, 220, 1 - Math.pow(0.008, dt));
      const columns = boss.phase + 1;
      for (let i = 0; i < columns; i++) {
        bossEvent(`gridv${i}`, 0.12 + i * 0.34, () => spawnBeamV(clamp(player.x + (i - columns / 2) * 170, 90, 1190), 0.62, 0.46));
      }
      bossEvent('gridh', 0.7, () => spawnBeamH(GROUND - (boss.phase === 3 ? 138 : 92), 0.68, 0.46));
      if (boss.stateTime > 1.55 + columns * 0.2) setBossState('coreOpen');
    } else if (boss.state === 'coreOpen') {
      boss.attackLabel = `PHASE ${boss.phase} · NOYAU OMÉGA OUVERT`;
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
    const id = boss.data.id;
    if (id === 'rammer') {
      boss.weakX = boss.x + 20;
      boss.weakY = boss.y - 42;
      boss.weakR = 30;
    } else if (id === 'kraken') {
      boss.weakX = boss.x;
      boss.weakY = boss.y + 5;
      boss.weakR = 34;
    } else if (id === 'drill') {
      boss.weakX = boss.x;
      boss.weakY = boss.y - 56;
      boss.weakR = 31;
    } else if (id === 'mantis') {
      boss.weakX = boss.x;
      boss.weakY = boss.y - 5;
      boss.weakR = 31;
    } else if (id === 'cyclotron') {
      boss.weakX = boss.x;
      boss.weakY = boss.y - 12;
      boss.weakR = 34;
    } else {
      boss.weakX = boss.x;
      boss.weakY = boss.y + 8;
      boss.weakR = 39;
    }
  }

  function damageBoss(amount) {
    if (!boss || boss.defeated || boss.state === 'phaseTransition') return 0;
    const overloadMultiplier = player?.overloadTime > 0 ? 1.65 : 1;
    const requested = Math.max(1, Math.round(amount * overloadMultiplier));
    const previousHp = boss.hp;
    const floor = phaseHealthFloor();
    boss.hp = Math.max(floor, boss.hp - requested);
    const actualDamage = previousHp - boss.hp;
    if (actualDamage <= 0) return 0;
    combo = comboTimer > 0 ? combo + 1 : 1;
    comboTimer = 2.15;
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
    if (boss.hp <= 0) defeatBoss();
    else if (boss.hp <= floor && boss.phase < 3) beginPhaseTransition(boss.phase + 1);
    return actualDamage;
  }

  function defeatBoss() {
    pauseFightClock();
    boss.defeated = true;
    boss.vulnerable = false;
    boss.attackLabel = 'DÉSINTÉGRATION';
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

  function hurtPlayer(amount, direction = -1) {
    if (!player || player.invuln > 0 || state !== 'fight') return;
    player.hp -= amount;
    combo = 0;
    comboTimer = 0;
    player.invuln = 1.05;
    player.vx = direction * 420;
    player.vy = -420;
    damageTaken += amount;
    flash = 0.08;
    shake(10);
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
    }
  }

  function updateEnemyShots(dt) {
    const speedFactor = difficulty().enemySpeed;
    for (let i = enemyShots.length - 1; i >= 0; i--) {
      const s = enemyShots[i];
      s.age += dt;
      s.life -= dt;

      if (s.type === 'orb') {
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
      } else if (s.type === 'beamV' || s.type === 'beamH') {
        // Position fixe : la collision n’est active qu’après le télégraphe.
      } else if (s.type === 'warningCircle') {
        // Visuel uniquement.
      }

      if (s.damage > 0 && shotHitsPlayer(s)) {
        hurtPlayer(s.damage, player.x < (s.x || W / 2) ? -1 : 1);
        if (!['beamV', 'beamH'].includes(s.type)) s.life = 0;
      }

      if (s.life <= 0 || s.x < -220 || s.x > W + 220 || s.y > H + 180) enemyShots.splice(i, 1);
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
    if (s.type === 'warningCircle') return false;
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
      lastBossRetryPenalty = runMode === 'rush' ? currentBossRetries * RUSH_RETRY_PENALTY : 0;
      const rankedBossTime = lastBossTime + lastBossRetryPenalty;
      save.bestTimes[boss.data.id] = Math.min(save.bestTimes[boss.data.id] ?? Infinity, rankedBossTime);
      save.unlocked = Math.max(save.unlocked, Math.min(BOSSES.length, currentBossIndex + 2));
      persistSave();
      buildBossGrid();
      showResult();
    }
  }

  function calculateRank(time, hits, retries) {
    const par = BOSS_PAR_TIMES[currentBossIndex] * difficulty().parMultiplier;
    const performanceRatio = time / par;
    const rating = 108 - performanceRatio * 48 - hits * 9 - retries * 17 + (difficulty().scoreMultiplier - 1) * 12;
    if (rating >= 76 && hits === 0 && retries === 0) return 'S';
    if (rating >= 60) return 'A';
    if (rating >= 42) return 'B';
    return 'C';
  }

  function describeBuild() {
    if (!runBuild.installed.length) return 'Configuration d’origine';
    const counts = new Map();
    for (const id of runBuild.installed) counts.set(id, (counts.get(id) || 0) + 1);
    return [...counts].map(([id, count]) => {
      const upgrade = UPGRADES.find(entry => entry.id === id);
      return (upgrade?.name || id) + (count > 1 ? ' ×' + count : '');
    }).join(' · ');
  }

  function showResult() {
    state = 'result';
    touchControls.classList.remove('in-game');
    const finalBoss = currentBossIndex === BOSSES.length - 1;
    const rushComplete = runMode === 'rush' && finalBoss;
    const rankedTime = lastBossTime + lastBossRetryPenalty;
    const medal = calculateRank(rankedTime, damageTaken, currentBossRetries);
    document.getElementById('result-eyebrow').textContent = rushComplete ? 'RUSH INTÉGRAL TERMINÉ' : 'MACHINE NEUTRALISÉE';
    document.getElementById('result-title').textContent = rushComplete ? 'Crown Engine Ω est tombé' : BOSSES[currentBossIndex].name;
    document.getElementById('result-summary').textContent = BOSSES[currentBossIndex].transmission;

    const total = runMode === 'rush' ? rushElapsedBeforeBoss + lastBossTime + rushRetryPenalty : lastBossTime;
    if (rushComplete) {
      save.completed = true;
      if (save.bestRush === null || total < save.bestRush) save.bestRush = total;
      persistSave();
    }
    const timeLabel = lastBossRetryPenalty > 0 ? formatTime(rankedTime) + ' (+' + lastBossRetryPenalty + ' s)' : formatTime(rankedTime);
    document.getElementById('result-stats').innerHTML = '<div><strong>' + timeLabel + '</strong><small>Temps classé</small></div>' + '<div><strong>' + score.toLocaleString('fr-FR') + '</strong><small>Score · combo max ×' + maxCombo + '</small></div>' + '<div><strong>' + medal + '</strong><small>Rang · ' + difficulty().name + '</small></div>';
    announce(boss.data.name + ' neutralisé. Rang ' + medal + '. Temps ' + formatTime(rankedTime) + '.');

    const continueButton = document.getElementById('continue-button');
    if (runMode === 'rush' && !finalBoss) continueButton.textContent = 'Installer une amélioration';
    else if (runMode === 'practice') continueButton.textContent = 'Retour au Laboratoire';
    else continueButton.textContent = 'Voir l’épilogue';
    continueButton.hidden = false;
    showScreen('result-screen');
  }

  function continueAfterResult() {
    const finalBoss = currentBossIndex === BOSSES.length - 1;
    if (runMode === 'rush' && !finalBoss) {
      rushElapsedBeforeBoss += lastBossTime;
      showUpgradeSelection();
    } else if (runMode === 'practice') {
      state = 'menu';
      player = null;
      boss = null;
      buildBossGrid();
      showScreen('boss-select-screen');
    } else {
      showEnding();
    }
  }

  function showUpgradeSelection() {
    state = 'upgrade';
    player = null;
    boss = null;
    resetWorld();
    const grid = document.getElementById('upgrade-grid');
    grid.textContent = '';
    const eligible = UPGRADES.filter(upgrade => runBuild.installed.filter(id => id === upgrade.id).length < upgrade.maxStacks);
    const pool = eligible.length >= 3 ? [...eligible] : [...UPGRADES];
    for (let i = pool.length - 1; i > 0; i--) {
      const random = globalThis.crypto?.getRandomValues
        ? globalThis.crypto.getRandomValues(new Uint32Array(1))[0] / 4294967296
        : Math.random();
      const index = Math.floor(random * (i + 1));
      [pool[i], pool[index]] = [pool[index], pool[i]];
    }
    const choices = pool.slice(0, 3);
    if (lastUpgradeOffer.length === choices.length && choices.every(choice => lastUpgradeOffer.includes(choice.id)) && pool.length > 3) {
      choices[2] = pool[3];
    }
    lastUpgradeOffer = choices.map(choice => choice.id);
    const summary = document.querySelector('#upgrade-screen .result-summary');
    if (summary) summary.textContent = 'Build actuel : ' + describeBuild() + '. Choisis un module pour la prochaine machine.';
    for (const upgrade of choices) {
      const button = document.createElement('button');
      button.className = 'upgrade-card';
      const stacks = runBuild.installed.filter(id => id === upgrade.id).length;
      button.innerHTML = '<span><span class="upgrade-icon">' + upgrade.icon + '</span><strong>' + upgrade.name + '</strong><small>' + upgrade.description + '</small></span><em>' + (stacks ? 'NIVEAU ' + (stacks + 1) : 'INSTALLER') + '</em>';
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
    showToast(upgrade.name + ' installé');
    startFight(currentBossIndex + 1);
  }

  function showEnding() {
    state = 'ending';
    touchControls.classList.remove('in-game');
    const total = rushElapsedBeforeBoss + lastBossTime + rushRetryPenalty;
    document.getElementById('ending-summary').textContent = 'Temps du Circuit : ' + formatTime(total) + ' · Score final : ' + score.toLocaleString('fr-FR') + ' · Retries : ' + runRetryCount + ' · Build : ' + describeBuild() + '.';
    announce('Circuit libéré en ' + formatTime(total) + '. Score final ' + score + '.');
    player = null;
    boss = null;
    resetWorld();
    showScreen('ending-screen');
  }

  function openLaboratory() {
    state = 'menu';
    buildBossGrid();
    showScreen('boss-select-screen');
  }

  function returnToMenu() {
    pauseFightClock();
    state = 'menu';
    boss = null;
    player = null;
    resetWorld();
    touchControls.classList.remove('in-game');
    bossIntro.classList.remove('visible');
    bossIntro.setAttribute('aria-hidden', 'true');
    const bestRushText = save.bestRush ? 'Meilleur Circuit : ' + formatTime(save.bestRush) : 'Progression locale activée';
    document.getElementById('save-note').textContent = bestRushText;
    showScreen('title-screen');
  }

  function pauseGame() {
    if (state !== 'fight' || boss?.defeated) return;
    pauseFightClock();
    state = 'paused';
    touchControls.classList.remove('in-game');
    showScreen('pause-screen');
    announce('Jeu en pause.');
  }

  function resumeGame() {
    if (state !== 'paused') return;
    state = 'fight';
    if (boss?.state !== 'intro') startFightClock();
    closeScreens();
    touchControls.classList.add('in-game');
    lastTime = performance.now();
    announce('Combat repris.');
  }

  function update(dt) {
    if (toastTimer > 0) {
      toastTimer -= dt;
      if (toastTimer <= 0) toast.classList.remove('visible');
    }
    if (introTimer > 0) {
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
    const blink = player.invuln > 0 && Math.floor(player.invuln * 16) % 2 === 0;
    if (blink) return;
    ctx.save();
    ctx.translate(player.x, player.y);
    if (player.overloadTime > 0) {
      ctx.strokeStyle = 'rgba(255,243,154,0.75)';
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.arc(0, 0, 48 + Math.sin(player.anim * 2) * 4, 0, TAU);
      ctx.stroke();
    }
    ctx.scale(player.facing, 1);
    const bob = player.onGround ? Math.sin(player.anim) * Math.min(3, Math.abs(player.vx) / 90) : 0;
    ctx.translate(0, bob);

    if (player.dashTime > 0) {
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

    if (boss.vulnerable && !boss.defeated) {
      ctx.save();
      ctx.strokeStyle = boss.data.accent;
      ctx.lineWidth = 3;
      ctx.globalAlpha = 0.55 + Math.sin(performance.now() / 80) * 0.2;
      ctx.beginPath();
      ctx.arc(boss.weakX, boss.weakY, boss.weakR + 12 + Math.sin(performance.now() / 100) * 4, 0, TAU);
      ctx.stroke();
      ctx.restore();
    }
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
      if (s.type === 'orb') {
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
    if (boss.state === 'slamTelegraph' || boss.state === 'crashTelegraph') {
      ctx.save();
      ctx.strokeStyle = 'rgba(255,187,70,0.7)';
      ctx.lineWidth = 5;
      ctx.setLineDash([16,12]);
      ctx.beginPath(); ctx.moveTo(boss.x, boss.y+70); ctx.lineTo(boss.x, GROUND); ctx.stroke();
      ctx.fillStyle='rgba(255,187,70,0.16)';ctx.fillRect(boss.x-80,GROUND-20,160,20);
      ctx.restore();
    }
    if (boss.state === 'dashTelegraph') {
      ctx.save();ctx.strokeStyle='rgba(255,85,125,0.66)';ctx.lineWidth=8;ctx.setLineDash([22,14]);ctx.beginPath();ctx.moveTo(0,boss.y);ctx.lineTo(W,boss.y);ctx.stroke();ctx.restore();
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
    ctx.save();
    // Player core
    panelRect(24,72,330,122);
    ctx.fillStyle='#fff';ctx.font='900 17px system-ui';ctx.fillText('RIVA // NOYAU CINÉTIQUE',44,103);
    for(let i=0;i<player.maxHp;i++){
      const x=45+i*34;ctx.fillStyle=i<player.hp?'#73efff':'#252b3e';ctx.strokeStyle=i<player.hp?'#c5fbff':'#4a5268';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(x,121);ctx.lineTo(x+11,114);ctx.lineTo(x+23,121);ctx.lineTo(x+20,143);ctx.lineTo(x+3,143);ctx.closePath();ctx.fill();ctx.stroke();
    }
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

  function overlapsPlayerBoss(){
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
    if(['ArrowLeft','ArrowRight','ArrowUp','Space'].includes(event.code))event.preventDefault();
    if(!keys[event.code])pressed.add(event.code);keys[event.code]=true;
    if(event.code==='Escape'||event.code==='KeyP'){
      if(state==='fight')pauseGame();else if(state==='paused')resumeGame();
    }
  });
  window.addEventListener('keyup',event=>{keys[event.code]=false;});
  window.addEventListener('blur',()=>{pointer.attack=false;if(state==='fight')pauseGame();});
  canvas.addEventListener('pointerdown',event=>{if(event.button===0){event.preventDefault();unlockAudio();pointer.attack=true;}});
  window.addEventListener('pointerup',event=>{if(event.button===0)pointer.attack=false;});
  canvas.addEventListener('contextmenu',event=>event.preventDefault());

  document.querySelectorAll('[data-touch]').forEach(button=>{
    const name=button.dataset.touch;
    const down=e=>{e.preventDefault();unlockAudio();if(!touch[name])touchPressed.add(name);touch[name]=true;};
    const up=e=>{e.preventDefault();touch[name]=false;};
    button.addEventListener('pointerdown',down);button.addEventListener('pointerup',up);button.addEventListener('pointercancel',up);button.addEventListener('pointerleave',up);
  });

  document.getElementById('start-rush').addEventListener('click',()=>showScreen('prologue-screen'));
  document.getElementById('prologue-start')?.addEventListener('click',()=>startRun('rush',0));
  document.getElementById('practice').addEventListener('click',()=>{buildBossGrid();showScreen('boss-select-screen');});
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

  document.getElementById('difficulty-select').addEventListener('change',event=>{save.settings.difficulty=event.target.value;persistSave();showToast(`Difficulté : ${difficulty().name}`);});
  document.getElementById('audio-toggle').addEventListener('change',event=>{save.settings.audio=event.target.checked;persistSave();if(save.settings.audio){unlockAudio();sfx('hit');}});
  document.getElementById('shake-toggle').addEventListener('change',event=>{save.settings.shake=event.target.checked;persistSave();});
  document.getElementById('motion-toggle').addEventListener('change',event=>{save.settings.reduceMotion=event.target.checked;applySettings();persistSave();});
  document.getElementById('contrast-toggle').addEventListener('change',event=>{save.settings.highContrast=event.target.checked;applySettings();persistSave();});
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
  document.getElementById('reset-save').addEventListener('click',()=>{
    if(!confirm('Réinitialiser les boss débloqués et tous les meilleurs temps ?'))return;
    const settings={...save.settings};save=structuredClone(DEFAULT_SAVE);save.settings=settings;persistSave();applySettings();buildBossGrid();showToast('Progression réinitialisée');
  });

  const qaAllowed = new URLSearchParams(location.search).get('qa') === '1' && ['127.0.0.1', 'localhost'].includes(location.hostname);
  if (qaAllowed) Object.defineProperty(window, '__GEARSTORM_QA__', {
    value: Object.freeze({
      getState: () => ({ state, runMode, bossIndex: currentBossIndex, boss: boss?.data.name ?? null, phase: boss?.phase ?? null, hp: boss?.hp ?? null, maxHp: boss?.maxHp ?? null, overload: player?.overload ?? null, installed: [...runBuild.installed], activeScreen: document.querySelector('.screen.active')?.id ?? null, art: getGeneratedArtState() }),
      get art() { return getGeneratedArtState(); },
      get ready() { return artRuntime.ready; },
      get loaded() { return [...artRuntime.images.keys()]; },
      get failed() { return [...artRuntime.failed]; },
      get currentAssets() { return [...artRuntime.currentAssets]; },
      getArtState: () => getGeneratedArtState(),
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
        boss.state = 'coreOpen';
        boss.vulnerable = true;
        boss.hp = 1;
        damageBoss(1);
        transitionTimer = 0.01;
        return true;
      }
    })
  });

  if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol)) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./sw.js').catch(() => {
        console.warn('Service worker GEARSTORM indisponible.');
      });
    }, { once: true });
  }

  applySettings();
  artRuntime.initialPromise = initializeGeneratedArt();
  buildBossGrid();
  const bestRushText=save.bestRush?`Meilleur Circuit : ${formatTime(save.bestRush)}`:'Progression locale activée';
  document.getElementById('save-note').textContent=bestRushText;
  requestAnimationFrame(frame);
})();
