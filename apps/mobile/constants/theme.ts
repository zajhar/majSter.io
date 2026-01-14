/**
 * Theme constants for the app.
 * Centralized colors, spacing, and typography.
 */

import { Platform } from 'react-native'

// Brand colors - OdFachowca "Blue Collar Tech" palette
export const colors = {
  // Primary - Blueprint Blue
  primary: {
    DEFAULT: '#2563EB',
    50: '#EFF6FF',
    100: '#DBEAFE',
    200: '#BFDBFE',
    300: '#93C5FD',
    400: '#60A5FA',
    500: '#3B82F6',
    600: '#2563EB',
    700: '#1D4ED8',
    800: '#1E40AF',
    900: '#1E3A8A',
  },
  // Tool Accent - Laser Amber (DeWalt-inspired)
  tool: {
    DEFAULT: '#F59E0B',
    50: '#FFFBEB',
    100: '#FEF3C7',
    200: '#FDE68A',
    300: '#FCD34D',
    400: '#FBBF24',
    500: '#F59E0B',
    600: '#D97706',
    700: '#B45309',
    800: '#92400E',
    900: '#78350F',
  },
  // Legacy accent alias (for gradual migration)
  accent: {
    DEFAULT: '#F59E0B',
    50: '#FFFBEB',
    100: '#FEF3C7',
    200: '#FDE68A',
    300: '#FCD34D',
    400: '#FBBF24',
    500: '#F59E0B',
    600: '#D97706',
    700: '#B45309',
    800: '#92400E',
    900: '#78350F',
  },
  // Canvas
  background: '#F1F5F9',  // Concrete Mist (slate-100)
  surface: '#FFFFFF',     // Paper White
  // Text
  text: {
    heading: '#0F172A',   // Heavy Metal (slate-900)
    body: '#475569',      // slate-600
    muted: '#64748B',     // Steel Gray (slate-500)
  },
  border: '#CBD5E1',      // slate-300
  // Functional
  success: {
    DEFAULT: '#059669',   // Profit Green (emerald-600)
    50: '#ECFDF5',
    100: '#D1FAE5',
    500: '#10B981',
    600: '#059669',
    700: '#047857',
  },
  warning: {
    DEFAULT: '#F59E0B',   // Same as tool (amber-500)
    50: '#FFFBEB',
    100: '#FEF3C7',
    500: '#F59E0B',
    600: '#D97706',
    700: '#B45309',
  },
  error: {
    DEFAULT: '#DC2626',   // Stop Red (red-600)
    50: '#FEF2F2',
    100: '#FEE2E2',
    500: '#EF4444',
    600: '#DC2626',
    700: '#B91C1C',
  },
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',
} as const

// Semantic colors for light/dark mode - Blue Collar Tech
export const Colors = {
  light: {
    text: colors.text.heading,
    textSecondary: colors.text.body,
    textMuted: colors.text.muted,
    background: colors.background,
    backgroundSecondary: colors.surface,
    tint: colors.primary.DEFAULT,
    accent: colors.tool.DEFAULT,
    icon: colors.text.body,
    tabIconDefault: colors.text.muted,
    tabIconSelected: colors.primary.DEFAULT,
    border: colors.border,
    card: colors.surface,
  },
  dark: {
    text: '#F8FAFC',
    textSecondary: '#CBD5E1',
    textMuted: '#64748B',
    background: '#0F172A',
    backgroundSecondary: '#1E293B',
    tint: '#3B82F6',
    accent: colors.tool.DEFAULT,
    icon: '#94A3B8',
    tabIconDefault: '#64748B',
    tabIconSelected: '#3B82F6',
    border: '#334155',
    card: '#1E293B',
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
