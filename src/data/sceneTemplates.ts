import type { Scene } from './devices';

export interface SceneTemplate {
  id: string;
  name: string;
  icon: string;
  description: string;
  /** commandes par type d’appareil cible */
  steps: { deviceType: 'tv'; command: string; delayMs: number }[];
}

export const SCENE_TEMPLATES: SceneTemplate[] = [
  {
    id: 'cinema',
    name: 'Mode cinéma',
    icon: '🎬',
    description: 'Allume la TV et ouvre Netflix',
    steps: [
      { deviceType: 'tv', command: 'power', delayMs: 0 },
      { deviceType: 'tv', command: 'netflix', delayMs: 2500 },
    ],
  },
  {
    id: 'off',
    name: 'Tout éteindre',
    icon: '🌙',
    description: 'Éteint les TV du foyer',
    steps: [{ deviceType: 'tv', command: 'power', delayMs: 0 }],
  },
  {
    id: 'news',
    name: 'Infos / TV',
    icon: '📰',
    description: 'Allume et monte le volume',
    steps: [
      { deviceType: 'tv', command: 'power', delayMs: 0 },
      { deviceType: 'tv', command: 'vol_up', delayMs: 1500 },
      { deviceType: 'tv', command: 'vol_up', delayMs: 400 },
    ],
  },
];

export function buildSceneFromTemplate(
  template: SceneTemplate,
  deviceIds: string[],
): Scene | null {
  const tv = deviceIds[0];
  if (!tv) return null;

  return {
    id: `scene-${template.id}-${Date.now()}`,
    name: template.name,
    icon: template.icon,
    description: template.description,
    actions: template.steps.map((s) => ({
      deviceId: tv,
      command: s.command,
      delayMs: s.delayMs,
    })),
  };
}
