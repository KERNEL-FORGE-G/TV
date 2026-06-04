/**
 * IRService — Émission infrarouge via le port IR natif du téléphone.
 *
 * Compatibilité port IR intégré (Android uniquement) :
 *   Xiaomi / Redmi / Poco, Huawei / Honor (anciens), Samsung Galaxy S4/S5,
 *   HTC One M7/M8, LG G2/G3/G4, Asus ZenFone IR...
 *
 * Sur iOS ou appareils sans port IR → bascule automatiquement en simulation.
 *
 * Package natif : react-native-ir-manager
 *   Android : utilise ConsumerIrManager (API Android 19+)
 *   Lien natif automatique (RN 0.60+ autolink)
 */

import { Platform } from 'react-native';

// Import conditionnel — le module n'existe que sur Android
let IRManager: any = null;
if (Platform.OS === 'android') {
  try {
    IRManager = require('react-native-ir-manager').default;
  } catch {
    console.warn('[IR] react-native-ir-manager non disponible — mode simulation activé');
  }
}

export interface IRSendResult {
  success: boolean;
  error?: string;
  latencyMs?: number;
  simulated?: boolean;
}

/**
 * Vérifie si le téléphone possède un émetteur IR intégré.
 */
export async function hasIREmitter(): Promise<boolean> {
  if (Platform.OS !== 'android' || !IRManager) return false;
  try {
    return await IRManager.hasIrEmitter();
  } catch {
    return false;
  }
}

/**
 * Envoie un signal IR depuis le port natif du téléphone.
 *
 * @param irCode  Code au format Pronto hex ("0000 006D 0022 0002 ...")
 *                ou tableau de durées en microsecondes [on, off, on, off, ...]
 * @param repeat  Nombre de répétitions (utile pour volume +/-)
 */
export async function sendIRCode(
  irCode: string | number[],
  repeat: number = 1
): Promise<IRSendResult> {
  const start = Date.now();

  // ── Mode simulation (iOS, émulateur, appareil sans IR) ─────────────────────
  if (Platform.OS !== 'android' || !IRManager) {
    await simulateDelay();
    console.log('[IR SIM] Envoi simulé :', typeof irCode === 'string' ? irCode.slice(0, 30) : irCode);
    return { success: true, latencyMs: Date.now() - start, simulated: true };
  }

  try {
    const hasIR = await IRManager.hasIrEmitter();
    if (!hasIR) {
      console.warn('[IR] Cet appareil n\'a pas de port IR.');
      // Bascule sur simulation silencieuse plutôt que d'afficher une erreur
      return { success: true, latencyMs: Date.now() - start, simulated: true };
    }

    // Convertir le code Pronto hex en tableau de durées si nécessaire
    const pattern = typeof irCode === 'string'
      ? prontoToDurations(irCode)
      : irCode;

    const CARRIER_FREQ_HZ = 38000; // 38 kHz standard pour la plupart des appareils

    for (let i = 0; i < repeat; i++) {
      await IRManager.transmit(CARRIER_FREQ_HZ, pattern);
      if (i < repeat - 1) await simulateDelay(50); // pause entre répétitions
    }

    return { success: true, latencyMs: Date.now() - start };
  } catch (err: any) {
    console.error('[IR] Erreur envoi:', err);
    return { success: false, error: err?.message ?? 'Erreur inconnue' };
  }
}

/**
 * Lance le mode apprentissage IR (Android uniquement).
 * Pointer la télécommande physique vers le téléphone.
 *
 * Note : nécessite un téléphone avec récepteur IR (rare sur les modèles récents).
 * Alternative recommandée : utiliser un hub Broadlink pour l'apprentissage.
 *
 * @returns Tableau de durées capturées, ou null si timeout/échec
 */
export async function learnIRCode(timeoutMs: number = 10000): Promise<number[] | null> {
  if (Platform.OS !== 'android' || !IRManager) {
    console.warn('[IR] Apprentissage non supporté sur cette plateforme.');
    return null;
  }

  try {
    const hasIR = await IRManager.hasIrEmitter();
    if (!hasIR) return null;

    // Certains appareils exposent une API de réception IR
    const learned = await Promise.race([
      IRManager.learn ? IRManager.learn() : Promise.resolve(null),
      new Promise<null>((resolve) => setTimeout(() => resolve(null), timeoutMs)),
    ]);

    return learned as number[] | null;
  } catch {
    return null;
  }
}

/**
 * Retourne les fréquences de porteuse supportées par le matériel.
 * Utile pour vérifier la compatibilité avec certains appareils exotiques.
 */
export async function getCarrierFrequencies(): Promise<number[]> {
  if (Platform.OS !== 'android' || !IRManager) return [];
  try {
    return (await IRManager.getCarrierFrequencies()) ?? [];
  } catch {
    return [];
  }
}

// ─── Utilitaires ──────────────────────────────────────────────────────────────

/**
 * Convertit un code Pronto hex en tableau de durées µs pour Android ConsumerIrManager.
 *
 * Format Pronto : "0000 006D 0022 0002 [paires burst ON/OFF en périodes de porteuse]"
 * Format Android : [durée_ON_µs, durée_OFF_µs, durée_ON_µs, durée_OFF_µs, ...]
 */
export function prontoToDurations(pronto: string): number[] {
  const words = pronto.trim().split(/\s+/).map((h) => parseInt(h, 16));

  if (words.length < 4) return [];

  // Fréquence de porteuse encodée dans le mot 1 (en cycles de 0.241246 µs)
  const freqCode = words[1];
  const periodUs = freqCode > 0 ? Math.round(0.241246 * freqCode) : 26; // défaut 38kHz
  const burstCount = (words[2] + words[3]) * 2; // paires ON+OFF

  const durations: number[] = [];
  for (let i = 4; i < 4 + burstCount && i < words.length; i++) {
    durations.push(words[i] * periodUs);
  }

  return durations;
}

function simulateDelay(ms: number = 150) {
  return new Promise<void>((r) => setTimeout(() => r(), ms));
}
