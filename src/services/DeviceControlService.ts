import { Device } from '../data/devices';
import type { LearnedIrEntry } from '../core/remoteTypes';
import { IRSendResult } from './IRService';
import {
  isCommandSupported as routeSupports,
  routeCommand,
} from './routing/CommandRouter';
import { sendRokuText } from './smartTv';
import { supportsTvKeyboard } from './smartTv/wifiCommands';

export type DeviceSendResult = IRSendResult & {
  needsPairing?: boolean;
};

export function isCommandSupported(device: Device, command: string): boolean {
  return routeSupports(device, command);
}

export async function sendDeviceCommand(
  device: Device,
  command: string,
  learnedIr: LearnedIrEntry[] = [],
): Promise<DeviceSendResult> {
  return routeCommand(device, command, learnedIr);
}

export async function sendDeviceText(
  device: Device,
  text: string,
): Promise<DeviceSendResult> {
  if (device.protocol !== 'WiFi' || !device.connection?.host || !device.tvPlatform) {
    return { success: false, error: 'Clavier texte disponible pour TV Wi‑Fi uniquement.' };
  }
  if (!supportsTvKeyboard(device.tvPlatform)) {
    return {
      success: false,
      error: 'Clavier texte supporté sur Roku / TCL Roku pour l’instant.',
    };
  }
  return sendRokuText(
    device.connection.host,
    text,
    device.connection.port ?? 8060,
  );
}
