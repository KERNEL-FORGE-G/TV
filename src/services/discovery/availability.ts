import type { DiscoveryCandidate } from '../../core/remoteTypes';
import type { TvPlatformId } from '../../data/tvPlatforms';
import { probeRoku } from '../smartTv/roku';
import { probeSony } from '../smartTv/sony';
import { probeLg } from '../smartTv/lg';
import { probeSamsung } from '../smartTv/samsung';
import { fetchWithTimeout } from '../../utils/network';
import type { BlePeripheral } from '../ble/bleManagerBridge';
import { checkBluetoothDeviceOnline } from '../BluetoothService';

/** RSSI minimal pour un appareil vu pendant le scan BLE (pas un fantôme en cache). */
const BLE_SCAN_RSSI_MIN = -88;

async function probePhilips(host: string): Promise<boolean> {
  try {
    const res = await fetchWithTimeout(`http://${host}:1925/6/system/info`, {}, 700);
    return res.ok;
  } catch {
    return false;
  }
}

/** Vérifie que la TV répond encore sur le réseau (même critères que la découverte). */
export async function isWifiCandidateReachable(
  candidate: DiscoveryCandidate,
): Promise<boolean> {
  const host = candidate.host;
  const platform = candidate.platformId as TvPlatformId;
  const port = candidate.port;

  try {
    switch (platform) {
      case 'roku':
      case 'tcl_roku':
        return !!(await probeRoku(host, port ?? 8060));
      case 'sony_bravia':
        return !!(await probeSony(host));
      case 'philips_android':
        return probePhilips(host);
      case 'lg_webos':
        return !!(await probeLg(host, port ?? 3000));
      case 'samsung_tizen':
        return !!(await probeSamsung(host));
      default:
        return false;
    }
  } catch {
    return false;
  }
}

export async function filterReachableWifiCandidates(
  candidates: DiscoveryCandidate[],
): Promise<DiscoveryCandidate[]> {
  if (candidates.length === 0) return [];

  const checks = await Promise.all(
    candidates.map(async (c) => ({
      c,
      ok: await isWifiCandidateReachable(c),
    })),
  );
  return checks.filter((x) => x.ok).map((x) => x.c);
}

/**
 * Appareil BLE réellement joignable :
 * - scan : vu pendant le scan avec signal suffisant ;
 * - appairé : test de connexion GATT.
 */
export async function isBlePeripheralReachable(
  peripheral: BlePeripheral,
  source: 'bonded' | 'scan',
  checkConnect: (id: string) => Promise<boolean>,
): Promise<boolean> {
  if (!peripheral?.id) return false;

  if (source === 'scan') {
    if (typeof peripheral.rssi === 'number' && peripheral.rssi < BLE_SCAN_RSSI_MIN) {
      return false;
    }
    return true;
  }

  return checkConnect(peripheral.id);
}

/** Filtre une liste de candidats (Wi‑Fi + Bluetooth) : uniquement les appareils joignables. */
export async function filterReachableDiscoveryCandidates(
  candidates: DiscoveryCandidate[],
): Promise<DiscoveryCandidate[]> {
  if (candidates.length === 0) return [];

  const checks = await Promise.all(
    candidates.map(async (c) => {
      const ok =
        c.protocol === 'Bluetooth'
          ? await checkBluetoothDeviceOnline(c.mac)
          : await isWifiCandidateReachable(c);
      return { c, ok };
    }),
  );
  return checks.filter((x) => x.ok).map((x) => x.c);
}
