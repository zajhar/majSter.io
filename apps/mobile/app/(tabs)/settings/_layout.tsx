import { Stack } from 'expo-router'

export default function SettingsLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: 'Ustawienia' }} />
      <Stack.Screen name="templates" options={{ title: 'Szablony usług' }} />
      <Stack.Screen name="materials" options={{ title: 'Szablony materiałów' }} />
      <Stack.Screen name="disclaimer" options={{ title: 'Warunki wyceny' }} />
      <Stack.Screen name="subscription" options={{ title: 'Subskrypcja' }} />
    </Stack>
  )
}
