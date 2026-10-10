import { useState } from 'react'
import { createCrowdLensCloud, type CloudMission, type CrowdLensSession } from '../features/cloud/crowdlens-cloud'

const url = process.env.EXPO_PUBLIC_SUPABASE_URL
const publishableKey = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY

export const cloudClient =
  url && publishableKey && !url.includes('your-project') && !publishableKey.includes('your_key')
    ? createCrowdLensCloud({ url, publishableKey })
    : null

type Props = {
  session: CrowdLensSession | null
  onSession(next: CrowdLensSession | null): void
  onMissions(missions: CloudMission[]): void
}

export default function CloudWorkspace({ session, onSession, onMissions }: Props) {
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [otpSent, setOtpSent] = useState(false)
  const [working, setWorking] = useState(false)
  const [status, setStatus] = useState('')
  const [total, setTotal] = useState<number | null>(null)

  async function sendCode() {
    if (!cloudClient) return
    setWorking(true); setStatus('')
    try {
      await cloudClient.requestEmailCode(email.trim(), window.location.origin + window.location.pathname)
      setOtpSent(true)
      setStatus('Check your inbox. If you receive a sign-in link, open it in this browser. If you receive a code, enter it below.')
    } catch (err) { setStatus(err instanceof Error ? err.message : 'Unable to send email code.') }
    finally { setWorking(false) }
  }

  async function verify() {
    if (!cloudClient) return
    setWorking(true); setStatus('')
    try {
      const next = await cloudClient.verifyEmailCode(email.trim(), code.trim())
      onSession(next)
      const rows = await cloudClient.listMissions(next)
      onMissions(rows); setTotal(rows.length)
      setStatus('Signed in. Shared missions refreshed.')
    } catch (err) { setStatus(err instanceof Error ? err.message : 'Could not sign in.') }
    finally { setWorking(false) }
  }

  async function signOut() {
    if (!session) return
    setWorking(true); setStatus('')
    try {
      await cloudClient?.signOut(session)
    } catch {
      // Local sign-out must work even if Supabase is offline or the token expired.
    } finally {
      onSession(null); onMissions([]); setTotal(null)
      setOtpSent(false); setCode('')
      setStatus('Signed out on this device.')
      setWorking(false)
    }
  }

  async function refresh() {
    if (!cloudClient || !session) return
    setWorking(true); setStatus('')
    try {
      if (Date.now() >= session.expiresAt) throw new Error('Session renewal pending. Try again shortly.')
      const rows = await cloudClient.listMissions(session)
      onMissions(rows); setTotal(rows.length)
      setStatus('Missions refreshed from the shared database.')
    } catch (err) { setStatus(err instanceof Error ? err.message : 'Could not refresh missions.') }
    finally { setWorking(false) }
  }

  return <section className="cloud-workspace panel">
    <h3>Shared CrowdLens workspace</h3>
    {!cloudClient ? (
      <p>Cloud sync is not configured yet. Add the Supabase project URL and public key in Vercel to activate sign-in and shared mission storage. The existing browser demo continues working locally.</p>
    ) : session ? (
      <>
        <p>Authenticated cloud account connected. This account is separate from your Solana wallet.</p>
        <p><strong>Shared missions loaded:</strong> {total === null ? 'Not refreshed' : total}</p>
        <div className="capture-controls">
          <button className="primary" disabled={working} onClick={() => void refresh()}>{working ? 'Refreshing…' : 'Refresh shared missions'}</button>
          <button className="secondary-action" disabled={working} onClick={() => void signOut()}>Sign out</button>
        </div>
      </>
    ) : (
      <>
        <p>Sign in by email to share missions between devices. Supabase may email you a sign-in link or a one-time code. Wallet connection alone does not sign you into the database.</p>
        <label>Email address<input type="email" autoComplete="email" value={email} placeholder="you@example.com" onChange={(event) => setEmail(event.target.value)} /></label>
        {otpSent && <label>One-time email code (only if your email contains a code)<input autoComplete="one-time-code" inputMode="numeric" value={code} placeholder="Enter the code" onChange={(event) => setCode(event.target.value)} /></label>}
        <div className="capture-controls">
          {!otpSent ? <button className="primary" disabled={working || !email.includes('@')} onClick={() => void sendCode()}>{working ? 'Sending…' : 'Send sign-in email'}</button> :
            <><button className="primary" disabled={working || !code.trim()} onClick={() => void verify()}>{working ? 'Signing in…' : 'Verify and connect'}</button><button className="secondary-action" onClick={() => { setOtpSent(false); setCode('') }}>Change email</button></>}
        </div>
      </>
    )}
    {status && <p role="status" className="cloud-status">{status}</p>}
    <small className="web-wallet-disclaimer">Cloud sign-in now persists on this browser and is renewed automatically while valid. Use Sign out on shared devices. Proof submissions are not yet connected to this workspace; test rewards are simulated, not payments.</small>
  </section>
}
