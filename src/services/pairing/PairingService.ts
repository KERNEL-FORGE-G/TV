import { fetchWithTimeout } from '../../utils/network';
import type { TvPlatformId } from '../../data/tvPlatforms';
import type { PairingRecord } from '../../core/remoteTypes';

export interface PairingAttemptResult {
  success: boolean;
  record: Partial<PairingRecord>;
  message: string;
}

/** Samsung : la TV affiche un code — l’utilisateur valide puis on stocke le token */
export async function attemptSamsungPairing(
  host: string,
  port = 8001,
): Promise<PairingAttemptResult> {
  try {
    const res = await fetchWithTimeout(`http://${host}:${port}/api/v2/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ method: 'ms.remote.control' }),
    }, 3000);

    if (res.status === 401 || res.status === 403) {
      return {
        success: false,
        record: { status: 'pending', platformId: 'samsung_tizen' },
        message: 'Acceptez la demande sur votre TV Samsung, puis réessayez.',
      };
    }
    if (res.ok) {
      const token = res.headers.get('authorization') ?? `samsung-${Date.now()}`;
      return {
        success: true,
        record: { status: 'paired', token, platformId: 'samsung_tizen' },
        message: 'TV Samsung appairée.',
      };
    }
    return {
      success: false,
      record: { status: 'failed', error: `HTTP ${res.status}` },
      message: 'Échec appairage Samsung. Activez « Télécommande mobile » dans les réglages TV.',
    };
  } catch (e: unknown) {
    return {
      success: false,
      record: { status: 'failed' },
      message: e instanceof Error ? e.message : 'TV injoignable',
    };
  }
}

export async function attemptLgPairing(
  host: string,
  clientKey: string,
  port = 3000,
): Promise<PairingAttemptResult> {
  if (!clientKey.trim()) {
    return {
      success: false,
      record: { status: 'pending', platformId: 'lg_webos' },
      message: 'Entrez la clé affichée sur la TV (LG → Appareils connectés).',
    };
  }

  try {
    const res = await fetchWithTimeout(`http://${host}:${port}/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Client-Key': clientKey,
      },
      body: JSON.stringify({ type: 'register', payload: { forcePairing: false } }),
    }, 3000);

    if (res.ok) {
      return {
        success: true,
        record: { status: 'paired', lgClientKey: clientKey, platformId: 'lg_webos' },
        message: 'LG webOS appairé.',
      };
    }
    return {
      success: false,
      record: { status: 'failed' },
      message: 'Clé LG refusée — regénérez le code sur la TV.',
    };
  } catch (e: unknown) {
    return {
      success: false,
      record: { status: 'failed' },
      message: e instanceof Error ? e.message : 'TV LG injoignable',
    };
  }
}

export function needsPairing(platformId: TvPlatformId): boolean {
  return platformId === 'samsung_tizen' || platformId === 'lg_webos';
}
