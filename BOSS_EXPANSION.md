# GEARSTORM — Contrat d’expansion des boss

Statut du document : spécification de production

Portée : 30 boss originaux, dont 6 déjà présents dans le jeu et 24 planifiés

Référence technique actuelle : GEARSTORM v2.5, manifeste d’assets générés v2.5.0

## 1. Objet et limites

Ce document transforme l’étude des grandes mécaniques de boss de la série Sonic en une feuille de route originale pour GEARSTORM. Il décrit des verbes de jeu, des structures d’arène et des méthodes de production. Il n’autorise ni la copie d’une apparence, ni la reprise d’un nom, d’une silhouette, d’un personnage, d’un décor ou d’un asset Sega.

Les vingt-quatre boss des vagues 1 à 4 sont des concepts de production. Ils ne sont pas implémentés, jouables ou illustrés au moment de la rédaction. Leur nom, leur place narrative et leur équilibrage restent soumis à validation avant développement.

La mention IP-safe désigne ici un ensemble de garde-fous internes. Elle ne remplace pas une validation juridique lorsqu’une diffusion commerciale l’exige.

## 2. Principe de conception

Chaque rencontre doit être définie comme la combinaison de trois axes :

1. une boucle de résolution : ce que la joueuse comprend et accomplit pour ouvrir les dégâts ;
2. une géométrie d’arène : la manière dont l’espace contraint le mouvement ;
3. une structure de rencontre : phases, rematch, duo, gauntlet, secret ou remix.

Cette méthode permet de couvrir une grande variété historique de combats sans reconstruire un boss existant. Deux machines ne doivent pas partager simultanément leur boucle principale, leur forme d’arène et leur rythme de phase.

### 2.1 Boucles de résolution autorisées

- télégraphe, esquive, fenêtre de vulnérabilité ;
- interruption d’une attaque pendant son armement ;
- renvoi de projectile ou contre cinétique ;
- leurre du boss vers un élément dangereux de l’arène ;
- destruction de membres, blindages ou générateurs avant le noyau ;
- rupture de posture, parade ou contre puis rafale ;
- ascension ou traversée d’un colosse jusqu’à ses points faibles ;
- poursuite, rattrapage ou dépassement ;
- duel mimétique ;
- emploi d’un module ou d’une interaction contextuelle ;
- gestion de sbires servant de menace, de munition ou de ressource ;
- maintien d’une réserve qui décroît pendant le combat.

### 2.2 Géométries d’arène autorisées

- arène plate fermée ;
- convoyeur ou défilement forcé ;
- terrain mobile, destructible ou reconfigurable ;
- ascenseur, tour ou puits vertical ;
- rotation, centrifugeuse ou gravité alternée ;
- couloirs, rails ou trois voies ;
- vol libre ou haute atmosphère ;
- eau, niveau variable ou flottabilité ;
- véhicule, tourelle ou séquence de tir ;
- corps du boss utilisé comme niveau ;
- attaques venant de l’arrière-plan ;
- environnement piloté par la machine : météo, chaleur, vent, obscurité ou temps.

### 2.3 Structures de rencontre autorisées

- transformation en plusieurs phases ;
- adversaire qui apprend ou évolue lors d’un rematch ;
- duo ou plusieurs menaces coordonnées ;
- gauntlet ou Boss Rush ;
- boss final conditionnel ;
- changement de genre court et lisible ;
- alternance de rôles ou de cibles ;
- remix classé, chronométré ou durci ;
- finisher spectaculaire après une victoire réellement jouée.

## 3. Statuts de production

| Statut | Signification |
|---|---|
| Présent | Le boss existe dans la version actuelle du jeu. Ce statut ne signifie pas qu’il ne reste aucun travail d’art, de rig ou d’équilibrage. |
| Planifié | Le concept est décrit dans ce document, sans promesse d’implémentation déjà réalisée. |
| Bloqué | Une dépendance moteur, artistique, narrative ou d’accessibilité empêche sa production. |
| Candidat release | Code, assets, narration, tests et audit visuel sont terminés pour la rencontre. |

## 4. Contrat des 30 boss

### 4.1 Circuit actuel — six boss présents

| No | Boss | Statut | Arène | Identité mécanique | Travail d’expansion attendu |
|---:|---|---|---|---|---|
| 01 | RIVET REX | Présent | Rocade des Rivets | Charge, marteaux, mines et impacts sismiques | Consolider le rôle de percuteur industriel, rendre chaque marteau lisible et destructible, préserver une fenêtre sûre après chaque charge. |
| 02 | SKY SLICER | Présent | Couloir des Hautes-Tensions | Vol, salves ioniques, foudre et condensateur exposé | Renforcer le déplacement sur plusieurs hauteurs et la lecture indépendante des ailes, propulseurs et condensateur. |
| 03 | MAGNETRON | Présent | Fosse Ferromagnétique | Polarité, éruptions et débris magnétiques | Clarifier attraction et répulsion sans dépendre uniquement de la couleur, puis faire du noyau une conséquence lisible du cycle magnétique. |
| 04 | CHRONO MANTIS | Présent | Horloge de la Faille | Ruées, téléportations, engrenages et ralentissements | Séparer clairement anticipation, écho temporel et attaque réelle ; maintenir une variante réduction des mouvements. |
| 05 | FOUNDRY TITAN | Présent | Fournaise des Pistons | Pistons, lave, flammes et métal en fusion | Développer la logique de colosse modulaire sans transformer le sol en piège inévitable. |
| 06 | CROWN ENGINE Ω | Présent | Citadelle Voltério | Forteresse finale en trois formes | Organiser les reprises de mécaniques précédentes en séquences nommées et éviter l’empilement simultané illisible. |

Les six boss actuels restent le socle canonique. Leur refonte visuelle ou mécanique doit préserver les sauvegardes, les contrats de maîtrise, les scènes narratives et les identifiants internes existants.

### 4.2 Vague 1 — Fondamentaux de contre

Objectif : ajouter six boucles très différentes en restant compatible avec le moteur 2D actuel.

| No | Nom de travail | Statut | Arène proposée | Boucle principale | Phases et règle d’équité |
|---:|---|---|---|---|---|
| 07 | BASTION RICOCHET | Planifié | Galerie des Parafoudres | Renvoyer des charges balistiques vers trois relais de bouclier | P1 : un angle ; P2 : ricochets ; P3 : relais mobiles. Chaque projectile renvoyable porte une forme et un son uniques. |
| 08 | HYDRAULIC WARDEN | Planifié | Chambre des Mors | Leurrer ses béliers dans les presses latérales | Les presses ne s’activent jamais sans zone de refuge visible ; la dernière phase accélère le cycle mais n’en réduit pas le télégraphe. |
| 09 | HIVE FOREMAN | Planifié | Dépôt des Micro-Forges | Choisir entre drones de protection, réparation et munition | Trois familles de drones, une seule vague active à la fois ; détruire le bon drone expose le contremaître. |
| 10 | ECHO FENCER | Planifié | Salle de Répétition | Duel mimétique qui répond à l’action la plus répétée de Riva | La copie est annoncée avant usage ; aucune capacité de la joueuse n’est désactivée et le boss ne possède pas sa silhouette. |
| 11 | BREAKER ARRAY | Planifié | Station de Délestage | Détruire quatre modules dans l’ordre choisi pour ouvrir le noyau | L’ordre modifie la phase suivante sans créer de choix perdant ; chaque module a sa hitbox et son état endommagé. |
| 12 | VERTICAL VERDICT | Planifié | Puits des Contrepoids | Monter avec un ascenseur tout en retournant les contrepoids | Le bas de l’écran n’est létal qu’après double avertissement ; une plateforme sûre existe à chaque cycle. |

Critère de sortie de vague : les six boss doivent fonctionner au clavier, au tactile et à la manette, disposer de leur pack d’assets complet, de tests déterministes et d’un audit visuel desktop/mobile.

### 4.3 Vague 2 — Arènes cinétiques

Objectif : étendre le contrôleur d’arène avec défilement, voies, destruction, fluide, rotation et météo.

| No | Nom de travail | Statut | Arène proposée | Boucle principale | Phases et règle d’équité |
|---:|---|---|---|---|---|
| 13 | RAIL TYRANT | Planifié | Rocade Cargo 7 | Rattraper une locomotive blindée, détruire ses attaches puis son moteur | Défilement continu ; les obstacles impossibles ne peuvent jamais partager la même voie. |
| 14 | TRIPLEX HUNTER | Planifié | Couloir Triplex | Changer de voie pour armer un tir de flanc | Trois voies, attaque frontale puis croisée ; toute permutation est annoncée avant verrouillage. |
| 15 | GROUND EATER | Planifié | Chantier de Démolition | Forcer la machine à détruire ses propres appuis | Les zones détruites sont reconstruites par roulement ; au moins 35 % du sol reste praticable. |
| 16 | FLOODLINE LEVIATHAN | Planifié | Réservoir des Écluses | Fermer des vannes pendant que l’eau modifie sa hauteur et les trajectoires | La pression remplace toute notion d’oxygène si le lore de Riva ne valide pas la plongée ; aucune mort instantanée hors chute clairement signalée. |
| 17 | CENTRIFUGE ZERO | Planifié | Anneau Centrifuge | Exploiter les quarts de tour de gravité pour atteindre le rotor | Rotation par pas de 90 degrés ; option réduction des mouvements avec transition fondue et caméra stable. |
| 18 | TEMPEST REGULATOR | Planifié | Observatoire Météore | Neutraliser successivement vent, pluie conductrice et chaleur | Un seul état météorologique dangereux à la fois ; pictogrammes et sons accompagnent toujours la couleur. |

Critère de sortie de vague : le contrôleur d’arène doit être générique, testé séparément et réutilisable. Aucun de ces boss ne doit coder son défilement ou sa gravité directement dans sa logique d’attaque.

### 4.4 Vague 3 — Colosses et systèmes avancés

Objectif : ajouter rupture, ascension, alternance de cibles, réaction au build et combat aérien.

| No | Nom de travail | Statut | Arène proposée | Boucle principale | Phases et règle d’équité |
|---:|---|---|---|---|---|
| 19 | ASCENSION FRAME | Planifié | Pilier des Ascensions | Courir sur les bras abaissés du colosse pour détruire ses ancrages | Trois routes courtes, jamais une longue séquence sans reprise ; chute non létale vers une plateforme de récupération. |
| 20 | COUNTERFORGE | Planifié | Cour du Contrecoup | Briser sa posture par ruée ou contre au moment précis | La fenêtre de contre utilise un signal visuel, sonore et haptique ; mode Pilote élargit la fenêtre. |
| 21 | CARRIER CATHEDRAL | Planifié | Cathédrale Mobile | Traverser plusieurs sections de la forteresse avant le cœur | Le boss devient l’arène ; chaque section constitue un checkpoint interne en entraînement. |
| 22 | TWIN GOVERNORS | Planifié | Chambre des Deux Régulateurs | Deux machines se passent bouclier et alimentation | Une seule cible principale vulnérable ; leurs collisions mutuelles peuvent être provoquées mais jamais requises sans indice. |
| 23 | LOADOUT REACTOR | Planifié | Atelier des Modules | Réagit aux modules installés par Riva et expose un contre différent | Adaptation plafonnée à une mécanique ; aucun hard counter ne neutralise le build choisi. |
| 24 | ORBITAL FAMINE | Planifié | Orbital Terminus | Combat aérien où une réserve d’énergie décroît et se recharge par actions risquées | Des condensateurs apparaissent selon une cadence garantie ; la réserve ne masque jamais la barre de vie. |

Critère de sortie de vague : les pièces destructibles, points d’ancrage, jauges de rupture et ressources temporaires doivent être exposés par des composants moteur communs.

### 4.5 Vague 4 — Expérimental et endgame

Objectif : introduire des changements de genre courts, un gauntlet, une adaptation contrôlée et un vrai secret final.

| No | Nom de travail | Statut | Arène proposée | Boucle principale | Phases et règle d’équité |
|---:|---|---|---|---|---|
| 25 | LOGIC CRUCIBLE | Planifié | Chambre Booléenne | Activer des relais selon une séquence de formes pour ouvrir le noyau | Puzzle de moins de 45 secondes par cycle ; solution lisible sans couleur et jamais réinitialisée par un dégât. |
| 26 | VECTOR VAULT | Planifié | Chambre des Vecteurs | Orienter des déflecteurs pour faire ricocher les tirs de Riva | Prévisualisation de trajectoire en mode Pilote ; le boss reste actif pendant la résolution. |
| 27 | SKYBORNE BATTERY | Planifié | Batterie Aérostatique | Séquence de tir mobile, esquive et renvoi de torpilles | Changement de genre limité à une rencontre ; visée assistée au tactile et à la manette. |
| 28 | ENDURANCE ENGINE | Planifié | Circuit d’Endurance | Machine qui convoque des fragments mécaniques en gauntlet sans soin complet | Six manches courtes et télégraphiées ; reprise au début de la manche en Laboratoire. |
| 29 | ADAPTIVE ARCHIVIST | Planifié | Archives Réactives | Observe la fréquence de tir, saut et ruée puis change une seule réponse | L’adaptation est locale au combat, visible dans l’interface et remise à zéro à chaque tentative. |
| 30 | NULL CROWN | Planifié | Trône Zéro | Boss secret composite débloqué par la maîtrise, combinant renvoi, modules et rupture | Trois phases avec checkpoint d’entraînement ; aucune phase ne copie l’apparence ou l’ordre d’un final de franchise existant. |

Critère de sortie de vague : le boss secret ne peut être annoncé comme disponible avant que sa condition de déblocage, sa sauvegarde, son Codex, ses récompenses et son épilogue optionnel soient réellement implémentés.

## 5. Architecture moteur requise

### 5.1 Registre de boss piloté par les données

Le tableau BOSSES actuel peut rester la source de compatibilité pendant la migration, mais la cible est un registre déclaratif. Une entrée doit au minimum décrire :

- identifiant stable ;
- nom affiché et nom de travail ;
- statut de production ;
- vague et ordre de campagne ;
- points de vie et paramètres de difficulté ;
- temps de référence et règles de score ;
- pack d’art et pack d’arène ;
- pièces, points faibles et hitboxes ;
- liste ordonnée des phases ;
- patterns disponibles par phase ;
- règles de transition ;
- contrôleur d’arène ;
- télégraphes et indices d’accessibilité ;
- contrats de maîtrise ;
- récompense, entrée Codex et liens narratifs.

Les identifiants rammer, kraken, drill, mantis, cyclotron et omega ne doivent pas être renommés sans migration explicite des sauvegardes.

### 5.2 Machine à états commune

Tous les boss doivent partager le même cycle haut niveau :

1. introduction ;
2. entrée en phase ;
3. positionnement neutre ;
4. télégraphe ;
5. attaque active ;
6. récupération ;
7. fenêtre de vulnérabilité ou rupture ;
8. transition de phase ;
9. défaite.

Un boss peut enrichir ces états, mais ne doit pas contourner les invariants suivants :

- aucune hitbox offensive avant le début du télégraphe ;
- aucune nouvelle attaque pendant une transition ;
- invulnérabilité toujours signalée ;
- hitbox et sprite désactivés ensemble lors de la défaite ;
- annulation propre des projectiles, minuteries et contrôleurs d’arène lors d’un retry.

### 5.3 Bibliothèque de patterns

La logique doit être composée à partir de patterns testables :

- charge télégraphiée ;
- volée de projectiles ;
- projectile renvoyable ;
- projectile destructible ;
- mine ou zone différée ;
- frappe au sol et onde ;
- poursuite ;
- téléportation ;
- apparition de sbires ;
- bouclier lié à un générateur ;
- membre destructible ;
- jauge de rupture ;
- cible de leurre ;
- changement d’état d’arène ;
- défilement, voies, rotation ou niveau de fluide ;
- drain et recharge de ressource.

Chaque pattern reçoit un générateur pseudo-aléatoire injecté. Les tests peuvent ainsi rejouer exactement une séquence défaillante.

### 5.4 Système de pièces et de dégâts

Une pièce de boss doit posséder :

- identifiant local ;
- parent et ordre de dessin ;
- point d’ancrage et pivot ;
- transformation locale ;
- hitbox ou absence de hitbox ;
- points de vie optionnels ;
- état intact, endommagé et détruit ;
- rôle de gameplay ;
- phase d’apparition ;
- animation procédurale autorisée ;
- événement déclenché à la destruction.

Le noyau ne doit pas être une exception codée en dur. Il doit être une pièce avec un rôle weak-point et des règles de vulnérabilité.

### 5.5 Contrôleur d’arène

Le contrôleur d’arène est indépendant du boss et expose :

- dimensions logiques 1280 × 720 ;
- sol et volumes sûrs ;
- plateformes ;
- limites de caméra ;
- couches parallaxe ;
- vitesse de défilement ;
- voies ;
- rotation ou gravité ;
- niveau de fluide ;
- états environnementaux ;
- zones létales et télégraphes ;
- procédure de remise à zéro.

Les variantes réduction des mouvements et contraste élevé sont des états du contrôleur, pas des correctifs CSS isolés.

### 5.6 Directeur de combat

Le directeur choisit les patterns autorisés selon la phase et applique des règles de sécurité :

- pas de répétition identique plus de deux fois hors tutoriel ;
- délai minimal entre deux attaques couvrant toute l’arène ;
- vérification d’au moins une solution praticable ;
- plafond commun de projectiles et de particules ;
- priorité aux télégraphes importants ;
- adaptation de vitesse, et non suppression d’indices, selon la difficulté ;
- journal de télémétrie local pour reproduire une mort jugée injuste.

### 5.7 Progression et sauvegarde

L’ajout des vagues demandera une migration de sauvegarde, sans écraser la version actuelle. Prévoir :

- déblocage par vague et par boss ;
- meilleurs temps et rangs ;
- contrats de maîtrise ;
- dossiers Codex ;
- checkpoints de Rush ;
- statut du boss secret ;
- version de données du registre ;
- valeur par défaut sûre pour tout contenu absent d’une ancienne sauvegarde.

La version exacte du nouveau format sera décidée lors de l’implémentation. Ce document ne prétend pas qu’une migration existe déjà.

## 6. Architecture des packs d’assets

### 6.1 Compatibilité avec le manifeste actuel

Le manifeste v2.5.0 utilise déjà :

- quatre couches d’arène de 768 × 512 pixels ;
- des pièces de boss de 418 × 418 pixels avec alpha ;
- des VFX proches de 314 × 314 pixels avec alpha ;
- largeur, hauteur, poids, transparence et SHA-256 ;
- chargement par bundle de boss.

L’expansion doit conserver cette compatibilité avant toute évolution de schéma.

### 6.2 Arborescence cible par boss

    assets/generated/<release>/
      bosses/<boss-id>/
        reference.webp
        chassis.webp
        core.webp
        limb-left.webp
        limb-right.webp
        weapon.webp
        phase-2-module.webp
        phase-3-module.webp
        damage-overlay.webp
        wreckage.webp
        rig.json
        provenance.json
      arenas/<boss-id>/
        far.webp
        mid.webp
        ground.webp
        foreground.webp
        arena.json
      vfx/<boss-id>/
        telegraph.webp
        impact.webp
        phase-transition.webp
        destruction.webp

Les noms sont adaptés à la machine réelle. Aucun fichier vide ou asset générique dupliqué ne doit être ajouté pour satisfaire artificiellement le contrat.

### 6.3 Métadonnées de manifeste à ajouter

Une future révision de schéma pourra compléter chaque entrée avec :

- anchor et pivot ;
- boîte englobante utile ;
- ordre de dessin ;
- phase ;
- rôle de gameplay ;
- état de dégâts ;
- taille logique ;
- palette ;
- identifiant de prompt ;
- hachage du prompt ;
- outil et modèle de génération ;
- date de génération ;
- statut de revue humaine ;
- statut IP ;
- licence et provenance.

L’augmentation de schemaVersion n’est autorisée qu’avec une validation des anciens manifestes et un message d’erreur explicite pour les versions incompatibles.

### 6.4 Budget de poids

Objectifs par boss :

- pièces de machine : 0,9 à 1,4 Mo ;
- quatre couches d’arène : 0,8 à 1,2 Mo ;
- VFX spécifiques : 0 à 0,3 Mo grâce à la réutilisation ;
- pack complet cible : 2,25 Mo ;
- maximum exceptionnel : 2,75 Mo après justification visuelle.

Une vague de six boss doit rester sous 14 Mo d’assets runtime. Les packs sont chargés à la demande ; seul le boss courant est prioritaire et le suivant peut être préchargé pendant une période idle. Le service worker ne doit pas précacher les trente packs au premier lancement.

## 7. Contrat d’assets OpenAI par boss

### 7.1 Brief obligatoire avant génération

Chaque brief doit contenir :

- verbe de gameplay principal ;
- fonction civique ou industrielle détournée ;
- silhouette originale décrite sans référence de franchise ;
- type de locomotion ;
- arme et point faible ;
- trois changements de phase ;
- palette limitée ;
- orientation et échelle ;
- liste exacte des pièces attendues ;
- exclusions IP ;
- contraintes de lisibilité à la taille runtime.

Une génération ne commence pas tant que la mécanique et les pièces animées ne sont pas définies.

### 7.2 Référence d’assemblage

La première image sert uniquement de référence :

- vue latérale trois-quarts orthographique ;
- machine tournée vers la gauche, en direction de Riva ;
- pose neutre ;
- caméra cohérente avec le canvas ;
- membres entièrement visibles ;
- aucune arme hors cadre ;
- lumière principale venant du même côté que les assets existants ;
- fond uni facile à détourer ;
- aucun texte, logo, interface ou watermark.

La référence assemblée ne remplace pas les pièces runtime.

### 7.3 Pièces indépendantes

Chaque élément mobile est généré ou extrait comme asset indépendant avec :

- canevas 418 × 418 ;
- transparence réelle ;
- même orientation et même lumière que la référence ;
- marge de sécurité autour du contour ;
- articulation complète visible ;
- aucune ombre portée appartenant à une autre pièce ;
- pivot identifiable ;
- absence de morceau voisin fusionné ;
- contour propre à 100 % et à l’échelle runtime.

Les membres gauche et droit ne sont pas automatiquement obtenus par miroir si leur éclairage, leurs armes ou leurs dégâts sont asymétriques.

### 7.4 Arène et parallaxe

Pour chaque boss :

- far : décor lointain opaque, sans élément jouable ;
- mid : structures de district sur transparence ;
- ground : sol visuel aligné avec le sol logique ;
- foreground : éléments décoratifs qui ne masquent ni Riva ni les télégraphes ;
- variante d’état si l’arène change matériellement pendant une phase ;
- masque ou données séparées pour les zones jouables, jamais déduites de l’image.

Vitesses de départ compatibles avec l’existant :

- far : 0,015 ;
- mid : 0,055 ;
- ground : 0,12 ;
- foreground : 0,19.

Elles peuvent être ajustées par le contrôleur d’arène, sans être peintes dans l’image.

### 7.5 VFX

Un VFX généré doit remplir une fonction précise :

- avertissement ;
- direction ;
- impact ;
- rupture ;
- changement de phase ;
- destruction.

Le gameplay ne peut pas reposer sur un VFX décoratif ambigu. Les télégraphes utilisent également forme, mouvement et audio. Les VFX partagés sont préférés quand ils conservent leur sens.

### 7.6 Provenance

Chaque lot conserve :

- brief source ;
- prompt final ;
- exclusions ;
- date ;
- outil OpenAI utilisé ;
- fichiers retenus et rejetés ;
- opérations de détourage, redimensionnement et compression ;
- approbation artistique ;
- contrôle IP ;
- hachages des fichiers runtime.

Un asset sans provenance n’entre pas dans le manifeste de release.

## 8. Direction artistique GEARSTORM

Le langage visuel commun est celui d’infrastructures civiques transformées en machines de spectacle :

- plaques rivetées et réparations visibles ;
- asymétrie justifiée par la fonction ;
- mécanismes lisibles ;
- énergie colorée par district ;
- noyaux intégrés à une logique industrielle ;
- dégâts progressifs ;
- silhouette reconnaissable en noir plein ;
- proportions compatibles avec les hitboxes.

La variété vient de la fonction, pas d’un changement arbitraire de style. Une écluse, une presse, un relais électrique et un observatoire donnent naturellement quatre familles visuelles distinctes.

## 9. Garde-fous anti-copie

### 9.1 Interdictions

Les prompts et assets de production ne doivent pas contenir ou reproduire :

- nom d’un boss, personnage, niveau ou faction Sonic ;
- silhouette de hérisson ou rival robotique comparable ;
- cockpit ovoïde avec visage ou moustache ;
- chaussures rouges, gants blancs ou piquants bleus comme code central ;
- gemmes multicolores, anneaux dorés ou emblèmes officiels ;
- damier, colline ou architecture immédiatement identifiable d’un niveau Sega ;
- forme d’un robot final, Titan ou véhicule officiel ;
- palette et disposition des pièces d’un boss précis ;
- capture, sprite, modèle 3D, concept art ou key art Sega ;
- photobash, traçage ou surpeinture d’une source officielle.

Les noms Sonic peuvent apparaître dans cette documentation de recherche et ses sources, jamais dans le prompt visuel final.

### 9.2 Test de transformation interne

Avant validation, chaque concept doit différer de toute référence mécanique étudiée sur au moins cinq dimensions :

1. silhouette ;
2. locomotion ;
3. arme ;
4. emplacement et logique du point faible ;
5. fonction narrative ;
6. palette ;
7. matériau ;
8. géométrie d’arène ;
9. ordre des phases ;
10. méthode exacte d’ouverture des dégâts.

Ce test réduit le risque de copie, sans constituer à lui seul une garantie juridique.

### 9.3 Revue croisée

Le dossier de chaque boss comprend :

- planche de silhouette ;
- référence d’assemblage ;
- mécanique en diagramme ;
- comparaison textuelle avec les familles déjà présentes dans GEARSTORM ;
- liste des références externes consultées ;
- contrôle qu’aucun détail distinctif externe n’a été repris ;
- validation art, gameplay et narration.

Un concept trop proche est rejeté puis reconstruit depuis sa fonction industrielle, pas simplement recoloré.

## 10. Qualité, accessibilité et validation

### 10.1 Gates gameplay

- trois tentatives à difficulté standard ne doivent produire aucune combinaison inévitable ;
- tout danger possède un télégraphe mesurable ;
- une phase enseigne avant de combiner ;
- les invulnérabilités sont courtes et justifiées ;
- les attaques hors écran sont annoncées ;
- les hitboxes correspondent aux pièces visibles ;
- chaque boss possède une stratégie rapide fondée sur la maîtrise, pas sur un exploit ;
- le Laboratoire permet de rejouer le boss sans révéler les conséquences narratives futures.

### 10.2 Gates visuels

- assemblage contrôlé en mode rig ;
- aucune jonction flottante ;
- aucune pièce recadrée ;
- noyau et armes alignés avec leurs hitboxes ;
- états P1, P2, P3, rupture et défaite capturés ;
- contrôle en 1440 × 900, 844 × 390 et 390 × 844 ;
- télégraphes lisibles en contraste élevé ;
- contrôle avec réduction des mouvements ;
- comparaison du rendu assemblé avec la référence validée.

### 10.3 Gates techniques

- manifeste complet, dimensions et SHA-256 valides ;
- aucun asset manquant ;
- budget de poids respecté ;
- chargement paresseux et reprise après échec réseau ;
- réinitialisation propre lors d’un retry ;
- tests unitaires des patterns ;
- tests de contrat du registre ;
- tests de migration de sauvegarde ;
- build, PWA et audit de sécurité ;
- parcours navigateur complet de l’intro au résultat ;
- vérification tactile et manette réelle avant release professionnelle.

### 10.4 Performance

- objectif 60 images par seconde sur desktop de référence ;
- plancher jouable de 30 images par seconde sur mobile pris en charge ;
- plafond partagé de projectiles et particules ;
- aucun décodage massif des trente packs au lancement ;
- libération des bitmaps d’un boss quitté, sauf bundle explicitement conservé ;
- possibilité de réduire particules et secousses sans modifier la difficulté.

## 11. Ordre d’exécution recommandé

1. Corriger définitivement le rig de Riva, notamment les avant-bras, pivots et ordre de dessin.
2. Stabiliser les six boss actuels et leur contrat de données.
3. Extraire la machine à états et les patterns communs.
4. Étendre le manifeste avec pivots, rôles et provenance.
5. Produire entièrement un seul vertical slice de la vague 1 : code, art, lore, tests et QA.
6. Valider le coût réel du vertical slice avant de générer les cinq autres packs.
7. Livrer une vague à la fois.
8. Ne démarrer les colosses et changements de genre qu’après validation du contrôleur d’arène.
9. Produire NULL CROWN en dernier, lorsque toutes ses mécaniques sources sont stables.

Une vague n’est pas terminée parce que ses images existent. Elle est terminée lorsque ses six combats sont jouables, équilibrés, intégrés à la progression, documentés et vérifiés.

## 12. Sources officielles consultées

Les sources servent à inventorier les jeux et à comprendre des familles générales de gameplay. Elles ne sont pas des banques d’images ou des modèles à reproduire.

- SEGA, Sonic Channel — historique des jeux : https://sonic.sega.jp/SonicChannel/history/
- SEGA, manuel Sonic Origins — structure classique, Boss Rush, temps, anneaux et progression : https://manuals.sega.com/wp-content/uploads/2022/06/SM_Sonic_Origin_En_220617.pdf
- SEGA, Sonic Frontiers — Open Zone, combat, Cyloop et progression : https://sonic.sega.jp/SonicChannel/gametitle/SonicFrontiers.html
- SEGA, Sonic Superstars — pouvoirs utilisables en boss et coopération : https://sonic.sega.jp/SonicChannel/gametitle/SonicSuperStars.html
- SEGA, Sonic × Shadow Generations — capacités, ressources, défis, classements et Boss Gates : https://manuals.sega.com/sonicxshadowgenerations/en/index.html
- SEGA, Sonic Heroes — formations et Team Blast : https://sonic.sega.jp/SonicChannel/gametitle/SonicHeroes.html
- SEGA, Sonic Adventure 2 — trois styles de jeu et récits croisés : https://sonic.sega.jp/SonicChannel/gametitle/SonicAdventure2.html
- SEGA, Sonic Colors — Color Powers et changements 2D/3D : https://sonic.sega.jp/SonicChannel/gametitle/SonicColors.html
- SEGA, Sonic World Adventure — alternance vitesse, combat et athlétisme : https://sonic.sega.jp/SonicChannel/gametitle/SonicWorldAdventure.html
- SEGA, Sonic Generations — styles classique et moderne, défis historiques : https://sonic.sega.jp/SonicChannel/gametitle/SonicGenerations.html
- SEGA, Sonic Lost World — parkour, géométries cylindriques et pouvoirs : https://sonic.sega.jp/SonicChannel/gametitle/SonicLostWorld.html
- SEGA, Sonic Mania — réinterprétation 2D et nouvelles mécaniques : https://sonic.sega.jp/SonicChannel/gametitle/SonicMania.html
- SEGA, Sonic Dream Team — gravité, routes et capacités de personnages : https://sonic.sega.jp/SonicChannel/gametitle/SonicDreamteam.html
- SEGA, Sonic Battle — combat, lecture adverse et acquisition de techniques : https://sonic.sega.jp/SonicChannel/gametitle/SonicBattle.html
- SEGA, Sonic Spinball — hybridation plateforme et cinétique : https://sonic.sega.jp/SonicChannel/gametitle/SonicSpineball.html
- SEGA, Sonic and the Black Knight — action armée et combat contextuel : https://sonic.sega.jp/SonicChannel/gametitle/SonicAndTheBlackknight.html
- SEGA, Sonic Rumble — manches, survie et compétition multijoueur : https://sonic.sega.jp/SonicChannel/gametitle/SonicRamble.html
- SEGA, Sonic Racing: CrossWorlds — variation de parcours et compétition : https://sonic.sega.jp/SonicRacingCrossWorlds/

## 13. Définition de terminé pour les 30 boss

Le contrat de trente boss sera réellement accompli uniquement lorsque :

- les six boss actuels auront passé la nouvelle validation de rig et de gameplay ;
- les vingt-quatre boss planifiés seront effectivement implémentés ;
- trente packs d’assets originaux et traçables seront intégrés ;
- les trente rencontres disposeront de narration, Codex, progression et maîtrise ;
- les migrations de sauvegarde seront testées ;
- toutes les vagues auront passé build, tests, audit visuel, accessibilité et performance ;
- la version publiée aura été vérifiée dans le navigateur et sur ses contrôles réels.

Jusque-là, ce document reste un contrat d’expansion, pas une déclaration de contenu livré.
