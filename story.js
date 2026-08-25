(function installGearstormStory(root) {
  'use strict';

  const bossOrder = Object.freeze(['rammer', 'kraken', 'drill', 'mantis', 'cyclotron', 'omega']);

  const line = (speaker, text, channel = 'dialogue') => ({ speaker, text, channel });
  const contract = (id, title, objective, metric, target) => ({ id, title, objective, metric, target });

  const intro = {
    id: 'intro-permanent-broadcast',
    chapter: 'INTRODUCTION',
    title: 'La ville en direct',
    summary: "Au cœur d’une Gearstorm, Cassian Voltério prolonge le mandat d’urgence de la Couronne provisoire et transforme six services vitaux en scènes de soumission. Une ancienne voie manuelle répond encore à Riva.",
    lines: [
      line('Cassian', "Habitants du Circuit, la tempête a toujours exigé une seule voix. Ce soir, elle aura aussi un visage. Le cadre est prêt ; je serai son unique auteur.", 'broadcast'),
      line('Nara Vey', "Réseaux locaux coupés. Les portes d’évacuation attendent toutes l’autorisation de la Couronne.", 'civil'),
      line('Riva', "Une ville n’est pas ton public, Cassian. Et j’ai laissé une voie que tes projecteurs ne voient pas.", 'maintenance')
    ]
  };

  const prologue = {
    id: 'prologue-ghost-line',
    chapter: 'PROLOGUE 00',
    title: 'La ligne fantôme',
    kicker: 'TRANSMISSION PRIORITAIRE // LIGNE M-0',
    status: 'ITINÉRAIRE MANUEL ACTIF',
    location: 'Ligne de maintenance M-0',
    objective: 'Réactiver les six relais de sécurité et révoquer le mandat de la Couronne.',
    method: 'Lire · Esquiver · Exposer · Surcharger',
    continueLabel: 'Entrer dans le Circuit →',
    summary: "Riva réveille M-0, la voie de consignation qu’elle a conçue après la Nuit des Six Extinctions. Pour ouvrir la Citadelle sans condamner la ville, elle doit rendre chaque relais à son district.",
    lines: [
      line('Riva', "J’ai signé M-0 pour qu’aucune urgence ne devienne un règne. J’aurais dû vérifier qui gardait la clé.", 'maintenance'),
      line('Nara Vey', "Six relais répondent. Chaque équipe locale pourra reprendre son district dès que son noyau sera consigné.", 'civil'),
      line('Cassian', "Toujours dans les coulisses, Spark. Très bien : traverse mes six actes et viens contester la fin.", 'broadcast')
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
        line('Cassian', "Premier acte, Spark. Rivet Rex fermera la Rocade et le public apprendra que même les routes m’appartiennent.", 'broadcast'),
        line('Riva', "Une route n’est pas une scène. Je consigne le noyau et je rends les convois à ceux qui les attendent.", 'maintenance')
      ],
      phaseTransitions: [
        { toPhase: 2, title: 'Verrou renforcé', lines: [line('Cassian', "Deuxième entrée : la route elle-même se retourne contre toi.", 'broadcast'), line('Riva', "Tes coulisses grincent avant chaque piège. Je les entends encore.", 'maintenance')] },
        { toPhase: 3, title: 'Rocade en surcharge', lines: [line('Cassian', "Rideau de fer. Cette route n’aura pas de sortie.", 'broadcast'), line('Riva', "Toute machinerie révèle son geste avant de frapper. La tienne aussi.", 'maintenance')] }
      ],
      rivaJournal: "La Rocade répond encore aux anciens codes. Après l’arrêt de Rivet Rex, la Couronne a répété ma cadence exacte comme un rappel appris trop vite. Cassian connaît mon nom ; moi, je viens d’entendre le premier indice.",
      memoryFragment: "M-0 / PLAN 01 — La consignation manuelle porte encore la signature de Riva et la clause : aucune urgence ne peut suspendre indéfiniment les commandes locales.",
      districtConsequence: 'Le premier verrou cède et les axes de transport recommencent à évacuer les habitants.',
      interlude: [
        line('Nara Vey', "Convoi douze en mouvement. Les équipes de la Rocade voient de nouveau les balises de sortie.", 'civil'),
        line('Cassian', "Riva Spark. La technicienne qui écrivait les sécurités de la Couronne entre deux répétitions.", 'broadcast'),
        line('Riva', "Celles du Circuit. Elles ne t’ont jamais appartenu, et ton public vient de retrouver une sortie.", 'maintenance')
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
        line('Cassian', "Deuxième acte. Je connais déjà le pas que tu choisis avant l’éclair.", 'broadcast'),
        line('Riva', "Tu peux garder tes projecteurs. Je rends la voix aux districts.", 'maintenance')
      ],
      phaseTransitions: [
        { toPhase: 2, title: 'Orage de contrôle', lines: [line('Cassian', "À gauche avant l’éclair. Toujours. Je connais ta réplique.", 'broadcast'), line('Riva', "Tu ne regardes plus le ciel. Tu m’observes.", 'maintenance')] },
        { toPhase: 3, title: 'Condensateur critique', lines: [line('Cassian', "Le ciel ferme son cadre. Il ne te reste qu’un rôle.", 'broadcast'), line('Riva', "Tu connais ma trajectoire, pas la raison qui me la fait quitter.", 'maintenance')] }
      ],
      rivaJournal: "Le nord répond. Derrière le brouillage, des milliers de voix attendaient une brèche. Les journaux du relais montrent que Cassian n’enregistre pas seulement mes déplacements : il classe mes décisions comme les répliques d’un rôle à reproduire.",
      memoryFragment: "COURONNE / ÉCOUTE 02 — Les balises du Couloir alimentent un modèle adaptatif centré sur R. Spark, activé avant même son entrée sur la Rocade.",
      districtConsequence: 'Le brouillage tombe et les communications civiles relient de nouveau les districts du nord.',
      interlude: [
        line('Nara Vey', "Riva, les rails de la Fosse sont encore bloqués. Les coordonnées viennent de trois stations indépendantes.", 'civil'),
        line('Cassian', "Continue à improviser. La Couronne apprend très vite le rôle que tu refuses.", 'broadcast'),
        line('Riva', "Tu ne diffuses pas seulement ma course. Tu répètes mes solutions jusqu’à croire qu’elles m’appartiennent.", 'maintenance')
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
        line('Cassian', "Troisième acte. La Fosse ramène toujours chacun à la place que je lui ai écrite.", 'broadcast'),
        line('Riva', "Pas cette fois. Les trains partiront, et ton décor perdra ses captifs.", 'maintenance')
      ],
      phaseTransitions: [
        { toPhase: 2, title: 'Polarité inversée', lines: [line('Cassian', "Le sol lui-même te réclame. Reviens à ta marque avant que le décor ne change.", 'broadcast'), line('Riva', "Une marque n’est qu’un endroit dont on peut partir.", 'maintenance')] },
        { toPhase: 3, title: 'Champ instable', lines: [line('Cassian', "La Fosse va broyer jusqu’à ta dernière improvisation.", 'broadcast'), line('Riva', "Alors je sortirai de ton texte avant que le rideau tombe.", 'maintenance')] }
      ],
      rivaJournal: "Les trains quittent la Fosse. Dans le contrôleur de Magnetron, j’ai trouvé un dossier à mon nom : CROWN / ADAPTATION / R. SPARK. Les premières observations précèdent mon départ sur M-0. Cassian n’a pas improvisé cette poursuite : il l’attendait.",
      memoryFragment: "CROWN / ADAPTATION 03 — Le dossier R. SPARK relie chaque réponse de Riva au protocole de reprise M-0 et marque la technicienne comme étalon prioritaire.",
      districtConsequence: 'Les attaches magnétiques se relâchent et les voies d’évacuation reprennent leur service.',
      interlude: [
        line('Nara Vey', "Premier train sorti de la Fosse. Les quais se vident et les équipes locales reprennent les aiguillages.", 'civil'),
        line('Cassian', "Tu appelles cela une fuite. Moi, j’appelle cela une répétition parfaite.", 'broadcast'),
        line('Riva', "Tu ne m’as pas laissée passer. Tu avais préparé mon rôle avant même d’allumer la scène.", 'maintenance')
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
        line('Cassian', "Quatrième acte. Une révolte sans heure devient une rumeur ; Chrono Mantis corrigera l’archive.", 'broadcast'),
        line('Riva', "Une archive n’a pas à servir ton récit. Elle doit se souvenir de ceux que tu as coupés.", 'maintenance')
      ],
      phaseTransitions: [
        { toPhase: 2, title: 'Archive déphasée', lines: [line('Cassian', "Je peux retirer de l’acte l’instant où tu croyais gagner.", 'broadcast'), line('Riva', "Les districts en gardent déjà six copies. Ton montage arrive trop tard.", 'maintenance')] },
        { toPhase: 3, title: 'Minute zéro', lines: [line('Cassian', "Ton ancien protocole stabilise enfin ma Couronne.", 'broadcast'), line('Riva', "Tu as gardé ma signature et coupé le consentement. Voilà le tour de coulisse.", 'maintenance')] }
      ],
      rivaJournal: "Les horodatages restaurés prouvent que le verrouillage était planifié. Après la Nuit des Six Extinctions, j’avais donné à M-0 un modèle capable d’anticiper une panne. Cassian a remplacé la panne par une personne et le conseil local par sa seule voix.",
      memoryFragment: "ARCHIVE 04 — Le mandat de la Couronne devait expirer au retour des six relais. La révocation de cette clause porte la signature de Cassian ; le modèle adaptatif original porte celle de Riva.",
      districtConsequence: 'Les horloges civiles et les archives authentiques redémarrent sur tous les canaux restaurés.',
      interlude: [
        line('Nara Vey', "Archives répliquées dans les six districts. L’ordre de prise de contrôle et sa clause supprimée sont publics.", 'civil'),
        line('Cassian', "Chaque acte t’a rapprochée de moi et a perfectionné la machine qui connaît tes entrées.", 'broadcast'),
        line('Riva', "Alors ma prochaine réplique sera fausse. Ta Couronne l’apprendra trop tard.", 'maintenance')
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
        line('Cassian', "Cinquième acte. Mon Titan recyclera ta révolte et la remettra en scène sous mon nom.", 'broadcast'),
        line('Riva', "La Fournaise va fabriquer une dernière réplique : celle que ta Couronne voudra croire.", 'maintenance')
      ],
      phaseTransitions: [
        { toPhase: 2, title: 'Coulée forcée', lines: [line('Cassian', "Toute la production tombe sur toi. Voilà ce que pèse mon final.", 'broadcast'), line('Riva', "Le métal éclaire toujours l’endroit qu’il va condamner. Même ton décor refuse de mentir.", 'maintenance')] },
        { toPhase: 3, title: 'Presse critique', lines: [line('Cassian', "Je vois ta surcharge. Ma Couronne connaît cette réplique.", 'broadcast'), line('Riva', "Elle connaît celle que je lui montre. Les cinq districts préparent la vraie réponse.", 'maintenance')] }
      ],
      rivaJournal: "J’ai injecté une contre-phase M-0 dans la télémétrie avant de refroidir la Fournaise. Cassian croit posséder mon dernier mouvement. En réalité, chaque district libéré détient maintenant une partie de l’arrêt que sa Couronne ne peut plus prononcer seule.",
      memoryFragment: "M-0 / CONTRE-PHASE 05 — Cinq autorisations locales remplacent la clé maîtresse. La sixième sera prise dans la Citadelle au moment de l’ouverture du noyau.",
      districtConsequence: 'La production coercitive s’arrête et la Citadelle perd sa dernière alimentation externe.',
      interlude: [
        line('Nara Vey', "Fournaise stabilisée. Cinq équipes confirment leur fragment de contre-phase ; les lignes repartent vers les quartiers.", 'civil'),
        line('Cassian', "Répétition terminée. Citadelle ouverte. Viens admirer la conclusion que tu m’as aidé à écrire.", 'broadcast'),
        line('Riva', "Ouvre grand. Tout le Circuit verra qu’un auteur seul ne possède jamais la fin.", 'maintenance')
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
        line('Cassian', "Dernier acte. Tes réponses, mes machines, un seul trône : toute la ville converge enfin vers ma conclusion.", 'broadcast'),
        line('Riva', "Tu as centralisé chaque sécurité autour de toi. Les six districts vont couper ensemble ce que tu croyais posséder seul.", 'maintenance')
      ],
      phaseTransitions: [
        { toPhase: 2, title: 'Couronne adaptative', lines: [line('Cassian', "Chaque victoire m’a appris comment tu survis. Je connais toutes tes répliques.", 'broadcast'), line('Riva', "Tu as recopié cinq machines. Tu n’as jamais écouté les cinq districts derrière elles.", 'maintenance')] },
        { toPhase: 3, title: 'Contre-phase M-0', lines: [line('Cassian', "Pourquoi mon noyau accepte-t-il six ordres à la fois ?", 'broadcast'), line('Riva', "Parce que la Couronne était provisoire. M-0 vient de lui rendre sa clause de fin.", 'maintenance')] }
      ],
      rivaJournal: "La Couronne est tombée sans entraîner les districts avec elle. Cassian avait fait de chaque service une scène et de chaque habitant un public captif. Les six équipes ont signé l’arrêt ensemble ; M-0 n’a plus de clé maîtresse, pas même la mienne.",
      memoryFragment: "PROCÈS-VERBAL 06 — Les six districts révoquent le mandat de la Couronne et publient les clés de consignation. Aucun signataire ne peut les réunir seul.",
      districtConsequence: 'Le commandement exclusif s’effondre et les six districts récupèrent leurs contrôles locaux.',
      interlude: [
        line('Cassian', "Sans moi, le Circuit n’aura plus de grand final.", 'broadcast'),
        line('Riva', "Il n’avait jamais besoin de ton final. Il avait besoin de fonctionner sans auteur unique.", 'maintenance'),
        line('Nara Vey', "Régie sécurisée. Les six équipes sont dans la Citadelle. Cassian Voltério est placé en détention.", 'civil')
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
    title: 'Les six voix',
    summary: "Cassian est détenu, la diffusion forcée est coupée et le mandat de la Couronne est aboli. Riva publie M-0, détruit la clé maîtresse et confie la coordination d’urgence à six autorisations locales qui ne peuvent agir qu’ensemble.",
    lines: [
      line('Nara Vey', 'Les six relais répondent. Le tram de la Rocade repart et les ascenseurs de l’hôpital reçoivent de nouveau leurs appels.', 'civil'),
      line('Riva', "Je ne prendrai pas sa place. M-0 est publique désormais : six clés, six équipes, et aucune main assez grande pour refermer la ville.", 'maintenance'),
      line('Narration', 'Les projecteurs s’éteignent. Le Circuit tourne encore, non pour un spectacle, mais pour ceux qui y vivent.', 'narration')
    ],
    districtRestorations: acts.map(({ bossId, district, restoration }) => ({ bossId, district, restoration })),
    cassianFate: 'Les équipes civiles ferment la régie, conservent les preuves de la Nuit des Six Extinctions et placent Cassian Voltério en détention dans la Citadelle sécurisée.',
    rivaChoice: 'Riva refuse la Couronne, publie M-0 et détruit la clé maîtresse au profit de six consignations locales.'
  };

  const characters = {
    riva: {
      id: 'riva',
      name: 'Riva Spark',
      role: 'Ingénieure de sûreté, technicienne de terrain et créatrice de la ligne M-0',
      arc: "Cofondatrice involontaire du modèle que Cassian a détourné, elle transforme sa culpabilité en restitution collective et refuse de devenir la nouvelle maîtresse du Circuit.",
      credo: 'Une infrastructure existe pour servir ses habitants, jamais pour les retenir.'
    },
    cassian: {
      id: 'cassian',
      name: 'Cassian Voltério',
      role: 'Ancien architecte en chef de la Couronne devenu maître de cérémonie autoritaire',
      arc: "Après avoir sauvé la ville pendant la Nuit des Six Extinctions, il refuse la fin de son mandat, transforme l’urgence en contrôle puis le contrôle en spectacle.",
      credo: 'Une ville parfaite doit parler d’une seule voix — la mienne — devant un public permanent.'
    },
    nara: {
      id: 'nara',
      name: 'Nara Vey',
      role: 'Régulatrice des voies et voix du réseau civil distribué',
      arc: "D’abord isolée sur un canal de secours, elle relie les six équipes locales et porte leurs autorisations jusqu’à la Citadelle.",
      credo: 'Une coordination utile transmet la décision ; elle ne la confisque pas.'
    }
  };

  const glossary = {
    circuit: 'Cité-réseau composée de six districts interdépendants, chacun capable de reprendre localement ses services.',
    crown: 'La Couronne, arbitre provisoire créé après la Nuit des Six Extinctions puis détourné par Cassian en commande permanente, est abolie lorsque les six districts révoquent ensemble son mandat.',
    maintenanceLine: 'Ligne M-0 : voie de consignation manuelle conçue par Riva afin qu’aucune urgence ne puisse abolir les commandes locales.',
    core: 'Noyau de commande exposé lorsqu’une machine termine son cycle ou déclenche son protocole de sécurité.',
    gearstorm: 'Cascade électromagnétique provoquée lorsque les six services du Circuit se désynchronisent.',
    sixExtinctions: 'Première Gearstorm : la ville fut sauvée par une activation temporaire de la Couronne, dont Cassian refusa ensuite la révocation.',
    counterphase: 'Ordre d’arrêt M-0 réparti entre les districts ; aucune personne ne peut l’activer seule.'
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
    contentVersion: '2.10.0',
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
