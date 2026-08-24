# Rapport QA — GEARSTORM: Boss Circuit 2.9.0

Préparation du candidat : 24 août 2026.

## Statut du candidat v2.9.0 — validation en attente

Aucune réussite de gate, CI, commit, push ou publication Vercel n’est revendiquée ici pour la v2.9.0. Le manifeste et les sources ont seulement été relus statiquement pendant la préparation documentaire.

| Surface v2.9 | État au moment de cette mise à jour |
| --- | --- |
| Inventaire artistique | Manifeste local : 42 masters, 233 WebP runtime, 18 175 510 octets |
| Répartition | 48 arènes, 150 boss, 15 héroïne, 16 VFX, 4 narratifs |
| Rig Riva | Manifeste : 13 pièces anatomiques + 2 effets, `rootOffsetY = -23.6`, `feetLocalY = 36` |
| Perspective | Sol physique 620 ; offsets visuels campagne `+80`, Forge `+28` |
| Contenu | 24 interludes, 24 `metaLine` et quatre anneaux présents dans les registres/surfaces |
| Tests Node / build / audit npm | À exécuter sur l’état final assemblé |
| QA navigateur et captures finales | À exécuter |
| GitHub / CI / Vercel / HTTP public | Non vérifiés pour v2.9.0 |

Cette lecture statique ne prouve ni le contact visuel final de Riva, ni l’absence de régression, ni le comportement PWA. Les résultats v2.9 devront être ajoutés après exécution réelle des gates.

---

# Annexe historique — validation observée de la v2.8.0

Validation locale et production effectuée le 21 août 2026 sur GEARSTORM v2.8.0. Les résultats ci-dessous sont conservés comme historique et ne valent pas validation du candidat v2.9.0.

## Environnement vérifié

- Cible projet et CI : Node.js 22.x. Les gates locales ci-dessous ont tourné sous Node.js 24.15.0 ; npm ci a réussi avec l’avertissement attendu lié à cette différence de version.
- Navigateurs automatisés : Google Chrome 151, Firefox 153 et WebKit 26.5 via Playwright.
- Viewport desktop contrôlé : 1440 × 900.
- Viewport mobile contrôlé : 390 × 844, avec émulation tactile Chromium.
- Firefox desktop et WebKit desktop ont été exécutés dans la matrice opt-in après installation des moteurs Playwright correspondants.

## Gates locales de release

| Gate | Résultat observé |
| --- | --- |
| Vérification syntaxique et contrats applicatifs | Réussie |
| Tests Node | **69/69 réussis** |
| E2E Chromium | **13 réussis, 1 ignoré volontairement** |
| E2E Firefox desktop | **7/7 réussis** |
| E2E WebKit desktop | **6 réussis, 1 ignoré (limite du runner hors ligne)** |
| Lot E2E accessibilité | **8/8 réussis sous Chromium**, **4/4 sous Firefox**, **3/4 sous WebKit + 1 ignoré** |
| Build et contrôle de release | Réussis |
| Taille de `dist/` | **21 708 298 octets** |
| Catalogue graphique runtime | **225 WebP**, **18 248 604 octets** |
| Audit npm | **0 vulnérabilité** |

Le test Chromium ignoré correspond au checkpoint Forge réservé au desktop. Sous WebKit, seul le rechargement hors ligne est ignoré car le runner Windows échoue avant la résolution du service worker ; la même logique passe sous Chromium et Firefox.

## QA navigateur Chromium

Les parcours E2E vérifiés couvrent :

- le titre, la navigation, le Laboratoire, la Forge et l’absence de débordement horizontal ;
- la grille complète des 30 boss et les miniatures issues des vrais assets WebP ;
- le rig de Riva, le contact des semelles avec le plancher logique et la séparation cohérente du corps et du bras-canon ;
- les 24 profils Forge lancés dans chacune de leurs trois phases, soit 72 états de départ ;
- le démarrage et la reprise du premier checkpoint du Circuit Forge ;
- un parcours réel accéléré des **24 boss Forge**, avec victoires, offres d’amélioration, progression des quatre vagues et arrivée sur le véritable écran de fin ;
- l’affichage desktop 1440 × 900 et mobile 390 × 844.

Sur les captures acceptées, les contrôles n’ont relevé :

- aucun débordement de page ;
- aucune erreur console ;
- aucune erreur de page ;
- aucune erreur de requête.

Le scénario hors ligne est traité séparément : il vérifie volontairement le rechargement du shell déjà installé sans réseau.

## Lot accessibilité et qualité de vie

Le fichier `tests/e2e/accessibility.spec.mjs` a réussi ses quatre parcours sous Chromium desktop/mobile et Firefox desktop ; trois passent sous WebKit, avec le rechargement hors ligne ignoré pour la limite documentée du runner Windows :

1. ouverture des options et navigation au clavier, ordre de focus cohérent et cibles interactives d’au moins 44 CSS px ;
2. téléchargement réel d’un export `gearstorm-save-v5-AAAA-MM-JJ.json`, puis import d’un JSON v5 passé par la normalisation et application de ses réglages ;
3. initialisation de mouvement réduit et contraste renforcé depuis les préférences système sur une sauvegarde neuve ;
4. navigation de menu par Gamepad API simulée et rechargement hors ligne d’un shell PWA déjà installé.

Les tests Node simulent durablement la migration d’un ancien worker v2.7 vers v2.8 : consentement explicite, un seul message `SKIP_WAITING`, un seul rechargement, ainsi qu’un premier install silencieux. Le cycle avec un worker réellement `waiting` n’a pas été exécuté en navigateur.

## Audit visuel v2.8

Les captures desktop et mobile acceptées confirment les améliorations suivantes :

- les cartes déverrouillées de la Forge affichent une miniature décorative issue de la pièce WebP réelle du boss, sans remplacer son nom ni son libellé accessible ;
- les cartes verrouillées restent lisibles et n’exposent pas de miniature prématurée ;
- le corps de Riva ne double pas le torse, le bras-canon rejoint le socket d’épaule et les pieds touchent le plancher logique ;
- les 24 boss Forge conservent leur silhouette, leur noyau, leurs pièces articulées et leur ancrage au sol ;
- le HUD, les télégraphes, les panneaux d’objectif et les contrôles tactiles restent lisibles dans les viewports acceptés ;
- les options d’export/import ont un focus visible et des cibles suffisantes ;
- le bouton de mise à jour PWA reste discret et masqué tant qu’aucune mise à jour n’est disponible ;
- la grille des 30 boss, les récapitulatifs de vague et l’écran final Forge ne produisent aucun overflow sur les captures retenues.

Le pack artistique reste celui du manifeste immuable v2.7.0 : 225 WebP runtime pour 18 248 604 octets, dérivés des 26 masters OpenAI documentés. La version applicative est 2.8.0 et la sauvegarde reste en schéma v5.

## Contenu et progression vérifiés

- 30 boss jouables, 90 phases et 90 contrats de maîtrise.
- Six boss et 18 contrats pour la campagne ; 24 boss et 72 contrats pour la Forge.
- Circuit Forge composé de quatre vagues de six rencontres.
- Parcours accéléré validé de FORGE 07 à FORGE 30 avec améliorations et fin dédiée.
- ENDURANCE ENGINE impose ses six manches ; le checkpoint de manche 4, le retry et la conservation de la pénalité sont validés en E2E.
- Les checkpoints conservent le retry du boss courant et l’offre d’amélioration déjà proposée.
- La sauvegarde v5 migre et normalise les données anciennes, puis sépare campagne et Forge.
- Les assets disposent d’un fallback procédural et le cache PWA ne précache pas les 225 WebP en un seul bloc.

## Limites honnêtes de validation

- Aucune manette physique n’a été testée ; la couverture Gamepad utilise une simulation de l’API standard.
- Aucun écran tactile physique n’a été testé ; le mobile 390 × 844 est une émulation Chromium.
- Aucun lecteur d’écran réel n’a été testé.
- Le rechargement hors ligne WebKit est le seul parcours cross-browser ignoré, en raison d’une erreur interne du runner Playwright Windows ; il passe sous Chromium et Firefox.
- L’émulation mobile ne mesure pas les performances d’un appareil bas de gamme.
- Le combat en portrait reste contraint ; l’interface recommande le paysage pour préserver la largeur tactique.
- Le consentement face à un service worker réellement `waiting` reste couvert par simulation VM/contrats Node, pas par un parcours navigateur complet.
- Les 24 backdrops Forge sont des tableaux monocouche, moins profonds que les six arènes historiques à quatre plans de parallaxe.
- Les 24 profils Forge spécialisent huit familles de simulation partagées ; ils ne constituent pas 24 moteurs physiques indépendants.
- Les records locaux ne sont pas encore segmentés par mode, difficulté et version d’équilibrage.

## Vérification de production

**Statut : READY.**

- Commit applicatif vérifié : `de887c9` sur `codex/release-v2.4`.
- Pull request : GitHub #1 vers `main`.
- GitHub Actions : run `32492902447`, gate Node 22 / Linux réussi en 2 min 21 s, y compris parcours Chromium réels et artefact statique.
- Déploiement Vercel : `dpl_ABfTiQjbt8UTq4jniH8KLFFL9VjC`, état `READY`, cible production.
- URL canonique : `https://gearstorm-boss-circuit.vercel.app`.
- Le HTML public annonce bien v2.8 et la Forge rend 30 cartes avec 30 miniatures sans image cassée.
- Le manifeste public répond 200 et déclare application 2.8.0, sauvegarde v5, 30 boss, 90 phases, 90 contrats, assets 2.7.0, 225 WebP et 18 248 604 octets graphiques.
- Le bootstrap `pwa-update-v2.8.0.js` répond 200 avec cache immutable ; `sw.js` répond 200 avec `must-revalidate` et scope `/` ; un WebP NULL CROWN répond 200 en `image/webp` immutable.
- Le contrôle navigateur Chrome de production n’a remonté aucune erreur console ou page ; les ressources inspectées ont répondu 200.

## Verdict local

GEARSTORM 2.8.0 satisfait les gates automatisées observées : 69/69 tests Node, 13 E2E Chromium réussis avec 1 test volontairement ignoré, 7/7 Firefox, 6/7 WebKit avec 1 limite runner documentée, parcours accéléré des 24 boss jusqu’à la fin, build de 21 708 298 octets et audit npm sans vulnérabilité.

La CI distante est verte et la production Vercel est `READY`, servie en HTTP 200 avec les marqueurs v2.8 attendus. Les limites matérielles et portrait détaillées ci-dessus restent les seules réserves de validation.
