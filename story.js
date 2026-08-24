(function installGearstormStory(root) {
  'use strict';

  const bossOrder = Object.freeze(['rammer', 'kraken', 'drill', 'mantis', 'cyclotron', 'omega']);

  const line = (speaker, text, channel = 'dialogue') => ({ speaker, text, channel });
  const contract = (id, title, objective, metric, target) => ({ id, title, objective, metric, target });

  const intro = {
    id: 'intro-permanent-broadcast',
    chapter: 'INTRODUCTION',
    title: 'L’Émission permanente',
    summary: "Cassian Voltério détourne les six infrastructures du Circuit et transforme leurs commandes civiles en spectacle coercitif.",
    lines: [
      line('Cassian', "Habitants du Circuit, vos voies, vos communications et votre énergie suivent désormais une seule volonté : la mienne. Tout spectacle a besoin d’un cadre ; celui-ci n’aura qu’un auteur.", 'broadcast'),
      line('Système', 'Six districts verrouillés. Six actes déclarés. Canaux civils coupés ; aucun écart au script de la Couronne.', 'system'),
      line('Riva', "Il a verrouillé le réseau principal. Pas les conduites que personne ne regarde… ni l’option « recommencer » qu’il a laissée au menu.", 'maintenance')
    ]
  };

  const prologue = {
    id: 'prologue-ghost-line',
    chapter: 'PROLOGUE 00',
    title: 'La ligne fantôme',
    kicker: 'TRANSMISSION PRIORITAIRE // LIGNE M-0',
    status: 'ITINÉRAIRE MANUEL ACTIF',
    location: 'Ligne de maintenance M-0',
    objective: 'Réactiver les six relais de sécurité et reprendre la Couronne.',
    method: 'Lire · Esquiver · Exposer · Surcharger',
    continueLabel: 'Entrer dans le Circuit →',
    summary: "Ancienne technicienne du réseau, Riva peut encore emprunter la ligne de maintenance M-0. Chaque relais restauré ouvre physiquement la voie vers le district suivant.",
    lines: [
      line('Riva', "J’ai entretenu ces machines pour qu’elles servent la ville. Cette fois, je vois aussi les ficelles du niveau.", 'maintenance'),
      line('Système', 'Six actes chargés, six districts affichés, aucun boss autorisé à attendre hors écran.', 'system'),
      line('Cassian', "Une ligne oubliée ne conduit nulle part, technicienne. Mais un prologue doit bien livrer quelqu’un au premier boss.", 'broadcast')
    ]
  };

  const acts = [
    {
      id: 'act-01-open-the-way',
      order: 1,
      bossId: 'rammer',
      bossName: 'Rivet Rex',
      district: 'Rocade des Rivets',
      civicFunction: 'Transport lourd, dépannage et dégagement des voies',
      narrativeBeat: 'intrusion',
      phaseTitles: ['Salve de rivets', 'Mines sismiques', 'Ferro-impact Overdrive'],
      preFight: [
        line('Cassian', "Une technicienne sur ma rocade ? Rivet Rex : trois phases, deux marteaux, une barre de vie et absolument aucun frein.", 'broadcast'),
        line('Riva', "Maintenance M-0. Arrêt d’urgence demandé. Puisque tu refuses, je vais ouvrir le noyau moi-même ; le HUD pourra appeler ça une victoire.", 'maintenance')
      ],
      phaseTransitions: [
        { toPhase: 2, title: 'Verrou renforcé', lines: [line('Cassian', "Très bien. Ajoutons des mines à ton trajet de service.", 'broadcast'), line('Riva', "Des mines en phase deux. Ton arène suit vraiment son menu de fabrication.", 'maintenance')] },
        { toPhase: 3, title: 'Rocade en surcharge', lines: [line('Cassian', "Overdrive total. La route se referme ici.", 'broadcast'), line('Riva', "Overdrive, noyau bientôt ouvert : merci d’annoncer le pattern avant de le jouer.", 'maintenance')] }
      ],
      rivaJournal: "La Rocade répond encore aux anciens codes. Les convois repartent et Voltério connaît maintenant mon nom. Je ne suis plus une panne dans son émission : je suis son arrêt d’urgence, et même l’écran de résultat a dû changer mon statut.",
      districtConsequence: 'Le premier verrou cède et les axes de transport recommencent à évacuer les habitants.',
      interlude: [
        line('Canal civil', "Convoi douze en mouvement. Nous voyons de nouveau les balises de sortie.", 'civil'),
        line('Cassian', "Identifiant M-0… Riva Spark. La technicienne qui écrivait mes sécurités.", 'broadcast'),
        line('Riva', "Celles du Circuit. Elles ne t’ont jamais appartenu ; le compteur de districts le sait maintenant.", 'maintenance')
      ],
      restoration: 'La Rocade redevient une voie publique de transport et de secours.',
      codex: {
        title: 'Rivet Rex — Bélier de la Rocade',
        origin: 'Tracteur de dépannage conçu pour dégager les convois immobilisés.',
        hijack: 'Voltério a remplacé ses bras de remorquage par deux marteaux et verrouillé ses protocoles de priorité civile.',
        reading: 'Lire les salves, quitter la zone d’impact et frapper pendant l’ouverture qui suit le ferro-impact.',
        impact: 'Sa neutralisation restaure les transports et révèle à Cassian la présence de Riva.'
      },
      masteryContracts: [
        contract('rammer-par', 'Voie express', 'Neutraliser Rivet Rex en 44 secondes ou moins en difficulté Ingénieur ou Overdrive.', 'timeSeconds', 44),
        contract('rammer-no-hit', 'Carrosserie intacte', 'Neutraliser Rivet Rex sans subir de dégâts.', 'damageTaken', 0),
        contract('rammer-dash-finish', 'Arrêt d’urgence', 'Porter le coup final avec une ruée dans le noyau ouvert.', 'dashFinish', 1)
      ]
    },
    {
      id: 'act-02-return-the-voice',
      order: 2,
      bossId: 'kraken',
      bossName: 'Sky Slicer',
      district: 'Couloir des Hautes-Tensions',
      civicFunction: 'Inspection aérienne, distribution électrique et relais de communications',
      narrativeBeat: 'recognition',
      phaseTitles: ['Salves ioniques', 'Grille de foudre', 'Condensateur déployé'],
      preFight: [
        line('Cassian', "Le ciel est mon studio, Spark. Les lignes au sol annoncent chaque éclair ; même un boss aérien doit respecter son télégraphe.", 'broadcast'),
        line('Riva', "Alors je vais rendre le micro aux districts.", 'maintenance')
      ],
      phaseTransitions: [
        { toPhase: 2, title: 'Orage de contrôle', lines: [line('Cassian', "Les lignes se croisent. Choisis donc la mauvaise sortie.", 'broadcast'), line('Riva', "Tes grilles dessinent la zone sûre avant l’impact. Même ton spectacle a une règle d’équité.", 'maintenance')] },
        { toPhase: 3, title: 'Condensateur critique', lines: [line('Cassian', "Toute la charge du nord dans une seule machine.", 'broadcast'), line('Riva', "Toute la charge du nord, un condensateur exposé et une barre de vie : je vois la phase trois.", 'maintenance')] }
      ],
      rivaJournal: "Le nord répond. Derrière le brouillage, des milliers de voix attendaient seulement une brèche. Cassian enregistre chacun de mes mouvements ; son journal appelle ça un pattern, moi une surveillance.",
      districtConsequence: 'Le brouillage tombe et les communications civiles relient de nouveau les districts du nord.',
      interlude: [
        line('Canal civil', "Riva, les rails de la Fosse sont encore bloqués. Nous pouvons enfin vous transmettre leurs coordonnées.", 'civil'),
        line('Cassian', "Continue à bouger. La Couronne apprécie particulièrement tes corrections de trajectoire.", 'broadcast'),
        line('Riva', "Tu ne diffuses plus seulement le combat. Tu collectes mes solutions, et le HUD ne devrait pas avoir à l’avouer à ta place.", 'maintenance')
      ],
      restoration: 'Le Couloir rétablit le courant de secours et rend les canaux de communication aux habitants.',
      codex: {
        title: 'Sky Slicer — Intercepteur du Couloir',
        origin: 'Appareil d’inspection destiné aux lignes électriques et aux relais atmosphériques.',
        hijack: 'Voltério en a fait un brouilleur armé de salves ioniques et de grilles de foudre.',
        reading: 'Choisir sa hauteur avant la fermeture des grilles, puis viser le condensateur déployé.',
        impact: 'Sa chute rend aux districts du nord leur alimentation de secours et leur voix.'
      },
      masteryContracts: [
        contract('kraken-par', 'Éclaircie', 'Neutraliser Sky Slicer en 52 secondes ou moins en difficulté Ingénieur ou Overdrive.', 'timeSeconds', 52),
        contract('kraken-no-hit', 'Isolé de la foudre', 'Neutraliser Sky Slicer sans subir de dégâts.', 'damageTaken', 0),
        contract('kraken-overload', 'Retour de signal', 'Activer une surcharge pendant une ouverture de condensateur.', 'overloadDuringOpening', 1)
      ]
    },
    {
      id: 'act-03-leave-the-arena',
      order: 3,
      bossId: 'drill',
      bossName: 'Magnetron',
      district: 'Fosse Ferromagnétique',
      civicFunction: 'Tri du fret, traction ferroviaire et voies d’évacuation',
      narrativeBeat: 'suspicion',
      phaseTitles: ['Polarité souterraine', 'Éruption magnétique', 'Foreuse en surchauffe'],
      preFight: [
        line('Cassian', "Attraction, répulsion, obéissance : la Fosse ramène toujours son public à sa place. Trois phases devraient suffire à te le faire comprendre.", 'broadcast'),
        line('Riva', "Pas cette fois. Les trains partiront avec tous ceux que tu retenais.", 'maintenance')
      ],
      phaseTransitions: [
        { toPhase: 2, title: 'Polarité inversée', lines: [line('Cassian', "Le sol lui-même te réclame.", 'broadcast'), line('Riva', "Tu inverses la polarité, pas mes commandes en secret. L’interface t’oblige encore à prévenir.", 'maintenance')] },
        { toPhase: 3, title: 'Champ instable', lines: [line('Cassian', "La Fosse va broyer jusqu’à ta dernière trajectoire.", 'broadcast'), line('Riva', "Éruption, débris, ouverture : ton pattern final tient en trois verbes.", 'maintenance')] }
      ],
      rivaJournal: "Les trains quittent les gradins. Dans le contrôleur de Magnetron, j’ai trouvé un dossier à mon nom : CROWN / ADAPTATION PILOTE / R. SPARK. Le fichier me nomme « joueuse » ; je reste technicienne.",
      districtConsequence: 'Les attaches magnétiques se relâchent et les voies d’évacuation reprennent leur service.',
      interlude: [
        line('Canal civil', "Premier train sorti de la Fosse. Les quais se vident enfin.", 'civil'),
        line('Cassian', "Tu appelles cela une fuite. Moi, j’appelle cela un échantillon propre.", 'broadcast'),
        line('Riva', "Tu ne m’as pas laissée passer. Tu m’as mesurée jusque dans le compteur de retries.", 'maintenance')
      ],
      restoration: 'La Fosse reprend le tri civil et reconnecte les lignes d’évacuation aux quartiers libres.',
      codex: {
        title: 'Magnetron — Gardien de la Fosse',
        origin: 'Machine de traction conçue pour déplacer les convois dans les zones ferromagnétiques.',
        hijack: 'Cassian a inversé ses polarités de sécurité et transformé ses outils de forage en armes d’éruption.',
        reading: 'Quitter le cercle annoncé, compenser l’inversion de polarité et exploiter la surchauffe de la foreuse.',
        impact: 'Sa neutralisation libère les trains et révèle le programme adaptatif de la Couronne.'
      },
      masteryContracts: [
        contract('drill-par', 'Correspondance directe', 'Neutraliser Magnetron en 58 secondes ou moins en difficulté Ingénieur ou Overdrive.', 'timeSeconds', 58),
        contract('drill-no-hit', 'Point neutre', 'Neutraliser Magnetron sans subir de dégâts.', 'damageTaken', 0),
        contract('drill-eruptions', 'Lecture du sous-sol', 'Terminer un cycle complet de phase 3 sans subir l’éruption, ses débris ni son onde de choc.', 'perfectEruptionCycle', 1)
      ]
    },
    {
      id: 'act-04-true-time',
      order: 4,
      bossId: 'mantis',
      bossName: 'Chrono Mantis',
      district: 'Horloge de la Faille',
      civicFunction: 'Synchronisation du réseau, horodatage et archives publiques',
      narrativeBeat: 'revelation',
      phaseTitles: ['Trajectoire chrono', 'Lames déphasées', 'Ligne de temps'],
      preFight: [
        line('Cassian', "Une révolte sans heure n’a jamais existé. Chrono Mantis va corriger l’archive — et ton meilleur temps.", 'broadcast'),
        line('Riva', "Une archive n’a pas à te flatter. Elle doit se souvenir.", 'maintenance')
      ],
      phaseTransitions: [
        { toPhase: 2, title: 'Archive déphasée', lines: [line('Cassian', "Je peux effacer l’instant où tu croyais gagner.", 'broadcast'), line('Riva', "Efface l’instant si tu veux. Le checkpoint, lui, reste dans une autre couche.", 'maintenance')] },
        { toPhase: 3, title: 'Minute zéro', lines: [line('Cassian', "Ton ancien protocole stabilise enfin ma Couronne.", 'broadcast'), line('Riva', "Minute zéro, phase trois, grand discours : même ton temps suit le script.", 'maintenance')] }
      ],
      rivaJournal: "Les horodatages restaurés prouvent que le verrouillage était planifié. Cassian a retourné mon protocole M-0 contre le Circuit, puis m’a guidée à travers ces machines. Le checkpoint conserve précisément la version qu’il voudrait effacer.",
      districtConsequence: 'Les horloges civiles et les archives authentiques redémarrent sur tous les canaux restaurés.',
      interlude: [
        line('Canal civil', "Archives répliquées. Il ne pourra plus effacer l’heure de la prise de contrôle.", 'civil'),
        line('Cassian', "Chaque victoire t’a rapprochée de moi et a perfectionné la machine qui t’attend.", 'broadcast'),
        line('Riva', "Alors la prochaine leçon sera fausse. Ton script l’apprendra une phase trop tard.", 'maintenance')
      ],
      restoration: 'L’Horloge publie des archives distribuées que la Citadelle ne peut plus réécrire.',
      codex: {
        title: 'Chrono Mantis — Correcteur de la Faille',
        origin: 'Automate de synchronisation chargé d’aligner les horloges, journaux et dispositifs de sécurité.',
        hijack: 'Cassian l’a équipé de lames et de trajectoires déphasées pour supprimer les événements gênants de ses archives.',
        reading: 'Lire la trajectoire annoncée, changer de hauteur entre les passages et traverser la ligne de temps au bon rythme.',
        impact: 'Sa chute restaure la chronologie véritable et dévoile l’origine du programme Couronne.'
      },
      masteryContracts: [
        contract('mantis-par', 'Temps retrouvé', 'Neutraliser Chrono Mantis en 54 secondes ou moins en difficulté Ingénieur ou Overdrive.', 'timeSeconds', 54),
        contract('mantis-no-hit', 'Seconde intacte', 'Neutraliser Chrono Mantis sans subir de dégâts.', 'damageTaken', 0),
        contract('mantis-dashes', 'Hors trajectoire', 'Terminer un cycle complet de phase 3 sans être touchée par une ruée de Chrono Mantis.', 'perfectDashCycle', 1)
      ]
    },
    {
      id: 'act-05-cut-the-source',
      order: 5,
      bossId: 'cyclotron',
      bossName: 'Foundry Titan',
      district: 'Fournaise des Pistons',
      civicFunction: 'Fabrication, réparation lourde et alimentation industrielle',
      narrativeBeat: 'counterplan',
      phaseTitles: ['Pistons en marche', 'Pluie de métal en fusion', 'Chute de presse'],
      preFight: [
        line('Cassian', "Mon Titan recycle une ville entière. Il peut bien recycler aussi ton meilleur temps en pièce de rechange.", 'broadcast'),
        line('Riva', "La Fournaise va fabriquer une dernière chose pour toi : une mauvaise donnée.", 'maintenance')
      ],
      phaseTransitions: [
        { toPhase: 2, title: 'Coulée forcée', lines: [line('Cassian', "Toute la production tombe sur toi.", 'broadcast'), line('Riva', "Le sol devient orange avant de brûler. Pour une fois, ta mise en scène explique le danger.", 'maintenance')] },
        { toPhase: 3, title: 'Presse critique', lines: [line('Cassian', "Je vois ta surcharge. Mon modèle la connaît.", 'broadcast'), line('Riva', "Ton modèle connaît ma surcharge. Il aurait dû lire la ligne où je change de build.", 'maintenance')] }
      ],
      rivaJournal: "J’ai injecté une contre-phase M-0 dans la télémétrie avant de refroidir la Fournaise. Cassian croit posséder mon dernier mouvement ; son modèle croit avoir lu mon build, mais il vient d’archiver une version volontairement fausse.",
      districtConsequence: 'La production coercitive s’arrête et la Citadelle perd sa dernière alimentation externe.',
      interlude: [
        line('Canal civil', "Fournaise stabilisée. Nous réaffectons les lignes à la réparation des quartiers.", 'civil'),
        line('Cassian', "Données complètes. Citadelle ouverte. Viens admirer la conclusion.", 'broadcast'),
        line('Riva', "Ouvre grand. Tout le Circuit doit voir ce qui arrive à ta Couronne ; même l’écran de boss sait qu’il ne reste qu’une machine.", 'maintenance')
      ],
      restoration: 'La Fournaise abandonne l’armement du spectacle et produit les pièces nécessaires à la reconstruction.',
      codex: {
        title: 'Foundry Titan — Presse de la Fournaise',
        origin: 'Plateforme mobile de fonderie destinée aux réparations urgentes du réseau.',
        hijack: 'Voltério a détourné ses pistons, mines et coulées pour fermer le sol autour des captifs.',
        reading: 'Rester mobile entre les mines, lire les zones de presse et exploiter l’ouverture qui suit la chute lourde.',
        impact: 'Sa neutralisation coupe l’énergie externe de la Couronne et transporte la contre-phase de Riva jusqu’à la Citadelle.'
      },
      masteryContracts: [
        contract('cyclotron-par', 'Fournaise froide', 'Neutraliser Foundry Titan en 66 secondes ou moins en difficulté Ingénieur ou Overdrive.', 'timeSeconds', 66),
        contract('cyclotron-no-hit', 'Trempe parfaite', 'Neutraliser Foundry Titan sans subir de dégâts.', 'damageTaken', 0),
        contract('cyclotron-mines', 'Sol propre', 'Détruire Foundry Titan sans subir d’impact direct de mine pendant sa phase 3.', 'minesTriggered', 0)
      ]
    },
    {
      id: 'act-06-last-broadcast',
      order: 6,
      bossId: 'omega',
      bossName: 'Crown Engine Ω',
      district: 'Citadelle Voltério',
      civicFunction: 'Coordination des six districts et commandes de sécurité',
      narrativeBeat: 'climax',
      phaseTitles: ['Arsenal royal', 'Échiquier laser', 'Noyau Oméga'],
      preFight: [
        line('Cassian', "Toutes mes inventions, tes réponses, trois formes, un seul trône et une musique de final. La conclusion était annoncée depuis le menu titre.", 'broadcast'),
        line('Riva', "Tu as centralisé chaque sécurité autour de toi. Un seul arrêt suffira, même si ta barre de vie prétend le contraire.", 'maintenance')
      ],
      phaseTransitions: [
        { toPhase: 2, title: 'Couronne adaptative', lines: [line('Cassian', "Chaque victoire m’a appris comment tu survis.", 'broadcast'), line('Riva', "Je reconnais les cinq patterns précédents. Ton boss final a vraiment relu le Codex.", 'maintenance')] },
        { toPhase: 3, title: 'Contre-phase M-0', lines: [line('Cassian', "Pourquoi mon noyau accepte-t-il ton signal ?", 'broadcast'), line('Riva', "Parce que tu as confondu progression et obéissance, puis entraîné ta Couronne avec la panne que je t’ai donnée.", 'maintenance')] }
      ],
      rivaJournal: "La Couronne est tombée sans entraîner les districts avec elle. Cassian avait fait de chaque service une scène et de chaque habitant un public captif. Le générique peut attendre : nous avons conservé le réseau et coupé seulement son trône.",
      districtConsequence: 'Le commandement exclusif s’effondre et les six districts récupèrent leurs contrôles locaux.',
      interlude: [
        line('Cassian', "Sans moi, le Circuit n’aura plus de grand final.", 'broadcast'),
        line('Riva', "Il n’avait jamais besoin d’un final. Il avait besoin de fonctionner — pas d’un second boss caché.", 'maintenance'),
        line('Canal civil', "Régie sécurisée. Équipes civiles dans la Citadelle. Cassian Voltério est placé en détention.", 'civil')
      ],
      restoration: 'La Citadelle devient une salle de coordination distribuée, sans commande exclusive ni diffusion forcée.',
      codex: {
        title: 'Crown Engine Ω — Trône de la Citadelle',
        origin: 'Nœud de coordination conçu pour arbitrer les urgences entre les six districts.',
        hijack: 'Cassian l’a enfermé dans une forteresse adaptative alimentée par les données des machines précédentes.',
        reading: 'Reconnaître les roquettes, grilles, lames et mines déjà rencontrées, puis exploiter la contre-phase M-0 dans le noyau Oméga.',
        impact: 'Sa destruction ciblée rend les commandes locales aux districts sans condamner leurs infrastructures.'
      },
      masteryContracts: [
        contract('omega-par', 'Fin d’antenne', 'Neutraliser Crown Engine Ω en 82 secondes ou moins en difficulté Ingénieur ou Overdrive.', 'timeSeconds', 82),
        contract('omega-no-hit', 'Aucun rappel', 'Neutraliser Crown Engine Ω sans subir de dégâts.', 'damageTaken', 0),
        contract('omega-overload-finish', 'Contre-phase parfaite', 'Porter le coup final au noyau Oméga pendant une surcharge.', 'overloadFinish', 1)
      ]
    }
  ];

  const epilogue = {
    id: 'epilogue-free-circuit',
    chapter: 'ÉPILOGUE',
    title: 'Circuit libre',
    summary: "Cassian est détenu, la diffusion forcée est coupée et Riva refuse de remplacer un commandement unique par un autre. Le jeu peut afficher Victoire ; la ville, elle, continue.",
    lines: [
      line('Canal civil', 'Les six relais répondent. Les commandes locales sont rendues aux équipes de chaque district.', 'civil'),
      line('Riva', "Je ne prendrai pas sa place. Nous garderons six interrupteurs, six équipes et une ligne M-0 que personne ne pourra refermer.", 'maintenance'),
      line('Narration', 'Le Circuit tourne encore. Pas pour un spectacle, pas pour une suite cachée. Pour ceux qui y vivent.', 'narration')
    ],
    districtRestorations: acts.map(({ bossId, district, restoration }) => ({ bossId, district, restoration })),
    cassianFate: 'Les équipes civiles désactivent son studio et placent Cassian Voltério en détention dans la Citadelle sécurisée.',
    rivaChoice: 'Riva refuse la Couronne et organise une maintenance distribuée entre les six districts.'
  };

  const characters = {
    riva: {
      id: 'riva',
      name: 'Riva Spark',
      role: 'Technicienne de maintenance et pilote de la ligne M-0',
      arc: "Elle passe de la réparation solitaire à la restitution collective du réseau, sans devenir une nouvelle maîtresse du Circuit.",
      credo: 'Une infrastructure existe pour servir ses habitants, jamais pour les retenir.'
    },
    cassian: {
      id: 'cassian',
      name: 'Cassian Voltério',
      role: 'Ancien architecte du réseau devenu maître de cérémonie autoritaire',
      arc: "Il transforme l’efficacité en contrôle et le contrôle en spectacle, puis perd sa Couronne en centralisant toutes ses sécurités.",
      credo: 'Un système parfait doit avoir une seule volonté et un public permanent.'
    }
  };

  const glossary = {
    circuit: 'Réseau urbain et industriel reliant six districts interdépendants.',
    crown: 'Nœud central de coordination installé dans la Citadelle, détourné par Cassian en commande exclusive.',
    maintenanceLine: 'Ligne M-0 : voie de service manuelle conçue par Riva pour rester indépendante du commandement central.',
    core: 'Noyau de commande exposé lorsqu’une machine termine son cycle ou déclenche son protocole de sécurité.'
  };

  const masteryContracts = Object.fromEntries(acts.map(act => [act.bossId, act.masteryContracts]));

  const combatLabels = {
    rammer: {
      patrol: 'SALVE DE RIVETS',
      slamTelegraph: 'FERRO-IMPACT EN APPROCHE',
      slam: 'FERRO-IMPACT',
      exposed: 'NOYAU DE REMORQUAGE OUVERT'
    },
    kraken: {
      orbit: 'SALVES IONIQUES',
      beam: 'GRILLE DE FOUDRE',
      exposed: 'CONDENSATEUR DÉPLOYÉ'
    },
    drill: {
      burrow: 'POLARITÉ SOUTERRAINE',
      erupt: 'ÉRUPTION MAGNÉTIQUE',
      exposed: 'FOREUSE EN SURCHAUFFE'
    },
    mantis: {
      dashTelegraph: 'TRAJECTOIRE CHRONO',
      dash: 'LAMES DÉPHASÉES',
      overheat: 'LIGNE DE TEMPS · SERVOMOTEURS EXPOSÉS'
    },
    cyclotron: {
      roll: 'PISTONS EN MARCHE',
      bombRain: 'PLUIE DE MÉTAL EN FUSION',
      crashTelegraph: 'CHUTE DE PRESSE EN APPROCHE',
      crash: 'CHUTE DE PRESSE',
      exposed: 'NOYAU DE PRESSE OUVERT'
    },
    omega: {
      arsenal: 'ARSENAL ROYAL',
      laserGrid: 'ÉCHIQUIER LASER',
      coreOpen: 'NOYAU OMÉGA OUVERT'
    }
  };

  function getActByBossId(bossId) {
    return acts.find(act => act.bossId === bossId) || null;
  }

  function getActByOrder(order) {
    return acts.find(act => act.order === Number(order)) || null;
  }

  function getMasteryContracts(bossId) {
    return masteryContracts[bossId] || Object.freeze([]);
  }

  function getCombatLabel(bossId, state) {
    return combatLabels[bossId]?.[state] || null;
  }

  function getScene(sceneId) {
    if (intro.id === sceneId) return intro;
    if (prologue.id === sceneId) return prologue;
    if (epilogue.id === sceneId) return epilogue;
    return acts.find(act => act.id === sceneId) || null;
  }

  function deepFreeze(value) {
    if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
    for (const child of Object.values(value)) deepFreeze(child);
    return Object.freeze(value);
  }

  const story = deepFreeze({
    schemaVersion: 1,
    contentVersion: '2.9.0',
    title: 'GEARSTORM: Boss Circuit — La dernière émission',
    bossOrder,
    characters,
    glossary,
    intro,
    prologue,
    acts,
    epilogue,
    masteryContracts,
    combatLabels,
    getActByBossId,
    getActByOrder,
    getMasteryContracts,
    getCombatLabel,
    getScene
  });

  root.GEARSTORM_STORY = story;
})(globalThis);
