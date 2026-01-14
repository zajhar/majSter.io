import {
  forwardRef,
  useImperativeHandle,
  useState,
  useCallback,
} from 'react'
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Modal,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { trpc } from '../../lib/trpc'
import { colors, fontFamily, borderRadius, shadows } from '../../constants/theme'

export interface AddClientBottomSheetRef {
  open: () => void
  close: () => void
}

interface Props {
  onClientCreated: (clientId: string) => void
}

interface FormState {
  firstName: string
  lastName: string
  phone: string
  siteAddress: string
}

interface FormErrors {
  firstName?: string
  lastName?: string
}

const initialFormState: FormState = {
  firstName: '',
  lastName: '',
  phone: '',
  siteAddress: '',
}

export const AddClientBottomSheet = forwardRef<AddClientBottomSheetRef, Props>(
  ({ onClientCreated }, ref) => {
    const insets = useSafeAreaInsets()
    const [visible, setVisible] = useState(false)
    const [form, setForm] = useState<FormState>(initialFormState)
    const [errors, setErrors] = useState<FormErrors>({})

    const createClientMutation = trpc.clients.create.useMutation()

    useImperativeHandle(ref, () => ({
      open: () => {
        setForm(initialFormState)
        setErrors({})
        setVisible(true)
      },
      close: () => setVisible(false),
    }))

    const validate = useCallback((): boolean => {
      const newErrors: FormErrors = {}

      if (!form.firstName.trim()) {
        newErrors.firstName = 'Imię jest wymagane'
      }
      if (!form.lastName.trim()) {
        newErrors.lastName = 'Nazwisko jest wymagane'
      }

      setErrors(newErrors)
      return Object.keys(newErrors).length === 0
    }, [form])

    const handleSubmit = useCallback(async () => {
      if (!validate()) return

      try {
        const result = await createClientMutation.mutateAsync({
          firstName: form.firstName.trim(),
          lastName: form.lastName.trim(),
          phone: form.phone.trim() || undefined,
          siteAddress: form.siteAddress.trim() || undefined,
        })

        setVisible(false)
        onClientCreated(result.id)
      } catch (error) {
        // Error will be shown via mutation state
      }
    }, [form, validate, createClientMutation, onClientCreated])

    const updateField = (field: keyof FormState) => (value: string) => {
      setForm((prev) => ({ ...prev, [field]: value }))
      if (errors[field as keyof FormErrors]) {
        setErrors((prev) => ({ ...prev, [field]: undefined }))
      }
    }

    return (
      <Modal
        visible={visible}
        animationType="slide"
        transparent
        onRequestClose={() => setVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.overlay}
        >
          <Pressable style={styles.backdrop} onPress={() => setVisible(false)} />

          <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 16) }]}>
            {/* Handle */}
            <View style={styles.handleContainer}>
              <View style={styles.handle} />
            </View>

            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.title}>Nowy klient</Text>
              <Pressable onPress={() => setVisible(false)} hitSlop={8}>
                <Ionicons name="close" size={24} color={colors.text.body} />
              </Pressable>
            </View>

            {/* Form */}
            <View style={styles.form}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>
                  Imię <Text style={styles.required}>*</Text>
                </Text>
                <TextInput
                  style={[styles.input, errors.firstName && styles.inputError]}
                  placeholder="Jan"
                  placeholderTextColor={colors.text.muted}
                  value={form.firstName}
                  onChangeText={updateField('firstName')}
                  autoCapitalize="words"
                  autoFocus
                />
                {errors.firstName && (
                  <Text style={styles.errorText}>{errors.firstName}</Text>
                )}
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>
                  Nazwisko <Text style={styles.required}>*</Text>
                </Text>
                <TextInput
                  style={[styles.input, errors.lastName && styles.inputError]}
                  placeholder="Kowalski"
                  placeholderTextColor={colors.text.muted}
                  value={form.lastName}
                  onChangeText={updateField('lastName')}
                  autoCapitalize="words"
                />
                {errors.lastName && (
                  <Text style={styles.errorText}>{errors.lastName}</Text>
                )}
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Telefon</Text>
                <TextInput
                  style={styles.input}
                  placeholder="+48 600 123 456"
                  placeholderTextColor={colors.text.muted}
                  value={form.phone}
                  onChangeText={updateField('phone')}
                  keyboardType="phone-pad"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Adres budowy</Text>
                <TextInput
                  style={styles.input}
                  placeholder="ul. Kwiatowa 5, Warszawa"
                  placeholderTextColor={colors.text.muted}
                  value={form.siteAddress}
                  onChangeText={updateField('siteAddress')}
                  autoCapitalize="sentences"
                />
              </View>
            </View>

            {/* Submit button */}
            <Pressable
              style={[
                styles.submitButton,
                createClientMutation.isPending && styles.submitButtonDisabled,
              ]}
              onPress={handleSubmit}
              disabled={createClientMutation.isPending}
            >
              {createClientMutation.isPending ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.submitButtonText}>Dodaj klienta</Text>
              )}
            </Pressable>

            {createClientMutation.isError && (
              <Text style={styles.serverError}>
                Nie udało się dodać klienta. Spróbuj ponownie.
              </Text>
            )}
          </View>
        </KeyboardAvoidingView>
      </Modal>
    )
  }
)

AddClientBottomSheet.displayName = 'AddClientBottomSheet'

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    paddingHorizontal: 16,
    ...shadows.lg,
  },
  handleContainer: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  handle: {
    width: 36,
    height: 4,
    backgroundColor: colors.border,
    borderRadius: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontFamily: fontFamily.semibold,
    color: colors.text.heading,
  },
  form: {
    gap: 16,
  },
  inputGroup: {
    gap: 4,
  },
  label: {
    fontSize: 14,
    fontFamily: fontFamily.medium,
    color: colors.text.heading,
    marginBottom: 4,
  },
  required: {
    color: colors.error.DEFAULT,
  },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    fontFamily: fontFamily.regular,
    color: colors.text.heading,
  },
  inputError: {
    borderColor: colors.error.DEFAULT,
    backgroundColor: colors.error[50],
  },
  errorText: {
    fontSize: 13,
    fontFamily: fontFamily.regular,
    color: colors.error.DEFAULT,
    marginTop: 4,
  },
  submitButton: {
    backgroundColor: colors.primary.DEFAULT,
    borderRadius: borderRadius.md,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 24,
  },
  submitButtonDisabled: {
    backgroundColor: colors.primary[300],
  },
  submitButtonText: {
    fontSize: 16,
    fontFamily: fontFamily.semibold,
    color: colors.white,
  },
  serverError: {
    fontSize: 14,
    fontFamily: fontFamily.regular,
    color: colors.error.DEFAULT,
    textAlign: 'center',
    marginTop: 12,
  },
})
