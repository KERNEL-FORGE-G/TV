import type { TvPlatformId } from '../data/tvPlatforms';
import { probeRoku } from './smartTv/roku';
import { probeSony } from './smartTv/sony';
import { probeLg } from './smartTv/lg';
import { probeSamsung } from './smartTv/samsung';
import { fetchWithTimeout, subnetHosts } from '../utils/network';
import type { DiscoveredTv } from './smartTv/types';

/** Scan rapide : timeouts courts, forte parallélisation. */
const SCAN_TIMEOUT_MS = 420;
const HOST_CONCURRENCY = 56;

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

/** Sondes en parallèle ; priorité Roku → Samsung → LG → Sony → Philips. */
async function probeHost(host: string): Promise<DiscoveredTv | null> {
  const [roku, samsung, lg, sony, philips] = await Promise.all([
    probeRoku(host, 8060, SCAN_TIMEOUT_MS),
    probeSamsung(host, SCAN_TIMEOUT_MS),
    probeLg(host, 3000, SCAN_TIMEOUT_MS),
    probeSony(host, SCAN_TIMEOUT_MS),
    probePhilips(host),
  ]);

  if (roku) {
    return { host, platformId: 'roku' as TvPlatformId, name: roku, port: 8060 };
  }
  if (samsung) {
    return {
      host,
      platformId: 'samsung_tizen' as TvPlatformId,
      name: samsung.name,
      port: samsung.port,
    };
  }
  if (lg) {
    return { host, platformId: 'lg_webos' as TvPlatformId, name: lg, port: 3000 };
  }
  if (sony) {
    return { host, platformId: 'sony_bravia' as TvPlatformId, name: sony, port: 80 };
  }
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
export async function discoverTvsOnNetwork(
  subnetPrefix: string,
  onProgress?: (scanned: number, total: number) => void,
  signal?: AbortSignal,
): Promise<DiscoveredTv[]> {
  const hosts = subnetHosts(subnetPrefix);
  const total = hosts.length;
  let scanned = 0;

  const found = await mapPool(
    hosts,
    HOST_CONCURRENCY,
    async (host) => {
      if (signal?.aborted) return null;
      const tv = await probeHost(host);
      scanned += 1;
      if (onProgress && (scanned % 12 === 0 || scanned === total)) {
        onProgress(scanned, total);
      }
      return tv;
    },
    signal,
  );

  onProgress?.(total, total);
  return found;
}
