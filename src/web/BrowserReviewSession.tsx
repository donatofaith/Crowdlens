import type { BrowserDemoSubmission } from './browser-demo-submissions'

interface Props {
  submissions: readonly BrowserDemoSubmission[]
  onDecision(id: string, status: 'accepted_demo' | 'rejected_demo'): void
  onClear(): void
  onExplore(): void
}

const labels: Record<BrowserDemoSubmission['status'], string> = {
  pending_demo_review: 'Waiting for demo review',
  accepted_demo: 'Accepted locally (demo only)',
  rejected_demo: 'Rejected locally (demo only)',
}

export default function BrowserReviewSession({ submissions, onDecision, onClear, onExplore }: Props) {
  return (
    <section className="web-review-session">
      <div className="eyebrow">BROWSER SESSION DEMO</div>
      <h1>Activity & review</h1>
      <p className="lead">Review captured browser evidence in this tab. This is not an authenticated requester inbox.</p>
      <div className="capture-disclaimer" role="note">
        These decisions are <strong>local simulations only</strong>. They do not verify a scout, pay a reward,
        sync with Android, or record a Solana transaction. Photos and GPS readings disappear when this page reloads.
      </div>
      {submissions.length === 0 ? (
        <div className="panel">
          <h3>No session evidence yet</h3>
          <p>Open a mission, use your camera and GPS, and choose “Add to review demo” to inspect the captured result here.</p>
          <button type="button" className="primary" onClick={onExplore}>Browse missions →</button>
        </div>
      ) : (
        <>
          <div className="web-review-heading"><h3>{submissions.length} session record{submissions.length === 1 ? '' : 's'}</h3><button type="button" className="secondary-action" onClick={onClear}>Clear this session</button></div>
          <div className="web-review-list">
            {submissions.map((submission) => (
              <article className="web-review-card" key={submission.id}>
                <div className="web-review-mission">
                  <span className="eyebrow">UNVERIFIED BROWSER CAPTURE</span>
                  <h3>{submission.missionTitle}</h3>
                  <p>{submission.place} · {submission.reward} test USDC</p>
                </div>
                <img src={submission.photoDataUrl} alt="Browser demo photo awaiting local review" />
                <div className="web-review-metrics">
                  <span>Distance: {Math.round(submission.distanceMeters)} m / {submission.radiusMeters} m radius</span>
                  <span>Reported accuracy: ±{Math.round(submission.accuracyMeters)} m</span>
                  <span>Captured: {new Date(submission.capturedAt).toLocaleString()}</span>
                </div>
                <p className="web-review-status" role="status">{labels[submission.status]}</p>
                {submission.status === 'pending_demo_review' && (
                  <div className="capture-controls">
                    <button type="button" className="secondary-action" onClick={() => onDecision(submission.id, 'rejected_demo')}>Reject demo</button>
                    <button type="button" className="primary" onClick={() => onDecision(submission.id, 'accepted_demo')}>Accept demo</button>
                  </div>
                )}
              </article>
            ))}
          </div>
        </>
      )}
    </section>
  )
}
