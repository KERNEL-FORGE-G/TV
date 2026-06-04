import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { RemoteButton } from './RemoteButton';
import { colors, radius } from '../theme';

interface NavPadProps {
  onCommand: (cmd: string) => void;
  size?: number;
}

// Icônes Unicode flèches
const ICONS = {
  up: '▲',
  down: '▼',
  left: '◀',
  right: '▶',
};

export const NavPad: React.FC<NavPadProps> = ({ onCommand, size = 52 }) => {
  const btnSize = size;
  const centerSize = size * 0.95;

  return (
    <View style={styles.container}>
      {/* Haut */}
      <View style={styles.row}>
        <View style={{ width: btnSize }} />
        <RemoteButton
          label={ICONS.up}
          onPress={() => onCommand('up')}
          variant="nav"
          style={[styles.navBtn, { width: btnSize, height: btnSize, borderRadius: radius.md }]}
          textStyle={styles.arrow}
        />
        <View style={{ width: btnSize }} />
      </View>

      {/* Milieu : gauche + OK + droite */}
      <View style={[styles.row, styles.rowSpacing]}>
        <RemoteButton
          label={ICONS.left}
          onPress={() => onCommand('left')}
          variant="nav"
          style={[styles.navBtn, { width: btnSize, height: btnSize, borderRadius: radius.md }]}
          textStyle={styles.arrow}
        />

        {/* Bouton OK central */}
        <RemoteButton
          label="OK"
          onPress={() => onCommand('ok')}
          variant="accent"
          style={{ width: centerSize, height: centerSize, borderRadius: radius.full }}
          textStyle={styles.okText}
        />

        <RemoteButton
          label={ICONS.right}
          onPress={() => onCommand('right')}
          variant="nav"
          style={[styles.navBtn, { width: btnSize, height: btnSize, borderRadius: radius.md }]}
          textStyle={styles.arrow}
        />
      </View>

      {/* Bas */}
      <View style={[styles.row, styles.rowSpacing]}>
        <View style={{ width: btnSize }} />
        <RemoteButton
          label={ICONS.down}
          onPress={() => onCommand('down')}
          variant="nav"
          style={[styles.navBtn, { width: btnSize, height: btnSize, borderRadius: radius.md }]}
          textStyle={styles.arrow}
        />
        <View style={{ width: btnSize }} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowSpacing: {
    marginTop: 2,
  },
  navBtn: {
    borderRadius: 0,
  },
  arrow: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  okText: {
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 1,
    color: colors.accent.blue,
  },
});
