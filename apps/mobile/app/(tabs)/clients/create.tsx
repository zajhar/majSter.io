import { useState } from 'react'
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native'
import { router } from 'expo-router'
import { useCreateClient } from '../../../hooks/useOfflineClients'
import { useSyncStore } from '../../../stores/syncStore'
import { colors, fontFamily, borderRadius, shadows } from '../../../constants/theme'

export default function CreateClientScreen() {
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [phone, setPhone] = useState('')
  const [siteAddress, setSiteAddress] = useState('')
  const [notes, setNotes] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  const { create } = useCreateClient()
  const isOnline = useSyncStore((s) => s.isOnline)

  const handleCreate = async () => {
    if (!firstName || !lastName) {
      Alert.alert('Błąd', 'Imię i nazwisko są wymagane')
      return
    }

    setIsSaving(true)
    const result = await create({
      firstName,
      lastName,
      phone: phone || undefined,
      siteAddress: siteAddress || undefined,
      notes: notes || undefined,
    })
    setIsSaving(false)

    if (result.success) {
      router.back()
    } else {
      Alert.alert('Błąd', result.error || 'Nie udało się dodać klienta')
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.form}>
          <Text style={styles.label}>Imię *</Text>
          <TextInput
            style={styles.input}
            placeholder="Jan"
            value={firstName}
            onChangeText={setFirstName}
          />

          <Text style={styles.label}>Nazwisko *</Text>
          <TextInput
            style={styles.input}
            placeholder="Kowalski"
            value={lastName}
            onChangeText={setLastName}
          />

          <Text style={styles.label}>Telefon</Text>
          <TextInput
            style={styles.input}
            placeholder="512 345 678"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
          />

          <Text style={styles.label}>Adres budowy</Text>
          <TextInput
            style={styles.input}
            placeholder="ul. Lipowa 5, Warszawa"
            value={siteAddress}
            onChangeText={setSiteAddress}
          />

          <Text style={styles.label}>Notatki</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Dodatkowe informacje..."
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={3}
          />

          <Pressable
            style={[styles.button, isSaving && styles.buttonDisabled]}
            onPress={handleCreate}
            disabled={isSaving}
          >
            <Text style={styles.buttonText}>
              {isSaving ? 'Zapisywanie...' : 'Dodaj klienta'}
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
  },
  form: {
    padding: 16,
  },
  label: {
    fontSize: 14,
    fontFamily: fontFamily.medium,
    color: colors.text.heading,
    marginBottom: 6,
    marginTop: 12,
  },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    borderRadius: borderRadius.md,
    fontSize: 16,
    fontFamily: fontFamily.regular,
    color: colors.text.heading,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  button: {
    backgroundColor: colors.primary.DEFAULT,
    padding: 16,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    marginTop: 24,
    ...shadows.md,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: colors.white,
    fontSize: 18,
    fontFamily: fontFamily.semibold,
  },
})
