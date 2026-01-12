import { Stack } from 'expo-router'

export default function QuotesLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: 'Wyceny' }} />
      <Stack.Screen name="[id]" options={{ title: 'Szczegóły wyceny' }} />
    </Stack>
  )
}
