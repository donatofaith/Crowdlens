import Ionicons from '@expo/vector-icons/Ionicons'
import type { ButtonRootProps } from 'heroui-native/button'
import type { PropsWithChildren } from 'react'
import { useState } from 'react'
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native'

import { formatError } from '@/features/wallet/util/format-error'

function getErrorCode(error: unknown) {
  if (error !== null && typeof error === 'object' && 'code' in error) {
    return String(error.code)
  }
  return ''
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message
  if (error !== null && typeof error === 'object' && 'message' in error) return String(error.message)
  return typeof error === 'string' ? error : ''
}

function friendlyWalletError(error: unknown) {
  const code = getErrorCode(error)
  const message = getErrorMessage(error)

  if (
    code === 'ERROR_ASSOCIATION_CANCELLED' ||
    message.includes('CancellationException') ||
    message.includes('Local association cancelled by user')
  ) {
    return 'Wallet request was closed before authorization finished.'
  }

  if (message.includes('CLOSED') || message.includes('closed')) {
    return 'Wallet session closed. Open a compatible Solana wallet, then try again.'
  }

  return formatError(error)
}

export function WalletUiConnectButton({
  children = 'Connect Wallet',
  connect,
  size,
}: PropsWithChildren<{ connect: () => Promise<unknown>; size?: ButtonRootProps['size'] }>) {
  const [connecting, setConnecting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleConnect() {
    if (connecting) return
    setConnecting(true)
    setError(null)

    try {
      await connect()
    } catch (err) {
      setError(friendlyWalletError(err))
    } finally {
      setConnecting(false)
    }
  }

  const compact = size === 'sm'

  return (
    <View style={styles.wrap}>
      <Pressable
        disabled={connecting}
        onPress={() => void handleConnect()}
        style={({ pressed }) => [
          styles.button,
          compact && styles.buttonCompact,
          pressed && !connecting && styles.buttonPressed,
          connecting && styles.buttonDisabled,
        ]}
      >
        <View style={styles.iconShell}>
          {connecting ? (
            <ActivityIndicator color="#FF7A18" size="small" />
          ) : (
            <Ionicons color="#FF7A18" name="wallet-outline" size={18} />
          )}
        </View>
        <Text style={styles.label}>{connecting ? 'Opening wallet…' : children}</Text>
        <View style={styles.arrowShell}>
          <Ionicons color="#0A0A0B" name="arrow-forward" size={17} />
        </View>
      </Pressable>

      {error ? (
        <Pressable onPress={() => setError(null)} style={styles.errorCard}>
          <Ionicons color="#FF8B7D" name="alert-circle-outline" size={18} />
          <Text style={styles.errorText}>{error}</Text>
          <Ionicons color="#7D5550" name="close" size={16} />
        </Pressable>
      ) : null}
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: { width: '100%', gap: 8 },
  button: {
    minHeight: 58,
    borderRadius: 21,
    backgroundColor: '#111113',
    borderWidth: 1,
    borderColor: '#2B2B2E',
    paddingLeft: 8,
    paddingRight: 7,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000000',
    shadowOpacity: 0.34,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 7 },
  },
  buttonCompact: { minHeight: 48, borderRadius: 17 },
  buttonPressed: { transform: [{ translateY: 2 }], elevation: 3 },
  buttonDisabled: { opacity: 0.72 },
  iconShell: {
    width: 42,
    height: 42,
    borderRadius: 15,
    backgroundColor: '#24160F',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },
  label: { flex: 1, color: '#FFFFFF', fontSize: 12, fontWeight: '900' },
  arrowShell: {
    width: 42,
    height: 42,
    borderRadius: 15,
    backgroundColor: '#FF6A00',
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorCard: {
    minHeight: 48,
    borderRadius: 16,
    backgroundColor: '#281716',
    borderWidth: 1,
    borderColor: '#4A2622',
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
  },
  errorText: { flex: 1, color: '#E7A39B', fontSize: 10, lineHeight: 15, fontWeight: '700' },
})