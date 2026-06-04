import { Platform } from 'react-native';
import type { SmartTvSendResult } from './smartTv/types';
import { ensureBluetoothPermissions } from '../utils/permissions';
import { openSystemBluetoothSettings } from '../utils/bluetoothSettings';
import { getBleManager } from './ble/bleManagerBridge';

export { openSystemBluetoothSettings };

let bleStarted = false;

const MEDIA_COMMANDS = new Set([
  'vol_up',
  'vol_down',
  'mute',
  'play',
  'pause',
  'stop',
  'power',
]);

async function startBle(): Promise<boolean> {
  const BleManager = getBleManager();
  if (!BleManager) return false;
  if (!bleStarted) {
    await BleManager.start({ showAlert: false });
    bleStarted = true;
  }
  return true;
}

async function ensureConnected(peripheralId: string): Promise<void> {
  const BleManager = getBleManager();
  if (!BleManager || !(await startBle())) {
    throw new Error('Module Bluetooth non disponible. Recompilez : npm run android');
  }
  const connected = await BleManager.isPeripheralConnected(peripheralId, []);
  if (!connected) {
    await BleManager.connect(peripheralId);
  }
}

/** Vérifie que l’appareil Bluetooth répond (connexion GATT) */
export async function checkBluetoothDeviceOnline(
  peripheralId?: string,
): Promise<boolean> {
  if (!peripheralId || Platform.OS === 'web') return false;
  if (!getBleManager()) return false;
  if (!(await ensureBluetoothPermissions())) return false;

  const BleManager = getBleManager();
  if (!BleManager) return false;

  try {
    if (!(await startBle())) return false;
    return await BleManager.isPeripheralConnected(peripheralId, []);
  } catch {
    try {
      await ensureConnected(peripheralId);
      await BleManager.disconnect(peripheralId);
      return true;
    } catch {
      return false;
    }
  }
}

/**
 * Commandes Bluetooth — connexion GATT réelle.
 * Les télécommandes HID système passent par l’appairage Android/iOS ;
 * l’app tente une connexion puis indique les limites du protocole fabricant.
 */
export async function sendBluetoothCommand(
  command: string,
  mac?: string,
): Promise<SmartTvSendResult> {
  if (!mac?.trim()) {
    return {
      success: false,
      error: 'Identifiant Bluetooth manquant. Rescannez l’appareil.',
    };
  }

  if (!getBleManager()) {
    return {
      success: false,
      error: 'Module Bluetooth absent. Relancez npm run android.',
    };
  }

  if (!(await ensureBluetoothPermissions())) {
    return {
      success: false,
      error: 'Permission Bluetooth refusée.',
    };
  }

  try {
    await ensureConnected(mac);

    if (MEDIA_COMMANDS.has(command) || command === 'power') {
      return {
        success: false,
        error:
          'Les touches média Bluetooth dépendent du profil de l’appareil. Pour une télécommande complète, utilisez le mode Wi‑Fi ou IR.',
      };
    }

    return {
      success: false,
      error: `Commande « ${command} » non disponible en Bluetooth.`,
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Connexion impossible';
    return {
      success: false,
      error: `${msg}. Vérifiez l’appairage dans les réglages Bluetooth du téléphone.`,
    };
  }
}

export function isBluetoothCommandSupported(_command: string): boolean {
  return false;
}
