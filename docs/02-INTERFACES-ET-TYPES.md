# Interfaces et types TypeScript

Ce document décrit les **contrats de données** partagés entre l’UI, le store et les services. Fichiers sources : `src/core/remoteTypes.ts`, `src/data/devices.ts`, `src/data/tvPlatforms.ts`.

---

## `TransportRoute` (`remoteTypes.ts`)

Chemin technique utilisé pour envoyer une commande.

| Valeur | Signification |
|--------|----------------|
| `IR_NATIVE` | Émetteur infrarouge du téléphone |
| `IR_GATEWAY` | Hub Broadlink (IP dans `connection.hubHost` ou `hubId`) |
| `LAN_DIRECT` | HTTP vers Smart TV sur le LAN |
| `BLUETOOTH` | Périphérique BLE appairé / détecté |
| `HDMI_CEC_GATEWAY` | Réservé, non implémenté sur mobile |

Résolution : `CommandRouter.resolveTransportRoute(device)`.

---

## `DiscoveryCandidate`

Représente une TV ou un appareil **trouvé pendant un scan**, avant ou après ajout au foyer.

| Champ | Type | Description |
|-------|------|-------------|
| `id` | `string` | Ex. `roku-192.168.1.42` ou `bt-AA:BB:…` |
| `name` | `string` | Nom affiché (marque, hostname, BLE) |
| `host` | `string` | IP Wi‑Fi ou libellé BT |
| `platformId` | `TvPlatformId` | Plateforme pour `createDeviceFromPlatform` |
| `port` | `number?` | Port API (8060 Roku, 3000 LG, etc.) |
| `mac` | `string?` | Adresse BLE |
| `protocol` | `Protocol` | `WiFi` ou `Bluetooth` |
| `route` | `TransportRoute` | Route prévue après adoption |
| `status` | `'pending' \| 'adopted' \| 'dismissed'` | État dans la liste de scan |
| `discoveredAt` | `number` | Timestamp ms |
| `signalStrength` | `number?` | RSSI BLE |
| `bluetoothSource` | `'bonded' \| 'scan'?` | Origine de la détection BT |

---

## `Device` (`devices.ts`)

Appareil **enregistré** dans le foyer (télécommande active).

| Champ | Type | Description |
|-------|------|-------------|
| `id` | `string` | Identifiant unique |
| `name` | `string` | Nom utilisateur |
| `brand` | `string` | Marque affichée |
| `model` | `string?` | Modèle optionnel |
| `type` | `DeviceType` | `tv`, `decoder`, `ac`, `soundbar`, `projector`, `dvd` |
| `protocol` | `Protocol` | `IR`, `WiFi`, `Bluetooth`, `RF` |
| `tvPlatform` | `TvPlatformId?` | Pilote Smart TV / générique |
| `connection` | `DeviceConnection?` | IP, port, MAC, tokens, hub |
| `roomId` | `string?` | Pièce (`Room`) |
| `irBrandId` / `irCodeSetId` | `string?` | Profil base de données IR |
| `isOnline` | `boolean` | Dernière santé connue |
| `isPoweredOn` | `boolean` | État power local (UI) |
| `icon` | `string` | Emoji ou symbole |
| `hubId` | `string?` | Passerelle Broadlink |
| `irCodes` | `Record<string, string>` | Codes Pronto par commande (`power`, `vol_up`, …) |

### `DeviceConnection`

| Champ | Usage |
|-------|--------|
| `host` | IP LAN |
| `port` | Port HTTP API |
| `mac` | Bluetooth |
| `hubHost` | IP Broadlink |
| `lgClientKey` | Appairage LG webOS |
| `samsungToken` | Token REST Samsung |

---

## `Scene` / `SceneAction`

| `Scene` | Scène nommée (cinéma, nuit…) |
| `SceneAction` | `{ deviceId, command, delayMs }` — exécution séquentielle dans `useIR.runScene` |

---

## `Room`, `PairingRecord`, `FavoriteChannel`, `LearnedIrEntry`

- **`Room`** : `{ id, name, icon }` — organisation du foyer.
- **`PairingRecord`** : état appairage LG/Samsung (`none` | `pending` | `paired` | `failed`, tokens, erreurs).
- **`FavoriteChannel`** : raccourci utilisateur `{ deviceId, label, command, icon? }`.
- **`LearnedIrEntry`** : code Pronto appris `{ deviceId, command, prontoCode, learnedAt }` — prioritaire sur `device.irCodes` à l’envoi.

---

## Layout télécommande

- **`RemoteLayoutButton`** : `{ command, label, variant?, col? }`.
- **`RemoteLayoutSection`** : `{ id, title?, buttons[] }` — définitions dans `remoteLayouts.ts` par `DeviceType`.

---

## IR base de données

- **`IrBrandProfile`** : marque + `codeSets[]`.
- **`IrCodeSet`** : `{ id, label, region?, codes: Record<command, pronto> }` — fichier `irDatabase.ts`.

---

## `TvPlatformId` / `TvPlatformDef`

IDs supportés avec implémentation réelle :

`ir_generic`, `bluetooth_generic`, `roku`, `tcl_roku`, `lg_webos`, `samsung_tizen`, `sony_bravia`, `philips_android`.

`TvPlatformDef` : `label`, `brand`, `protocol`, `defaultPort`, `needsHost`, `needsPairing`, `hint`.

Factory : **`createDeviceFromPlatform(platformId, overrides?)`** dans `tvPlatforms.ts`.

---

## Store Zustand (`remoteStore.ts`)

Interface **`RemoteStore`** (extrait des actions) :

| État | Actions principales |
|------|---------------------|
| `devices`, `activeDeviceId` | `addDevice`, `updateDevice`, `removeDevice`, `setActiveDevice` |
| `scenes` | `addScene`, `removeScene` |
| `discoveryCandidates` | `setDiscoveryCandidates`, `updateCandidate` |
| `pairings` | `setPairing` |
| `favorites`, `learnedIr` | `addFavorite`, `removeFavorite`, `addLearnedIr` |
| `preferences` | `setHaptics`, `setConfirmPower`, `setOnboardingComplete`, `setDefaultSubnet` |
| `commandLog` | `logCommand`, `clearLog` |
| — | `importBackup` |

**`RemotePreferences`** : `haptics`, `confirmPower`, `onboardingComplete`, `defaultSubnet`.

---

## Backup (`ConfigExportService`)

**`RemoteBackup`** v1 : `householdName`, `rooms`, `devices`, `scenes`, `favorites`, `learnedIr?`, `pairings?`, `preferences?`, `exportedAt`.

---

## Options de scan

**`DiscoveryScanOptions`** (`scanSession.ts`) :

```ts
{
  signal?: AbortSignal;
  onProgress?: (info: { elapsedMs, totalMs, pct, label }) => void;
}
```

**`SCAN_DURATION_MS`** = 45 000.

---

## Résultats d’envoi

- **`IRSendResult`** / **`DeviceSendResult`** : `{ success: boolean; error?: string; needsPairing?: boolean }`.

---

## Déclarations assets

`src/types/assets.d.ts` — `declare module '*.png'` pour imports Metro (`app-logo.png`).
