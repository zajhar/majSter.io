import { View, Text, StyleSheet, Pressable } from 'react-native'
import { Ionicons } from '@expo/vector-icons'

interface Props {
  onNext: () => void
}

export function StepMaterials({ onNext }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.placeholder}>
        <Ionicons name="cart-outline" size={48} color="#d1d5db" />
        <Text style={styles.placeholderText}>Materiały - do implementacji</Text>
      </View>
      <Pressable style={styles.nextButton} onPress={onNext}>
        <Text style={styles.nextButtonText}>Dalej</Text>
        <Ionicons name="arrow-forward" size={20} color="white" />
      </Pressable>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  placeholder: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  placeholderText: { fontSize: 16, color: '#6b7280', marginTop: 12 },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2563eb',
    padding: 16,
    margin: 16,
    borderRadius: 12,
    gap: 8,
  },
  nextButtonText: { color: 'white', fontSize: 16, fontWeight: '600' },
})
