import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { colors, radius, spacing, typography, shadows, forms } from '../theme';

interface TvKeyboardModalProps {
  visible: boolean;
  deviceName: string;
  onClose: () => void;
  onSend: (text: string) => Promise<boolean>;
}

export const TvKeyboardModal: React.FC<TvKeyboardModalProps> = ({
  visible,
  deviceName,
  onClose,
  onSend,
}) => {
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);

  const submit = async () => {
    if (!text.trim()) return;
    setSending(true);
    const ok = await onSend(text.trim());
    setSending(false);
    if (ok) {
      setText('');
      onClose();
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <Text style={styles.title}>Clavier TV</Text>
          <Text style={styles.sub}>Envoi vers {deviceName} (Roku ECP)</Text>
          <TextInput
            style={styles.input}
            value={text}
            onChangeText={setText}
            placeholder="Recherche, URL, texte…"
            placeholderTextColor={forms.placeholderColor}
            autoCapitalize="none"
            autoCorrect={false}
          />
          <View style={styles.row}>
            <TouchableOpacity style={styles.ghost} onPress={onClose}>
              <Text style={styles.ghostText}>Annuler</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.primary, sending && styles.disabled]}
              onPress={submit}
              disabled={sending}
            >
              {sending ? (
                <ActivityIndicator color={colors.text.primary} />
              ) : (
                <Text style={styles.primaryText}>Envoyer</Text>
              )}
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
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: colors.border.glass,
    ...shadows.lg,
  },
  title: {
    fontSize: typography.size.xl,
    fontWeight: typography.weight.bold,
    color: colors.text.primary,
  },
  sub: {
    fontSize: typography.size.sm,
    color: colors.text.muted,
    marginBottom: spacing.md,
  },
  input: {
    ...forms.input,
    marginBottom: spacing.md,
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  ghost: {
    ...forms.btnGhost,
    flex: 1,
  },
  ghostText: forms.btnGhostText,
  primary: {
    ...forms.btnPrimary,
    flex: 1,
  },
  primaryText: forms.btnPrimaryText,
  disabled: { opacity: 0.6 },
});
