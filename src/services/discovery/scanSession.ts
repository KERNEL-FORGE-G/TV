/** Durée maximale d’un scan découverte (Wi‑Fi ou Bluetooth). */
export const SCAN_DURATION_MS = 45_000;

export const SCAN_DURATION_SEC = SCAN_DURATION_MS / 1000;

export type ScanProgressInfo = {
  elapsedMs: number;
  totalMs: number;
  pct: number;
  label: string;
};

export type DiscoveryScanOptions = {
  signal?: AbortSignal;
  onProgress?: (info: ScanProgressInfo) => void;
};

export function isScanAborted(signal?: AbortSignal): boolean {
  return signal?.aborted ?? false;
}

export function normalizeScanOptions(
  options?: DiscoveryScanOptions | ((pct: number) => void),
): DiscoveryScanOptions {
  if (typeof options === 'function') {
    return {
      onProgress: (info) => options(info.pct),
    };
  }
  return options ?? {};
}

export function reportScanProgress(
  startMs: number,
  onProgress?: (info: ScanProgressInfo) => void,
  detail?: string,
): void {
  const elapsedMs = Math.min(SCAN_DURATION_MS, Date.now() - startMs);
  const pct = Math.min(100, Math.round((elapsedMs / SCAN_DURATION_MS) * 100));
  const sec = Math.floor(elapsedMs / 1000);
  const label = detail
    ? `${sec}s / ${SCAN_DURATION_SEC}s · ${detail}`
    : `${sec}s / ${SCAN_DURATION_SEC}s`;
  onProgress?.({ elapsedMs, totalMs: SCAN_DURATION_MS, pct, label });
}

export function scanTimeRemainingMs(startMs: number): number {
  return Math.max(0, SCAN_DURATION_MS - (Date.now() - startMs));
}

export function waitUntilScanDeadline(
  startMs: number,
  signal?: AbortSignal,
): boolean {
  return isScanAborted(signal) || Date.now() - startMs >= SCAN_DURATION_MS;
}

/** Limite les mises à jour UI pendant un scan long (évite surcharge React Native). */
export function createThrottledScanProgress(
  minIntervalMs: number,
  onProgress?: (info: ScanProgressInfo) => void,
): (info: ScanProgressInfo) => void {
  let lastEmit = 0;
  return (info) => {
    if (!onProgress) return;
    const now = Date.now();
    if (info.pct >= 100 || now - lastEmit >= minIntervalMs) {
      lastEmit = now;
      onProgress(info);
    }
  };
}

export async function sleepScan(
  ms: number,
  signal?: AbortSignal,
): Promise<void> {
  if (isScanAborted(signal)) return;
  await new Promise<void>((resolve) => {
    const t = setTimeout(() => resolve(), ms);
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

/** Nombre max de balayages /24 complets sur la fenêtre 45 s (évite crash ~25 s). */
export const SCAN_MAX_FULL_PASSES = 2;
