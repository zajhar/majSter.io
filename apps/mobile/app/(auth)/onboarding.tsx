import { useState } from 'react'
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Alert,
} from 'react-native'
import { router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { trpc } from '../../lib/trpc'
import { colors, fontFamily, borderRadius, shadows } from '../../constants/theme'

export default function OnboardingScreen() {
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  const { data: tradeTypes, isLoading } = trpc.tradeTypes.list.useQuery()
  const setTradeTypesMutation = trpc.userSettings.setTradeTypes.useMutation({
    onSuccess: () => {
      router.replace('/(tabs)')
    },
    onError: (error) => {
      Alert.alert('Błąd', error.message || 'Nie udało się zapisać wyboru')
    },
  })

  const toggleSelection = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    )
  }

  const handleContinue = () => {
    if (selectedIds.length === 0) {
      Alert.alert('Wybierz branże', 'Wybierz przynajmniej jedną branżę, aby kontynuować')
      return
    }
    setTradeTypesMutation.mutate({ tradeTypeIds: selectedIds })
  }

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary.DEFAULT} />
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Wybierz swoje branże</Text>
          <Text style={styles.subtitle}>
            Dzięki temu pokażemy Ci odpowiednie szablony wycen
          </Text>
        </View>

        <View style={styles.grid}>
          {tradeTypes?.map((type) => {
            const isSelected = selectedIds.includes(type.id)
            return (
              <Pressable
                key={type.id}
                style={[styles.card, isSelected && styles.cardSelected]}
                onPress={() => toggleSelection(type.id)}
              >
                <View style={[styles.iconContainer, isSelected && styles.iconContainerSelected]}>
                  <Ionicons
                    name={type.icon as keyof typeof Ionicons.glyphMap}
                    size={28}
                    color={isSelected ? colors.white : colors.primary.DEFAULT}
                  />
                </View>
                <Text style={[styles.cardText, isSelected && styles.cardTextSelected]}>
                  {type.name}
                </Text>
                {isSelected && (
                  <View style={styles.checkmark}>
                    <Ionicons name="checkmark-circle" size={20} color={colors.primary.DEFAULT} />
                  </View>
                )}
              </Pressable>
            )
          })}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Text style={styles.selectedCount}>
          Wybrano: {selectedIds.length} {selectedIds.length === 1 ? 'branża' : selectedIds.length >= 2 && selectedIds.length <= 4 ? 'branże' : 'branż'}
        </Text>
        <Pressable
          style={[
            styles.continueButton,
            selectedIds.length === 0 && styles.continueButtonDisabled,
          ]}
          onPress={handleContinue}
          disabled={selectedIds.length === 0 || setTradeTypesMutation.isPending}
        >
          {setTradeTypesMutation.isPending ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <Text style={styles.continueButtonText}>Kontynuuj</Text>
          )}
        </Pressable>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: 24,
    paddingTop: 60,
    paddingBottom: 120,
  },
  header: {
    marginBottom: 32,
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
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  card: {
    width: '47%',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.border,
    ...shadows.sm,
  },
  cardSelected: {
    borderColor: colors.primary.DEFAULT,
    backgroundColor: colors.primary[50],
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary[100],
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconContainerSelected: {
    backgroundColor: colors.primary.DEFAULT,
  },
  cardText: {
    fontFamily: fontFamily.medium,
    fontSize: 14,
    color: colors.text.heading,
    textAlign: 'center',
  },
  cardTextSelected: {
    color: colors.primary.DEFAULT,
  },
  checkmark: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.surface,
    padding: 24,
    paddingBottom: 40,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    ...shadows.lg,
  },
  selectedCount: {
    fontFamily: fontFamily.regular,
    fontSize: 14,
    color: colors.text.body,
    textAlign: 'center',
    marginBottom: 12,
  },
  continueButton: {
    backgroundColor: colors.primary.DEFAULT,
    padding: 16,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  continueButtonDisabled: {
    backgroundColor: colors.text.muted,
  },
  continueButtonText: {
    color: colors.white,
    fontFamily: fontFamily.semibold,
    fontSize: 18,
  },
})
