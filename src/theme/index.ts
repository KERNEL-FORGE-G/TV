import { Platform, ViewStyle } from 'react-native';

/** Palette — fond sombre avec contraste lisible (champs & boutons) */
export const colors = {
  bg: {
    primary: '#080C14',
    secondary: '#0E1420',
    tertiary: '#141C2C',
    card: '#1A2438',
    elevated: '#243048',
    input: '#1C2840',
    overlay: 'rgba(8, 12, 20, 0.94)',
  },
  accent: {
    primary: '#6B9AFF',
    /** @deprecated utiliser primary */
    blue: '#6B9AFF',
    primaryMuted: 'rgba(107, 154, 255, 0.28)',
    primaryGlow: 'rgba(107, 154, 255, 0.45)',
    secondary: '#8B72FF',
    red: '#FF6B78',
    redMuted: 'rgba(255, 107, 120, 0.28)',
    green: '#4AE69A',
    greenMuted: 'rgba(74, 230, 154, 0.28)',
    amber: '#FFC040',
    cyan: '#6EECD8',
  },
  text: {
    primary: '#FFFFFF',
    secondary: '#C5D0E6',
    muted: '#8B9BB8',
    inverse: '#080C14',
  },
  border: {
    default: 'rgba(255, 255, 255, 0.16)',
    subtle: 'rgba(255, 255, 255, 0.1)',
    active: 'rgba(107, 154, 255, 0.75)',
    glass: 'rgba(255, 255, 255, 0.14)',
  },
  gradient: {
    topGlow: 'rgba(91, 141, 239, 0.12)',
    bottomFade: 'rgba(15, 22, 40, 0.8)',
  },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
};

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 22,
  xxl: 28,
  full: 9999,
};

export const typography = {
  size: {
    xs: 11,
    sm: 13,
    md: 15,
    lg: 17,
    xl: 22,
    xxl: 28,
    display: 34,
  },
  weight: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
  letterSpacing: {
    tight: -0.3,
    normal: 0,
    wide: 0.6,
    caps: 1.2,
  },
};

export const layout = {
  screenPadding: spacing.lg,
  tabBarHeight: 64,
  tabBarInset: 96,
  maxContentWidth: 480,
  sectionSpacing: spacing.lg,
  blockSpacing: spacing.md,
};

/** Durées et délais d’animation harmonisés */
export const motion = {
  duration: {
    fast: 180,
    normal: 320,
    slow: 480,
  },
  stagger: 55,
  spring: {
    press: { speed: 60, bounciness: 0 },
    release: { speed: 28, bounciness: 6 },
    enter: { tension: 72, friction: 11 },
  },
};

function shadow(elevation: number, opacity: number, radius: number): ViewStyle {
  return Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: elevation / 2 },
      shadowOpacity: opacity,
      shadowRadius: radius,
    },
    android: { elevation },
    default: {},
  }) as ViewStyle;
}

export const shadows = {
  sm: shadow(2, 0.2, 4),
  md: shadow(4, 0.28, 10),
  lg: shadow(8, 0.35, 18),
  glow: Platform.select({
    ios: {
      shadowColor: colors.accent.primary,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.45,
      shadowRadius: 14,
    },
    android: { elevation: 6 },
    default: {},
  }) as ViewStyle,
};

/** Styles réutilisables pour champs et boutons tactiles */
export const forms = {
  placeholderColor: '#9AADCC',
  input: {
    backgroundColor: colors.bg.input,
    borderWidth: 1.5,
    borderColor: colors.border.default,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    color: colors.text.primary,
    fontSize: typography.size.md,
    minHeight: 48,
  },
  inputSm: {
    minHeight: 40,
    paddingVertical: spacing.sm,
    fontSize: typography.size.sm,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radius.sm,
    borderWidth: 1.5,
    borderColor: colors.border.default,
    backgroundColor: colors.bg.elevated,
  },
  chipActive: {
    borderColor: colors.border.active,
    backgroundColor: colors.accent.primaryMuted,
  },
  chipText: {
    fontSize: typography.size.sm,
    color: colors.text.secondary,
    fontWeight: typography.weight.medium,
  },
  chipTextActive: {
    color: colors.text.primary,
    fontWeight: typography.weight.semibold,
  },
  btnPrimary: {
    backgroundColor: colors.accent.primary,
    borderRadius: radius.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    minHeight: 48,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  btnPrimaryText: {
    color: '#FFFFFF',
    fontSize: typography.size.md,
    fontWeight: typography.weight.semibold,
  },
  btnOutline: {
    backgroundColor: colors.accent.primaryMuted,
    borderWidth: 1.5,
    borderColor: colors.border.active,
    borderRadius: radius.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    minHeight: 48,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  btnOutlineText: {
    color: colors.text.primary,
    fontSize: typography.size.md,
    fontWeight: typography.weight.semibold,
  },
  btnGhost: {
    backgroundColor: colors.bg.elevated,
    borderWidth: 1.5,
    borderColor: colors.border.default,
    borderRadius: radius.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    minHeight: 48,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  btnGhostText: {
    color: colors.text.secondary,
    fontSize: typography.size.md,
    fontWeight: typography.weight.medium,
  },
};

/** Rétrocompatibilité */
export const legacyAccent = {
  blue: colors.accent.primary,
  blueLight: '#7BA8F7',
  red: colors.accent.red,
  green: colors.accent.green,
  amber: colors.accent.amber,
};
