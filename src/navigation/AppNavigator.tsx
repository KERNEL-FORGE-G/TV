import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { RemoteScreen } from '../screens/RemoteScreen';
import { ScenesScreen } from '../screens/ScenesScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { colors, typography } from '../theme';

const Tab = createBottomTabNavigator();

const ICONS: Record<string, string> = {
  Remote: '⊞',
  Scenes: '✦',
  Settings: '⚙',
};

const LABELS: Record<string, string> = {
  Remote: 'Télécommande',
  Scenes: 'Scènes',
  Settings: 'Réglages',
};

export const AppNavigator: React.FC = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      headerShown: false,
      tabBarStyle: styles.tabBar,
      tabBarActiveTintColor: colors.accent.blue,
      tabBarInactiveTintColor: colors.text.muted,
      tabBarLabel: LABELS[route.name] ?? route.name,
      tabBarLabelStyle: styles.tabLabel,
      tabBarIcon: ({ color }) => (
        <Text style={{ fontSize: 18, color }}>{ICONS[route.name]}</Text>
      ),
    })}
  >
    <Tab.Screen name="Remote" component={RemoteScreen} />
    <Tab.Screen name="Scenes" component={ScenesScreen} />
    <Tab.Screen name="Settings" component={SettingsScreen} />
  </Tab.Navigator>
);

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: colors.bg.secondary,
    borderTopWidth: 0.5,
    borderTopColor: colors.border.default,
    paddingBottom: 6,
    paddingTop: 4,
    height: 60,
  },
  tabLabel: {
    fontSize: typography.size.xs,
    marginTop: 2,
  },
});
