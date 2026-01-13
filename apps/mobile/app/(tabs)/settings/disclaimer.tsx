import { useState } from 'react'
import {
  View, Text, TextInput, Pressable, StyleSheet,
  ScrollView, Alert, Switch
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { DEFAULT_DISCLAIMER } from '@majsterio/shared'

export default function DisclaimerScreen() {
  // Note: In production, these would be persisted with AsyncStorage
  const [disclaimer, setDisclaimer] = useState('')
  const [showByDefault, setShowByDefault] = useState(true)
  const [useCustom, setUseCustom] = useState(false)

  const handleSave = () => {
    // TODO: Save to AsyncStorage when implemented
    Alert.alert('Sukces', 'Ustawienia zostały zapisane lokalnie')
  }

  const handleReset = () => {
    Alert.alert(
      'Przywróć domyślny',
      'Czy chcesz przywrócić domyślny tekst warunków?',
      [
        { text: 'Anuluj', style: 'cancel' },
        {
          text: 'Przywróć',
          onPress: () => {
            setUseCustom(false)
            setDisclaimer('')
          },
        },
      ]
    )
  }

  return (
    <ScrollView style={styles.container}>
      {/* Show by default toggle */}
      <View style={styles.card}>
        <View style={styles.toggleRow}>
          <View style={styles.toggleInfo}>
            <Text style={styles.toggleTitle}>Pokaż warunki domyślnie</Text>
            <Text style={styles.toggleDescription}>
              Warunki będą automatycznie dołączane do nowych wycen
            </Text>
          </View>
          <Switch
            value={showByDefault}
            onValueChange={setShowByDefault}
            trackColor={{ true: '#2563eb' }}
          />
        </View>
      </View>

      {/* Custom disclaimer toggle */}
      <View style={styles.card}>
        <View style={styles.toggleRow}>
          <View style={styles.toggleInfo}>
            <Text style={styles.toggleTitle}>Własny tekst warunków</Text>
            <Text style={styles.toggleDescription}>
              Użyj własnego tekstu zamiast domyślnego
            </Text>
          </View>
          <Switch
            value={useCustom}
            onValueChange={setUseCustom}
            trackColor={{ true: '#2563eb' }}
          />
        </View>
      </View>

      {/* Disclaimer text */}
      <View style={styles.card}>
        <Text style={styles.label}>
          {useCustom ? 'Własny tekst warunków' : 'Domyślny tekst warunków'}
        </Text>
        {useCustom ? (
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Wpisz własne warunki..."
            value={disclaimer}
            onChangeText={setDisclaimer}
            multiline
            numberOfLines={8}
          />
        ) : (
          <View style={styles.defaultText}>
            <Text style={styles.defaultTextContent}>{DEFAULT_DISCLAIMER}</Text>
          </View>
        )}
      </View>

      {/* Preview */}
      <View style={styles.card}>
        <Text style={styles.label}>Podgląd na wycenie</Text>
        <View style={styles.preview}>
          <Text style={styles.previewTitle}>WARUNKI:</Text>
          <Text style={styles.previewText}>
            {useCustom && disclaimer ? disclaimer : DEFAULT_DISCLAIMER}
          </Text>
        </View>
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        {useCustom && (
          <Pressable style={styles.resetButton} onPress={handleReset}>
            <Ionicons name="refresh" size={20} color="#6b7280" />
            <Text style={styles.resetButtonText}>Przywróć domyślny</Text>
          </Pressable>
        )}
        <Pressable style={styles.saveButton} onPress={handleSave}>
          <Ionicons name="checkmark" size={20} color="white" />
          <Text style={styles.saveButtonText}>Zapisz zmiany</Text>
        </Pressable>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  card: {
    backgroundColor: 'white',
    padding: 16,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  toggleInfo: { flex: 1, marginRight: 16 },
  toggleTitle: { fontSize: 16, fontWeight: '500', color: '#1f2937' },
  toggleDescription: { fontSize: 14, color: '#6b7280', marginTop: 2 },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 12,
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
    height: 160,
    textAlignVertical: 'top',
  },
  defaultText: {
    backgroundColor: '#f9fafb',
    padding: 14,
    borderRadius: 10,
  },
  defaultTextContent: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  preview: {
    backgroundColor: '#fef3c7',
    padding: 16,
    borderRadius: 8,
  },
  previewTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#92400e',
    marginBottom: 8,
  },
  previewText: {
    fontSize: 12,
    color: '#92400e',
    lineHeight: 18,
  },
  actions: {
    padding: 16,
    gap: 12,
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    gap: 8,
  },
  resetButtonText: { fontSize: 16, color: '#6b7280' },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2563eb',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  saveButtonText: { fontSize: 16, fontWeight: '600', color: 'white' },
})
