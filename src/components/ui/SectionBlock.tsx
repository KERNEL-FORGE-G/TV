import React from 'react';
import { View, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { SectionTitle } from './SectionTitle';
import { FadeIn } from './FadeIn';
import { layout } from '../../theme';

interface SectionBlockProps {
  title?: string;
  children: React.ReactNode;
  delay?: number;
  /** Premier titre de l’écran */
  first?: boolean;
  /** Centre le contenu (pavés, nav) */
  center?: boolean;
  /** Sans marge horizontale (pleine largeur) */
  fullBleed?: boolean;
  style?: StyleProp<ViewStyle>;
}

export const SectionBlock: React.FC<SectionBlockProps> = ({
  title,
  children,
  delay = 0,
  first = false,
  center = false,
  fullBleed = false,
  style,
}) => (
  <FadeIn delay={delay} style={[styles.section, style]}>
    {title ? <SectionTitle first={first}>{title}</SectionTitle> : null}
    <View
      style={[
        styles.body,
        fullBleed && styles.fullBleed,
        center && styles.center,
      ]}
    >
      {children}
    </View>
  </FadeIn>
);

const styles = StyleSheet.create({
  section: {
    marginBottom: layout.blockSpacing,
  },
  body: {
    paddingHorizontal: layout.screenPadding,
  },
  fullBleed: {
    paddingHorizontal: 0,
  },
  center: {
    alignItems: 'center',
  },
});
