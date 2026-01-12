import { View, Text, StyleSheet, Animated } from 'react-native'
import { useEffect, useRef } from 'react'
import { Ionicons } from '@expo/vector-icons'
import { useSyncStore } from '../../stores/syncStore'

export function OfflineIndicator() {
  const { isOnline, isSyncing, pendingCount } = useSyncStore()
  const translateY = useRef(new Animated.Value(-100)).current

  useEffect(() => {
    Animated.timing(translateY, {
      toValue: isOnline ? -100 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start()
  }, [isOnline])

  if (isOnline && pendingCount === 0) return null

  return (
    <Animated.View style={[styles.container, { transform: [{ translateY }] }]}>
      {!isOnline ? (
        <>
          <Ionicons name="cloud-offline" size={18} color="white" />
          <Text style={styles.text}>Tryb offline</Text>
          {pendingCount > 0 && (
            <Text style={styles.pending}>({pendingCount} do synchronizacji)</Text>
          )}
        </>
      ) : isSyncing ? (
        <>
          <Ionicons name="sync" size={18} color="white" />
          <Text style={styles.text}>Synchronizacja...</Text>
        </>
      ) : null}
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: '#f59e0b',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingTop: 48, // Safe area
    gap: 8,
    zIndex: 1000,
  },
  text: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  pending: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
  },
})
