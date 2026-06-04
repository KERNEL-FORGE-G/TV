# Référence des fichiers (A → Z)

Chaque entrée : **rôle** et **liens** dans l’architecture. Les chemins sont relatifs à la racine du dépôt `telecommande/`.

---

## Racine du projet

| Fichier | Rôle |
|---------|------|
| `App.tsx` | Composant racine : gate permissions, wizard vs tabs |
| `index.js` | `AppRegistry.registerComponent` |
| `app.json` | Nom d’affichage React Native |
| `package.json` | Dépendances, scripts npm, `engines` Node |
| `package-lock.json` | Verrou versions npm |
| `tsconfig.json` | Config TypeScript strict |
| `babel.config.js` | Preset React Native |
| `metro.config.js` | Bundler Metro |
| `jest.config.js` | Config tests Jest |
| `jest.setup.js` | Mocks modules natifs pour tests |
| `.eslintrc.js` | Règles ESLint RN |
| `.prettierrc.js` | Formatage Prettier |
| `autolinking.android.json` | **Généré** — `npm run autolink` |
| `README.md` | Introduction + liens documentation |
| `telecommande-release.apk` | **Généré** — `npm run apk` |

---

## `__tests__/`

| Fichier | Rôle |
|---------|------|
| `App.test.tsx` | Test de rendu minimal de `App` |

---

## `docs/`

| Fichier | Rôle |
|---------|------|
| `INDEX.md` | Sommaire documentation |
| `01-VUE-ENSEMBLE.md` | Architecture et but |
| `02-INTERFACES-ET-TYPES.md` | Types TypeScript |
| `03-ECRANS-ET-COMPOSANTS.md` | UI et parcours |
| `04-SERVICES-ET-LOGIQUE.md` | Services métier |
| `05-REFERENCE-FICHIERS.md` | Ce document |
| `06-DEVELOPPEMENT.md` | Build et scripts |

---

## `logo/`

| Fichier | Rôle |
|---------|------|
| `tv-logo.png` | Source branding ; entrée de `npm run logo` |

---

## `scripts/`

| Fichier | Rôle |
|---------|------|
| `build-apk-release.sh` | `assembleRelease` + copie APK racine |
| `build-logo.sh` | Redimensionne logo → assets + mipmap Android |
| `patch-react-native-ir-manager.sh` | Correctifs compile module IR (postinstall) |
| `cleanup-saturation.sh` | Nettoyage node_modules / caches / build |

---

## `src/assets/`

| Fichier | Rôle |
|---------|------|
| `app-logo.png` | **Généré** — splash `PermissionGate` |

---

## `src/core/`

| Fichier | Rôle |
|---------|------|
| `remoteTypes.ts` | `TransportRoute`, `DiscoveryCandidate`, `Room`, `PairingRecord`, layouts, IR types |

---

## `src/data/`

| Fichier | Rôle |
|---------|------|
| `devices.ts` | `Device`, `Scene`, `DeviceConnection`, `Protocol`, `DeviceType` |
| `tvPlatforms.ts` | `TV_PLATFORMS`, `createDeviceFromPlatform`, `TvPlatformId` |
| `remoteLayouts.ts` | Sections télécommande par type d’appareil |
| `irDatabase.ts` | `IR_BRAND_DATABASE` — profils marques IR |
| `sceneTemplates.ts` | Modèles de scènes prédéfinies |

---

## `src/hooks/`

| Fichier | Rôle |
|---------|------|
| `useIR.ts` | Envoi commandes, scènes, texte, alertes, haptique |
| `useDevices.ts` | Sélection appareil actif, liste |

---

## `src/navigation/`

| Fichier | Rôle |
|---------|------|
| `AppNavigator.tsx` | Bottom tabs : Remote, Scenes, Devices, Settings |

---

## `src/screens/`

| Fichier | Rôle |
|---------|------|
| `RemoteScreen.tsx` | Onglet télécommande principale |
| `DevicesScreen.tsx` | Scan, adoption, liste appareils, santé |
| `ScenesScreen.tsx` | Gestion et exécution des scènes |
| `SettingsScreen.tsx` | Réglages, export, IR, journal |
| `SetupWizardScreen.tsx` | Onboarding première utilisation |

---

## `src/store/`

| Fichier | Rôle |
|---------|------|
| `remoteStore.ts` | Store Zustand persisté (`universal-remote-storage-v2`) |

---

## `src/theme/`

| Fichier | Rôle |
|---------|------|
| `index.ts` | `colors`, `spacing`, `typography`, `forms`, `shadows`, `motion`, `layout` |

---

## `src/types/`

| Fichier | Rôle |
|---------|------|
| `assets.d.ts` | Déclaration modules `*.png` |

---

## `src/utils/`

| Fichier | Rôle |
|---------|------|
| `permissions.ts` | Permissions Android + startup |
| `network.ts` | HTTP timeout, sous-réseau, liste hôtes |
| `bluetoothSettings.ts` | Intent réglages BT sans charger BLE |

---

## `src/components/` (racine)

| Fichier | Rôle |
|---------|------|
| `PermissionGate.tsx` | Splash permissions + logo |
| `Screen.tsx` | Layout écran safe area |
| `AppBackground.tsx` | Fond décoratif |
| `RemoteButton.tsx` | Bouton télécommande |
| `NavPad.tsx` | Croix directionnelle |
| `NumPad.tsx` | Pavé numérique |
| `VolumeControls.tsx` | Volume |
| `MediaControls.tsx` | Transport média |
| `TouchPad.tsx` | Pad gestuel |
| `DynamicRemotePanel.tsx` | Grille layout dynamique |
| `FavoritesBar.tsx` | Barre favoris |
| `DeviceSelector.tsx` | Sélecteur appareil |
| `AddTvModal.tsx` | Ajout TV manuel |
| `PairingModal.tsx` | Appairage LG/Samsung |
| `TvKeyboardModal.tsx` | Clavier texte vers TV |
| `FavoriteEditorModal.tsx` | Édition favori |
| `SceneEditorModal.tsx` | Édition scène |
| `IrCodeRegistration.tsx` | Saisie codes Pronto |
| `HardwareIrPanel.tsx` | État matériel IR |
| `PermissionsInfo.tsx` | Tableau permissions |

---

## `src/components/discovery/`

| Fichier | Rôle |
|---------|------|
| `ProximitySolarScan.tsx` | UI scan orbite + liste + arrêt 15 s |

---

## `src/components/ui/`

| Fichier | Rôle |
|---------|------|
| `AppHeader.tsx` | En-tête titre / action |
| `SectionBlock.tsx` | Bloc section animé |
| `SectionTitle.tsx` | Titre section |
| `Card.tsx` | Carte conteneur |
| `Badge.tsx` | Badge statut |
| `EmptyState.tsx` | État vide |
| `ScreenScroll.tsx` | ScrollView configuré |
| `ScreenEnter.tsx` | Animation entrée écran |
| `FadeIn.tsx` | Fondu |
| `AnimatedHeaderAction.tsx` | Bouton header animé |
| `TextField.tsx` | Champ texte thème |
| `FormButton.tsx` | Bouton formulaire |

---

## `src/services/` (racine)

| Fichier | Rôle |
|---------|------|
| `DeviceControlService.ts` | Façade envoi commandes |
| `IRService.ts` | Émission IR native, Pronto |
| `NetworkDiscoveryService.ts` | Scan /24 Smart TV |
| `BluetoothService.ts` | Commandes et online BT |

---

## `src/services/routing/`

| Fichier | Rôle |
|---------|------|
| `CommandRouter.ts` | Routage par protocole, labels |

---

## `src/services/ir/`

| Fichier | Rôle |
|---------|------|
| `irValidation.ts` | Validation Pronto, garde émetteur |

---

## `src/services/discovery/`

| Fichier | Rôle |
|---------|------|
| `DiscoveryManager.ts` | Orchestration scan Wi‑Fi 15 s |
| `BluetoothDiscoveryService.ts` | Scan BLE 15 s, appairés |
| `scanSession.ts` | Constante durée, `AbortSignal`, progression |
| `deviceCalibration.ts` | Re-sonde plateforme, calibrage candidats après scan / à l’adoption |
| `availability.ts` | Filtre appareils joignables |

---

## `src/services/ble/`

| Fichier | Rôle |
|---------|------|
| `bleManagerBridge.ts` | Accès natif BleManager sans import synchrone |

---

## `src/services/smartTv/`

| Fichier | Rôle |
|---------|------|
| `index.ts` | Agrégateur envoi / support commandes |
| `types.ts` | `DiscoveredTv` |
| `wifiCommands.ts` | Support commandes par plateforme |
| `commandMaps.ts` | Tables commande → API |
| `roku.ts` | Roku ECP + probe |
| `rokuApps.ts` | IDs apps Roku |
| `lg.ts` | LG webOS + probe |
| `samsung.ts` | Samsung Tizen + probe |
| `sony.ts` | Sony Bravia + probe |
| `philips.ts` | Philips JointSpace |

---

## `src/services/hubs/`

| Fichier | Rôle |
|---------|------|
| `BroadlinkService.ts` | Envoi IR via hub Broadlink |

---

## `src/services/pairing/`

| Fichier | Rôle |
|---------|------|
| `PairingService.ts` | Flux appairage TV |

---

## `src/services/health/`

| Fichier | Rôle |
|---------|------|
| `DeviceHealthService.ts` | Vérification connectivité appareils |

---

## `src/services/config/`

| Fichier | Rôle |
|---------|------|
| `ConfigExportService.ts` | Export / import JSON backup v1 |

---

## `android/` (fichiers clés)

| Fichier | Rôle |
|---------|------|
| `app/src/main/AndroidManifest.xml` | Permissions, activité, IR optionnel |
| `app/src/main/java/.../MainActivity.kt` | Activité React Native |
| `app/src/main/java/.../MainApplication.kt` | Application RN |
| `app/src/main/res/mipmap-*/ic_launcher*.png` | Icônes (**générées** par logo) |
| `app/src/main/res/drawable/splash_logo.png` | Drawable splash |
| `app/src/main/res/values/strings.xml` | Nom app |
| `app/src/main/res/values/styles.xml` | Thème Android |
| `app/build.gradle` | Config module app |
| `build.gradle` | Projet Gradle racine |
| `settings.gradle` | Modules Gradle |
| `gradle.properties` | Propriétés build |

---

## `ios/` (fichiers clés)

| Fichier | Rôle |
|---------|------|
| `telecommande/AppDelegate.swift` | Délégation iOS RN |
| `telecommande/Info.plist` | Config bundle iOS |
| `telecommande/Images.xcassets/` | Icônes iOS |
| `Podfile` | Dépendances CocoaPods |

---

## `.vscode/` / `dev/.vscode/`

| Fichier | Rôle |
|---------|------|
| `settings.json` | Préférences éditeur workspace |

---

## Fichiers générés / à ne pas éditer à la main

- `node_modules/`
- `android/app/build/`
- `android/build/`
- `autolinking.android.json` (sauf via `npm run autolink`)
- `src/assets/app-logo.png`, mipmap après `npm run logo`
- `telecommande-release.apk`

---

## Index alphabétique rapide (nom de fichier)

`AddTvModal.tsx` · `App.tsx` · `AppBackground.tsx` · `AppHeader.tsx` · `AppNavigator.tsx` · `availability.ts` · `bleManagerBridge.ts` · `BluetoothDiscoveryService.ts` · `BluetoothService.ts` · `BroadlinkService.ts` · `build-apk-release.sh` · `build-logo.sh` · `CommandRouter.ts` · `ConfigExportService.ts` · `DeviceControlService.ts` · `DeviceHealthService.ts` · `DeviceSelector.tsx` · `DevicesScreen.tsx` · `DiscoveryManager.ts` · `DynamicRemotePanel.tsx` · `FavoriteEditorModal.tsx` · `FavoritesBar.tsx` · `FormButton.tsx` · `HardwareIrPanel.tsx` · `index.js` · `IrCodeRegistration.tsx` · `irDatabase.ts` · `IRService.ts` · `irValidation.ts` · `lg.ts` · `MediaControls.tsx` · `NavPad.tsx` · `NetworkDiscoveryService.ts` · `NumPad.tsx` · `PairingModal.tsx` · `PairingService.ts` · `PermissionGate.tsx` · `PermissionsInfo.tsx` · `philips.ts` · `ProximitySolarScan.tsx` · `remoteLayouts.ts` · `remoteStore.ts` · `RemoteButton.tsx` · `RemoteScreen.tsx` · `roku.ts` · `rokuApps.ts` · `samsung.ts` · `scanSession.ts` · `SceneEditorModal.tsx` · `sceneTemplates.ts` · `ScenesScreen.tsx` · `Screen.tsx` · `SettingsScreen.tsx` · `SetupWizardScreen.tsx` · `sony.ts` · `TouchPad.tsx` · `tvPlatforms.ts` · `TvKeyboardModal.tsx` · `useDevices.ts` · `useIR.ts` · `VolumeControls.tsx` · `wifiCommands.ts` · …

Pour le détail fonctionnel d’un fichier, croiser avec [04-SERVICES-ET-LOGIQUE.md](./04-SERVICES-ET-LOGIQUE.md) ou [03-ECRANS-ET-COMPOSANTS.md](./03-ECRANS-ET-COMPOSANTS.md).
