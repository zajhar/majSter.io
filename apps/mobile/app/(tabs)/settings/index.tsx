import { View, Text, ScrollView, Pressable, StyleSheet, Alert } from 'react-native'
import { Link } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { useAuthStore } from '../../../stores/authStore'
import { trpc } from '../../../lib/trpc'

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
          <Ionicons name="chevron-forward" size={20} color="#bfdbfe" />
        </Pressable>
      </Link>

      {/* Menu */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Szablony</Text>

        <Link href="/(tabs)/settings/templates" asChild>
          <Pressable style={styles.menuItem}>
            <Ionicons name="construct-outline" size={22} color="#374151" />
            <Text style={styles.menuItemText}>Szablony usług</Text>
            <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
          </Pressable>
        </Link>

        <Link href="/(tabs)/settings/materials" asChild>
          <Pressable style={styles.menuItem}>
            <Ionicons name="cart-outline" size={22} color="#374151" />
            <Text style={styles.menuItemText}>Szablony materiałów</Text>
            <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
          </Pressable>
        </Link>

        <Link href="/(tabs)/settings/disclaimer" asChild>
          <Pressable style={styles.menuItem}>
            <Ionicons name="document-text-outline" size={22} color="#374151" />
            <Text style={styles.menuItemText}>Warunki wyceny</Text>
            <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
          </Pressable>
        </Link>
      </View>

      {/* Logout */}
      <View style={styles.section}>
        <Pressable style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={22} color="#dc2626" />
          <Text style={styles.logoutText}>Wyloguj się</Text>
        </Pressable>
      </View>

      {/* Version */}
      <Text style={styles.version}>Majsterio v1.0.0</Text>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 20,
    margin: 16,
    borderRadius: 12,
    gap: 16,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#dbeafe',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: 24, fontWeight: '600', color: '#2563eb' },
  profileInfo: { flex: 1 },
  profileName: { fontSize: 20, fontWeight: '600', color: '#1f2937' },
  profileEmail: { fontSize: 14, color: '#6b7280', marginTop: 2 },
  subscriptionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2563eb',
    padding: 16,
    marginHorizontal: 16,
    borderRadius: 12,
    gap: 12,
  },
  subscriptionInfo: { flex: 1 },
  subscriptionLabel: { fontSize: 12, color: '#bfdbfe' },
  subscriptionTier: { fontSize: 18, fontWeight: '600', color: 'white', marginTop: 2 },
  subscriptionStats: { alignItems: 'flex-end' },
  statsNumber: { fontSize: 24, fontWeight: '700', color: 'white' },
  statsLabel: { fontSize: 12, color: '#bfdbfe' },
  section: { backgroundColor: 'white', marginTop: 16 },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
    padding: 16,
    paddingBottom: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  menuItemText: { flex: 1, fontSize: 16, color: '#374151' },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  logoutText: { fontSize: 16, color: '#dc2626' },
  version: {
    textAlign: 'center',
    fontSize: 12,
    color: '#9ca3af',
    marginVertical: 24,
  },
})
