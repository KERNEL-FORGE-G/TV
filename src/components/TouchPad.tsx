import React, { useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  PanResponder,
  GestureResponderEvent,
  PanResponderGestureState,
} from 'react-native';
import { colors, radius, typography } from '../theme';

interface TouchPadProps {
  onCommand: (cmd: string) => void;
  onOk?: () => void;
}

const SWIPE_THRESHOLD = 28;

export const TouchPad: React.FC<TouchPadProps> = ({ onCommand, onOk }) => {
  const lastSwipe = useRef(0);

  const handleSwipe = (dx: number, dy: number) => {
    const now = Date.now();
    if (now - lastSwipe.current < 280) return;
    lastSwipe.current = now;

    if (Math.abs(dx) < SWIPE_THRESHOLD && Math.abs(dy) < SWIPE_THRESHOLD) {
      onOk?.();
      onCommand('ok');
      return;
    }

    if (Math.abs(dx) > Math.abs(dy)) {
      onCommand(dx > 0 ? 'right' : 'left');
    } else {
      onCommand(dy > 0 ? 'down' : 'up');
    }
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderRelease: (
        _e: GestureResponderEvent,
        gesture: PanResponderGestureState,
      ) => {
        handleSwipe(gesture.dx, gesture.dy);
      },
    }),
  ).current;

  return (
    <View style={styles.wrap}>
      <View style={styles.pad} {...panResponder.panHandlers}>
        <Text style={styles.hint}>Glisser pour naviguer</Text>
        <Text style={styles.sub}>Tap court = OK</Text>
        <View style={styles.crossV} />
        <View style={styles.crossH} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
  },
  pad: {
    height: 200,
    backgroundColor: colors.bg.elevated,
    borderRadius: radius.xl,
    borderWidth: 1.5,
    borderColor: colors.border.default,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  hint: {
    fontSize: typography.size.lg,
    color: colors.text.primary,
    fontWeight: typography.weight.semibold,
    zIndex: 1,
  },
  sub: {
    fontSize: typography.size.sm,
    color: colors.text.secondary,
    marginTop: 4,
    zIndex: 1,
  },
  crossV: {
    position: 'absolute',
    width: 1,
    height: '70%',
    backgroundColor: colors.border.default,
  },
  crossH: {
    position: 'absolute',
    height: 1,
    width: '70%',
    backgroundColor: colors.border.default,
  },
});
