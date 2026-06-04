import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { useRemoteStore } from '../store/remoteStore';
import { AddTvModal } from '../components/AddTvModal';
import { PairingModal } from '../components/PairingModal';
import {
  scanDiscoveryCandidates,
  adoptCandidate,
} from '../services/discovery/DiscoveryManager';
import { isBleNativeLinked, BLE_REBUILD_HINT } from '../services/ble/bleManagerBridge';
import type { DiscoveryMode } from '../core/remoteTypes';
import { createDeviceFromPlatform } from '../data/tvPlatforms';
import { checkAllDevices } from '../services/health/DeviceHealthService';
import { routeLabel, resolveTransportRoute } from '../services/routing/CommandRouter';
import { needsPairing } from '../services/pairing/PairingService';
import { colors, spacing, radius, typography, forms } from '../theme';
import { TextField } from '../components/ui/TextField';
import { guessLocalSubnet, resolveLocalSubnetPrefix } from '../utils/network';
import {
  ensureNetworkPermissions,
  ensureBluetoothPermissions,
} from '../utils/permissions';
import { Screen } from '../components/Screen';
import { AppHeader } from '../components/ui/AppHeader';
import { SectionBlock } from '../components/ui/SectionBlock';
import { ScreenScroll } from '../components/ui/ScreenScroll';
import { ScreenEnter } from '../components/ui/ScreenEnter';
import { FadeIn } from '../components/ui/FadeIn';
import { ProximitySolarScan } from '../components/discovery/ProximitySolarScan';
import { motion } from '../theme';
import type { Device } from '../data/devices';

export const DevicesScreen: React.FC = () => {
  const {
    devices,
    addDevice,
    removeDevice,
    updateDevice,
    setActiveDevice,
    discoveryCandidates,
    setDiscoveryCandidates,
    updateCandidate,
    rooms,
    householdName,
    preferences,
  } = useRemoteStore();

  const [modalOpen, setModalOpen] = useState(false);
  const [pairDevice, setPairDevice] = useState<Device | null>(null);
  const [scanning, setScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState('');
  const scanAbortRef = useRef<AbortController | null>(null);
  const scanMountedRef = useRef(true);

  useEffect(() => {
    scanMountedRef.current = true;
    return () => {
      scanMountedRef.current = false;
    };
  }, []);
  const [subnet, setSubnet] = useState(preferences.defaultSubnet || guessLocalSubnet());
  const [healthLoading, setHealthLoading] = useState(false);
  const [discoveryMode, setDiscoveryMode] = useState<DiscoveryMode>('wifi');

  useEffect(() => {
    resolveLocalSubnetPrefix().then((prefix) => {
      setSubnet((current) => {
        if (!current || current === guessLocalSubnet()) return prefix;
        return current;
      });
    });
  }, []);

  /** Résultats de scan visibles dans l’app (pending + déjà ajoutés, pas les ignorés). */
  const scanResults = discoveryCandidates.filter((c) => c.status !== 'dismissed');

  const mergeScanResults = (
    found: typeof discoveryCandidates,
  ): typeof discoveryCandidates => {
    const adoptedIds = new Set(
      discoveryCandidates.filter((c) => c.status === 'adopted').map((c) => c.id),
    );
    return found.map((c) => ({
      ...c,
      status: adoptedIds.has(c.id) ? ('adopted' as const) : ('pending' as const),
    }));
  };

  const stopDiscovery = () => {
    scanAbortRef.current?.abort();
  };

  const runDiscovery = async () => {
    scanAbortRef.current?.abort();
    const controller = new AbortController();
    scanAbortRef.current = controller;
    const { signal } = controller;

    setScanning(true);
    setScanProgress('0s / 45s');
    let aborted = false;

    try {
      const onProgress = (info: { label: string }) => {
        if (scanMountedRef.current && !signal.aborted) {
          setScanProgress(info.label);
        }
      };

      if (discoveryMode === 'wifi') {
        const allowed = await ensureNetworkPermissions();
        if (!allowed) return;

        const found = await scanDiscoveryCandidates(subnet, {
          signal,
          onProgress,
        });
        if (signal.aborted) {
          aborted = true;
        }
        if (scanMountedRef.current) {
          setDiscoveryCandidates(mergeScanResults(found));
        }
        if (!aborted && scanMountedRef.current && found.length === 0) {
          Alert.alert(
            'Aucun appareil',
            `Aucune TV détectée sur ${subnet}.x en 45 s.\n\n• Même Wi‑Fi que la TV\n• Télécommande réseau activée sur la TV\n• Corrigez le préfixe si besoin (ex. 192.168.0)\n\nRelancez le scan ou arrêtez-le plus tôt si besoin.`,
          );
        }
      } else {
        if (!isBleNativeLinked()) {
          Alert.alert('Bluetooth indisponible', BLE_REBUILD_HINT);
          return;
        }

        const allowed = await ensureBluetoothPermissions();
        if (!allowed) return;

        const { scanBluetoothCandidates } = await import(
          '../services/discovery/BluetoothDiscoveryService'
        );
        const found = await scanBluetoothCandidates({ signal, onProgress });
        if (signal.aborted) {
          aborted = true;
        }
        if (scanMountedRef.current) {
          setDiscoveryCandidates(mergeScanResults(found));
        }
        if (!aborted && scanMountedRef.current && found.length === 0) {
          Alert.alert(
            'Aucun appareil Bluetooth',
            'Aucun appareil appairé ou détecté en 45 s.\n\n• Activez le Bluetooth sur ce téléphone\n• Appairez la TV depuis le menu Bluetooth Android\n• Revenez ici et relancez le scan\n\nVous pouvez arrêter le scan à tout moment.',
          );
        }
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

  const adopt = (candidateId: string) => {
    const c = discoveryCandidates.find((x) => x.id === candidateId);
    if (!c) return;
    const partial = adoptCandidate(c, rooms[0]?.id);
    const platformId =
      c.protocol === 'Bluetooth' ? 'bluetooth_generic' : c.platformId;
    const dev = createDeviceFromPlatform(platformId, {
      name: partial.name ?? c.name,
      host: c.host,
      port: c.port,
      mac: c.mac,
    });
    Object.assign(dev, partial);
    addDevice(dev);
    updateCandidate(candidateId, 'adopted');
    setActiveDevice(dev.id);
    if (needsPairing(c.platformId)) {
      setPairDevice(dev);
    }
  };

  const dismiss = (id: string) => updateCandidate(id, 'dismissed');

  const runHealth = async () => {
    setHealthLoading(true);
    const results = await checkAllDevices(devices);
    results.forEach((r) => {
      updateDevice(r.deviceId, { isOnline: r.online });
    });
    setHealthLoading(false);
    Alert.alert(
      'État du réseau',
      results.map((r) => `${devices.find((d) => d.id === r.deviceId)?.name}: ${r.online ? 'OK' : 'Hors ligne'}`).join('\n'),
    );
  };

  const S = motion.stagger;

  return (
    <Screen>
      <ScreenEnter>
        <AppHeader
          title="Appareils"
          subtitle={householdName}
          onAction={() => setModalOpen(true)}
        />

        <ScreenScroll
          contentStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          <SectionBlock
            title="Détection"
            delay={S}
            first
            fullBleed
          >
            <ProximitySolarScan
              candidates={scanResults}
              scanning={scanning}
              scanProgress={scanProgress}
              discoveryMode={discoveryMode}
              onDiscoveryModeChange={setDiscoveryMode}
              subnet={subnet}
              onSubnetChange={setSubnet}
              onScan={runDiscovery}
              onStopScan={stopDiscovery}
              onAdopt={adopt}
              onDismiss={dismiss}
            />
          </SectionBlock>

          <SectionBlock title="Mes appareils" delay={S * 2}>
            <TouchableOpacity
              style={[styles.btn, styles.btnOutline, healthLoading && styles.btnDisabled]}
              onPress={runHealth}
              disabled={healthLoading}
            >
              <Text style={styles.btnOutlineText}>
                {healthLoading ? 'Vérification…' : 'Vérifier la connexion'}
              </Text>
            </TouchableOpacity>

            {devices.map((d, index) => (
              <FadeIn key={d.id} delay={S * 3 + index * 40}>
                <View style={styles.deviceRow}>
                  <TouchableOpacity
                    style={styles.deviceMain}
                    onPress={() => setActiveDevice(d.id)}
                  >
                    <Text style={styles.deviceName}>
                      {d.icon} {d.name}
                    </Text>
                    <Text style={styles.deviceMeta}>
                      {routeLabel(resolveTransportRoute(d))}
                      {d.connection?.host ? ` · ${d.connection.host}` : ''}
                    </Text>
                    {d.protocol === 'IR' && (
                      <Text style={styles.deviceSubMeta}>
                        {Object.keys(d.irCodes).length > 0
                          ? `${Object.keys(d.irCodes).length} code(s) IR enregistré(s)`
                          : 'Aucun code IR — capturez dans Réglages'}
                      </Text>
                    )}
                  </TouchableOpacity>
                  <View style={styles.deviceActions}>
                    {d.protocol === 'WiFi' &&
                      d.tvPlatform &&
                      needsPairing(d.tvPlatform) && (
                        <TouchableOpacity
                          onPress={() => setPairDevice(d)}
                          style={styles.pairBtn}
                        >
                          <Text style={styles.pairText}>Appairer</Text>
                        </TouchableOpacity>
                      )}
                    {d.protocol === 'WiFi' && (
                      <TextField
                        style={styles.ipInput}
                        placeholder="Adresse IP"
                        defaultValue={d.connection?.host}
                        onEndEditing={(e) =>
                          updateDevice(d.id, {
                            connection: {
                              ...d.connection,
                              host: e.nativeEvent.text.trim(),
                            },
                            isOnline: !!e.nativeEvent.text.trim(),
                          })
                        }
                      />
                    )}
                    <TouchableOpacity
                      style={styles.removeBtn}
                      onPress={() =>
                        Alert.alert('Supprimer', `Retirer ${d.name} ?`, [
                          { text: 'Annuler', style: 'cancel' },
                          {
                            text: 'OK',
                            style: 'destructive',
                            onPress: () => removeDevice(d.id),
                          },
                        ])
                      }
                    >
                      <Text style={styles.dismiss}>Supprimer</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </FadeIn>
            ))}

            {devices.length === 0 ? (
              <Text style={styles.hintEmpty}>
                Aucun appareil. Scannez le réseau ou appuyez sur ＋ pour ajouter une TV.
              </Text>
            ) : null}
          </SectionBlock>
        </ScreenScroll>
      </ScreenEnter>

      <AddTvModal visible={modalOpen} onClose={() => setModalOpen(false)} onAdd={addDevice} />
      <PairingModal
        visible={!!pairDevice}
        device={pairDevice}
        onClose={() => setPairDevice(null)}
      />
    </Screen>
  );
};

const styles = StyleSheet.create({
  content: {},
  btn: {
    ...forms.btnPrimary,
  },
  btnOutline: {
    ...forms.btnOutline,
    marginBottom: spacing.sm,
  },
  btnOutlineText: forms.btnOutlineText,
  btnDisabled: { opacity: 0.5 },
  btnText: { color: colors.text.primary, fontWeight: typography.weight.semibold },
  hintEmpty: {
    fontSize: typography.size.md,
    color: colors.text.secondary,
    textAlign: 'center',
    marginTop: spacing.md,
    lineHeight: 20,
  },
  deviceRow: {
    backgroundColor: colors.bg.card,
    padding: spacing.lg,
    borderRadius: radius.lg,
    marginBottom: spacing.md,
    borderWidth: 1.5,
    borderColor: colors.border.default,
  },
  deviceMain: {
    marginBottom: spacing.sm,
  },
  deviceName: {
    fontSize: typography.size.lg,
    lineHeight: 24,
    color: colors.text.primary,
    fontWeight: typography.weight.semibold,
  },
  deviceMeta: {
    fontSize: typography.size.md,
    color: colors.text.secondary,
    marginTop: spacing.xs,
    lineHeight: 22,
  },
  deviceSubMeta: {
    fontSize: typography.size.sm,
    color: colors.text.muted,
    marginTop: spacing.xs,
    lineHeight: 20,
  },
  deviceActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border.subtle,
  },
  ipInput: {
    flex: 1,
    minWidth: 140,
    ...forms.input,
    minHeight: 44,
    fontSize: typography.size.md,
  },
  pairBtn: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.accent.primaryMuted,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border.active,
  },
  pairText: {
    color: colors.text.primary,
    fontSize: typography.size.md,
    fontWeight: typography.weight.semibold,
  },
  removeBtn: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  dismiss: {
    color: colors.accent.red,
    fontSize: typography.size.md,
    fontWeight: typography.weight.medium,
  },
});
