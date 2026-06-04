import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Alert,
} from 'react-native';
import { getIrHardwareStatus } from '../services/IRService';
import {
  scanDiscoveryCandidates,
  adoptCandidate,
} from '../services/discovery/DiscoveryManager';
import { calibrateDiscoveryCandidate } from '../services/discovery/deviceCalibration';
import type { DiscoveryCandidate } from '../core/remoteTypes';
import { createDeviceFromPlatform } from '../data/tvPlatforms';
import { IR_BRAND_DATABASE } from '../data/irDatabase';
import { useRemoteStore } from '../store/remoteStore';
import { Screen } from '../components/Screen';
import { Card } from '../components/ui/Card';
import { FadeIn } from '../components/ui/FadeIn';
import { resolveLocalSubnetPrefix } from '../utils/network';
import { ensureNetworkPermissions, ensureIrPermissions } from '../utils/permissions';
import { colors, spacing, radius, typography, shadows, forms } from '../theme';

const STEPS = ['Matériel', 'Réseau', 'Première TV', 'Terminé'];

export const SetupWizardScreen: React.FC<{ onDone: () => void }> = ({ onDone }) => {
  const [step, setStep] = useState(0);
  const [hasIR, setHasIR] = useState<boolean | null>(null);
  const [irChecking, setIrChecking] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState('');
  const scanAbortRef = useRef<AbortController | null>(null);
  const scanMountedRef = useRef(true);

  useEffect(() => {
    scanMountedRef.current = true;
    return () => {
      scanMountedRef.current = false;
      scanAbortRef.current?.abort();
    };
  }, []);
  const [subnet, setSubnet] = useState('192.168.1');
  const [brandId, setBrandId] = useState('samsung');
  const [scanResults, setScanResults] = useState<DiscoveryCandidate[]>([]);
  const {
    addDevice,
    setActiveDevice,
    setOnboardingComplete,
    setHouseholdName,
    householdName,
    setDiscoveryCandidates,
    preferences,
    rooms,
  } = useRemoteStore();

  useEffect(() => {
    getIrHardwareStatus()
      .then((s) => setHasIR(s.hasEmitter))
      .finally(() => setIrChecking(false));
  }, []);

  useEffect(() => {
    resolveLocalSubnetPrefix().then((prefix) => {
      setSubnet(preferences.defaultSubnet || prefix);
    });
  }, [preferences.defaultSubnet]);

  const stopScan = () => {
    scanAbortRef.current?.abort();
  };

  const scanNetwork = async () => {
    const allowed = await ensureNetworkPermissions();
    if (!allowed) return;

    scanAbortRef.current?.abort();
    const controller = new AbortController();
    scanAbortRef.current = controller;

    setScanning(true);
    setScanProgress('0s / 15s');
    try {
      const candidates = await scanDiscoveryCandidates(subnet, {
        signal: controller.signal,
        onProgress: (info) => {
          if (scanMountedRef.current && !controller.signal.aborted) {
            setScanProgress(info.label);
          }
        },
      });
      if (scanMountedRef.current) {
        setDiscoveryCandidates(candidates);
        setScanResults(candidates);
      }
    } finally {
      if (scanAbortRef.current === controller) {
        scanAbortRef.current = null;
      }
      if (scanMountedRef.current) {
        setScanning(false);
        setScanProgress('');
      }
    }
  };

  const addScannedTv = async (c: DiscoveryCandidate) => {
    const calibrated = await calibrateDiscoveryCandidate(c);
    if (!calibrated) {
      Alert.alert(
        'TV inaccessible',
        `${c.name} ne répond plus. Vérifiez le Wi‑Fi ou relancez le scan.`,
      );
      return;
    }
    const partial = adoptCandidate(calibrated, rooms[0]?.id);
    const dev = createDeviceFromPlatform(calibrated.platformId, {
      name: partial.name ?? calibrated.name,
      host: calibrated.host,
      port: calibrated.port,
    });
    Object.assign(dev, partial);
    dev.connection = {
      ...dev.connection,
      host: calibrated.host,
      port: calibrated.port ?? dev.connection?.port,
    };
    dev.isOnline = true;
    addDevice(dev);
    setActiveDevice(dev.id);
    finish();
  };

  const addIrTv = async () => {
    const irOk = await ensureIrPermissions();
    if (!irOk) return;

    const brand = IR_BRAND_DATABASE.find((b) => b.id === brandId)!;
    const dev = createDeviceFromPlatform('ir_generic', {
      name: `${brand.brand} TV`,
    });
    dev.irBrandId = brandId;
    addDevice(dev);
    setActiveDevice(dev.id);
    finish();
  };

  const finish = () => {
    setOnboardingComplete(true);
    onDone();
  };

  /** Passe le scan réseau et ouvre l’app (ajout TV plus tard dans Appareils). */
  const skipNetworkScan = () => {
    if (scanning) stopScan();
    finish();
  };

  const goToManualIrSetup = () => {
    if (scanning) stopScan();
    setStep(2);
  };

  return (
    <Screen style={styles.wrap}>
      <Text style={styles.hero}>Télécommande</Text>
      <Text style={styles.heroSub}>Configuration en quelques étapes</Text>

      <View style={styles.stepRow}>
        {STEPS.map((label, i) => (
          <View key={label} style={styles.stepItem}>
            <View
              style={[
                styles.stepDot,
                i <= step && styles.stepDotActive,
                i === step && styles.stepDotCurrent,
              ]}
            />
            <Text style={[styles.stepLabel, i <= step && styles.stepLabelActive]}>
              {label}
            </Text>
          </View>
        ))}
      </View>

      <FadeIn key={step} offset={12}>
      {step === 0 && (
        <Card glow style={styles.panel}>
          <Text style={styles.title}>Bienvenue</Text>
          <Text style={styles.body}>
            Donnez un nom à votre foyer et vérifiez les capacités de ce téléphone.
          </Text>
          <Text style={styles.fieldLabel}>Nom du foyer</Text>
          <TextInput
            style={styles.input}
            placeholder="Salon, Maison…"
            placeholderTextColor={forms.placeholderColor}
            value={householdName}
            onChangeText={setHouseholdName}
          />
          <View style={styles.statusChip}>
            <View
              style={[
                styles.statusDot,
                {
                  backgroundColor: irChecking
                    ? colors.text.muted
                    : hasIR
                      ? colors.accent.green
                      : colors.accent.amber,
                },
              ]}
            />
            <Text style={styles.statusText}>
              {irChecking
                ? 'Vérification du port IR…'
                : hasIR
                  ? 'Port infrarouge détecté'
                  : 'Pas de port IR — TV Wi‑Fi recommandée'}
            </Text>
          </View>
          <TouchableOpacity style={styles.btn} onPress={() => setStep(1)}>
            <Text style={styles.btnText}>Continuer</Text>
          </TouchableOpacity>
        </Card>
      )}

      {step === 1 && (
        <Card style={styles.panel}>
          <Text style={styles.title}>Découverte réseau</Text>
          <Text style={styles.body}>
            Recherche automatique des TV Roku, Sony, LG, Samsung, Philips sur votre LAN.
            Vous pouvez passer cette étape et configurer vos appareils plus tard.
          </Text>
          <Text style={styles.fieldLabel}>Préfixe réseau</Text>
          <TextInput
            style={styles.input}
            value={subnet}
            onChangeText={setSubnet}
            placeholder="192.168.1"
            placeholderTextColor={forms.placeholderColor}
          />
          {scanning ? (
            <>
              <Text style={styles.scanProgress}>{scanProgress}</Text>
              <TouchableOpacity style={[styles.btn, styles.btnStop]} onPress={stopScan}>
                <Text style={styles.btnStopText}>Arrêter le scan</Text>
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity style={styles.btn} onPress={scanNetwork}>
              <Text style={styles.btnText}>Scanner le réseau (15 s)</Text>
            </TouchableOpacity>
          )}

          {scanResults.length > 0 ? (
            <View style={styles.scanList}>
              <Text style={styles.scanListTitle}>
                {scanResults.length} TV trouvée{scanResults.length > 1 ? 's' : ''}
              </Text>
              {scanResults.map((c) => (
                <TouchableOpacity
                  key={c.id}
                  style={styles.scanRow}
                  onPress={() => addScannedTv(c)}
                >
                  <Text style={styles.scanRowName}>📺 {c.name}</Text>
                  <Text style={styles.scanRowMeta}>
                    {c.host}
                    {c.port ? `:${c.port}` : ''}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          ) : null}

          <TouchableOpacity
            style={[styles.btn, styles.btnSkip]}
            onPress={skipNetworkScan}
            disabled={scanning}
          >
            <Text style={styles.btnSkipText}>Passer le scan réseau</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.link} onPress={goToManualIrSetup} disabled={scanning}>
            <Text style={styles.linkText}>Configurer une TV en infrarouge →</Text>
          </TouchableOpacity>
        </Card>
      )}

      {step === 2 && (
        <Card style={styles.panel}>
          <Text style={styles.title}>Marque TV (IR)</Text>
          <Text style={styles.body}>
            Choisissez la marque. Ensuite capturez les signaux IR dans Réglages → Apprentissage IR.
          </Text>
          {IR_BRAND_DATABASE.slice(0, 6).map((b) => (
            <TouchableOpacity
              key={b.id}
              style={[styles.brandRow, brandId === b.id && styles.brandActive]}
              onPress={() => setBrandId(b.id)}
            >
              <Text style={[styles.brandText, brandId === b.id && styles.brandTextActive]}>
                {b.brand}
              </Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity style={styles.btn} onPress={addIrTv}>
            <Text style={styles.btnText}>Ajouter cette TV</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.link} onPress={skipNetworkScan}>
            <Text style={styles.linkText}>Passer et terminer la configuration →</Text>
          </TouchableOpacity>
        </Card>
      )}

      {step === 3 && (
        <Card glow style={styles.panel}>
          <Text style={styles.titleEmoji}>✓</Text>
          <Text style={styles.title}>C’est prêt</Text>
          <Text style={styles.body}>
            Votre télécommande universelle est configurée. Ajoutez d’autres appareils dans
            l’onglet Appareils.
          </Text>
          <TouchableOpacity style={styles.btn} onPress={finish}>
            <Text style={styles.btnText}>Utiliser la télécommande</Text>
          </TouchableOpacity>
        </Card>
      )}
      </FadeIn>
    </Screen>
  );
};

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
  },
  hero: {
    fontSize: typography.size.display,
    fontWeight: typography.weight.bold,
    color: colors.text.primary,
    letterSpacing: typography.letterSpacing.tight,
  },
  heroSub: {
    fontSize: typography.size.sm,
    color: colors.text.muted,
    marginBottom: spacing.xl,
  },
  stepRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xl,
  },
  stepItem: { alignItems: 'center', flex: 1 },
  stepDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.border.default,
    marginBottom: spacing.xs,
  },
  stepDotActive: { backgroundColor: colors.accent.primary },
  stepDotCurrent: {
    width: 10,
    height: 10,
    borderRadius: 5,
    ...shadows.glow,
  },
  stepLabel: {
    fontSize: typography.size.xs,
    color: colors.text.muted,
    textAlign: 'center',
    lineHeight: 14,
  },
  stepLabelActive: {
    color: colors.text.primary,
    fontWeight: typography.weight.medium,
  },
  panel: { flex: 1 },
  title: {
    fontSize: typography.size.xl,
    color: colors.text.primary,
    fontWeight: typography.weight.bold,
    marginBottom: spacing.sm,
  },
  titleEmoji: {
    fontSize: 40,
    color: colors.accent.green,
    marginBottom: spacing.sm,
  },
  body: {
    color: colors.text.secondary,
    lineHeight: 22,
    marginBottom: spacing.lg,
    fontSize: typography.size.sm,
  },
  fieldLabel: {
    fontSize: typography.size.sm,
    color: colors.text.secondary,
    fontWeight: typography.weight.semibold,
    letterSpacing: typography.letterSpacing.caps,
    marginBottom: spacing.xs,
    textTransform: 'uppercase',
  },
  input: {
    ...forms.input,
    marginBottom: spacing.md,
  },
  statusChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bg.elevated,
    padding: spacing.md,
    borderRadius: radius.md,
    marginBottom: spacing.lg,
    gap: spacing.sm,
  },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  statusText: { flex: 1, color: colors.text.secondary, fontSize: typography.size.sm },
  btn: {
    ...forms.btnPrimary,
    marginTop: spacing.sm,
    ...shadows.md,
  },
  btnText: forms.btnPrimaryText,
  btnStop: {
    backgroundColor: colors.bg.elevated,
    borderWidth: 1.5,
    borderColor: colors.border.active,
  },
  btnStopText: {
    ...forms.btnPrimaryText,
    color: colors.accent.primary,
  },
  btnSkip: {
    backgroundColor: colors.bg.elevated,
    borderWidth: 1.5,
    borderColor: colors.border.default,
    marginTop: spacing.md,
  },
  btnSkipText: {
    ...forms.btnPrimaryText,
    color: colors.text.secondary,
  },
  scanProgress: {
    textAlign: 'center',
    marginBottom: spacing.sm,
    fontSize: typography.size.sm,
    color: colors.accent.primary,
  },
  link: { marginTop: spacing.lg, alignItems: 'center' },
  linkText: { color: colors.accent.primary, fontSize: typography.size.sm },
  scanList: {
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  scanListTitle: {
    fontSize: typography.size.md,
    fontWeight: typography.weight.semibold,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  scanRow: {
    padding: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: colors.bg.elevated,
    borderWidth: 1.5,
    borderColor: colors.border.default,
    marginBottom: spacing.sm,
  },
  scanRowName: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.semibold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  scanRowMeta: {
    fontSize: typography.size.md,
    color: colors.text.secondary,
  },
  brandRow: {
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderColor: colors.border.default,
    marginBottom: spacing.sm,
    backgroundColor: colors.bg.input,
    minHeight: 52,
    justifyContent: 'center',
  },
  brandActive: {
    borderColor: colors.border.active,
    backgroundColor: colors.accent.primaryMuted,
  },
  brandText: {
    color: colors.text.secondary,
    fontSize: typography.size.lg,
    lineHeight: 24,
  },
  brandTextActive: {
    color: colors.text.primary,
    fontWeight: typography.weight.semibold,
  },
});
