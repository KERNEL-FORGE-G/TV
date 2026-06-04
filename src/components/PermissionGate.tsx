import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet, Image } from 'react-native';
import appLogo from '../assets/app-logo.png';
import { ensureStartupPermissions } from '../utils/permissions';
import { colors, spacing, typography } from '../theme';
import { Text } from 'react-native';

interface PermissionGateProps {
  children: React.ReactNode;
}

/**
 * Demande réseau + Bluetooth au lancement ; contrôle silencieux du module IR.
 */
export const PermissionGate: React.FC<PermissionGateProps> = ({ children }) => {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    ensureStartupPermissions().finally(() => {
      if (!cancelled) setReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  if (!ready) {
    return (
      <View style={styles.splash}>
        <Image source={appLogo} style={styles.logo} resizeMode="contain" />
        <ActivityIndicator size="large" color={colors.accent.primary} />
        <Text style={styles.label}>Préparation des accès…</Text>
      </View>
    );
  }

  return <>{children}</>;
};

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    backgroundColor: colors.bg.primary,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.lg,
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: spacing.sm,
  },
  label: {
    color: colors.text.secondary,
    fontSize: typography.size.sm,
  },
});
