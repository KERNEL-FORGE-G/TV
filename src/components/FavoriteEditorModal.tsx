import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useRemoteStore } from '../store/remoteStore';
import { colors, radius, spacing, typography, shadows, forms } from '../theme';

interface FavoriteEditorModalProps {
  visible: boolean;
  deviceId: string;
  deviceName: string;
  onClose: () => void;
}

const PRESETS = [
  { label: 'Netflix', command: 'netflix', icon: 'N' },
  { label: 'YouTube', command: 'youtube', icon: '▶' },
  { label: 'Volume +', command: 'vol_up', icon: '+' },
  { label: 'Source', command: 'source', icon: '⎆' },
];

export const FavoriteEditorModal: React.FC<FavoriteEditorModalProps> = ({
  visible,
  deviceId,
  deviceName,
  onClose,
}) => {
  const { addFavorite } = useRemoteStore();
  const [label, setLabel] = useState('');
  const [command, setCommand] = useState('netflix');
  const [icon, setIcon] = useState('★');

  const save = () => {
    if (!label.trim()) return;
    addFavorite({
      id: `fav-${Date.now()}`,
      deviceId,
      label: label.trim(),
      command,
      icon,
    });
    onClose();
    setLabel('');
  };

  return (
    <Modal visible={visible} animationType="fade" transparent>
      <View style={styles.overlay}>
        <View style={styles.box}>
          <Text style={styles.title}>Favori — {deviceName}</Text>
          <Text style={styles.sub}>Raccourci chaîne ou app sur la télécommande</Text>
          {PRESETS.map((p) => (
            <TouchableOpacity
              key={p.command}
              style={[styles.preset, command === p.command && styles.presetActive]}
              onPress={() => {
                setCommand(p.command);
                setLabel(p.label);
                setIcon(p.icon);
              }}
            >
              <Text style={styles.presetText}>{p.icon} {p.label}</Text>
            </TouchableOpacity>
          ))}
          <TextInput
            style={styles.input}
            placeholder="Libellé"
            placeholderTextColor={forms.placeholderColor}
            value={label}
            onChangeText={setLabel}
          />
          <View style={styles.row}>
            <TouchableOpacity onPress={onClose} style={styles.ghost}>
              <Text style={styles.ghostText}>Annuler</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.primary} onPress={save}>
              <Text style={styles.primaryText}>Ajouter</Text>
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
    justifyContent: 'center',
    padding: spacing.lg,
  },
  box: {
    backgroundColor: colors.bg.card,
    borderRadius: radius.xl,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border.active,
    ...shadows.lg,
  },
  title: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.bold,
    color: colors.text.primary,
  },
  sub: {
    fontSize: typography.size.sm,
    color: colors.text.muted,
    marginBottom: spacing.md,
  },
  preset: {
    padding: spacing.sm,
    borderRadius: radius.md,
    marginBottom: spacing.xs,
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  presetActive: {
    backgroundColor: colors.accent.primaryMuted,
    borderColor: colors.border.active,
  },
  presetText: { color: colors.text.primary },
  input: {
    ...forms.input,
    marginVertical: spacing.sm,
  },
  row: { flexDirection: 'row', marginTop: spacing.sm, gap: spacing.sm },
  ghost: { ...forms.btnGhost, flex: 1 },
  ghostText: forms.btnGhostText,
  primary: { ...forms.btnPrimary, flex: 1 },
  primaryText: forms.btnPrimaryText,
});
