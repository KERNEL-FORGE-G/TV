import React, { useRef } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Animated,
} from 'react-native';
import { FadeIn } from './FadeIn';
import { colors, radius, spacing, typography, motion, forms } from '../../theme';

interface EmptyStateProps {
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  message,
  actionLabel,
  onAction,
}) => {
  const btnScale = useRef(new Animated.Value(1)).current;

  return (
    <FadeIn delay={80} style={styles.outer}>
      <View style={styles.wrap}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.message}>{message}</Text>
        {actionLabel && onAction ? (
          <Pressable
            onPress={onAction}
            onPressIn={() =>
              Animated.spring(btnScale, {
                toValue: 0.96,
                useNativeDriver: true,
                ...motion.spring.press,
              }).start()
            }
            onPressOut={() =>
              Animated.spring(btnScale, {
                toValue: 1,
                useNativeDriver: true,
                ...motion.spring.release,
              }).start()
            }
          >
            <Animated.View style={[styles.btn, { transform: [{ scale: btnScale }] }]}>
              <Text style={styles.btnText}>{actionLabel}</Text>
            </Animated.View>
          </Pressable>
        ) : null}
      </View>
    </FadeIn>
  );
};

const styles = StyleSheet.create({
  outer: {
    width: '100%',
    flex: 1,
    justifyContent: 'center',
  },
  wrap: {
    marginVertical: spacing.xl,
    padding: spacing.xl,
    backgroundColor: colors.bg.card,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border.default,
    alignItems: 'center',
  },
  title: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.bold,
    color: colors.text.primary,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  message: {
    fontSize: typography.size.sm,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: spacing.lg,
  },
  btn: {
    ...forms.btnPrimary,
    paddingHorizontal: spacing.xl,
  },
  btnText: forms.btnPrimaryText,
});
