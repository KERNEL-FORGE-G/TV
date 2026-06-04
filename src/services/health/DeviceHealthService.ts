import { Device } from '../../data/devices';
import { fetchWithTimeout } from '../../utils/network';
import { probeRoku } from '../smartTv/roku';
import { probeSony } from '../smartTv/sony';
import { probeLg } from '../smartTv/lg';
import { probeSamsung } from '../smartTv/samsung';
import { probeBroadlinkHub } from '../hubs/BroadlinkService';
import { resolveTransportRoute } from '../routing/CommandRouter';

export interface HealthResult {
  deviceId: string;
  online: boolean;
  latencyMs?: number;
  detail?: string;
}

export async function checkDeviceHealth(device: Device): Promise<HealthResult> {
  const start = Date.now();
  const route = resolveTransportRoute(device);
  const host = device.connection?.host ?? device.connection?.hubHost;

  try {
    if (route === 'LAN_DIRECT' && host && device.tvPlatform) {
      const port = device.connection?.port;
      if (device.tvPlatform === 'roku' || device.tvPlatform === 'tcl_roku') {
        const name = await probeRoku(host, port ?? 8060);
        return {
          deviceId: device.id,
          online: !!name,
          latencyMs: Date.now() - start,
          detail: name ?? undefined,
        };
      }
      if (device.tvPlatform === 'sony_bravia') {
        const name = await probeSony(host);
        return {
          deviceId: device.id,
          online: !!name,
          latencyMs: Date.now() - start,
          detail: name ?? undefined,
        };
      }
      if (device.tvPlatform === 'lg_webos') {
        const name = await probeLg(host, port ?? 3000);
        return {
          deviceId: device.id,
          online: !!name,
          latencyMs: Date.now() - start,
          detail: name ?? undefined,
        };
      }
      if (device.tvPlatform === 'samsung_tizen') {
        const samsung = await probeSamsung(host);
        return {
          deviceId: device.id,
          online: !!samsung,
          latencyMs: Date.now() - start,
          detail: samsung?.name,
        };
      }
      if (device.tvPlatform === 'philips_android') {
        const res = await fetchWithTimeout(`http://${host}:1925/6/system/info`, {}, 800);
        return {
          deviceId: device.id,
          online: res.ok,
          latencyMs: Date.now() - start,
        };
      }
      await fetchWithTimeout(`http://${host}/`, {}, 800);
      return { deviceId: device.id, online: true, latencyMs: Date.now() - start };
    }

    if (route === 'IR_GATEWAY' && host) {
      const ok = await probeBroadlinkHub(host);
      return { deviceId: device.id, online: ok, latencyMs: Date.now() - start };
    }

    if (route === 'BLUETOOTH' && device.connection?.mac) {
      const { checkBluetoothDeviceOnline } = await import('../BluetoothService');
      const online = await checkBluetoothDeviceOnline(device.connection.mac);
      return {
        deviceId: device.id,
        online,
        latencyMs: Date.now() - start,
        detail: online ? 'Connecté' : 'Hors de portée / non appairé',
      };
    }

    return {
      deviceId: device.id,
      online: device.protocol === 'IR',
      detail: 'IR local (pas de ping)',
    };
  } catch {
    return { deviceId: device.id, online: false, latencyMs: Date.now() - start };
  }
}

export async function checkAllDevices(devices: Device[]): Promise<HealthResult[]> {
  return Promise.all(devices.map(checkDeviceHealth));
}
