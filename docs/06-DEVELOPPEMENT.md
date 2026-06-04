# Guide développement et exploitation

## Prérequis

| Outil | Version / note |
|-------|----------------|
| Node.js | ≥ 22.11 (`package.json` → `engines`) |
| npm | Livré avec Node |
| Android | SDK, `ANDROID_HOME`, appareil USB ou émulateur |
| Python 3 + Pillow | Pour `npm run logo` (`pip install Pillow`) |
| Java / Gradle | Via projet `android/` |

iOS : Xcode + CocoaPods si build Mac (`npm run ios`).

---

## Scripts npm

| Script | Action |
|--------|--------|
| `npm start` | Metro bundler |
| `npm run android` | `preandroid` → autolink, puis `run-android` |
| `npm run ios` | Lance simulateur / appareil iOS |
| `npm run verify` | `lint` + `typecheck` + `test` |
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run test` | Jest |
| `npm run autolink` | Génère `autolinking.android.json` |
| `npm run apk` | APK release → `telecommande-release.apk` |
| `npm run logo` | `scripts/build-logo.sh` — icônes + `src/assets/app-logo.png` |
| `npm run cleanup` | `scripts/cleanup-saturation.sh` — nettoyage caches |
| `postinstall` | Patch `react-native-ir-manager` |

---

## CI GitHub Actions

Workflow : [`.github/workflows/ci.yml`](../.github/workflows/ci.yml) — **CI & Android Release**

| Déclencheur | Jobs |
|-------------|------|
| Pull request sur `main` | `verify` uniquement (lint, TypeScript, Jest) |
| Push sur `main` | `verify` puis `build-apk` |
| `workflow_dispatch` (manuel) | `verify` + `build-apk` |

**Artefact APK :** après un build réussi, télécharger `telecommande-release-apk` depuis l’onglet **Actions** → exécution → **Artifacts** (rétention 90 jours). Contient `telecommande-release.apk` et une copie nommée avec le SHA du commit.

Badge : `![CI](https://github.com/KERNEL-FORGE-G/TV/actions/workflows/ci.yml/badge.svg)`

---

## Premier build Android

```bash
cd /chemin/vers/telecommande
npm install
npm run logo
npm run android
```

Si **BleManagerModule not found** : vérifier que `react-native-ble-manager` est bien autolinké (`npm run autolink` puis rebuild).

Si **IR** échoue à la compile : `bash scripts/patch-react-native-ir-manager.sh` (déjà en postinstall).

---

## Build APK release

```bash
npm run apk
```

Étapes internes (`scripts/build-apk-release.sh`) :

1. Patch IR
2. `./gradlew assembleRelease` dans `android/`
3. Copie vers `telecommande-release.apk` à la racine

Signer / aligner pour Play Store : configurer signing Gradle hors scope de ce doc.

---

## Logo et branding

Source unique : **`logo/tv-logo.png`**.

`npm run logo` génère :

- `src/assets/app-logo.png` (splash React, `PermissionGate`)
- `android/.../drawable/splash_logo.png`
- `mipmap-*/ic_launcher.png` et `ic_launcher_round.png`

Modifier le PNG source puis relancer `npm run logo` et rebuilder l’APK.

---

## Permissions Android (`AndroidManifest.xml`)

| Permission | Usage |
|------------|--------|
| `INTERNET` | Smart TV HTTP |
| `ACCESS_NETWORK_STATE`, `ACCESS_WIFI_STATE` | Sous-réseau |
| `NEARBY_WIFI_DEVICES` | Android 13+ sans localisation |
| `ACCESS_FINE_LOCATION` | Android 10–12, maxSdk 32 |
| `TRANSMIT_IR` | Port IR |
| `BLUETOOTH_*` | Scan / connexion BLE |
| `VIBRATE` | Haptique |

`consumerir` : `required="false"` — l’app s’installe sans IR.

`usesCleartextTraffic` : trafic HTTP local vers TV (Gradle placeholder).

---

## Tests

- `__tests__/App.test.tsx` — rendu racine avec mocks.
- `jest.setup.js` — mocks natifs (IR, BLE, etc.).

```bash
npm run verify
```

---

## Structure native Android (résumé)

| Chemin | Rôle |
|--------|------|
| `android/app/src/main/AndroidManifest.xml` | Permissions, activité |
| `android/app/src/main/java/.../MainActivity` | Point d’entrée RN |
| `android/app/src/main/res/mipmap-*` | Icônes launcher |
| `android/app/build.gradle` | Versions SDK, signing |

---

## Débogage courant

| Symptôme | Piste |
|----------|--------|
| Scan Wi‑Fi vide | Même LAN, remote activé sur TV, bon préfixe |
| Scan BT vide | Appairer dans réglages Android, BT activé |
| IR ne part pas | Pas d’émetteur ou code Pronto invalide — Réglages |
| LG / Samsung refuse | Ouvrir `PairingModal`, compléter appairage |
| Liste scan lente | Normal jusqu’à 45 s ; arrêt manuel possible |

---

## Variables et clés

- Pas de `.env` obligatoire pour le LAN.
- Tokens Samsung / clé LG : stockés dans le store (`pairings`, `device.connection`).

---

## Contribution / maintenance

1. Lire [01-VUE-ENSEMBLE.md](./01-VUE-ENSEMBLE.md).
2. Modifier le service concerné ([04-SERVICES-ET-LOGIQUE.md](./04-SERVICES-ET-LOGIQUE.md)).
3. Mettre à jour [05-REFERENCE-FICHIERS.md](./05-REFERENCE-FICHIERS.md) si nouveau fichier.
4. `npm run verify` avant commit.

Index : [INDEX.md](./INDEX.md)
