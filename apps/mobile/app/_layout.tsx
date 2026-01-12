import { useEffect } from 'react'
import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { QueryClientProvider } from '@tanstack/react-query'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import * as SplashScreen from 'expo-splash-screen'
import { trpc } from '../lib/trpc'
import { queryClient, trpcClient } from '../lib/api'
import { OfflineIndicator } from '../components/ui/OfflineIndicator'
import { initNetworkListener, useSyncStore } from '../stores/syncStore'

// Prevent splash screen from auto-hiding
SplashScreen.preventAutoHideAsync()

export default function RootLayout() {
  useEffect(() => {
    const unsubscribe = initNetworkListener()
    useSyncStore.getState().updatePendingCount()

    SplashScreen.hideAsync()

    return () => unsubscribe()
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
          <OfflineIndicator />
        </GestureHandlerRootView>
      </QueryClientProvider>
    </trpc.Provider>
  )
}
