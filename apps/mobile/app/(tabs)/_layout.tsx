import { Tabs, Redirect } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { useAuthStore } from '../../stores/authStore'
import { colors, fontFamily } from '../../constants/theme'

export default function TabLayout() {
  const { isAuthenticated, isLoading } = useAuthStore()

  if (isLoading) return null
  if (!isAuthenticated) return <Redirect href="/(auth)/login" />

  return (
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
          fontFamily: fontFamily.semibold,
        },
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
