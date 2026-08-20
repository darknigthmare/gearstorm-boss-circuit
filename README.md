# GEARSTORM: Boss Circuit

GEARSTORM est un boss rush 2D original conçu comme un jeu complet : Riva Spark traverse les six machines transformables du Professeur Cassian Voltério, améliore son équipement entre les combats et libère les districts emprisonnés dans le Circuit.

## Jouer

Prérequis pour le serveur local et les outils de validation : Node.js 22 ou plus récent.

```text
npm install
npm start
```

Ouvrir ensuite `http://127.0.0.1:8080`. Sous Windows, `LANCER_LE_JEU.bat` lance aussi la version locale directement dans le navigateur.

La version hébergée est une PWA : après une première visite réussie, le navigateur peut l’installer et la relancer hors ligne. Le mode `file://` reste jouable, mais l’installation PWA et le cache hors ligne exigent HTTP ou HTTPS.

## Contenu

- Six boss originaux, chacun structuré en trois phases lisibles.
- Campagne complète, Laboratoire d’entraînement, trois difficultés et épilogue.
- Choix d’améliorations entre les combats du Circuit.
- Surcharge Overdrive, ruée invulnérable, double saut et tir évolutif.
- Clavier AZERTY/QWERTY, souris, manette standard et commandes tactiles.
- Sauvegarde locale versionnée, migrée et normalisée.
- Audio et musique synthétiques via Web Audio, sans dépendance distante.
- Mouvement réduit, contraste renforcé et réglage des tremblements.
- PWA installable avec cache hors ligne et présentation sociale dédiée.

## Commandes

| Action | Clavier / souris | Manette |
| --- | --- | --- |
| Déplacement | `Q/D`, `A/D`, flèches | Stick gauche |
| Saut | `Espace`, `W`, flèche haut | A |
| Tir | `J`, `Z`, `C`, clic gauche | X |
| Ruée | `K`, `Maj` | B |
| Surcharge | `L`, `X` | Y |
| Pause | `Échap`, `P` | Menu |

## Qualité et build

```text
npm run qa
```

Cette commande vérifie la syntaxe, les contrats du moteur et de la PWA, le serveur HTTP, puis génère et contrôle le bundle web. Le dossier `dist/` ne contient que les fichiers destinés à Vercel : runtime, manifeste, service worker, assets et manifeste d’intégrité SHA-256.

Commandes ciblées :

```text
npm test
npm run build
npm run check:release
```

## Publication

- GitHub Actions exécute `npm ci`, `npm run qa` et l’audit des dépendances.
- `vercel.json` utilise `npm run build` et publie uniquement `dist/`.
- Les archives ZIP sont des artefacts de release ; elles ne sont pas versionnées dans Git.
- Les secrets Vercel ou GitHub restent dans les coffres de la plateforme et ne doivent jamais être ajoutés au dépôt.

## Structure

- `index.html`, `styles.css`, `game.js` : jeu et interface.
- `assets/` : icône PWA et key art original.
- `manifest.webmanifest`, `sw.js` : installation et fonctionnement hors ligne.
- `server.js` : serveur local à surface publique restreinte.
- `scripts/build.mjs` : bundle web reproductible et empreintes SHA-256.
- `scripts/check-release.mjs` : garde-fous de publication.
- `tests/` : contrats du jeu et tests HTTP.
- `DESIGN.md` : univers et conception détaillée.

Projet original. Tous droits réservés.
