import React from 'react';
import { View, Text, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { RemoteButton } from './RemoteButton';
import { colors, radius, spacing, typography } from '../theme';

interface VolumeControlsProps {
  onCommand: (cmd: string) => void;
  showChannels?: boolean;
}

export const VolumeControls: React.FC<VolumeControlsProps> = ({
  onCommand,
  showChannels = true,
}) => {
  return (
    <View style={styles.row}>
      <ControlGroup
        label="VOL"
        onMinus={() => onCommand('vol_down')}
        onPlus={() => onCommand('vol_up')}
        icon="🔊"
        style={styles.groupSpacing}
      />

      {/* Mute */}
      <RemoteButton
        label="🔇"
        onPress={() => onCommand('mute')}
        variant="ghost"
        style={[styles.muteBtn, styles.groupSpacing]}
        textStyle={{ fontSize: 20 }}
      />

      {showChannels && (
        <ControlGroup
          label="CH"
          onMinus={() => onCommand('ch_down')}
          onPlus={() => onCommand('ch_up')}
          icon="📡"
        />
      )}
    </View>
  );
};

interface ControlGroupProps {
  label: string;
  icon: string;
  onMinus: () => void;
  onPlus: () => void;
  style?: StyleProp<ViewStyle>;
}

const ControlGroup: React.FC<ControlGroupProps> = ({ label, icon, onMinus, onPlus, style }) => (
  <View style={[styles.group, style]}>
    <Text style={styles.groupLabel}>
      {icon} {label}
    </Text>
    <View style={styles.btnRow}>
      <RemoteButton
        label="−"
        onPress={onMinus}
        variant="default"
        style={styles.btn}
        textStyle={styles.btnText}
      />
      <RemoteButton
        label="+"
        onPress={onPlus}
        variant="default"
        style={styles.btn}
        textStyle={styles.btnText}
      />
    </View>
  </View>
);

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  group: {
    flex: 1,
    backgroundColor: colors.bg.card,
    borderRadius: radius.lg,
    padding: spacing.sm,
    borderWidth: 0.5,
    borderColor: colors.border.default,
  },
  groupSpacing: {
    marginRight: spacing.sm,
  },
  groupLabel: {
    fontSize: typography.size.xs,
    color: colors.text.muted,
    textAlign: 'center',
    marginBottom: 6,
    letterSpacing: 0.8,
  },
  btnRow: {
    flexDirection: 'row',
  },
  btn: {
    flex: 1,
    height: 36,
    borderRadius: radius.sm,
  },
  btnText: {
    fontSize: 18,
    color: colors.text.primary,
  },
  muteBtn: {
    width: 44,
    height: 44,
  },
});
