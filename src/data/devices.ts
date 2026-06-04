import type { TvPlatformId } from './tvPlatforms';

export type DeviceType = 'tv' | 'decoder' | 'ac' | 'soundbar' | 'projector' | 'dvd';

export type Protocol = 'IR' | 'Bluetooth' | 'WiFi' | 'RF';

export interface DeviceConnection {
  host?: string;
  port?: number;
  mac?: string;
  hubHost?: string;
  lgClientKey?: string;
  samsungToken?: string;
}

export interface Device {
  id: string;
  name: string;
  brand: string;
  model?: string;
  type: DeviceType;
  protocol: Protocol;
  tvPlatform?: TvPlatformId;
  connection?: DeviceConnection;
  roomId?: string;
  irBrandId?: string;
  irCodeSetId?: string;
  isOnline: boolean;
  isPoweredOn: boolean;
  icon: string;
  hubId?: string;
  /** Codes Pronto ou appris — vide tant qu’aucun signal réel n’est enregistré */
  irCodes: Record<string, string>;
}

export interface Scene {
  id: string;
  name: string;
  icon: string;
  description: string;
  actions: SceneAction[];
}

export interface SceneAction {
  deviceId: string;
  command: string;
  delayMs: number;
}

export interface RemoteButton {
  id: string;
  label: string;
  icon?: string;
  command: string;
  color?: string;
  size?: 'sm' | 'md' | 'lg';
}
