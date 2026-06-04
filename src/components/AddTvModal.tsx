import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import {
  TV_PLATFORMS,
  TvPlatformId,
  createDeviceFromPlatform,
} from '../data/tvPlatforms';
import { SectionTitle } from './ui/SectionTitle';
import { ensureIrPermissions } from '../utils/permissions';
import { colors, spacing, radius, typography, shadows, forms } from '../theme';

interface AddTvModalProps {
  visible: boolean;
  onClose: () => void;
  onAdd: (device: ReturnType<typeof createDeviceFromPlatform>) => void;
}

export const AddTvModal: React.FC<AddTvModalProps> = ({
  visible,
  onClose,
  onAdd,
}) => {
  const [platformId, setPlatformId] = useState<TvPlatformId>('roku');
  const [name, setName] = useState('');
  const [host, setHost] = useState('');
  const [mac, setMac] = useState('');
  const [lgKey, setLgKey] = useState('');

  const platform = TV_PLATFORMS.find((p) => p.id === platformId)!;

  const handleAdd = async () => {
    const label = name.trim() || platform.label;
    if (platform.needsHost && !host.trim()) {
      Alert.alert('IP requise', 'Entrez l’adresse IP de la TV sur votre réseau Wi‑Fi.');
      return;
    }
    if (platform.protocol === 'Bluetooth' && !mac.trim()) {
      Alert.alert('MAC optionnelle', 'Sans MAC, les commandes Bluetooth resteront limitées.');
    }
    if (platform.protocol === 'IR') {
      const irOk = await ensureIrPermissions();
      if (!irOk) return;
    }

    onAdd(
      createDeviceFromPlatform(platformId, {
        name: label,
        host: host.trim() || undefined,
        mac: mac.trim() || undefined,
        lgClientKey: lgKey.trim() || undefined,
      }),
    );
    setName('');
    setHost('');
    setMac('');
    setLgKey('');
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <View style={styles.handle} />
          <Text style={styles.title}>Ajouter une TV</Text>
          <Text style={styles.subtitle}>Wi‑Fi, IR ou Bluetooth</Text>

          <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
            <SectionTitle>Plateforme</SectionTitle>
            {TV_PLATFORMS.map((p) => (
              <TouchableOpacity
                key={p.id}
                style={[styles.platformRow, platformId === p.id && styles.platformActive]}
                onPress={() => setPlatformId(p.id)}
              >
                <Text style={styles.platformName}>{p.label}</Text>
                <View style={styles.protoBadge}>
                  <Text style={styles.platformProto}>{p.protocol}</Text>
                </View>
              </TouchableOpacity>
            ))}

            <Text style={styles.hint}>{platform.hint}</Text>

            <SectionTitle>Identité</SectionTitle>
            <TextInput
              style={styles.input}
              placeholder={platform.label}
              placeholderTextColor={forms.placeholderColor}
              value={name}
              onChangeText={setName}
            />

            {platform.needsHost && (
              <>
                <Text style={styles.fieldLabel}>Adresse IP</Text>
                <TextInput
                  style={styles.input}
                  placeholder="192.168.1.20"
                  placeholderTextColor={forms.placeholderColor}
                  keyboardType="numeric"
                  value={host}
                  onChangeText={setHost}
                />
              </>
            )}

            {platform.id === 'lg_webos' && (
              <>
                <Text style={styles.fieldLabel}>Clé LG (optionnel)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Après appairage sur la TV"
                  placeholderTextColor={forms.placeholderColor}
                  value={lgKey}
                  onChangeText={setLgKey}
                />
              </>
            )}

            {platform.protocol === 'Bluetooth' && (
              <>
                <Text style={styles.fieldLabel}>MAC Bluetooth</Text>
                <TextInput
                  style={styles.input}
                  placeholder="AA:BB:CC:DD:EE:FF"
                  placeholderTextColor={forms.placeholderColor}
                  autoCapitalize="characters"
                  value={mac}
                  onChangeText={setMac}
                />
              </>
            )}
          </ScrollView>

          <View style={styles.actions}>
            <TouchableOpacity style={styles.btnGhost} onPress={onClose}>
              <Text style={styles.btnGhostText}>Annuler</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.btnPrimary} onPress={handleAdd}>
              <Text style={styles.btnPrimaryText}>Ajouter</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: colors.bg.overlay,
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.bg.secondary,
    borderTopLeftRadius: radius.xxl,
    borderTopRightRadius: radius.xxl,
    maxHeight: '88%',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
    borderWidth: 1,
    borderBottomWidth: 0,
    borderColor: colors.border.glass,
    ...shadows.lg,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border.glass,
    alignSelf: 'center',
    marginTop: spacing.sm,
    marginBottom: spacing.md,
  },
  title: {
    fontSize: typography.size.xl,
    color: colors.text.primary,
    fontWeight: typography.weight.bold,
  },
  subtitle: {
    fontSize: typography.size.sm,
    color: colors.text.muted,
    marginBottom: spacing.md,
  },
  scroll: { maxHeight: 400 },
  fieldLabel: {
    fontSize: typography.size.xs,
    color: colors.text.muted,
    marginBottom: spacing.xs,
    letterSpacing: typography.letterSpacing.wide,
  },
  platformRow: {
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border.default,
    marginBottom: spacing.xs,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.bg.card,
  },
  platformActive: {
    borderColor: colors.border.active,
    backgroundColor: colors.accent.primaryMuted,
  },
  platformName: {
    color: colors.text.primary,
    fontSize: typography.size.md,
    fontWeight: typography.weight.medium,
  },
  protoBadge: {
    backgroundColor: colors.bg.elevated,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.sm,
  },
  platformProto: { color: colors.text.muted, fontSize: typography.size.xs },
  hint: {
    fontSize: typography.size.xs,
    color: colors.text.secondary,
    marginVertical: spacing.md,
    lineHeight: 18,
    paddingHorizontal: spacing.xs,
  },
  input: {
    ...forms.input,
    marginBottom: spacing.sm,
  },
  actions: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md },
  btnGhost: {
    ...forms.btnGhost,
    flex: 1,
  },
  btnGhostText: forms.btnGhostText,
  btnPrimary: {
    ...forms.btnPrimary,
    flex: 1,
    ...shadows.md,
  },
  btnPrimaryText: forms.btnPrimaryText,
});
