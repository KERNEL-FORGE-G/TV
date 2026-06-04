import type { DiscoveryCandidate, TransportRoute } from '../../core/remoteTypes';
import { discoverTvsOnNetwork } from '../NetworkDiscoveryService';
import { resolveSubnetPrefixes } from '../../utils/network';
import { calibrateDiscoveryCandidates } from './deviceCalibration';
import {
  createThrottledScanProgress,
  isScanAborted,
  normalizeScanOptions,
  reportScanProgress,
  SCAN_DURATION_MS,
  SCAN_MAX_FULL_PASSES,
  sleepScan,
  waitUntilScanDeadline,
  type DiscoveryScanOptions,
} from './scanSession';

function candidateId(host: string, platform: string) {
  return `${platform}-${host}`;
}

function tvToCandidate(tv: {
  host: string;
  platformId: string;
  name: string;
  port?: number;
}): DiscoveryCandidate {
  return {
    id: candidateId(tv.host, tv.platformId),
    name: tv.name,
    host: tv.host,
    platformId: tv.platformId as DiscoveryCandidate['platformId'],
    port: tv.port,
    protocol: 'WiFi',
    route: 'LAN_DIRECT' as TransportRoute,
    status: 'pending',
    discoveredAt: Date.now(),
  };
}

export async function scanDiscoveryCandidates(
  subnet?: string,
  options?: DiscoveryScanOptions | ((pct: number) => void),
): Promise<DiscoveryCandidate[]> {
  const { signal, onProgress } = normalizeScanOptions(options);
  const emitProgress = createThrottledScanProgress(450, onProgress);
  const prefixes = await resolveSubnetPrefixes(subnet);
  const seenHosts = new Set<string>();
  const candidates: DiscoveryCandidate[] = [];
  const startMs = Date.now();
  let pass = 0;

  while (
    !waitUntilScanDeadline(startMs, signal) &&
    pass < SCAN_MAX_FULL_PASSES
  ) {
    pass += 1;
    reportScanProgress(startMs, emitProgress, `passe ${pass}`);

    for (let p = 0; p < prefixes.length; p++) {
      if (waitUntilScanDeadline(startMs, signal)) break;

      const prefix = prefixes[p];
      const tvs = await discoverTvsOnNetwork(
        prefix,
        (scanned, total) => {
          const sec = Math.floor((Date.now() - startMs) / 1000);
          emitProgress({
            elapsedMs: Date.now() - startMs,
            totalMs: SCAN_DURATION_MS,
            pct: Math.min(99, Math.round((scanned / total) * 100)),
            label: `${sec}s / 45s · ${prefix}.x (${scanned}/${total})`,
          });
        },
        signal,
      );

      for (const tv of tvs) {
        if (seenHosts.has(tv.host)) continue;
        seenHosts.add(tv.host);
        candidates.push(tvToCandidate(tv));
      }
    }

    if (isScanAborted(signal)) break;
    if (pass >= SCAN_MAX_FULL_PASSES) break;
    if (waitUntilScanDeadline(startMs, signal)) break;

    await sleepScan(2500, signal);
  }

  if (candidates.length > 0 && !isScanAborted(signal)) {
    reportScanProgress(startMs, emitProgress, 'calibrage');
    const calibrated = await calibrateDiscoveryCandidates(
      candidates,
      signal,
      (done, total) => {
        const sec = Math.floor((Date.now() - startMs) / 1000);
        emitProgress({
          elapsedMs: Date.now() - startMs,
          totalMs: SCAN_DURATION_MS,
          pct: 95,
          label: `${sec}s / 45s · calibrage (${done}/${total})`,
        });
      },
    );
    reportScanProgress(startMs, emitProgress);
    return calibrated;
  }

  reportScanProgress(startMs, emitProgress);
  return candidates;
}

export function adoptCandidate(
  candidate: DiscoveryCandidate,
  roomId?: string,
): Partial<import('../../data/devices').Device> {
  if (candidate.protocol === 'Bluetooth') {
    return {
      name: candidate.name,
      brand: 'Bluetooth',
      type: 'tv',
      protocol: 'Bluetooth',
      tvPlatform: 'bluetooth_generic',
      connection: {
        mac: candidate.mac,
        host: candidate.mac ?? candidate.name,
      },
      roomId,
      isOnline: true,
    };
  }

  return {
    name: candidate.name,
    brand: candidate.name,
    type: 'tv',
    protocol: 'WiFi',
    tvPlatform: candidate.platformId,
    connection: { host: candidate.host, port: candidate.port },
    roomId,
    isOnline: true,
  };
}
