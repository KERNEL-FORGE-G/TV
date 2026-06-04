import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { useIR } from '../hooks/useIR';
import { useDevices } from '../hooks/useDevices';
import { DeviceSelector } from '../components/DeviceSelector';
import { NavPad } from '../components/NavPad';
import { NumPad } from '../components/NumPad';
import { VolumeControls } from '../components/VolumeControls';
import { RemoteButton } from '../components/RemoteButton';
import { colors, spacing, radius, typography } from '../theme';

export const RemoteScreen: React.FC = () => {
  const { sendCommand, isSending } = useIR();
  const { devices, activeDevice, activeDeviceId, setActiveDevice } = useDevices();

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={colors.bg.primary} />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Télécommande</Text>
        <TouchableOpacity style={styles.addBtn}>
          <Text style={styles.addBtnText}>＋</Text>
        </TouchableOpacity>
      </View>

      {/* Sélecteur d'appareil */}
      <DeviceSelector
        devices={devices}
        activeDeviceId={activeDeviceId}
        onSelect={setActiveDevice}
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Info appareil + Power */}
        <View style={styles.deviceCard}>
          <View>
            <Text style={styles.deviceMeta}>En cours</Text>
            <Text style={styles.deviceName}>{activeDevice?.name ?? '—'}</Text>
            {activeDevice?.model && (
              <Text style={styles.deviceModel}>{activeDevice.model}</Text>
            )}
          </View>
          <RemoteButton
            label={activeDevice?.isPoweredOn ? '⏻' : '⏻'}
            onPress={() => sendCommand('power')}
            variant={activeDevice?.isPoweredOn ? 'danger' : 'ghost'}
            shape="round"
            style={[
              styles.powerBtn,
              activeDevice?.isPoweredOn && styles.powerBtnOn,
            ]}
            textStyle={{ fontSize: 20 }}
            loading={isSending}
          />
        </View>

        <View style={styles.divider} />

        {/* Pavé directionnel */}
        <View style={styles.section}>
          <NavPad onCommand={sendCommand} />
        </View>

        <View style={styles.divider} />

        {/* Volume & Chaînes */}
        <View style={styles.section}>
          <VolumeControls onCommand={sendCommand} />
        </View>

        <View style={styles.divider} />

        {/* Actions rapides : Menu / Source / Home */}
        <View style={styles.quickActions}>
          {['menu', 'source', 'home', 'back'].map((cmd) => (
            <RemoteButton
              key={cmd}
              label={cmd.toUpperCase()}
              onPress={() => sendCommand(cmd)}
              variant="ghost"
              style={styles.quickBtn}
              textStyle={styles.quickBtnText}
            />
          ))}
        </View>

        <View style={styles.divider} />

        {/* Pavé numérique */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>CHIFFRES</Text>
          <NumPad onCommand={sendCommand} />
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.bg.primary,
  },
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
    letterSpacing: 0.3,
  },
  addBtn: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addBtnText: {
    fontSize: 22,
    color: colors.accent.blue,
  },
  scroll: { flex: 1 },
  scrollContent: {
    paddingTop: spacing.md,
  },
  deviceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: spacing.lg,
    backgroundColor: colors.bg.card,
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 0.5,
    borderColor: colors.border.default,
    marginBottom: spacing.md,
  },
  deviceMeta: {
    fontSize: typography.size.xs,
    color: colors.text.muted,
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  deviceName: {
    fontSize: typography.size.lg,
    color: colors.text.primary,
    fontWeight: typography.weight.semibold,
  },
  deviceModel: {
    fontSize: typography.size.xs,
    color: colors.text.secondary,
    marginTop: 2,
  },
  powerBtn: {
    width: 48,
    height: 48,
    borderRadius: radius.full,
  },
  powerBtnOn: {
    backgroundColor: `${colors.accent.red}22`,
    borderColor: colors.accent.red,
    borderWidth: 1,
  },
  section: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  sectionLabel: {
    fontSize: typography.size.xs,
    color: colors.text.muted,
    letterSpacing: 1,
    marginBottom: spacing.sm,
    alignSelf: 'flex-start',
  },
  divider: {
    height: 0.5,
    backgroundColor: colors.border.default,
    marginHorizontal: spacing.lg,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  quickBtn: {
    paddingHorizontal: spacing.md,
    height: 36,
    borderRadius: radius.md,
  },
  quickBtnText: {
    fontSize: typography.size.xs,
    letterSpacing: 0.8,
    color: colors.text.secondary,
  },
});
