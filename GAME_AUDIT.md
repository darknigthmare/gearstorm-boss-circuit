# Audit professionnel du jeu — candidat v2.5

Date : 21 août 2026
Portée : code, données, assets, tests automatisés et capture Chrome locale du parcours introduction → prologue → combat.

## Verdict

GEARSTORM est déjà un boss rush jouable et structuré, pas un simple écran prototype : six combats en trois phases, campagne, Laboratoire, onze modules, Surcharge, scores, rangs, dix-huit maîtrises, narration, reprise, quatre familles d’entrée et PWA. Le candidat v2.5 corrige le défaut le plus visible du rig de Riva et empêche désormais le combat de commencer derrière la plaque d’introduction.

Le jeu n’est cependant pas encore prêt à absorber « tous les boss » ni à revendiquer une finition commerciale complète. Son principal plafond est architectural : le runtime et les contrats supposent exactement six machines. Les autres écarts concernent surtout la reproductibilité, la sauvegarde, l’accessibilité réelle, l’audio et la longévité.

## Corrigé dans cette passe

- Riva n’empile plus le torse, deux bras complets et le canon. Le torse fournit le bras arrière ; l’asset OpenAI v3 fournit seulement l’avant-bras de tir ; le canon reste une pièce indépendante.
- Le pack public passe à `assets/generated/v2.5.0/` et conserve 103 WebP vérifiés par dimensions, alpha, poids et SHA-256.
- L’IA, les projectiles et le chronomètre restent arrêtés jusqu’à disparition complète de l’introduction du boss, y compris sur mobile et après une pause.
- Une victoire en Laboratoire n’ouvre plus la machine suivante : seuls les combats de campagne font progresser le roster et les districts.
- Le lancement d’un nouveau Circuit demande confirmation lorsqu’un checkpoint de reprise valide existe.
- Les overlays portrait/paysage, les toasts tactiles, le contraste des surfaces de combat et l’isolation modale ont reçu une passe CSS/accessibilité ciblée.
- Des contrats automatisés couvrent désormais le nombre de bras visibles, le runtime v2.5, le gel de l’introduction et la séparation Laboratoire/campagne.

## Ce qui est solide

- Six boss aux patterns distincts, trois phases verrouillées et transitions inviolables.
- Télégraphes, noyaux, Overdrive, ruée, combo, score, difficultés et rangs.
- Onze modules cumulables et écran de choix entre les combats.
- Sauvegarde normalisée v4, migration, reprise de Rush, Codex et dix-huit contrats de maîtrise.
- Clavier, souris, tactile et Gamepad API ; pause tactile ; HUD et objectifs accessibles.
- Parallaxe, rigs modulaires, lazy loading, fallback procédural et cache PWA par runtime versionné.
- Intro, prologue, six actes, interludes et épilogue issus d’un registre narratif unique.
- Serveur local à liste blanche, en-têtes de sécurité et build public minimal.

## P0 — bloque l’expansion à 30 boss

### 1. Registre figé sur six machines

Le démarrage exige six actes et l’IA comme le rendu utilisent encore des `switch` sur les six identifiants historiques. Les contrats applicatifs répètent cette liste. Ajouter vingt-quatre boss ainsi créerait un fichier central fragile, des migrations risquées et des tests superficiels.

Action : extraire un registre de boss piloté par les données, une machine à états commune, une bibliothèque de patterns et un contrôleur d’arène. Garder les six IDs existants comme compatibilité de sauvegarde.

### 2. Packs artistiques et mémoire

Le build actuel tient sous le budget prévu, mais trente packs chargés ou précachés ensemble dépasseraient rapidement le coût réseau et la mémoire décodée mobile.

Action : un pack immuable par boss, chargé à la demande ; précharger seulement la rencontre suivante ; fermer les anciens `ImageBitmap` ; garder le service worker en cache-first runtime sans précache global.

### 3. Absence d’E2E gameplay en CI

Les tests actuels valident fortement les contrats, fichiers, routes HTTP et caches, mais la majorité ne joue pas réellement une campagne. Une régression visuelle, un boss impossible ou une entrée cassée peut donc rester verte.

Action : ajouter un smoke navigateur déterministe qui parcourt titre → récit → combat → trois phases → résultat → atelier, puis les variantes tactile et Gamepad API simulée.

## P1 — requis pour une finition commerciale

### Progression et équité

- Séparer les records par mode, difficulté et version d’équilibrage ; un temps Ingénieur ne doit pas écraser implicitement un temps Overdrive.
- Sauvegarder le seed et les trois offres d’atelier dans le checkpoint pour empêcher un rechargement de relancer les choix.
- Prévoir export/import et sauvegarde de secours avant toute migration future du roster.
- Définir une politique basse fréquence : la simulation plafonnée ralentit alors que le temps mural continue, ce qui pénalise les appareils faibles.

### Accessibilité et contrôles

- Appliquer par défaut `prefers-reduced-motion` et `prefers-contrast` lors de la première sauvegarde, tout en laissant le réglage manuel prioritaire.
- Permettre le remappage des actions et exposer des préréglages manette/tactile.
- Tester physiquement manette, tactile et lecteur d’écran avant de qualifier une release commerciale.
- Vérifier les dangers Canvas dans les modes contraste élevé et mouvement réduit, pas seulement les panneaux DOM.

### Feedback et audio

- Les conseils sont contextuels et leur texte indique désormais qu’ils peuvent revenir à chaque combat ; une future option « une seule fois » demanderait une mémoire dédiée.
- L’audio synthétique n’a qu’un volume global et une identité musicale limitée. Prévoir musique/menu/boss, effets et voix séparés, ducking et option mono.
- Ajouter un écran de mise à jour PWA lorsque le nouveau service worker est prêt, au lieu de remplacer silencieusement la version au prochain chargement.

## P2 — longévité

- Historique des runs, splits par boss, builds favoris et replay de seed.
- Défis quotidiens/hebdomadaires déterministes et classements seulement avec une politique anti-triche explicite.
- New Game+, variantes de phases et rematches classés.
- Laboratoire avancé : choix de phase, pattern, build, invulnérabilité et vitesse d’entraînement.
- Localisation structurée, crédits consultables en jeu, haptique et mode audio mono.
- Captures PWA réelles du gameplay et non uniquement key art.

## Ordre de production recommandé

1. Stabiliser v2.5 et ajouter le smoke navigateur CI.
2. Introduire le registre de boss et les patterns sans changer les six combats existants.
3. Étendre le manifeste avec pivot, joint, ordre de dessin, rôle et provenance.
4. Réaliser un seul vertical slice complet : BASTION RICOCHET, avec art OpenAI, lore, progression, maîtrise et QA.
5. Mesurer performances et coût de production, puis livrer les autres boss par vagues de six.
6. Traiter sauvegarde, records, accessibilité et audio avant la première vague publique.

Le détail des 24 concepts originaux, des garde-fous anti-copie et du contrat d’assets figure dans `BOSS_EXPANSION.md`.

## Limites de preuve

La capture Chrome locale confirme le runtime v2.5, le chargement sans échec et le rig de Riva en combat desktop. Les tests automatisés valident la chaîne applicative. Cette passe ne constitue pas un test physique de manette, tactile, lecteur d’écran, appareil mobile bas de gamme ni campagne manuelle complète des six boss.
