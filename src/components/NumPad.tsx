import React from 'react';
import { View, StyleSheet } from 'react-native';
import { RemoteButton } from './RemoteButton';
import { colors, radius, spacing, typography } from '../theme';

interface NumPadProps {
  onCommand: (cmd: string) => void;
}

const BUTTONS = [
  ['1', '2', '3'],
  ['4', '5', '6'],
  ['7', '8', '9'],
  ['back', '0', 'menu'],
];

const SPECIAL_LABELS: Record<string, string> = {
  back: '←',
  menu: '≡',
};

const COL_GAP = spacing.sm;
const ROW_GAP = spacing.sm;

export const NumPad: React.FC<NumPadProps> = ({ onCommand }) => (
  <View style={styles.wrap}>
    {BUTTONS.map((row, ri) => (
      <View
        key={ri}
        style={[styles.row, ri < BUTTONS.length - 1 && { marginBottom: ROW_GAP }]}
      >
        {row.map((btn, bi) => {
          const isSpecial = btn === 'back' || btn === 'menu';
          return (
            <View
              key={btn}
              style={[styles.cell, bi < row.length - 1 && { marginRight: COL_GAP }]}
            >
              <RemoteButton
                label={SPECIAL_LABELS[btn] ?? btn}
                onPress={() => onCommand(isSpecial ? btn : `num_${btn}`)}
                variant={isSpecial ? 'ghost' : 'default'}
                style={styles.btn}
                textStyle={[styles.btnText, isSpecial && styles.specialText]}
              />
            </View>
          );
        })}
      </View>
    ))}
  </View>
);

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: colors.bg.card,
    borderRadius: radius.xl,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  cell: {
    flex: 1,
    minHeight: 48,
  },
  btn: {
    flex: 1,
    height: 48,
    minWidth: undefined,
    borderRadius: radius.md,
  },
  btnText: {
    fontSize: typography.size.lg,
    color: colors.text.primary,
    fontWeight: typography.weight.medium,
  },
  specialText: {
    color: colors.accent.primary,
    fontSize: typography.size.md,
  },
});
