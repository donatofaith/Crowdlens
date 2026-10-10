/**
 * Read-only Solana Devnet inspector. This module never constructs or signs
 * transactions and never sends SOL or SPL tokens.
 *
 * The public RPC endpoint is rate-limited and may fail from some browsers.
 * A dedicated RPC provider should be used before production deployment.
 */
const RPC_URL = 'https://api.devnet.solana.com'
const LAMPORTS_PER_SOL = 1_000_000_000

export interface DevnetSignature {
  signature: string
  slot: number
  blockTime: number | null
  err: unknown | null
  memo: string | null
}

export interface DevnetAccount {
  address: string
  sol: number
  lamports: number
  transactions: DevnetSignature[]
}

export function devnetExplorerAddress(address: string): string {
  return 'https://explorer.solana.com/address/' + encodeURIComponent(address) + '?cluster=devnet'
}
export function devnetExplorerTransaction(signature: string): string {
  return 'https://explorer.solana.com/tx/' + encodeURIComponent(signature) + '?cluster=devnet'
}

function validateBase58(value: string, kind: string): void {
  if (!/^[1-9A-HJ-NP-Za-km-z]{32,88}$/.test(value)) {
    throw new Error('Invalid Solana ' + kind + '.')
  }
}

async function rpc<T>(method: string, params: unknown[]): Promise<T> {
  const response = await fetch(RPC_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ jsonrpc: '2.0', id: 1, method, params }),
  })
  if (!response.ok) throw new Error('Devnet RPC unavailable (HTTP ' + response.status + '). Try again later.')
  const body = await response.json() as { result?: T; error?: { message?: string } }
  if (body.error) throw new Error('Devnet RPC: ' + (body.error.message ?? 'Unknown error.'))
  if (body.result === undefined) throw new Error('Devnet RPC returned no result.')
  return body.result
}

export async function inspectDevnetAccount(address: string): Promise<DevnetAccount> {
  validateBase58(address, 'wallet address')
  const [balance, transactions] = await Promise.all([
    rpc<{ value: number }>('getBalance', [address, { commitment: 'confirmed' }]),
    rpc<DevnetSignature[]>('getSignaturesForAddress', [address, { limit: 5, commitment: 'confirmed' }]),
  ])
  if (!Number.isSafeInteger(balance.value) || balance.value < 0) {
    throw new Error('Devnet returned an invalid balance.')
  }
  return { address, lamports: balance.value, sol: balance.value / LAMPORTS_PER_SOL, transactions }
}
