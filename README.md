# Télécommande universelle (React Native)


[![CI & Android Release](https://github.com/KERNEL-FORGE-G/TV/actions/workflows/ci.yml/badge.svg)](https://github.com/KERNEL-FORGE-G/TV/actions/workflows/ci.yml)

Application mobile **Android** (iOS prévu) pour piloter téléviseurs et appareils du salon : **Wi‑Fi** (Roku, LG, Samsung, Sony, Philips), **infrarouge** (émetteur du téléphone), **Bluetooth**, et scènes multi-appareils.

## Documentation complète

| Document | Contenu |
|----------|---------|
| [docs/INDEX.md](docs/INDEX.md) | Sommaire et ordre de lecture |
| [docs/01-VUE-ENSEMBLE.md](docs/01-VUE-ENSEMBLE.md) | But du projet, architecture, flux de données |
| [docs/02-INTERFACES-ET-TYPES.md](docs/02-INTERFACES-ET-TYPES.md) | Toutes les interfaces TypeScript |
| [docs/03-ECRANS-ET-COMPOSANTS.md](docs/03-ECRANS-ET-COMPOSANTS.md) | Écrans, navigation, composants UI |
| [docs/04-SERVICES-ET-LOGIQUE.md](docs/04-SERVICES-ET-LOGIQUE.md) | Découverte, routage, IR, Smart TV, persistance |
| [docs/05-REFERENCE-FICHIERS.md](docs/05-REFERENCE-FICHIERS.md) | Référence A→Z de chaque fichier |
| [docs/06-DEVELOPPEMENT.md](docs/06-DEVELOPPEMENT.md) | Installation, scripts npm, build APK, logo |
| [docs/07-DECOUVERTE-SCAN.md](docs/07-DECOUVERTE-SCAN.md) | Scan appareils, TV vs BT, stabilité |

## Démarrage rapide

**Prérequis :** Node.js ≥ 22.11, JDK/Android SDK pour Android, appareil ou émulateur.

```bash
npm install
npm run logo          # optionnel : icônes + splash depuis logo/tv-logo.png
npm run android       # compile et lance sur appareil USB
npm run verify        # lint + TypeScript + tests
npm run apk           # APK release → telecommande-release.apk
```

## Structure du dépôt (résumé)

```
telecommande/
├── App.tsx                 # Point d'entrée React
├── index.js                # Enregistrement RN
├── src/                    # Code applicatif (voir docs/)
├── android/                # Projet natif Android
├── ios/                    # Projet natif iOS
├── scripts/                # Build APK, logo, patch IR
└── logo/tv-logo.png        # Source graphique
```

## Onglets principaux

1. **Télécommande** — touches, pad, volume, favoris, clavier texte (Roku).
2. **Scènes** — enchaînements de commandes.
3. **Appareils** — scan Wi‑Fi / Bluetooth (45 s, arrêt possible).
4. **Réglages** — permissions, IR, codes Pronto, export/import, journal.

Projet privé (`package.json` → `private: true`).
