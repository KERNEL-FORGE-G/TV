import { fetchWithTimeout } from '../../utils/network';
import { LG_KEYS } from './commandMaps';
import type { SmartTvSendResult } from './types';

export async function sendLgCommand(
  host: string,
  command: string,
  clientKey?: string,
  port = 3000,
): Promise<SmartTvSendResult> {
  const key = LG_KEYS[command];
  if (!key) {
    return { success: false, error: `Commande LG inconnue: ${command}` };
  }

  if (!clientKey) {
    return {
      success: false,
      error: 'Clé LG manquante — appairez la TV (Réglages → Appareils → LG webOS).',
      needsPairing: true,
    };
  }

  const body = JSON.stringify({
    type: 'request',
    id: `lg-${Date.now()}`,
    uri: `ssap://com.webos.service.ime/sendEnterKey`,
    payload: { key, clientKey },
  });

  try {
    const res = await fetchWithTimeout(`http://${host}:${port}/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Client-Key': clientKey,
      },
      body,
    });
    if (res.ok) return { success: true };
    return { success: false, error: `LG HTTP ${res.status}` };
  } catch (e: unknown) {
    return { success: false, error: e instanceof Error ? e.message : 'Erreur réseau' };
  }
}

/** Bouton LG via API ssap standard (volume, etc.) */
export async function sendLgButton(
  host: string,
  command: string,
  clientKey: string,
  port = 3000,
): Promise<SmartTvSendResult> {
  const key = LG_KEYS[command];
  if (!key) return { success: false, error: `Commande LG inconnue: ${command}` };

  try {
    const res = await fetchWithTimeout(`http://${host}:${port}/api/request`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'request',
        uri: 'ssap://com.webos.service.tv.remote/input/button',
        payload: { name: key, clientKey },
      }),
    });
    if (res.ok) return { success: true };
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Erreur réseau';
    return { success: false, error: msg };
  }

  return { success: false, error: 'Commande LG refusée par la TV.' };
}

export async function probeLg(
  host: string,
  port = 3000,
  timeoutMs = 900,
): Promise<string | null> {
  try {
    const res = await fetchWithTimeout(
      `http://${host}:${port}/`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'request',
          id: 'probe',
          uri: 'ssap://com.webos.service.update/getCurrentSWInformation',
        }),
      },
      timeoutMs,
    );
    const raw = await res.text().catch(() => '');
    if (res.ok || res.status === 401) {
      let data: { payload?: Record<string, string> } | null = null;
      try {
        data = raw ? JSON.parse(raw) : null;
      } catch {
        data = null;
      }
      const product =
        data?.payload?.productName ??
        data?.payload?.modelName ??
        data?.payload?.friendlyName;
      if (product) return `LG ${product}`;
      if (/webos|LG/i.test(raw)) return 'LG webOS TV';
    }
  } catch {
    /* ignore */
  }
  return null;
}
