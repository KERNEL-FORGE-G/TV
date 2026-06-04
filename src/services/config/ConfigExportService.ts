import { Device, Scene } from '../../data/devices';
import type { Room, FavoriteChannel, LearnedIrEntry, PairingRecord } from '../../core/remoteTypes';

export interface RemoteBackup {
  version: 1;
  exportedAt: string;
  householdName: string;
  rooms: Room[];
  devices: Device[];
  scenes: Scene[];
  favorites: FavoriteChannel[];
  learnedIr?: LearnedIrEntry[];
  pairings?: Record<string, PairingRecord>;
  preferences?: {
    defaultSubnet?: string;
    haptics?: boolean;
    confirmPower?: boolean;
  };
}

export function exportConfig(payload: Omit<RemoteBackup, 'version' | 'exportedAt'>): string {
  const backup: RemoteBackup = {
    version: 1,
    exportedAt: new Date().toISOString(),
    ...payload,
  };
  return JSON.stringify(backup, null, 2);
}

export function importConfig(json: string): RemoteBackup | null {
  try {
    const data = JSON.parse(json) as RemoteBackup;
    if (data.version !== 1 || !Array.isArray(data.devices)) {
      return null;
    }
    return data;
  } catch {
    return null;
  }
}
