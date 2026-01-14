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
} from 'react-native'
import { Link, router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { useAuthStore } from '../../stores/authStore'
import { clearLocalDatabase } from '../../db'
import { colors, fontFamily, borderRadius, shadows } from '../../constants/theme'

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001'

export default function LoginScreen() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { setUser, setToken } = useAuthStore()

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Blad', 'Wypelnij wszystkie pola')
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch(`${API_URL}/api/auth/sign-in/email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Origin': 'exp://localhost',
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Blad logowania')
      }

      // Wyczysc lokalne dane jesli loguje sie inny uzytkownik
      const previousUserId = useAuthStore.getState().user?.id
      if (previousUserId && previousUserId !== data.user.id) {
        await clearLocalDatabase()
      }

      setUser(data.user)
      setToken(data.token)
      router.replace('/(tabs)')
    } catch (error) {
      Alert.alert('Blad', error instanceof Error ? error.message : 'Blad logowania')
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    // TODO: Implement Google OAuth
    Alert.alert('Info', 'Google login coming soon')
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.content}>
        {/* Logo */}
        <View style={styles.logoContainer}>
          <View style={styles.logoIcon}>
            <Text style={styles.logoF}>F</Text>
          </View>
          <View style={styles.logoTextContainer}>
            <Text style={styles.logoOd}>Od</Text>
            <Text style={styles.logoFachowca}>Fachowca</Text>
          </View>
          <Text style={styles.tagline}>Profesjonalne wyceny w 60 sekund</Text>
        </View>

        {/* Google Login */}
        <Pressable style={styles.googleButton} onPress={handleGoogleLogin}>
          <Ionicons name="logo-google" size={20} color="#4285F4" />
          <Text style={styles.googleButtonText}>Kontynuuj z Google</Text>
        </Pressable>

        {/* Divider */}
        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>lub</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* Email/Password */}
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
          placeholder="Haslo"
          placeholderTextColor={colors.text.muted}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <Pressable
          style={[styles.loginButton, isLoading && styles.loginButtonDisabled]}
          onPress={handleLogin}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.loginButtonText}>Zaloguj sie</Text>
          )}
        </Pressable>

        {/* Register link */}
        <View style={styles.registerContainer}>
          <Text style={styles.registerText}>Nie masz konta? </Text>
          <Link href="/(auth)/register" asChild>
            <Pressable>
              <Text style={styles.registerLink}>Zarejestruj sie</Text>
            </Pressable>
          </Link>
        </View>
      </View>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 48,
  },
  logoIcon: {
    width: 72,
    height: 72,
    borderRadius: 20,
    backgroundColor: colors.primary.DEFAULT,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  logoF: {
    fontFamily: fontFamily.bold,
    fontSize: 40,
    color: colors.white,
  },
  logoTextContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  logoOd: {
    fontFamily: fontFamily.bold,
    fontSize: 32,
    color: colors.accent.DEFAULT,
  },
  logoFachowca: {
    fontFamily: fontFamily.bold,
    fontSize: 32,
    color: colors.text.heading,
  },
  tagline: {
    fontFamily: fontFamily.regular,
    fontSize: 16,
    color: colors.text.body,
    marginTop: 8,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    borderRadius: borderRadius.lg,
    gap: 12,
  },
  googleButtonText: {
    fontFamily: fontFamily.medium,
    fontSize: 16,
    color: colors.text.heading,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  dividerText: {
    fontFamily: fontFamily.regular,
    marginHorizontal: 16,
    color: colors.text.muted,
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
  loginButton: {
    backgroundColor: colors.primary.DEFAULT,
    padding: 16,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    marginTop: 8,
  },
  loginButtonDisabled: {
    opacity: 0.7,
  },
  loginButtonText: {
    color: colors.white,
    fontFamily: fontFamily.semibold,
    fontSize: 18,
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  registerText: {
    fontFamily: fontFamily.regular,
    color: colors.text.body,
  },
  registerLink: {
    fontFamily: fontFamily.medium,
    color: colors.primary.DEFAULT,
  },
})
