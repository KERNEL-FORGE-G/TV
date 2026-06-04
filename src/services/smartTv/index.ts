import type { TvPlatformId } from '../../data/tvPlatforms';
import type { ConnectionOpts, SmartTvSendResult } from './types';
import { sendRokuCommand } from './roku';
import { sendSonyCommand } from './sony';
import { sendLgButton } from './lg';
import { sendPhilipsCommand } from './philips';
import { sendSamsungCommand } from './samsung';
import { launchRokuApp } from './rokuApps';
import { isStreamingAppCommand } from './commandMaps';
import { isWifiCommandSupported } from './wifiCommands';

export type { DiscoveredTv, SmartTvSendResult } from './types';
export {
  isWifiCommandSupported,
  listWifiCommands,
  supportsTvKeyboard,
} from './wifiCommands';
export { sendRokuText } from './rokuApps';

export async function sendSmartTvCommand(
  platformId: TvPlatformId,
  host: string,
  command: string,
  connection?: ConnectionOpts,
): Promise<SmartTvSendResult> {
  if (!host) {
    return { success: false, error: 'Adresse IP manquante pour cette TV Wi‑Fi.' };
  }

  const port = connection?.port;

  if (isStreamingAppCommand(command)) {
    if (platformId === 'roku' || platformId === 'tcl_roku') {
      return launchRokuApp(host, command, port ?? 8060);
    }
    return {
      success: false,
      error: `Le raccourci « ${command} » nécessite une TV Roku.`,
    };
  }

  if (!isWifiCommandSupported(platformId, command)) {
    return {
      success: false,
      error: `Commande « ${command} » non supportée pour ${platformId}.`,
    };
  }

  switch (platformId) {
    case 'roku':
    case 'tcl_roku':
      return sendRokuCommand(host, command, port ?? 8060);

    case 'sony_bravia':
      return sendSonyCommand(host, command);

    case 'lg_webos':
      return connection?.lgClientKey
        ? sendLgButton(host, command, connection.lgClientKey, port ?? 3000)
        : {
            success: false,
            needsPairing: true,
            error: 'Clé LG requise — appairez la TV (onglet Appareils).',
          };

    case 'philips_android':
      return sendPhilipsCommand(host, command, port ?? 1925);

    case 'samsung_tizen':
      return sendSamsungCommand(host, command, connection?.samsungToken, port ?? 8001);

    default:
      return {
        success: false,
        error: `Plateforme Wi‑Fi non implémentée : ${platformId}.`,
      };
  }
}
