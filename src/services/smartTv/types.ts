import type { TvPlatformId } from '../../data/tvPlatforms';
import type { DeviceConnection } from '../../data/devices';

export interface SmartTvSendResult {
  success: boolean;
  error?: string;
  needsPairing?: boolean;
}

export interface DiscoveredTv {
  host: string;
  platformId: TvPlatformId;
  name: string;
  port?: number;
}

export type ConnectionOpts = DeviceConnection | undefined;
