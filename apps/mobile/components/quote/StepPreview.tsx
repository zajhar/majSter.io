import { View, Text, ScrollView, Pressable, StyleSheet, TextInput, Switch } from 'react-native'
import { useState } from 'react'
import { Ionicons } from '@expo/vector-icons'
import { useQuoteStore } from '../../stores/quoteStore'
import { trpc } from '../../lib/trpc'
import { DEFAULT_DISCLAIMER } from '@majsterio/shared'
import { colors, fontFamily, borderRadius, shadows } from '../../constants/theme'

interface Props {
  onSubmit: () => void
  isLoading: boolean
}

export function StepPreview({ onSubmit, isLoading }: Props) {
  const { draft, setNotes, setDisclaimer, getTotal, calculateGroupM2 } = useQuoteStore()
  const { data: clients } = trpc.clients.list.useQuery()

  const [notesBefore, setNotesBefore] = useState(draft.notesBefore)
  const [notesAfter, setNotesAfter] = useState(draft.notesAfter)
  const [showDisclaimer, setShowDisclaimer] = useState(draft.showDisclaimer)

  const client = clients?.find((c) => c.id === draft.clientId)
  const total = getTotal()

  const handleSubmit = () => {
    setNotes(notesBefore, notesAfter)
    setDisclaimer(DEFAULT_DISCLAIMER, showDisclaimer)
    onSubmit()
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.previewLabel}>Podgląd wyceny</Text>
        <Text style={styles.total}>{total.toFixed(2)} zł</Text>
      </View>

      {/* Client */}
      {client && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Klient</Text>
          <Text style={styles.clientName}>{client.firstName} {client.lastName}</Text>
          {client.siteAddress && (
            <Text style={styles.clientAddress}>{client.siteAddress}</Text>
          )}
        </View>
      )}

      {/* Notes Before */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Notatki (przed wycenką)</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="np. Wycena obejmuje..."
          placeholderTextColor={colors.text.muted}
          value={notesBefore}
          onChangeText={setNotesBefore}
          multiline
          numberOfLines={3}
        />
      </View>

      {/* Groups Summary */}
      {draft.groups.map((group) => {
        const m2 = calculateGroupM2(group)
        const groupTotal = group.services.reduce((sum, s) => {
          let qty = s.quantity
          if (s.quantitySource === 'floor' && m2.floor) qty = m2.floor
          if (s.quantitySource === 'walls' && m2.walls) qty = m2.walls
          if (s.quantitySource === 'ceiling' && m2.ceiling) qty = m2.ceiling
          if (s.quantitySource === 'walls_ceiling') qty = (m2.walls + m2.ceiling) || s.quantity
          return sum + qty * s.pricePerUnit
        }, 0)

        return (
          <View key={group.id} style={styles.groupCard}>
            <View style={styles.groupHeader}>
              <Text style={styles.groupName}>{group.name}</Text>
              <Text style={styles.groupTotal}>{groupTotal.toFixed(0)} zł</Text>
            </View>
            {group.services.map((service) => (
              <View key={service.id} style={styles.serviceRow}>
                <Text style={styles.serviceName}>{service.name}</Text>
                <Text style={styles.servicePrice}>
                  {service.quantity} {service.unit} × {service.pricePerUnit} zł
                </Text>
              </View>
            ))}
          </View>
        )
      })}

      {/* Materials Summary */}
      {draft.materials.length > 0 && (
        <View style={styles.groupCard}>
          <View style={styles.groupHeader}>
            <Text style={styles.groupName}>Materiały</Text>
            <Text style={styles.groupTotal}>
              {draft.materials.reduce((s, m) => s + m.quantity * m.pricePerUnit, 0).toFixed(0)} zł
            </Text>
          </View>
          {draft.materials.map((material) => (
            <View key={material.id} style={styles.serviceRow}>
              <Text style={styles.serviceName}>{material.name}</Text>
              <Text style={styles.servicePrice}>
                {material.quantity} {material.unit} × {material.pricePerUnit} zł
              </Text>
            </View>
          ))}
        </View>
      )}

      {/* Notes After */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Notatki (po wycence)</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="np. Termin realizacji..."
          placeholderTextColor={colors.text.muted}
          value={notesAfter}
          onChangeText={setNotesAfter}
          multiline
          numberOfLines={3}
        />
      </View>

      {/* Disclaimer */}
      <View style={styles.disclaimerSection}>
        <View style={styles.disclaimerHeader}>
          <Text style={styles.sectionTitle}>Warunki</Text>
          <Switch
            value={showDisclaimer}
            onValueChange={setShowDisclaimer}
            trackColor={{ true: colors.primary.DEFAULT }}
          />
        </View>
        {showDisclaimer && (
          <Text style={styles.disclaimerText}>{DEFAULT_DISCLAIMER}</Text>
        )}
      </View>

      {/* Submit */}
      <Pressable
        style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
        onPress={handleSubmit}
        disabled={isLoading}
      >
        <Ionicons name="checkmark-circle" size={24} color="white" />
        <Text style={styles.submitButtonText}>
          {isLoading ? 'Zapisywanie...' : 'Utwórz wycenę'}
        </Text>
      </Pressable>

      <View style={styles.spacer} />
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    backgroundColor: colors.primary.DEFAULT,
    padding: 24,
    alignItems: 'center',
  },
  previewLabel: {
    fontSize: 14,
    fontFamily: fontFamily.regular,
    color: colors.primary[200],
  },
  total: {
    fontSize: 42,
    fontFamily: fontFamily.bold,
    color: colors.white,
    marginTop: 8,
  },
  section: {
    backgroundColor: colors.surface,
    padding: 16,
    marginTop: 12,
  },
  sectionTitle: {
    fontSize: 12,
    fontFamily: fontFamily.semibold,
    color: colors.text.muted,
    marginBottom: 8,
  },
  clientName: {
    fontSize: 18,
    fontFamily: fontFamily.semibold,
    color: colors.text.heading,
  },
  clientAddress: {
    fontSize: 14,
    fontFamily: fontFamily.regular,
    color: colors.text.muted,
    marginTop: 4,
  },
  input: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    borderRadius: borderRadius.md,
    fontSize: 16,
    fontFamily: fontFamily.regular,
    color: colors.text.heading,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  groupCard: {
    backgroundColor: colors.surface,
    padding: 16,
    marginTop: 12,
  },
  groupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  groupName: {
    fontSize: 16,
    fontFamily: fontFamily.semibold,
    color: colors.text.heading,
  },
  groupTotal: {
    fontSize: 16,
    fontFamily: fontFamily.semibold,
    color: colors.primary.DEFAULT,
  },
  serviceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  serviceName: {
    fontSize: 14,
    fontFamily: fontFamily.regular,
    color: colors.text.body,
  },
  servicePrice: {
    fontSize: 14,
    fontFamily: fontFamily.regular,
    color: colors.text.muted,
  },
  disclaimerSection: {
    backgroundColor: colors.surface,
    padding: 16,
    marginTop: 12,
  },
  disclaimerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  disclaimerText: {
    fontSize: 12,
    fontFamily: fontFamily.regular,
    color: colors.text.muted,
    marginTop: 12,
    lineHeight: 18,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.success.DEFAULT,
    padding: 18,
    margin: 16,
    borderRadius: borderRadius.md,
    gap: 8,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    color: colors.white,
    fontSize: 18,
    fontFamily: fontFamily.semibold,
  },
  spacer: {
    height: 32,
  },
})
