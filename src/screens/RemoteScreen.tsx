import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, StatusBar } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Screen } from '../components/Screen';
import { AppHeader } from '../components/ui/AppHeader';
import { Card } from '../components/ui/Card';
import { SectionBlock } from '../components/ui/SectionBlock';
import { ScreenScroll } from '../components/ui/ScreenScroll';
import { ScreenEnter } from '../components/ui/ScreenEnter';
import { FadeIn } from '../components/ui/FadeIn';
import { Badge } from '../components/ui/Badge';
import { useIR } from '../hooks/useIR';
import { useDevices } from '../hooks/useDevices';
import { DeviceSelector } from '../components/DeviceSelector';
import { NavPad } from '../components/NavPad';
import { NumPad } from '../components/NumPad';
import { VolumeControls } from '../components/VolumeControls';
import { RemoteButton } from '../components/RemoteButton';
import { DynamicRemotePanel } from '../components/DynamicRemotePanel';
import { FavoritesBar } from '../components/FavoritesBar';
import { TouchPad } from '../components/TouchPad';
import { TvKeyboardModal } from '../components/TvKeyboardModal';
import { MediaControls } from '../components/MediaControls';
import { FavoriteEditorModal } from '../components/FavoriteEditorModal';
import { supportsTvKeyboard } from '../services/smartTv/wifiCommands';
import { routeLabel, resolveTransportRoute } from '../services/routing/CommandRouter';
import { useRemoteStore } from '../store/remoteStore';
import { EmptyState } from '../components/ui/EmptyState';
import { colors, spacing, typography, motion } from '../theme';

const QUICK_KEYS = [
  { cmd: 'menu', label: 'Menu' },
  { cmd: 'source', label: 'Source' },
  { cmd: 'home', label: 'Accueil' },
  { cmd: 'back', label: 'Retour' },
];

const S = motion.stagger;

export const RemoteScreen: React.FC = () => {
  const navigation = useNavigation();
  const { sendCommand, sendText, isSending } = useIR();
  const [keyboardOpen, setKeyboardOpen] = useState(false);
  const [favOpen, setFavOpen] = useState(false);
  const { devices, activeDevice, activeDeviceId, setActiveDevice } = useDevices();
  const householdName = useRemoteStore((s) => s.householdName);
  const allFavorites = useRemoteStore((s) => s.favorites);
  const favorites = useMemo(
    () => allFavorites.filter((f) => f.deviceId === activeDeviceId),
    [allFavorites, activeDeviceId],
  );

  const route = activeDevice ? resolveTransportRoute(activeDevice) : null;

  if (devices.length === 0) {
    return (
      <Screen>
        <StatusBar barStyle="light-content" backgroundColor={colors.bg.primary} />
        <ScreenEnter>
          <AppHeader title="Télécommande" subtitle={householdName} />
          <EmptyState
            title="Aucun appareil"
            message="Scannez votre réseau ou ajoutez une TV (Wi‑Fi ou IR) pour utiliser la télécommande."
            actionLabel="Ajouter un appareil"
            onAction={() => navigation.navigate('Devices' as never)}
          />
        </ScreenEnter>
      </Screen>
    );
  }

  return (
    <Screen>
      <StatusBar barStyle="light-content" backgroundColor={colors.bg.primary} />

      <ScreenEnter>
        <AppHeader title="Télécommande" subtitle={householdName} />

        <FadeIn delay={S}>
          <DeviceSelector
            devices={devices}
            activeDeviceId={activeDeviceId}
            onSelect={setActiveDevice}
          />
        </FadeIn>

        <ScreenScroll>
          <SectionBlock delay={S * 2} first>
            <Card glow style={styles.heroCard} padded>
              <View style={styles.heroRow}>
                <View style={styles.heroText}>
                  <Text style={styles.heroLabel}>Appareil actif</Text>
                  <Text style={styles.heroName}>{activeDevice?.name ?? '—'}</Text>
                  {activeDevice?.model ? (
                    <Text style={styles.heroModel}>{activeDevice.model}</Text>
                  ) : null}
                  {route && activeDevice ? (
                    <Badge
                      label={`${routeLabel(route)}${activeDevice.connection?.host ? ` · ${activeDevice.connection.host}` : ''}`}
                      tone="accent"
                    />
                  ) : null}
                </View>
                <RemoteButton
                  label="⏻"
                  onPress={() => sendCommand('power')}
                  variant={activeDevice?.isPoweredOn ? 'danger' : 'accent'}
                  shape="round"
                  size="lg"
                  style={styles.powerBtn}
                  textStyle={styles.powerIcon}
                  loading={isSending}
                />
              </View>
            </Card>
          </SectionBlock>

          <SectionBlock title="Pavé tactile" delay={S * 3} center>
            <TouchPad onCommand={sendCommand} />
          </SectionBlock>

          <SectionBlock title="Navigation" delay={S * 4} center>
            <NavPad onCommand={sendCommand} />
          </SectionBlock>

          {activeDevice ? (
            <SectionBlock title="Média" delay={S * 5} first={false}>
              <MediaControls device={activeDevice} onCommand={sendCommand} />
            </SectionBlock>
          ) : null}

          <SectionBlock title="Audio & chaînes" delay={S * 6}>
            <VolumeControls onCommand={sendCommand} />
          </SectionBlock>

          <SectionBlock title="Raccourcis" delay={S * 7}>
            <View style={styles.quickRow}>
              {QUICK_KEYS.map(({ cmd, label }, i) => (
                <View
                  key={cmd}
                  style={[
                    styles.quickCell,
                    i < QUICK_KEYS.length - 1 && styles.quickCellGap,
                  ]}
                >
                  <RemoteButton
                    label={label}
                    onPress={() => sendCommand(cmd)}
                    variant="ghost"
                    shape="pill"
                    style={styles.quickBtn}
                    textStyle={styles.quickText}
                  />
                </View>
              ))}
            </View>
          </SectionBlock>

          {activeDevice ? (
            <FadeIn delay={S * 8}>
              <FavoritesBar
                favorites={favorites}
                onSelect={sendCommand}
                onAdd={() => setFavOpen(true)}
              />
              <DynamicRemotePanel device={activeDevice} onCommand={sendCommand} />
            </FadeIn>
          ) : null}

          {activeDevice?.tvPlatform && supportsTvKeyboard(activeDevice.tvPlatform) ? (
            <SectionBlock title="Clavier" delay={S * 9}>
              <RemoteButton
                label="⌨ Clavier TV"
                onPress={() => setKeyboardOpen(true)}
                variant="accent"
                shape="pill"
                style={styles.keyboardBtn}
              />
            </SectionBlock>
          ) : null}

          <SectionBlock title="Pavé numérique" delay={S * 10}>
            <NumPad onCommand={sendCommand} />
          </SectionBlock>
        </ScreenScroll>
      </ScreenEnter>

      {activeDevice ? (
        <>
          <TvKeyboardModal
            visible={keyboardOpen}
            deviceName={activeDevice.name}
            onClose={() => setKeyboardOpen(false)}
            onSend={sendText}
          />
          <FavoriteEditorModal
            visible={favOpen}
            deviceId={activeDevice.id}
            deviceName={activeDevice.name}
            onClose={() => setFavOpen(false)}
          />
        </>
      ) : null}
    </Screen>
  );
};

const styles = StyleSheet.create({
  heroCard: {
    marginBottom: 0,
  },
  heroRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  heroText: { flex: 1, paddingRight: spacing.md },
  heroLabel: {
    fontSize: typography.size.xs,
    color: colors.text.muted,
    letterSpacing: typography.letterSpacing.caps,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  heroName: {
    fontSize: typography.size.xl,
    fontWeight: typography.weight.bold,
    color: colors.text.primary,
  },
  heroModel: {
    fontSize: typography.size.sm,
    color: colors.text.secondary,
    marginTop: 2,
  },
  powerBtn: {
    width: 64,
    height: 64,
  },
  powerIcon: {
    fontSize: 24,
  },
  quickRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  quickCell: {
    flex: 1,
    minHeight: 44,
  },
  quickCellGap: {
    marginRight: spacing.sm,
  },
  quickBtn: {
    flex: 1,
    minHeight: 44,
    paddingHorizontal: spacing.xs,
  },
  quickText: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.medium,
  },
  keyboardBtn: {
    minHeight: 48,
    width: '100%',
  },
});
