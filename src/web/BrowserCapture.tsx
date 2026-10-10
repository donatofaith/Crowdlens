import { useEffect, useRef, useState } from 'react'
import type { Mission } from '../features/missions/data-access/mission-model'
import type { BrowserEvidenceDraft } from './browser-demo-submissions'

type LocationReading = { latitude: number; longitude: number; accuracy: number; distance: number; timestamp: string }
type Evidence = { photo: string; reading: LocationReading }
type Props = { mission: Mission; onBack(): void; onQueueReview(draft: BrowserEvidenceDraft): void; onSubmitCloud?: (draft: BrowserEvidenceDraft) => Promise<void> }

function distanceMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const radius = 6371000
  const radians = (degrees: number) => degrees * Math.PI / 180
  const dLat = radians(lat2 - lat1)
  const dLon = radians(lon2 - lon1)
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(radians(lat1)) * Math.cos(radians(lat2)) * Math.sin(dLon / 2) ** 2
  return 2 * radius * Math.asin(Math.min(1, Math.sqrt(a)))
}

function readBrowserLocation(mission: Mission): Promise<LocationReading> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('This browser does not support geolocation.'))
      return
    }
    navigator.geolocation.getCurrentPosition(
      ({ coords, timestamp }) => {
        if (!Number.isFinite(coords.latitude) || !Number.isFinite(coords.longitude)) {
          reject(new Error('Browser returned invalid GPS coordinates.'))
          return
        }
        resolve({
          latitude: coords.latitude,
          longitude: coords.longitude,
          accuracy: coords.accuracy,
          distance: distanceMeters(coords.latitude, coords.longitude, mission.targetLat, mission.targetLon),
          timestamp: new Date(timestamp).toISOString(),
        })
      },
      (error) => reject(new Error(error.message || 'Could not read browser location.')),
      { enableHighAccuracy: true, maximumAge: 0, timeout: 15000 },
    )
  })
}

export default function BrowserCapture({ mission, onBack, onQueueReview, onSubmitCloud }: Props) {
  const video = useRef<HTMLVideoElement>(null)
  const stream = useRef<MediaStream | null>(null)
  const [cameraStarted, setCameraStarted] = useState(false)
  const [busy, setBusy] = useState(false)
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const [location, setLocation] = useState<LocationReading | null>(null)
  const [evidence, setEvidence] = useState<Evidence | null>(null)

  useEffect(() => {
    return () => {
      stream.current?.getTracks().forEach((track) => track.stop())
      stream.current = null
    }
  }, [])

  async function startCamera() {
    setError('')
    if (!navigator.mediaDevices?.getUserMedia) {
      setError('Live camera is unavailable here. Use HTTPS and allow camera access.')
      return
    }
    setBusy(true)
    try {
      const media = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: 'environment' } }, audio: false })
      stream.current?.getTracks().forEach((track) => track.stop())
      stream.current = media
      if (video.current) {
        video.current.srcObject = media
        await video.current.play()
      }
      setCameraStarted(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not open the camera.')
    } finally {
      setBusy(false)
    }
  }

  async function checkLocation() {
    setBusy(true)
    setError('')
    try {
      setLocation(await readBrowserLocation(mission))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Location check failed.')
    } finally {
      setBusy(false)
    }
  }

  async function capture() {
    const feed = video.current
    if (!feed || !stream.current?.active || feed.videoWidth === 0 || feed.videoHeight === 0) {
      setError('Start the camera and wait for a live video feed.')
      return
    }
    setBusy(true)
    setError('')
    try {
      // Browser GPS is re-read immediately before taking the photo, not trusted from an old check.
      const reading = await readBrowserLocation(mission)
      setLocation(reading)
      const canvas = document.createElement('canvas')
      const ratio = Math.min(1, 1280 / feed.videoWidth)
      canvas.width = Math.max(1, Math.round(feed.videoWidth * ratio))
      canvas.height = Math.max(1, Math.round(feed.videoHeight * ratio))
      const context = canvas.getContext('2d')
      if (!context) throw new Error('Browser cannot capture the video frame.')
      context.drawImage(feed, 0, 0, canvas.width, canvas.height)
      const photo = canvas.toDataURL('image/jpeg', 0.8)
      setEvidence({ photo, reading })
      stream.current?.getTracks().forEach((track) => track.stop())
      stream.current = null
      setCameraStarted(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not capture preview evidence.')
    } finally {
      setBusy(false)
    }
  }

  const draft = evidence ? { missionId: mission.id, missionTitle: mission.title, place: mission.place, reward: mission.reward, photoDataUrl: evidence.photo, capturedAt: evidence.reading.timestamp, latitude: evidence.reading.latitude, longitude: evidence.reading.longitude, accuracyMeters: evidence.reading.accuracy, distanceMeters: evidence.reading.distance, radiusMeters: mission.radius } : null
  async function submitCloud() {
    if (!draft || !onSubmitCloud) return
    setSending(true); setError('')
    try { await onSubmitCloud(draft); setSent(true) }
    catch (error) { setError(error instanceof Error ? error.message : 'Could not submit cloud proof.') }
    finally { setSending(false) }
  }
  function reset() {
    setEvidence(null)
    setSent(false)
    setLocation(null)
    setCameraStarted(false)
    setError('')
  }

  const status = location
    ? (location.distance <= mission.radius ? 'Browser position reports inside the mission radius' : 'Browser position reports outside the mission radius')
    : 'Location not checked'
  return (
    <section className="browser-capture">
      <button type="button" className="back" onClick={onBack}>← Back to mission</button>
      <div className="eyebrow">SCOUT · WEB CAPTURE PREVIEW</div>
      <h1>Capture proof</h1>
      <p className="lead">{mission.title} · {mission.place}</p>
      <div className="capture-disclaimer" role="note">
        Browser location and camera readings are <strong>unverified preview evidence</strong>, not Android Proof of Presence.
        You may add the captured photo to a local demo. If signed in and viewing a shared mission, you can separately choose to upload unverified evidence privately for requester review. No payment or presence verification is performed.
      </div>
      <div className="capture-frame">
        {evidence ? (
          <img src={evidence.photo} alt="Locally captured browser camera preview" />
        ) : (
          <video ref={video} autoPlay muted playsInline aria-label="Live camera feed" />
        )}
        {!evidence && !cameraStarted && <div className="camera-empty">▣<span>Live camera preview</span></div>}
      </div>
      <div className="capture-controls">
        {!cameraStarted && !evidence && <button type="button" className="primary" onClick={() => void startCamera()} disabled={busy}>{busy ? 'Opening camera…' : 'Start live camera'}</button>}
        {cameraStarted && <button type="button" className="primary" onClick={() => void capture()} disabled={busy}>{busy ? 'Checking GPS…' : 'Capture photo + GPS'}</button>}
        {!evidence && <button type="button" className="secondary-action" onClick={() => void checkLocation()} disabled={busy}>{busy ? 'Checking…' : 'Check GPS location'}</button>}
        {evidence && <button type="button" className="secondary-action" onClick={reset}>Retake preview</button>}
        {draft && <button type="button" className="secondary-action" onClick={() => onQueueReview(draft)}>Add to local demo</button>}
        {draft && onSubmitCloud && <button type="button" className="primary" disabled={sending || sent} onClick={() => void submitCloud()}>{sending ? 'Uploading privately…' : sent ? 'Submitted to cloud' : 'Submit unverified cloud evidence'}</button>}
      </div>
      {error && <p className="capture-error" role="alert">{error}</p>}
      <div className="capture-summary">
        <h3>{evidence ? 'Captured browser evidence (local only)' : 'Location check'}</h3>
        <p>{status}</p>
        {location && <>
          <p>Reported distance: {Math.round(location.distance)} m · Mission radius: {mission.radius} m</p>
          <p>Browser-reported accuracy: ±{Math.round(location.accuracy)} m</p>
          <p>Reading time: {location.timestamp}</p>
        </>}
        {evidence && <p className="capture-success">Photo captured in this browser session. You can send it to a temporary on-device demo review; no proof is verified or uploaded.</p>}
      </div>
    </section>
  )
}
