import { View, Text, ScrollView, Pressable, StyleSheet, Alert } from 'react-native'
import { Link } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { useAuthStore } from '../../../stores/authStore'
import { trpc } from '../../../lib/trpc'
import { colors, fontFamily, borderRadius, shadows } from '../../../constants/theme'

export default function SettingsScreen() {
  const { user, logout } = useAuthStore()
  const { data: subscription } = trpc.subscriptions.status.useQuery()

  const handleLogout = () => {
    Alert.alert('Wyloguj', 'Czy na pewno chcesz się wylogować?', [
      { text: 'Anuluj', style: 'cancel' },
      { text: 'Wyloguj', style: 'destructive', onPress: logout },
    ])
  }

  const tierLabel = {
    free: 'Darmowy',
    pro: 'Pro',
    pro_ai: 'Pro AI',
  }

  return (
    <ScrollView style={styles.container}>
      {/* Profile */}
      <View style={styles.profileCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {user?.name?.charAt(0) || user?.email?.charAt(0) || '?'}
          </Text>
        </View>
        <View style={styles.profileInfo}>
          <Text style={styles.profileName}>{user?.name || 'Użytkownik'}</Text>
          <Text style={styles.profileEmail}>{user?.email}</Text>
        </View>
      </View>

      {/* Subscription */}
      <Link href="/(tabs)/settings/subscription" asChild>
        <Pressable style={styles.subscriptionCard}>
          <View style={styles.subscriptionInfo}>
            <Text style={styles.subscriptionLabel}>Plan</Text>
            <Text style={styles.subscriptionTier}>
              {tierLabel[subscription?.tier as keyof typeof tierLabel] || 'Darmowy'}
            </Text>
          </View>
          <View style={styles.subscriptionStats}>
            <Text style={styles.statsNumber}>
              {subscription?.quotesThisMonth || 0}
            </Text>
            <Text style={styles.statsLabel}>
              / {subscription?.limits?.quotesPerMonth === Infinity ? '∞' : subscription?.limits?.quotesPerMonth || 10} wycen
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.primary[200]} />
        </Pressable>
      </Link>

      {/* Menu */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Szablony</Text>

        <Link href="/(tabs)/settings/templates" asChild>
          <Pressable style={styles.menuItem}>
            <Ionicons name="construct-outline" size={22} color={colors.text.heading} />
            <Text style={styles.menuItemText}>Szablony usług</Text>
            <Ionicons name="chevron-forward" size={20} color={colors.text.muted} />
          </Pressable>
        </Link>

        <Link href="/(tabs)/settings/materials" asChild>
          <Pressable style={styles.menuItem}>
            <Ionicons name="cart-outline" size={22} color={colors.text.heading} />
            <Text style={styles.menuItemText}>Szablony materiałów</Text>
            <Ionicons name="chevron-forward" size={20} color={colors.text.muted} />
          </Pressable>
        </Link>

        <Link href="/(tabs)/settings/disclaimer" asChild>
          <Pressable style={styles.menuItem}>
            <Ionicons name="document-text-outline" size={22} color={colors.text.heading} />
            <Text style={styles.menuItemText}>Warunki wyceny</Text>
            <Ionicons name="chevron-forward" size={20} color={colors.text.muted} />
          </Pressable>
        </Link>
      </View>

      {/* Logout */}
      <View style={styles.section}>
        <Pressable style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={22} color={colors.error.DEFAULT} />
          <Text style={styles.logoutText}>Wyloguj się</Text>
        </Pressable>
      </View>

      {/* Version */}
      <Text style={styles.version}>Majsterio v1.0.0</Text>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: 20,
    margin: 16,
    borderRadius: borderRadius.xl,
    gap: 16,
    ...shadows.md,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: 24, fontFamily: fontFamily.semibold, color: colors.primary.DEFAULT },
  profileInfo: { flex: 1 },
  profileName: { fontSize: 20, fontFamily: fontFamily.semibold, color: colors.text.heading },
  profileEmail: { fontSize: 14, fontFamily: fontFamily.regular, color: colors.text.body, marginTop: 2 },
  subscriptionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary.DEFAULT,
    padding: 16,
    marginHorizontal: 16,
    borderRadius: borderRadius.xl,
    gap: 12,
    ...shadows.md,
  },
  subscriptionInfo: { flex: 1 },
  subscriptionLabel: { fontSize: 12, fontFamily: fontFamily.regular, color: colors.primary[200] },
  subscriptionTier: { fontSize: 18, fontFamily: fontFamily.semibold, color: colors.white, marginTop: 2 },
  subscriptionStats: { alignItems: 'flex-end' },
  statsNumber: { fontSize: 24, fontFamily: fontFamily.bold, color: colors.white },
  statsLabel: { fontSize: 12, fontFamily: fontFamily.regular, color: colors.primary[200] },
  section: { backgroundColor: colors.surface, marginTop: 16 },
  sectionTitle: {
    fontSize: 12,
    fontFamily: fontFamily.semibold,
    color: colors.text.body,
    padding: 16,
    paddingBottom: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  menuItemText: { flex: 1, fontSize: 16, fontFamily: fontFamily.regular, color: colors.text.heading },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  logoutText: { fontSize: 16, fontFamily: fontFamily.regular, color: colors.error.DEFAULT },
  version: {
    textAlign: 'center',
    fontSize: 12,
    fontFamily: fontFamily.regular,
    color: colors.text.muted,
    marginVertical: 24,
  },
})
