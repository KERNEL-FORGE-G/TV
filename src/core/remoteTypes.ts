import type { TvPlatformId } from '../data/tvPlatforms';
import type { DeviceType, Protocol } from '../data/devices';

/** Chemins de commande (modèle adaptive-tv-remote / Sure / Broadlink) */
export type TransportRoute =
  | 'IR_NATIVE'
  | 'IR_GATEWAY'
  | 'LAN_DIRECT'
  | 'BLUETOOTH'
  | 'HDMI_CEC_GATEWAY';

export type DiscoveryCandidateStatus = 'pending' | 'adopted' | 'dismissed';

export type DiscoveryMode = 'wifi' | 'bluetooth';

export interface DiscoveryCandidate {
  id: string;
  name: string;
  host: string;
  platformId: TvPlatformId;
  port?: number;
  mac?: string;
  protocol: Protocol;
  route: TransportRoute;
  status: DiscoveryCandidateStatus;
  discoveredAt: number;
  signalStrength?: number;
  /** Origine Bluetooth (appairé système vs scan) */
  bluetoothSource?: 'bonded' | 'scan';
}

export interface Room {
  id: string;
  name: string;
  icon: string;
}

export interface PairingRecord {
  deviceId: string;
  platformId: TvPlatformId;
  status: 'none' | 'pending' | 'paired' | 'failed';
  token?: string;
  lgClientKey?: string;
  pin?: string;
  lastAttempt?: number;
  error?: string;
}

export interface FavoriteChannel {
  id: string;
  deviceId: string;
  label: string;
  command: string;
  icon?: string;
}

export interface LearnedIrEntry {
  deviceId: string;
  command: string;
  prontoCode: string;
  learnedAt: number;
}

export interface RemoteLayoutButton {
  command: string;
  label: string;
  variant?: 'ghost' | 'accent' | 'danger' | 'nav';
  col?: number;
}

export interface RemoteLayoutSection {
  id: string;
  title?: string;
  buttons: RemoteLayoutButton[];
}

export interface IrBrandProfile {
  id: string;
  brand: string;
  deviceType: DeviceType;
  codeSets: IrCodeSet[];
}

export interface IrCodeSet {
  id: string;
  label: string;
  region?: string;
  codes: Record<string, string>;
}
