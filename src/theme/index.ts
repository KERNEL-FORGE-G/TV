export const colors = {
  bg: {
    primary: '#0A0A0A',
    secondary: '#111111',
    card: '#161616',
    elevated: '#1E1E1E',
    input: '#1A1A1A',
  },
  accent: {
    blue: '#3B8BEB',
    blueLight: '#5BA3FF',
    red: '#E24B4A',
    green: '#1D9E75',
    amber: '#EF9F27',
  },
  text: {
    primary: '#F0F0F0',
    secondary: '#888888',
    muted: '#444444',
    inverse: '#0A0A0A',
  },
  border: {
    default: '#222222',
    active: '#3B8BEB',
    subtle: '#1A1A1A',
  },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
};

export const radius = {
  sm: 6,
  md: 10,
  lg: 16,
  xl: 24,
  full: 9999,
};

export const typography = {
  fontFamily: {
    regular: 'System',
    mono: 'Courier',
  },
  size: {
    xs: 10,
    sm: 12,
    md: 14,
    lg: 16,
    xl: 20,
    xxl: 24,
    display: 32,
  },
  weight: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
};
