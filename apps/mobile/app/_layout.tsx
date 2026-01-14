import { useEffect } from 'react'
import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { QueryClientProvider } from '@tanstack/react-query'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import * as SplashScreen from 'expo-splash-screen'
import { useFonts } from 'expo-font'
import { trpc } from '../lib/trpc'
import { queryClient, trpcClient } from '../lib/api'
import { OfflineIndicator } from '../components/ui/OfflineIndicator'
import { ErrorBoundary } from '../components/ErrorBoundary'
import { initNetworkListener, useSyncStore } from '../stores/syncStore'
import { useAuthStore } from '../stores/authStore'

// Prevent splash screen from auto-hiding
SplashScreen.preventAutoHideAsync()

export default function RootLayout() {
  const { isOnline, pendingCount, processQueue } = useSyncStore()
  const user = useAuthStore((s) => s.user)
  const isLoading = useAuthStore((s) => s.isLoading)

  const [fontsLoaded] = useFonts({
    'Inter-Regular': require('@expo-google-fonts/inter/400Regular/Inter_400Regular.ttf'),
    'Inter-Medium': require('@expo-google-fonts/inter/500Medium/Inter_500Medium.ttf'),
    'Inter-SemiBold': require('@expo-google-fonts/inter/600SemiBold/Inter_600SemiBold.ttf'),
    'Inter-Bold': require('@expo-google-fonts/inter/700Bold/Inter_700Bold.ttf'),
  })

  useEffect(() => {
    const unsubscribe = initNetworkListener()
    useSyncStore.getState().updatePendingCount()
    return () => unsubscribe()
  }, [])

  // Ukryj splash screen dopiero po załadowaniu auth i fontów
  useEffect(() => {
    if (!isLoading && fontsLoaded) {
      SplashScreen.hideAsync()
    }
  }, [isLoading, fontsLoaded])

  // Auto-sync when returning online
  useEffect(() => {
    if (isOnline && pendingCount > 0 && user?.id) {
      processQueue(trpcClient, user.id)
    }
  }, [isOnline, pendingCount, user?.id, processQueue])

  // Nie renderuj dopóki auth i fonty nie są gotowe
  if (isLoading || !fontsLoaded) {
    return null
  }

  return (
    <ErrorBoundary>
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
            <OfflineIndicator />
          </GestureHandlerRootView>
        </QueryClientProvider>
      </trpc.Provider>
    </ErrorBoundary>
  )
}
