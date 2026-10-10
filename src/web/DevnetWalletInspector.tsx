import { useEffect, useState } from 'react'
import {
  devnetExplorerAddress, devnetExplorerTransaction, inspectDevnetAccount,
  type DevnetAccount,
} from './devnet-account'

type Props = { address: string | null }

export default function DevnetWalletInspector({ address }: Props) {
  const [account, setAccount] = useState<DevnetAccount | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    setAccount(null)
    setError('')
  }, [address])

  async function refresh() {
    if (!address) return
    setBusy(true)
    setError('')
    try {
      setAccount(await inspectDevnetAccount(address))
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Unable to contact Solana Devnet.')
    } finally {
      setBusy(false)
    }
  }

  return <section className="panel devnet-inspector">
    <h3>Solana Devnet · Test balance and receipts</h3>
    <p>View test SOL and recent Devnet transactions for the connected wallet. This is read-only: checking a balance never signs or sends a transaction.</p>
    {address ? <>
      <p>Connected wallet: <code>{address.slice(0, 6)}…{address.slice(-6)}</code></p>
      <div className="capture-controls">
        <button className="primary" type="button" disabled={busy} onClick={() => void refresh()}>{busy ? 'Checking Devnet…' : 'Check Devnet balance'}</button>
        <a className="wallet-open-link" target="_blank" rel="noopener noreferrer" href={devnetExplorerAddress(address)}>View on Devnet Explorer ↗</a>
      </div>
      {account && <>
        <div className="devnet-balance"><strong>{account.sol.toLocaleString(undefined, { maximumFractionDigits: 9 })} SOL</strong><small>DEVNET ONLY · No real monetary value</small></div>
        <h4>Recent Devnet transactions</h4>
        {account.transactions.length ? <ul className="devnet-transactions">
          {account.transactions.map((tx) => <li key={tx.signature}>
            <a href={devnetExplorerTransaction(tx.signature)} target="_blank" rel="noopener noreferrer">{tx.signature.slice(0, 12)}…{tx.signature.slice(-6)} ↗</a>
            <span>{tx.err ? 'Failed' : 'Confirmed'} · {tx.blockTime ? new Date(tx.blockTime * 1000).toLocaleString() : 'Time unavailable'}</span>
          </li>)}
        </ul> : <p>No recent Devnet transactions found for this address.</p>}
      </>}
      {error && <p role="alert" className="feedback">{error}</p>}
    </> : <p>Connect a supported Solana wallet above before checking Devnet. The network must be Devnet to sign a future Devnet transaction.</p>}
    <small className="web-wallet-disclaimer">A Devnet SOL balance is not a CrowdLens reward balance. TEST USDC missions are simulated, and this panel never moves tokens.</small>
  </section>
}
