import { fetchWithTimeout } from '../../utils/network';
import type { SmartTvSendResult } from './types';

/** IDs Roku courants (varient selon région — secours si /query/apps échoue) */
const FALLBACK_CHANNEL_IDS: Record<string, string> = {
  netflix: '12',
  youtube: '83742',
  prime: '13',
  disney: '291097',
  spotify: '22297',
  hulu: '2285',
  plex: '13535',
};

export async function launchRokuApp(
  host: string,
  appKey: string,
  port = 8060,
): Promise<SmartTvSendResult> {
  const normalized = appKey.replace(/^app_/, '');
  let channelId = FALLBACK_CHANNEL_IDS[normalized];

  try {
    const res = await fetchWithTimeout(
      `http://${host}:${port}/query/apps`,
      { method: 'GET' },
      1200,
    );
    if (res.ok) {
      const xml = await res.text();
      const fromXml = findChannelIdInAppsXml(xml, normalized);
      if (fromXml) channelId = fromXml;
    }
  } catch {
    /* utilise le fallback */
  }

  if (!channelId) {
    return {
      success: false,
      error: `Application « ${normalized} » introuvable sur ce Roku.`,
    };
  }

  try {
    const launch = await fetchWithTimeout(
      `http://${host}:${port}/launch/${channelId}`,
      { method: 'POST' },
      2500,
    );
    if (launch.ok || launch.status === 204) {
      return { success: true };
    }
    return { success: false, error: `Roku launch HTTP ${launch.status}` };
  } catch (e: unknown) {
    return {
      success: false,
      error: e instanceof Error ? e.message : 'Erreur réseau',
    };
  }
}

function findChannelIdInAppsXml(xml: string, appKey: string): string | null {
  const aliases: Record<string, string[]> = {
    netflix: ['netflix'],
    youtube: ['youtube', 'youtube tv'],
    prime: ['prime video', 'amazon prime', 'amazon video'],
    disney: ['disney', 'disney+'],
    spotify: ['spotify'],
    hulu: ['hulu'],
    plex: ['plex'],
  };
  const needles = aliases[appKey] ?? [appKey];
  const blocks = xml.match(/<app[^>]*>[\s\S]*?<\/app>/gi) ?? [];

  for (const block of blocks) {
    const id = block.match(/id="([^"]+)"/i)?.[1];
    const name = (block.match(/<app[^>]*>([^<]*)<\/app>/i)?.[1] ?? '').toLowerCase();
    if (!id) continue;
    if (needles.some((n) => name.includes(n))) return id;
  }
  return null;
}

/** Envoi caractère par caractère (API Roku ECP Lit_*) */
export async function sendRokuText(
  host: string,
  text: string,
  port = 8060,
): Promise<SmartTvSendResult> {
  const trimmed = text.trim();
  if (!trimmed) {
    return { success: false, error: 'Texte vide.' };
  }

  try {
    for (const char of trimmed) {
      const key = rokuLitKey(char);
      if (!key) continue;
      const res = await fetchWithTimeout(
        `http://${host}:${port}/keypress/${key}`,
        { method: 'POST' },
        800,
      );
      if (!res.ok && res.status !== 204) {
        return { success: false, error: `Roku clavier HTTP ${res.status}` };
      }
      await delay(85);
    }
    return { success: true };
  } catch (e: unknown) {
    return {
      success: false,
      error: e instanceof Error ? e.message : 'Erreur réseau',
    };
  }
}

function rokuLitKey(char: string): string | null {
  if (char === ' ') return 'Lit_%20';
  if (/[a-z]/.test(char)) return `Lit_${char}`;
  if (/[A-Z]/.test(char)) return `Lit_${char}`;
  if (/[0-9]/.test(char)) return `Lit_${char}`;
  if (char === '.') return 'Lit_.';
  if (char === '-') return 'Lit_-';
  if (char === '_') return 'Lit__';
  return null;
}

function delay(ms: number) {
  return new Promise<void>((r) => setTimeout(r, ms));
}
