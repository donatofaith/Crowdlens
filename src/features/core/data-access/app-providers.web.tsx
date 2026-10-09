import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { View } from 'react-native'
import type { ReactNode } from 'react'

const client = new QueryClient()

// Solana Mobile Wallet Adapter is an Android-only provider.
// Web wallet connectivity will be introduced separately.
export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={client}>
      <SafeAreaProvider>
        <View style={{ flex: 1, backgroundColor: '#0C0C0D' }}>{children}</View>
      </SafeAreaProvider>
    </QueryClientProvider>
  )
}
