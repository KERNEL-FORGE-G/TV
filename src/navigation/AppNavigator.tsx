import React, { useEffect, useRef } from 'react';
import { Text, StyleSheet, Platform, Animated } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { RemoteScreen } from '../screens/RemoteScreen';
import { ScenesScreen } from '../screens/ScenesScreen';
import { DevicesScreen } from '../screens/DevicesScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { colors, radius, shadows, spacing, typography, layout, motion } from '../theme';

const Tab = createBottomTabNavigator();

const TABS: Record<string, { icon: string; label: string }> = {
  Remote: { icon: '◉', label: 'Télécommande' },
  Scenes: { icon: '✦', label: 'Scènes' },
  Devices: { icon: '◎', label: 'Appareils' },
  Settings: { icon: '⚙', label: 'Réglages' },
};

const TabBarIcon: React.FC<{ routeName: string; focused: boolean }> = ({
  routeName,
  focused,
}) => {
  const tab = TABS[routeName];
  const scale = useRef(new Animated.Value(focused ? 1 : 0.88)).current;

  useEffect(() => {
    Animated.spring(scale, {
      toValue: focused ? 1 : 0.88,
      useNativeDriver: true,
      ...motion.spring.enter,
    }).start();
  }, [focused, scale]);

  return (
    <Animated.View
      style={[
        styles.iconWrap,
        focused && styles.iconWrapFocused,
        { transform: [{ scale }] },
      ]}
    >
      <Text style={[styles.tabIcon, focused && styles.tabIconFocused]}>
        {tab?.icon ?? '•'}
      </Text>
    </Animated.View>
  );
};

const screenOptions = ({ route }: { route: { name: string } }) => ({
  headerShown: false,
  tabBarStyle: styles.tabBar,
  tabBarActiveTintColor: colors.accent.primary,
  tabBarInactiveTintColor: colors.text.muted,
  tabBarLabel: TABS[route.name]?.label ?? route.name,
  tabBarLabelStyle: styles.tabLabel,
  tabBarItemStyle: styles.tabItem,
  tabBarIcon: ({ focused }: { focused: boolean }) => (
    <TabBarIcon routeName={route.name} focused={focused} />
  ),
});

export const AppNavigator: React.FC = () => (
  <Tab.Navigator screenOptions={screenOptions}>
    <Tab.Screen name="Remote" component={RemoteScreen} />
    <Tab.Screen name="Scenes" component={ScenesScreen} />
    <Tab.Screen name="Devices" component={DevicesScreen} />
    <Tab.Screen name="Settings" component={SettingsScreen} />
  </Tab.Navigator>
);

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    left: spacing.md,
    right: spacing.md,
    bottom: Platform.OS === 'ios' ? spacing.lg : spacing.md,
    height: layout.tabBarHeight,
    backgroundColor: colors.bg.overlay,
    borderTopWidth: 0,
    borderRadius: radius.xxl,
    borderWidth: 1,
    borderColor: colors.border.glass,
    paddingBottom: 6,
    paddingTop: 8,
    ...shadows.lg,
  },
  tabItem: {
    paddingTop: 4,
  },
  tabLabel: {
    fontSize: typography.size.xs,
    fontWeight: typography.weight.medium,
    marginTop: 2,
    marginBottom: 4,
  },
  iconWrap: {
    width: 36,
    height: 28,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapFocused: {
    backgroundColor: colors.accent.primaryMuted,
  },
  tabIcon: {
    fontSize: 18,
    color: colors.text.muted,
  },
  tabIconFocused: {
    color: colors.accent.primary,
  },
});
