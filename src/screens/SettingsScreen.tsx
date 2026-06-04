import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  Switch,
  Platform,
  Share,
  TouchableOpacity,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';
import { getIrReadiness } from '../services/IRService';
import { isValidProntoCode } from '../services/ir/irValidation';
import { useRemoteStore } from '../store/remoteStore';
import { exportConfig, importConfig } from '../services/config/ConfigExportService';
import { PermissionsInfo } from '../components/PermissionsInfo';
import { HardwareIrPanel } from '../components/HardwareIrPanel';
import { IrCodeRegistration } from '../components/IrCodeRegistration';
import { Screen } from '../components/Screen';
import { AppHeader } from '../components/ui/AppHeader';
import { SectionBlock } from '../components/ui/SectionBlock';
import { ScreenScroll } from '../components/ui/ScreenScroll';
import { ScreenEnter } from '../components/ui/ScreenEnter';
import { Card } from '../components/ui/Card';
import { TextField } from '../components/ui/TextField';
import { FormButton } from '../components/ui/FormButton';
import { colors, spacing, typography, motion, forms } from '../theme';

const S = motion.stagger;

const hapticOptions = {
  enableVibrateFallback: true,
  ignoreAndroidSystemSettings: false,
};

function formatLogTime(ts: Date | string): string {
  const d = typeof ts === 'string' ? new Date(ts) : ts;
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export const SettingsScreen: React.FC = () => {
  const [hasIR, setHasIR] = useState(false);
  const {
    preferences,
    setHaptics,
    setConfirmPower,
    setOnboardingComplete,
    setDefaultSubnet,
    setHouseholdName,
    devices,
    scenes,
    rooms,
    favorites,
    learnedIr,
    pairings,
    householdName,
    addLearnedIr,
    activeDeviceId,
    setActiveDevice,
    updateDevice,
    importBackup,
    commandLog,
    clearLog,
  } = useRemoteStore();

  const [importJson, setImportJson] = useState('');
  const [householdInput, setHouseholdInput] = useState(householdName);
  const [subnetInput, setSubnetInput] = useState(preferences.defaultSubnet);

  const haptics = preferences.haptics;
  const confirmPower = preferences.confirmPower;

  const activeDevice = devices.find((d) => d.id === activeDeviceId);
  const irCodeCount = activeDevice
    ? Object.keys(activeDevice.irCodes).length
    : 0;

  const refreshIr = useCallback(() => {
    getIrReadiness().then((r) => setHasIR(r.ready));
  }, []);

  useFocusEffect(
    useCallback(() => {
      refreshIr();
      setHouseholdInput(householdName);
      setSubnetInput(preferences.defaultSubnet);
    }, [refreshIr, householdName, preferences.defaultSubnet]),
  );

  const saveIrCode = (command: string, prontoCode: string) => {
    if (!activeDeviceId) return;
    const trimmed = prontoCode.trim();
    if (!trimmed) return;
    if (!isValidProntoCode(trimmed)) {
      Alert.alert(
        'Code invalide',
        'Format Pronto attendu : groupes hex à 4 caractères (ex. 0000 006D 0022 0002 …).',
      );
      return;
    }
    addLearnedIr({
      deviceId: activeDeviceId,
      command,
      prontoCode: trimmed,
      learnedAt: Date.now(),
    });
    const target = devices.find((d) => d.id === activeDeviceId);
    if (target) {
      updateDevice(activeDeviceId, {
        irCodes: { ...target.irCodes, [command]: trimmed },
      });
    }
  };

  const onHapticsChange = (enabled: boolean) => {
    setHaptics(enabled);
    if (enabled) {
      try {
        ReactNativeHapticFeedback.trigger('impactLight', hapticOptions);
      } catch {
        /* ignore */
      }
    }
  };

  const saveGeneral = () => {
    const name = householdInput.trim() || 'Ma maison';
    const subnet = subnetInput.trim() || '192.168.1';
    setHouseholdName(name);
    setDefaultSubnet(subnet);
    Alert.alert('Enregistré', 'Nom du foyer et préfixe réseau mis à jour.');
  };

  const handleExport = async () => {
    const json = exportConfig({
      householdName,
      rooms,
      devices,
      scenes,
      favorites,
      learnedIr,
      pairings,
      preferences: {
        defaultSubnet: preferences.defaultSubnet,
        haptics: preferences.haptics,
        confirmPower: preferences.confirmPower,
      },
    });
    try {
      await Share.share({
        message: json,
        title: 'Sauvegarde télécommande',
      });
    } catch {
      Alert.alert(
        'Export',
        `Configuration prête (${json.length} caractères). Copiez depuis la console de développement si le partage a échoué.`,
      );
      console.log('[Backup export]', json);
    }
  };

  const handleImport = () => {
    const data = importConfig(importJson);
    if (!data) {
      Alert.alert(
        'Import invalide',
        'Le JSON n’est pas reconnu. Vérifiez qu’il contient "version": 1 et un tableau "devices".',
      );
      return;
    }
    Alert.alert(
      'Confirmer l’import',
      `Remplacer la config actuelle par ${data.devices.length} appareil(s) et ${data.scenes.length} scène(s) ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Importer',
          onPress: () => {
            importBackup(data);
            setImportJson('');
            setHouseholdInput(data.householdName);
            if (data.preferences?.defaultSubnet) {
              setSubnetInput(data.preferences.defaultSubnet);
            }
            Alert.alert('Import réussi', 'Configuration restaurée.');
          },
        },
      ],
    );
  };

  const resetWizard = () => {
    Alert.alert(
      'Relancer l’assistant',
      'L’assistant de première configuration s’affichera au prochain redémarrage complet de l’app.',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Confirmer',
          onPress: () => {
            setOnboardingComplete(false);
            Alert.alert(
              'OK',
              'Fermez complètement l’application puis rouvrez-la pour voir l’assistant.',
            );
          },
        },
      ],
    );
  };

  return (
    <Screen>
      <ScreenEnter>
        <AppHeader title="Réglages" subtitle="Préférences & matériel" />

        <ScreenScroll contentStyle={styles.content}>
          <SectionBlock title="Général" delay={S} first>
            <Card>
              <Text style={styles.fieldLabel}>Nom du foyer</Text>
              <TextField
                value={householdInput}
                onChangeText={setHouseholdInput}
                placeholder="Ma maison, Salon…"
              />
              <Text style={styles.fieldLabel}>Préfixe réseau (scan Wi‑Fi)</Text>
              <TextField
                value={subnetInput}
                onChangeText={setSubnetInput}
                placeholder="192.168.1"
                autoCapitalize="none"
              />
              <FormButton
                label="Enregistrer"
                variant="primary"
                onPress={saveGeneral}
                style={styles.cardBtn}
              />

              <Text style={[styles.fieldLabel, styles.fieldLabelSpaced]}>
                Appareil actif (codes IR)
              </Text>
              {devices.length === 0 ? (
                <Text style={styles.meta}>
                  Aucun appareil — ajoutez-en dans l’onglet Appareils.
                </Text>
              ) : (
                <View style={styles.deviceChips}>
                  {devices.map((d) => {
                    const active = d.id === activeDeviceId;
                    return (
                      <TouchableOpacity
                        key={d.id}
                        style={[forms.chip, active && forms.chipActive]}
                        onPress={() => setActiveDevice(d.id)}
                      >
                        <Text
                          style={[
                            forms.chipText,
                            active && forms.chipTextActive,
                          ]}
                        >
                          {d.icon} {d.name}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}
            </Card>
          </SectionBlock>

          <SectionBlock title="Permissions" delay={S * 2}>
            <Card>
              <PermissionsInfo />
            </Card>
          </SectionBlock>

          <SectionBlock title="Matériel IR" delay={S * 3}>
            <HardwareIrPanel
              activeDeviceName={activeDevice?.name}
              irCodeCount={irCodeCount}
            />
          </SectionBlock>

          <SectionBlock title="Codes IR" delay={S * 4}>
            <IrCodeRegistration
              hasEmitter={hasIR}
              activeDeviceId={activeDeviceId || null}
              activeDeviceName={activeDevice?.name}
              onSave={saveIrCode}
            />
          </SectionBlock>

          <SectionBlock title="Préférences télécommande" delay={S * 5}>
            <Card>
              <SettingRow
                label="Vibration haptique"
                hint="Retour à chaque touche"
                value={haptics}
                onChange={onHapticsChange}
              />
              <View style={styles.separator} />
              <SettingRow
                label="Confirmation avant power"
                hint="Demande avant d’éteindre / allumer"
                value={confirmPower}
                onChange={setConfirmPower}
              />
            </Card>
          </SectionBlock>

          <SectionBlock title="Journal des commandes" delay={S * 6}>
            <Card>
              {commandLog.length === 0 ? (
                <Text style={styles.meta}>
                  Aucune commande envoyée. Utilisez la télécommande pour remplir ce
                  journal.
                </Text>
              ) : (
                commandLog.slice(0, 12).map((entry) => {
                  const dev = devices.find((d) => d.id === entry.deviceId);
                  return (
                    <View key={entry.id} style={styles.logRow}>
                      <Text
                        style={[
                          styles.logIcon,
                          {
                            color: entry.success
                              ? colors.accent.green
                              : colors.accent.red,
                          },
                        ]}
                      >
                        {entry.success ? '✓' : '✕'}
                      </Text>
                      <View style={styles.logBody}>
                        <Text style={styles.logMain}>
                          {dev?.name ?? 'Appareil'} · {entry.command}
                        </Text>
                        <Text style={styles.logTime}>
                          {formatLogTime(entry.timestamp)}
                        </Text>
                      </View>
                    </View>
                  );
                })
              )}
              {commandLog.length > 0 ? (
                <FormButton
                  label="Effacer le journal"
                  variant="ghost"
                  onPress={() => {
                    Alert.alert('Effacer le journal', 'Supprimer tout l’historique ?', [
                      { text: 'Annuler', style: 'cancel' },
                      {
                        text: 'Effacer',
                        style: 'destructive',
                        onPress: clearLog,
                      },
                    ]);
                  }}
                  style={styles.cardBtnTop}
                />
              ) : null}
            </Card>
          </SectionBlock>

          <SectionBlock title="Sauvegarde" delay={S * 7}>
            <Card>
              <Text style={styles.cardDesc}>
                Exporte appareils, scènes, favoris, codes IR appris et réglages.
              </Text>
              <FormButton
                label="Exporter / partager"
                variant="outline"
                onPress={handleExport}
              />
              <Text style={[styles.fieldLabel, styles.fieldLabelSpaced]}>
                Importer un JSON
              </Text>
              <TextField
                multiline
                value={importJson}
                onChangeText={setImportJson}
                placeholder='{"version":1,"devices":[...]}'
                style={styles.importArea}
              />
              <View style={styles.backupActions}>
                <FormButton
                  label="Importer la configuration"
                  variant="primary"
                  onPress={handleImport}
                  disabled={!importJson.trim()}
                />
                <FormButton
                  label="Relancer l’assistant"
                  variant="ghost"
                  onPress={resetWizard}
                />
              </View>
            </Card>
          </SectionBlock>

          <SectionBlock title="À propos" delay={S * 8}>
            <Card>
              <InfoRow label="Version" value="1.0.0" />
              <View style={styles.separator} />
              <InfoRow label="Framework" value="React Native 0.85" />
              <View style={styles.separator} />
              <InfoRow label="Wi‑Fi" value="Roku, Sony, LG, Samsung, Philips" />
              <View style={styles.separator} />
              <InfoRow label="Bluetooth" value="Appairés + scan BLE" />
              <View style={styles.separator} />
              <InfoRow label="IR" value="Pronto + émetteur natif" />
              <View style={styles.separator} />
              <InfoRow
                label="Plateforme"
                value={Platform.OS === 'android' ? 'Android' : 'iOS'}
              />
            </Card>
          </SectionBlock>
        </ScreenScroll>
      </ScreenEnter>
    </Screen>
  );
};

const SettingRow = ({
  label,
  hint,
  value,
  onChange,
}: {
  label: string;
  hint?: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) => (
  <View style={styles.settingRow}>
    <View style={styles.settingText}>
      <Text style={styles.settingLabel}>{label}</Text>
      {hint ? <Text style={styles.settingHint}>{hint}</Text> : null}
    </View>
    <Switch
      value={value}
      onValueChange={onChange}
      trackColor={{
        false: colors.bg.elevated,
        true: `${colors.accent.primary}88`,
      }}
      thumbColor={value ? colors.accent.primary : colors.text.muted}
    />
  </View>
);

const InfoRow = ({ label, value }: { label: string; value: string }) => (
  <View style={styles.infoRow}>
    <Text style={styles.settingLabel}>{label}</Text>
    <Text style={styles.infoValue}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  content: {},
  fieldLabel: {
    fontSize: typography.size.xs,
    color: colors.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: typography.letterSpacing.caps,
    marginBottom: spacing.xs,
    fontWeight: typography.weight.semibold,
  },
  fieldLabelSpaced: {
    marginTop: spacing.md,
  },
  cardDesc: {
    fontSize: typography.size.sm,
    color: colors.text.secondary,
    lineHeight: 20,
    marginBottom: spacing.md,
  },
  cardBtn: {
    marginTop: spacing.md,
  },
  cardBtnTop: {
    marginTop: spacing.md,
  },
  meta: {
    fontSize: typography.size.sm,
    color: colors.text.secondary,
    lineHeight: 20,
  },
  deviceChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  separator: {
    height: 1,
    backgroundColor: colors.border.default,
    marginVertical: spacing.sm,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
  },
  settingText: {
    flex: 1,
    paddingRight: spacing.md,
  },
  settingLabel: {
    fontSize: typography.size.md,
    color: colors.text.primary,
    fontWeight: typography.weight.medium,
  },
  settingHint: {
    fontSize: typography.size.xs,
    color: colors.text.muted,
    marginTop: 2,
  },
  infoRow: {
    paddingVertical: spacing.xs,
  },
  infoValue: {
    fontSize: typography.size.sm,
    color: colors.text.secondary,
    marginTop: 2,
  },
  logRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.subtle,
  },
  logIcon: {
    fontSize: typography.size.md,
    width: 24,
    fontWeight: typography.weight.bold,
  },
  logBody: { flex: 1 },
  logMain: {
    fontSize: typography.size.sm,
    color: colors.text.primary,
    fontWeight: typography.weight.medium,
  },
  logTime: {
    fontSize: typography.size.xs,
    color: colors.text.muted,
    marginTop: 2,
  },
  backupActions: {
    marginTop: spacing.sm,
    gap: spacing.sm,
  },
  importArea: {
    minHeight: 100,
    fontSize: typography.size.sm,
    fontFamily: 'monospace',
  },
});
