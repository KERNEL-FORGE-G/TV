import { useCallback } from 'react';
import { Alert } from 'react-native';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';
import {
  sendDeviceCommand,
  sendDeviceText,
  isCommandSupported,
} from '../services/DeviceControlService';
import { resolveTransportRoute } from '../services/routing/CommandRouter';
import { assertIrCommandReady } from '../services/ir/irValidation';
import { useRemoteStore } from '../store/remoteStore';
import { Device, Scene } from '../data/devices';

interface UseIRReturn {
  sendCommand: (command: string) => Promise<boolean>;
  sendCommandToDevice: (deviceId: string, command: string) => Promise<boolean>;
  sendText: (text: string) => Promise<boolean>;
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

function confirmPowerToggle(deviceName: string): Promise<boolean> {
  return new Promise((resolve) => {
    Alert.alert(
      'Confirmer',
      `Envoyer power à ${deviceName} ?`,
      [
        { text: 'Annuler', style: 'cancel', onPress: () => resolve(false) },
        { text: 'OK', onPress: () => resolve(true) },
      ],
      { cancelable: true },
    );
  });
}

/**
 * Hook principal pour envoyer une commande IR au device actif.
 * - Récupère le code IR du device sélectionné dans le store
 * - Envoie via IR natif ou API Smart TV réelle
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
    learnedIr,
    pairings,
  } = useRemoteStore();

  const activeDevice = devices.find((d) => d.id === activeDeviceId);

  const sendToDevice = useCallback(
    async (device: Device, command: string) => {
      if (isSending) return false;

      const learned = learnedIr.find(
        (e) => e.deviceId === device.id && e.command === command,
      );
      const pairing = pairings[device.id];
      const effectiveDevice: Device = {
        ...device,
        irCodes: learned
          ? { ...device.irCodes, [command]: learned.prontoCode }
          : device.irCodes,
        connection: {
          ...device.connection,
          samsungToken:
            device.connection?.samsungToken ?? pairing?.token,
          lgClientKey:
            device.connection?.lgClientKey ?? pairing?.lgClientKey,
        },
      };

      if (!isCommandSupported(effectiveDevice, command)) {
        await showAlert(
          'Commande non prise en charge',
          `La commande "${command}" n'est pas disponible pour ${device.name}.`
        );
        return false;
      }

      if (device.protocol === 'WiFi' && !device.connection?.host) {
        await showAlert(
          'IP manquante',
          `Ajoutez l’adresse IP de ${device.name} dans l’onglet Appareils.`
        );
        return false;
      }

      if (
        command === 'power' &&
        preferences.confirmPower &&
        !(await confirmPowerToggle(device.name))
      ) {
        return false;
      }

      const route = resolveTransportRoute(effectiveDevice);
      if (route === 'IR_NATIVE' || route === 'IR_GATEWAY') {
        const irErr = await assertIrCommandReady(
          effectiveDevice,
          command,
          learnedIr,
        );
        if (irErr) {
          await showAlert('Infrarouge indisponible', irErr);
          return false;
        }
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
        const result = await sendDeviceCommand(
          effectiveDevice,
          command,
          learnedIr,
        );

        logCommand(device.id, command, result.success);

        if (device.id === activeDeviceId && command === 'power' && result.success) {
          toggleDevicePower(device.id);
        }

        if (!result.success) {
          await showAlert(
            result.needsPairing ? 'Appairage requis' : 'Échec de la commande',
            result.error ?? `La commande "${command}" a échoué.`
          );
        }

        return result.success;
      } finally {
        setSending(false);
      }
    },
    [
      activeDeviceId,
      isSending,
      learnedIr,
      logCommand,
      pairings,
      preferences.haptics,
      preferences.confirmPower,
      setSending,
      toggleDevicePower,
    ]
  );

  const sendText = useCallback(
    async (text: string) => {
      if (!activeDevice) return false;
      if (isSending) return false;
      setSending(true);
      try {
        const result = await sendDeviceText(activeDevice, text);
        logCommand(activeDevice.id, `text:${text.slice(0, 12)}`, result.success);
        if (!result.success) {
          await showAlert('Échec clavier', result.error ?? 'Envoi impossible.');
        }
        return result.success;
      } finally {
        setSending(false);
      }
    },
    [activeDevice, isSending, logCommand, setSending],
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

  return { sendCommand, sendCommandToDevice, sendText, runScene, isSending };
}
