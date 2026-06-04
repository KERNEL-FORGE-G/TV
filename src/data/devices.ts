export type DeviceType = 'tv' | 'decoder' | 'ac' | 'soundbar' | 'projector' | 'dvd';

export type Protocol = 'IR' | 'Bluetooth' | 'WiFi' | 'RF';

export interface Device {
  id: string;
  name: string;
  brand: string;
  model?: string;
  type: DeviceType;
  protocol: Protocol;
  isOnline: boolean;
  isPoweredOn: boolean;
  icon: string;
  hubId?: string; // Broadlink hub ID if via WiFi
  irCodes: Record<string, string>; // command -> IR hex code
}

export interface Scene {
  id: string;
  name: string;
  icon: string;
  description: string;
  actions: SceneAction[];
}

export interface SceneAction {
  deviceId: string;
  command: string;
  delayMs: number;
}

export interface RemoteButton {
  id: string;
  label: string;
  icon?: string;
  command: string;
  color?: string;
  size?: 'sm' | 'md' | 'lg';
}

// Base de codes IR exemple (format Broadlink/Pronto hex)
export const IR_CODES: Record<DeviceType, Record<string, string>> = {
  tv: {
    power:     '0000 006D 0022 0002',
    vol_up:    '0000 006D 0022 0003',
    vol_down:  '0000 006D 0022 0004',
    mute:      '0000 006D 0022 0005',
    ch_up:     '0000 006D 0022 0006',
    ch_down:   '0000 006D 0022 0007',
    menu:      '0000 006D 0022 0008',
    back:      '0000 006D 0022 0009',
    ok:        '0000 006D 0022 000A',
    up:        '0000 006D 0022 000B',
    down:      '0000 006D 0022 000C',
    left:      '0000 006D 0022 000D',
    right:     '0000 006D 0022 000E',
    num_0:     '0000 006D 0022 0010',
    num_1:     '0000 006D 0022 0011',
    num_2:     '0000 006D 0022 0012',
    num_3:     '0000 006D 0022 0013',
    num_4:     '0000 006D 0022 0014',
    num_5:     '0000 006D 0022 0015',
    num_6:     '0000 006D 0022 0016',
    num_7:     '0000 006D 0022 0017',
    num_8:     '0000 006D 0022 0018',
    num_9:     '0000 006D 0022 0019',
    source:    '0000 006D 0022 001A',
    home:      '0000 006D 0022 001B',
  },
  decoder: {
    power:     '0000 006D 0033 0002',
    vol_up:    '0000 006D 0033 0003',
    vol_down:  '0000 006D 0033 0004',
    ch_up:     '0000 006D 0033 0006',
    ch_down:   '0000 006D 0033 0007',
    ok:        '0000 006D 0033 000A',
    up:        '0000 006D 0033 000B',
    down:      '0000 006D 0033 000C',
    left:      '0000 006D 0033 000D',
    right:     '0000 006D 0033 000E',
    menu:      '0000 006D 0033 0008',
    back:      '0000 006D 0033 0009',
    rec:       '0000 006D 0033 001C',
    play:      '0000 006D 0033 001D',
    pause:     '0000 006D 0033 001E',
  },
  ac: {
    power:     '0000 006D 0044 0002',
    temp_up:   '0000 006D 0044 0020',
    temp_down: '0000 006D 0044 0021',
    fan_up:    '0000 006D 0044 0022',
    fan_down:  '0000 006D 0044 0023',
    mode_cool: '0000 006D 0044 0024',
    mode_heat: '0000 006D 0044 0025',
    mode_fan:  '0000 006D 0044 0026',
    mode_auto: '0000 006D 0044 0027',
    swing:     '0000 006D 0044 0028',
    sleep:     '0000 006D 0044 0029',
  },
  soundbar: {
    power:     '0000 006D 0055 0002',
    vol_up:    '0000 006D 0055 0003',
    vol_down:  '0000 006D 0055 0004',
    mute:      '0000 006D 0055 0005',
    source:    '0000 006D 0055 001A',
    bass_up:   '0000 006D 0055 0030',
    bass_down: '0000 006D 0055 0031',
    surround:  '0000 006D 0055 0032',
  },
  projector: {
    power:     '0000 006D 0066 0002',
    source:    '0000 006D 0066 001A',
    menu:      '0000 006D 0066 0008',
    ok:        '0000 006D 0066 000A',
    up:        '0000 006D 0066 000B',
    down:      '0000 006D 0066 000C',
    left:      '0000 006D 0066 000D',
    right:     '0000 006D 0066 000E',
    zoom_in:   '0000 006D 0066 0040',
    zoom_out:  '0000 006D 0066 0041',
  },
  dvd: {
    power:     '0000 006D 0077 0002',
    play:      '0000 006D 0077 001D',
    pause:     '0000 006D 0077 001E',
    stop:      '0000 006D 0077 001F',
    next:      '0000 006D 0077 002A',
    prev:      '0000 006D 0077 002B',
    eject:     '0000 006D 0077 002C',
    menu:      '0000 006D 0077 0008',
  },
};

export const INITIAL_DEVICES: Device[] = [
  {
    id: 'tv-1',
    name: 'TV Samsung',
    brand: 'Samsung',
    model: 'QLED 55"',
    type: 'tv',
    protocol: 'IR',
    isOnline: true,
    isPoweredOn: true,
    icon: '📺',
    irCodes: IR_CODES.tv,
  },
  {
    id: 'decoder-1',
    name: 'Décodeur Canal+',
    brand: 'Canal+',
    type: 'decoder',
    protocol: 'IR',
    isOnline: true,
    isPoweredOn: false,
    icon: '📡',
    irCodes: IR_CODES.decoder,
  },
  {
    id: 'ac-1',
    name: 'Climatiseur',
    brand: 'Daikin',
    model: 'FTXM50R',
    type: 'ac',
    protocol: 'IR',
    isOnline: false,
    isPoweredOn: false,
    icon: '❄️',
    irCodes: IR_CODES.ac,
  },
  {
    id: 'soundbar-1',
    name: 'Soundbar LG',
    brand: 'LG',
    model: 'SN11R',
    type: 'soundbar',
    protocol: 'Bluetooth',
    isOnline: true,
    isPoweredOn: true,
    icon: '🔊',
    irCodes: IR_CODES.soundbar,
  },
];

export const INITIAL_SCENES: Scene[] = [
  {
    id: 'cinema',
    name: 'Mode Cinéma',
    icon: '🎬',
    description: 'TV + Soundbar + Lumières',
    actions: [
      { deviceId: 'tv-1', command: 'power', delayMs: 0 },
      { deviceId: 'soundbar-1', command: 'power', delayMs: 1500 },
      { deviceId: 'tv-1', command: 'source', delayMs: 3000 },
    ],
  },
  {
    id: 'bonne-nuit',
    name: 'Bonne nuit',
    icon: '🌙',
    description: 'Éteindre tout',
    actions: [
      { deviceId: 'tv-1', command: 'power', delayMs: 0 },
      { deviceId: 'soundbar-1', command: 'power', delayMs: 500 },
      { deviceId: 'decoder-1', command: 'power', delayMs: 1000 },
      { deviceId: 'ac-1', command: 'power', delayMs: 1500 },
    ],
  },
  {
    id: 'matin',
    name: 'Matin',
    icon: '☀️',
    description: 'TV + Infos',
    actions: [
      { deviceId: 'tv-1', command: 'power', delayMs: 0 },
      { deviceId: 'decoder-1', command: 'power', delayMs: 2000 },
    ],
  },
  {
    id: 'gaming',
    name: 'Gaming',
    icon: '🎮',
    description: 'TV + Soundbar + Clim 20°',
    actions: [
      { deviceId: 'tv-1', command: 'power', delayMs: 0 },
      { deviceId: 'soundbar-1', command: 'power', delayMs: 1000 },
      { deviceId: 'ac-1', command: 'power', delayMs: 1500 },
      { deviceId: 'ac-1', command: 'mode_cool', delayMs: 2500 },
    ],
  },
];
