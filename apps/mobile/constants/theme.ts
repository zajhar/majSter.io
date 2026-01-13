/**
 * Theme constants for the app.
 * Centralized colors, spacing, and typography.
 */

import { Platform } from 'react-native'

// Brand colors - OdFachowca palette
export const colors = {
  primary: {
    DEFAULT: '#3B5EDB',
    50: '#EEF2FD',
    100: '#D8E1FA',
    200: '#B4C5F5',
    300: '#8BA4EF',
    400: '#6383E7',
    500: '#3B5EDB',
    600: '#2A4BC4',
    700: '#1F389A',
    800: '#162870',
    900: '#0E1A4A',
  },
  accent: {
    DEFAULT: '#DA7756',
    50: '#FDF5F2',
    100: '#FAE8E2',
    200: '#F5D0C5',
    300: '#EDB5A3',
    400: '#E4967B',
    500: '#DA7756',
    600: '#C55E3D',
    700: '#9D4A2F',
    800: '#753722',
    900: '#4D2516',
  },
  background: '#F8F6F3',
  surface: '#FFFFFF',
  text: {
    heading: '#1A2B4A',
    body: '#64748B',
    muted: '#94A3B8',
  },
  border: '#E2E8F0',
  success: {
    DEFAULT: '#0EA5A0',
    50: '#ECFDFB',
    100: '#D1FAF7',
    500: '#0EA5A0',
    600: '#0B8480',
    700: '#086361',
  },
  warning: {
    DEFAULT: '#D69E2E',
    50: '#FFFBEB',
    100: '#FEF3C7',
    500: '#D69E2E',
    600: '#B78426',
    700: '#946A1E',
  },
  error: {
    DEFAULT: '#DC2626',
    50: '#FEF2F2',
    100: '#FEE2E2',
    500: '#DC2626',
    600: '#B91C1C',
    700: '#991B1B',
  },
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',
} as const

// Semantic colors for light/dark mode - OdFachowca
export const Colors = {
  light: {
    text: colors.text.heading,
    textSecondary: colors.text.body,
    textMuted: colors.text.muted,
    background: colors.background,
    backgroundSecondary: colors.surface,
    tint: colors.primary.DEFAULT,
    accent: colors.accent.DEFAULT,
    icon: colors.text.body,
    tabIconDefault: colors.text.muted,
    tabIconSelected: colors.primary.DEFAULT,
    border: colors.border,
    card: colors.surface,
  },
  dark: {
    text: '#F8F6F3',
    textSecondary: '#94A3B8',
    textMuted: '#64748B',
    background: '#1A2B4A',
    backgroundSecondary: '#243B5C',
    tint: '#FFFFFF',
    accent: colors.accent.DEFAULT,
    icon: '#94A3B8',
    tabIconDefault: '#64748B',
    tabIconSelected: '#FFFFFF',
    border: '#3B5066',
    card: '#243B5C',
  },
}

// Spacing scale
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
} as const

// Border radius scale - OdFachowca soft & rounded
export const borderRadius = {
  none: 0,
  sm: 4,
  md: 8,       // inputs
  lg: 12,      // buttons
  xl: 16,      // cards, modals
  xxl: 24,
  full: 9999,  // chips, avatars
} as const

// Font sizes
export const fontSize = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 20,
  xxl: 24,
  xxxl: 32,
} as const

// Font weights
export const fontWeight = {
  normal: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
}

// Shadow styles - OdFachowca
export const shadows = {
  sm: {
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  md: {
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  lg: {
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 5,
  },
}

// Font family - OdFachowca uses Nunito
export const fontFamily = {
  regular: 'Nunito-Regular',
  medium: 'Nunito-Medium',
  semibold: 'Nunito-SemiBold',
  bold: 'Nunito-Bold',
} as const

// Typography scale - Mobile
export const typography = {
  h1: {
    fontFamily: fontFamily.bold,
    fontSize: 28,
    lineHeight: 34,
  },
  h2: {
    fontFamily: fontFamily.semibold,
    fontSize: 22,
    lineHeight: 29,
  },
  h3: {
    fontFamily: fontFamily.semibold,
    fontSize: 18,
    lineHeight: 23,
  },
  body: {
    fontFamily: fontFamily.regular,
    fontSize: 16,
    lineHeight: 24,
  },
  small: {
    fontFamily: fontFamily.regular,
    fontSize: 14,
    lineHeight: 21,
  },
  caption: {
    fontFamily: fontFamily.regular,
    fontSize: 12,
    lineHeight: 17,
  },
} as const

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
})
