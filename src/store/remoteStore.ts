import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Device, Scene, INITIAL_DEVICES, INITIAL_SCENES } from '../data/devices';

interface RemotePreferences {
  haptics: boolean;
  confirmPower: boolean;
}

interface RemoteStore {
  // State
  devices: Device[];
  scenes: Scene[];
  activeDeviceId: string;
  isSending: boolean;
  lastCommand: string | null;
  commandLog: CommandLog[];
  preferences: RemotePreferences;

  // Actions
  setActiveDevice: (id: string) => void;
  toggleDevicePower: (id: string) => void;
  addDevice: (device: Device) => void;
  removeDevice: (id: string) => void;
  updateDevice: (id: string, updates: Partial<Device>) => void;
  logCommand: (deviceId: string, command: string, success: boolean) => void;
  setSending: (sending: boolean) => void;
  clearLog: () => void;
  setHaptics: (enabled: boolean) => void;
  setConfirmPower: (enabled: boolean) => void;
}

interface CommandLog {
  id: string;
  deviceId: string;
  command: string;
  success: boolean;
  timestamp: Date;
}

export const useRemoteStore = create<RemoteStore>()(
  persist(
    (set, get) => ({
      devices: INITIAL_DEVICES,
      scenes: INITIAL_SCENES,
      activeDeviceId: INITIAL_DEVICES[0].id,
      isSending: false,
      lastCommand: null,
      commandLog: [],
      preferences: {
        haptics: true,
        confirmPower: false,
      },

      setActiveDevice: (id) => set({ activeDeviceId: id }),

      toggleDevicePower: (id) =>
        set((state) => ({
          devices: state.devices.map((d) =>
            d.id === id ? { ...d, isPoweredOn: !d.isPoweredOn } : d
          ),
        })),

      addDevice: (device) =>
        set((state) => ({ devices: [...state.devices, device] })),

      removeDevice: (id) =>
        set((state) => ({ devices: state.devices.filter((d) => d.id !== id) })),

      updateDevice: (id, updates) =>
        set((state) => ({
          devices: state.devices.map((d) =>
            d.id === id ? { ...d, ...updates } : d
          ),
        })),

      logCommand: (deviceId, command, success) =>
        set((state) => ({
          lastCommand: command,
          commandLog: [
            {
              id: `${Date.now()}`,
              deviceId,
              command,
              success,
              timestamp: new Date(),
            },
            ...state.commandLog.slice(0, 49), // keep last 50
          ],
        })),

      setSending: (sending) => set({ isSending: sending }),

      clearLog: () => set({ commandLog: [] }),

      setHaptics: (enabled) =>
        set((state) => ({ preferences: { ...state.preferences, haptics: enabled } })),

      setConfirmPower: (enabled) =>
        set((state) => ({ preferences: { ...state.preferences, confirmPower: enabled } })),
    }),
    {
      name: 'universal-remote-storage',
      getStorage: () => AsyncStorage,
      partialize: (state) => ({
        devices: state.devices,
        scenes: state.scenes,
        activeDeviceId: state.activeDeviceId,
        preferences: state.preferences,
      }),
    }
  )
);
