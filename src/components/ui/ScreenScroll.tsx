import React from 'react';
import {
  ScrollView,
  StyleSheet,
  ScrollViewProps,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { layout, spacing } from '../../theme';

interface ScreenScrollProps extends ScrollViewProps {
  children: React.ReactNode;
  contentStyle?: StyleProp<ViewStyle>;
}

/** Défilement uniforme : marges, tab bar, largeur max centrée */
export const ScreenScroll: React.FC<ScreenScrollProps> = ({
  children,
  contentStyle,
  style,
  ...rest
}) => (
  <ScrollView
    style={[styles.scroll, style]}
    contentContainerStyle={[styles.content, contentStyle]}
    showsVerticalScrollIndicator={false}
    keyboardShouldPersistTaps="handled"
    {...rest}
  >
    {children}
  </ScrollView>
);

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  content: {
    width: '100%',
    maxWidth: layout.maxContentWidth,
    alignSelf: 'center',
    paddingBottom: layout.tabBarInset + spacing.md,
  },
});
