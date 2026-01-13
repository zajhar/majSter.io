# Stream B: Frontend (Mobile) - Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Zbudowanie kompletnej aplikacji mobilnej Expo z expo-router, tRPC client, Zustand stores, i pełnym UI dla wycen.

**Architecture:** Expo z expo-router dla nawigacji, tRPC dla komunikacji z API, Zustand dla state management, expo-sqlite dla offline mode.

**Tech Stack:** Expo, React Native, expo-router, tRPC, Zustand, Better Auth client

**Branch:** `feat/mobile-foundation`

**Prerequisites:** Faza 0 ukończona (packages/shared, validators, db), Stream A w trakcie (API endpoints)

---

## B1: Fundament Mobile

### Task B1.1: Cleanup Expo boilerplate

**Files:**
- Delete: `apps/mobile/app/(tabs)/*` (existing boilerplate)
- Delete: `apps/mobile/components/*` (existing boilerplate)

**Step 1: Usuń boilerplate**

```bash
rm -rf apps/mobile/app/\(tabs\)/*
rm -rf apps/mobile/components/HelloWave.tsx
rm -rf apps/mobile/components/ParallaxScrollView.tsx
rm -rf apps/mobile/components/ThemedText.tsx
rm -rf apps/mobile/components/ThemedView.tsx
rm -rf apps/mobile/components/ExternalLink.tsx
rm -rf apps/mobile/components/Collapsible.tsx
rm -rf apps/mobile/components/HapticTab.tsx
rm -rf apps/mobile/hooks/useColorScheme.ts
rm -rf apps/mobile/hooks/useColorScheme.web.ts
rm -rf apps/mobile/hooks/useThemeColor.ts
```

**Step 2: Commit**

```bash
git add -A
git commit -m "chore(mobile): remove Expo boilerplate"
```

---

### Task B1.2: Setup podstawowej struktury katalogów

**Files:**
- Create directories

**Step 1: Utwórz katalogi**

```bash
mkdir -p apps/mobile/app/\(auth\)
mkdir -p apps/mobile/app/\(tabs\)/quotes
mkdir -p apps/mobile/app/\(tabs\)/clients
mkdir -p apps/mobile/app/\(tabs\)/settings
mkdir -p apps/mobile/app/quote
mkdir -p apps/mobile/components/ui
mkdir -p apps/mobile/stores
mkdir -p apps/mobile/lib
mkdir -p apps/mobile/db
```

**Step 2: Commit**

```bash
git add -A
git commit -m "chore(mobile): setup directory structure"
```

---

### Task B1.3: Zaktualizuj package.json

**Files:**
- Modify: `apps/mobile/package.json`

**Step 1: Zaktualizuj dependencies**

Update `apps/mobile/package.json`:
```json
{
  "name": "mobile",
  "main": "expo-router/entry",
  "version": "1.0.0",
  "scripts": {
    "start": "expo start",
    "android": "expo start --android",
    "ios": "expo start --ios",
    "web": "expo start --web",
    "lint": "expo lint",
    "check-types": "tsc --noEmit"
  },
  "dependencies": {
    "@majsterio/shared": "workspace:*",
    "@majsterio/validators": "workspace:*",
    "@majsterio/api-client": "workspace:*",
    "@expo/vector-icons": "^15.0.3",
    "@react-navigation/bottom-tabs": "^7.4.0",
    "@react-navigation/native": "^7.1.8",
    "@tanstack/react-query": "^5.60.0",
    "@trpc/client": "^11.0.0",
    "@trpc/react-query": "^11.0.0",
    "better-auth": "^1.2.0",
    "expo": "~54.0.31",
    "expo-constants": "~18.0.13",
    "expo-font": "~14.0.10",
    "expo-linking": "~8.0.11",
    "expo-router": "~6.0.21",
    "expo-secure-store": "~15.0.0",
    "expo-splash-screen": "~31.0.13",
    "expo-status-bar": "~3.0.9",
    "expo-sqlite": "~16.0.0",
    "react": "19.1.0",
    "react-native": "0.81.5",
    "react-native-gesture-handler": "~2.28.0",
    "react-native-reanimated": "~4.1.1",
    "react-native-safe-area-context": "~5.6.0",
    "react-native-screens": "~4.16.0",
    "zustand": "^5.0.0",
    "zod": "^3.24.0"
  },
  "devDependencies": {
    "@types/react": "~19.1.0",
    "typescript": "~5.9.2"
  },
  "private": true
}
```

**Step 2: Zainstaluj dependencies**

Run: `pnpm install`

**Step 3: Commit**

```bash
git add apps/mobile/package.json pnpm-lock.yaml
git commit -m "feat(mobile): add tRPC, Zustand, and other dependencies"
```

---

### Task B1.4: Setup tRPC client

**Files:**
- Create: `apps/mobile/lib/trpc.ts`
- Create: `apps/mobile/lib/api.ts`

**Step 1: Utwórz lib/trpc.ts**

Create `apps/mobile/lib/trpc.ts`:
```typescript
import { createTRPCReact } from '@trpc/react-query'
import type { AppRouter } from '@majsterio/api-client'

export const trpc = createTRPCReact<AppRouter>()
```

**Step 2: Utwórz lib/api.ts**

Create `apps/mobile/lib/api.ts`:
```typescript
import { QueryClient } from '@tanstack/react-query'
import { httpBatchLink } from '@trpc/client'
import { trpc } from './trpc'
import * as SecureStore from 'expo-secure-store'

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 2,
    },
  },
})

async function getAuthToken(): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync('auth_token')
  } catch {
    return null
  }
}

export const trpcClient = trpc.createClient({
  links: [
    httpBatchLink({
      url: `${API_URL}/trpc`,
      async headers() {
        const token = await getAuthToken()
        return token ? { Authorization: `Bearer ${token}` } : {}
      },
    }),
  ],
})
```

**Step 3: Commit**

```bash
git add apps/mobile/lib/
git commit -m "feat(mobile): setup tRPC client"
```

---

### Task B1.5: Setup Providers w layout

**Files:**
- Modify: `apps/mobile/app/_layout.tsx`

**Step 1: Zaktualizuj _layout.tsx**

Update `apps/mobile/app/_layout.tsx`:
```typescript
import { useEffect } from 'react'
import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { QueryClientProvider } from '@tanstack/react-query'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import * as SplashScreen from 'expo-splash-screen'
import { trpc } from '../lib/trpc'
import { queryClient, trpcClient } from '../lib/api'

// Prevent splash screen from auto-hiding
SplashScreen.preventAutoHideAsync()

export default function RootLayout() {
  useEffect(() => {
    // Hide splash screen after app is ready
    SplashScreen.hideAsync()
  }, [])

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <Stack>
            <Stack.Screen name="(auth)" options={{ headerShown: false }} />
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen
              name="quote/create"
              options={{
                title: 'Nowa wycena',
                presentation: 'modal',
              }}
            />
          </Stack>
          <StatusBar style="auto" />
        </GestureHandlerRootView>
      </QueryClientProvider>
    </trpc.Provider>
  )
}
```

**Step 2: Commit**

```bash
git add apps/mobile/app/_layout.tsx
git commit -m "feat(mobile): setup tRPC and Query providers"
```

---

### Task B1.6: Setup Zustand auth store

**Files:**
- Create: `apps/mobile/stores/authStore.ts`

**Step 1: Utwórz authStore.ts**

Create `apps/mobile/stores/authStore.ts`:
```typescript
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import * as SecureStore from 'expo-secure-store'
import type { User } from '@majsterio/shared'

interface AuthState {
  user: User | null
  token: string | null
  isLoading: boolean
  isAuthenticated: boolean
  setUser: (user: User | null) => void
  setToken: (token: string | null) => void
  setLoading: (loading: boolean) => void
  logout: () => void
}

// Custom storage for SecureStore
const secureStorage = {
  getItem: async (name: string) => {
    const value = await SecureStore.getItemAsync(name)
    return value ?? null
  },
  setItem: async (name: string, value: string) => {
    await SecureStore.setItemAsync(name, value)
  },
  removeItem: async (name: string) => {
    await SecureStore.deleteItemAsync(name)
  },
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isLoading: true,
      isAuthenticated: false,

      setUser: (user) => set({ user, isAuthenticated: !!user }),

      setToken: async (token) => {
        if (token) {
          await SecureStore.setItemAsync('auth_token', token)
        } else {
          await SecureStore.deleteItemAsync('auth_token')
        }
        set({ token })
      },

      setLoading: (isLoading) => set({ isLoading }),

      logout: async () => {
        await SecureStore.deleteItemAsync('auth_token')
        set({ user: null, token: null, isAuthenticated: false })
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => secureStorage),
      partialize: (state) => ({ user: state.user }),
    }
  )
)
```

**Step 2: Commit**

```bash
git add apps/mobile/stores/
git commit -m "feat(mobile): add Zustand auth store with SecureStore"
```

---

### Task B1.7: Podstawowy (tabs) layout

**Files:**
- Create: `apps/mobile/app/(tabs)/_layout.tsx`
- Create: `apps/mobile/app/(tabs)/index.tsx`

**Step 1: Utwórz (tabs)/_layout.tsx**

Create `apps/mobile/app/(tabs)/_layout.tsx`:
```typescript
import { Tabs } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#2563eb',
        tabBarInactiveTintColor: '#6b7280',
        headerShown: true,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="quotes"
        options={{
          title: 'Wyceny',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="document-text-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="clients"
        options={{
          title: 'Klienci',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="people-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Ustawienia',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="settings-outline" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  )
}
```

**Step 2: Utwórz (tabs)/index.tsx (Dashboard)**

Create `apps/mobile/app/(tabs)/index.tsx`:
```typescript
import { View, Text, StyleSheet, Pressable } from 'react-native'
import { Link } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { trpc } from '../../lib/trpc'

export default function DashboardScreen() {
  const { data: subscription } = trpc.subscriptions.status.useQuery()
  const { data: quotes } = trpc.quotes.list.useQuery()

  const recentQuotes = quotes?.slice(0, 3) ?? []
  const quotesThisMonth = subscription?.quotesThisMonth ?? 0
  const quotesLimit = subscription?.limits.quotesPerMonth ?? 10

  return (
    <View style={styles.container}>
      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{quotesThisMonth}</Text>
          <Text style={styles.statLabel}>
            Wycen w tym miesiącu
            {quotesLimit !== Infinity && ` (z ${quotesLimit})`}
          </Text>
        </View>
      </View>

      {/* Quick Action */}
      <Link href="/quote/create" asChild>
        <Pressable style={styles.createButton}>
          <Ionicons name="add-circle" size={24} color="white" />
          <Text style={styles.createButtonText}>Nowa wycena</Text>
        </Pressable>
      </Link>

      {/* Recent Quotes */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Ostatnie wyceny</Text>
        {recentQuotes.length === 0 ? (
          <Text style={styles.emptyText}>Brak wycen</Text>
        ) : (
          recentQuotes.map((quote) => (
            <Link key={quote.id} href={`/(tabs)/quotes/${quote.id}`} asChild>
              <Pressable style={styles.quoteCard}>
                <Text style={styles.quoteNumber}>#{quote.number}</Text>
                <Text style={styles.quoteTotal}>{quote.total} zł</Text>
              </Pressable>
            </Link>
          ))
        )}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2563eb',
  },
  statLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  createButton: {
    backgroundColor: '#2563eb',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
    marginBottom: 24,
  },
  createButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  section: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  emptyText: {
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 24,
  },
  quoteCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  quoteNumber: {
    fontSize: 16,
    fontWeight: '500',
  },
  quoteTotal: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2563eb',
  },
})
```

**Step 3: Commit**

```bash
git add apps/mobile/app/\(tabs\)/
git commit -m "feat(mobile): add tabs layout and dashboard screen"
```

---

## B2: Auth Screens

### Task B2.1: Auth layout i redirect logic

**Files:**
- Create: `apps/mobile/app/(auth)/_layout.tsx`
- Create: `apps/mobile/app/(auth)/login.tsx`

**Step 1: Utwórz (auth)/_layout.tsx**

Create `apps/mobile/app/(auth)/_layout.tsx`:
```typescript
import { Stack, Redirect } from 'expo-router'
import { useAuthStore } from '../../stores/authStore'

export default function AuthLayout() {
  const { isAuthenticated, isLoading } = useAuthStore()

  // If authenticated, redirect to main app
  if (!isLoading && isAuthenticated) {
    return <Redirect href="/(tabs)" />
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
    </Stack>
  )
}
```

**Step 2: Utwórz (auth)/login.tsx**

Create `apps/mobile/app/(auth)/login.tsx`:
```typescript
import { useState } from 'react'
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native'
import { Link, router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { useAuthStore } from '../../stores/authStore'

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001'

export default function LoginScreen() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { setUser, setToken } = useAuthStore()

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Błąd', 'Wypełnij wszystkie pola')
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch(`${API_URL}/api/auth/sign-in/email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Błąd logowania')
      }

      setUser(data.user)
      setToken(data.token)
      router.replace('/(tabs)')
    } catch (error) {
      Alert.alert('Błąd', error instanceof Error ? error.message : 'Błąd logowania')
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    // TODO: Implement Google OAuth
    Alert.alert('Info', 'Google login coming soon')
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.content}>
        {/* Logo */}
        <View style={styles.logoContainer}>
          <Ionicons name="construct" size={64} color="#2563eb" />
          <Text style={styles.logoText}>Majsterio</Text>
          <Text style={styles.tagline}>Profesjonalne wyceny w 60 sekund</Text>
        </View>

        {/* Google Login */}
        <Pressable style={styles.googleButton} onPress={handleGoogleLogin}>
          <Ionicons name="logo-google" size={20} color="#4285F4" />
          <Text style={styles.googleButtonText}>Kontynuuj z Google</Text>
        </Pressable>

        {/* Divider */}
        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>lub</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* Email/Password */}
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <TextInput
          style={styles.input}
          placeholder="Hasło"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <Pressable
          style={[styles.loginButton, isLoading && styles.loginButtonDisabled]}
          onPress={handleLogin}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.loginButtonText}>Zaloguj się</Text>
          )}
        </Pressable>

        {/* Register link */}
        <View style={styles.registerContainer}>
          <Text style={styles.registerText}>Nie masz konta? </Text>
          <Link href="/(auth)/register" asChild>
            <Pressable>
              <Text style={styles.registerLink}>Zarejestruj się</Text>
            </Pressable>
          </Link>
        </View>
      </View>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
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
  logoText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1f2937',
    marginTop: 12,
  },
  tagline: {
    fontSize: 16,
    color: '#6b7280',
    marginTop: 8,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  googleButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1f2937',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#e5e7eb',
  },
  dividerText: {
    marginHorizontal: 16,
    color: '#6b7280',
  },
  input: {
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    padding: 16,
    borderRadius: 12,
    fontSize: 16,
    marginBottom: 12,
  },
  loginButton: {
    backgroundColor: '#2563eb',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  loginButtonDisabled: {
    opacity: 0.7,
  },
  loginButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  registerText: {
    color: '#6b7280',
  },
  registerLink: {
    color: '#2563eb',
    fontWeight: '500',
  },
})
```

**Step 3: Commit**

```bash
git add apps/mobile/app/\(auth\)/
git commit -m "feat(mobile): add auth layout and login screen"
```

---

### Task B2.2: Register screen

**Files:**
- Create: `apps/mobile/app/(auth)/register.tsx`

**Step 1: Utwórz (auth)/register.tsx**

Create `apps/mobile/app/(auth)/register.tsx`:
```typescript
import { useState } from 'react'
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native'
import { Link, router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { useAuthStore } from '../../stores/authStore'

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001'

export default function RegisterScreen() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { setUser, setToken } = useAuthStore()

  const handleRegister = async () => {
    if (!name || !email || !password || !confirmPassword) {
      Alert.alert('Błąd', 'Wypełnij wszystkie pola')
      return
    }

    if (password !== confirmPassword) {
      Alert.alert('Błąd', 'Hasła nie są takie same')
      return
    }

    if (password.length < 8) {
      Alert.alert('Błąd', 'Hasło musi mieć co najmniej 8 znaków')
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch(`${API_URL}/api/auth/sign-up/email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Błąd rejestracji')
      }

      setUser(data.user)
      setToken(data.token)
      router.replace('/(tabs)')
    } catch (error) {
      Alert.alert('Błąd', error instanceof Error ? error.message : 'Błąd rejestracji')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <Link href="/(auth)/login" asChild>
              <Pressable style={styles.backButton}>
                <Ionicons name="arrow-back" size={24} color="#1f2937" />
              </Pressable>
            </Link>
            <Text style={styles.title}>Utwórz konto</Text>
            <Text style={styles.subtitle}>
              Dołącz do tysięcy fachowców korzystających z Majsterio
            </Text>
          </View>

          {/* Form */}
          <TextInput
            style={styles.input}
            placeholder="Imię i nazwisko"
            value={name}
            onChangeText={setName}
          />

          <TextInput
            style={styles.input}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />

          <TextInput
            style={styles.input}
            placeholder="Hasło (min. 8 znaków)"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <TextInput
            style={styles.input}
            placeholder="Powtórz hasło"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
          />

          <Pressable
            style={[styles.registerButton, isLoading && styles.registerButtonDisabled]}
            onPress={handleRegister}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.registerButtonText}>Zarejestruj się</Text>
            )}
          </Pressable>

          {/* Login link */}
          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>Masz już konto? </Text>
            <Link href="/(auth)/login" asChild>
              <Pressable>
                <Text style={styles.loginLink}>Zaloguj się</Text>
              </Pressable>
            </Link>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    padding: 24,
    paddingTop: 60,
  },
  header: {
    marginBottom: 32,
  },
  backButton: {
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    marginTop: 8,
  },
  input: {
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    padding: 16,
    borderRadius: 12,
    fontSize: 16,
    marginBottom: 12,
  },
  registerButton: {
    backgroundColor: '#2563eb',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  registerButtonDisabled: {
    opacity: 0.7,
  },
  registerButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  loginText: {
    color: '#6b7280',
  },
  loginLink: {
    color: '#2563eb',
    fontWeight: '500',
  },
})
```

**Step 2: Commit**

```bash
git add apps/mobile/app/\(auth\)/
git commit -m "feat(mobile): add register screen"
```

---

## B3: Clients Module

### Task B3.1: Clients list screen

**Files:**
- Create: `apps/mobile/app/(tabs)/clients/index.tsx`
- Create: `apps/mobile/app/(tabs)/clients/_layout.tsx`

**Step 1: Utwórz clients/_layout.tsx**

Create `apps/mobile/app/(tabs)/clients/_layout.tsx`:
```typescript
import { Stack } from 'expo-router'

export default function ClientsLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: 'Klienci' }} />
      <Stack.Screen name="[id]" options={{ title: 'Szczegóły klienta' }} />
      <Stack.Screen
        name="create"
        options={{
          title: 'Nowy klient',
          presentation: 'modal',
        }}
      />
    </Stack>
  )
}
```

**Step 2: Utwórz clients/index.tsx**

Create `apps/mobile/app/(tabs)/clients/index.tsx`:
```typescript
import { View, Text, FlatList, Pressable, StyleSheet, TextInput } from 'react-native'
import { Link } from 'expo-router'
import { useState } from 'react'
import { Ionicons } from '@expo/vector-icons'
import { trpc } from '../../../lib/trpc'

export default function ClientsListScreen() {
  const [search, setSearch] = useState('')
  const { data: clients, isLoading } = trpc.clients.list.useQuery()

  const filteredClients = clients?.filter((client) => {
    const fullName = `${client.firstName} ${client.lastName}`.toLowerCase()
    return fullName.includes(search.toLowerCase())
  }) ?? []

  return (
    <View style={styles.container}>
      {/* Search */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#6b7280" />
        <TextInput
          style={styles.searchInput}
          placeholder="Szukaj klienta..."
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {/* List */}
      <FlatList
        data={filteredClients}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Link href={`/(tabs)/clients/${item.id}`} asChild>
            <Pressable style={styles.clientCard}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {item.firstName[0]}{item.lastName[0]}
                </Text>
              </View>
              <View style={styles.clientInfo}>
                <Text style={styles.clientName}>
                  {item.firstName} {item.lastName}
                </Text>
                {item.siteAddress && (
                  <Text style={styles.clientAddress} numberOfLines={1}>
                    {item.siteAddress}
                  </Text>
                )}
              </View>
              {item.phone && (
                <Pressable style={styles.phoneButton}>
                  <Ionicons name="call-outline" size={20} color="#2563eb" />
                </Pressable>
              )}
            </Pressable>
          </Link>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="people-outline" size={64} color="#d1d5db" />
            <Text style={styles.emptyText}>
              {isLoading ? 'Ładowanie...' : 'Brak klientów'}
            </Text>
          </View>
        }
        contentContainerStyle={filteredClients.length === 0 && styles.emptyList}
      />

      {/* FAB */}
      <Link href="/(tabs)/clients/create" asChild>
        <Pressable style={styles.fab}>
          <Ionicons name="add" size={28} color="white" />
        </Pressable>
      </Link>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    margin: 16,
    padding: 12,
    borderRadius: 12,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  clientCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginBottom: 8,
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#dbeafe',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2563eb',
  },
  clientInfo: {
    flex: 1,
  },
  clientName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1f2937',
  },
  clientAddress: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
  phoneButton: {
    padding: 8,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
  },
  emptyText: {
    fontSize: 16,
    color: '#6b7280',
    marginTop: 16,
  },
  emptyList: {
    flex: 1,
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#2563eb',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
})
```

**Step 3: Commit**

```bash
git add apps/mobile/app/\(tabs\)/clients/
git commit -m "feat(mobile): add clients list screen"
```

---

### Task B3.2: Create client screen

**Files:**
- Create: `apps/mobile/app/(tabs)/clients/create.tsx`

**Step 1: Utwórz clients/create.tsx**

Create `apps/mobile/app/(tabs)/clients/create.tsx`:
```typescript
import { useState } from 'react'
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native'
import { router } from 'expo-router'
import { trpc } from '../../../lib/trpc'

export default function CreateClientScreen() {
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [phone, setPhone] = useState('')
  const [siteAddress, setSiteAddress] = useState('')
  const [notes, setNotes] = useState('')

  const utils = trpc.useUtils()
  const createClient = trpc.clients.create.useMutation({
    onSuccess: () => {
      utils.clients.list.invalidate()
      router.back()
    },
    onError: (error) => {
      Alert.alert('Błąd', error.message)
    },
  })

  const handleCreate = () => {
    if (!firstName || !lastName) {
      Alert.alert('Błąd', 'Imię i nazwisko są wymagane')
      return
    }

    createClient.mutate({
      firstName,
      lastName,
      phone: phone || undefined,
      siteAddress: siteAddress || undefined,
      notes: notes || undefined,
    })
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.form}>
          <Text style={styles.label}>Imię *</Text>
          <TextInput
            style={styles.input}
            placeholder="Jan"
            value={firstName}
            onChangeText={setFirstName}
          />

          <Text style={styles.label}>Nazwisko *</Text>
          <TextInput
            style={styles.input}
            placeholder="Kowalski"
            value={lastName}
            onChangeText={setLastName}
          />

          <Text style={styles.label}>Telefon</Text>
          <TextInput
            style={styles.input}
            placeholder="512 345 678"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
          />

          <Text style={styles.label}>Adres budowy</Text>
          <TextInput
            style={styles.input}
            placeholder="ul. Lipowa 5, Warszawa"
            value={siteAddress}
            onChangeText={setSiteAddress}
          />

          <Text style={styles.label}>Notatki</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Dodatkowe informacje..."
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={3}
          />

          <Pressable
            style={[styles.button, createClient.isPending && styles.buttonDisabled]}
            onPress={handleCreate}
            disabled={createClient.isPending}
          >
            <Text style={styles.buttonText}>
              {createClient.isPending ? 'Zapisywanie...' : 'Dodaj klienta'}
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  scrollContent: {
    flexGrow: 1,
  },
  form: {
    padding: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 6,
    marginTop: 12,
  },
  input: {
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    padding: 14,
    borderRadius: 10,
    fontSize: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  button: {
    backgroundColor: '#2563eb',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 24,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
})
```

**Step 2: Commit**

```bash
git add apps/mobile/app/\(tabs\)/clients/
git commit -m "feat(mobile): add create client screen"
```

---

## Summary - Plan Saved

Plan Stream B zapisany. Ze względu na długość, pełny plan dla pozostałych tasków (B4-B8) powinien być kontynuowany w osobnym pliku lub tej sesji.

**Główne moduły Stream B:**
- ✅ B1: Fundament (tRPC, Zustand, layout)
- ✅ B2: Auth screens
- ✅ B3: Clients module (lista, create)
- 📝 B4: Quotes module - lista (do dokończenia)
- 📝 B5: Quotes module - kreator (do dokończenia)
- 📝 B6: Settings module (do dokończenia)
- 📝 B7: PDF & Share (do dokończenia)
- 📝 B8: Offline mode (do dokończenia)

**Kontynuacja:** Utwórz `docs/plans/2026-01-12-stream-b-mobile-part2.md` dla B4-B8.
