import type { DeviceSendResult } from '../DeviceControlService';

/**
 * Hub Broadlink — protocole propriétaire chiffré, non intégré.
 */
export async function sendBroadlinkCommand(
  _hubHost: string,
  _prontoOrHex: string,
): Promise<DeviceSendResult> {
  return {
    success: false,
    error:
      'Hub Broadlink non pris en charge. Utilisez le port IR du téléphone ou une TV Smart en Wi‑Fi.',
  };
}

export async function probeBroadlinkHub(_host: string): Promise<boolean> {
  return false;
}
