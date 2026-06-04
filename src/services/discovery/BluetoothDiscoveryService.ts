import { Alert } from 'react-native';
import type { DiscoveryCandidate } from '../../core/remoteTypes';
import { ensureBluetoothPermissions } from '../../utils/permissions';
import { checkBluetoothDeviceOnline } from '../BluetoothService';
import {
  BLE_REBUILD_HINT,
  getBleManager,
  type BlePeripheral,
} from '../ble/bleManagerBridge';
import { isBlePeripheralReachable } from './availability';
import {
  isScanAborted,
  normalizeScanOptions,
  reportScanProgress,
  scanTimeRemainingMs,
  waitUntilScanDeadline,
  type DiscoveryScanOptions,
} from './scanSession';

let bleStarted = false;

async function startBle(): Promise<boolean> {
  const BleManager = getBleManager();
  if (!BleManager) return false;
  if (!bleStarted) {
    await BleManager.start({ showAlert: false });
    bleStarted = true;
  }
  return true;
}

function toCandidate(
  peripheral: BlePeripheral,
  source: 'bonded' | 'scan',
): DiscoveryCandidate {
  const name =
    peripheral.name?.trim() ||
    `Appareil Bluetooth (${peripheral.id.slice(0, 8)}…)`;
  return {
    id: `bt-${peripheral.id}`,
    name,
    host: name,
    mac: peripheral.id,
    platformId: 'bluetooth_generic',
    protocol: 'Bluetooth',
    route: 'BLUETOOTH',
    status: 'pending',
    discoveredAt: Date.now(),
    signalStrength: peripheral.rssi,
    bluetoothSource: source,
  };
}

async function scanNearbyBle(
  seconds: number,
  signal?: AbortSignal,
): Promise<BlePeripheral[]> {
  const BleManager = getBleManager();
  if (!BleManager || seconds < 1) return [];

  const discovered = new Map<string, BlePeripheral>();

  const sub = BleManager.onDiscoverPeripheral((peripheral: BlePeripheral) => {
    if (peripheral?.id) {
      discovered.set(peripheral.id, peripheral);
    }
  });

  const onAbort = () => {
    BleManager.stopScan().catch(() => undefined);
  };
  signal?.addEventListener('abort', onAbort, { once: true });

  try {
    await BleManager.scan({ scanMode: 2, seconds });
  } catch {
    /* scan may fail if BT off */
  } finally {
    signal?.removeEventListener('abort', onAbort);
    sub.remove();
    try {
      await BleManager.stopScan();
    } catch {
      /* ignore */
    }
  }

  return Array.from(discovered.values());
}

/** Appareils appairés + scan BLE jusqu’à 45 s (annulable). */
export async function scanBluetoothCandidates(
  options?: DiscoveryScanOptions | ((pct: number) => void),
): Promise<DiscoveryCandidate[]> {
  const { signal, onProgress } = normalizeScanOptions(options);
  const startMs = Date.now();

  if (!(await ensureBluetoothPermissions())) {
    return [];
  }

  if (!(await startBle())) {
    Alert.alert('Bluetooth indisponible', BLE_REBUILD_HINT);
    return [];
  }

  const BleManager = getBleManager();
  if (!BleManager) {
    Alert.alert('Bluetooth indisponible', BLE_REBUILD_HINT);
    return [];
  }

  reportScanProgress(startMs, onProgress, 'appareils appairés');

  const entries: { peripheral: BlePeripheral; source: 'bonded' | 'scan' }[] =
    [];

  try {
    const bonded = await BleManager.getBondedPeripherals();
    for (const p of bonded) {
      if (p?.id) entries.push({ peripheral: p, source: 'bonded' });
    }
  } catch {
    /* continue with scan only */
  }

  while (!waitUntilScanDeadline(startMs, signal)) {
    const remainSec = Math.ceil(scanTimeRemainingMs(startMs) / 1000);
    if (remainSec < 1) break;

    reportScanProgress(startMs, onProgress, 'scan Bluetooth actif');
    const nearby = await scanNearbyBle(remainSec, signal);
    const bondedIds = new Set(entries.map((e) => e.peripheral.id));
    for (const p of nearby) {
      if (p?.id && !bondedIds.has(p.id)) {
        entries.push({ peripheral: p, source: 'scan' });
        bondedIds.add(p.id);
      }
    }

    if (isScanAborted(signal)) break;
    if (waitUntilScanDeadline(startMs, signal)) break;
  }

  const available: DiscoveryCandidate[] = [];
  if (entries.length === 0) {
    reportScanProgress(startMs, onProgress);
    return available;
  }

  const batchSize = 4;
  for (let i = 0; i < entries.length; i += batchSize) {
    if (isScanAborted(signal)) break;
    if (waitUntilScanDeadline(startMs, signal)) break;

    const chunk = entries.slice(i, i + batchSize);
    const checks = await Promise.all(
      chunk.map(async ({ peripheral, source }) => {
        const ok = await isBlePeripheralReachable(
          peripheral,
          source,
          checkBluetoothDeviceOnline,
        );
        return ok ? toCandidate(peripheral, source) : null;
      }),
    );
    checks.forEach((c) => {
      if (c) available.push(c);
    });
    reportScanProgress(
      startMs,
      onProgress,
      `vérification ${Math.min(i + batchSize, entries.length)}/${entries.length}`,
    );
  }

  reportScanProgress(startMs, onProgress);
  return available;
}

export async function isBluetoothAvailable(): Promise<boolean> {
  try {
    const BleManager = getBleManager();
    if (!BleManager || !(await startBle())) return false;
    const state = await BleManager.checkState();
    return state === 'on' || state === 'turning_on';
  } catch {
    return false;
  }
}
