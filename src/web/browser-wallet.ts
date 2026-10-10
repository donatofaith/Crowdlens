export type BrowserWallet = {
  isPhantom?: boolean
  isSolflare?: boolean
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
  trustwallet?: { solana?: BrowserWallet }
  solflare?: BrowserWallet
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

export type WalletChoice = 'phantom' | 'trust' | 'solflare'
export const WALLET_LABELS: Record<WalletChoice, string> = {
  phantom: 'Phantom',
  trust: 'Trust Wallet',
  solflare: 'Solflare',
}

/** Only identify actual Solana injected providers. EVM providers are not compatible. */
export function getBrowserWallet(choice: WalletChoice): BrowserWallet | null {
  if (typeof window === 'undefined') return null
  const browser = window as BrowserWithWallet
  if (choice === 'trust') return browser.trustwallet?.solana ?? null
  if (choice === 'solflare') return browser.solflare ?? (browser.solana?.isSolflare ? browser.solana : null)
  return getPhantomWallet()
}

export function availableBrowserWallets(): WalletChoice[] {
  return (['phantom', 'trust', 'solflare'] as WalletChoice[]).filter((choice) => Boolean(getBrowserWallet(choice)))
}

export const CROWDLENS_WEB_URL = 'https://crowdlens-tawny.vercel.app/'
/**
 * Trust Wallet's documented open_url deep link requests the dApp browser.
 * Only the fixed app origin is used; never put Auth callback tokens in URLs.
 * This opens the app but does not itself establish a wallet connection.
 */
export const TRUST_WALLET_DAPP_URL = 'https://link.trustwallet.com/open_url?coin_id=501&url=' +
  encodeURIComponent(CROWDLENS_WEB_URL)
