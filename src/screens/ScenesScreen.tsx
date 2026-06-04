import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRemoteStore } from '../store/remoteStore';
import { useIR } from '../hooks/useIR';
import { Scene } from '../data/devices';
import { colors, spacing, radius, typography } from '../theme';

export const ScenesScreen: React.FC = () => {
  const { scenes, devices } = useRemoteStore();
  const { runScene: runSceneAction } = useIR();
  const [runningScene, setRunningScene] = useState<string | null>(null);

  const runScene = async (scene: Scene) => {
    if (runningScene) return;
    setRunningScene(scene.id);

    try {
      const success = await runSceneAction(scene);
      if (success) {
        Alert.alert('✓ Scène activée', `"${scene.name}" exécutée avec succès.`);
      }
    } catch (e) {
      Alert.alert('Erreur', 'Impossible d\'exécuter la scène.');
    } finally {
      setRunningScene(null);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Scènes</Text>
        <TouchableOpacity style={styles.addBtn}>
          <Text style={styles.addBtnText}>＋</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.sectionLabel}>SCÈNES RAPIDES</Text>

        <View style={styles.grid}>
          {scenes.map((scene) => (
            <SceneCard
              key={scene.id}
              scene={scene}
              isRunning={runningScene === scene.id}
              onPress={() => runScene(scene)}
            />
          ))}
        </View>

        <Text style={styles.sectionLabel}>APPAREILS</Text>

        {devices.map((device) => (
          <View key={device.id} style={styles.deviceRow}>
            <View style={styles.deviceLeft}>
              <View
                style={[
                  styles.statusDot,
                  { backgroundColor: device.isOnline ? colors.accent.green : colors.text.muted },
                ]}
              />
              <View>
                <Text style={styles.deviceName}>{device.name}</Text>
                <Text style={styles.deviceMeta}>
                  {device.brand} · {device.protocol}
                  {device.model ? ` · ${device.model}` : ''}
                </Text>
              </View>
            </View>
            <Text style={[styles.deviceStatus, { color: device.isPoweredOn ? colors.accent.green : colors.text.muted }]}>
              {device.isPoweredOn ? 'Allumé' : 'Éteint'}
            </Text>
          </View>
        ))}

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

interface SceneCardProps {
  scene: Scene;
  isRunning: boolean;
  onPress: () => void;
}

const SceneCard: React.FC<SceneCardProps> = ({ scene, isRunning, onPress }) => (
  <TouchableOpacity
    style={[styles.sceneCard, isRunning && styles.sceneCardActive]}
    onPress={onPress}
    activeOpacity={0.7}
    disabled={isRunning}
  >
    {isRunning ? (
      <ActivityIndicator color={colors.accent.blue} size="small" />
    ) : (
      <Text style={styles.sceneIcon}>{scene.icon}</Text>
    )}
    <Text style={styles.sceneName}>{scene.name}</Text>
    <Text style={styles.sceneDesc}>{scene.description}</Text>
    <Text style={styles.sceneSteps}>{scene.actions.length} action(s)</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg.primary },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 0.5,
    borderBottomColor: colors.border.default,
  },
  headerTitle: {
    fontSize: typography.size.lg,
    color: colors.text.primary,
    fontWeight: typography.weight.semibold,
  },
  addBtn: { padding: 4 },
  addBtnText: { fontSize: 22, color: colors.accent.blue },
  content: { padding: spacing.lg, paddingBottom: spacing.md },
  sectionLabel: {
    fontSize: typography.size.xs,
    color: colors.text.muted,
    letterSpacing: 1,
    marginBottom: spacing.xs,
    marginTop: spacing.sm,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -spacing.sm / 2,
  },
  sceneCard: {
    width: '48%',
    backgroundColor: colors.bg.card,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 0.5,
    borderColor: colors.border.default,
    margin: spacing.sm / 2,
  },
  sceneCardActive: {
    borderColor: colors.accent.blue,
    backgroundColor: `${colors.accent.blue}11`,
  },
  sceneIcon: { fontSize: 24 },
  sceneName: {
    fontSize: typography.size.md,
    color: colors.text.primary,
    fontWeight: typography.weight.semibold,
    marginTop: 4,
  },
  sceneDesc: {
    fontSize: typography.size.xs,
    color: colors.text.secondary,
  },
  sceneSteps: {
    fontSize: typography.size.xs,
    color: colors.text.muted,
    marginTop: 4,
  },
  deviceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.bg.card,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 0.5,
    borderColor: colors.border.default,
  },
  deviceLeft: { flexDirection: 'row', alignItems: 'center' },
  statusDot: { width: 8, height: 8, borderRadius: radius.full, marginRight: spacing.sm },
  deviceName: { fontSize: typography.size.md, color: colors.text.primary, fontWeight: typography.weight.medium },
  deviceMeta: { fontSize: typography.size.xs, color: colors.text.muted, marginTop: 2 },
  deviceStatus: { fontSize: typography.size.xs, fontWeight: typography.weight.medium },
});
