import { Platform } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { ensureNetworkPermissions } from './permissions';

const FETCH_TIMEOUT_MS = 1200;

export async function fetchWithTimeout(
  url: string,
  init?: RequestInit,
  timeoutMs = FETCH_TIMEOUT_MS,
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

/** Génère les IP d’un sous-réseau /24 (ex. 192.168.1 → 192.168.1.2 … .254) */
export function subnetHosts(prefix: string): string[] {
  const base = prefix.replace(/\.$/, '');
  const hosts: string[] = [];
  for (let i = 2; i <= 254; i++) {
    hosts.push(`${base}.${i}`);
  }
  return hosts;
}

export function guessLocalSubnet(): string {
  return '192.168.1';
}

/** Préfixes courants si la détection automatique échoue */
export const FALLBACK_SUBNET_PREFIXES = [
  '192.168.1',
  '192.168.0',
  '10.0.0',
  '192.168.2',
  '10.0.1',
] as const;

export function ipToSubnetPrefix(ip: string): string | null {
  const parts = ip.trim().split('.');
  if (parts.length !== 4) return null;
  if (parts.some((p) => Number.isNaN(Number(p)) || Number(p) < 0 || Number(p) > 255)) {
    return null;
  }
  return `${parts[0]}.${parts[1]}.${parts[2]}`;
}

function readIpFromNetInfoDetails(details: unknown): string | null {
  if (!details || typeof details !== 'object') return null;
  const d = details as Record<string, unknown>;
  for (const key of ['ipAddress', 'wifiIPAddress', 'cellularIPAddress']) {
    const v = d[key];
    if (typeof v === 'string' && v.length > 0) return v;
  }
  return null;
}

/** Détecte le préfixe /24 du téléphone (Wi‑Fi ou données) */
export async function resolveLocalSubnetPrefix(): Promise<string> {
  if (Platform.OS === 'android') {
    await ensureNetworkPermissions();
  }

  try {
    const state = await NetInfo.fetch();
    const ip = readIpFromNetInfoDetails(state.details);
    const prefix = ip ? ipToSubnetPrefix(ip) : null;
    if (prefix) return prefix;
  } catch {
    /* NetInfo indisponible (tests, etc.) */
  }
  return guessLocalSubnet();
}

/** Liste ordonnée de préfixes à scanner (sans doublons) */
export async function resolveSubnetPrefixes(explicit?: string): Promise<string[]> {
  const trimmed = explicit?.trim().replace(/\.$/, '');
  if (trimmed) return [trimmed];

  const local = await resolveLocalSubnetPrefix();
  const ordered = [local, ...FALLBACK_SUBNET_PREFIXES];
  return [...new Set(ordered)];
}
