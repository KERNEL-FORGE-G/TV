import React, { useRef } from 'react';
import { Animated, Text, StyleSheet, Pressable } from 'react-native';
import { colors, radius, typography, motion } from '../../theme';

interface AnimatedHeaderActionProps {
  label: string;
  onPress: () => void;
}

export const AnimatedHeaderAction: React.FC<AnimatedHeaderActionProps> = ({
  label,
  onPress,
}) => {
  const scale = useRef(new Animated.Value(1)).current;

  const pressIn = () => {
    Animated.spring(scale, {
      toValue: 0.9,
      useNativeDriver: true,
      ...motion.spring.press,
    }).start();
  };

  const pressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      ...motion.spring.release,
    }).start();
  };

  return (
    <Pressable onPress={onPress} onPressIn={pressIn} onPressOut={pressOut}>
      <Animated.View style={[styles.action, { transform: [{ scale }] }]}>
        <Text style={styles.actionText}>{label}</Text>
      </Animated.View>
    </Pressable>
  );
};

/** @deprecated utiliser AnimatedHeaderAction */
export const TouchableHeaderAction = AnimatedHeaderAction;

const styles = StyleSheet.create({
  action: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: colors.accent.primaryMuted,
    borderWidth: 1,
    borderColor: colors.border.active,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionText: {
    fontSize: 22,
    color: colors.accent.primary,
    fontWeight: typography.weight.medium,
  },
});
