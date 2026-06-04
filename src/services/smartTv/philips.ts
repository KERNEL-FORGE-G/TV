import { fetchWithTimeout } from '../../utils/network';
import { PHILIPS_KEYS } from './commandMaps';
import type { SmartTvSendResult } from './types';

export async function sendPhilipsCommand(
  host: string,
  command: string,
  port = 1925,
): Promise<SmartTvSendResult> {
  const key = PHILIPS_KEYS[command];
  if (!key) {
    return { success: false, error: `Commande Philips inconnue: ${command}` };
  }

  try {
    const res = await fetchWithTimeout(`http://${host}:${port}/6/input/key`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key }),
    });
    if (res.ok) return { success: true };
    return { success: false, error: `Philips HTTP ${res.status}` };
  } catch (e: unknown) {
    return { success: false, error: e instanceof Error ? e.message : 'Erreur réseau' };
  }
}
