import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar, StyleSheet } from 'react-native';
import { AppNavigator } from './src/navigation/AppNavigator';
import { SetupWizardScreen } from './src/screens/SetupWizardScreen';
import { PermissionGate } from './src/components/PermissionGate';
import { useRemoteStore } from './src/store/remoteStore';
import { colors } from './src/theme';

export default function App() {
  const onboardingComplete = useRemoteStore((s) => s.preferences.onboardingComplete);
  const [wizardDone, setWizardDone] = useState(onboardingComplete);

  const showMain = onboardingComplete || wizardDone;

  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <PermissionGate>
          <NavigationContainer>
            <StatusBar barStyle="light-content" backgroundColor={colors.bg.primary} />
            {showMain ? (
              <AppNavigator />
            ) : (
              <SetupWizardScreen onDone={() => setWizardDone(true)} />
            )}
          </NavigationContainer>
        </PermissionGate>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});
