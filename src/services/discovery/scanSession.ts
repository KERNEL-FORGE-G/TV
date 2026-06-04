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
