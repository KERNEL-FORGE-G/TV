import type { TvPlatformId } from '../data/tvPlatforms';
import { probeRoku } from './smartTv/roku';
import { probeSony } from './smartTv/sony';
import { probeLg } from './smartTv/lg';
import { probeSamsung } from './smartTv/samsung';
import { fetchWithTimeout, subnetHosts } from '../utils/network';
import type { DiscoveredTv } from './smartTv/types';

/** Timeouts courts ; parallélisme modéré (évite crash réseau / OOM vers ~25 s sur mobile). */
const SCAN_TIMEOUT_MS = 420;
const HOST_CONCURRENCY = 14;
/** Hôtes traités par vague, puis courte pause pour libérer les sockets. */
const HOST_WAVE_SIZE = 36;
const WAVE_PAUSE_MS = 700;

async function mapPool<T, R>(
  items: T[],
  concurrency: number,
  fn: (item: T) => Promise<R | null>,
  signal?: AbortSignal,
): Promise<R[]> {
  const out: R[] = [];
  let index = 0;

  async function worker() {
    while (index < items.length) {
      if (signal?.aborted) return;
      const i = index++;
      const result = await fn(items[i]);
      if (result) out.push(result);
    }
  }

  const workers = Array.from(
    { length: Math.min(concurrency, items.length) },
    () => worker(),
  );
  await Promise.all(workers);
  return out;
}

async function probePhilips(host: string): Promise<string | null> {
  try {
    const res = await fetchWithTimeout(
      `http://${host}:1925/6/system/info`,
      {},
      SCAN_TIMEOUT_MS,
    );
    if (res.ok) return 'Philips Android TV';
  } catch {
    /* ignore */
  }
  return null;
}

/** Sondes ordonnées : première plateforme confirmée (évite mauvaise classification). */
async function probeHost(host: string): Promise<DiscoveredTv | null> {
  const roku = await probeRoku(host, 8060, SCAN_TIMEOUT_MS);
  if (roku) {
    const platformId: TvPlatformId = /tcl/i.test(roku) ? 'tcl_roku' : 'roku';
    return { host, platformId, name: roku, port: 8060 };
  }

  const samsung = await probeSamsung(host, SCAN_TIMEOUT_MS);
  if (samsung) {
    return {
      host,
      platformId: 'samsung_tizen' as TvPlatformId,
      name: samsung.name,
      port: samsung.port,
    };
  }

  const lg = await probeLg(host, 3000, SCAN_TIMEOUT_MS);
  if (lg) {
    return { host, platformId: 'lg_webos' as TvPlatformId, name: lg, port: 3000 };
  }

  const sony = await probeSony(host, SCAN_TIMEOUT_MS);
  if (sony) {
    return { host, platformId: 'sony_bravia' as TvPlatformId, name: sony, port: 80 };
  }

  const philips = await probePhilips(host);
  if (philips) {
    return {
      host,
      platformId: 'philips_android' as TvPlatformId,
      name: philips,
      port: 1925,
    };
  }

  return null;
}

/**
 * Scan /24 : uniquement les hôtes qui répondent comme une Smart TV connue.
 */
function sleepMs(ms: number, signal?: AbortSignal): Promise<void> {
  if (signal?.aborted) return Promise.resolve();
  return new Promise((resolve) => {
    const t = setTimeout(resolve, ms);
    signal?.addEventListener(
      'abort',
      () => {
        clearTimeout(t);
        resolve();
      },
      { once: true },
    );
  });
}

export async function discoverTvsOnNetwork(
  subnetPrefix: string,
  onProgress?: (scanned: number, total: number) => void,
  signal?: AbortSignal,
): Promise<DiscoveredTv[]> {
  const hosts = subnetHosts(subnetPrefix);
  const total = hosts.length;
  let scanned = 0;
  const found: DiscoveredTv[] = [];

  for (let waveStart = 0; waveStart < hosts.length; waveStart += HOST_WAVE_SIZE) {
    if (signal?.aborted) break;

    const wave = hosts.slice(waveStart, waveStart + HOST_WAVE_SIZE);
    const waveFound = await mapPool(
      wave,
      HOST_CONCURRENCY,
      async (host) => {
        if (signal?.aborted) return null;
        return probeHost(host);
      },
      signal,
    );

    for (const tv of waveFound) {
      if (tv) found.push(tv);
    }

    scanned = Math.min(total, waveStart + wave.length);
    onProgress?.(scanned, total);

    if (waveStart + HOST_WAVE_SIZE < hosts.length && !signal?.aborted) {
      await sleepMs(WAVE_PAUSE_MS, signal);
    }
  }

  onProgress?.(total, total);
  return found;
}
