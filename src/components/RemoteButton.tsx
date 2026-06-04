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
import { colors, radius, typography } from '../theme';

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

  const handlePressIn = useCallback(() => {
    Animated.spring(scale, {
      toValue: 0.88,
      useNativeDriver: true,
      speed: 50,
      bounciness: 0,
    }).start();
  }, [scale]);

  const handlePressOut = useCallback(() => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      speed: 30,
      bounciness: 4,
    }).start();
  }, [scale]);

  const sizeStyle = sizes[size];
  const variantStyle = variants[variant];
  const shapeRadius =
    shape === 'round' ? radius.full : shape === 'pill' ? radius.lg : radius.md;

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled || loading}
        style={[
          styles.base,
          sizeStyle,
          variantStyle.container,
          { borderRadius: shapeRadius },
          disabled && styles.disabled,
          style,
        ]}
      >
        {loading ? (
          <ActivityIndicator size="small" color={variantStyle.text.color as string} />
        ) : (
          <>
            {icon}
            {label && (
              <Text style={[styles.label, variantStyle.text, textStyle]}>
                {label}
              </Text>
            )}
          </>
        )}
      </Pressable>
    </Animated.View>
  );
};

const sizes = {
  sm: { width: 40, height: 40 } as ViewStyle,
  md: { width: 52, height: 52 } as ViewStyle,
  lg: { width: 64, height: 64 } as ViewStyle,
};

const variants: Record<string, { container: ViewStyle; text: TextStyle }> = {
  default: {
    container: {
      backgroundColor: colors.bg.elevated,
      borderWidth: 0.5,
      borderColor: colors.border.default,
    },
    text: { color: colors.text.primary },
  },
  accent: {
    container: {
      backgroundColor: `${colors.accent.blue}22`,
      borderWidth: 1,
      borderColor: `${colors.accent.blue}55`,
    },
    text: { color: colors.accent.blue },
  },
  danger: {
    container: {
      backgroundColor: `${colors.accent.red}22`,
      borderWidth: 1,
      borderColor: `${colors.accent.red}55`,
    },
    text: { color: colors.accent.red },
  },
  ghost: {
    container: {
      backgroundColor: 'transparent',
      borderWidth: 0,
    },
    text: { color: colors.text.secondary },
  },
  nav: {
    container: {
      backgroundColor: colors.bg.card,
      borderWidth: 0.5,
      borderColor: colors.border.default,
    },
    text: { color: colors.text.primary },
  },
};

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.medium,
    letterSpacing: 0.3,
  },
  disabled: {
    opacity: 0.35,
  },
});
