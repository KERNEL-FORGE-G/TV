import React from 'react';
import { View, StyleSheet } from 'react-native';
import { RemoteButton } from './RemoteButton';
import { isCommandSupported } from '../services/DeviceControlService';
import type { Device } from '../data/devices';
import { colors, radius, spacing } from '../theme';

interface MediaControlsProps {
  device: Device;
  onCommand: (cmd: string) => void;
}

const MEDIA_BUTTONS = [
  { cmd: 'rewind', label: '⏪' },
  { cmd: 'play', label: '▶' },
  { cmd: 'pause', label: '⏸' },
  { cmd: 'stop', label: '■' },
  { cmd: 'fast_forward', label: '⏩' },
];

export const MediaControls: React.FC<MediaControlsProps> = ({
  device,
  onCommand,
}) => {
  const visible = MEDIA_BUTTONS.filter((b) => isCommandSupported(device, b.cmd));
  if (visible.length === 0) return null;

  return (
    <View style={styles.wrap}>
      <View style={styles.row}>
        {visible.map((b, i) => (
          <View
            key={b.cmd}
            style={[styles.cell, i < visible.length - 1 && styles.gap]}
          >
            <RemoteButton
              label={b.label}
              onPress={() => onCommand(b.cmd)}
              variant="ghost"
              style={styles.btn}
              textStyle={styles.btnText}
            />
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    width: '100%',
  },
  row: {
    flexDirection: 'row',
    backgroundColor: colors.bg.elevated,
    borderRadius: radius.xl,
    padding: spacing.sm,
    borderWidth: 1.5,
    borderColor: colors.border.default,
  },
  cell: { flex: 1, minHeight: 44 },
  gap: { marginRight: spacing.xs },
  btn: { flex: 1, minHeight: 44 },
  btnText: { fontSize: 18 },
});
