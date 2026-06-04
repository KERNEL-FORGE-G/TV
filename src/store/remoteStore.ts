import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Device, Scene } from '../data/devices';
import type {
  Room,
  DiscoveryCandidate,
  PairingRecord,
  FavoriteChannel,
  LearnedIrEntry,
} from '../core/remoteTypes';

interface RemotePreferences {
  haptics: boolean;
  confirmPower: boolean;
  onboardingComplete: boolean;
  defaultSubnet: string;
}

interface RemoteStore {
  householdName: string;
  rooms: Room[];
  devices: Device[];
  scenes: Scene[];
  activeDeviceId: string;
  isSending: boolean;
  lastCommand: string | null;
  commandLog: CommandLog[];
  preferences: RemotePreferences;
  discoveryCandidates: DiscoveryCandidate[];
  pairings: Record<string, PairingRecord>;
  favorites: FavoriteChannel[];
  learnedIr: LearnedIrEntry[];

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
  setOnboardingComplete: (v: boolean) => void;
  setDefaultSubnet: (subnet: string) => void;
  setHouseholdName: (name: string) => void;
  addRoom: (room: Room) => void;
  setDiscoveryCandidates: (c: DiscoveryCandidate[]) => void;
  updateCandidate: (id: string, status: DiscoveryCandidate['status']) => void;
  setPairing: (deviceId: string, record: PairingRecord) => void;
  addFavorite: (fav: FavoriteChannel) => void;
  removeFavorite: (id: string) => void;
  addLearnedIr: (entry: LearnedIrEntry) => void;
  addScene: (scene: Scene) => void;
  removeScene: (id: string) => void;
  importBackup: (data: import('../services/config/ConfigExportService').RemoteBackup) => void;
}

interface CommandLog {
  id: string;
  deviceId: string;
  command: string;
  success: boolean;
  timestamp: Date;
}

const DEFAULT_ROOMS: Room[] = [
  { id: 'salon', name: 'Salon', icon: '🛋' },
  { id: 'chambre', name: 'Chambre', icon: '🛏' },
];

const DEMO_DEVICE_IDS = new Set([
  'tv-1',
  'tv-roku',
  'tv-sony',
  'tv-lg-ir',
  'decoder-1',
  'ac-1',
  'soundbar-1',
]);

function stripDemoData(state: Partial<RemoteStore>): Partial<RemoteStore> {
  const devices = (state.devices ?? []).filter((d) => !DEMO_DEVICE_IDS.has(d.id));
  const scenes = (state.scenes ?? []).filter(
    (s) => !['cinema', 'bonne-nuit', 'matin', 'gaming'].includes(s.id),
  );
  return {
    ...state,
    devices,
    scenes,
    activeDeviceId: devices.some((d) => d.id === state.activeDeviceId)
      ? state.activeDeviceId
      : devices[0]?.id ?? '',
  };
}

export const useRemoteStore = create<RemoteStore>()(
  persist(
    (set) => ({
      householdName: 'Ma maison',
      rooms: DEFAULT_ROOMS,
      devices: [],
      scenes: [],
      activeDeviceId: '',
      isSending: false,
      lastCommand: null,
      commandLog: [],
      preferences: {
        haptics: true,
        confirmPower: false,
        onboardingComplete: false,
        defaultSubnet: '192.168.1',
      },
      discoveryCandidates: [],
      pairings: {},
      favorites: [],
      learnedIr: [],

      setActiveDevice: (id) => set({ activeDeviceId: id }),

      toggleDevicePower: (id) =>
        set((state) => ({
          devices: state.devices.map((d) =>
            d.id === id ? { ...d, isPoweredOn: !d.isPoweredOn } : d,
          ),
        })),

      addDevice: (device) =>
        set((state) => ({
          devices: [...state.devices, device],
          activeDeviceId: state.activeDeviceId || device.id,
        })),

      removeDevice: (id) =>
        set((state) => {
          const devices = state.devices.filter((d) => d.id !== id);
          return {
            devices,
            activeDeviceId:
              state.activeDeviceId === id ? devices[0]?.id ?? '' : state.activeDeviceId,
            favorites: state.favorites.filter((f) => f.deviceId !== id),
            scenes: state.scenes.map((s) => ({
              ...s,
              actions: s.actions.filter((a) => a.deviceId !== id),
            })),
          };
        }),

      updateDevice: (id, updates) =>
        set((state) => ({
          devices: state.devices.map((d) =>
            d.id === id ? { ...d, ...updates } : d,
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
            ...state.commandLog.slice(0, 49),
          ],
        })),

      setSending: (sending) => set({ isSending: sending }),

      clearLog: () => set({ commandLog: [] }),

      setHaptics: (enabled) =>
        set((state) => ({
          preferences: { ...state.preferences, haptics: enabled },
        })),

      setConfirmPower: (enabled) =>
        set((state) => ({
          preferences: { ...state.preferences, confirmPower: enabled },
        })),

      setOnboardingComplete: (v) =>
        set((state) => ({
          preferences: { ...state.preferences, onboardingComplete: v },
        })),

      setDefaultSubnet: (defaultSubnet) =>
        set((state) => ({
          preferences: { ...state.preferences, defaultSubnet },
        })),

      setHouseholdName: (name) => set({ householdName: name }),

      addRoom: (room) =>
        set((state) => ({ rooms: [...state.rooms, room] })),

      setDiscoveryCandidates: (c) => set({ discoveryCandidates: c }),

      updateCandidate: (id, status) =>
        set((state) => ({
          discoveryCandidates: state.discoveryCandidates.map((c) =>
            c.id === id ? { ...c, status } : c,
          ),
        })),

      setPairing: (deviceId, record) =>
        set((state) => ({
          pairings: { ...state.pairings, [deviceId]: record },
        })),

      addFavorite: (fav) =>
        set((state) => ({ favorites: [...state.favorites, fav] })),

      removeFavorite: (id) =>
        set((state) => ({
          favorites: state.favorites.filter((f) => f.id !== id),
        })),

      addLearnedIr: (entry) =>
        set((state) => ({
          learnedIr: [
            entry,
            ...state.learnedIr.filter(
              (e) => !(e.deviceId === entry.deviceId && e.command === entry.command),
            ),
          ],
        })),

      addScene: (scene) =>
        set((state) => ({ scenes: [...state.scenes, scene] })),

      removeScene: (id) =>
        set((state) => ({
          scenes: state.scenes.filter((s) => s.id !== id),
        })),

      importBackup: (data) =>
        set((state) => ({
          householdName: data.householdName || state.householdName,
          devices: data.devices ?? [],
          scenes: data.scenes ?? [],
          rooms: data.rooms?.length ? data.rooms : state.rooms,
          favorites: data.favorites ?? [],
          learnedIr: data.learnedIr ?? [],
          pairings: data.pairings ?? state.pairings,
          preferences: {
            ...state.preferences,
            ...(data.preferences?.defaultSubnet
              ? { defaultSubnet: data.preferences.defaultSubnet }
              : {}),
            ...(data.preferences?.haptics !== undefined
              ? { haptics: data.preferences.haptics }
              : {}),
            ...(data.preferences?.confirmPower !== undefined
              ? { confirmPower: data.preferences.confirmPower }
              : {}),
          },
          activeDeviceId: data.devices?.[0]?.id ?? '',
        })),
    }),
    {
      name: 'universal-remote-storage-v2',
      storage: createJSONStorage(() => AsyncStorage),
      version: 1,
      migrate: (persisted, version) => {
        const state = stripDemoData(persisted as Partial<RemoteStore>);
        if (version < 1) {
          return {
            ...state,
            devices: state.devices ?? [],
            scenes: state.scenes ?? [],
            activeDeviceId: state.activeDeviceId ?? '',
          };
        }
        return state;
      },
      partialize: (state) => ({
        householdName: state.householdName,
        rooms: state.rooms,
        devices: state.devices,
        scenes: state.scenes,
        activeDeviceId: state.activeDeviceId,
        preferences: state.preferences,
        discoveryCandidates: state.discoveryCandidates,
        pairings: state.pairings,
        favorites: state.favorites,
        learnedIr: state.learnedIr,
      }),
    },
  ),
);
