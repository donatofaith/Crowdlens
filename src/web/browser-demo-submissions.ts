/** Browser-only session demo records. Never use these records as verified proof or payment receipts. */
export interface BrowserDemoSubmission {
  id: string
  missionId: string
  missionTitle: string
  place: string
  reward: number
  photoDataUrl: string
  capturedAt: string
  latitude: number
  longitude: number
  accuracyMeters: number
  distanceMeters: number
  radiusMeters: number
  status: 'pending_demo_review' | 'accepted_demo' | 'rejected_demo'
  reviewedAt?: string
}

export type BrowserEvidenceDraft = Omit<BrowserDemoSubmission, 'id' | 'status' | 'reviewedAt'>

export function newBrowserDemoSubmission(draft: BrowserEvidenceDraft): BrowserDemoSubmission {
  return {
    ...draft,
    id: globalThis.crypto?.randomUUID?.() ?? `preview-${Date.now()}`,
    status: 'pending_demo_review',
  }
}

export function reviewBrowserDemoSubmission(
  submission: BrowserDemoSubmission,
  decision: 'accepted_demo' | 'rejected_demo',
): BrowserDemoSubmission {
  if (submission.status !== 'pending_demo_review') return submission
  return { ...submission, status: decision, reviewedAt: new Date().toISOString() }
}
