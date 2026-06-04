import { Platform, Linking } from 'react-native';

/** Ouvre les réglages Bluetooth système pour appairer une TV */
export async function openSystemBluetoothSettings(): Promise<void> {
  if (Platform.OS === 'android') {
    try {
      await Linking.sendIntent('android.settings.BLUETOOTH_SETTINGS');
      return;
    } catch {
      /* fallback */
    }
  }
  await Linking.openSettings();
}
