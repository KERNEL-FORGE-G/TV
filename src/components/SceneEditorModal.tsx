import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { useRemoteStore } from '../store/remoteStore';
import { Scene } from '../data/devices';
import { SCENE_TEMPLATES, buildSceneFromTemplate } from '../data/sceneTemplates';
import { colors, radius, spacing, typography, shadows, forms } from '../theme';

interface SceneEditorModalProps {
  visible: boolean;
  onClose: () => void;
}

const COMMANDS = ['power', 'home', 'netflix', 'youtube', 'vol_up', 'mute', 'source'];

export const SceneEditorModal: React.FC<SceneEditorModalProps> = ({
  visible,
  onClose,
}) => {
  const { devices, addScene } = useRemoteStore();
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('✦');
  const [deviceId, setDeviceId] = useState(devices[0]?.id ?? '');
  const [command, setCommand] = useState('power');
  const [delayMs, setDelayMs] = useState('0');

  const saveCustom = () => {
    if (!name.trim() || !deviceId) return;
    const scene: Scene = {
      id: `scene-${Date.now()}`,
      name: name.trim(),
      icon: icon || '✦',
      description: 'Macro personnalisée',
      actions: [
        {
          deviceId,
          command,
          delayMs: parseInt(delayMs, 10) || 0,
        },
      ],
    };
    addScene(scene);
    onClose();
    reset();
  };

  const applyTemplate = (templateId: string) => {
    const tpl = SCENE_TEMPLATES.find((t) => t.id === templateId);
    if (!tpl) return;
    const scene = buildSceneFromTemplate(
      tpl,
      devices.filter((d) => d.type === 'tv').map((d) => d.id),
    );
    if (scene) {
      addScene(scene);
      onClose();
      reset();
    }
  };

  const reset = () => {
    setName('');
    setIcon('✦');
    setDelayMs('0');
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <Text style={styles.title}>Nouvelle scène</Text>
          <ScrollView>
            <Text style={styles.label}>Modèles (macros)</Text>
            {SCENE_TEMPLATES.map((t) => (
              <TouchableOpacity
                key={t.id}
                style={styles.templateRow}
                onPress={() => applyTemplate(t.id)}
                disabled={devices.length === 0}
              >
                <Text style={styles.templateIcon}>{t.icon}</Text>
                <View style={styles.flex}>
                  <Text style={styles.templateName}>{t.name}</Text>
                  <Text style={styles.templateDesc}>{t.description}</Text>
                </View>
              </TouchableOpacity>
            ))}

            <Text style={[styles.label, styles.marginTop]}>Macro personnalisée</Text>
            <TextInput
              style={styles.input}
              placeholder="Nom de la scène"
              placeholderTextColor={forms.placeholderColor}
              value={name}
              onChangeText={setName}
            />
            <TextInput
              style={styles.input}
              placeholder="Icône (emoji)"
              placeholderTextColor={forms.placeholderColor}
              value={icon}
              onChangeText={setIcon}
            />
            <Text style={styles.fieldLabel}>Appareil</Text>
            {devices.map((d) => (
              <TouchableOpacity
                key={d.id}
                style={[styles.chip, deviceId === d.id && styles.chipActive]}
                onPress={() => setDeviceId(d.id)}
              >
                <Text style={styles.chipText}>{d.name}</Text>
              </TouchableOpacity>
            ))}
            <Text style={styles.fieldLabel}>Commande</Text>
            <View style={styles.cmdRow}>
              {COMMANDS.map((c) => (
                <TouchableOpacity
                  key={c}
                  style={[styles.cmdChip, command === c && styles.chipActive]}
                  onPress={() => setCommand(c)}
                >
                  <Text style={styles.chipText}>{c}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TextInput
              style={styles.input}
              placeholder="Délai avant (ms)"
              placeholderTextColor={forms.placeholderColor}
              value={delayMs}
              onChangeText={setDelayMs}
              keyboardType="numeric"
            />
          </ScrollView>
          <View style={styles.footer}>
            <TouchableOpacity onPress={onClose} style={styles.ghost}>
              <Text style={styles.ghostText}>Fermer</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.primary} onPress={saveCustom}>
              <Text style={styles.primaryText}>Enregistrer</Text>
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
    maxHeight: '88%',
    padding: spacing.lg,
    ...shadows.lg,
  },
  title: {
    fontSize: typography.size.xl,
    fontWeight: typography.weight.bold,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  label: {
    fontSize: typography.size.xs,
    color: colors.text.muted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: spacing.sm,
  },
  marginTop: { marginTop: spacing.lg },
  templateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.bg.card,
    borderRadius: radius.lg,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  templateIcon: { fontSize: 22, marginRight: spacing.md },
  flex: { flex: 1 },
  templateName: { color: colors.text.primary, fontWeight: typography.weight.medium },
  templateDesc: { fontSize: typography.size.xs, color: colors.text.muted },
  input: {
    ...forms.input,
    marginBottom: spacing.sm,
  },
  fieldLabel: {
    fontSize: typography.size.xs,
    color: colors.text.muted,
    marginBottom: spacing.xs,
    marginTop: spacing.sm,
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border.default,
    marginBottom: spacing.xs,
    alignSelf: 'flex-start',
  },
  chipActive: {
    borderColor: colors.border.active,
    backgroundColor: colors.accent.primaryMuted,
  },
  chipText: { color: colors.text.primary, fontSize: typography.size.sm },
  cmdRow: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: spacing.sm },
  cmdChip: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border.default,
    marginRight: spacing.xs,
    marginBottom: spacing.xs,
  },
  footer: { flexDirection: 'row', marginTop: spacing.md },
  ghost: { ...forms.btnGhost, flex: 1 },
  ghostText: forms.btnGhostText,
  primary: { ...forms.btnPrimary, flex: 1 },
  primaryText: forms.btnPrimaryText,
});
