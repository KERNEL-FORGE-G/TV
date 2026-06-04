import { Device, Protocol } from './devices';

/**
 * Plateformes avec implémentation réseau ou IR documentée dans l’app.
 * (Pas de fausses entrées Android TV / Fire / Apple TV sans API.)
 */
export type TvPlatformId =
  | 'ir_generic'
  | 'bluetooth_generic'
  | 'roku'
  | 'lg_webos'
  | 'samsung_tizen'
  | 'sony_bravia'
  | 'philips_android'
  | 'tcl_roku';

export interface TvPlatformDef {
  id: TvPlatformId;
  label: string;
  brand: string;
  protocol: Protocol;
  defaultPort?: number;
  needsHost: boolean;
  needsPairing?: boolean;
  hint: string;
}

export const TV_PLATFORMS: TvPlatformDef[] = [
  {
    id: 'ir_generic',
    label: 'TV universelle (IR)',
    brand: 'Générique',
    protocol: 'IR',
    needsHost: false,
    hint: 'Port IR du téléphone. Capturez vos signaux dans Réglages → Codes IR.',
  },
  {
    id: 'bluetooth_generic',
    label: 'TV / barre son (Bluetooth)',
    brand: 'Bluetooth',
    protocol: 'Bluetooth',
    needsHost: false,
    hint:
      'Appairez l’appareil dans les réglages Bluetooth du téléphone, puis scannez ici.',
  },
  {
    id: 'roku',
    label: 'Roku / TCL Roku TV',
    brand: 'Roku',
    protocol: 'WiFi',
    defaultPort: 8060,
    needsHost: true,
    hint: 'Même réseau Wi‑Fi. IP dans Réglages → Réseau sur la TV.',
  },
  {
    id: 'tcl_roku',
    label: 'TCL (Roku OS)',
    brand: 'TCL',
    protocol: 'WiFi',
    defaultPort: 8060,
    needsHost: true,
    hint: 'Identique à Roku si la TCL utilise Roku OS.',
  },
  {
    id: 'lg_webos',
    label: 'LG webOS',
    brand: 'LG',
    protocol: 'WiFi',
    defaultPort: 3000,
    needsHost: true,
    needsPairing: true,
    hint: 'Appairage LG obligatoire (clé affichée sur la TV).',
  },
  {
    id: 'samsung_tizen',
    label: 'Samsung Tizen',
    brand: 'Samsung',
    protocol: 'WiFi',
    defaultPort: 8001,
    needsHost: true,
    needsPairing: true,
    hint: 'Acceptez la demande sur la TV au premier envoi.',
  },
  {
    id: 'sony_bravia',
    label: 'Sony Bravia',
    brand: 'Sony',
    protocol: 'WiFi',
    defaultPort: 80,
    needsHost: true,
    hint: 'Activez la télécommande réseau (IP Control) dans les réglages Sony.',
  },
  {
    id: 'philips_android',
    label: 'Philips Android TV',
    brand: 'Philips',
    protocol: 'WiFi',
    defaultPort: 1925,
    needsHost: true,
    hint: 'API JointSpace — même réseau local que la TV.',
  },
];

export function getPlatformDef(id: TvPlatformId): TvPlatformDef {
  return TV_PLATFORMS.find((p) => p.id === id) ?? TV_PLATFORMS[0];
}

export function createDeviceFromPlatform(
  platformId: TvPlatformId,
  opts: {
    id?: string;
    name: string;
    host?: string;
    port?: number;
    mac?: string;
    lgClientKey?: string;
    hubHost?: string;
    model?: string;
  },
): Device {
  const def = getPlatformDef(platformId);
  const id = opts.id ?? `dev-${Date.now()}`;
  const host = opts.host?.trim();

  return {
    id,
    name: opts.name,
    brand: def.brand,
    model: opts.model,
    type: 'tv',
    protocol: def.protocol,
    tvPlatform: platformId,
    isOnline: !!host || !!opts.mac?.trim(),
    isPoweredOn: false,
    icon: '📺',
    hubId: opts.hubHost,
    connection: {
      host,
      port: opts.port ?? def.defaultPort,
      mac: opts.mac,
      hubHost: opts.hubHost,
      lgClientKey: opts.lgClientKey,
    },
    irCodes: {},
  };
}
