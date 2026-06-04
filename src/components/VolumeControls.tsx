import React from 'react';
import { View, Text, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { RemoteButton } from './RemoteButton';
import { colors, radius, shadows, spacing, typography } from '../theme';

interface VolumeControlsProps {
  onCommand: (cmd: string) => void;
  showChannels?: boolean;
}

export const VolumeControls: React.FC<VolumeControlsProps> = ({
  onCommand,
  showChannels = true,
}) => (
  <View style={styles.row}>
    <ControlGroup
      label="Volume"
      onMinus={() => onCommand('vol_down')}
      onPlus={() => onCommand('vol_up')}
      style={styles.sideGroup}
    />
    <View style={styles.muteCol}>
      <Text style={styles.muteLabel}>Muet</Text>
      <RemoteButton
        label="🔇"
        onPress={() => onCommand('mute')}
        variant="ghost"
        shape="round"
        style={styles.muteBtn}
        textStyle={styles.muteIcon}
      />
    </View>
    {showChannels ? (
      <ControlGroup
        label="Chaîne"
        onMinus={() => onCommand('ch_down')}
        onPlus={() => onCommand('ch_up')}
        style={styles.sideGroup}
      />
    ) : null}
  </View>
);

interface ControlGroupProps {
  label: string;
  onMinus: () => void;
  onPlus: () => void;
  style?: StyleProp<ViewStyle>;
}

const ControlGroup: React.FC<ControlGroupProps> = ({
  label,
  onMinus,
  onPlus,
  style,
}) => (
  <View style={[styles.group, style]}>
    <Text style={styles.groupLabel}>{label}</Text>
    <View style={styles.btnRow}>
      <View style={styles.btnCell}>
        <RemoteButton
          label="−"
          onPress={onMinus}
          variant="default"
          style={styles.btn}
          textStyle={styles.btnText}
        />
      </View>
      <View style={[styles.btnCell, styles.btnCellGap]}>
        <RemoteButton
          label="+"
          onPress={onPlus}
          variant="default"
          style={styles.btn}
          textStyle={styles.btnText}
        />
      </View>
    </View>
  </View>
);

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    width: '100%',
  },
  sideGroup: {
    flex: 1,
  },
  group: {
    backgroundColor: colors.bg.card,
    borderRadius: radius.xl,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border.default,
    ...shadows.sm,
  },
  groupLabel: {
    fontSize: typography.size.xs,
    color: colors.text.muted,
    textAlign: 'center',
    marginBottom: spacing.sm,
    fontWeight: typography.weight.semibold,
    letterSpacing: typography.letterSpacing.wide,
    textTransform: 'uppercase',
  },
  btnRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  btnCell: {
    flex: 1,
    minHeight: 44,
  },
  btnCellGap: {
    marginLeft: spacing.sm,
  },
  btn: {
    flex: 1,
    height: 44,
    minWidth: undefined,
    borderRadius: radius.md,
  },
  btnText: {
    fontSize: 22,
    color: colors.text.primary,
    fontWeight: typography.weight.medium,
  },
  muteCol: {
    width: 56,
    alignItems: 'center',
    marginHorizontal: spacing.sm,
    paddingBottom: spacing.xs,
  },
  muteLabel: {
    fontSize: typography.size.xs,
    color: colors.text.muted,
    marginBottom: spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: typography.letterSpacing.wide,
  },
  muteBtn: {
    width: 52,
    height: 52,
    minWidth: 52,
    minHeight: 52,
  },
  muteIcon: {
    fontSize: 22,
  },
});
