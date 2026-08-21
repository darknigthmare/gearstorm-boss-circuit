# Rapport QA — GEARSTORM: Boss Circuit 2.7.0

Validation locale effectuée le 21 août 2026 sur le candidat v2.7.0.

## Gates de release

- `npm run qa` : réussi.
- Syntaxe Node : réussie sur le moteur, les registres, le serveur, le service worker et les scripts de release.
- Tests automatisés : 61/61 réussis.
- Build et `check-release` : réussis.
- Bundle public : 21 697 935 octets.
- Catalogue graphique : 225 WebP v2.7.0, 18 248 604 octets, dérivés de 26 masters OpenAI documentés ; les masters sont exclus de `dist/`.
- Contenu livré : 30 boss, 90 phases et 90 contrats de maîtrise.
- `npm audit --audit-level=high` : 0 vulnérabilité.

## QA navigateur

La QA a utilisé Google Chrome local via Playwright, le navigateur intégré étant indisponible dans cette session à cause de l’ACL Windows. Les tests sont reproductibles avec `npm run test:e2e`.

Résultat E2E : 5 tests réussis, 1 test volontairement ignoré. La matrice lourde de 72 lancements (24 boss Forge × 3 phases) tourne une fois sur Chromium desktop ; les parcours menu, Forge, rig de Riva et reprise du Circuit tournent aussi en émulation tactile mobile.

Parcours contrôlés :

- titre, navigation, Laboratoire, Forge intégrale et absence de débordement horizontal ;
- 30 cartes de boss et 24 signatures `mechanicId` distinctes ;
- lancement des 24 boss Forge dans chacune de leurs trois phases ;
- démarrage et checkpoint reprenable du Circuit Forge ;
- traversée accélérée des 24 victoires, choix d’améliorations et véritable écran de fin ;
- rendu représentatif des quatre vagues : Bastion Ricochet, Floodline Leviathan, Carrier Cathedral et Null Crown ;
- viewport desktop 1440 × 900, portrait tactile 390 × 844 et HUD tactile.

## Audit visuel

Dix captures ont été générées, dont une de la production publique sous `audit-visual-v27/`. Aucun visuel de référence externe pixel-perfect n’existait ; la comparaison a donc porté sur le système visuel du jeu, les ancres logiques 1280 × 720 et les contrats de rig.

Constats validés :

- les semelles de Riva et son ombre touchent le plancher logique ;
- le corps composite sépare lisiblement tête, buste, taille et jambes ; aucun troisième bras ni avant-bras flottant n’est visible ;
- le bras-canon rejoint le socket d’épaule sans doublonner le torse ;
- les boss Forge assemblent quatre pièces manifestées, gardent leur noyau sur la hitbox et projettent désormais une ombre au sol lorsqu’ils sont en hauteur ;
- les backdrops Forge respectent le plancher à `GROUND = 620`, le HUD conserve son contraste et les télégraphes restent visibles ;
- le menu, la grille Forge, le combat mobile et l’épilogue ne débordent pas ;
- le bilan Forge affiche cinq statistiques équilibrées sans détruire la structure DOM accessible.

## Contenu et progression

- La campagne historique reste distincte du Laboratoire.
- Le Circuit Forge enchaîne les machines 07 à 30 en quatre vagues, conserve le build, sauvegarde entre les victoires et se termine sur l’épilogue « Protocole sans couronne ».
- La sauvegarde v5 migre les schémas v4, v3 et v2.
- Les 24 boss ont 24 signatures et 72 états de phase uniques, bâtis sur huit familles moteur éprouvées.
- Les 72 contrats Forge sont instrumentés ; avec les 18 contrats de campagne, le jeu en expose 90.
- Les assets disposent d’un fallback procédural et le cache PWA ne précache pas les 225 WebP d’un seul bloc.

## Limites de validation

- Aucun test matériel n’a été effectué avec une manette physique, un écran tactile réel ou un lecteur d’écran.
- L’émulation mobile Chromium ne remplace pas les performances d’un appareil bas de gamme.
- Firefox, Safari/WebKit et le comportement de quota PWA extrême ne sont pas couverts par ce passage.
- Les 24 backdrops sont des tableaux monocouche : ils sont uniques et cohérents, mais moins profonds que les six arènes historiques à quatre plans parallaxes.
- Les signatures propres aux 24 boss reposent volontairement sur huit familles de simulation communes ; elles ne constituent pas 24 moteurs physiques indépendants.

## Vérification de production

Le commit c063fa7 a passé le gate GitHub Actions Node 22/Linux puis a été promu sur Vercel. Le déploiement est READY sur https://gearstorm-boss-circuit.vercel.app.

- page publique : HTTP 200 avec CSP, HSTS, COOP et politique de permissions ;
- build-manifest.json : application 2.7.0, sauvegarde v5, 30 boss, 90 phases, 90 contrats et 225 assets ;
- asset Forge : HTTP 200, image/webp, cache public 1 an immutable ;
- service worker : HTTP 200, portée racine et revalidation immédiate ;
- parcours Chrome public : titre chargé, Forge ouverte, 30 cartes présentes, aucune erreur console.

## Verdict final

GEARSTORM 2.7.0 est publié et vérifié. La release, la sécurité, la CI Linux, les 30 boss, les 90 phases, les 90 contrats et les parcours navigateur contrôlés sont verts, dans les limites matérielles et multi-navigateurs listées ci-dessus.
