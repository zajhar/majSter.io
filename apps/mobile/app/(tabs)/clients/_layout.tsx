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
