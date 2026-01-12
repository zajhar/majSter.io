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
