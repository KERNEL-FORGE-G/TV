import type { DeviceType } from './devices';
import type { RemoteLayoutSection } from '../core/remoteTypes';

const TV_QUICK: RemoteLayoutSection = {
  id: 'quick',
  title: 'RACCOURCIS',
  buttons: [
    { command: 'netflix', label: 'NETFLIX', variant: 'ghost' },
    { command: 'youtube', label: 'YT', variant: 'ghost' },
    { command: 'prime', label: 'PRIME', variant: 'ghost' },
    { command: 'guide', label: 'GUIDE', variant: 'ghost' },
  ],
};

const TV_STREAMING: RemoteLayoutSection = {
  id: 'streaming',
  title: 'APPS',
  buttons: [
    { command: 'netflix', label: 'Netflix' },
    { command: 'youtube', label: 'YouTube' },
    { command: 'disney', label: 'Disney+' },
    { command: 'spotify', label: 'Spotify' },
  ],
};

const AC_LAYOUT: RemoteLayoutSection = {
  id: 'ac',
  title: 'CLIMATISATION',
  buttons: [
    { command: 'temp_up', label: 'Temp +' },
    { command: 'temp_down', label: 'Temp −' },
    { command: 'mode_cool', label: 'Froid' },
    { command: 'mode_heat', label: 'Chaud' },
    { command: 'fan_up', label: 'Vent +' },
    { command: 'swing', label: 'Swing' },
  ],
};

const DECODER_LAYOUT: RemoteLayoutSection = {
  id: 'decoder',
  title: 'DÉCODEUR',
  buttons: [
    { command: 'rec', label: '● REC' },
    { command: 'play', label: '▶' },
    { command: 'pause', label: '⏸' },
    { command: 'guide', label: 'Guide' },
  ],
};

export const LAYOUTS_BY_TYPE: Record<DeviceType, RemoteLayoutSection[]> = {
  tv: [TV_QUICK, TV_STREAMING],
  decoder: [DECODER_LAYOUT],
  ac: [AC_LAYOUT],
  soundbar: [
    {
      id: 'sound',
      title: 'SON',
      buttons: [
        { command: 'bass_up', label: 'Bass +' },
        { command: 'surround', label: 'Surround' },
        { command: 'source', label: 'Source' },
      ],
    },
  ],
  projector: [
    {
      id: 'proj',
      buttons: [
        { command: 'zoom_in', label: 'Zoom +' },
        { command: 'zoom_out', label: 'Zoom −' },
      ],
    },
  ],
  dvd: [
    {
      id: 'dvd',
      buttons: [
        { command: 'play', label: '▶' },
        { command: 'stop', label: '■' },
        { command: 'eject', label: '⏏' },
      ],
    },
  ],
};
