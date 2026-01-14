import { useState } from 'react'
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native'
import { Link, router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { useAuthStore } from '../../stores/authStore'
import { clearLocalDatabase } from '../../db'
import { colors, fontFamily, borderRadius } from '../../constants/theme'

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001'

export default function RegisterScreen() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { setUser, setToken } = useAuthStore()

  const handleRegister = async () => {
    if (!name || !email || !password || !confirmPassword) {
      Alert.alert('Blad', 'Wypelnij wszystkie pola')
      return
    }

    if (password !== confirmPassword) {
      Alert.alert('Blad', 'Hasla nie sa takie same')
      return
    }

    if (password.length < 8) {
      Alert.alert('Blad', 'Haslo musi miec co najmniej 8 znakow')
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch(`${API_URL}/api/auth/sign-up/email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Origin': 'exp://localhost',
        },
        body: JSON.stringify({ name, email, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Blad rejestracji')
      }

      // Wyczysc lokalne dane jesli rejestruje sie inny uzytkownik
      const previousUserId = useAuthStore.getState().user?.id
      if (previousUserId && previousUserId !== data.user.id) {
        await clearLocalDatabase()
      }

      setUser(data.user)
      setToken(data.token)
      router.replace('/(auth)/onboarding')
    } catch (error) {
      Alert.alert('Blad', error instanceof Error ? error.message : 'Blad rejestracji')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <Link href="/(auth)/login" asChild>
              <Pressable style={styles.backButton}>
                <Ionicons name="arrow-back" size={24} color={colors.text.heading} />
              </Pressable>
            </Link>
            <Text style={styles.title}>Utworz konto</Text>
            <Text style={styles.subtitle}>
              Dolacz do tysiecy fachowcow korzystajacych z OdFachowca
            </Text>
          </View>

          {/* Form */}
          <TextInput
            style={styles.input}
            placeholder="Imie i nazwisko"
            placeholderTextColor={colors.text.muted}
            value={name}
            onChangeText={setName}
          />

          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor={colors.text.muted}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />

          <TextInput
            style={styles.input}
            placeholder="Haslo (min. 8 znakow)"
            placeholderTextColor={colors.text.muted}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <TextInput
            style={styles.input}
            placeholder="Powtorz haslo"
            placeholderTextColor={colors.text.muted}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
          />

          <Pressable
            style={[styles.registerButton, isLoading && styles.registerButtonDisabled]}
            onPress={handleRegister}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.registerButtonText}>Zarejestruj sie</Text>
            )}
          </Pressable>

          {/* Login link */}
          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>Masz juz konto? </Text>
            <Link href="/(auth)/login" asChild>
              <Pressable>
                <Text style={styles.loginLink}>Zaloguj sie</Text>
              </Pressable>
            </Link>
          </View>
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
  content: {
    flex: 1,
    padding: 24,
    paddingTop: 60,
  },
  header: {
    marginBottom: 32,
  },
  backButton: {
    marginBottom: 16,
  },
  title: {
    fontFamily: fontFamily.bold,
    fontSize: 28,
    color: colors.text.heading,
  },
  subtitle: {
    fontFamily: fontFamily.regular,
    fontSize: 16,
    color: colors.text.body,
    marginTop: 8,
  },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    borderRadius: borderRadius.md,
    fontFamily: fontFamily.regular,
    fontSize: 16,
    color: colors.text.heading,
    marginBottom: 12,
  },
  registerButton: {
    backgroundColor: colors.primary.DEFAULT,
    padding: 16,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    marginTop: 8,
  },
  registerButtonDisabled: {
    opacity: 0.7,
  },
  registerButtonText: {
    color: colors.white,
    fontFamily: fontFamily.semibold,
    fontSize: 18,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  loginText: {
    fontFamily: fontFamily.regular,
    color: colors.text.body,
  },
  loginLink: {
    fontFamily: fontFamily.medium,
    color: colors.primary.DEFAULT,
  },
})
