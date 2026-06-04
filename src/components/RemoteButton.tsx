import React, { useCallback, useRef } from 'react';
import {
  Pressable,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  StyleProp,
  Animated,
  ActivityIndicator,
} from 'react-native';
import { colors, radius, shadows, typography } from '../theme';

interface RemoteButtonProps {
  label?: string;
  icon?: React.ReactNode;
  onPress: () => void;
  variant?: 'default' | 'accent' | 'danger' | 'ghost' | 'nav';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  shape?: 'round' | 'square' | 'pill';
}

function splitFlexStyle(style?: StyleProp<ViewStyle>) {
  const flat = StyleSheet.flatten(style) ?? {};
  const { flex, flexGrow, flexShrink, alignSelf, width, minWidth, maxWidth, ...rest } = flat;
  const hasFlex = flex === 1 || flexGrow === 1;
  const outer: ViewStyle = {};
  if (flex !== undefined) outer.flex = flex;
  if (flexGrow !== undefined) outer.flexGrow = flexGrow;
  if (flexShrink !== undefined) outer.flexShrink = flexShrink;
  if (alignSelf !== undefined) outer.alignSelf = alignSelf;
  if (width !== undefined && !hasFlex) outer.width = width;
  if (minWidth !== undefined) outer.minWidth = minWidth;
  if (maxWidth !== undefined) outer.maxWidth = maxWidth;

  const inner: ViewStyle = { ...rest };
  if (hasFlex) {
    inner.flex = 1;
    inner.alignSelf = 'stretch';
    inner.width = '100%';
  } else if (width !== undefined) {
    inner.width = width;
  }
  return { outer, inner, hasFlex };
}

export const RemoteButton: React.FC<RemoteButtonProps> = ({
  label,
  icon,
  onPress,
  variant = 'default',
  size = 'md',
  disabled = false,
  loading = false,
  style,
  textStyle,
  shape = 'square',
}) => {
  const scale = useRef(new Animated.Value(1)).current;
  const { outer, inner, hasFlex } = splitFlexStyle(style);

  const handlePressIn = useCallback(() => {
    Animated.spring(scale, {
      toValue: 0.92,
      useNativeDriver: true,
      speed: 60,
      bounciness: 0,
    }).start();
  }, [scale]);

  const handlePressOut = useCallback(() => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      speed: 28,
      bounciness: 5,
    }).start();
  }, [scale]);

  const sizeStyle = sizes[size];
  const variantStyle = variants[variant];
  const shapeRadius =
    shape === 'round' ? radius.full : shape === 'pill' ? radius.lg : radius.md;

  return (
    <Animated.View
      style={[
        hasFlex && styles.flexHost,
        outer,
        { transform: [{ scale }] },
        variant === 'accent' && shadows.glow,
      ]}
    >
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled || loading}
        style={({ pressed }) => [
          styles.base,
          sizeStyle,
          variantStyle.container,
          { borderRadius: shapeRadius },
          inner,
          pressed && styles.pressed,
          disabled && styles.disabled,
        ]}
      >
        {loading ? (
          <ActivityIndicator size="small" color={variantStyle.text.color as string} />
        ) : (
          <>
            {icon}
            {label ? (
              <Text style={[styles.label, variantStyle.text, textStyle]}>{label}</Text>
            ) : null}
          </>
        )}
      </Pressable>
    </Animated.View>
  );
};

const sizes = {
  sm: { minWidth: 40, minHeight: 40 } as ViewStyle,
  md: { minWidth: 52, minHeight: 52 } as ViewStyle,
  lg: { minWidth: 64, minHeight: 64 } as ViewStyle,
};

const variants: Record<string, { container: ViewStyle; text: TextStyle }> = {
  default: {
    container: {
      backgroundColor: colors.bg.elevated,
      borderWidth: 1.5,
      borderColor: colors.border.default,
      ...shadows.sm,
    },
    text: {
      color: colors.text.primary,
      fontWeight: typography.weight.semibold,
      fontSize: typography.size.md,
    },
  },
  accent: {
    container: {
      backgroundColor: colors.accent.primary,
      borderWidth: 1.5,
      borderColor: colors.border.active,
      ...shadows.sm,
    },
    text: {
      color: '#FFFFFF',
      fontWeight: typography.weight.bold,
      fontSize: typography.size.md,
    },
  },
  danger: {
    container: {
      backgroundColor: colors.accent.red,
      borderWidth: 1.5,
      borderColor: 'rgba(255, 107, 120, 0.6)',
      ...shadows.sm,
    },
    text: {
      color: '#FFFFFF',
      fontWeight: typography.weight.bold,
      fontSize: typography.size.md,
    },
  },
  ghost: {
    container: {
      backgroundColor: colors.bg.elevated,
      borderWidth: 1.5,
      borderColor: colors.border.default,
    },
    text: {
      color: colors.text.primary,
      fontWeight: typography.weight.medium,
      fontSize: typography.size.sm,
    },
  },
  nav: {
    container: {
      backgroundColor: colors.bg.elevated,
      borderWidth: 1.5,
      borderColor: colors.border.default,
      ...shadows.sm,
    },
    text: {
      color: colors.text.primary,
      fontWeight: typography.weight.semibold,
      fontSize: typography.size.md,
    },
  },
};

const styles = StyleSheet.create({
  flexHost: {
    alignSelf: 'stretch',
  },
  base: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: typography.size.sm,
    letterSpacing: 0.2,
    textAlign: 'center',
  },
  pressed: {
    opacity: 0.88,
  },
  disabled: {
    opacity: 0.35,
  },
});
