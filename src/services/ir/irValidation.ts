import type { Device } from '../../data/devices';
import type { LearnedIrEntry } from '../../core/remoteTypes';
import { getIrReadiness, irReadinessMessage } from '../IRService';

/** Code Pronto hex minimal (ex. 0000 006D 0022 0002 …). */
export function isValidProntoCode(code: string): boolean {
  const trimmed = code.trim();
  if (!trimmed) return false;
  const words = trimmed.split(/\s+/);
  if (words.length < 4) return false;
  return words.every((w) => /^[0-9A-Fa-f]{4}$/.test(w));
}

export function resolveIrCodeForCommand(
  device: Device,
  command: string,
  learnedIr: LearnedIrEntry[] = [],
): string | null {
  const learned = learnedIr.find(
    (e) => e.deviceId === device.id && e.command === command,
  );
  const raw = learned?.prontoCode ?? device.irCodes[command];
  if (!raw?.trim()) return null;
  const code = raw.trim();
  return isValidProntoCode(code) ? code : null;
}

export function hasConfiguredIrCode(
  device: Device,
  command: string,
  learnedIr: LearnedIrEntry[] = [],
): boolean {
  return resolveIrCodeForCommand(device, command, learnedIr) != null;
}

/** Bloque l’émission si pas d’émetteur matériel ou pas de code valide. */
export async function assertIrCommandReady(
  device: Device,
  command: string,
  learnedIr: LearnedIrEntry[] = [],
): Promise<string | null> {
  const readiness = await getIrReadiness();
  if (!readiness.ready) {
    return irReadinessMessage(readiness);
  }

  const code = resolveIrCodeForCommand(device, command, learnedIr);
  if (!code) {
    return `Aucun code IR configuré pour « ${command} ». Enregistrez un code Pronto dans Réglages → Codes IR.`;
  }

  return null;
}

export function deviceUsesNativeIr(device: Device): boolean {
  return device.protocol === 'IR' || (!!device.irCodes && Object.keys(device.irCodes).length > 0);
}
