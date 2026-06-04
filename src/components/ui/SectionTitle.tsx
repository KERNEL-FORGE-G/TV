import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { colors, spacing, typography } from '../../theme';

interface SectionTitleProps {
  children: string;
  /** Premier bloc de l’écran (moins de marge haute) */
  first?: boolean;
}

export const SectionTitle: React.FC<SectionTitleProps> = ({
  children,
  first = false,
}) => (
  <Text style={[styles.title, first && styles.first]}>{children}</Text>
);

const styles = StyleSheet.create({
  title: {
    fontSize: typography.size.xs,
    fontWeight: typography.weight.semibold,
    color: colors.text.secondary,
    letterSpacing: typography.letterSpacing.caps,
    marginBottom: spacing.sm,
    marginTop: spacing.md,
    paddingHorizontal: spacing.lg,
    textTransform: 'uppercase',
  },
  first: {
    marginTop: spacing.sm,
  },
});
