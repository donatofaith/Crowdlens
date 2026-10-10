import { useCallback, useEffect, useState } from 'react'
import {
  devnetExplorerAddress, devnetExplorerTransaction, inspectDevnetAccount,
  type DevnetAccount,
} from './devnet-account'

type Props = { address: string }

export default function DevnetWalletInspector({ address }: Props) {
  const [account, setAccount] = useState<DevnetAccount | null>(null)
  const [busy, setBusy] = useState(true)
  const [error, setError] = useState('')
  const [reload, setReload] = useState(0)

  const refresh = useCallback(() => setReload((value) => value + 1), [])

  useEffect(() => {
    let active = true
    void inspectDevnetAccount(address).then((result) => {
      if (!active) return
      setAccount(result)
      setError('')
      setBusy(false)
    }).catch((reason: unknown) => {
      if (!active) return
      setError(reason instanceof Error ? reason.message : 'Unable to contact Solana Devnet.')
      setBusy(false)
    })
    return () => { active = false }
  }, [address, reload])

  return <section className="devnet-inspector" aria-label="Connected wallet Devnet balance">
    <div className="devnet-account-header">
      <div>
        <span className="devnet-network">SOLANA DEVNET</span>
        <div className="devnet-balance" aria-live="polite">
          {busy && !account ? 'Loading balance…' : account ? account.sol.toLocaleString(undefined, { maximumFractionDigits: 9 }) + ' SOL' : 'Balance unavailable'}
        </div>
        <small>Test SOL · No real monetary value</small>
      </div>
      <button className="devnet-refresh" type="button" disabled={busy} onClick={() => { setBusy(true); refresh() }} aria-label="Refresh Devnet balance" title="Refresh Devnet balance">↻</button>
    </div>
    {error && <p role="alert" className="feedback">{error} <button type="button" className="devnet-retry" onClick={() => { setBusy(true); refresh() }}>Retry</button></p>}
    <a className="wallet-open-link devnet-account-link" target="_blank" rel="noopener noreferrer" href={devnetExplorerAddress(address)}>View wallet on Devnet Explorer ↗</a>
    {account && <details className="devnet-history">
      <summary>Recent Devnet transactions ({account.transactions.length})</summary>
      {account.transactions.length ? <ul className="devnet-transactions">
        {account.transactions.map((tx) => <li key={tx.signature}>
          <a href={devnetExplorerTransaction(tx.signature)} target="_blank" rel="noopener noreferrer">{tx.signature.slice(0, 12)}…{tx.signature.slice(-6)} ↗</a>
          <span>{tx.err ? 'Failed' : 'Confirmed'} · {tx.blockTime ? new Date(tx.blockTime * 1000).toLocaleString() : 'Time unavailable'}</span>
        </li>)}
      </ul> : <p>No recent transactions for this wallet on Devnet.</p>}
    </details>}
  </section>
}
