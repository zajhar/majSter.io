# Branding v2.0 "Blue Collar Tech" - Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Update mobile app from soft/friendly v1.0 branding to professional "Blue Collar Tech" v2.0 aesthetic.

**Architecture:** Centralized theme update in `constants/theme.ts`, then propagate changes to all components. Font change from Nunito to Inter. No structural changes - just color/font/radius values.

**Tech Stack:** React Native, Expo, expo-font, @expo-google-fonts/inter

---

## Summary of Changes

| Element | v1.0 (Current) | v2.0 (Target) |
|---------|----------------|---------------|
| Primary | #3B5EDB | #2563EB (Blueprint Blue) |
| Accent | #DA7756 (Terracotta) | #F59E0B (Laser Amber) |
| Background | #F8F6F3 (Cream) | #F1F5F9 (Concrete Mist) |
| Text Heading | #1A2B4A | #0F172A (Heavy Metal) |
| Success | #0EA5A0 (Teal) | #059669 (Emerald) |
| Font | Nunito | Inter |
| Border Radius | 12px buttons, 16px cards | 8px buttons, 12px cards |

---

## Task 1: Update Theme Colors

**Files:**
- Modify: `apps/mobile/constants/theme.ts`

**Step 1: Replace color definitions**

Open `apps/mobile/constants/theme.ts` and replace the entire `colors` object:

```typescript
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
```

**Step 2: Update semantic Colors object**

In the same file, update the `Colors` export:

```typescript
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
```

**Step 3: Run TypeScript check**

Run: `cd apps/mobile && pnpm check-types`
Expected: No errors (colors structure unchanged)

**Step 4: Commit**

```bash
git add apps/mobile/constants/theme.ts
git commit -m "feat(mobile): update colors to Blue Collar Tech v2.0 palette"
```

---

## Task 2: Update Border Radius

**Files:**
- Modify: `apps/mobile/constants/theme.ts`

**Step 1: Update borderRadius values**

In `apps/mobile/constants/theme.ts`, replace `borderRadius`:

```typescript
// Border radius scale - Blue Collar Tech (precise, not soft)
export const borderRadius = {
  none: 0,
  sm: 4,       // checkboxes, tags
  md: 8,       // inputs, buttons, inner containers (was 8, buttons were 12)
  lg: 12,      // cards, modals, bottom sheets (was 16)
  xl: 16,      // special large cards
  xxl: 24,
  full: 9999,  // pills, avatars
} as const
```

**Step 2: Commit**

```bash
git add apps/mobile/constants/theme.ts
git commit -m "feat(mobile): tighten border radius for professional look"
```

---

## Task 3: Update Font Family to Inter

**Files:**
- Modify: `apps/mobile/constants/theme.ts`
- Modify: `apps/mobile/app/_layout.tsx`

**Step 1: Update fontFamily in theme.ts**

In `apps/mobile/constants/theme.ts`, replace `fontFamily`:

```typescript
// Font family - Blue Collar Tech uses Inter
export const fontFamily = {
  regular: 'Inter-Regular',
  medium: 'Inter-Medium',
  semibold: 'Inter-SemiBold',
  bold: 'Inter-Bold',
} as const
```

**Step 2: Update typography scale**

In the same file, update `typography` to match v2.0 spec:

```typescript
// Typography scale - Blue Collar Tech
export const typography = {
  displayXL: {
    fontFamily: fontFamily.bold,
    fontSize: 32,
    lineHeight: 38,
  },
  h1: {
    fontFamily: fontFamily.bold,
    fontSize: 24,
    lineHeight: 31,
  },
  h2: {
    fontFamily: fontFamily.semibold,
    fontSize: 20,
    lineHeight: 28,
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
  bodyBold: {
    fontFamily: fontFamily.medium,
    fontSize: 16,
    lineHeight: 24,
  },
  small: {
    fontFamily: fontFamily.regular,
    fontSize: 14,
    lineHeight: 21,
  },
  caption: {
    fontFamily: fontFamily.medium,
    fontSize: 13,
    lineHeight: 18,
  },
  techLabel: {
    fontFamily: fontFamily.bold,
    fontSize: 11,
    lineHeight: 11,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
  },
} as const
```

**Step 3: Enable Inter font loading in _layout.tsx**

Open `apps/mobile/app/_layout.tsx` and update font loading:

```typescript
import { useFonts } from 'expo-font'
// Remove or comment out: import { useFonts } from '@expo-google-fonts/nunito'

// Inside RootLayout function, replace the font loading:
const [fontsLoaded] = useFonts({
  'Inter-Regular': require('@expo-google-fonts/inter/Inter_400Regular.ttf'),
  'Inter-Medium': require('@expo-google-fonts/inter/Inter_500Medium.ttf'),
  'Inter-SemiBold': require('@expo-google-fonts/inter/Inter_600SemiBold.ttf'),
  'Inter-Bold': require('@expo-google-fonts/inter/Inter_700Bold.ttf'),
})

// Remove the temporary bypass:
// const fontsLoaded = true
```

**Step 4: Run app to verify fonts load**

Run: `cd apps/mobile && pnpm dev`
Expected: App loads with Inter font (check any text element)

**Step 5: Commit**

```bash
git add apps/mobile/constants/theme.ts apps/mobile/app/_layout.tsx
git commit -m "feat(mobile): switch from Nunito to Inter font"
```

---

## Task 4: Update docs/brand/colors.json

**Files:**
- Modify: `docs/brand/colors.json`

**Step 1: Replace colors.json content**

```json
{
  "version": "2.0",
  "name": "Blue Collar Tech",
  "colors": {
    "primary": {
      "value": "#2563EB",
      "rgb": "37, 99, 235",
      "name": "Blueprint Blue",
      "tailwind": "blue-600",
      "usage": "Primary buttons, active tabs, links, focus borders"
    },
    "tool": {
      "value": "#F59E0B",
      "rgb": "245, 158, 11",
      "name": "Laser Amber",
      "tailwind": "amber-500",
      "usage": "Measurement icons, m² badges, status 'W toku', tool accents"
    },
    "background": {
      "value": "#F1F5F9",
      "rgb": "241, 245, 249",
      "name": "Concrete Mist",
      "tailwind": "slate-100",
      "usage": "Main app background"
    },
    "surface": {
      "value": "#FFFFFF",
      "rgb": "255, 255, 255",
      "name": "Paper White",
      "usage": "Cards, modals, inputs"
    },
    "text": {
      "heading": {
        "value": "#0F172A",
        "name": "Heavy Metal",
        "tailwind": "slate-900",
        "usage": "Headings, main text, header background"
      },
      "body": {
        "value": "#475569",
        "name": "Slate",
        "tailwind": "slate-600",
        "usage": "Body text"
      },
      "muted": {
        "value": "#64748B",
        "name": "Steel Gray",
        "tailwind": "slate-500",
        "usage": "Helper text, inactive icons, metadata"
      }
    },
    "status": {
      "success": {
        "value": "#059669",
        "name": "Profit Green",
        "tailwind": "emerald-600",
        "usage": "Money totals, 'Zaakceptowane' status, success states"
      },
      "warning": {
        "value": "#F59E0B",
        "name": "Laser Amber",
        "tailwind": "amber-500",
        "usage": "Offline indicator, 'W toku' status"
      },
      "error": {
        "value": "#DC2626",
        "name": "Stop Red",
        "tailwind": "red-600",
        "usage": "Delete actions, errors, 'Odrzucona' status"
      }
    },
    "border": {
      "default": {
        "value": "#CBD5E1",
        "tailwind": "slate-300"
      },
      "focus": {
        "value": "#2563EB",
        "tailwind": "blue-600"
      },
      "measurement": {
        "value": "#F59E0B",
        "tailwind": "amber-500"
      }
    }
  },
  "typography": {
    "font": "Inter",
    "source": "Google Fonts"
  },
  "tailwind": {
    "extend": {
      "colors": {
        "primary": {
          "DEFAULT": "#2563EB",
          "dark": "#1E3A8A"
        },
        "tool": {
          "DEFAULT": "#F59E0B",
          "dark": "#B45309"
        },
        "canvas": {
          "DEFAULT": "#F1F5F9",
          "paper": "#FFFFFF"
        }
      }
    }
  }
}
```

**Step 2: Commit**

```bash
git add docs/brand/colors.json
git commit -m "docs: update colors.json to Blue Collar Tech v2.0"
```

---

## Task 5: Update ErrorBoundary Component

**Files:**
- Modify: `apps/mobile/components/ErrorBoundary.tsx`

**Step 1: Update button to use primary instead of accent**

In `apps/mobile/components/ErrorBoundary.tsx`, update the `retryButton` and `retryButtonPressed` styles:

```typescript
retryButton: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: colors.primary.DEFAULT,  // Changed from accent
  paddingVertical: 12,
  paddingHorizontal: 24,
  borderRadius: borderRadius.md,  // Changed from lg (8px instead of 12px)
  gap: 8,
  ...shadows.sm,
},
retryButtonPressed: {
  backgroundColor: colors.primary[700],  // Changed from accent[600]
},
```

**Step 2: Run TypeScript check**

Run: `cd apps/mobile && pnpm check-types`
Expected: No errors

**Step 3: Commit**

```bash
git add apps/mobile/components/ErrorBoundary.tsx
git commit -m "feat(mobile): update ErrorBoundary to v2.0 styling"
```

---

## Task 6: Update OfflineIndicator Component

**Files:**
- Modify: `apps/mobile/components/ui/OfflineIndicator.tsx`

**Step 1: Update to use tool color for warning state**

The warning color is now same as tool (amber). Verify in `apps/mobile/components/ui/OfflineIndicator.tsx`:

```typescript
// Line 54 should already use colors.warning.DEFAULT which is now #F59E0B
// No code change needed if using colors.warning.DEFAULT
```

**Step 2: Verify visually**

Run: `cd apps/mobile && pnpm dev`
Expected: Offline indicator shows amber color when offline

**Step 3: Commit (if changes made)**

```bash
git add apps/mobile/components/ui/OfflineIndicator.tsx
git commit -m "feat(mobile): verify OfflineIndicator uses v2.0 amber"
```

---

## Task 7: Update Tab Bar Colors

**Files:**
- Modify: `apps/mobile/app/(tabs)/_layout.tsx`

**Step 1: Read current file**

Read `apps/mobile/app/(tabs)/_layout.tsx` to see current tab bar styling.

**Step 2: Update tab bar to use v2.0 colors**

Ensure tab bar uses:
- Active: `colors.primary.DEFAULT` (#2563EB)
- Inactive: `colors.text.muted` (#64748B)
- Background: `colors.surface` (#FFFFFF)

**Step 3: Commit**

```bash
git add apps/mobile/app/(tabs)/_layout.tsx
git commit -m "feat(mobile): update tab bar to v2.0 colors"
```

---

## Task 8: Update Quote Step Components

**Files:**
- Modify: `apps/mobile/components/quote/StepClient.tsx`
- Modify: `apps/mobile/components/quote/StepServices.tsx`
- Modify: `apps/mobile/components/quote/StepGroups.tsx`
- Modify: `apps/mobile/components/quote/StepMaterials.tsx`
- Modify: `apps/mobile/components/quote/StepPreview.tsx`
- Modify: `apps/mobile/components/quote/AddClientBottomSheet.tsx`

**Step 1: Audit each file for old color references**

Search for:
- `colors.accent` → should map to `colors.tool` (amber)
- `borderRadius.lg` for buttons → change to `borderRadius.md` (8px)
- Any hardcoded old hex values

**Step 2: Update button styles consistently**

Primary buttons should use:
```typescript
backgroundColor: colors.primary.DEFAULT,
borderRadius: borderRadius.md,
```

Secondary/tool buttons should use:
```typescript
backgroundColor: colors.tool.DEFAULT,
// or for text on amber background:
color: colors.tool[700],  // #B45309 for WCAG contrast
```

**Step 3: Run app and visually verify each screen**

Run: `cd apps/mobile && pnpm dev`
Navigate through quote creation flow.
Expected: All buttons blue, tool accents amber, consistent 8px radius on buttons.

**Step 4: Commit**

```bash
git add apps/mobile/components/quote/
git commit -m "feat(mobile): update quote components to v2.0 styling"
```

---

## Task 9: Update Auth Screens

**Files:**
- Modify: `apps/mobile/app/(auth)/login.tsx`
- Modify: `apps/mobile/app/(auth)/register.tsx`

**Step 1: Update primary button colors**

Ensure login/register buttons use:
```typescript
backgroundColor: colors.primary.DEFAULT,
borderRadius: borderRadius.md,
```

**Step 2: Update background**

Ensure screen background uses `colors.background` (#F1F5F9).

**Step 3: Commit**

```bash
git add apps/mobile/app/(auth)/
git commit -m "feat(mobile): update auth screens to v2.0 styling"
```

---

## Task 10: Update Dashboard and List Screens

**Files:**
- Modify: `apps/mobile/app/(tabs)/index.tsx`
- Modify: `apps/mobile/app/(tabs)/quotes/index.tsx`
- Modify: `apps/mobile/app/(tabs)/quotes/[id].tsx`
- Modify: `apps/mobile/app/(tabs)/clients/index.tsx`
- Modify: `apps/mobile/app/(tabs)/clients/create.tsx`
- Modify: `apps/mobile/app/(tabs)/clients/[id].tsx`

**Step 1: Update FAB (Floating Action Button)**

FAB should use:
```typescript
backgroundColor: colors.primary.DEFAULT,
borderRadius: 28,  // Half of 56px
// Stronger shadow for FAB
...shadows.lg,
```

**Step 2: Update card radius**

Cards should use `borderRadius.lg` (12px).

**Step 3: Update status indicators**

Add left stripe pattern for status:
```typescript
// Success status
borderLeftWidth: 4,
borderLeftColor: colors.success.DEFAULT,

// Pending/Draft status
borderLeftWidth: 4,
borderLeftColor: colors.tool.DEFAULT,

// Sent status
borderLeftWidth: 4,
borderLeftColor: colors.primary.DEFAULT,
```

**Step 4: Commit**

```bash
git add apps/mobile/app/(tabs)/
git commit -m "feat(mobile): update dashboard and list screens to v2.0 styling"
```

---

## Task 11: Update Settings Screens

**Files:**
- Modify: `apps/mobile/app/(tabs)/settings/index.tsx`
- And related settings screens

**Step 1: Verify settings use theme colors**

Settings should already import from theme.ts, so colors should update automatically.

**Step 2: Visually verify**

Run app and check settings screens look consistent.

**Step 3: Commit if changes needed**

```bash
git add apps/mobile/app/(tabs)/settings/
git commit -m "feat(mobile): verify settings screens use v2.0 styling"
```

---

## Task 12: Run Full Test Suite

**Step 1: Run tests**

Run: `cd apps/mobile && pnpm test`
Expected: All tests pass

**Step 2: Fix any snapshot failures**

If snapshot tests fail due to color/font changes, update snapshots:
```bash
pnpm test -- -u
```

**Step 3: Commit test updates**

```bash
git add apps/mobile/
git commit -m "test(mobile): update snapshots for v2.0 branding"
```

---

## Task 13: Update docs/brand/brand-guide.md

**Files:**
- Modify: `docs/brand/brand-guide.md`

**Step 1: Replace with v2.0 content**

Link to or copy content from `docs/plans/2026-01-14-branding-v2-design.md`.

**Step 2: Commit**

```bash
git add docs/brand/brand-guide.md
git commit -m "docs: update brand guide to Blue Collar Tech v2.0"
```

---

## Task 14: Final Visual QA

**Step 1: Run app on iOS simulator**

```bash
cd apps/mobile && pnpm ios
```

**Step 2: Run app on Android emulator**

```bash
cd apps/mobile && pnpm android
```

**Step 3: Visual checklist**

- [ ] Background is Concrete Mist (#F1F5F9), not cream
- [ ] Primary buttons are Blueprint Blue (#2563EB)
- [ ] Tool accents are Laser Amber (#F59E0B)
- [ ] Text is darker (Heavy Metal #0F172A)
- [ ] Font is Inter, not Nunito
- [ ] Button radius is 8px, not 12px
- [ ] Card radius is 12px, not 16px
- [ ] Success states are emerald green, not teal

**Step 4: Final commit**

```bash
git add .
git commit -m "feat(mobile): complete Blue Collar Tech v2.0 branding update"
```

---

## Files Summary

### Core Theme Files
- `apps/mobile/constants/theme.ts` - All color, font, radius definitions
- `apps/mobile/app/_layout.tsx` - Font loading

### Component Files (9 files)
- `apps/mobile/components/ErrorBoundary.tsx`
- `apps/mobile/components/ui/OfflineIndicator.tsx`
- `apps/mobile/components/ui/SyncErrorBanner.tsx`
- `apps/mobile/components/quote/StepClient.tsx`
- `apps/mobile/components/quote/StepServices.tsx`
- `apps/mobile/components/quote/StepGroups.tsx`
- `apps/mobile/components/quote/StepMaterials.tsx`
- `apps/mobile/components/quote/StepPreview.tsx`
- `apps/mobile/components/quote/AddClientBottomSheet.tsx`

### Screen Files (~15 files)
- `apps/mobile/app/(auth)/login.tsx`
- `apps/mobile/app/(auth)/register.tsx`
- `apps/mobile/app/(tabs)/_layout.tsx`
- `apps/mobile/app/(tabs)/index.tsx`
- `apps/mobile/app/(tabs)/quotes/index.tsx`
- `apps/mobile/app/(tabs)/quotes/[id].tsx`
- `apps/mobile/app/(tabs)/clients/index.tsx`
- `apps/mobile/app/(tabs)/clients/create.tsx`
- `apps/mobile/app/(tabs)/clients/[id].tsx`
- `apps/mobile/app/(tabs)/settings/index.tsx`
- `apps/mobile/app/quote/create.tsx`

### Documentation Files
- `docs/brand/colors.json`
- `docs/brand/brand-guide.md`
