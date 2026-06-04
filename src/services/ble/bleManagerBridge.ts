import { NativeModules, Platform, TurboModuleRegistry } from 'react-native';

export interface BlePeripheral {
  id: string;
  name?: string;
  rssi?: number;
}

type CallbackError = string | null;

interface NativeBleModule {
  start(options: object, callback: (error: CallbackError) => void): void;
  scan(options: object, callback: (error: CallbackError) => void): void;
  stopScan(callback: (error: CallbackError) => void): void;
  getDiscoveredPeripherals(
    callback: (error: CallbackError, result: BlePeripheral[] | null) => void,
  ): void;
  getBondedPeripherals(
    callback: (error: CallbackError, result: BlePeripheral[] | null) => void,
  ): void;
  checkState(callback: (state: string) => void): void;
  connect(
    peripheralId: string,
    options: object,
    callback: (error: CallbackError) => void,
  ): void;
  disconnect(
    peripheralId: string,
    force: boolean,
    callback: (error: CallbackError) => void,
  ): void;
  getConnectedPeripherals(
    serviceUUIDs: string[],
    callback: (error: CallbackError, result: BlePeripheral[] | null) => void,
  ): void;
  onDiscoverPeripheral(
    callback: (peripheral: BlePeripheral) => void,
  ): { remove: () => void };
}

export interface BleManagerApi {
  start(options: { showAlert: boolean }): Promise<void>;
  scan(options: { scanMode: number; seconds: number }): Promise<void>;
  stopScan(): Promise<void>;
  getDiscoveredPeripherals(): Promise<BlePeripheral[]>;
  getBondedPeripherals(): Promise<BlePeripheral[]>;
  checkState(): Promise<string>;
  connect(peripheralId: string): Promise<void>;
  disconnect(peripheralId: string): Promise<void>;
  isPeripheralConnected(
    peripheralId: string,
    serviceUUIDs: string[],
  ): Promise<boolean>;
  onDiscoverPeripheral(
    callback: (peripheral: BlePeripheral) => void,
  ): { remove: () => void };
}

declare const global: { __turboModuleProxy?: unknown };

function promisify<T>(
  run: (resolve: (v: T) => void, reject: (e: unknown) => void) => void,
): Promise<T> {
  return new Promise((resolve, reject) => {
    run(resolve, reject);
  });
}

function getRawNativeModule(): NativeBleModule | null {
  if (Platform.OS !== 'android' && Platform.OS !== 'ios') return null;
  try {
    if (global?.__turboModuleProxy != null) {
      const turbo = TurboModuleRegistry.get(
        'BleManager',
      ) as NativeBleModule | null;
      if (turbo && typeof turbo.start === 'function') return turbo;
    }
    const legacy = NativeModules.BleManager as NativeBleModule | undefined;
    if (legacy && typeof legacy.start === 'function') return legacy;
  } catch {
    /* ignore */
  }
  return null;
}

function wrapNative(native: NativeBleModule): BleManagerApi {
  return {
    start: (options) =>
      promisify((resolve, reject) => {
        native.start(options, (error) => {
          if (error) reject(new Error(String(error)));
          else resolve();
        });
      }),

    scan: (options) =>
      promisify((resolve, reject) => {
        native.scan(
          {
            serviceUUIDs: [],
            seconds: options.seconds ?? 0,
            allowDuplicates: false,
            scanMode: options.scanMode ?? 2,
          },
          (error) => {
            if (error) reject(new Error(String(error)));
            else resolve();
          },
        );
      }),

    stopScan: () =>
      promisify((resolve, reject) => {
        native.stopScan((error) => {
          if (error) reject(new Error(String(error)));
          else resolve();
        });
      }),

    getDiscoveredPeripherals: () =>
      promisify((resolve, reject) => {
        native.getDiscoveredPeripherals((error, result) => {
          if (error) reject(new Error(String(error)));
          else resolve(result ?? []);
        });
      }),

    getBondedPeripherals: () =>
      promisify((resolve, reject) => {
        native.getBondedPeripherals((error, result) => {
          if (error) reject(new Error(String(error)));
          else resolve(result ?? []);
        });
      }),

    checkState: () =>
      promisify((resolve) => {
        native.checkState((state) => resolve(state));
      }),

    connect: (peripheralId) =>
      promisify((resolve, reject) => {
        native.connect(peripheralId, {}, (error) => {
          if (error) reject(new Error(String(error)));
          else resolve();
        });
      }),

    disconnect: (peripheralId) =>
      promisify((resolve, reject) => {
        native.disconnect(peripheralId, true, (error) => {
          if (error) reject(new Error(String(error)));
          else resolve();
        });
      }),

    isPeripheralConnected: (peripheralId, serviceUUIDs) =>
      promisify((resolve, reject) => {
        native.getConnectedPeripherals(serviceUUIDs, (error, result) => {
          if (error) reject(new Error(String(error)));
          else resolve(!!result?.some((p) => p.id === peripheralId));
        });
      }),

    onDiscoverPeripheral: (callback) => native.onDiscoverPeripheral(callback),
  };
}

let cached: BleManagerApi | null | undefined;

/** Module natif compilé dans l’APK (sans charger le package npm). */
export function isBleNativeLinked(): boolean {
  return getRawNativeModule() != null;
}

export function getBleManager(): BleManagerApi | null {
  if (cached !== undefined) return cached;
  const raw = getRawNativeModule();
  if (!raw) {
    cached = null;
    return null;
  }
  cached = wrapNative(raw);
  return cached;
}

export const BLE_REBUILD_HINT =
  'Bluetooth natif indisponible. Fermez l’app, puis : npm run android (recompilation complète).';
