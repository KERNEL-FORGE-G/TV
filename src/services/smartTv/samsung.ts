import { fetchWithTimeout } from '../../utils/network';
import { SAMSUNG_KEYS } from './commandMaps';
import type { SmartTvSendResult } from './types';

/** Samsung Tizen — nécessite un token après appairage sur la TV */
export async function sendSamsungCommand(
  host: string,
  command: string,
  token?: string,
  port = 8001,
): Promise<SmartTvSendResult> {
  const key = SAMSUNG_KEYS[command];
  if (!key) {
    return { success: false, error: `Commande Samsung inconnue: ${command}` };
  }

  if (!token) {
    return {
      success: false,
      error: 'Token Samsung requis — acceptez la demande sur la TV au premier envoi.',
      needsPairing: true,
    };
  }

  const url = `http://${host}:${port}/api/v2/`;
  const body = JSON.stringify({
    method: 'ms.remote.control',
    params: {
      Cmd: 'Click',
      DataOfCmd: key,
      Option: 'false',
      TypeOfRemote: 'SendRemoteKey',
    },
  });

  try {
    const res = await fetchWithTimeout(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body,
    });
    if (res.ok) return { success: true };
    return { success: false, error: `Samsung HTTP ${res.status}` };
  } catch (e: unknown) {
    return { success: false, error: e instanceof Error ? e.message : 'Erreur réseau' };
  }
}

export async function probeSamsung(
  host: string,
  timeoutMs = 800,
): Promise<{ name: string; port: number } | null> {
  for (const port of [8001, 8002] as const) {
    try {
      const res = await fetchWithTimeout(`http://${host}:${port}/api/v2/`, {}, timeoutMs);
      const text = await res.text().catch(() => '');
      const looksSamsung =
        res.ok ||
        /samsung|tizen|ms\.remote|Samsung/i.test(text);
      if (!looksSamsung) continue;
      if (res.status === 401 || res.status === 403 || res.ok) {
        const match = text.match(/"name"\s*:\s*"([^"]+)"/);
        return {
          name: match?.[1] ? `Samsung ${match[1]}` : 'Samsung TV',
          port,
        };
      }
    } catch {
      /* try next port */
    }
  }
  return null;
}
