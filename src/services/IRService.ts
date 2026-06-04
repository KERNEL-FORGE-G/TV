/**
 * IRService — émission infrarouge via ConsumerIrManager (Android).
 * Module : react-native-ir-manager
 */

import { Platform } from 'react-native';

export interface CarrierRange {
  minHz: number;
  maxHz: number;
}

type IRNativeModule = {
  hasIrEmitter: () => Promise<boolean>;
  transmit: (freq: number, pattern: number[]) => Promise<boolean>;
  transmitProntoCode: (pronto: string) => Promise<boolean>;
  getCarrierFrequencies: () => Promise<unknown>;
};

let cachedModule: IRNativeModule | null | undefined;

function getIRModule(): IRNativeModule | null {
  if (Platform.OS !== 'android') return null;
  if (cachedModule !== undefined) return cachedModule;

  try {
    const mod = require('react-native-ir-manager').default as IRNativeModule | undefined;
    if (
      mod &&
      typeof mod.hasIrEmitter === 'function' &&
      typeof mod.transmit === 'function'
    ) {
      cachedModule = mod;
      return mod;
    }
    cachedModule = null;
    return null;
  } catch {
    cachedModule = null;
    return null;
  }
}

export function isIrNativeModuleLinked(): boolean {
  return getIRModule() != null;
}

export interface IRSendResult {
  success: boolean;
  error?: string;
  latencyMs?: number;
}

export interface IrHardwareStatus {
  platform: 'android' | 'ios' | 'other';
  moduleLinked: boolean;
  hasEmitter: boolean;
  carrierRanges: CarrierRange[];
}

export type IrReadinessReason = 'ios' | 'module' | 'hardware';

export interface IrReadiness {
  ready: boolean;
  reason: IrReadinessReason | null;
  status: IrHardwareStatus;
}

/** Vérifie module natif + émetteur IR (TRANSMIT_IR est accordée à l’installation). */
export async function getIrReadiness(): Promise<IrReadiness> {
  const status = await getIrHardwareStatus();
  if (status.platform !== 'android') {
    return { ready: false, reason: 'ios', status };
  }
  if (!status.moduleLinked) {
    return { ready: false, reason: 'module', status };
  }
  if (!status.hasEmitter) {
    return { ready: false, reason: 'hardware', status };
  }
  return { ready: true, reason: null, status };
}

export function irReadinessMessage(readiness: IrReadiness): string {
  switch (readiness.reason) {
    case 'ios':
      return 'Le port IR n’existe pas sur iPhone. Utilisez une TV en Wi‑Fi ou Bluetooth.';
    case 'module':
      return 'Module IR natif absent. Recompilez l’app : npm run android';
    case 'hardware':
      return 'Ce téléphone n’a pas d’émetteur infrarouge. Utilisez une TV en Wi‑Fi.';
    default:
      return 'Infrarouge prêt.';
  }
}

export async function getIrHardwareStatus(): Promise<IrHardwareStatus> {
  const platform =
    Platform.OS === 'android' ? 'android' : Platform.OS === 'ios' ? 'ios' : 'other';

  if (platform !== 'android') {
    return {
      platform,
      moduleLinked: false,
      hasEmitter: false,
      carrierRanges: [],
    };
  }

  const mod = getIRModule();
  if (!mod) {
    return {
      platform,
      moduleLinked: false,
      hasEmitter: false,
      carrierRanges: [],
    };
  }

  let hasEmitter = false;
  let carrierRanges: CarrierRange[] = [];

  try {
    hasEmitter = Boolean(await mod.hasIrEmitter());
  } catch {
    hasEmitter = false;
  }

  if (hasEmitter) {
    carrierRanges = await getCarrierFrequencies();
  }

  return {
    platform,
    moduleLinked: true,
    hasEmitter,
    carrierRanges,
  };
}

export async function hasIREmitter(): Promise<boolean> {
  const status = await getIrHardwareStatus();
  return status.hasEmitter;
}

function parseCarrierRanges(raw: unknown): CarrierRange[] {
  if (!Array.isArray(raw)) return [];

  return raw
    .map((item): CarrierRange | null => {
      if (item == null) return null;
      if (typeof item === 'number' && item > 0) {
        return { minHz: item, maxHz: item };
      }
      if (typeof item === 'object') {
        const row = item as Record<string, number>;
        const minHz = row.minFrequency ?? row.minHz ?? 0;
        const maxHz = row.maxFrequency ?? row.maxHz ?? minHz;
        if (minHz > 0 || maxHz > 0) {
          return { minHz, maxHz: maxHz || minHz };
        }
      }
      return null;
    })
    .filter((r): r is CarrierRange => r != null);
}

export async function getCarrierFrequencies(): Promise<CarrierRange[]> {
  const mod = getIRModule();
  if (!mod?.getCarrierFrequencies) return [];
  try {
    const raw = await mod.getCarrierFrequencies();
    return parseCarrierRanges(raw);
  } catch {
    return [];
  }
}

export function formatCarrierRanges(ranges: CarrierRange[]): string {
  if (ranges.length === 0) return '';
  return ranges
    .map((r) => {
      const minK = Math.round(r.minHz / 1000);
      const maxK = Math.round(r.maxHz / 1000);
      return minK === maxK ? `${minK} kHz` : `${minK}–${maxK} kHz`;
    })
    .join(', ');
}

export async function sendIRCode(
  irCode: string | number[],
  repeat: number = 1,
): Promise<IRSendResult> {
  const start = Date.now();

  const readiness = await getIrReadiness();
  if (!readiness.ready) {
    return {
      success: false,
      error: irReadinessMessage(readiness),
    };
  }

  const mod = getIRModule();
  if (!mod) {
    return {
      success: false,
      error: irReadinessMessage({
        ready: false,
        reason: 'module',
        status: readiness.status,
      }),
    };
  }

  try {
    if (typeof irCode === 'string' && irCode.trim().includes(' ')) {
      await mod.transmitProntoCode(irCode.trim());
      return { success: true, latencyMs: Date.now() - start };
    }

    const pattern =
      typeof irCode === 'string' ? prontoToDurations(irCode) : irCode;

    if (!pattern.length) {
      return { success: false, error: 'Code IR invalide ou vide.' };
    }

    const CARRIER_FREQ_HZ = 38000;

    for (let i = 0; i < repeat; i++) {
      await mod.transmit(CARRIER_FREQ_HZ, pattern);
      if (i < repeat - 1) {
        await delay(50);
      }
    }

    return { success: true, latencyMs: Date.now() - start };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Erreur inconnue';
    return { success: false, error: msg, latencyMs: Date.now() - start };
  }
}

/** Test d’émission avec un code Pronto hexadécimal */
export async function sendProntoCode(pronto: string): Promise<IRSendResult> {
  const trimmed = pronto.trim();
  if (!trimmed) {
    return { success: false, error: 'Code Pronto vide.' };
  }
  return sendIRCode(trimmed, 1);
}

export function prontoToDurations(pronto: string): number[] {
  const words = pronto.trim().split(/\s+/).map((h) => parseInt(h, 16));

  if (words.length < 4) return [];

  const freqCode = words[1];
  const periodUs = freqCode > 0 ? Math.round(0.241246 * freqCode) : 26;
  const burstCount = (words[2] + words[3]) * 2;

  const durations: number[] = [];
  for (let i = 4; i < 4 + burstCount && i < words.length; i++) {
    durations.push(words[i] * periodUs);
  }

  return durations;
}

/** Convertit des durées µs en code Pronto hex (réémission IR). */
export function durationsToPronto(durations: number[], carrierHz = 38000): string {
  const periodUs = Math.max(1, Math.round(1_000_000 / carrierHz));
  const freqWord = Math.round(periodUs / 0.241246);
  const bursts = durations.map((d) =>
    Math.max(1, Math.round(d / periodUs)).toString(16).padStart(4, '0').toUpperCase(),
  );
  const pairs = Math.floor(durations.length / 2);
  return [
    '0000',
    freqWord.toString(16).padStart(4, '0').toUpperCase(),
    pairs.toString(16).padStart(4, '0').toUpperCase(),
    '0000',
    ...bursts,
  ].join(' ');
}

function delay(ms: number) {
  return new Promise<void>((r) => setTimeout(r, ms));
}
