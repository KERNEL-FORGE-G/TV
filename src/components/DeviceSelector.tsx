import React from 'react';
import {
  ScrollView,
  TouchableOpacity,
  Text,
  StyleSheet,
  View,
} from 'react-native';
import { Device } from '../data/devices';
import { colors, radius, spacing, typography } from '../theme';

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
}) => {
  return (
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
            activeOpacity={0.7}
          >
            <Text style={styles.icon}>{DEVICE_ICONS[device.type] ?? '🔧'}</Text>
            <Text style={[styles.label, isActive && styles.labelActive]}>
              {device.name}
            </Text>
            {/* Indicateur de statut en ligne */}
            <View
              style={[
                styles.dot,
                {
                  backgroundColor: device.isOnline
                    ? colors.accent.green
                    : colors.text.muted,
                },
              ]}
            />
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    flexDirection: 'row',
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginRight: spacing.sm,
    backgroundColor: colors.bg.elevated,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  pillActive: {
    backgroundColor: `${colors.accent.blue}22`,
    borderColor: colors.accent.blue,
  },
  icon: {
    fontSize: 14,
    marginRight: 6,
  },
  label: {
    fontSize: typography.size.sm,
    color: colors.text.secondary,
    fontWeight: typography.weight.medium,
  },
  labelActive: {
    color: colors.accent.blue,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: radius.full,
    marginLeft: 2,
  },
});
