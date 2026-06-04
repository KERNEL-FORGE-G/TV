import React from 'react';
import { View, StyleSheet } from 'react-native';
import { RemoteButton } from './RemoteButton';
import { colors, radius, spacing, typography } from '../theme';

interface NavPadProps {
  onCommand: (cmd: string) => void;
  size?: number;
}

const ICONS = { up: '▲', down: '▼', left: '◀', right: '▶' };
const GAP = 10;

export const NavPad: React.FC<NavPadProps> = ({ onCommand, size = 56 }) => {
  const btn = size;
  const ok = Math.round(size * 1.08);
  const gridWidth = btn * 3 + GAP * 2;

  const cell = (child: React.ReactNode, key: string) => (
    <View key={key} style={[styles.cell, { width: btn, height: btn }]}>
      {child}
    </View>
  );

  const empty = (key: string) => <View key={key} style={{ width: btn, height: btn }} />;

  return (
    <View style={styles.ring}>
      <View style={[styles.grid, { width: gridWidth }]}>
        <View style={styles.row}>
          {empty('e1')}
          {cell(
            <RemoteButton
              label={ICONS.up}
              onPress={() => onCommand('up')}
              variant="nav"
              style={styles.fillBtn}
              textStyle={styles.arrow}
            />,
            'up',
          )}
          {empty('e2')}
        </View>

        <View style={[styles.row, styles.rowGap, { width: gridWidth }]}>
          <View style={styles.sideSlot}>
            <RemoteButton
              label={ICONS.left}
              onPress={() => onCommand('left')}
              variant="nav"
              style={{ width: btn, height: btn, minWidth: btn, minHeight: btn }}
              textStyle={styles.arrow}
            />
          </View>
          <RemoteButton
            label="OK"
            onPress={() => onCommand('ok')}
            variant="accent"
            shape="round"
            size="lg"
            style={{ width: ok, height: ok, minWidth: ok, minHeight: ok }}
            textStyle={styles.okText}
          />
          <View style={styles.sideSlot}>
            <RemoteButton
              label={ICONS.right}
              onPress={() => onCommand('right')}
              variant="nav"
              style={{ width: btn, height: btn, minWidth: btn, minHeight: btn }}
              textStyle={styles.arrow}
            />
          </View>
        </View>

        <View style={[styles.row, styles.rowGap]}>
          {empty('e3')}
          {cell(
            <RemoteButton
              label={ICONS.down}
              onPress={() => onCommand('down')}
              variant="nav"
              style={styles.fillBtn}
              textStyle={styles.arrow}
            />,
            'down',
          )}
          {empty('e4')}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  ring: {
    padding: spacing.lg,
    borderRadius: radius.xxl,
    backgroundColor: colors.bg.card,
    borderWidth: 1,
    borderColor: colors.border.default,
    alignSelf: 'center',
  },
  grid: {
    alignSelf: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rowGap: {
    marginTop: GAP,
  },
  cell: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  sideSlot: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fillBtn: {
    width: '100%',
    height: '100%',
    minWidth: undefined,
    minHeight: undefined,
  },
  arrow: {
    fontSize: 16,
    color: colors.text.secondary,
  },
  okText: {
    fontSize: 14,
    fontWeight: typography.weight.bold,
    letterSpacing: 1.5,
    color: colors.accent.primary,
  },
});
