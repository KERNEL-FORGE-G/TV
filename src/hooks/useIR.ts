import { useCallback } from 'react';
import { Alert } from 'react-native';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';
import { sendIRCode } from '../services/IRService';
import { useRemoteStore } from '../store/remoteStore';
import { Device, Scene } from '../data/devices';

interface UseIRReturn {
  sendCommand: (command: string) => Promise<boolean>;
  sendCommandToDevice: (deviceId: string, command: string) => Promise<boolean>;
  runScene: (scene: Scene) => Promise<boolean>;
  isSending: boolean;
}

const hapticOptions = {
  enableVibrateFallback: true, // fallback Vibration API si pas de haptique
  ignoreAndroidSystemSettings: false,
};

async function showAlert(title: string, message: string) {
  return new Promise<void>((resolve) => {
    Alert.alert(title, message, [{ text: 'OK', onPress: () => resolve() }], { cancelable: true });
  });
}

/**
 * Hook principal pour envoyer une commande IR au device actif.
 * - Récupère le code IR du device sélectionné dans le store
 * - Envoie via IRService (port IR natif ou simulation)
 * - Feedback haptique via react-native-haptic-feedback
 * - Log + mise à jour état dans le store Zustand
 */
export function useIR(): UseIRReturn {
  const {
    devices,
    activeDeviceId,
    isSending,
    setSending,
    logCommand,
    toggleDevicePower,
    preferences,
  } = useRemoteStore();

  const activeDevice = devices.find((d) => d.id === activeDeviceId);

  const sendToDevice = useCallback(
    async (device: Device, command: string) => {
      if (isSending) return false;

      const irCode = device.irCodes[command];
      if (!irCode) {
        await showAlert(
          'Commande non prise en charge',
          `La commande "${command}" n'est pas disponible pour ${device.name}.`
        );
        return false;
      }

      if (preferences.haptics) {
        try {
          ReactNativeHapticFeedback.trigger('impactLight', hapticOptions);
        } catch {
          // Silencieux si haptique indisponible
        }
      }

      setSending(true);

      try {
        const repeat = ['vol_up', 'vol_down', 'ch_up', 'ch_down'].includes(command) ? 2 : 1;
        const result = await sendIRCode(irCode, repeat);

        logCommand(device.id, command, result.success);

        if (device.id === activeDeviceId && command === 'power' && result.success) {
          toggleDevicePower(device.id);
        }

        if (!result.success) {
          await showAlert(
            'Échec de la commande',
            `La commande "${command}" n'a pas pu être envoyée.` +
              (result.error ? `

Détails : ${result.error}` : '')
          );
        }

        return result.success;
      } finally {
        setSending(false);
      }
    },
    [activeDeviceId, isSending, logCommand, preferences.haptics, setSending, toggleDevicePower]
  );

  const sendCommand = useCallback(
    async (command: string) => {
      if (!activeDevice) return false;
      return sendToDevice(activeDevice, command);
    },
    [activeDevice, sendToDevice]
  );

  const sendCommandToDevice = useCallback(
    async (deviceId: string, command: string) => {
      const targetDevice = devices.find((d) => d.id === deviceId);
      if (!targetDevice) {
        await showAlert('Appareil introuvable', 'L’appareil sélectionné est introuvable.');
        return false;
      }
      return sendToDevice(targetDevice, command);
    },
    [devices, sendToDevice]
  );

  const runScene = useCallback(
    async (scene: Scene) => {
      if (isSending) return false;

      for (const action of scene.actions) {
        if (action.delayMs > 0) {
          await new Promise<void>((resolve) => setTimeout(() => resolve(), action.delayMs));
        }

        const success = await sendCommandToDevice(action.deviceId, action.command);
        if (!success) {
          await showAlert(
            'Scène interrompue',
            `La scène "${scene.name}" a été arrêtée après une commande en échec.`
          );
          return false;
        }
      }

      return true;
    },
    [isSending, sendCommandToDevice]
  );

  return { sendCommand, sendCommandToDevice, runScene, isSending };
}
