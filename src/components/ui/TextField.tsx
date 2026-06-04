import React from 'react';
import {
  TextInput,
  StyleSheet,
  TextInputProps,
  StyleProp,
  TextStyle,
} from 'react-native';
import { forms } from '../../theme';

interface TextFieldProps extends TextInputProps {
  multiline?: boolean;
  style?: StyleProp<TextStyle>;
}

export const TextField: React.FC<TextFieldProps> = ({
  style,
  multiline,
  placeholderTextColor = forms.placeholderColor,
  ...rest
}) => (
  <TextInput
    style={[
      styles.input,
      multiline && styles.multiline,
      style,
    ]}
    placeholderTextColor={placeholderTextColor}
    multiline={multiline}
    {...rest}
  />
);

const styles = StyleSheet.create({
  input: forms.input,
  multiline: {
    minHeight: 96,
    textAlignVertical: 'top',
  },
});
