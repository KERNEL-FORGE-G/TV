import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { FadeIn } from './FadeIn';
import { AnimatedHeaderAction } from './AnimatedHeaderAction';
import { colors, spacing, typography } from '../../theme';

interface AppHeaderProps {
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  title,
  subtitle,
  actionLabel = '＋',
  onAction,
}) => (
  <FadeIn delay={0} offset={8}>
    <View style={styles.wrap}>
      <View style={styles.textBlock}>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
      {onAction ? (
        <AnimatedHeaderAction label={actionLabel} onPress={onAction} />
      ) : null}
    </View>
  </FadeIn>
);

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
  },
  textBlock: { flex: 1 },
  title: {
    fontSize: typography.size.xl,
    fontWeight: typography.weight.bold,
    color: colors.text.primary,
    letterSpacing: typography.letterSpacing.tight,
  },
  subtitle: {
    fontSize: typography.size.sm,
    color: colors.text.muted,
    marginTop: 2,
  },
});
