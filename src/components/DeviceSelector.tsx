import React from 'react';
import { ScrollView, TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { Device } from '../data/devices';
import { colors, radius, shadows, spacing, typography } from '../theme';

interface DeviceSelectorProps {
  devices: Device[];
  activeDeviceId: string;
  onSelect: (id: string) => void;
}

const DEVICE_ICONS: Record<string, string> = {
  tv: '📺',
  decoder: '📡',
  ac: '❄️',
  soundbar: '🔊',
  projector: '📽',
  dvd: '💿',
};

export const DeviceSelector: React.FC<DeviceSelectorProps> = ({
  devices,
  activeDeviceId,
  onSelect,
}) => (
  <ScrollView
    horizontal
    showsHorizontalScrollIndicator={false}
    contentContainerStyle={styles.container}
  >
    {devices.map((device) => {
      const isActive = device.id === activeDeviceId;
      return (
        <TouchableOpacity
          key={device.id}
          onPress={() => onSelect(device.id)}
          style={[styles.pill, isActive && styles.pillActive]}
          activeOpacity={0.8}
        >
          <View style={[styles.iconWrap, isActive && styles.iconWrapActive]}>
            <Text style={styles.icon}>{DEVICE_ICONS[device.type] ?? '🔧'}</Text>
          </View>
          <Text style={[styles.label, isActive && styles.labelActive]} numberOfLines={1}>
            {device.name}
          </Text>
          <View
            style={[
              styles.dot,
              { backgroundColor: device.isOnline ? colors.accent.green : colors.text.muted },
            ]}
          />
        </TouchableOpacity>
      );
    })}
  </ScrollView>
);

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 14,
    paddingLeft: 6,
    paddingVertical: 6,
    marginRight: spacing.sm,
    backgroundColor: colors.bg.card,
    borderRadius: radius.full,
    borderWidth: 1.5,
    borderColor: colors.border.default,
    maxWidth: 200,
  },
  pillActive: {
    backgroundColor: colors.accent.primaryMuted,
    borderColor: colors.border.active,
    ...shadows.glow,
  },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: radius.full,
    backgroundColor: colors.bg.elevated,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  iconWrapActive: {
    backgroundColor: 'rgba(91, 141, 239, 0.25)',
  },
  icon: { fontSize: 16 },
  label: {
    fontSize: typography.size.sm,
    color: colors.text.secondary,
    fontWeight: typography.weight.medium,
    flexShrink: 1,
  },
  labelActive: {
    color: colors.text.primary,
    fontWeight: typography.weight.semibold,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: radius.full,
    marginLeft: 8,
  },
});
