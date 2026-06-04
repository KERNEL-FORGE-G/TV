import { fetchWithTimeout } from '../../utils/network';
import { ROKU_KEYS } from './commandMaps';
import type { SmartTvSendResult } from './types';

export async function sendRokuCommand(
  host: string,
  command: string,
  port = 8060,
): Promise<SmartTvSendResult> {
  const key = ROKU_KEYS[command];
  if (!key) {
    return { success: false, error: `Commande Roku inconnue: ${command}` };
  }

  const url = `http://${host}:${port}/keypress/${key}`;
  try {
    const res = await fetchWithTimeout(url, { method: 'POST' });
    if (res.ok || res.status === 200 || res.status === 204) {
      return { success: true };
    }
    return { success: false, error: `Roku HTTP ${res.status}` };
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Erreur réseau';
    return { success: false, error: msg };
  }
}

export async function probeRoku(
  host: string,
  port = 8060,
  timeoutMs = 800,
): Promise<string | null> {
  try {
    const res = await fetchWithTimeout(
      `http://${host}:${port}/query/device-info`,
      { method: 'GET' },
      timeoutMs,
    );
    if (!res.ok) return null;
    const xml = await res.text();
    const name = xml.match(/<friendly-device-name>([^<]+)</)?.[1];
    const model = xml.match(/<model-name>([^<]+)</)?.[1];
    return name ?? model ?? 'Roku';
  } catch {
    return null;
  }
}
