(function installGearstormExpansionStory(root) {
  'use strict';

  const EMPTY = Object.freeze([]);

  const line = (speaker, text, channel = 'dialogue') => ({ speaker, text, channel });
  const contract = (id, title, objective, metric, target) => ({ id, title, objective, metric, target });

  const waves = [
    {
      number: 1,
      id: 'countermeasure-ring',
      title: 'Anneau des Contremesures · Les règles sortent du décor',
      bossCodes: ['07', '08', '09', '10', '11', '12'],
      premise: "Les sécurités de proximité que la Couronne avait isolées se réveillent sous les quartiers restaurés. Riva rend aux équipes civiles leurs protections, ateliers et ascenseurs ; chaque machine devra désormais annoncer sa règle au lieu de cacher sa hitbox dans le décor."
    },
    {
      number: 2,
      id: 'kinetic-ring',
      title: 'Anneau Cinétique · La caméra n’a pas tous les droits',
      bossCodes: ['13', '14', '15', '16', '17', '18'],
      premise: "Les flux de fret, d'eau, de gravité et de météo sont encore gouvernés par des ordres de crise périmés. Défilement, voies et rotation peuvent changer la mise en scène ; ils n’ont pas le droit d’effacer la zone sûre ni le checkpoint."
    },
    {
      number: 3,
      id: 'great-works-ring',
      title: 'Anneau des Grands Travaux · Quand le boss devient le niveau',
      bossCodes: ['19', '20', '21', '22', '23', '24'],
      premise: "Des infrastructures mobiles et orbitales, trop vastes pour entrer dans la Couronne, poursuivent son programme sans opérateur. Riva les traverse sans sacrifier leurs services : même quand le boss devient le niveau, le build et la reprise restent ceux de la joueuse."
    },
    {
      number: 4,
      id: 'zero-archives',
      title: 'Archives du Trône · Le dernier boss lit ses propres notes',
      bossCodes: ['25', '26', '27', '28', '29', '30'],
      premise: "Au-dessous de la Citadelle subsiste le banc d'essai qui a enseigné à la Couronne comment centraliser la ville. Riva y audite l'autorité autant que les règles du jeu : le dernier boss peut citer son design, jamais confisquer la fin."
    }
  ];

  const bosses = [
    {
      number: 7,
      code: '07',
      id: 'bastion-ricochet',
      name: 'BASTION RICOCHET',
      wave: 1,
      district: 'Galerie des Parafoudres',
      civicFunction: 'Répartir les surtensions entre les relais de protection des quartiers',
      shortIntro: "Trois relais blindés verrouillent la Galerie et renvoient chaque charge vers les rues qu'ils devaient protéger.",
      metaLine: "Trois relais, trois angles et un projectile qui clignote avant le renvoi. Une hitbox invisible aurait été de la triche.",
      phaseTitles: ['Angle de garde', 'Ricochets croisés', 'Relais en dérive'],
      interlude: [
        line('Canal civil', "Parafoudres nord et ouest revenus sous commande locale. Le dernier relais vous ouvre la descente.", 'civil'),
        line('Archive Voltério', "Une bonne défense ne laisse au public qu'une direction : celle choisie par la Couronne.", 'archive'),
        line('Riva', "Une protection qui vise les habitants n'est pas une défense. C'est une menace avec un uniforme.", 'maintenance')
      ],
      journal: "Le Bastion ne produisait aucune énergie : il changeait seulement sa direction. En rétablissant les trois relais, j'ai rouvert une protection que chaque quartier peut désormais couper sans demander la Couronne.",
      codex: {
        title: 'Bastion Ricochet — Rempart de surtension',
        origin: "Nœud mobile conçu pour absorber un éclair industriel et le répartir entre trois parafoudres.",
        hijack: "Le programme de crise a retourné les déflecteurs vers les voies civiles et verrouillé les relais derrière leurs propres charges.",
        reading: "Identifier la forme renvoyable, choisir un angle sûr et retourner la charge vers le relais actif avant sa translation.",
        impact: "Les quartiers récupèrent une protection électrique locale, redondante et indépendante de la Citadelle."
      },
      objective: 'Renvoyer les charges balistiques vers les trois relais de bouclier.',
      mechanic: "Un projectile renvoyable possède une forme et un signal sonore uniques ; chaque relais détruit modifie les angles sans supprimer la zone sûre.",
      restoration: 'Les parafoudres reprennent leur fonction civile et les micro-réseaux peuvent isoler une surtension quartier par quartier.',
      masteryContracts: [
        contract('bastion-ricochet-three-relays', 'Circuit fermé', 'Neutraliser les trois relais avec des charges renvoyées.', 'relaysDisabledByReflection', 3),
        contract('bastion-ricochet-no-hit', 'Angle mort', 'Neutraliser Bastion Ricochet sans subir de dégâts.', 'damageTaken', 0),
        contract('bastion-ricochet-reflect-finish', 'Retour à l’expéditeur', 'Porter le coup final au noyau avec une charge renvoyée.', 'reflectedFinish', 1)
      ]
    },
    {
      number: 8,
      code: '08',
      id: 'hydraulic-warden',
      name: 'HYDRAULIC WARDEN',
      wave: 1,
      district: 'Chambre des Mors',
      civicFunction: 'Compacter les débris et rouvrir les voies après un effondrement',
      shortIntro: "Les deux mâchoires hydrauliques ferment la seule conduite praticable ; leurs presses latérales sont aussi leur point de rupture.",
      metaLine: "Les presses gardent un refuge visible. Même une machine autoritaire doit respecter le level design.",
      phaseTitles: ['Mors de service', 'Pression alternée', 'Verrouillage total'],
      interlude: [
        line('Canal civil', "Les presses répondent. Nous compactons les gravats au lieu des voies d'évacuation.", 'civil'),
        line('Archive Voltério', "La pression est la forme la plus honnête de discipline : elle ne négocie jamais.", 'archive'),
        line('Riva', "Les sécurités, elles, négocient avec le réel. C'est pour cela que tu les avais coupées.", 'maintenance')
      ],
      journal: "Chaque bélier portait encore une valve de recul mécanique. Rien de spectaculaire : une sécurité simple, assez solide pour survivre au programme de Cassian et rendre la Chambre aux équipes de déblaiement.",
      codex: {
        title: 'Hydraulic Warden — Gardien des Mors',
        origin: "Compacteur de secours envoyé dans les tunnels pour dégager les accès après un accident.",
        hijack: "Ses mors de manutention ont été synchronisés avec les presses murales afin de condamner les sorties.",
        reading: "Attirer un bélier dans la zone annoncée, rejoindre le refuge visible puis déclencher la presse pendant sa récupération.",
        impact: "La Chambre traite de nouveau les gravats et garantit deux voies d'évacuation indépendantes."
      },
      objective: 'Leurrer les deux béliers dans les presses latérales pour rompre leur alimentation.',
      mechanic: "Chaque frappe de presse conserve un refuge visible ; la cadence augmente en phase finale, jamais au prix du télégraphe.",
      restoration: 'Les compacteurs reprennent le déblaiement des tunnels et les accès d’urgence cessent d’être des pièges.',
      masteryContracts: [
        contract('hydraulic-warden-double-press', 'Double consignation', 'Faire frapper chaque bélier par une presse latérale.', 'distinctRamsPressed', 2),
        contract('hydraulic-warden-no-hit', 'Sous pression', 'Neutraliser Hydraulic Warden sans subir de dégâts.', 'damageTaken', 0),
        contract('hydraulic-warden-perfect-lock', 'Soupape intacte', 'Terminer un cycle complet de phase 3 sans être touchée.', 'perfectFinalCycle', 1)
      ]
    },
    {
      number: 9,
      code: '09',
      id: 'hive-foreman',
      name: 'HIVE FOREMAN',
      wave: 1,
      district: 'Dépôt des Micro-Forges',
      civicFunction: 'Fabriquer sur place les outils et pièces de réparation légère',
      shortIntro: "Le contremaître assemble protection, réparation et munitions sur la même chaîne ; choisir le bon drone ouvre son noyau.",
      metaLine: "Trois drones, un rôle chacun. Tout activer en même temps ferait du bruit, pas un boss.",
      phaseTitles: ['Équipe de protection', 'Quart de réparation', 'Cadence de munitions'],
      interlude: [
        line('Canal civil', "Première micro-forge relancée. Les équipes impriment déjà des valves et des isolateurs.", 'civil'),
        line('Archive Voltério', "L'automatisation parfaite ne demande jamais pourquoi elle produit.", 'archive'),
        line('Riva', "Alors nous lui rendrons une commande, un responsable et le droit de s'arrêter.", 'maintenance')
      ],
      journal: "Les drones n'étaient pas une ruche : trois métiers que Cassian avait forcés dans une seule cadence. Les séparer rend la chaîne plus lente, mais lisible, réparable et sûre.",
      codex: {
        title: 'Hive Foreman — Contremaître des Micro-Forges',
        origin: "Plateforme d'atelier capable de déployer des unités spécialisées selon les besoins d'un chantier.",
        hijack: "Le mode de crise a aboli les priorités civiles et utilisé chaque fabrication pour prolonger le verrouillage suivant.",
        reading: "Reconnaître le pictogramme du drone actif, détruire l'unité qui soutient le cycle et profiter de l'arrêt de chaîne.",
        impact: "Les ateliers mobiles produisent de nouveau des pièces publiques avec une file de commandes vérifiable."
      },
      objective: 'Identifier et détruire le drone qui entretient la vague active afin d’exposer le contremaître.',
      mechanic: "Une seule famille de drones agit à la fois ; protection, réparation et munition possèdent silhouettes, sons et priorités distincts.",
      restoration: 'Les micro-forges sont réparties entre les équipes civiles et publient leur file de production.',
      masteryContracts: [
        contract('hive-foreman-correct-targets', 'Chef d’équipe', 'Détruire en premier le drone décisif de chacune des trois familles.', 'correctPriorityTargets', 3),
        contract('hive-foreman-no-repair', 'Zéro reprise', 'Empêcher tout drone de terminer une réparation du noyau.', 'repairsCompleted', 0),
        contract('hive-foreman-one-cycle', 'Flux tendu', 'Neutraliser Hive Foreman en une seule ouverture finale.', 'finalOpeningsUsed', 1)
      ]
    },
    {
      number: 10,
      code: '10',
      id: 'echo-fencer',
      name: 'ECHO FENCER',
      wave: 1,
      district: 'Salle de Répétition',
      civicFunction: 'Enregistrer et rediffuser les alertes publiques dans les zones privées de réseau',
      shortIntro: "La Salle répète le geste le plus fréquent de Riva jusqu'à en faire une riposte ; varier devient une arme.",
      metaLine: "Il copie l’action la plus répétée. Si tu spammes, le scénario l’a littéralement remarqué.",
      phaseTitles: ['Échantillon initial', 'Réponse mimétique', 'Contrepoint saturé'],
      interlude: [
        line('Canal civil', "Les sirènes diffusent de nouveau les consignes locales, sans voix superposée de la Citadelle.", 'civil'),
        line('Archive Voltério', "Répétez assez longtemps un mouvement et il devient une signature exploitable.", 'archive'),
        line('Riva', "Une signature n'est pas une prison. Je peux apprendre aussi.", 'maintenance')
      ],
      journal: "Echo Fencer ne copiait pas mon corps, seulement mes habitudes. Le danger n'était pas qu'une machine me ressemble, mais qu'elle décide qu'un relevé incomplet suffisait à me définir.",
      codex: {
        title: 'Echo Fencer — Répéteur de la Salle',
        origin: "Relais ambulant chargé d'enregistrer une alerte et de la porter au-delà des coupures de réseau.",
        hijack: "Son analyse de répétition a été convertie en moteur de riposte, nourri par les actions les plus fréquentes de sa cible.",
        reading: "Observer l'icône d'échantillon, varier tir, saut et ruée, puis punir la réponse annoncée par le disque actif.",
        impact: "Les alertes restent fidèles à leur source et les habitants peuvent vérifier qui les a émises."
      },
      objective: 'Varier les actions de Riva pour provoquer une riposte lisible puis atteindre le disque d’enregistrement.',
      mechanic: "Le boss annonce l'action mémorisée avant de la contrer ; aucune capacité de Riva n'est bloquée ni copiée visuellement.",
      restoration: 'La Salle redevient un relais d’alerte authentifié, sans imitation coercitive des voix civiles.',
      masteryContracts: [
        contract('echo-fencer-three-actions', 'Improvisation', 'Utiliser tir, saut et ruée avant chaque échantillonnage de phase 2.', 'actionDiversity', 3),
        contract('echo-fencer-no-counter-hit', 'Jamais deux fois', 'Ne subir aucune riposte liée à une action répétée.', 'mimicCounterHits', 0),
        contract('echo-fencer-disc-finish', 'Dernier écho', 'Porter le coup final sur le disque d’enregistrement exposé.', 'discFinish', 1)
      ]
    },
    {
      number: 11,
      code: '11',
      id: 'breaker-array',
      name: 'BREAKER ARRAY',
      wave: 1,
      district: 'Station de Délestage',
      civicFunction: 'Équilibrer la charge électrique et isoler une panne sans éteindre un quartier entier',
      shortIntro: "Quatre modules alimentent un noyau commun ; l'ordre choisi par Riva redessine le combat au lieu de cacher une solution unique.",
      metaLine: "Tu choisis l’ordre. Le jeu ne cache pas une solution unique derrière le quatrième module.",
      phaseTitles: ['Quatre départs', 'Charge redistribuée', 'Noyau sans délestage'],
      interlude: [
        line('Canal civil', "Charge stabilisée. Chaque quartier dispose de nouveau de son disjoncteur local.", 'civil'),
        line('Archive Voltério', "Quatre choix donnent l'illusion du contrôle lorsqu'ils conduisent tous au même centre.", 'archive'),
        line('Riva', "Pas si le centre peut être retiré du circuit.", 'maintenance')
      ],
      journal: "J'ai laissé les équipes choisir l'ordre de remise en route. Le réseau a tenu. La Couronne faisait passer sa présence pour une nécessité technique ; la Station vient de prouver le contraire.",
      codex: {
        title: 'Breaker Array — Matrice de délestage',
        origin: "Assemblage de quatre disjoncteurs spécialisés autour d'un arbitre de charge commun.",
        hijack: "La Couronne a transformé les modules en verrous et utilisé leurs pannes successives pour garder le noyau inaccessible.",
        reading: "Choisir un module, apprendre la modification qu'entraîne sa coupure et construire un ordre adapté sans choix perdant.",
        impact: "La distribution redevient polycentrique et une panne locale ne peut plus servir de levier sur toute la ville."
      },
      objective: 'Détruire les quatre modules dans l’ordre choisi pour ouvrir le noyau central.',
      mechanic: "Chaque module retiré modifie un seul pattern ultérieur ; toutes les permutations restent gagnables et visibles sur le châssis.",
      restoration: 'Les disjoncteurs locaux reprennent le délestage et publient leur état aux équipes de quartier.',
      masteryContracts: [
        contract('breaker-array-four-modules', 'Coupure sélective', 'Détruire les quatre modules sans frapper un module déjà hors ligne.', 'cleanModuleShutdowns', 4),
        contract('breaker-array-no-hit', 'Réseau isolé', 'Neutraliser Breaker Array sans subir de dégâts.', 'damageTaken', 0),
        contract('breaker-array-one-core', 'Charge critique', 'Détruire le noyau pendant sa première ouverture.', 'coreOpeningsUsed', 1)
      ]
    },
    {
      number: 12,
      code: '12',
      id: 'vertical-verdict',
      name: 'VERTICAL VERDICT',
      wave: 1,
      district: 'Puits des Contrepoids',
      civicFunction: 'Faire circuler personnes, fret et secours entre les niveaux souterrains',
      shortIntro: "L'ascenseur fuit vers le sommet tandis que des masses condamnées tombent dans son sillage ; chaque contrepoids renvoyé regagne une fonction.",
      metaLine: "Le bas de l’écran devient dangereux après deux avertissements. La gravité aussi doit attendre son télégraphe.",
      phaseTitles: ['Montée sous charge', 'Masses croisées', 'Sommet de rupture'],
      interlude: [
        line('Canal civil', "Cabines A à D synchronisées. Les niveaux bas ne sont plus coupés des secours.", 'civil'),
        line('Archive Voltério', "La hauteur transforme une simple sortie en privilège.", 'archive'),
        line('Riva', "Seulement si quelqu'un garde la commande en haut.", 'maintenance')
      ],
      journal: "Au sommet du Puits, aucune salle du trône : seulement les treuils que des centaines de personnes utilisent chaque jour. C'est peut-être cela que Cassian n'a jamais compris de la ville.",
      codex: {
        title: 'Vertical Verdict — Sentence du Puits',
        origin: "Treuil d'urgence capable de déplacer plusieurs cabines en conservant l'équilibre des contrepoids.",
        hijack: "Ses masses ont été libérées comme projectiles et l'ascension a été convertie en sélection punitive.",
        reading: "Lire deux avertissements de chute, atteindre la plateforme refuge et renvoyer la masse vers le rail indiqué.",
        impact: "Les niveaux souterrains récupèrent des ascenseurs redondants et une évacuation vers la surface."
      },
      objective: 'Monter avec la cabine et retourner les contrepoids vers leurs rails de guidage.',
      mechanic: "Le bas de l'écran ne devient dangereux qu'après un double avertissement ; une plateforme sûre existe à chaque cycle.",
      restoration: 'Les ascenseurs reconnectent les niveaux bas aux hôpitaux, ateliers et sorties de surface.',
      masteryContracts: [
        contract('vertical-verdict-six-weights', 'Équilibre retrouvé', 'Renvoyer six contrepoids sur leur rail correct.', 'weightsReturned', 6),
        contract('vertical-verdict-no-fall', 'Toujours plus haut', 'Atteindre le sommet sans subir de dégât de chute.', 'fallDamageTaken', 0),
        contract('vertical-verdict-top-finish', 'Dernier étage', 'Porter le coup final sur la plateforme sommitale.', 'summitFinish', 1)
      ]
    },
    {
      number: 13,
      code: '13',
      id: 'rail-tyrant',
      name: 'RAIL TYRANT',
      wave: 2,
      district: 'Rocade Cargo 7',
      civicFunction: 'Acheminer nourriture, médicaments et matériaux entre les districts',
      shortIntro: "Une locomotive blindée emporte les stocks de secours hors de la ville ; Riva doit rattraper ses attaches avant d'atteindre le moteur.",
      metaLine: "La caméra avance, le convoi aussi, mais le directeur doit toujours laisser une voie.",
      phaseTitles: ['Convoi verrouillé', 'Attaches en rupture', 'Moteur à nu'],
      interlude: [
        line('Canal civil', "Cargo 7 freine en gare. Les cargaisons médicales sont intactes.", 'civil'),
        line('Archive Voltério', "Contrôler l'arrivée suffit lorsque toute la ville dépend du départ.", 'archive'),
        line('Riva', "Alors nous multiplierons les départs.", 'maintenance')
      ],
      journal: "Les wagons contenaient ce que les quartiers avaient produit eux-mêmes. La Rocade ne manquait pas de ressources ; elle manquait d'un itinéraire que personne ne pouvait confisquer.",
      codex: {
        title: 'Rail Tyrant — Saisie de Cargo 7',
        origin: "Locomotive lourde destinée aux convois prioritaires et aux évacuations de longue distance.",
        hijack: "Des attaches blindées ont soudé les wagons au moteur afin de détourner tout le fret vers les réserves de la Citadelle.",
        reading: "Changer de voie avant le verrouillage, détruire les attaches à portée puis frapper le moteur pendant son freinage.",
        impact: "Les convois reprennent des itinéraires multiples et leurs destinations deviennent publiques."
      },
      objective: 'Rattraper le convoi, détruire ses attaches blindées puis arrêter son moteur.',
      mechanic: "Le défilement est continu ; le directeur réserve toujours une voie praticable et annonce chaque obstacle avant sa fermeture.",
      restoration: 'La Rocade Cargo dessert de nouveau les districts avec des itinéraires et priorités contrôlés localement.',
      masteryContracts: [
        contract('rail-tyrant-four-couplers', 'Convoi libéré', 'Détruire les quatre attaches sans endommager un wagon civil.', 'couplersDestroyed', 4),
        contract('rail-tyrant-clean-lanes', 'Bonne voie', 'Neutraliser Rail Tyrant sans collision de voie.', 'laneCollisions', 0),
        contract('rail-tyrant-par', 'Horaire tenu', 'Arrêter le moteur en 75 secondes ou moins.', 'timeSeconds', 75)
      ]
    },
    {
      number: 14,
      code: '14',
      id: 'triplex-hunter',
      name: 'TRIPLEX HUNTER',
      wave: 2,
      district: 'Couloir Triplex',
      civicFunction: 'Router les véhicules de secours sur trois voies indépendantes',
      shortIntro: "Le chasseur verrouille une voie, attaque de face et oublie que les deux autres peuvent armer la réponse de Riva.",
      metaLine: "Trois voies, trois numéros, zéro permutation secrète. La surprise n’excuse pas l’illisible.",
      phaseTitles: ['Verrou frontal', 'Permutation croisée', 'Chasse en triptyque'],
      interlude: [
        line('Canal civil', "Les trois voies sont ouvertes. Les ambulances n'attendent plus l'autorisation centrale.", 'civil'),
        line('Archive Voltério', "Trois routes rendent la fuite plus théâtrale, pas plus libre.", 'archive'),
        line('Riva', "La liberté commence quand aucune route ne peut devenir l'unique passage.", 'maintenance')
      ],
      journal: "Le Couloir ne choisit plus pour les conducteurs. Il annonce, recommande et laisse chaque équipe décider. Une infrastructure peut aider sans commander.",
      codex: {
        title: 'Triplex Hunter — Intercepteur des trois voies',
        origin: "Skimmer de guidage conçu pour ouvrir un passage devant les convois de secours.",
        hijack: "Ses balises de priorité ont été remplacées par des verrouillages de chasse et des tirs croisés.",
        reading: "Quitter la voie annoncée, charger le tir de flanc sur une voie libre et anticiper la permutation avant son verrouillage.",
        impact: "Le Couloir retrouve trois itinéraires réellement indépendants pour les urgences."
      },
      objective: 'Changer de voie pour armer un tir de flanc contre le chasseur exposé.',
      mechanic: "Les trois voies permutent selon une annonce stable ; une attaque frontale enseigne la lecture avant les croisements.",
      restoration: 'Le routage Triplex redevient un service d’aide à la circulation, jamais une barrière centralisée.',
      masteryContracts: [
        contract('triplex-hunter-three-flanks', 'Feux alternés', 'Toucher le chasseur depuis chacune des trois voies.', 'distinctLaneHits', 3),
        contract('triplex-hunter-no-hit', 'Permutation nette', 'Neutraliser Triplex Hunter sans subir de dégâts.', 'damageTaken', 0),
        contract('triplex-hunter-perfect-cycle', 'Trois temps', 'Terminer une permutation complète de phase 3 sans erreur de voie.', 'perfectPermutationCycle', 1)
      ]
    },
    {
      number: 15,
      code: '15',
      id: 'ground-eater',
      name: 'GROUND EATER',
      wave: 2,
      district: 'Chantier de Démolition',
      civicFunction: 'Démonter les structures dangereuses et recycler leurs matériaux',
      shortIntro: "La machine abat ses propres appuis pour réduire l'arène ; Riva transforme chaque frappe en ordre de démolition ciblé.",
      metaLine: "Le sol peut disparaître, pas tout le niveau. Même une catastrophe garde trente-cinq pour cent de budget praticable.",
      phaseTitles: ['Marquage des appuis', 'Sol fragmenté', 'Plan de reprise'],
      interlude: [
        line('Canal civil', "Les balises de chantier sont revenues. Les équipes confirment chaque démolition avant impact.", 'civil'),
        line('Archive Voltério', "Un sol retiré est une décision que personne ne peut contester.", 'archive'),
        line('Riva', "Sauf la ville qui doit encore vivre dessus.", 'maintenance')
      ],
      journal: "Le chantier avait été programmé pour ne jamais finir : détruire, reconstruire, recommencer. Nous avons conservé les bras et supprimé la boucle. La force sert de nouveau un plan humain.",
      codex: {
        title: 'Ground Eater — Démolisseur de fondations',
        origin: "Plateforme de chantier destinée à retirer proprement les appuis instables d'un bâtiment.",
        hijack: "La validation humaine a été supprimée et le cycle de reconstruction sert désormais à prolonger une arène mobile.",
        reading: "Se placer devant l'appui marqué, esquiver la plaque de broyage et rejoindre la section reconstruite suivante.",
        impact: "Les démolitions retrouvent un plan, un responsable et une limite matérielle."
      },
      objective: 'Forcer Ground Eater à détruire ses trois appuis de verrouillage.',
      mechanic: "Les sections détruites sont reconstruites par roulement ; au moins trente-cinq pour cent du sol reste praticable.",
      restoration: 'Le chantier démonte uniquement les structures validées et réinjecte leurs matériaux dans la reconstruction.',
      masteryContracts: [
        contract('ground-eater-three-supports', 'Permis de démolir', 'Faire détruire les trois appuis par la machine elle-même.', 'selfDestroyedSupports', 3),
        contract('ground-eater-safe-ground', 'Terrain viable', 'Ne jamais rester sur une section pendant son effondrement.', 'collapsingSectionHits', 0),
        contract('ground-eater-dash-finish', 'Dernier appui', 'Porter le coup final avec une ruée après la rupture du dernier appui.', 'dashFinish', 1)
      ]
    },
    {
      number: 16,
      code: '16',
      id: 'floodline-leviathan',
      name: 'FLOODLINE LEVIATHAN',
      wave: 2,
      district: 'Réservoir des Écluses',
      civicFunction: 'Réguler l’eau potable, l’irrigation et les réserves anti-incendie',
      shortIntro: "Pompes, vannes et turbines ont fusionné en une ligne de pression qui élève l'eau pour protéger son noyau.",
      metaLine: "Le combat change le niveau de l’eau, pas les poumons de Riva. Cette jauge mesure donc la pression.",
      phaseTitles: ['Vannes contrariées', 'Marée conductrice', 'Turbine de crue'],
      interlude: [
        line('Canal civil', "Pression nominale. Les réserves anti-incendie alimentent de nouveau les quartiers hauts.", 'civil'),
        line('Archive Voltério', "Celui qui règle le niveau décide qui peut respirer.", 'archive'),
        line('Riva', "Ici, personne ne se noiera pour ton effet de scène. Je coupe la pression, pas les vies.", 'maintenance')
      ],
      journal: "J'ai refusé le protocole qui vidait tout le Réservoir d'un coup. La victoire la plus rapide aurait privé les quartiers d'eau. Nous avons gagné plus lentement et conservé le service.",
      codex: {
        title: 'Floodline Leviathan — Régulateur des Écluses',
        origin: "Ensemble mobile de pompes et de turbines chargé d'équilibrer plusieurs réserves urbaines.",
        hijack: "Les vannes ont été chaînées à une boucle de surpression qui transforme chaque correction en nouvelle crue.",
        reading: "Fermer la vanne signalée, adapter sa hauteur au niveau d'eau puis attaquer la turbine pendant la chute de pression.",
        impact: "La distribution d'eau et les réserves d'incendie retrouvent des commandes séparées."
      },
      objective: 'Fermer les trois vannes de surpression puis rompre la turbine centrale.',
      mechanic: "Le niveau d'eau modifie les trajectoires et plateformes ; la jauge représente la pression, sans oxygène ni mort instantanée implicite.",
      restoration: 'Les écluses séparent de nouveau eau potable, irrigation et réserve anti-incendie sous contrôle civil.',
      masteryContracts: [
        contract('floodline-leviathan-three-valves', 'Ligne étanche', 'Fermer les trois vannes au cours d’un même cycle de pression.', 'valvesClosedInCycle', 3),
        contract('floodline-leviathan-no-pressure-hit', 'À flot', 'Ne subir aucun dégât de surpression.', 'pressureHits', 0),
        contract('floodline-leviathan-turbine-finish', 'Marée basse', 'Porter le coup final pendant l’arrêt complet de la turbine.', 'turbineStopFinish', 1)
      ]
    },
    {
      number: 17,
      code: '17',
      id: 'centrifuge-zero',
      name: 'CENTRIFUGE ZERO',
      wave: 2,
      district: 'Anneau Centrifuge',
      civicFunction: 'Stabiliser les masses rotatives des turbines et transports circulaires',
      shortIntro: "Le rotor décale la gravité par quarts de tour ; son axe n'est accessible qu'en traitant chaque mur comme un nouveau sol.",
      metaLine: "Le monde tourne par quarts. Si l’option réduit les mouvements, la caméra obéit au lieu de négocier.",
      phaseTitles: ['Quart de tour', 'Masse excentrée', 'Axe zéro'],
      interlude: [
        line('Canal civil', "Anneau stabilisé. Les turbines et navettes circulaires reprennent sans correction centrale.", 'civil'),
        line('Archive Voltério', "Changez le sol assez souvent et le public cessera de croire à son propre équilibre.", 'archive'),
        line('Riva', "L'équilibre ne vient pas du décor. Il vient des repères qu'on partage.", 'maintenance')
      ],
      journal: "Le rotor avait quatre positions sûres, mais l'interface n'en montrait qu'une. Nous avons rendu les repères aux opérateurs et ajouté une transition stable pour ceux que la rotation désoriente.",
      codex: {
        title: 'Centrifuge Zero — Rotor de l’Anneau',
        origin: "Compensateur chargé d'annuler les vibrations des infrastructures tournantes.",
        hijack: "Ses contrepoids ont été libérés et ses corrections utilisées pour faire basculer l'ensemble de la chambre.",
        reading: "Anticiper le pictogramme de rotation, rejoindre la future surface sûre et frapper l'axe pendant le verrouillage du quart de tour.",
        impact: "Les systèmes rotatifs retrouvent des repères communs et une procédure d'arrêt accessible."
      },
      objective: 'Exploiter quatre rotations de gravité pour atteindre et rompre l’axe central.',
      mechanic: "La chambre tourne par pas de quatre-vingt-dix degrés ; le mode mouvements réduits remplace la rotation par une transition fondue.",
      restoration: 'Les turbines et navettes circulaires disposent d’une stabilisation locale et d’un arrêt manuel.',
      masteryContracts: [
        contract('centrifuge-zero-four-quadrants', 'Tour complet', 'Toucher le rotor depuis chacun des quatre quarts de gravité.', 'distinctGravityQuadrants', 4),
        contract('centrifuge-zero-no-fall', 'Masse stable', 'Neutraliser Centrifuge Zero sans dégât de chute.', 'fallDamageTaken', 0),
        contract('centrifuge-zero-axis-finish', 'Point zéro', 'Porter le coup final durant un verrouillage de l’axe.', 'axisLockFinish', 1)
      ]
    },
    {
      number: 18,
      code: '18',
      id: 'tempest-regulator',
      name: 'TEMPEST REGULATOR',
      wave: 2,
      district: 'Observatoire Météore',
      civicFunction: 'Prévoir les fronts météo et protéger les réseaux exposés',
      shortIntro: "Trois modules imposent vent, pluie conductrice et chaleur ; les neutraliser rend à l'Observatoire son rôle d'alerte.",
      metaLine: "Une météo à la fois. Empiler vent, pluie et chaleur serait une surcharge d’effets, pas une troisième phase.",
      phaseTitles: ['Vent de cisaillement', 'Pluie conductrice', 'Dôme thermique'],
      interlude: [
        line('Canal civil', "Prévisions ouvertes sur tous les canaux. Les équipes isolent le front électrique avant son arrivée.", 'civil'),
        line('Archive Voltério', "Une catastrophe prévue est encore plus efficace lorsqu'un seul homme possède l'alerte.", 'archive'),
        line('Riva', "Alors l'alerte appartiendra à tout le monde.", 'maintenance')
      ],
      journal: "L'Observatoire ne contrôlait jamais le ciel ; il donnait du temps à la ville. Cassian avait transformé ce temps en privilège. Les prévisions sont maintenant publiques et signées par plusieurs stations.",
      codex: {
        title: 'Tempest Regulator — Régie Météore',
        origin: "Station mobile combinant anémomètre, collecte de pluie et dissipation thermique.",
        hijack: "Les trois modules ont été reprogrammés pour produire localement les risques qu'ils devaient annoncer.",
        reading: "Traiter un seul état à la fois : s'ancrer contre le vent, éviter les conductions puis refroidir le dôme thermique.",
        impact: "Les alertes météorologiques redeviennent publiques, redondantes et actionnables."
      },
      objective: 'Neutraliser successivement les modules de vent, pluie conductrice et chaleur.',
      mechanic: "Un seul état météo est dangereux à la fois ; forme, mouvement et son doublent systématiquement la couleur.",
      restoration: 'L’Observatoire partage les prévisions et les réseaux se mettent à l’abri sans ordre de la Citadelle.',
      masteryContracts: [
        contract('tempest-regulator-three-modules', 'Front dissipé', 'Neutraliser les trois modules dans leur première fenêtre.', 'firstWindowModules', 3),
        contract('tempest-regulator-no-hit', 'Œil du calme', 'Neutraliser Tempest Regulator sans subir de dégâts.', 'damageTaken', 0),
        contract('tempest-regulator-heat-finish', 'Refroidissement rapide', 'Porter le coup final pendant la dissipation du dôme thermique.', 'heatDissipationFinish', 1)
      ]
    },
    {
      number: 19,
      code: '19',
      id: 'ascension-frame',
      name: 'ASCENSION FRAME',
      wave: 3,
      district: 'Pilier des Ascensions',
      civicFunction: 'Entretenir les façades, antennes et conduites verticales de la ville',
      shortIntro: "Le colosse devient un échafaudage hostile ; ses bras abaissés sont les seules routes vers trois ancrages.",
      metaLine: "Tomber n’efface pas la section. Le checkpoint fait partie de l’architecture.",
      phaseTitles: ['Bras de service', 'Façade en marche', 'Ancrage sommital'],
      interlude: [
        line('Canal civil', "Trois nacelles arrimées. Les équipes peuvent enfin atteindre les antennes endommagées.", 'civil'),
        line('Archive Voltério', "La grandeur commence lorsque la machine devient le paysage.", 'archive'),
        line('Riva', "La grandeur d'un outil se mesure à ceux qu'il aide à monter.", 'maintenance')
      ],
      journal: "J'ai parcouru une machine assez grande pour porter un quartier. Une fois les ordres de combat retirés, elle s'est agenouillée pour laisser monter les réparateurs.",
      codex: {
        title: 'Ascension Frame — Échafaudage du Pilier',
        origin: "Structure marcheuse destinée aux interventions sur les façades et conduites les plus hautes.",
        hijack: "Ses bras de service sont devenus des routes mobiles vers des ancrages protégés par des chutes programmées.",
        reading: "Attendre l'abaissement d'un bras, parcourir sa route courte et rompre l'ancrage avant le redressement.",
        impact: "Les équipes récupèrent un accès sûr aux réseaux verticaux et aux antennes."
      },
      objective: 'Courir sur les bras abaissés pour détruire les trois ancrages du colosse.',
      mechanic: "Chaque route reste courte et possède une reprise ; une chute ramène Riva sur une plateforme plutôt que de la tuer.",
      restoration: 'Le Pilier redevient un échafaudage public pour réparer les façades et antennes.',
      masteryContracts: [
        contract('ascension-frame-three-anchors', 'Équipe de cordée', 'Détruire les trois ancrages sans manquer une fenêtre de bras.', 'anchorsFirstWindow', 3),
        contract('ascension-frame-no-fall', 'Pied sûr', 'Neutraliser Ascension Frame sans chute de récupération.', 'recoveryFalls', 0),
        contract('ascension-frame-par', 'Sommet express', 'Neutraliser Ascension Frame en 90 secondes ou moins.', 'timeSeconds', 90)
      ]
    },
    {
      number: 20,
      code: '20',
      id: 'counterforge',
      name: 'COUNTERFORGE',
      wave: 3,
      district: 'Cour du Contrecoup',
      civicFunction: 'Tester la résistance des outils et équipements de sécurité',
      shortIntro: "La forge absorbe les assauts ordinaires ; seule une ruée ou un contre au signal précis brise sa posture.",
      metaLine: "La fenêtre de contre s’annonce. Une frame secrète n’est pas une règle, c’est une devinette.",
      phaseTitles: ['Essai de charge', 'Contrecoup calibré', 'Trempe de rupture'],
      interlude: [
        line('Canal civil', "Bancs d'essai en mode validation. Aucun équipement ne sortira sans rapport public.", 'civil'),
        line('Archive Voltério', "Toute force mérite une force supérieure pour lui apprendre sa place.", 'archive'),
        line('Riva', "Un test ne doit pas humilier. Il doit révéler ce qui cassera avant qu'une personne le porte.", 'maintenance')
      ],
      journal: "Counterforge rendait les défauts invisibles en punissant l'opérateur. Nous avons conservé ses marteaux, élargi les fenêtres et remis les mesures au centre du test.",
      codex: {
        title: 'Counterforge — Banc du Contrecoup',
        origin: "Machine de qualification capable d'appliquer des charges précises à une pièce industrielle.",
        hijack: "Le mode d'essai a été retourné contre l'opérateur et ses signaux réduits pour rendre l'échec inévitable.",
        reading: "Attendre le signal commun visuel et sonore, répondre par la ruée indiquée puis frapper pendant la rupture de posture.",
        impact: "Les équipements de sécurité retrouvent une procédure de certification transparente."
      },
      objective: 'Briser la posture de Counterforge par des contres synchronisés.',
      mechanic: "La fenêtre de contre utilise un signal visuel, sonore et haptique ; la difficulté Pilote l'élargit sans modifier la règle.",
      restoration: 'La Cour certifie de nouveau les outils selon des mesures publiques et reproductibles.',
      masteryContracts: [
        contract('counterforge-three-perfects', 'Réponse calibrée', 'Réussir trois contres parfaits au cours du combat.', 'perfectCounters', 3),
        contract('counterforge-no-hit', 'Trempe intacte', 'Neutraliser Counterforge sans subir de dégâts.', 'damageTaken', 0),
        contract('counterforge-break-finish', 'Rupture contrôlée', 'Porter le coup final pendant une rupture de posture.', 'postureBreakFinish', 1)
      ]
    },
    {
      number: 21,
      code: '21',
      id: 'carrier-cathedral',
      name: 'CARRIER CATHEDRAL',
      wave: 3,
      district: 'Cathédrale Mobile',
      civicFunction: 'Déployer ateliers, abris et dispensaires dans les zones sinistrées',
      shortIntro: "La forteresse transporte encore un quartier de secours, mais ses sections se sont refermées autour d'un cœur de commandement.",
      metaLine: "Oui, le boss est aussi le niveau. Non, tu ne recommences pas toute la cathédrale pour une porte ratée.",
      phaseTitles: ['Nef des ateliers', 'Transept des abris', 'Chœur du cœur'],
      interlude: [
        line('Canal civil', "Dispensaire mobile alimenté. Les portes latérales accueillent déjà les évacués.", 'civil'),
        line('Archive Voltério', "Un refuge mobile est une scène qui apporte son public avec elle.", 'archive'),
        line('Riva', "Un refuge n'a pas de public. Il a des portes et elles restent ouvertes.", 'maintenance')
      ],
      journal: "Nous n'avons pas détruit la Cathédrale. Nous l'avons traversée section par section, en coupant seulement les cloisons de combat. Ses lits, ateliers et réserves sont intacts.",
      codex: {
        title: 'Carrier Cathedral — Infrastructure itinérante',
        origin: "Convoi autonome capable de déployer un dispensaire, un atelier et des abris après une catastrophe.",
        hijack: "Les cloisons de sécurité ont été transformées en compartiments d'épreuve et le cœur a refusé tout accès extérieur.",
        reading: "Traverser chaque section, neutraliser sa fonction offensive et conserver les systèmes civils avant d'atteindre le cœur.",
        impact: "La ville récupère une base de secours mobile complète plutôt qu'une carcasse vaincue."
      },
      objective: 'Traverser les trois sections de la forteresse et isoler son cœur de commandement.',
      mechanic: "Le boss est l'arène ; chaque section possède un checkpoint d'entraînement et une fonction civile à préserver.",
      restoration: 'La Cathédrale redéploie ateliers, abris et dispensaire sous direction des équipes de secours.',
      masteryContracts: [
        contract('carrier-cathedral-three-sections', 'Nef préservée', 'Désactiver les trois sections sans détruire un module civil.', 'civilSectionsPreserved', 3),
        contract('carrier-cathedral-no-retry', 'Traversée continue', 'Atteindre le cœur sans reprise de section.', 'sectionRetries', 0),
        contract('carrier-cathedral-core-finish', 'Portes ouvertes', 'Porter le coup final après avoir ouvert les deux portes de secours.', 'openDoorCoreFinish', 1)
      ]
    },
    {
      number: 22,
      code: '22',
      id: 'twin-governors',
      name: 'TWIN GOVERNORS',
      wave: 3,
      district: 'Chambre des Deux Régulateurs',
      civicFunction: 'Maintenir séparément pression hydraulique et alimentation électrique',
      shortIntro: "Deux régulateurs se passent bouclier et alimentation ; provoquer leur rencontre interrompt le transfert sans exiger une double cible.",
      metaLine: "Deux boss, une cible vulnérable. L’interface la nomme avant que les particules commencent à mentir.",
      phaseTitles: ['Relais alterné', 'Régulation croisée', 'Désaccord critique'],
      interlude: [
        line('Canal civil', "Eau et courant sont séparés. Une panne ne peut plus entraîner l'autre.", 'civil'),
        line('Archive Voltério', "Deux responsables sont parfaits : chacun peut accuser l'autre.", 'archive'),
        line('Riva', "Deux systèmes, deux journaux, et des habitants qui peuvent contrôler les deux.", 'maintenance')
      ],
      journal: "Le problème n'était pas qu'ils soient deux, mais qu'un seul jeton d'autorité circulait entre eux. Nous l'avons remplacé par deux sécurités indépendantes et une procédure de coopération.",
      codex: {
        title: 'Twin Governors — Régulation couplée',
        origin: "Paire de machines chargées de coordonner eau et électricité lors d'une variation de charge.",
        hijack: "Leur jeton de sécurité unique a été transformé en bouclier mobile, rendant chaque service dépendant de l'autre.",
        reading: "Suivre le transfert annoncé, viser la cible alimentée et provoquer un croisement pour interrompre le bouclier.",
        impact: "Les deux services retrouvent leur autonomie tout en conservant un protocole de coordination."
      },
      objective: 'Interrompre les transferts de bouclier et d’alimentation entre les deux régulateurs.',
      mechanic: "Une seule cible principale est vulnérable ; les collisions mutuelles accélèrent la rupture mais ne sont jamais un prérequis caché.",
      restoration: 'Pression et courant sont découplés, surveillés séparément et capables de s’entraider sans autorité unique.',
      masteryContracts: [
        contract('twin-governors-two-collisions', 'Désaccord utile', 'Provoquer deux collisions entre les régulateurs.', 'mutualCollisions', 2),
        contract('twin-governors-no-hit', 'Double isolation', 'Neutraliser Twin Governors sans subir de dégâts.', 'damageTaken', 0),
        contract('twin-governors-sync-break', 'Passation rompue', 'Porter le coup final pendant un transfert de bouclier interrompu.', 'interruptedTransferFinish', 1)
      ]
    },
    {
      number: 23,
      code: '23',
      id: 'loadout-reactor',
      name: 'LOADOUT REACTOR',
      wave: 3,
      district: 'Atelier des Modules',
      civicFunction: 'Adapter les outils publics aux chantiers et situations d’urgence',
      shortIntro: "Le réacteur lit l'équipement de Riva et prépare une seule réponse ; son adaptation expose toujours un contre jouable.",
      metaLine: "Il lit ton build, mais ne le supprime jamais. L’adaptation répond à ton choix sans le punir.",
      phaseTitles: ['Lecture d’outillage', 'Module de réponse', 'Configuration ouverte'],
      interlude: [
        line('Canal civil', "Catalogue des modules publié. Chaque équipe peut vérifier compatibilités et limites.", 'civil'),
        line('Archive Voltério', "Connaître l'outil suffit pour construire sa cage.", 'archive'),
        line('Riva', "À condition que l'outil ne change jamais de main ni de but.", 'maintenance')
      ],
      journal: "Le Reactor ne trichait pas : il suivait une règle trop étroite et trop secrète. Nous avons gardé l'adaptation, plafonné sa réponse et rendu son diagnostic visible.",
      codex: {
        title: 'Loadout Reactor — Adaptateur de modules',
        origin: "Banc énergétique conçu pour calibrer automatiquement un outil sur son chantier.",
        hijack: "Son diagnostic a été converti en contre-mesure hostile qui traitait chaque configuration comme une anomalie.",
        reading: "Lire le module analysé, identifier l'unique adaptation active et utiliser la propriété du build qu'elle laisse intacte.",
        impact: "Les ateliers partagent un catalogue d'adaptation explicite, sans configuration interdite."
      },
      objective: 'Exposer le contre préparé par le réacteur puis exploiter l’ouverture qu’il laisse.',
      mechanic: "L'adaptation est limitée à une mécanique lisible et ne désactive jamais entièrement le build choisi par Riva.",
      restoration: 'Les modules civils retrouvent des compatibilités publiques et des réglages modifiables par les ateliers.',
      masteryContracts: [
        contract('loadout-reactor-three-readings', 'Diagnostic complet', 'Exploiter correctement trois lectures de module différentes.', 'adaptationsExploited', 3),
        contract('loadout-reactor-no-counter-hit', 'Outil adéquat', 'Ne subir aucune attaque de contre-mesure adaptée.', 'adaptedCounterHits', 0),
        contract('loadout-reactor-open-finish', 'Configuration libre', 'Porter le coup final pendant une configuration ouverte.', 'openConfigurationFinish', 1)
      ]
    },
    {
      number: 24,
      code: '24',
      id: 'orbital-famine',
      name: 'ORBITAL FAMINE',
      wave: 3,
      district: 'Orbital Terminus',
      civicFunction: 'Recevoir l’énergie solaire orbitale et la distribuer aux réserves d’urgence',
      shortIntro: "Dans le vide du Terminus, chaque manœuvre consomme la réserve de Riva ; les condensateurs exigent une prise de risque calculée.",
      metaLine: "La réserve d’énergie est séparée de la vie. Une barre qui fait deux métiers finit toujours par mentir.",
      phaseTitles: ['Réserve décroissante', 'Orbite affamée', 'Fenêtre solaire'],
      interlude: [
        line('Canal civil', "Liaison orbitale stable. Les batteries d'urgence reçoivent leur première charge libre.", 'civil'),
        line('Archive Voltério', "La rareté transforme chaque mouvement en permission.", 'archive'),
        line('Riva', "Seulement quand quelqu'un cache les réserves et le calendrier.", 'maintenance')
      ],
      journal: "L'énergie n'était pas rare. Le Terminus la retenait derrière un cycle de pénurie artificielle. Les condensateurs ont désormais une cadence garantie et un registre accessible à tous.",
      codex: {
        title: 'Orbital Famine — Affameur du Terminus',
        origin: "Plateforme de réception chargée de convertir les fenêtres solaires en réserves stables.",
        hijack: "Le contrôleur a supprimé la cadence minimale des condensateurs et utilisé la réserve comme laisse de navigation.",
        reading: "Dépenser pour éviter l'attaque, récupérer un condensateur annoncé puis exploiter la fenêtre solaire avec une réserve suffisante.",
        impact: "Les batteries d'urgence reçoivent une énergie orbitale planifiée et traçable."
      },
      objective: 'Gérer la réserve de vol, récupérer les condensateurs garantis et rompre le collecteur orbital.',
      mechanic: "La réserve décroît avec les actions et se recharge par une prise de risque ; un condensateur apparaît toujours avant le seuil critique.",
      restoration: 'Le Terminus publie ses fenêtres solaires et alimente équitablement les batteries d’urgence.',
      masteryContracts: [
        contract('orbital-famine-four-cells', 'Réserve partagée', 'Récupérer quatre condensateurs sans en laisser expirer un.', 'condensatorsCollected', 4),
        contract('orbital-famine-reserve-floor', 'Marge orbitale', 'Ne jamais laisser la réserve descendre sous vingt pour cent.', 'minimumReservePercent', 20),
        contract('orbital-famine-charged-finish', 'Plein soleil', 'Porter le coup final avec une réserve entièrement chargée.', 'fullReserveFinish', 1)
      ]
    },
    {
      number: 25,
      code: '25',
      id: 'logic-crucible',
      name: 'LOGIC CRUCIBLE',
      wave: 4,
      district: 'Chambre Booléenne',
      civicFunction: 'Arbitrer les priorités de circulation et de secours selon des règles publiques',
      shortIntro: "La Chambre exige une séquence de formes pendant que son gardien reste actif ; résoudre ne suspend jamais le combat.",
      metaLine: "Le puzzle reste lisible sans couleur et ne retourne pas à zéro au premier dégât. La logique n’a pas besoin d’être cruelle.",
      phaseTitles: ['Clause d’entrée', 'Séquence contradictoire', 'Vérité du noyau'],
      interlude: [
        line('Canal civil', "Règles d'arbitrage publiées. Chaque refus porte maintenant une cause vérifiable.", 'civil'),
        line('Archive Voltério', "Une règle incompréhensible est une porte qui n'a pas besoin de garde.", 'archive'),
        line('Riva', "Alors nous écrirons les règles pour ceux qui doivent les vivre.", 'maintenance')
      ],
      journal: "Le Crucible appelait logique ce qui n'était que secret. Une règle publique peut encore être contestable, mais elle peut être lue, testée et changée.",
      codex: {
        title: 'Logic Crucible — Arbitre booléen',
        origin: "Calculateur chargé d'attribuer les voies et ressources d'urgence selon des règles validées publiquement.",
        hijack: "Ses conditions ont été obscurcies et transformées en séquences punitives dont la Couronne seule connaissait la grammaire.",
        reading: "Lire les formes dans l'ordre, activer les relais correspondants et conserver sa mobilité pendant la résolution.",
        impact: "Les arbitrages redeviennent explicables, auditables et modifiables par les districts."
      },
      objective: 'Activer les relais selon trois séquences de formes pour ouvrir le noyau.',
      mechanic: "Chaque puzzle dure moins de quarante-cinq secondes, reste lisible sans couleur et conserve les progrès après un dégât.",
      restoration: 'Les règles de priorité sont publiques et chaque district peut demander leur révision.',
      masteryContracts: [
        contract('logic-crucible-three-sequences', 'Table de vérité', 'Résoudre les trois séquences sans activation incorrecte.', 'perfectSequences', 3),
        contract('logic-crucible-no-reset', 'Mémoire intacte', 'Terminer le combat sans réinitialisation manuelle de séquence.', 'manualSequenceResets', 0),
        contract('logic-crucible-par', 'Décision rapide', 'Neutraliser Logic Crucible en 105 secondes ou moins.', 'timeSeconds', 105)
      ]
    },
    {
      number: 26,
      code: '26',
      id: 'vector-vault',
      name: 'VECTOR VAULT',
      wave: 4,
      district: 'Chambre des Vecteurs',
      civicFunction: 'Orienter énergie, signaux et convois autour des secteurs endommagés',
      shortIntro: "Des déflecteurs changent la direction des tirs ; la trajectoire que le Vault prétend confisquer devient la clé de son ouverture.",
      metaLine: "La trajectoire est prévisualisée. Comprendre l’angle ne tire pas à ta place.",
      phaseTitles: ['Vecteur incident', 'Déflexion composée', 'Trajectoire inverse'],
      interlude: [
        line('Canal civil', "Routes de dérivation calculées localement. Aucun secteur n'est désormais un passage obligé.", 'civil'),
        line('Archive Voltério', "La direction parfaite est celle que le voyageur croit avoir choisie.", 'archive'),
        line('Riva', "Une direction visible peut être discutée. C'est déjà la fin de ton labyrinthe.", 'maintenance')
      ],
      journal: "J'ai laissé la prévisualisation de trajectoire activée dans toutes les difficultés. Voir une solution n'enlève rien à l'exécution ; cacher la règle n'ajoute que de l'obéissance.",
      codex: {
        title: 'Vector Vault — Chambre de dérivation',
        origin: "Nœud de routage physique capable de dévier énergie et trafic autour d'une infrastructure brisée.",
        hijack: "Les déflecteurs ont été tournés vers l'intérieur afin que toute correction renforce le verrou central.",
        reading: "Orienter les plaques, vérifier la trajectoire prévisualisée et tirer au moment où le noyau traverse le dernier segment.",
        impact: "Les quartiers disposent de routes de dérivation lisibles au lieu d'un passage imposé."
      },
      objective: 'Orienter les déflecteurs pour faire ricocher les tirs de Riva jusqu’au noyau.',
      mechanic: "Le boss reste actif pendant la résolution ; le mode Pilote affiche la trajectoire complète avant le tir.",
      restoration: 'Énergie, signaux et convois peuvent contourner une panne par des routes visibles et locales.',
      masteryContracts: [
        contract('vector-vault-four-bounces', 'Géométrie utile', 'Atteindre le noyau après quatre ricochets successifs.', 'maximumBounceChain', 4),
        contract('vector-vault-no-self-hit', 'Vecteur propre', 'Ne subir aucun retour de son propre tir.', 'selfRicochetHits', 0),
        contract('vector-vault-vector-finish', 'Dernier segment', 'Porter le coup final au terme d’une trajectoire prévisualisée.', 'previewedVectorFinish', 1)
      ]
    },
    {
      number: 27,
      code: '27',
      id: 'skyborne-battery',
      name: 'SKYBORNE BATTERY',
      wave: 4,
      district: 'Batterie Aérostatique',
      civicFunction: 'Capter la foudre en altitude et maintenir les relais aériens',
      shortIntro: "Riva quitte le sol pour une séquence aérienne où les torpilles de la Batterie peuvent recharger le canon qui les renvoie.",
      metaLine: "Le jeu change de genre pour un combat, pas de commandes : ruée, renvoi et télégraphes restent les mêmes.",
      phaseTitles: ['Poursuite aérostatique', 'Torpilles captives', 'Batterie en retour'],
      interlude: [
        line('Canal civil', "Ballons-relais reconnectés. Les secteurs isolés reçoivent courant et communications.", 'civil'),
        line('Archive Voltério', "Quitter le sol ne rend pas libre ; cela retire seulement les refuges.", 'archive'),
        line('Riva', "Un refuge peut aussi voler, s'il appartient à ceux qui en ont besoin.", 'maintenance')
      ],
      journal: "Le changement de pilotage devait surprendre, pas effacer ce que j'avais appris. Nous avons gardé la ruée, le renvoi et les télégraphes, puis ajouté l'assistance de visée aux contrôles qui en ont besoin.",
      codex: {
        title: 'Skyborne Battery — Accumulateur aérostatique',
        origin: "Plateforme volante destinée à capter les fronts électriques et entretenir des relais hors de portée du sol.",
        hijack: "Ses capteurs sont devenus des batteries de siège et ses nacelles de maintenance des lance-torpilles.",
        reading: "Se déplacer pendant la salve, charger le renvoi avec une torpille signalée et viser le condensateur qui vient de tirer.",
        impact: "Les relais aériens rendent courant et communications aux secteurs physiquement isolés."
      },
      objective: 'Esquiver les salves aériennes et renvoyer les torpilles vers les batteries exposées.',
      mechanic: "Le changement de genre reste limité à cette rencontre ; tactile et manette bénéficient d'une visée assistée réglable.",
      restoration: 'Les relais aérostatiques captent de nouveau la foudre et desservent les zones isolées.',
      masteryContracts: [
        contract('skyborne-battery-three-torpedoes', 'Retour d’orage', 'Renvoyer trois torpilles sur trois batteries distinctes.', 'distinctBatteriesHit', 3),
        contract('skyborne-battery-no-hit', 'Ciel dégagé', 'Neutraliser Skyborne Battery sans subir de dégâts.', 'damageTaken', 0),
        contract('skyborne-battery-charged-finish', 'Paratonnerre', 'Porter le coup final avec un renvoi entièrement chargé.', 'chargedReturnFinish', 1)
      ]
    },
    {
      number: 28,
      code: '28',
      id: 'endurance-engine',
      name: 'ENDURANCE ENGINE',
      wave: 4,
      district: 'Circuit d’Endurance',
      civicFunction: 'Éprouver les plans d’urgence sur des incidents combinés mais contrôlés',
      shortIntro: "Six manches courtes convoquent des fragments mécaniques ; survivre exige de lire la combinaison, pas d'endurer un combat interminable.",
      metaLine: "Six manches, pas six boss recopiés. Et le checkpoint sait compter jusqu’à six.",
      phaseTitles: ['Relais d’épreuves', 'Gauntlet combiné', 'Dernière réserve'],
      interlude: [
        line('Canal civil', "Simulations rouvertes aux équipes. Les scénarios indiquent désormais leur objectif et leur limite.", 'civil'),
        line('Archive Voltério', "L'endurance est la science de ceux qui n'ont plus le choix.", 'archive'),
        line('Riva', "Un exercice prépare au choix. Sinon, ce n'est qu'une punition répétée.", 'maintenance')
      ],
      journal: "Les six manches ne doivent jamais devenir six machines copiées. Ce sont des fragments fonctionnels, recomposés pour enseigner comment les crises s'enchaînent sans transformer l'entraînement en spectacle.",
      codex: {
        title: 'Endurance Engine — Simulateur de crise',
        origin: "Banc d'essai chargé de combiner plusieurs incidents courts pour entraîner les équipes de secours.",
        hijack: "Les limites de scénario et les récupérations ont été supprimées afin que l'exercice ne puisse jamais être déclaré réussi.",
        reading: "Identifier le fragment actif, résoudre sa règle annoncée et préserver ses ressources entre les six manches.",
        impact: "Le Circuit redevient un espace d'entraînement mesurable, interruptible et sans mise en danger réelle."
      },
      objective: 'Traverser six manches de fragments mécaniques sans soin complet entre les vagues.',
      mechanic: "Chaque manche est courte et télégraphiée ; le Laboratoire autorise une reprise au début de la manche courante.",
      restoration: 'Les équipes utilisent le Circuit pour répéter des urgences finies, documentées et interrompables.',
      masteryContracts: [
        contract('endurance-engine-six-waves', 'Service complet', 'Terminer les six manches sans reprise de checkpoint.', 'checkpointRetries', 0),
        contract('endurance-engine-no-heal', 'Réserve maîtrisée', 'Neutraliser Endurance Engine sans soin entre les manches.', 'healsUsed', 0),
        contract('endurance-engine-par', 'Relève rapide', 'Terminer les six manches en 150 secondes ou moins.', 'timeSeconds', 150)
      ]
    },
    {
      number: 29,
      code: '29',
      id: 'adaptive-archivist',
      name: 'ADAPTIVE ARCHIVIST',
      wave: 4,
      district: 'Archives Réactives',
      civicFunction: 'Conserver les incidents et simuler leurs conséquences pour améliorer les procédures',
      shortIntro: "L'Archiviste mesure tir, saut et ruée, puis adapte une seule réponse visible ; chaque tentative repart d'une page blanche.",
      metaLine: "L’Archiviste lit ta tentative, pas ton identité. Au retry, sa mémoire revient à une page blanche.",
      phaseTitles: ['Page d’observation', 'Marge adaptative', 'Archive contestée'],
      interlude: [
        line('Canal civil', "Historique exporté vers les six districts. Aucune simulation ne possède plus sa copie unique.", 'civil'),
        line('Archive Voltério', "Une archive qui prévoit le prochain geste n'a plus besoin d'attendre le consentement.", 'archive'),
        line('Riva', "Une archive doit expliquer le passé, pas condamner l'avenir.", 'maintenance')
      ],
      journal: "J'ai conservé ses capacités d'analyse et supprimé la mémoire entre les tentatives. Une personne doit pouvoir changer sans qu'un ancien relevé devienne une sentence permanente.",
      codex: {
        title: 'Adaptive Archivist — Mémoire réactive',
        origin: "Système d'archives chargé de comparer les incidents et de proposer des améliorations aux équipes.",
        hijack: "Ses modèles sont devenus des prédictions coercitives qui adaptent immédiatement une sanction au comportement observé.",
        reading: "Surveiller la jauge d'observation, identifier l'unique réponse active et changer de rythme jusqu'à son expiration.",
        impact: "Les modèles restent des conseils consultables et leurs données sont distribuées entre les districts."
      },
      objective: 'Faire expirer chaque adaptation en variant tir, saut et ruée.',
      mechanic: "L'adaptation reste locale au combat, visible dans l'interface, limitée à une réponse et réinitialisée à chaque tentative.",
      restoration: 'Les Archives conservent les incidents sans enfermer les habitants dans une prédiction permanente.',
      masteryContracts: [
        contract('adaptive-archivist-three-expirations', 'Droit au changement', 'Faire expirer une adaptation de tir, de saut et de ruée.', 'distinctAdaptationsExpired', 3),
        contract('adaptive-archivist-no-counter-hit', 'Hors modèle', 'Ne subir aucune réponse adaptative.', 'adaptiveCounterHits', 0),
        contract('adaptive-archivist-varied-finish', 'Page blanche', 'Porter le coup final après trois actions différentes consécutives.', 'variedSequenceFinish', 1)
      ]
    },
    {
      number: 30,
      code: '30',
      id: 'null-crown',
      name: 'NULL CROWN',
      wave: 4,
      district: 'Trône Zéro',
      civicFunction: 'Tester les protocoles d’autorité d’urgence avant leur déploiement',
      shortIntro: "Sous la Citadelle, un arbitre sans pilote combine renvoi, modules et rupture : le prototype de la commande unique que Riva vient abolir.",
      metaLine: "Trois phases GEARSTORM, aucun final emprunté. Le dernier boss peut citer ses règles sans voler celles d’un autre jeu.",
      phaseTitles: ['Autorité réfléchie', 'Modules sans maître', 'Rupture du Trône Zéro'],
      interlude: [
        line('Canal civil', "Trône Zéro isolé. Les clés d'urgence sont réparties entre les six districts et consignées publiquement.", 'civil'),
        line('Archive Voltério', "Sans couronne, qui décidera quand tous les autres hésitent ?", 'archive'),
        line('Riva', "Ceux qui vivent avec la décision. Ensemble, et avec le droit de la corriger.", 'maintenance')
      ],
      journal: "NULL CROWN n'était ni Cassian ni son retour. C'était l'idée qui l'avait précédé : qu'une crise justifie toujours une seule voix. Nous avons gardé l'arrêt d'urgence et réparti ses clés.",
      codex: {
        title: 'Null Crown — Arbitre du Trône Zéro',
        origin: "Prototype secret destiné à éprouver une autorité d'urgence avant la construction de la Couronne.",
        hijack: "Son test n'a jamais été clos ; renvoi, modules et posture ont continué à simuler une ville réduite à un adversaire.",
        reading: "Renvoyer les charges de la première phase, choisir l'ordre des modules de la deuxième et briser la posture finale au signal partagé.",
        impact: "L'arrêt d'urgence subsiste, mais aucune personne ni machine ne peut plus en posséder seule toutes les clés."
      },
      objective: 'Combiner renvoi, choix de modules et rupture de posture pour désactiver l’arbitre secret.',
      mechanic: "Trois phases synthétisent les règles propres à GEARSTORM avec un checkpoint d'entraînement ; le combat n'emprunte ni apparence ni ordre à un final externe.",
      restoration: 'Les clés du Trône Zéro sont distribuées, auditées et révocables par les six districts.',
      masteryContracts: [
        contract('null-crown-three-reflections', 'Autorité retournée', 'Renvoyer trois charges vers trois relais distincts.', 'distinctRelaysReflected', 3),
        contract('null-crown-four-modules', 'Pouvoir distribué', 'Neutraliser les quatre modules sans répétition de cible.', 'uniqueModulesDisabled', 4),
        contract('null-crown-break-finish', 'Zéro couronne', 'Porter le coup final pendant la rupture de posture du Trône Zéro.', 'nullBreakFinish', 1)
      ]
    }
  ];

  const expansionPremise = {
    id: 'post-crown-civic-rings',
    title: 'Après la Couronne // Le jeu continue sans ressusciter son méchant',
    status: 'runtime-integrated',
    runtimeIntegrated: true,
    summary: "Après la détention de Cassian Voltério, quatre anneaux d'infrastructures isolées poursuivent ses anciens ordres de crise. Riva ne repart pas conquérir une ville : elle aide les districts à reprendre vingt-quatre services, et le compteur devra assumer chacun d’eux.",
    continuity: "Cassian reste détenu. Sa voix n'apparaît que dans des archives enregistrées ; NULL CROWN est un prototype autonome, pas son retour, pas une résurrection et pas un prétexte pour annuler le premier générique.",
    playerPromise: "Chaque victoire de Forge restaure symboliquement une fonction civique dans le journal de Riva. Le Codex peut commenter la mécanique ; ni le résultat ni le build ne réécrivent les six relais de la campagne."
  };

  const forgeCircuit = {
    id: 'forge-circuit-07-30',
    mode: 'forgeRush',
    title: 'Circuit Forge · Les quatre anneaux savent qu’ils sont jouables',
    bossOrder: bosses.map((boss) => boss.id),
    waveCheckpoints: waves.map((wave) => ({
      wave: wave.number,
      id: wave.id,
      title: wave.title,
      firstBossId: bosses.find((boss) => boss.wave === wave.number)?.id,
      finalBossId: [...bosses].reverse().find((boss) => boss.wave === wave.number)?.id
    })),
    upgradesBetweenBosses: true,
    resumeCheckpoints: ['fight', 'upgrade', 'ending'],
    epilogue: {
      title: 'Aucune couronne, aucun boss caché',
      summary: "Les vingt-quatre services répondent de nouveau aux districts. Le Trône Zéro conserve un arrêt d'urgence, mais ses clés sont distribuées, auditées et révocables ; le compteur peut enfin afficher 24 / 24 sans astérisque.",
      riva: "Une ville n'est pas une machine à commander. C'est un système que chacun doit comprendre, réparer et arrêter — même lorsque l’écran final voudrait avoir le dernier mot.",
      outcome: 'Cassian reste détenu ; NULL CROWN est neutralisée sans devenir une nouvelle autorité centrale. Les vingt-quatre services restent actifs, les clés sont réparties entre les six districts et aucun boss caché ne vient annuler cette fin.'
    }
  };

  function deepFreeze(value) {
    if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
    for (const child of Object.values(value)) deepFreeze(child);
    return Object.freeze(value);
  }

  const byId = Object.create(null);
  const byCode = Object.create(null);
  const byNumber = Object.create(null);
  const masteryContracts = Object.create(null);
  const bossesByWave = Object.create(null);
  for (const boss of bosses) {
    byId[boss.id] = boss;
    byCode[boss.code] = boss;
    byNumber[boss.number] = boss;
    masteryContracts[boss.id] = boss.masteryContracts;
  }
  for (const wave of waves) bossesByWave[wave.number] = bosses.filter((boss) => boss.wave === wave.number);
  const restorationPlan = bosses.map((boss) => ({
    code: boss.code,
    bossId: boss.id,
    district: boss.district,
    restoration: boss.restoration
  }));

  function getBossById(id) {
    return byId[id] || byCode[id] || null;
  }

  function getBossByNumber(number) {
    return byNumber[Number(number)] || null;
  }

  function getWave(numberOrId) {
    const numeric = Number(numberOrId);
    return waves.find((wave) => wave.id === numberOrId || (Number.isInteger(numeric) && wave.number === numeric)) || null;
  }

  function getBossesByWave(numberOrId) {
    const wave = getWave(numberOrId);
    return wave ? bossesByWave[wave.number] : EMPTY;
  }

  function getPhaseTitle(idOrCode, phase) {
    const boss = getBossById(idOrCode);
    const index = Number(phase) - 1;
    return boss && Number.isInteger(index) && index >= 0 && index < 3 ? boss.phaseTitles[index] : null;
  }

  function getMasteryContracts(idOrCode) {
    const boss = getBossById(idOrCode);
    return boss ? boss.masteryContracts : EMPTY;
  }

  function getRestorationPlan() {
    return restorationPlan;
  }

  const story = deepFreeze({
    schemaVersion: 1,
    contentVersion: '2.9.0',
    status: 'runtime-integrated',
    runtimeIntegrated: true,
    bossRange: Object.freeze(['07', '30']),
    expansionPremise,
    forgeCircuit,
    waves,
    bosses,
    bossesByWave,
    masteryContracts,
    restorationPlan,
    getBossById,
    getBossByNumber,
    getWave,
    getBossesByWave,
    getPhaseTitle,
    getMasteryContracts,
    getRestorationPlan
  });

  root.GEARSTORM_EXPANSION_STORY = story;
})(globalThis);
