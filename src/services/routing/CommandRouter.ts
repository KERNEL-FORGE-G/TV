import { Device } from '../../data/devices';
import type { TransportRoute } from '../../core/remoteTypes';
import { sendIRCode } from '../IRService';
import {
  assertIrCommandReady,
  hasConfiguredIrCode,
  resolveIrCodeForCommand,
} from '../ir/irValidation';
import type { LearnedIrEntry } from '../../core/remoteTypes';
import { sendSmartTvCommand, isWifiCommandSupported } from '../smartTv';
import { sendBroadlinkCommand } from '../hubs/BroadlinkService';
import type { DeviceSendResult } from '../DeviceControlService';

export function resolveTransportRoute(device: Device): TransportRoute {
  if (device.hubId || device.connection?.hubHost) {
    return 'IR_GATEWAY';
  }
  if (device.protocol === 'WiFi') {
    return 'LAN_DIRECT';
  }
  if (device.protocol === 'Bluetooth') {
    return 'BLUETOOTH';
  }
  return 'IR_NATIVE';
}

export function routeLabel(route: TransportRoute): string {
  const labels: Record<TransportRoute, string> = {
    IR_NATIVE: 'IR téléphone',
    IR_GATEWAY: 'Hub Broadlink',
    LAN_DIRECT: 'Wi‑Fi local',
    BLUETOOTH: 'Bluetooth',
    HDMI_CEC_GATEWAY: 'HDMI-CEC',
  };
  return labels[route];
}

export function isCommandSupported(
  device: Device,
  command: string,
  learnedIr: LearnedIrEntry[] = [],
): boolean {
  const route = resolveTransportRoute(device);

  if (route === 'LAN_DIRECT') {
    return !!(
      device.tvPlatform &&
      device.connection?.host &&
      isWifiCommandSupported(device.tvPlatform, command)
    );
  }

  if (route === 'BLUETOOTH') {
    return false;
  }

  if (route === 'IR_GATEWAY' || route === 'IR_NATIVE') {
    return hasConfiguredIrCode(device, command, learnedIr);
  }

  return false;
}

export async function routeCommand(
  device: Device,
  command: string,
  learnedIr: LearnedIrEntry[] = [],
): Promise<DeviceSendResult> {
  const route = resolveTransportRoute(device);

  switch (route) {
    case 'LAN_DIRECT': {
      if (!device.tvPlatform || !device.connection?.host) {
        return { success: false, error: 'IP manquante (onglet Appareils).' };
      }
      return sendSmartTvCommand(
        device.tvPlatform,
        device.connection.host,
        command,
        device.connection,
      );
    }

    case 'IR_GATEWAY': {
      const irErr = await assertIrCommandReady(device, command, learnedIr);
      if (irErr) {
        return { success: false, error: irErr };
      }
      const code = resolveIrCodeForCommand(device, command, learnedIr);
      if (!code) {
        return { success: false, error: 'Code IR manquant ou invalide.' };
      }
      return sendBroadlinkCommand(
        device.connection?.hubHost ?? device.hubId ?? '',
        code,
      );
    }

    case 'BLUETOOTH': {
      const { sendBluetoothCommand } = await import('../BluetoothService');
      return sendBluetoothCommand(command, device.connection?.mac);
    }

    case 'HDMI_CEC_GATEWAY':
      return {
        success: false,
        error: 'HDMI-CEC non disponible sur mobile.',
      };

    case 'IR_NATIVE':
    default: {
      const irErr = await assertIrCommandReady(device, command, learnedIr);
      if (irErr) {
        return { success: false, error: irErr };
      }
      const code = resolveIrCodeForCommand(device, command, learnedIr);
      if (!code) {
        return { success: false, error: 'Code IR manquant ou invalide.' };
      }
      const repeat = ['vol_up', 'vol_down', 'ch_up', 'ch_down'].includes(command)
        ? 2
        : 1;
      return sendIRCode(code, repeat);
    }
  }
}
