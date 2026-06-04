import React from 'react';
import { View, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { colors, radius, shadows, spacing } from '../../theme';

interface CardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  glow?: boolean;
  padded?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  style,
  glow = false,
  padded = true,
}) => (
  <View style={[styles.card, glow && shadows.glow, padded && styles.padded, style]}>
    {children}
  </View>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.bg.card,
    borderRadius: radius.xl,
    borderWidth: 1.5,
    borderColor: colors.border.default,
    ...shadows.md,
  },
  padded: {
    padding: spacing.lg,
  },
});
