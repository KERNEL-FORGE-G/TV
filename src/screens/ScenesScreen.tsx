import React, { useState } from 'react';
import { SceneEditorModal } from '../components/SceneEditorModal';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRemoteStore } from '../store/remoteStore';
import { useIR } from '../hooks/useIR';
import { Scene } from '../data/devices';
import { Screen } from '../components/Screen';
import { AppHeader } from '../components/ui/AppHeader';
import { SectionBlock } from '../components/ui/SectionBlock';
import { ScreenScroll } from '../components/ui/ScreenScroll';
import { ScreenEnter } from '../components/ui/ScreenEnter';
import { FadeIn } from '../components/ui/FadeIn';
import { EmptyState } from '../components/ui/EmptyState';
import { colors, spacing, radius, shadows, typography, motion } from '../theme';

const S = motion.stagger;

export const ScenesScreen: React.FC = () => {
  const { scenes, devices, removeScene } = useRemoteStore();
  const { runScene: runSceneAction } = useIR();
  const [runningScene, setRunningScene] = useState<string | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);

  const runScene = async (scene: Scene) => {
    if (runningScene) return;
    setRunningScene(scene.id);

    try {
      const success = await runSceneAction(scene);
      if (success) {
        Alert.alert('✓ Scène activée', `"${scene.name}" exécutée avec succès.`);
      }
    } catch {
      Alert.alert('Erreur', 'Impossible d\'exécuter la scène.');
    } finally {
      setRunningScene(null);
    }
  };

  return (
    <Screen>
      <ScreenEnter>
        <AppHeader
          title="Scènes"
          subtitle="Macros & ambiance"
          onAction={() => setEditorOpen(true)}
        />

        <ScreenScroll contentStyle={styles.content}>
          <SectionBlock
            title="Scènes rapides"
            delay={S}
            first
            fullBleed={scenes.length === 0}
          >
            {scenes.length === 0 ? (
              <EmptyState
                title="Aucune scène"
                message="Créez des macros (cinéma, tout éteindre…) qui enchaînent des commandes réelles sur vos TV."
                actionLabel="Créer une scène"
                onAction={() => setEditorOpen(true)}
              />
            ) : (
              <View style={styles.grid}>
                {scenes.map((scene, index) => (
                  <FadeIn key={scene.id} delay={S * 2 + index * 45} style={styles.gridCell}>
                    <SceneCard
                      scene={scene}
                      isRunning={runningScene === scene.id}
                      onPress={() => runScene(scene)}
                      onDelete={() =>
                        Alert.alert('Supprimer', `Retirer « ${scene.name} » ?`, [
                          { text: 'Annuler', style: 'cancel' },
                          {
                            text: 'Supprimer',
                            style: 'destructive',
                            onPress: () => removeScene(scene.id),
                          },
                        ])
                      }
                    />
                  </FadeIn>
                ))}
              </View>
            )}
          </SectionBlock>

          <SectionBlock title="Appareils" delay={S * 4}>
            {devices.map((device, index) => (
              <FadeIn key={device.id} delay={S * 5 + index * 35}>
                <View style={styles.deviceRow}>
                  <View style={styles.deviceLeft}>
                    <View
                      style={[
                        styles.statusDot,
                        {
                          backgroundColor: device.isOnline
                            ? colors.accent.green
                            : colors.text.muted,
                        },
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
                  <Text
                    style={[
                      styles.deviceStatus,
                      {
                        color: device.isPoweredOn
                          ? colors.accent.green
                          : colors.text.muted,
                      },
                    ]}
                  >
                    {device.isPoweredOn ? 'Allumé' : 'Éteint'}
                  </Text>
                </View>
              </FadeIn>
            ))}
          </SectionBlock>
        </ScreenScroll>
      </ScreenEnter>

      <SceneEditorModal visible={editorOpen} onClose={() => setEditorOpen(false)} />
    </Screen>
  );
};

interface SceneCardProps {
  scene: Scene;
  isRunning: boolean;
  onPress: () => void;
  onDelete: () => void;
}

const SceneCard: React.FC<SceneCardProps> = ({
  scene,
  isRunning,
  onPress,
  onDelete,
}) => (
  <TouchableOpacity
    style={[styles.sceneCard, isRunning && styles.sceneCardActive]}
    onPress={onPress}
    onLongPress={onDelete}
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
  content: {},
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -spacing.sm / 2,
  },
  gridCell: {
    width: '50%',
    paddingHorizontal: spacing.sm / 2,
    marginBottom: spacing.sm,
  },
  sceneCard: {
    width: '100%',
    backgroundColor: colors.bg.card,
    borderRadius: radius.xl,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border.default,
    ...shadows.md,
  },
  sceneCardActive: {
    borderColor: colors.border.active,
    backgroundColor: colors.accent.primaryMuted,
    ...shadows.glow,
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
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border.default,
    marginBottom: spacing.sm,
    ...shadows.sm,
  },
  deviceLeft: { flexDirection: 'row', alignItems: 'center' },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: radius.full,
    marginRight: spacing.sm,
  },
  deviceName: {
    fontSize: typography.size.md,
    color: colors.text.primary,
    fontWeight: typography.weight.medium,
  },
  deviceMeta: {
    fontSize: typography.size.xs,
    color: colors.text.muted,
    marginTop: 2,
  },
  deviceStatus: {
    fontSize: typography.size.xs,
    fontWeight: typography.weight.medium,
  },
});
