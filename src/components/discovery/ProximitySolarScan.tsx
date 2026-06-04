import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Easing,
  TextInput,
  ActivityIndicator,
  Dimensions,
  Pressable,
} from 'react-native';
import type { DiscoveryCandidate, DiscoveryMode } from '../../core/remoteTypes';
import type { TvPlatformId } from '../../data/tvPlatforms';
import { routeLabel } from '../../services/routing/CommandRouter';
import { colors, radius, shadows, spacing, typography, forms } from '../../theme';

const { width: SCREEN_W } = Dimensions.get('window');
const CHART_SIZE = Math.min(SCREEN_W - spacing.lg * 2, 280);
const CENTER = CHART_SIZE / 2;
const CENTER_RADIUS = 36;
const PLANET_RADIUS = 34;
const ORBIT_INNER = 72;
const ORBIT_OUTER = 108;

const PLATFORM_ICONS: Partial<Record<TvPlatformId, string>> = {
  roku: '📺',
  tcl_roku: '📺',
  sony_bravia: '📺',
  lg_webos: '📺',
  samsung_tizen: '📺',
  philips_android: '📺',
  ir_generic: '📡',
  bluetooth_generic: '🔊',
};

interface ProximitySolarScanProps {
  candidates: DiscoveryCandidate[];
  scanning: boolean;
  scanProgress: string;
  discoveryMode: DiscoveryMode;
  onDiscoveryModeChange: (mode: DiscoveryMode) => void;
  subnet: string;
  onSubnetChange: (value: string) => void;
  onScan: () => void;
  onStopScan?: () => void;
  onAdopt: (candidateId: string) => void;
  onDismiss: (candidateId: string) => void;
}

interface OrbitSlot {
  candidate: DiscoveryCandidate;
  orbitRadius: number;
  angle: number;
}

function layoutOrbits(items: DiscoveryCandidate[]): OrbitSlot[] {
  if (items.length === 0) return [];

  const innerCount = Math.min(4, items.length);
  const outerCount = items.length - innerCount;

  return items.map((candidate, index) => {
    let orbitRadius = ORBIT_INNER;
    let indexOnRing = index;
    let countOnRing = innerCount;

    if (index >= innerCount) {
      orbitRadius = ORBIT_OUTER;
      indexOnRing = index - innerCount;
      countOnRing = outerCount;
    }

    const angle = (indexOnRing / countOnRing) * Math.PI * 2 - Math.PI / 2;

    return { candidate, orbitRadius, angle };
  });
}

export const ProximitySolarScan: React.FC<ProximitySolarScanProps> = ({
  candidates,
  scanning,
  scanProgress,
  discoveryMode,
  onDiscoveryModeChange,
  subnet,
  onSubnetChange,
  onScan,
  onStopScan,
  onAdopt,
  onDismiss,
}) => {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const orbitSpin = useRef(new Animated.Value(0)).current;
  const pulse = useRef(new Animated.Value(0)).current;

  const slots = useMemo(() => layoutOrbits(candidates), [candidates]);
  const selected = candidates.find((c) => c.id === selectedId) ?? null;

  useEffect(() => {
    if (selectedId && !candidates.some((c) => c.id === selectedId)) {
      setSelectedId(null);
    }
  }, [candidates, selectedId]);

  useEffect(() => {
    if (scanning) {
      orbitSpin.stopAnimation();
      orbitSpin.setValue(0);
      return;
    }
    const spinLoop = Animated.loop(
      Animated.timing(orbitSpin, {
        toValue: 1,
        duration: 48000,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );
    spinLoop.start();
    return () => spinLoop.stop();
  }, [orbitSpin, scanning]);

  useEffect(() => {
    if (!scanning) {
      pulse.setValue(0);
      return;
    }
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 1600,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ]),
    );
    pulseLoop.start();
    return () => pulseLoop.stop();
  }, [pulse, scanning]);

  const spin = orbitSpin.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const counterSpin = orbitSpin.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '-360deg'],
  });

  const pulseScale = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [0.35, 1.15],
  });

  const pulseOpacity = pulse.interpolate({
    inputRange: [0, 0.4, 1],
    outputRange: [0.55, 0.25, 0],
  });

  const isWifi = discoveryMode === 'wifi';

  return (
    <View style={styles.wrap}>
      <Text style={[styles.sectionSub, styles.sectionSubFirst]}>
        {isWifi
          ? 'Scan Wi‑Fi jusqu’à 15 s : les TV trouvées s’ajoutent à la liste. Vous pouvez arrêter avant la fin.'
          : 'Scan Bluetooth jusqu’à 15 s : appareils appairés ou détectés. Arrêt possible à tout moment.'}
      </Text>

      <View style={styles.modeRow}>
        <TouchableOpacity
          style={[styles.modeChip, isWifi && styles.modeChipActive]}
          onPress={() => onDiscoveryModeChange('wifi')}
          disabled={scanning}
        >
          <Text style={[styles.modeChipText, isWifi && styles.modeChipTextActive]}>
            📶 Wi‑Fi
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.modeChip, !isWifi && styles.modeChipActive]}
          onPress={() => onDiscoveryModeChange('bluetooth')}
          disabled={scanning}
        >
          <Text style={[styles.modeChipText, !isWifi && styles.modeChipTextActive]}>
            🔵 Bluetooth
          </Text>
        </TouchableOpacity>
      </View>

      <View style={[styles.chart, { width: CHART_SIZE, height: CHART_SIZE }]}>
        <View style={styles.stars} pointerEvents="none">
          {STAR_OFFSETS.map((s, i) => (
            <View
              key={i}
              style={[
                styles.star,
                {
                  left: `${s.x}%`,
                  top: `${s.y}%`,
                  opacity: s.o,
                },
              ]}
            />
          ))}
        </View>

        <View style={[styles.orbitRing, { width: ORBIT_OUTER * 2, height: ORBIT_OUTER * 2 }]} />
        <View
          style={[
            styles.orbitRing,
            styles.orbitRingInner,
            { width: ORBIT_INNER * 2, height: ORBIT_INNER * 2 },
          ]}
        />

        {scanning ? (
          <Animated.View
            pointerEvents="none"
            style={[
              styles.pulseRing,
              {
                width: CHART_SIZE,
                height: CHART_SIZE,
                borderRadius: CHART_SIZE / 2,
                opacity: pulseOpacity,
                transform: [{ scale: pulseScale }],
              },
            ]}
          />
        ) : null}

        <View style={styles.centerSun} pointerEvents="none">
          <View style={styles.sunCore}>
            <Text style={styles.sunIcon}>📱</Text>
          </View>
          <Text style={styles.sunLabel}>Cet appareil</Text>
          {scanning ? (
            <Text style={styles.sunScan}>{scanProgress || 'Scan…'}</Text>
          ) : (
            <Text style={styles.sunHint}>{candidates.length} en orbite</Text>
          )}
        </View>

        <Animated.View
          style={[styles.orbitLayer, { transform: [{ rotate: spin }] }]}
          pointerEvents="box-none"
        >
          {slots.map(({ candidate, orbitRadius, angle }) => {
            const x =
              CENTER +
              Math.cos(angle) * orbitRadius -
              PLANET_RADIUS;
            const y =
              CENTER +
              Math.sin(angle) * orbitRadius -
              PLANET_RADIUS;
            const isSelected = selectedId === candidate.id;
            const icon = PLATFORM_ICONS[candidate.platformId] ?? '📺';

            return (
              <View
                key={candidate.id}
                style={[
                  styles.planetWrap,
                  { left: x, top: y },
                ]}
              >
                <Animated.View style={{ transform: [{ rotate: counterSpin }] }}>
                  <Pressable
                    onPress={() =>
                      setSelectedId((id) => (id === candidate.id ? null : candidate.id))
                    }
                    style={[
                      styles.planet,
                      isSelected && styles.planetSelected,
                    ]}
                  >
                    <Text style={styles.planetIcon}>{icon}</Text>
                  </Pressable>
                </Animated.View>
              </View>
            );
          })}
        </Animated.View>

        {!scanning && candidates.length === 0 ? (
          <Text style={styles.emptyOrbit}>
            {isWifi
              ? 'Lancez le scan Wi‑Fi pour détecter des TV'
              : 'Lancez le scan Bluetooth (appairez d’abord si besoin)'}
          </Text>
        ) : null}
      </View>

      {candidates.length > 0 ? (
        <View style={styles.listBlock}>
          <Text style={styles.listTitle}>
            {candidates.length} TV détectée{candidates.length > 1 ? 's' : ''}
          </Text>
          {candidates.map((candidate) => {
            const isSelected = selectedId === candidate.id;
            const isAdopted = candidate.status === 'adopted';
            const icon = PLATFORM_ICONS[candidate.platformId] ?? '📺';
            const subtitle =
              candidate.protocol === 'Bluetooth'
                ? `${candidate.bluetoothSource === 'bonded' ? 'Appairé' : 'À proximité'} · ${candidate.mac ?? 'Bluetooth'}`
                : `${candidate.host}${candidate.port ? `:${candidate.port}` : ''} · ${routeLabel(candidate.route)}`;

            return (
              <Pressable
                key={candidate.id}
                onPress={() =>
                  setSelectedId((id) => (id === candidate.id ? null : candidate.id))
                }
                style={[
                  styles.listRow,
                  isSelected && styles.listRowSelected,
                  isAdopted && styles.listRowAdopted,
                ]}
              >
                <Text style={styles.listIcon}>{icon}</Text>
                <View style={styles.listBody}>
                  <View style={styles.listNameRow}>
                    <Text style={styles.listName} numberOfLines={2}>
                      {candidate.name}
                    </Text>
                    {isAdopted ? (
                      <View style={styles.addedBadge}>
                        <Text style={styles.addedBadgeText}>Ajouté</Text>
                      </View>
                    ) : null}
                  </View>
                  <Text style={styles.listMeta} numberOfLines={2}>
                    {subtitle}
                  </Text>
                </View>
                <Text style={styles.listChevron}>{isSelected ? '▾' : '›'}</Text>
              </Pressable>
            );
          })}
        </View>
      ) : null}

      {selected ? (
        <View style={styles.detailCard}>
          <Text style={styles.detailName}>{selected.name}</Text>
          <Text style={styles.detailMeta}>
            {selected.protocol === 'Bluetooth'
              ? `${selected.mac ?? selected.name} · ${selected.bluetoothSource === 'bonded' ? 'Appairé' : 'Détecté'}`
              : `${selected.host}${selected.port ? `:${selected.port}` : ''}`}
            {' · '}
            {routeLabel(selected.route)}
          </Text>
          <View style={styles.detailActions}>
            {selected.status === 'adopted' ? (
              <Text style={styles.detailAdoptedHint}>
                Cet appareil est déjà dans « Mes appareils » plus bas sur cet écran.
              </Text>
            ) : (
              <>
                <TouchableOpacity
                  style={styles.adoptBtn}
                  onPress={() => {
                    onAdopt(selected.id);
                  }}
                >
                  <Text style={styles.adoptText}>Ajouter à ma télécommande</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.dismissBtn}
                  onPress={() => {
                    onDismiss(selected.id);
                    setSelectedId(null);
                  }}
                >
                  <Text style={styles.dismissText}>Retirer de la liste de scan</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      ) : null}

      <View style={styles.controls}>
        {isWifi ? (
          <>
            <Text style={styles.fieldLabel}>Préfixe réseau</Text>
            <TextInput
              style={styles.input}
              value={subnet}
              onChangeText={onSubnetChange}
              placeholder="192.168.1"
              placeholderTextColor={forms.placeholderColor}
              editable={!scanning}
            />
          </>
        ) : (
          <View style={styles.btHelpCard}>
            <Text style={styles.fieldLabel}>Bluetooth dans l’app</Text>
            <Text style={styles.btHint}>
              1. Activez le Bluetooth sur le téléphone{'\n'}
              2. Appairez la TV via le menu Bluetooth Android (panneau rapide){'\n'}
              3. Revenez ici et appuyez sur « Scanner le Bluetooth »{'\n'}
              {'\n'}
              Les appareils trouvés restent affichés dans la liste ci‑dessus, sans quitter
              l’application.
            </Text>
          </View>
        )}
        {scanning ? (
          <>
            <View style={styles.scanningRow}>
              <ActivityIndicator color={colors.accent.primary} />
              <Text style={styles.progressText}>
                {scanProgress || 'Scan en cours…'}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.stopBtn}
              onPress={() => onStopScan?.()}
            >
              <Text style={styles.stopBtnText}>Arrêter le scan</Text>
            </TouchableOpacity>
          </>
        ) : (
          <TouchableOpacity style={styles.scanBtn} onPress={onScan}>
            <Text style={styles.scanBtnText}>
              {isWifi ? 'Scanner le Wi‑Fi (15 s)' : 'Scanner le Bluetooth (15 s)'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

/** Positions fixes d’étoiles décoratives (%) */
const STAR_OFFSETS = [
  { x: 12, y: 18, o: 0.35 },
  { x: 78, y: 8, o: 0.5 },
  { x: 88, y: 42, o: 0.25 },
  { x: 6, y: 72, o: 0.4 },
  { x: 52, y: 92, o: 0.3 },
  { x: 34, y: 28, o: 0.2 },
  { x: 64, y: 58, o: 0.45 },
];

const styles = StyleSheet.create({
  wrap: {
    marginBottom: spacing.lg,
  },
  listBlock: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  listTitle: {
    fontSize: typography.size.md,
    fontWeight: typography.weight.semibold,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  listRow: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 64,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
    backgroundColor: colors.bg.card,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderColor: colors.border.default,
  },
  listRowSelected: {
    borderColor: colors.border.active,
    backgroundColor: colors.accent.primaryMuted,
  },
  listRowAdopted: {
    borderColor: colors.accent.green,
    opacity: 0.95,
  },
  listNameRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  addedBadge: {
    backgroundColor: colors.accent.greenMuted,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.sm,
  },
  addedBadgeText: {
    fontSize: typography.size.xs,
    fontWeight: typography.weight.semibold,
    color: colors.accent.green,
  },
  listIcon: {
    fontSize: 28,
    marginRight: spacing.md,
  },
  listBody: {
    flex: 1,
    minWidth: 0,
  },
  listName: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.semibold,
    color: colors.text.primary,
    lineHeight: 22,
  },
  listMeta: {
    fontSize: typography.size.sm,
    color: colors.text.secondary,
    marginTop: 4,
    lineHeight: 18,
  },
  listChevron: {
    fontSize: typography.size.xl,
    color: colors.text.muted,
    marginLeft: spacing.sm,
    fontWeight: typography.weight.bold,
  },
  sectionSub: {
    fontSize: typography.size.sm,
    color: colors.text.secondary,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.sm,
    lineHeight: 20,
  },
  sectionSubFirst: {
    marginTop: spacing.xs,
  },
  modeRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  modeChip: {
    flex: 1,
    ...forms.chip,
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  modeChipActive: forms.chipActive,
  modeChipText: {
    ...forms.chipText,
    fontSize: typography.size.md,
  },
  modeChipTextActive: {
    ...forms.chipTextActive,
    fontSize: typography.size.md,
  },
  btHelpCard: {
    backgroundColor: colors.bg.elevated,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  btHint: {
    fontSize: typography.size.sm,
    color: colors.text.secondary,
    lineHeight: 22,
  },
  detailAdoptedHint: {
    fontSize: typography.size.md,
    color: colors.accent.green,
    lineHeight: 22,
    textAlign: 'center',
    paddingVertical: spacing.sm,
  },
  progressText: {
    textAlign: 'center',
    marginTop: spacing.sm,
    fontSize: typography.size.sm,
    color: colors.accent.primary,
    fontWeight: typography.weight.medium,
  },
  chart: {
    alignSelf: 'center',
    marginBottom: spacing.md,
    backgroundColor: colors.bg.card,
    borderRadius: radius.xxl,
    borderWidth: 1,
    borderColor: colors.border.default,
    overflow: 'hidden',
    ...shadows.md,
  },
  stars: {
    ...StyleSheet.absoluteFill,
  },
  star: {
    position: 'absolute',
    width: 2,
    height: 2,
    borderRadius: 1,
    backgroundColor: colors.text.primary,
  },
  orbitRing: {
    position: 'absolute',
    left: CENTER - ORBIT_OUTER,
    top: CENTER - ORBIT_OUTER,
    borderRadius: ORBIT_OUTER,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    borderStyle: 'dashed',
  },
  orbitRingInner: {
    left: CENTER - ORBIT_INNER,
    top: CENTER - ORBIT_INNER,
    borderRadius: ORBIT_INNER,
    borderColor: 'rgba(91, 141, 239, 0.12)',
  },
  pulseRing: {
    position: 'absolute',
    left: 0,
    top: 0,
    borderWidth: 2,
    borderColor: colors.accent.primary,
  },
  centerSun: {
    position: 'absolute',
    left: CENTER - CENTER_RADIUS - 8,
    top: CENTER - CENTER_RADIUS - 20,
    width: (CENTER_RADIUS + 8) * 2,
    alignItems: 'center',
    zIndex: 2,
  },
  sunCore: {
    width: CENTER_RADIUS * 2,
    height: CENTER_RADIUS * 2,
    borderRadius: CENTER_RADIUS,
    backgroundColor: colors.accent.primaryMuted,
    borderWidth: 2,
    borderColor: colors.border.active,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.glow,
  },
  sunIcon: {
    fontSize: 28,
  },
  sunLabel: {
    marginTop: spacing.xs,
    fontSize: typography.size.xs,
    fontWeight: typography.weight.bold,
    color: colors.text.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  sunScan: {
    fontSize: typography.size.xs,
    color: colors.accent.primary,
    marginTop: 2,
  },
  sunHint: {
    fontSize: typography.size.xs,
    color: colors.text.muted,
    marginTop: 2,
  },
  orbitLayer: {
    ...StyleSheet.absoluteFill,
  },
  planetWrap: {
    position: 'absolute',
    width: PLANET_RADIUS * 2,
    height: PLANET_RADIUS * 2,
  },
  planet: {
    width: PLANET_RADIUS * 2,
    height: PLANET_RADIUS * 2,
    borderRadius: PLANET_RADIUS,
    backgroundColor: colors.bg.elevated,
    borderWidth: 1.5,
    borderColor: colors.border.default,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.sm,
  },
  planetSelected: {
    borderColor: colors.accent.primary,
    backgroundColor: colors.accent.primaryMuted,
    ...shadows.glow,
  },
  planetIcon: {
    fontSize: 26,
  },
  emptyOrbit: {
    position: 'absolute',
    bottom: spacing.lg,
    left: spacing.md,
    right: spacing.md,
    textAlign: 'center',
    fontSize: typography.size.sm,
    color: colors.text.secondary,
    lineHeight: 20,
  },
  detailCard: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    padding: spacing.lg,
    backgroundColor: colors.bg.elevated,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border.active,
  },
  detailName: {
    fontSize: typography.size.xl,
    fontWeight: typography.weight.bold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
    lineHeight: 26,
  },
  detailMeta: {
    fontSize: typography.size.md,
    color: colors.text.secondary,
    marginBottom: spacing.md,
    lineHeight: 22,
  },
  detailActions: {
    flexDirection: 'column',
    gap: spacing.sm,
  },
  adoptBtn: {
    backgroundColor: colors.accent.primary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.lg,
    alignItems: 'center',
    minHeight: 48,
    justifyContent: 'center',
  },
  adoptText: {
    color: '#FFFFFF',
    fontSize: typography.size.md,
    fontWeight: typography.weight.semibold,
  },
  dismissBtn: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderColor: colors.border.default,
    alignItems: 'center',
    minHeight: 48,
    justifyContent: 'center',
  },
  dismissText: {
    color: colors.text.secondary,
    fontSize: typography.size.md,
    fontWeight: typography.weight.medium,
  },
  controls: {
    paddingHorizontal: spacing.lg,
  },
  fieldLabel: {
    fontSize: typography.size.sm,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
    fontWeight: typography.weight.semibold,
    letterSpacing: typography.letterSpacing.wide,
  },
  input: {
    ...forms.input,
    marginBottom: spacing.sm,
  },
  scanningRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
    minHeight: 48,
  },
  scanBtn: {
    ...forms.btnPrimary,
    ...shadows.md,
  },
  scanBtnText: forms.btnPrimaryText,
  stopBtn: {
    ...forms.btnPrimary,
    backgroundColor: colors.bg.elevated,
    borderWidth: 1.5,
    borderColor: colors.border.active,
    ...shadows.sm,
  },
  stopBtnText: {
    ...forms.btnPrimaryText,
    color: colors.accent.primary,
  },
});
