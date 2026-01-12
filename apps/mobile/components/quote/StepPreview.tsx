import { View, Text, StyleSheet, Pressable } from 'react-native'
import { Ionicons } from '@expo/vector-icons'

interface Props {
  onSubmit: () => void
  isLoading: boolean
}

export function StepPreview({ onSubmit, isLoading }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.placeholder}>
        <Ionicons name="document-outline" size={48} color="#d1d5db" />
        <Text style={styles.placeholderText}>Podgląd - do implementacji</Text>
      </View>
      <Pressable
        style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
        onPress={onSubmit}
        disabled={isLoading}
      >
        <Ionicons name="checkmark-circle" size={24} color="white" />
        <Text style={styles.submitButtonText}>
          {isLoading ? 'Zapisywanie...' : 'Utwórz wycenę'}
        </Text>
      </Pressable>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  placeholder: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  placeholderText: { fontSize: 16, color: '#6b7280', marginTop: 12 },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#16a34a',
    padding: 18,
    margin: 16,
    borderRadius: 12,
    gap: 8,
  },
  submitButtonDisabled: { opacity: 0.7 },
  submitButtonText: { color: 'white', fontSize: 18, fontWeight: '600' },
})
