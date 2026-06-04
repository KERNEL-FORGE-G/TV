import type { TvPlatformId } from '../../data/tvPlatforms';
import {
  LG_KEYS,
  PHILIPS_KEYS,
  ROKU_KEYS,
  SAMSUNG_KEYS,
  SONY_IRCC,
  isStreamingAppCommand,
} from './commandMaps';

const WIFI_KEY_MAPS: Partial<Record<TvPlatformId, Record<string, string>>> = {
  roku: ROKU_KEYS,
  tcl_roku: ROKU_KEYS,
  sony_bravia: SONY_IRCC,
  philips_android: PHILIPS_KEYS,
  lg_webos: LG_KEYS,
  samsung_tizen: SAMSUNG_KEYS,
};

const ROKU_PLATFORMS: TvPlatformId[] = ['roku', 'tcl_roku'];

export function isWifiCommandSupported(
  platformId: TvPlatformId,
  command: string,
): boolean {
  if (isStreamingAppCommand(command)) {
    return ROKU_PLATFORMS.includes(platformId);
  }
  const map = WIFI_KEY_MAPS[platformId];
  return !!map && command in map;
}

export function supportsTvKeyboard(platformId: TvPlatformId): boolean {
  return ROKU_PLATFORMS.includes(platformId);
}

export function listWifiCommands(platformId: TvPlatformId): string[] {
  const map = WIFI_KEY_MAPS[platformId];
  const keys = map ? Object.keys(map) : [];
  if (ROKU_PLATFORMS.includes(platformId)) {
    return [...keys, 'netflix', 'youtube', 'prime', 'disney', 'spotify'];
  }
  return keys;
}
