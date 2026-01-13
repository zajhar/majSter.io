import { View, Text, Pressable, StyleSheet, ActivityIndicator } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { colors, fontFamily, borderRadius } from '../../constants/theme'

interface SyncErrorBannerProps {
  message: string
  isRetrying: boolean
  onRetry: () => void
  onDismiss?: () => void
}

export function SyncErrorBanner({
  message,
  isRetrying,
  onRetry,
  onDismiss,
}: SyncErrorBannerProps) {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Ionicons name="alert-circle" size={20} color={colors.error.DEFAULT} />
        <View style={styles.textContainer}>
          <Text style={styles.title}>Błąd synchronizacji</Text>
          <Text style={styles.message} numberOfLines={2}>
            {message}
          </Text>
        </View>
      </View>

      <View style={styles.actions}>
        {onDismiss && (
          <Pressable
            style={styles.dismissButton}
            onPress={onDismiss}
            disabled={isRetrying}
          >
            <Text style={styles.dismissText}>Odrzuć</Text>
          </Pressable>
        )}

        <Pressable
          style={[styles.retryButton, isRetrying && styles.retryButtonDisabled]}
          onPress={onRetry}
          disabled={isRetrying}
        >
          {isRetrying ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <>
              <Ionicons name="refresh" size={16} color="white" />
              <Text style={styles.retryText}>Ponów</Text>
            </>
          )}
        </Pressable>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.error[50],
    borderWidth: 1,
    borderColor: colors.error[100],
    borderRadius: borderRadius.md,
    padding: 12,
    marginHorizontal: 16,
    marginTop: 8,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontFamily: fontFamily.semibold,
    color: colors.error[700],
  },
  message: {
    fontSize: 13,
    fontFamily: fontFamily.regular,
    color: colors.error[600],
    marginTop: 2,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 12,
    marginTop: 10,
  },
  dismissButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  dismissText: {
    fontSize: 14,
    fontFamily: fontFamily.medium,
    color: colors.text.body,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.error.DEFAULT,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: borderRadius.sm,
  },
  retryButtonDisabled: {
    backgroundColor: colors.error[500],
    opacity: 0.6,
  },
  retryText: {
    fontSize: 14,
    fontFamily: fontFamily.medium,
    color: colors.white,
  },
})
