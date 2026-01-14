# Mobile App Rebranding - OdFachowca Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Zaktualizować design aplikacji mobilnej zgodnie z nowym brandingiem OdFachowca - nowe kolory, typografia Nunito, zaokrąglone UI, kremowe tło.

**Architecture:** Centralizacja kolorów w `theme.ts`, load fontu Nunito przez expo-font, aktualizacja wszystkich komponentów i ekranów do nowej palety kolorów i stylu UI.

**Tech Stack:** React Native, Expo, expo-font (Nunito), Zustand, Expo Router

---

## Podsumowanie zmian

### Przed (Majsterio)
- Kolory: #2563eb (niebieski Tailwind), #f5f5f5 (szare tło)
- Font: System fonts
- Border radius: 12px
- Nazwa: "Majsterio"

### Po (OdFachowca)
- Primary: #3B5EDB (żywy niebieski)
- Accent/CTA: #DA7756 (terracotta)
- Background: #F8F6F3 (kremowy papier)
- Surface: #FFFFFF
- Heading: #1A2B4A
- Body: #64748B
- Font: Nunito (Google Fonts przez expo-font)
- Border radius: 8-16px (soft & rounded)
- Nazwa: "OdFachowca"

---

## Task 1: Zaktualizować theme.ts z nowymi kolorami

**Files:**
- Modify: `apps/mobile/constants/theme.ts`

**Step 1: Zaktualizować kolory brand**

```typescript
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
```

**Step 2: Zaktualizować Colors light/dark**

```typescript
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
```

**Step 3: Zaktualizować border radius**

```typescript
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
```

**Step 4: Dodać shadows zgodne z brand**

```typescript
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
```

**Step 5: Uruchomić type check**

Run: `cd apps/mobile && pnpm check-types`
Expected: PASS (no errors)

**Step 6: Commit**

```bash
git add apps/mobile/constants/theme.ts
git commit -m "feat(mobile): update theme.ts with OdFachowca brand colors

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

---

## Task 2: Załadować font Nunito przez expo-font

**Files:**
- Create: `apps/mobile/hooks/useFonts.ts`
- Modify: `apps/mobile/app/_layout.tsx`

**Step 1: Stworzyć hook useFonts**

```typescript
// apps/mobile/hooks/useFonts.ts
import { useFonts as useExpoFonts } from 'expo-font'

export function useFonts() {
  const [fontsLoaded, fontError] = useExpoFonts({
    'Nunito-Regular': require('../assets/fonts/Nunito-Regular.ttf'),
    'Nunito-Medium': require('../assets/fonts/Nunito-Medium.ttf'),
    'Nunito-SemiBold': require('../assets/fonts/Nunito-SemiBold.ttf'),
    'Nunito-Bold': require('../assets/fonts/Nunito-Bold.ttf'),
  })

  return { fontsLoaded, fontError }
}
```

**Step 2: Pobrać fonty Nunito**

Run: `mkdir -p apps/mobile/assets/fonts`

Fonty do pobrania z Google Fonts (Nunito):
- Nunito-Regular.ttf (400)
- Nunito-Medium.ttf (500)
- Nunito-SemiBold.ttf (600)
- Nunito-Bold.ttf (700)

Run: `cd apps/mobile/assets/fonts && curl -L "https://github.com/googlefonts/nunito/raw/main/fonts/variable/Nunito%5Bwght%5D.ttf" -o Nunito-Variable.ttf`

Alternatywnie użyć expo-google-fonts:
Run: `cd apps/mobile && pnpm add @expo-google-fonts/nunito`

**Step 3: Zaktualizować _layout.tsx z ładowaniem fontów**

```typescript
// Dodać na początku pliku
import { useFonts } from 'expo-font'

// W komponencie RootLayout
const [fontsLoaded] = useFonts({
  'Nunito-Regular': require('@expo-google-fonts/nunito/Nunito_400Regular.ttf'),
  'Nunito-Medium': require('@expo-google-fonts/nunito/Nunito_500Medium.ttf'),
  'Nunito-SemiBold': require('@expo-google-fonts/nunito/Nunito_600SemiBold.ttf'),
  'Nunito-Bold': require('@expo-google-fonts/nunito/Nunito_700Bold.ttf'),
})

// Zaktualizować warunek ładowania
if (isLoading || !fontsLoaded) {
  return null
}
```

**Step 4: Zaktualizować Fonts w theme.ts**

```typescript
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
    lineHeight: 34, // 1.2
  },
  h2: {
    fontFamily: fontFamily.semibold,
    fontSize: 22,
    lineHeight: 29, // 1.3
  },
  h3: {
    fontFamily: fontFamily.semibold,
    fontSize: 18,
    lineHeight: 23, // 1.3
  },
  body: {
    fontFamily: fontFamily.regular,
    fontSize: 16,
    lineHeight: 24, // 1.5
  },
  small: {
    fontFamily: fontFamily.regular,
    fontSize: 14,
    lineHeight: 21, // 1.5
  },
  caption: {
    fontFamily: fontFamily.regular,
    fontSize: 12,
    lineHeight: 17, // 1.4
  },
} as const
```

**Step 5: Uruchomić aplikację i zweryfikować**

Run: `cd apps/mobile && pnpm dev`
Expected: Aplikacja startuje bez błędów, font Nunito jest widoczny

**Step 6: Commit**

```bash
git add apps/mobile/
git commit -m "feat(mobile): add Nunito font loading via expo-google-fonts

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

---

## Task 3: Zaktualizować ekran logowania (login.tsx)

**Files:**
- Modify: `apps/mobile/app/(auth)/login.tsx`

**Step 1: Zaktualizować import theme**

```typescript
import { colors, Colors, fontFamily, borderRadius, shadows, typography } from '../../constants/theme'
```

**Step 2: Zaktualizować logo i nazwę**

```typescript
{/* Logo */}
<View style={styles.logoContainer}>
  <View style={styles.logoIcon}>
    <Text style={styles.logoF}>F</Text>
  </View>
  <View style={styles.logoTextContainer}>
    <Text style={styles.logoOd}>Od</Text>
    <Text style={styles.logoFachowca}>Fachowca</Text>
  </View>
  <Text style={styles.tagline}>Profesjonalne wyceny w 60 sekund</Text>
</View>
```

**Step 3: Zaktualizować StyleSheet**

```typescript
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 48,
  },
  logoIcon: {
    width: 72,
    height: 72,
    borderRadius: 20,
    backgroundColor: colors.primary.DEFAULT,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  logoF: {
    fontFamily: fontFamily.bold,
    fontSize: 40,
    color: colors.white,
  },
  logoTextContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  logoOd: {
    fontFamily: fontFamily.bold,
    fontSize: 32,
    color: colors.accent.DEFAULT,
  },
  logoFachowca: {
    fontFamily: fontFamily.bold,
    fontSize: 32,
    color: colors.text.heading,
  },
  tagline: {
    fontFamily: fontFamily.regular,
    fontSize: 16,
    color: colors.text.body,
    marginTop: 8,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    borderRadius: borderRadius.lg,
    gap: 12,
  },
  googleButtonText: {
    fontFamily: fontFamily.medium,
    fontSize: 16,
    color: colors.text.heading,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  dividerText: {
    fontFamily: fontFamily.regular,
    marginHorizontal: 16,
    color: colors.text.muted,
  },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    borderRadius: borderRadius.md,
    fontFamily: fontFamily.regular,
    fontSize: 16,
    color: colors.text.heading,
    marginBottom: 12,
  },
  loginButton: {
    backgroundColor: colors.accent.DEFAULT,
    padding: 16,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    marginTop: 8,
  },
  loginButtonDisabled: {
    opacity: 0.7,
  },
  loginButtonText: {
    color: colors.white,
    fontFamily: fontFamily.semibold,
    fontSize: 18,
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  registerText: {
    fontFamily: fontFamily.regular,
    color: colors.text.body,
  },
  registerLink: {
    fontFamily: fontFamily.medium,
    color: colors.primary.DEFAULT,
  },
})
```

**Step 4: Uruchomić i zweryfikować wizualnie**

Run: `cd apps/mobile && pnpm dev`
Expected: Ekran logowania z nowym brandingiem OdFachowca

**Step 5: Commit**

```bash
git add apps/mobile/app/\(auth\)/login.tsx
git commit -m "feat(mobile): rebrand login screen with OdFachowca design

- New logo with 'F' icon and Od|Fachowca wordmark
- Kremowy background
- Terracotta CTA button
- Nunito typography

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

---

## Task 4: Zaktualizować ekran rejestracji (register.tsx)

**Files:**
- Modify: `apps/mobile/app/(auth)/register.tsx`

**Step 1: Skopiować styl z login.tsx**

Zastosować identyczne zmiany jak w login.tsx:
- Zaktualizować kolory tła i inputów
- Zmienić przycisk CTA na terracotta
- Dodać font Nunito
- Zaktualizować nazwę na OdFachowca

**Step 2: Uruchomić i zweryfikować**

Run: `cd apps/mobile && pnpm dev`
Expected: Ekran rejestracji spójny z logowaniem

**Step 3: Commit**

```bash
git add apps/mobile/app/\(auth\)/register.tsx
git commit -m "feat(mobile): rebrand register screen with OdFachowca design

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

---

## Task 5: Zaktualizować layout tabów (_layout.tsx w tabs)

**Files:**
- Modify: `apps/mobile/app/(tabs)/_layout.tsx`

**Step 1: Dodać import theme**

```typescript
import { colors, Colors } from '../../constants/theme'
```

**Step 2: Zaktualizować screenOptions**

```typescript
<Tabs
  screenOptions={{
    tabBarActiveTintColor: colors.primary.DEFAULT,
    tabBarInactiveTintColor: colors.text.muted,
    tabBarStyle: {
      backgroundColor: colors.surface,
      borderTopColor: colors.border,
    },
    headerStyle: {
      backgroundColor: colors.surface,
    },
    headerTintColor: colors.text.heading,
    headerTitleStyle: {
      fontFamily: 'Nunito-SemiBold',
    },
    headerShown: true,
  }}
>
```

**Step 3: Commit**

```bash
git add apps/mobile/app/\(tabs\)/_layout.tsx
git commit -m "feat(mobile): update tabs layout with OdFachowca colors

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

---

## Task 6: Zaktualizować Dashboard (index.tsx w tabs)

**Files:**
- Modify: `apps/mobile/app/(tabs)/index.tsx`

**Step 1: Dodać import theme**

```typescript
import { colors, fontFamily, borderRadius, shadows } from '../../constants/theme'
```

**Step 2: Zaktualizować StyleSheet**

```typescript
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: borderRadius.xl,
    ...shadows.md,
  },
  statNumber: {
    fontFamily: fontFamily.bold,
    fontSize: 32,
    color: colors.primary.DEFAULT,
  },
  statLabel: {
    fontFamily: fontFamily.regular,
    fontSize: 14,
    color: colors.text.body,
    marginTop: 4,
  },
  createButton: {
    backgroundColor: colors.accent.DEFAULT,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: borderRadius.lg,
    gap: 8,
    marginBottom: 24,
  },
  createButtonText: {
    color: colors.white,
    fontFamily: fontFamily.semibold,
    fontSize: 18,
  },
  section: {
    flex: 1,
  },
  sectionTitle: {
    fontFamily: fontFamily.semibold,
    fontSize: 18,
    color: colors.text.heading,
    marginBottom: 12,
  },
  emptyText: {
    fontFamily: fontFamily.regular,
    color: colors.text.body,
    textAlign: 'center',
    marginTop: 24,
  },
  quoteCard: {
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: borderRadius.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    ...shadows.sm,
  },
  quoteNumber: {
    fontFamily: fontFamily.medium,
    fontSize: 16,
    color: colors.text.heading,
  },
  quoteTotal: {
    fontFamily: fontFamily.semibold,
    fontSize: 16,
    color: colors.primary.DEFAULT,
  },
})
```

**Step 3: Commit**

```bash
git add apps/mobile/app/\(tabs\)/index.tsx
git commit -m "feat(mobile): rebrand dashboard with OdFachowca design

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

---

## Task 7: Zaktualizować listę wycen (quotes/index.tsx)

**Files:**
- Modify: `apps/mobile/app/(tabs)/quotes/index.tsx`

**Step 1: Dodać import theme**

```typescript
import { colors, fontFamily, borderRadius, shadows } from '../../../constants/theme'
```

**Step 2: Zaktualizować STATUS_CONFIG z nowymi kolorami**

```typescript
const STATUS_CONFIG = {
  draft: { label: 'Szkic', color: colors.text.body, bg: '#F1F5F9' },
  sent: { label: 'Wysłana', color: colors.primary.DEFAULT, bg: colors.primary[100] },
  accepted: { label: 'Zaakceptowana', color: colors.success.DEFAULT, bg: colors.success[100] },
  rejected: { label: 'Odrzucona', color: colors.error.DEFAULT, bg: colors.error[100] },
}
```

**Step 3: Zaktualizować StyleSheet**

```typescript
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  list: { padding: 16 },
  quoteCard: {
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: borderRadius.xl,
    marginBottom: 12,
    ...shadows.md,
  },
  quoteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  quoteNumber: {
    fontFamily: fontFamily.semibold,
    fontSize: 18,
    color: colors.text.heading,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
  },
  statusText: {
    fontFamily: fontFamily.medium,
    fontSize: 12,
  },
  quoteDate: {
    fontFamily: fontFamily.regular,
    fontSize: 14,
    color: colors.text.body,
    marginTop: 4,
  },
  quoteFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  quoteTotal: {
    fontFamily: fontFamily.bold,
    fontSize: 20,
    color: colors.primary.DEFAULT,
  },
  emptyContainer: { alignItems: 'center', paddingVertical: 64 },
  emptyText: {
    fontFamily: fontFamily.regular,
    fontSize: 16,
    color: colors.text.body,
    marginTop: 16,
  },
  emptyList: { flex: 1, justifyContent: 'center' },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.accent.DEFAULT,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.lg,
  },
})
```

**Step 4: Commit**

```bash
git add apps/mobile/app/\(tabs\)/quotes/index.tsx
git commit -m "feat(mobile): rebrand quotes list with OdFachowca design

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

---

## Task 8: Zaktualizować szczegóły wyceny (quotes/[id].tsx)

**Files:**
- Modify: `apps/mobile/app/(tabs)/quotes/[id].tsx`

**Step 1: Dodać import i zaktualizować kolory analogicznie do quotes/index.tsx**

**Step 2: Commit**

```bash
git add apps/mobile/app/\(tabs\)/quotes/\[id\].tsx
git commit -m "feat(mobile): rebrand quote details with OdFachowca design

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

---

## Task 9: Zaktualizować listę klientów (clients/index.tsx)

**Files:**
- Modify: `apps/mobile/app/(tabs)/clients/index.tsx`

**Step 1: Dodać import theme i zaktualizować StyleSheet analogicznie**

**Step 2: Commit**

```bash
git add apps/mobile/app/\(tabs\)/clients/index.tsx
git commit -m "feat(mobile): rebrand clients list with OdFachowca design

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

---

## Task 10: Zaktualizować tworzenie klienta (clients/create.tsx)

**Files:**
- Modify: `apps/mobile/app/(tabs)/clients/create.tsx`

**Step 1: Zaktualizować kolory inputów i przycisków**

**Step 2: Commit**

```bash
git add apps/mobile/app/\(tabs\)/clients/create.tsx
git commit -m "feat(mobile): rebrand client create form with OdFachowca design

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

---

## Task 11: Zaktualizować szczegóły klienta (clients/[id].tsx)

**Files:**
- Modify: `apps/mobile/app/(tabs)/clients/[id].tsx`

**Step 1: Zaktualizować kolory**

**Step 2: Commit**

```bash
git add apps/mobile/app/\(tabs\)/clients/\[id\].tsx
git commit -m "feat(mobile): rebrand client details with OdFachowca design

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

---

## Task 12: Zaktualizować tworzenie wyceny (quote/create.tsx)

**Files:**
- Modify: `apps/mobile/app/quote/create.tsx`

**Step 1: Zaktualizować kolory i style stepper/progress**

**Step 2: Commit**

```bash
git add apps/mobile/app/quote/create.tsx
git commit -m "feat(mobile): rebrand quote creation wizard with OdFachowca design

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

---

## Task 13: Zaktualizować komponenty quote (StepClient, StepGroups, StepMaterials, StepServices)

**Files:**
- Modify: `apps/mobile/components/quote/StepClient.tsx`
- Modify: `apps/mobile/components/quote/StepGroups.tsx`
- Modify: `apps/mobile/components/quote/StepMaterials.tsx`
- Modify: `apps/mobile/components/quote/StepServices.tsx`

**Step 1: Zaktualizować StepClient.tsx**

```typescript
import { colors, fontFamily, borderRadius, shadows } from '../../constants/theme'

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    marginHorizontal: 16,
    marginTop: 16,
    padding: 12,
    borderRadius: borderRadius.lg,
    gap: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchInput: {
    flex: 1,
    fontFamily: fontFamily.regular,
    fontSize: 16,
    color: colors.text.heading,
  },
  list: {
    padding: 16,
    paddingBottom: 32,
  },
  clientCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: borderRadius.lg,
    marginBottom: 8,
    gap: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  clientCardSelected: {
    backgroundColor: colors.primary[50],
    borderColor: colors.primary.DEFAULT,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.full,
    backgroundColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarSelected: {
    backgroundColor: colors.primary.DEFAULT,
  },
  avatarText: {
    fontFamily: fontFamily.semibold,
    fontSize: 16,
    color: colors.text.body,
  },
  avatarTextSelected: {
    color: colors.white,
  },
  clientInfo: {
    flex: 1,
  },
  clientName: {
    fontFamily: fontFamily.medium,
    fontSize: 16,
    color: colors.text.heading,
  },
  clientNameSelected: {
    fontFamily: fontFamily.semibold,
    color: colors.primary[700],
  },
  clientAddress: {
    fontFamily: fontFamily.regular,
    fontSize: 14,
    color: colors.text.body,
    marginTop: 2,
  },
  clientPhone: {
    fontFamily: fontFamily.regular,
    fontSize: 14,
    color: colors.text.muted,
    marginTop: 2,
  },
  addClientButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    marginTop: 8,
    gap: 8,
    borderWidth: 2,
    borderColor: colors.border,
    borderStyle: 'dashed',
    borderRadius: borderRadius.lg,
  },
  addClientText: {
    fontFamily: fontFamily.medium,
    fontSize: 16,
    color: colors.primary.DEFAULT,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyTitle: {
    fontFamily: fontFamily.semibold,
    fontSize: 18,
    color: colors.text.body,
    marginTop: 16,
  },
  emptySubtitle: {
    fontFamily: fontFamily.regular,
    fontSize: 14,
    color: colors.text.muted,
    marginTop: 4,
  },
})
```

**Step 2: Analogicznie zaktualizować pozostałe komponenty**

**Step 3: Commit**

```bash
git add apps/mobile/components/quote/
git commit -m "feat(mobile): rebrand quote step components with OdFachowca design

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

---

## Task 14: Zaktualizować AddClientBottomSheet

**Files:**
- Modify: `apps/mobile/components/quote/AddClientBottomSheet.tsx`

**Step 1: Zaktualizować kolory i style**

**Step 2: Commit**

```bash
git add apps/mobile/components/quote/AddClientBottomSheet.tsx
git commit -m "feat(mobile): rebrand add client bottom sheet with OdFachowca design

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

---

## Task 15: Zaktualizować komponenty UI (OfflineIndicator, SyncErrorBanner)

**Files:**
- Modify: `apps/mobile/components/ui/OfflineIndicator.tsx`
- Modify: `apps/mobile/components/ui/SyncErrorBanner.tsx`

**Step 1: Zaktualizować OfflineIndicator**

```typescript
import { colors, fontFamily, borderRadius } from '../../constants/theme'

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.warning.DEFAULT,
    paddingVertical: 8,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  text: {
    fontFamily: fontFamily.medium,
    color: colors.white,
    fontSize: 14,
  },
})
```

**Step 2: Zaktualizować SyncErrorBanner analogicznie**

**Step 3: Commit**

```bash
git add apps/mobile/components/ui/
git commit -m "feat(mobile): rebrand UI components with OdFachowca design

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

---

## Task 16: Zaktualizować ekrany ustawień

**Files:**
- Modify: `apps/mobile/app/(tabs)/settings/index.tsx`
- Modify: `apps/mobile/app/(tabs)/settings/materials.tsx`
- Modify: `apps/mobile/app/(tabs)/settings/templates.tsx`
- Modify: `apps/mobile/app/(tabs)/settings/subscription.tsx`
- Modify: `apps/mobile/app/(tabs)/settings/disclaimer.tsx`

**Step 1: Zaktualizować każdy plik z nowymi kolorami**

**Step 2: Commit**

```bash
git add apps/mobile/app/\(tabs\)/settings/
git commit -m "feat(mobile): rebrand settings screens with OdFachowca design

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

---

## Task 17: Zaktualizować ErrorBoundary

**Files:**
- Modify: `apps/mobile/components/ErrorBoundary.tsx`

**Step 1: Zaktualizować kolory i style**

**Step 2: Commit**

```bash
git add apps/mobile/components/ErrorBoundary.tsx
git commit -m "feat(mobile): rebrand error boundary with OdFachowca design

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

---

## Task 18: Zaktualizować główny _layout.tsx

**Files:**
- Modify: `apps/mobile/app/_layout.tsx`

**Step 1: Dodać ładowanie fontów i ustawić globalny background**

**Step 2: Commit**

```bash
git add apps/mobile/app/_layout.tsx
git commit -m "feat(mobile): update root layout with font loading and OdFachowca colors

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

---

## Task 19: Uruchomić testy i naprawić błędy

**Files:**
- Review: `apps/mobile/__tests__/`

**Step 1: Uruchomić testy**

Run: `cd apps/mobile && pnpm test`
Expected: PASS (może wymagać aktualizacji snapshot testów)

**Step 2: Jeśli testy snapshot failują, zaktualizować**

Run: `cd apps/mobile && pnpm test -u`

**Step 3: Commit**

```bash
git add apps/mobile/__tests__/
git commit -m "test(mobile): update snapshots for OdFachowca rebranding

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

---

## Task 20: Zaktualizować type check i finalny commit

**Step 1: Uruchomić type check**

Run: `cd apps/mobile && pnpm check-types`
Expected: PASS

**Step 2: Uruchomić lint**

Run: `cd apps/mobile && pnpm lint`
Expected: PASS lub minor warnings

**Step 3: Uruchomić aplikację i zweryfikować wizualnie**

Run: `cd apps/mobile && pnpm dev`

Checklist weryfikacji:
- [ ] Ekran logowania - nowe logo, kremowe tło, terracotta CTA
- [ ] Ekran rejestracji - spójny z logowaniem
- [ ] Dashboard - kremowe tło, karty z cieniem
- [ ] Lista wycen - statusy w nowych kolorach
- [ ] Tworzenie wyceny - stepper w nowych kolorach
- [ ] Lista klientów - avatary i karty
- [ ] Ustawienia - spójność

**Step 4: Finalny squash commit (opcjonalnie)**

```bash
git add .
git commit -m "feat(mobile): complete OdFachowca rebranding

- Updated color palette: primary #3B5EDB, accent #DA7756, bg #F8F6F3
- Added Nunito font via expo-google-fonts
- Rebranded all screens and components
- Updated logo from Majsterio to OdFachowca
- Applied soft & rounded UI style (12-16px border radius)
- Added proper shadows and spacing

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

---

## Notatki implementacyjne

### Kolory do zapamiętania
- **Primary (niebieski):** `#3B5EDB` - logo, linki, wybrane elementy
- **Accent (terracotta):** `#DA7756` - CTA przyciski, "Od" w logo
- **Background (kremowy):** `#F8F6F3` - tło ekranów
- **Surface (biały):** `#FFFFFF` - karty, inputy
- **Heading (granat):** `#1A2B4A` - nagłówki
- **Body (szary):** `#64748B` - tekst główny
- **Muted (jasny szary):** `#94A3B8` - placeholdery

### Border radius
- Inputs: 8px
- Buttons: 12px
- Cards: 16px
- Chips/Avatars: 9999px (full)

### Font weights (Nunito)
- Regular: 400
- Medium: 500
- SemiBold: 600
- Bold: 700
