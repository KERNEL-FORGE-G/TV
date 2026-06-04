# Index de la documentation — Télécommande

Documentation en français, de A à Z, pour comprendre le **but**, le **fonctionnement** et chaque **fichier** du projet.

## Ordre de lecture recommandé

1. **[01-VUE-ENSEMBLE.md](./01-VUE-ENSEMBLE.md)** — Pourquoi l’app existe, comment les pièces s’assemblent (schémas, parcours).
2. **[02-INTERFACES-ET-TYPES.md](./02-INTERFACES-ET-TYPES.md)** — Contrats TypeScript (`Device`, `DiscoveryCandidate`, routes, etc.).
3. **[03-ECRANS-ET-COMPOSANTS.md](./03-ECRANS-ET-COMPOSANTS.md)** — Ce que voit l’utilisateur : onglets, modales, scan « orbite ».
4. **[04-SERVICES-ET-LOGIQUE.md](./04-SERVICES-ET-LOGIQUE.md)** — Logique métier : scan 45 s, IR, Smart TV, BLE, export.
5. **[05-REFERENCE-FICHIERS.md](./05-REFERENCE-FICHIERS.md)** — Table exhaustive fichier par fichier.
6. **[06-DEVELOPPEMENT.md](./06-DEVELOPPEMENT.md)** — Commandes npm, build, dépannage.

## Public cible

- **Utilisateur / testeur** — sections 1 et 3.
- **Développeur** — tout le dossier `docs/`, en particulier 2, 4 et 5.
- **Mainteneur build** — section 6 et `scripts/`.

## Fichiers hors `src/`

| Emplacement | Rôle |
|-------------|------|
| `App.tsx` | Racine React : assistant vs navigation principale |
| `index.js` | Point d’entrée Metro |
| `package.json` | Dépendances et scripts npm |
| `android/` | Manifest, permissions, icônes, Gradle |
| `ios/` | Projet Xcode (icônes, lancement) |
| `scripts/` | Automatisation build / logo / patch natif |
| `logo/tv-logo.png` | Source unique pour `npm run logo` |
| `__tests__/` | Test de rendu minimal |
| `autolinking.android.json` | Config CLI React Native (généré) |

Retour au [README](../README.md) du projet.
