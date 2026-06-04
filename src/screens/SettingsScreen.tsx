import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  Switch,
  Platform,
} from 'react-native';
import { learnIRCode, hasIREmitter, getCarrierFrequencies } from '../services/IRService';
import { useRemoteStore } from '../store/remoteStore';
import { colors, spacing, radius, typography } from '../theme';

export const SettingsScreen: React.FC = () => {
  const [hasIR, setHasIR] = useState<boolean | null>(null);
  const [frequencies, setFrequencies] = useState<number[]>([]);
  const [isLearning, setIsLearning] = useState(false);
  const [learnedCode, setLearnedCode] = useState<number[] | null>(null);
  const { preferences, setHaptics, setConfirmPower } = useRemoteStore();
  const haptics = preferences.haptics;
  const confirmPower = preferences.confirmPower;

  useEffect(() => {
    // Vérification du matériel IR au montage
    hasIREmitter().then(setHasIR);
    getCarrierFrequencies().then(setFrequencies);
  }, []);

  const startLearning = async () => {
    if (!hasIR) {
      Alert.alert(
        'Port IR indisponible',
        'Votre téléphone n\'a pas de port IR intégré.\n\nAlternative : utilisez un hub Broadlink RM Mini 3 (~20€) pour l\'apprentissage IR.'
      );
      return;
    }
    setIsLearning(true);
    setLearnedCode(null);
    Alert.alert(
      'Mode apprentissage',
      'Pointez votre télécommande physique vers le téléphone et appuyez sur un bouton dans les 10 secondes.'
    );
    const code = await learnIRCode(10000);
    setIsLearning(false);
    if (code) {
      setLearnedCode(code);
      Alert.alert('✓ Code capturé', `Signal reçu — ${code.length} impulsions.`);
    } else {
      Alert.alert('Timeout', 'Aucun signal reçu. Réessayez en visant bien.');
    }
  };

  const irStatus = () => {
    if (Platform.OS !== 'android') return { label: 'iOS — simulation active', color: colors.accent.amber };
    if (hasIR === null) return { label: 'Vérification...', color: colors.text.muted };
    if (hasIR) return { label: 'Port IR natif détecté ✓', color: colors.accent.green };
    return { label: 'Pas de port IR — simulation active', color: colors.accent.amber };
  };

  const status = irStatus();

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Réglages</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>

        {/* Statut matériel IR */}
        <Text style={styles.sectionLabel}>MATÉRIEL IR</Text>
        <View style={styles.card}>
          <View style={styles.statusRow}>
            <View style={[styles.dot, { backgroundColor: status.color }]} />
            <Text style={[styles.statusText, { color: status.color }]}>{status.label}</Text>
          </View>

          {hasIR && frequencies.length > 0 && (
            <Text style={styles.meta}>
              Fréquences supportées : {frequencies.map(f => `${(f / 1000).toFixed(0)}kHz`).join(', ')}
            </Text>
          )}

          {!hasIR && Platform.OS === 'android' && hasIR !== null && (
            <Text style={styles.meta}>
              Appareils avec IR intégré : Xiaomi, Redmi, Poco, anciens Huawei/Honor, Samsung S4/S5, LG G2-G4.
              {'\n\n'}En mode simulation, les commandes sont loggées mais pas envoyées physiquement.
            </Text>
          )}
        </View>

        {/* Apprentissage IR */}
        <Text style={styles.sectionLabel}>APPRENTISSAGE IR</Text>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Capturer un code IR</Text>
          <Text style={styles.cardSubtitle}>
            Pointer la télécommande physique vers le téléphone pour enregistrer son signal.
          </Text>
          <TouchableOpacity
            style={[styles.btn, styles.btnSecondary, (isLearning || !hasIR) && styles.btnDisabled]}
            onPress={startLearning}
            disabled={isLearning}
          >
            <Text style={styles.btnTextSecondary}>
              {isLearning ? '⏳ En écoute (10s)...' : '📡 Démarrer l\'apprentissage'}
            </Text>
          </TouchableOpacity>

          {learnedCode && (
            <View>
              <Text style={styles.meta}>Code capturé ({learnedCode.length} impulsions) :</Text>
              <Text style={styles.codePreview} numberOfLines={2}>
                [{learnedCode.slice(0, 8).join(', ')}...]
              </Text>
            </View>
          )}
        </View>

        {/* Préférences */}
        <Text style={styles.sectionLabel}>PRÉFÉRENCES</Text>
        <View style={styles.card}>
          <SettingRow label="Vibration haptique" value={haptics} onChange={setHaptics} />
          <View style={styles.separator} />
          <SettingRow label="Confirmation avant power" value={confirmPower} onChange={setConfirmPower} />
        </View>

        {/* À propos */}
        <Text style={styles.sectionLabel}>À PROPOS</Text>
        <View style={styles.card}>
          <InfoRow label="Version" value="1.0.0" />
          <View style={styles.separator} />
          <InfoRow label="Framework" value="React Native 0.75 (CLI)" />
          <View style={styles.separator} />
          <InfoRow label="Module IR" value="react-native-ir-manager" />
          <View style={styles.separator} />
          <InfoRow label="Base de codes" value="Pronto Hex / LIRC" />
          <View style={styles.separator} />
          <InfoRow label="Plateforme" value={Platform.OS === 'android' ? 'Android' : 'iOS'} />
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const SettingRow = ({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) => (
  <View style={styles.settingRow}>
    <Text style={styles.settingLabel}>{label}</Text>
    <Switch
      value={value}
      onValueChange={onChange}
      trackColor={{ false: colors.bg.elevated, true: `${colors.accent.blue}55` }}
      thumbColor={value ? colors.accent.blue : colors.text.muted}
    />
  </View>
);

const InfoRow = ({ label, value }: { label: string; value: string }) => (
  <View style={styles.settingRow}>
    <Text style={styles.settingLabel}>{label}</Text>
    <Text style={styles.infoValue}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg.primary },
  header: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 0.5,
    borderBottomColor: colors.border.default,
  },
  headerTitle: {
    fontSize: typography.size.lg,
    color: colors.text.primary,
    fontWeight: typography.weight.semibold,
  },
  content: { padding: spacing.lg, paddingBottom: spacing.sm },
  sectionLabel: {
    fontSize: typography.size.xs,
    color: colors.text.muted,
    letterSpacing: 1,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  card: {
    backgroundColor: colors.bg.card,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 0.5,
    borderColor: colors.border.default,
    marginBottom: spacing.sm,
  },
  cardTitle: {
    fontSize: typography.size.md,
    color: colors.text.primary,
    fontWeight: typography.weight.semibold,
  },
  cardSubtitle: { fontSize: typography.size.xs, color: colors.text.secondary },
  btn: {
    backgroundColor: colors.accent.blue,
    borderRadius: radius.md,
    padding: spacing.md,
    alignItems: 'center',
  },
  btnSecondary: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.accent.blue,
  },
  btnDisabled: { opacity: 0.4 },
  btnTextSecondary: {
    color: colors.accent.blue,
    fontSize: typography.size.sm,
    fontWeight: typography.weight.semibold,
  },
  statusRow: { flexDirection: 'row', alignItems: 'center' },
  dot: { width: 8, height: 8, borderRadius: radius.full },
  statusText: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.medium,
    marginLeft: spacing.sm,
  },
  meta: { fontSize: typography.size.xs, color: colors.text.secondary, lineHeight: 18 },
  codePreview: {
    fontFamily: 'Courier',
    fontSize: 11,
    color: colors.text.muted,
    backgroundColor: colors.bg.input,
    padding: spacing.sm,
    borderRadius: radius.sm,
  },
  separator: { height: 0.5, backgroundColor: colors.border.default },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  settingLabel: { fontSize: typography.size.md, color: colors.text.primary },
  infoValue: { fontSize: typography.size.sm, color: colors.text.secondary },
});
