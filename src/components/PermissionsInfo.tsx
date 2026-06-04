import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, Platform, Linking } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import {
  PERMISSION_FEATURES,
  getAndroidPermissionStatus,
  ensurePermissionsForScope,
  ensureStartupPermissions,
  type PermissionScope,
} from '../utils/permissions';
import { FormButton } from './ui/FormButton';
import { colors, spacing, typography } from '../theme';

type StatusKey = 'granted' | 'denied' | 'not_required';

const STATUS_COLOR: Record<StatusKey, string> = {
  granted: colors.accent.green,
  denied: colors.accent.red,
  not_required: colors.text.muted,
};

function statusLabel(scope: PermissionScope, status: StatusKey): string {
  if (scope === 'ir') {
    if (status === 'granted') return 'IR prêt (émetteur OK)';
    if (status === 'not_required') return 'Pas d’émetteur sur ce modèle';
    return 'Module IR non chargé';
  }
  const labels: Record<StatusKey, string> = {
    granted: 'Autorisé',
    denied: 'Refusé',
    not_required: 'Automatique',
  };
  return labels[status];
}

export const PermissionsInfo: React.FC = () => {
  const [status, setStatus] = useState<Record<PermissionScope, StatusKey>>({
    network: 'not_required',
    ir: 'not_required',
    haptics: 'not_required',
    bluetooth: 'not_required',
  });

  const refresh = useCallback(async () => {
    if (Platform.OS === 'android') {
      const s = await getAndroidPermissionStatus();
      setStatus(s);
    } else {
      setStatus({
        network: 'not_required',
        ir: 'not_required',
        haptics: 'not_required',
        bluetooth: 'not_required',
      });
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh]),
  );

  const requestScope = async (scope: PermissionScope) => {
    if (scope === 'network' || scope === 'bluetooth') {
      await ensurePermissionsForScope(scope);
    } else if (scope === 'ir') {
      await ensurePermissionsForScope('ir');
    }
    refresh();
  };

  const requestAll = async () => {
    await ensureStartupPermissions();
    await ensurePermissionsForScope('ir');
    refresh();
  };

  return (
    <View>
      {PERMISSION_FEATURES.map((feat) => {
        const st = status[feat.scope];
        const canRequest =
          st === 'denied' || (feat.scope === 'ir' && st === 'not_required');

        return (
          <View key={feat.scope} style={styles.row}>
            <View style={styles.flex}>
              <Text style={styles.title}>{feat.title}</Text>
              <Text style={styles.desc}>{feat.description}</Text>
              <Text style={styles.perms}>
                {Platform.OS === 'android'
                  ? feat.androidPermissions.join(' · ')
                  : feat.iosNote}
              </Text>
            </View>
            <View style={styles.right}>
              <View style={[styles.dot, { backgroundColor: STATUS_COLOR[st] }]} />
              <Text style={[styles.statusText, { color: STATUS_COLOR[st] }]}>
                {statusLabel(feat.scope, st)}
              </Text>
              {canRequest ? (
                <FormButton
                  label={feat.scope === 'ir' ? 'Vérifier IR' : 'Autoriser'}
                  variant="outline"
                  onPress={() => requestScope(feat.scope)}
                  style={styles.miniBtn}
                />
              ) : null}
            </View>
          </View>
        );
      })}

      <View style={styles.footer}>
        <FormButton
          label="Tout autoriser"
          variant="primary"
          onPress={requestAll}
        />
        <FormButton label="Actualiser" variant="ghost" onPress={refresh} />
        <Text
          style={styles.settingsLink}
          onPress={() => Linking.openSettings()}
        >
          Ouvrir les réglages système
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.default,
  },
  flex: { flex: 1, paddingRight: spacing.sm, minWidth: 0 },
  right: { alignItems: 'flex-end', minWidth: 108 },
  title: {
    fontSize: typography.size.md,
    fontWeight: typography.weight.semibold,
    color: colors.text.primary,
  },
  desc: {
    fontSize: typography.size.sm,
    color: colors.text.secondary,
    marginTop: 4,
    lineHeight: 18,
  },
  perms: {
    fontSize: typography.size.xs,
    color: colors.text.muted,
    marginTop: 6,
    lineHeight: 16,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginBottom: 6,
  },
  statusText: {
    fontSize: typography.size.xs,
    fontWeight: typography.weight.semibold,
    textAlign: 'right',
    marginBottom: spacing.xs,
  },
  miniBtn: {
    minHeight: 36,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
  footer: {
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  settingsLink: {
    textAlign: 'center',
    fontSize: typography.size.sm,
    color: colors.accent.primary,
    marginTop: spacing.xs,
    paddingVertical: spacing.sm,
  },
});
