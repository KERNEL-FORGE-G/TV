import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Card } from './ui/Card';
import { Badge } from './ui/Badge';
import {
  getIrHardwareStatus,
  formatCarrierRanges,
  type IrHardwareStatus,
} from '../services/IRService';
import { colors, spacing, radius, typography } from '../theme';

interface HardwareIrPanelProps {
  activeDeviceName?: string;
  irCodeCount?: number;
}

export const HardwareIrPanel: React.FC<HardwareIrPanelProps> = ({
  activeDeviceName,
  irCodeCount = 0,
}) => {
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<IrHardwareStatus | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      setStatus(await getIrHardwareStatus());
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh]),
  );

  const label = (() => {
    if (loading) return 'Analyse du matériel…';
    if (!status) return 'État inconnu';
    if (status.platform === 'ios') {
      return 'iPhone — pas d’émetteur IR';
    }
    if (!status.moduleLinked) {
      return 'Module IR non chargé';
    }
    if (status.hasEmitter) {
      return 'Émetteur IR disponible';
    }
    return 'Pas d’émetteur IR sur cet appareil';
  })();

  const tone = (() => {
    if (loading) return 'muted' as const;
    if (!status?.moduleLinked || status.platform === 'ios') return 'warning' as const;
    if (status.hasEmitter) return 'success' as const;
    return 'warning' as const;
  })();

  const dotColor =
    tone === 'success'
      ? colors.accent.green
      : tone === 'warning'
        ? colors.accent.amber
        : colors.text.muted;

  const freqText =
    status?.hasEmitter && status.carrierRanges.length > 0
      ? formatCarrierRanges(status.carrierRanges)
      : null;

  return (
    <Card style={styles.card}>
      <View style={styles.headerRow}>
        <View style={[styles.iconWrap, { borderColor: dotColor }]}>
          <Text style={styles.icon}>📡</Text>
        </View>
        <View style={styles.headerText}>
          <Text style={styles.title}>Matériel infrarouge</Text>
          <View style={styles.statusRow}>
            {loading ? (
              <ActivityIndicator size="small" color={colors.accent.primary} />
            ) : (
              <View style={[styles.dot, { backgroundColor: dotColor }]} />
            )}
            <Text style={[styles.statusLabel, { color: dotColor }]}>{label}</Text>
          </View>
        </View>
        <TouchableOpacity
          onPress={refresh}
          disabled={loading}
          style={styles.refreshBtn}
          accessibilityLabel="Actualiser le matériel IR"
        >
          <Text style={styles.refreshIcon}>↻</Text>
        </TouchableOpacity>
      </View>

      {!loading && status && (
        <View style={styles.details}>
          <View style={styles.detailRow}>
            <Text style={styles.detailKey}>Plateforme</Text>
            <Text style={styles.detailVal}>
              {Platform.OS === 'android' ? 'Android' : 'iOS'}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailKey}>Module natif</Text>
            <Badge
              label={status.moduleLinked ? 'Connecté' : 'Absent'}
              tone={status.moduleLinked ? 'success' : 'warning'}
            />
          </View>
          {freqText ? (
            <View style={styles.freqBlock}>
              <Text style={styles.detailKey}>Fréquences porteuses</Text>
              <Text style={styles.freqValue}>{freqText}</Text>
            </View>
          ) : null}
          {activeDeviceName ? (
            <View style={styles.detailRow}>
              <Text style={styles.detailKey}>Appareil actif</Text>
              <Text style={styles.detailVal} numberOfLines={1}>
                {activeDeviceName}
                {irCodeCount > 0 ? ` · ${irCodeCount} code(s) IR` : ''}
              </Text>
            </View>
          ) : null}
          {!status.moduleLinked && Platform.OS === 'android' ? (
            <Text style={styles.hint}>
              Recompilez avec npm run android après npm install. Le correctif Gradle
              est appliqué automatiquement au postinstall.
            </Text>
          ) : null}
          {status.moduleLinked && !status.hasEmitter && Platform.OS === 'android' ? (
            <Text style={styles.hint}>
              Téléphones souvent compatibles : Xiaomi, Redmi, Poco, certains Huawei /
              Honor, Samsung S4/S5, LG G2–G4. Sinon utilisez une TV Smart en Wi‑Fi.
            </Text>
          ) : null}
          {Platform.OS === 'ios' ? (
            <Text style={styles.hint}>
              L’iPhone n’intègre pas de LED IR. Contrôlez vos TV via le réseau local
              (Roku, Sony, LG, Samsung, Philips).
            </Text>
          ) : null}
        </View>
      )}
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: 0,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: radius.lg,
    borderWidth: 1,
    backgroundColor: colors.bg.elevated,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  icon: { fontSize: 22 },
  headerText: { flex: 1, minWidth: 0 },
  title: {
    fontSize: typography.size.md,
    fontWeight: typography.weight.semibold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: radius.full,
  },
  statusLabel: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.medium,
    flexShrink: 1,
  },
  refreshBtn: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    backgroundColor: colors.bg.elevated,
    borderWidth: 1,
    borderColor: colors.border.default,
    alignItems: 'center',
    justifyContent: 'center',
  },
  refreshIcon: {
    fontSize: 18,
    color: colors.accent.primary,
  },
  details: {
    borderTopWidth: 1,
    borderTopColor: colors.border.subtle,
    paddingTop: spacing.md,
    gap: spacing.sm,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  detailKey: {
    fontSize: typography.size.xs,
    color: colors.text.muted,
    textTransform: 'uppercase',
    letterSpacing: typography.letterSpacing.caps,
    flexShrink: 0,
  },
  detailVal: {
    fontSize: typography.size.sm,
    color: colors.text.secondary,
    flex: 1,
    textAlign: 'right',
  },
  freqBlock: {
    marginTop: spacing.xs,
  },
  freqValue: {
    fontSize: typography.size.sm,
    color: colors.text.primary,
    marginTop: 4,
    lineHeight: 20,
  },
  hint: {
    fontSize: typography.size.xs,
    color: colors.text.secondary,
    lineHeight: 18,
    marginTop: spacing.sm,
  },
});
