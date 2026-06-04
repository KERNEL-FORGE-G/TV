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
import { Device } from '../data/devices';
import { attemptSamsungPairing, attemptLgPairing } from '../services/pairing/PairingService';
import { useRemoteStore } from '../store/remoteStore';
import { colors, spacing, radius, typography, shadows, forms } from '../theme';

interface PairingModalProps {
  visible: boolean;
  device: Device | null;
  onClose: () => void;
}

export const PairingModal: React.FC<PairingModalProps> = ({
  visible,
  device,
  onClose,
}) => {
  const { setPairing, updateDevice } = useRemoteStore();
  const [lgKey, setLgKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  if (!device) return null;

  const runPairing = async () => {
    setLoading(true);
    setMessage('');
    const host = device.connection?.host;
    if (!host) {
      setMessage('IP manquante');
      setLoading(false);
      return;
    }

    let result;
    if (device.tvPlatform === 'samsung_tizen') {
      result = await attemptSamsungPairing(host, device.connection?.port);
    } else if (device.tvPlatform === 'lg_webos') {
      result = await attemptLgPairing(host, lgKey, device.connection?.port);
    } else {
      setMessage('Appairage non requis pour cet appareil');
      setLoading(false);
      return;
    }

    setPairing(device.id, {
      deviceId: device.id,
      platformId: device.tvPlatform!,
      status: result.success ? 'paired' : 'failed',
      token: result.record.token,
      lgClientKey: result.record.lgClientKey,
      error: result.record.error,
      lastAttempt: Date.now(),
    });

    if (result.success) {
      updateDevice(device.id, {
        connection: {
          ...device.connection,
          samsungToken: result.record.token,
          lgClientKey: result.record.lgClientKey,
        },
        isOnline: true,
      });
    }
    setMessage(result.message);
    setLoading(false);
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.box}>
          <Text style={styles.badge}>Appairage</Text>
          <Text style={styles.title}>{device.name}</Text>
          <Text style={styles.sub}>
            {device.tvPlatform === 'samsung_tizen'
              ? 'Acceptez la demande affichée sur votre TV Samsung.'
              : 'Entrez la clé client LG affichée sur la TV.'}
          </Text>
          {device.tvPlatform === 'lg_webos' && (
            <TextInput
              style={styles.input}
              placeholder="Clé client LG"
              placeholderTextColor={forms.placeholderColor}
              value={lgKey}
              onChangeText={setLgKey}
            />
          )}
          {message ? (
            <View style={styles.msgWrap}>
              <Text style={styles.msg}>{message}</Text>
            </View>
          ) : null}
          <View style={styles.actions}>
            <TouchableOpacity onPress={onClose} style={styles.ghost}>
              <Text style={styles.ghostText}>Fermer</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={runPairing} style={styles.primary} disabled={loading}>
              {loading ? (
                <ActivityIndicator color={colors.text.primary} />
              ) : (
                <Text style={styles.primaryText}>Appairer</Text>
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
    justifyContent: 'center',
    padding: spacing.lg,
  },
  box: {
    backgroundColor: colors.bg.card,
    borderRadius: radius.xl,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: colors.border.active,
    ...shadows.lg,
  },
  badge: {
    fontSize: typography.size.xs,
    color: colors.accent.primary,
    letterSpacing: typography.letterSpacing.caps,
    textTransform: 'uppercase',
    marginBottom: spacing.xs,
  },
  title: {
    fontSize: typography.size.xl,
    color: colors.text.primary,
    fontWeight: typography.weight.bold,
    marginBottom: spacing.sm,
  },
  sub: {
    fontSize: typography.size.sm,
    color: colors.text.secondary,
    lineHeight: 20,
    marginBottom: spacing.md,
  },
  input: {
    ...forms.input,
    marginBottom: spacing.sm,
  },
  msgWrap: {
    backgroundColor: 'rgba(255, 176, 32, 0.15)',
    borderRadius: radius.md,
    padding: spacing.sm,
    marginBottom: spacing.md,
  },
  msg: { fontSize: typography.size.sm, color: colors.accent.amber },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', gap: spacing.sm, marginTop: spacing.sm },
  ghost: forms.btnGhost,
  ghostText: forms.btnGhostText,
  primary: {
    ...forms.btnPrimary,
    paddingHorizontal: spacing.xl,
    minWidth: 120,
    alignItems: 'center',
    ...shadows.md,
  },
  primaryText: forms.btnPrimaryText,
});
