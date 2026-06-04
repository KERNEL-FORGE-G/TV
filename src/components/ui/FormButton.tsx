import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  StyleProp,
  ActivityIndicator,
} from 'react-native';
import { colors, forms } from '../../theme';

type FormButtonVariant = 'primary' | 'outline' | 'ghost';

interface FormButtonProps {
  label: string;
  onPress: () => void;
  variant?: FormButtonVariant;
  disabled?: boolean;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
  labelStyle?: StyleProp<TextStyle>;
}

export const FormButton: React.FC<FormButtonProps> = ({
  label,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  style,
  labelStyle,
}) => {
  const containerStyle =
    variant === 'primary'
      ? styles.primary
      : variant === 'outline'
        ? styles.outline
        : styles.ghost;
  const textStyle =
    variant === 'primary'
      ? styles.primaryText
      : variant === 'outline'
        ? styles.outlineText
        : styles.ghostText;

  return (
    <TouchableOpacity
      style={[containerStyle, disabled && styles.disabled, style]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.85}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'primary' ? '#FFFFFF' : colors.accent.primary}
        />
      ) : (
        <Text style={[textStyle, labelStyle]}>{label}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  primary: forms.btnPrimary,
  primaryText: forms.btnPrimaryText,
  outline: forms.btnOutline,
  outlineText: forms.btnOutlineText,
  ghost: forms.btnGhost,
  ghostText: forms.btnGhostText,
  disabled: { opacity: 0.5 },
});
