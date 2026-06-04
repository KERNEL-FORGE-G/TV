import React from 'react';
import { View, StyleSheet } from 'react-native';
import { RemoteButton } from './RemoteButton';
import { colors, radius, typography } from '../theme';

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

export const NumPad: React.FC<NumPadProps> = ({ onCommand }) => {
  return (
    <View style={styles.grid}>
      {BUTTONS.map((row, ri) => (
        <View key={ri} style={styles.row}>
          {row.map((btn, bi) => {
            const isSpecial = btn === 'back' || btn === 'menu';
            return (
              <RemoteButton
                key={btn}
                label={SPECIAL_LABELS[btn] ?? btn}
                onPress={() => onCommand(isSpecial ? btn : `num_${btn}`)}
                variant="default"
                style={[styles.btn, bi < row.length - 1 && styles.btnSpacing]}
                textStyle={[
                  styles.btnText,
                  isSpecial && { color: colors.accent.blue, fontSize: typography.size.md },
                ]}
              />
            );
          })}
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  grid: {
    marginTop: 6,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  btn: {
    flex: 1,
    height: 40,
    borderRadius: radius.md,
  },
  btnSpacing: {
    marginRight: 6,
  },
  btnText: {
    fontSize: typography.size.md,
    color: '#cccccc',
    fontWeight: '400',
  },
});
