import { Platform, PermissionsAndroid, Alert, Linking } from 'react-native';
import {
  getIrReadiness,
  irReadinessMessage,
  isIrNativeModuleLinked,
} from '../services/IRService';

type AndroidPerm =
  (typeof PermissionsAndroid.PERMISSIONS)[keyof typeof PermissionsAndroid.PERMISSIONS];

export type PermissionScope = 'network' | 'ir' | 'haptics' | 'bluetooth';

export interface PermissionFeatureInfo {
  scope: PermissionScope;
  title: string;
  description: string;
  androidPermissions: string[];
  iosNote: string;
}

/** Référence : permission Android ↔ fonctionnalité */
export const PERMISSION_FEATURES: PermissionFeatureInfo[] = [
  {
    scope: 'network',
    title: 'Scan & TV Wi‑Fi',
    description: 'Découverte des TV sur le réseau local et envoi des commandes HTTP.',
    androidPermissions: [
      'INTERNET',
      'ACCESS_NETWORK_STATE',
      'ACCESS_WIFI_STATE',
      'NEARBY_WIFI_DEVICES (Android 13+)',
      'ACCESS_FINE_LOCATION (Android 10–12)',
    ],
    iosNote: 'Réseau local (NSLocalNetworkUsageDescription)',
  },
  {
    scope: 'ir',
    title: 'Infrarouge (IR)',
    description:
      'Permission TRANSMIT_IR (manifeste) + module natif + émetteur IR du téléphone pour les codes Pronto.',
    androidPermissions: ['TRANSMIT_IR', 'android.hardware.consumerir'],
    iosNote: 'Non disponible sur iPhone (pas de port IR)',
  },
  {
    scope: 'haptics',
    title: 'Vibration',
    description: 'Retour tactile à chaque touche.',
    androidPermissions: ['VIBRATE'],
    iosNote: 'Automatique (Taptic Engine)',
  },
  {
    scope: 'bluetooth',
    title: 'Bluetooth',
    description:
      'Découverte des TV / barres de son appairées et scan Bluetooth à proximité.',
    androidPermissions: ['BLUETOOTH_CONNECT', 'BLUETOOTH_SCAN'],
    iosNote: 'NSBluetoothAlwaysUsageDescription',
  },
];

function androidApiLevel(): number {
  return typeof Platform.Version === 'number' ? Platform.Version : 0;
}

function networkRuntimePermissions(): AndroidPerm[] {
  const api = androidApiLevel();
  if (api >= 33) {
    return [PermissionsAndroid.PERMISSIONS.NEARBY_WIFI_DEVICES];
  }
  if (api >= 29) {
    return [PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION];
  }
  return [];
}

function bluetoothRuntimePermissions(): AndroidPerm[] {
  const api = androidApiLevel();
  if (api >= 31) {
    const perms: AndroidPerm[] = [PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT];
    const scan = PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN;
    if (scan) perms.push(scan);
    return perms;
  }
  return [];
}

async function checkAllGranted(permissions: AndroidPerm[]): Promise<boolean> {
  if (permissions.length === 0) return true;
  const checks = await Promise.all(
    permissions.map((p) => PermissionsAndroid.check(p)),
  );
  return checks.every(Boolean);
}

async function requestGroup(
  permissions: AndroidPerm[],
  rationale: { title: string; message: string },
): Promise<boolean> {
  if (permissions.length === 0) return true;

  const already = await checkAllGranted(permissions);
  if (already) return true;

  const result = await PermissionsAndroid.requestMultiple(permissions);
  const granted = permissions.every(
    (p) =>
      result[p as keyof typeof result] === PermissionsAndroid.RESULTS.GRANTED,
  );

  if (!granted) {
    Alert.alert(rationale.title, rationale.message, [
      { text: 'Plus tard', style: 'cancel' },
      {
        text: 'Ouvrir les réglages',
        onPress: () => Linking.openSettings(),
      },
    ]);
  }

  return granted;
}

/** Scan réseau + détection du préfixe Wi‑Fi (NetInfo) */
export async function ensureNetworkPermissions(): Promise<boolean> {
  if (Platform.OS !== 'android') return true;
  return requestGroup(networkRuntimePermissions(), {
    title: 'Accès réseau requis',
    message:
      'Pour scanner les TV sur votre Wi‑Fi, autorisez l’accès au réseau à proximité (Android 13+) ou la localisation (Android 10–12). Aucune position GPS n’est enregistrée.',
  });
}

/** Bluetooth : appairés + scan BLE */
export async function ensureBluetoothPermissions(): Promise<boolean> {
  if (Platform.OS !== 'android') return true;
  return requestGroup(bluetoothRuntimePermissions(), {
    title: 'Bluetooth requis',
    message:
      'Autorisez Bluetooth pour détecter les TV et barres de son déjà appairées à votre téléphone, et pour en scanner de nouvelles à proximité.',
  });
}

/**
 * Prépare le mode IR : module natif + émetteur matériel.
 * TRANSMIT_IR est une permission « normale » (accordée à l’installation, pas de dialogue).
 */
export async function ensureIrPermissions(options?: {
  silent?: boolean;
}): Promise<boolean> {
  const readiness = await getIrReadiness();
  if (readiness.ready) return true;

  if (!options?.silent) {
    const title =
      readiness.reason === 'module'
        ? 'Module IR manquant'
        : readiness.reason === 'hardware'
          ? 'Émetteur IR absent'
          : 'IR indisponible';
    Alert.alert(title, irReadinessMessage(readiness));
  }

  return false;
}

/** Haptique : VIBRATE (normal, pas de dialogue) */
export async function ensureHapticsPermissions(): Promise<boolean> {
  return true;
}

export async function ensurePermissionsForScope(
  scope: PermissionScope,
): Promise<boolean> {
  switch (scope) {
    case 'network':
      return ensureNetworkPermissions();
    case 'ir':
      return ensureIrPermissions();
    case 'haptics':
      return ensureHapticsPermissions();
    case 'bluetooth':
      return ensureBluetoothPermissions();
    default:
      return true;
  }
}

/**
 * Demandé à l’ouverture : réseau + Bluetooth + contrôle IR (sans bloquer si pas d’émetteur).
 */
export async function ensureStartupPermissions(): Promise<{
  network: boolean;
  bluetooth: boolean;
  ir: boolean;
}> {
  if (Platform.OS !== 'android') {
    return { network: true, bluetooth: true, ir: false };
  }

  const network = await ensureNetworkPermissions();
  const bluetooth = await ensureBluetoothPermissions();
  const ir = await ensureIrPermissions({ silent: true });

  return { network, bluetooth, ir };
}

/** Statut des permissions / matériel (écran Réglages) */
export async function getAndroidPermissionStatus(): Promise<
  Record<PermissionScope, 'granted' | 'denied' | 'not_required'>
> {
  if (Platform.OS !== 'android') {
    return {
      network: 'not_required',
      ir: 'not_required',
      haptics: 'not_required',
      bluetooth: 'not_required',
    };
  }

  const net = await checkAllGranted(networkRuntimePermissions());
  const bt = await checkAllGranted(bluetoothRuntimePermissions());
  const irReady = await getIrReadiness();

  return {
    network: networkRuntimePermissions().length === 0
      ? 'not_required'
      : net
        ? 'granted'
        : 'denied',
    ir: irReady.ready
      ? 'granted'
      : irReady.reason === 'module' || !isIrNativeModuleLinked()
        ? 'denied'
        : 'not_required',
    haptics: 'not_required',
    bluetooth: bluetoothRuntimePermissions().length === 0
      ? 'not_required'
      : bt
        ? 'granted'
        : 'denied',
  };
}

/** Au moins un appareil de l’inventaire utilise l’IR natif du téléphone. */
export function deviceNeedsIrEmitter(
  devices: { protocol: string }[],
): boolean {
  return devices.some((d) => d.protocol === 'IR');
}
