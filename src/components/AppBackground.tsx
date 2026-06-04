import React from 'react';
import { View, StyleSheet } from 'react-native';
import { colors } from '../theme';

interface AppBackgroundProps {
  children: React.ReactNode;
}

/** Halo décoratif en haut d’écran (sans lib gradient) */
export const AppBackground: React.FC<AppBackgroundProps> = ({ children }) => (
  <View style={styles.root}>
    <View style={styles.glowTop} />
    <View style={styles.glowAccent} />
    {children}
  </View>
);

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bg.primary,
  },
  glowTop: {
    position: 'absolute',
    top: -120,
    left: '10%',
    right: '10%',
    height: 280,
    borderRadius: 200,
    backgroundColor: colors.gradient.topGlow,
  },
  glowAccent: {
    position: 'absolute',
    top: 80,
    right: -60,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(124, 92, 255, 0.06)',
  },
});
