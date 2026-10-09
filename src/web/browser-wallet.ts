export type BrowserWallet = {
  isPhantom?: boolean
  isConnected?: boolean
  publicKey?: { toString(): string } | null
  connect(): Promise<{ publicKey: { toString(): string } }>
  disconnect(): Promise<void>
  signMessage?(message: Uint8Array, display?: 'utf8' | 'hex'): Promise<{ signature: Uint8Array }>
  on?(event: 'connect' | 'disconnect' | 'accountChanged', callback: (...args: unknown[]) => void): void
  off?(event: 'connect' | 'disconnect' | 'accountChanged', callback: (...args: unknown[]) => void): void
}
type BrowserWithWallet = Window & {
  phantom?: { solana?: BrowserWallet }
  solana?: BrowserWallet
}

export function getPhantomWallet(): BrowserWallet | null {
  if (typeof window === 'undefined') return null
  const browser = window as BrowserWithWallet
  const wallet = browser.phantom?.solana ?? browser.solana
  return wallet?.isPhantom ? wallet : null
}

export function compactAddress(address: string): string {
  if (address.length < 13) return address
  return address.slice(0, 6) + '…' + address.slice(-6)
}

export function friendlyWalletMessage(error: unknown): string {
  if (error instanceof Error) return error.message
  if (error && typeof error === 'object' && 'message' in error) return String(error.message)
  return 'Wallet request could not be completed.'
}

export function encodeWebMessage(message: string): Uint8Array {
  return new TextEncoder().encode(message)
}
