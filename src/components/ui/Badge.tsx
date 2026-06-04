import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, radius, typography } from '../../theme';

type BadgeTone = 'default' | 'success' | 'warning' | 'accent';

interface BadgeProps {
  label: string;
  tone?: BadgeTone;
}

const toneStyles: Record<BadgeTone, { bg: string; text: string }> = {
  default: { bg: colors.bg.elevated, text: colors.text.secondary },
  success: { bg: colors.accent.greenMuted, text: colors.accent.green },
  warning: { bg: 'rgba(255, 176, 32, 0.15)', text: colors.accent.amber },
  accent: { bg: colors.accent.primaryMuted, text: colors.accent.primary },
};

export const Badge: React.FC<BadgeProps> = ({ label, tone = 'default' }) => {
  const t = toneStyles[tone];
  return (
    <View style={[styles.badge, { backgroundColor: t.bg }]}>
      <Text style={[styles.text, { color: t.text }]}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.full,
  },
  text: {
    fontSize: typography.size.xs,
    fontWeight: typography.weight.medium,
  },
});
