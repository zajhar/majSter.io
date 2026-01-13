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
import { trpc } from '../../../lib/trpc'

export default function CreateClientScreen() {
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [phone, setPhone] = useState('')
  const [siteAddress, setSiteAddress] = useState('')
  const [notes, setNotes] = useState('')

  const utils = trpc.useUtils()
  const createClient = trpc.clients.create.useMutation({
    onSuccess: () => {
      utils.clients.list.invalidate()
      router.back()
    },
    onError: (error: Error) => {
      Alert.alert('Błąd', error.message)
    },
  })

  const handleCreate = () => {
    if (!firstName || !lastName) {
      Alert.alert('Błąd', 'Imię i nazwisko są wymagane')
      return
    }

    createClient.mutate({
      firstName,
      lastName,
      phone: phone || undefined,
      siteAddress: siteAddress || undefined,
      notes: notes || undefined,
    })
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
            style={[styles.button, createClient.isPending && styles.buttonDisabled]}
            onPress={handleCreate}
            disabled={createClient.isPending}
          >
            <Text style={styles.buttonText}>
              {createClient.isPending ? 'Zapisywanie...' : 'Dodaj klienta'}
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
    backgroundColor: 'white',
  },
  scrollContent: {
    flexGrow: 1,
  },
  form: {
    padding: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 6,
    marginTop: 12,
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
    height: 100,
    textAlignVertical: 'top',
  },
  button: {
    backgroundColor: '#2563eb',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 24,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
})
