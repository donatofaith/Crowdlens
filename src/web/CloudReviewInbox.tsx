import { useEffect, useState } from 'react'
import type { CloudSubmission, CrowdLensSession } from '../features/cloud/crowdlens-cloud'
import { cloudClient } from './CloudWorkspace'

type Props = {
  session: CrowdLensSession
  submissions: CloudSubmission[]
  onRefresh(): Promise<void>
  onReviewed(): Promise<void>
  missionOwners: Record<string, string>
}

function PrivatePhoto({ session, path }: { session: CrowdLensSession; path: string }) {
  const [url, setUrl] = useState<string | null>(null)
  const [error, setError] = useState('')
  useEffect(() => {
    const client = cloudClient
    if (!client) return
    let active = true
    let localUrl: string | null = null
    void client.getPrivatePhoto(session, path).then((image) => {
      if (!active) return
      localUrl = URL.createObjectURL(image)
      setUrl(localUrl)
    }).catch(() => { if (active) setError('Photo not available for this account.') })
    return () => {
      active = false
      if (localUrl) URL.revokeObjectURL(localUrl)
    }
  }, [path, session])
  if (error) return <p className="feedback">{error}</p>
  return url ? <img className="cloud-proof-image" src={url} alt="Private captured browser evidence" /> : <p className="lead">Loading private photo…</p>
}

export default function CloudReviewInbox({ session, submissions, onRefresh, onReviewed, missionOwners }: Props) {
  const [working, setWorking] = useState<string | null>(null)
  const [message, setMessage] = useState('')
  async function review(submission: CloudSubmission, decision: 'accepted_demo' | 'rejected_demo') {
    if (!cloudClient || working) return
    setWorking(submission.id); setMessage('')
    try {
      await cloudClient.reviewSubmission(session, submission.id, decision)
      await onReviewed()
      setMessage('Saved requester decision to Supabase. This is not a payment or verified proof.')
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Could not record review.')
    } finally { setWorking(null) }
  }
  return <section className="cloud-inbox">
    <div className="section-head"><h3>Shared submissions</h3><button type="button" onClick={() => void onRefresh()}>Refresh cloud activity →</button></div>
    <p className="lead">Only submissions you created, or submissions for missions you own, are visible. Photos remain private in Supabase.</p>
    {submissions.length === 0 ? <div className="panel"><p>No shared submissions available for your account yet.</p></div> : submissions.map((submission) => {
      const requester = missionOwners[submission.mission_id] === session.userId
      return <article key={submission.id} className="cloud-submission-card">
        <div className="eyebrow">BROWSER-REPORTED · UNVERIFIED</div>
        <p>Mission ID: <code>{submission.mission_id.slice(0, 8)}…</code></p>
        <PrivatePhoto session={session} path={submission.photo_path} />
        <p>Reported distance: {Math.round(submission.browser_reported_distance_m)} m · Accuracy: ±{Math.round(submission.browser_reported_accuracy_m)} m</p>
        <p>Submitted: {new Date(submission.created_at).toLocaleString()}</p>
        <strong>{submission.status === 'pending' ? 'Awaiting requester review' : submission.status === 'accepted_demo' ? 'Accepted for demo (no payment)' : 'Rejected for demo'}</strong>
        {requester && submission.status === 'pending' && <div className="capture-controls">
          <button className="secondary-action" disabled={working !== null} onClick={() => void review(submission, 'rejected_demo')}>Reject demo</button>
          <button className="primary" disabled={working !== null} onClick={() => void review(submission, 'accepted_demo')}>{working === submission.id ? 'Saving…' : 'Accept demo'}</button>
        </div>}
      </article>
    })}
    {message && <p role="status" className="feedback">{message}</p>}
    <p className="native-form-note">Demo decisions are database records, not Solana receipts, verified presence, escrow releases, or transfers.</p>
  </section>
}
