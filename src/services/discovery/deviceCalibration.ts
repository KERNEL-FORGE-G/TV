import type { DiscoveryCandidate } from '../../core/remoteTypes';
import type { TvPlatformId } from '../../data/tvPlatforms';
import { getPlatformDef } from '../../data/tvPlatforms';
import type { DiscoveredTv } from '../smartTv/types';
import { probeRoku } from '../smartTv/roku';
import { probeSony } from '../smartTv/sony';
import { probeLg } from '../smartTv/lg';
import { probeSamsung } from '../smartTv/samsung';
import { fetchWithTimeout } from '../../utils/network';
import { checkBluetoothDeviceOnline } from '../BluetoothService';
import { isWifiCandidateReachable } from './availability';

const CALIBRATE_TIMEOUT_MS = 1200;

async function probePhilipsName(host: string): Promise<string | null> {
  try {
    const res = await fetchWithTimeout(
      `http://${host}:1925/6/system/info`,
      {},
      CALIBRATE_TIMEOUT_MS,
    );
    if (!res.ok) return null;
    const data = await res.json().catch(() => null);
    const name =
      data?.name ??
      data?.model?.name ??
      data?.product?.name;
    return name ? `Philips ${name}` : 'Philips Android TV';
  } catch {
    return null;
  }
}

/**
 * Re-sonde une IP avec le protocole déjà identifié (évite faux positifs du scan rapide).
 */
export async function refineDiscoveredTv(
  tv: DiscoveredTv,
): Promise<DiscoveredTv | null> {
  const { host, platformId } = tv;
  const port = tv.port;

  switch (platformId) {
    case 'roku':
    case 'tcl_roku': {
      const name = await probeRoku(host, port ?? 8060, CALIBRATE_TIMEOUT_MS);
      if (!name) return null;
      const isTcl = /tcl/i.test(name);
      return {
        host,
        platformId: isTcl ? 'tcl_roku' : 'roku',
        name,
        port: 8060,
      };
    }
    case 'samsung_tizen': {
      const samsung = await probeSamsung(host, CALIBRATE_TIMEOUT_MS);
      if (!samsung) return null;
      return {
        host,
        platformId: 'samsung_tizen',
        name: samsung.name,
        port: samsung.port,
      };
    }
    case 'lg_webos': {
      const lg = await probeLg(host, port ?? 3000, CALIBRATE_TIMEOUT_MS);
      if (!lg) return null;
      return { host, platformId: 'lg_webos', name: lg, port: port ?? 3000 };
    }
    case 'sony_bravia': {
      const sony = await probeSony(host, CALIBRATE_TIMEOUT_MS);
      if (!sony) return null;
      return { host, platformId: 'sony_bravia', name: sony, port: 80 };
    }
    case 'philips_android': {
      const name = await probePhilipsName(host);
      if (!name) return null;
      return { host, platformId: 'philips_android', name, port: 1925 };
    }
    default:
      return null;
  }
}

function candidateFromRefined(
  refined: DiscoveredTv,
  previous?: DiscoveryCandidate,
): DiscoveryCandidate {
  const def = getPlatformDef(refined.platformId);
  const port = refined.port ?? def.defaultPort;
  return {
    id: `${refined.platformId}-${refined.host}`,
    name: refined.name,
    host: refined.host,
    platformId: refined.platformId,
    port,
    protocol: 'WiFi',
    route: 'LAN_DIRECT',
    status: previous?.status ?? 'pending',
    discoveredAt: previous?.discoveredAt ?? Date.now(),
    signalStrength: previous?.signalStrength,
  };
}

/** Confirme et aligne un candidat Wi‑Fi ou Bluetooth sur le matériel réel. */
export async function calibrateDiscoveryCandidate(
  candidate: DiscoveryCandidate,
): Promise<DiscoveryCandidate | null> {
  if (candidate.protocol === 'WiFi') {
    const refined = await refineDiscoveredTv({
      host: candidate.host,
      platformId: candidate.platformId as TvPlatformId,
      name: candidate.name,
      port: candidate.port,
    });
    if (!refined) return null;

    const calibrated = candidateFromRefined(refined, candidate);
    const reachable = await isWifiCandidateReachable(calibrated);
    return reachable ? calibrated : null;
  }

  if (candidate.protocol === 'Bluetooth' && candidate.mac) {
    const online = await checkBluetoothDeviceOnline(candidate.mac);
    if (!online) return null;
    return {
      ...candidate,
      name: candidate.name?.trim() || `Appareil Bluetooth (${candidate.mac.slice(0, 8)}…)`,
    };
  }

  return null;
}

/** Calibre une liste après scan (par petits lots pour ne pas saturer le réseau). */
export async function calibrateDiscoveryCandidates(
  candidates: DiscoveryCandidate[],
  signal?: AbortSignal,
  onProgress?: (done: number, total: number) => void,
): Promise<DiscoveryCandidate[]> {
  if (candidates.length === 0) return [];

  const calibrated: DiscoveryCandidate[] = [];
  const batchSize = 3;
  const total = candidates.length;

  for (let i = 0; i < candidates.length; i += batchSize) {
    if (signal?.aborted) break;

    const chunk = candidates.slice(i, i + batchSize);
    const results = await Promise.all(
      chunk.map((c) => calibrateDiscoveryCandidate(c)),
    );

    for (const r of results) {
      if (r) calibrated.push(r);
    }

    onProgress?.(Math.min(i + chunk.length, total), total);
  }

  const seen = new Set<string>();
  return calibrated.filter((c) => {
    if (seen.has(c.id)) return false;
    seen.add(c.id);
    return true;
  });
}
