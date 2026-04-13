export const Colors = {
  primary: '#6C63FF',
  primaryLight: '#8B85FF',
  primaryDark: '#4B44CC',
  secondary: '#00D4AA',
  secondaryLight: '#00F0C0',
  accent: '#FF6B6B',
  accentOrange: '#FF9F43',

  background: '#0A0F1E',
  backgroundCard: '#141929',
  backgroundElevated: '#1E2640',
  backgroundModal: '#1A2035',

  surface: '#1E2640',
  surfaceLight: '#252D47',
  surfaceBorder: '#2E3A5C',

  text: '#FFFFFF',
  textSecondary: '#A0AAC8',
  textMuted: '#5C6A8A',
  textInverse: '#0A0F1E',

  success: '#00D4AA',
  warning: '#FF9F43',
  error: '#FF6B6B',
  info: '#4ECDC4',

  visa: '#00D4AA',
  remote: '#6C63FF',

  gradient: {
    primary: ['#6C63FF', '#4B44CC'] as const,
    success: ['#00D4AA', '#00A882'] as const,
    card: ['#1E2640', '#141929'] as const,
    hero: ['#0A0F1E', '#141929', '#1E2640'] as const,
    purple: ['#6C63FF', '#9B59B6'] as const,
  },

  tabBar: {
    active: '#6C63FF',
    inactive: '#5C6A8A',
    background: '#0D1326',
    border: '#1E2640',
  },

  dark: {
    100: '#0A0F1E',
    200: '#0D1326',
    300: '#141929',
    400: '#1A2035',
    500: '#1E2640',
    600: '#252D47',
    700: '#2E3A5C',
  },
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const Radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 999,
};

export const FontSize = {
  xs: 11,
  sm: 13,
  md: 15,
  lg: 17,
  xl: 20,
  xxl: 24,
  xxxl: 30,
  display: 38,
};

export const Shadow = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  md: {
    shadowColor: '#6C63FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  lg: {
    shadowColor: '#6C63FF',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
};
