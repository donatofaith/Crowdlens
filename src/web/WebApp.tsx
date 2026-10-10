import { useEffect, useMemo, useState } from 'react'
import BrowserCapture from './BrowserCapture'
import DevnetWalletInspector from './DevnetWalletInspector'
import CloudWorkspace, { cloudClient } from './CloudWorkspace'
import { persistCloudSession, readSavedCloudSession } from './cloud-session-storage'
import type { CloudMission, CrowdLensSession } from '../features/cloud/crowdlens-cloud'
import BrowserReviewSession from './BrowserReviewSession'
import CloudReviewInbox from './CloudReviewInbox'
import type { CloudSubmission } from '../features/cloud/crowdlens-cloud'
import { newBrowserDemoSubmission, reviewBrowserDemoSubmission } from './browser-demo-submissions'
import type { BrowserDemoSubmission, BrowserEvidenceDraft } from './browser-demo-submissions'
import { availableBrowserWallets, compactAddress, encodeWebMessage, friendlyWalletMessage, getBrowserWallet, TRUST_WALLET_DAPP_URL, WALLET_LABELS, type WalletChoice } from './browser-wallet'
import { DEFAULT_MISSIONS } from '../features/missions/data-access/mission-model'
import { MISSION_RADII, sortMissions, validateMissionDraft, type MissionSort } from '../features/missions/data-access/mission-rules'
import type { Mission as SharedMission } from '../features/missions/data-access/mission-model'

function connectedWalletOnLoad(): { provider: WalletChoice; address: string | null } {
  for (const provider of ['trust', 'phantom', 'solflare'] as WalletChoice[]) {
    const wallet = getBrowserWallet(provider)
    if (wallet?.isConnected && wallet.publicKey) {
      return { provider, address: wallet.publicKey.toString() }
    }
  }
  return { provider: 'phantom', address: null }
}

type Mission = SharedMission & { local?: boolean; cloud?: boolean; cloudRequesterId?: string }
function fromCloud(m: CloudMission): Mission {
  return { id: m.id, title: m.title, place: m.place, reward: m.reward_test_usdc, radius: m.radius_m,
    targetLat: m.target_lat, targetLon: m.target_lon, distanceLabel: 'Shared mission', icon: 'location-outline',
    createdAt: m.created_at, source: 'local', cloud: true, cloudRequesterId: m.requester_id }
}
type Page = 'home' | 'missions' | 'create' | 'activity' | 'profile'
const KEY = 'crowdlens:web-missions:v1'
const seeds: Mission[] = DEFAULT_MISSIONS
const NAV: { id: Page; icon: string; label: string }[] = [
  { id: 'home', icon: '⌂', label: 'Home' }, { id: 'missions', icon: '◉', label: 'Missions' }, { id: 'create', icon: '+', label: 'Create' }, { id: 'activity', icon: '◷', label: 'Activity' }, { id: 'profile', icon: '♙', label: 'Profile' },
]
function initialMissions(): Mission[] {
  try { const value = localStorage.getItem(KEY); if (value) { const parsed: unknown = JSON.parse(value); if (Array.isArray(parsed)) return [...parsed, ...seeds.filter(s => !parsed.some((m: Mission) => m.id === s.id))] } } catch {}
  return seeds
}
export default function WebApp() {
  const [page, setPage] = useState<Page>('home')
  const [missions, setMissions] = useState<Mission[]>(initialMissions)
  const [cloudSession, setCloudSession] = useState<CrowdLensSession | null>(readSavedCloudSession)
  const [cloudMissions, setCloudMissions] = useState<Mission[]>([])
  const [cloudSubmissions, setCloudSubmissions] = useState<CloudSubmission[]>([])
  const [cloudActivityError, setCloudActivityError] = useState('')
  const [authCallbackError, setAuthCallbackError] = useState('')
  useEffect(() => { persistCloudSession(cloudSession) }, [cloudSession])
  useEffect(() => {
    if (!cloudClient || !cloudSession) return
    const client = cloudClient
    let active = true
    const delay = Math.max(0, cloudSession.expiresAt - Date.now() - 60000)
    const timer = window.setTimeout(() => {
      void client.refreshSession(cloudSession).then((renewed) => {
        if (active) setCloudSession(renewed)
      }).catch(() => {
        if (active) { setCloudSession(null); setCloudMissions([]); setAuthCallbackError('Your cloud session expired. Please sign in again.') }
      })
    }, delay)
    return () => { active = false; window.clearTimeout(timer) }
  }, [cloudSession])
  const [selected, setSelected] = useState<Mission | null>(null)
  const [capturePreview, setCapturePreview] = useState(false)
  const [sessionSubmissions, setSessionSubmissions] = useState<BrowserDemoSubmission[]>([])
  const [filter, setFilter] = useState<MissionSort>('Nearby')
  const [question, setQuestion] = useState('')
  const [place, setPlace] = useState('')
  const [reward, setReward] = useState('')
  const [radius, setRadius] = useState(50)
  const [pin, setPin] = useState<{ latitude: number; longitude: number; accuracy: number } | null>(null)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const [walletAddress, setWalletAddress] = useState<string | null>(() => connectedWalletOnLoad().address)
  const [walletBusy, setWalletBusy] = useState(false)
  const [walletChooserOpen, setWalletChooserOpen] = useState(false)
  const [walletProvider, setWalletProvider] = useState<WalletChoice>(() => connectedWalletOnLoad().provider)
  const [walletMessage, setWalletMessage] = useState('')
  const [signatureComplete, setSignatureComplete] = useState(false)
  useEffect(() => {
    const client = cloudClient
    if (!client) return
    if (!window.location.hash.includes('access_token=')) return
    let active = true
    void client.completeEmailLinkFromUrl().then(async (session) => {
      if (!session || !active) return
      setCloudSession(session)
      setPage('profile')
      try {
        const rows = await client.listMissions(session)
        if (active) setCloudMissions(rows.map(fromCloud))
      } catch (error) {
        if (active) setAuthCallbackError(error instanceof Error ? error.message : 'Signed in, but missions could not be loaded.')
      }
    }).catch((error: unknown) => {
      if (active) {
        setPage('profile')
        setAuthCallbackError(error instanceof Error ? error.message : 'Could not verify the email sign-in link.')
      }
    })
    return () => { active = false }
  }, [])
  useEffect(() => {
    const wallet = getBrowserWallet(walletProvider)
    if (!wallet) return
    const disconnected = () => { setWalletAddress(null); setSignatureComplete(false) }
    const connected = () => setWalletAddress(wallet.publicKey?.toString() ?? null)
    wallet.on?.('disconnect', disconnected)
    wallet.on?.('connect', connected)
    return () => { wallet.off?.('disconnect', disconnected); wallet.off?.('connect', connected) }
  }, [walletProvider])
  async function connectWallet(choice: WalletChoice) {
    const wallet = getBrowserWallet(choice)
    if (!wallet) { setWalletChooserOpen(true); setWalletMessage(WALLET_LABELS[choice] + ' is not available in this browser. On mobile, open CrowdLens in your wallet’s in-app browser, then try again.'); return }
    setWalletBusy(true); setWalletMessage(''); setSignatureComplete(false)
    try {
      const result = await wallet.connect()
      setWalletProvider(choice)
      setWalletAddress(result.publicKey.toString())
      setWalletChooserOpen(false)
    } catch (error) { setWalletMessage(friendlyWalletMessage(error)) }
    finally { setWalletBusy(false) }
  }
  async function disconnectWallet() {
    const wallet = getBrowserWallet(walletProvider)
    if (!wallet) { setWalletAddress(null); return }
    setWalletBusy(true); setWalletMessage('')
    try {
      await wallet.disconnect()
      setWalletAddress(null); setSignatureComplete(false)
    } catch (error) { setWalletMessage(friendlyWalletMessage(error)) }
    finally { setWalletBusy(false) }
  }
  async function testWalletSignature() {
    const wallet = getBrowserWallet(walletProvider)
    if (!wallet || !walletAddress || !wallet.signMessage) {
      setWalletMessage('Connect a compatible Solana wallet with message-signing support first.')
      return
    }
    setWalletBusy(true); setWalletMessage(''); setSignatureComplete(false)
    try {
      const payload = ['CROWDLENS_BROWSER_WALLET_TEST_V1', 'Purpose: test message signing only', 'Network: no transaction submitted', 'Account: ' + walletAddress, 'Timestamp: ' + new Date().toISOString()].join('\\n')
      const signed = await wallet.signMessage(encodeWebMessage(payload), 'utf8')
      if (!signed.signature?.length) throw new Error('Wallet returned no signature.')
      setSignatureComplete(true)
      setWalletMessage('Test message signed. No transaction was sent and no reward was paid.')
    } catch (error) { setWalletMessage(friendlyWalletMessage(error)) }
    finally { setWalletBusy(false) }
  }
  useEffect(() => { try { localStorage.setItem(KEY, JSON.stringify(missions.filter(m => m.local))) } catch {} }, [missions])
  const shownMissions = useMemo(() => [...cloudMissions, ...missions], [cloudMissions, missions])
  useEffect(() => {
    if (!cloudClient || !cloudSession) return
    let active = true
    const client = cloudClient
    void client.listSubmissions(cloudSession).then((rows) => {
      if (active) setCloudSubmissions(rows)
    }).catch(() => { /* The inbox has a refresh control for API errors. */ })
    void client.listMissions(cloudSession).then((rows) => {
      if (active) setCloudMissions(rows.map(fromCloud))
    }).catch(() => { /* CloudWorkspace exposes manual refresh and auth errors. */ })
    return () => { active = false }
  }, [cloudSession])
  const sorted = useMemo(() => sortMissions(shownMissions, filter), [shownMissions, filter])
  async function refreshCloudActivity() {
    if (!cloudClient || !cloudSession) return
    try {
      const activeSession = cloudSession.expiresAt <= Date.now() + 15000
        ? await cloudClient.refreshSession(cloudSession) : cloudSession
      if (activeSession !== cloudSession) setCloudSession(activeSession)
      const rows = await cloudClient.listSubmissions(activeSession)
      setCloudSubmissions(rows); setCloudActivityError('')
    } catch (error) {
      setCloudActivityError(error instanceof Error ? error.message : 'Unable to load cloud activity.')
    }
  }
  async function submitCloudEvidence(draft: BrowserEvidenceDraft) {
    if (!cloudClient || !cloudSession) throw new Error('Sign into the shared workspace before submitting.')
    const mission = cloudMissions.find((item) => item.id === draft.missionId)
    if (!mission) throw new Error('This is a local mission. Shared proof uploads require a cloud mission.')
    const activeSession = cloudSession.expiresAt <= Date.now() + 15000
      ? await cloudClient.refreshSession(cloudSession) : cloudSession
    if (activeSession !== cloudSession) setCloudSession(activeSession)
    const rawPhoto = await fetch(draft.photoDataUrl).then((response) => response.blob())
    if (rawPhoto.type !== 'image/jpeg') throw new Error('The captured photo must be JPEG.')
    const fileId = globalThis.crypto?.randomUUID?.()
    if (!fileId) throw new Error('Secure random identifiers are unavailable in this browser.')
    const path = await cloudClient.uploadPrivateJpeg(activeSession, rawPhoto, fileId + '.jpg')
    await cloudClient.createBrowserSubmission(activeSession, {
      missionId: draft.missionId, photoPath: path, latitude: draft.latitude,
      longitude: draft.longitude, accuracy: draft.accuracyMeters, distance: draft.distanceMeters,
    })
    setCloudSubmissions(await cloudClient.listSubmissions(activeSession))
    setCloudActivityError('')
  }
  function queueBrowserDemo(draft: BrowserEvidenceDraft) {
    setSessionSubmissions((items) => [newBrowserDemoSubmission(draft), ...items])
    navigate('activity')
  }
  function decideBrowserDemo(id: string, decision: 'accepted_demo' | 'rejected_demo') {
    setSessionSubmissions((items) => items.map((item) => item.id === id ? reviewBrowserDemoSubmission(item, decision) : item))
  }
  const navigate = (next: Page) => { setSelected(null); setCapturePreview(false); setMessage(''); setPage(next) }
  function pinLocation() {
    if (!navigator.geolocation) { setMessage('This browser does not support geolocation.'); return }
    setBusy(true); setMessage('')
    navigator.geolocation.getCurrentPosition(
      pos => { setPin({ latitude: pos.coords.latitude, longitude: pos.coords.longitude, accuracy: pos.coords.accuracy }); setBusy(false) },
      err => { setMessage(err.message || 'Could not access your location.'); setBusy(false) },
      { enableHighAccuracy: true, timeout: 15000 },
    )
  }
  async function publish() {
    const amount = Number(reward)
    if (!pin) { setMessage('Pin your location first so the mission has a verification point.'); return }
    const error = validateMissionDraft({ title: question, place, reward: amount, radius, targetLat: pin.latitude, targetLon: pin.longitude })
    if (error) { setMessage(error); return }
    if (cloudSession && cloudClient) {
      if (Date.now() >= cloudSession.expiresAt) { setMessage('Cloud session expired. Sign in again from Profile.'); return }
      setBusy(true); setMessage('')
      try {
        const saved = await cloudClient.createMission(cloudSession, { title: question, place, reward: amount, radius: radius as 25 | 50 | 100, latitude: pin.latitude, longitude: pin.longitude })
        setCloudMissions((items) => [fromCloud(saved), ...items])
        setQuestion(''); setPlace(''); setReward(''); setPin(null); navigate('missions')
      } catch (error) { setMessage(error instanceof Error ? error.message : 'Could not publish shared mission.') }
      finally { setBusy(false) }
      return
    }
    const mission: Mission = { id: 'web-' + Date.now(), title: question.trim(), place: place.trim(), reward: amount, radius, targetLat: pin.latitude, targetLon: pin.longitude, createdAt: new Date().toISOString(), distanceLabel: 'Pinned here', icon: 'location-outline', source: 'local', local: true }
    setMissions(old => [mission,...old]); setQuestion(''); setPlace(''); setReward(''); setPin(null); navigate('missions')
  }
  const tile = (mission: Mission, i: number) => (
    <button key={mission.id} type="button" className={'mission-card ' + (i === 0 ? 'featured' : '')} onClick={() => { setCapturePreview(false); setSelected(mission) }}>
      <span className="mission-symbol">{mission.icon === 'cube-outline' ? '▣' : mission.icon === 'camera-outline' ? '▤' : mission.icon === 'people-outline' ? '♧' : '◎'}</span>
      <span className="mission-copy"><strong>{mission.title}</strong><small>{mission.place} · {mission.radius} m zone</small>{mission.local && <em>CREATED IN THIS BROWSER</em>}{mission.cloud && <em>SHARED CLOUD MISSION</em>}</span>
      <span className="reward"><strong>{mission.reward}</strong><small>TEST USDC</small></span>
    </button>
  )
  return <div className="app-shell">
    <aside className="sidebar"><button className="brand" onClick={() => navigate('home')}><span className="brand-icon">◉</span><span>CROWD<span className="brand-accent">LENS</span><small>PROOF OF PRESENCE</small></span></button>
      <div className="menu-label">WORKSPACE</div><nav>{NAV.map(item => <button key={item.id} className={'nav-link ' + (page === item.id ? 'active' : '')} onClick={() => navigate(item.id)}><span className="nav-icon">{item.icon}</span>{item.label}</button>)}</nav>
      <div className="sidebar-note"><span className="online-dot"/> WEB PREVIEW <p>Mission discovery and creation. Verified proof and wallet signing remain Android features.</p></div>
    </aside>
    <main className="main">
      <header className="topbar"><span className="top-logo">CROWD<span>LENS</span></span><span className="top-pill"><span className="online-dot"/> BROWSER DEMO</span></header>
      <div className="content">
      {selected && capturePreview ? <BrowserCapture mission={selected} onBack={() => setCapturePreview(false)} onQueueReview={queueBrowserDemo} onSubmitCloud={cloudSession && selected.cloud ? submitCloudEvidence : undefined} /> : selected ? <><button className="back" onClick={() => setSelected(null)}>← Back to missions</button><div className="eyebrow">MISSION DETAILS</div><h1>{selected.title}</h1><div className="hero"><span className="hero-tag">● LIVE REQUEST</span><h2>{selected.title}</h2><p>{selected.place}</p><div className="hero-footer"><strong>{selected.reward} <small>TEST USDC</small></strong><span>{selected.radius} m verification zone</span></div></div><div className="panel"><h3>Proof of Presence</h3><p>The Android app verifies repeated GPS readings, captures a live photo, and signs the proof with a Solana Mobile wallet. This browser preview does not claim to verify physical presence.</p><div className="capture-controls"><button className="primary" onClick={() => setCapturePreview(true)}>Try browser GPS + camera →</button><button className="secondary-action" onClick={() => setSelected(null)}>Browse other missions</button></div></div></> :
      page === 'home' ? <><div className="eyebrow">CROWDLENS</div><div className="native-greeting"><h1>Hi Faith</h1><button className="native-avatar" aria-label="Open profile" onClick={() => navigate('profile')}>F</button></div><div className="native-orange-panel"><div className="native-panel-top"><div><span className="native-small">NEARBY NOW</span><div className="native-count">{shownMissions.length}</div><span className="native-count-caption">missions waiting</span></div><div className="native-radar"><div>◎</div></div></div><div className="native-quick-actions"><button onClick={() => navigate('missions')}><span>➤</span>Nearby</button><button onClick={() => navigate('create')}><span>＋</span>Create</button><button onClick={() => navigate('activity')}><span>◷</span>Active</button><button onClick={() => navigate('profile')}><span>◇</span>Wallet</button></div></div><button className="native-search" onClick={() => navigate('missions')}><span>⌕</span>Browse missions<span className="native-options">☷</span></button><div className="section-head"><h3>Closest mission</h3></div><div className="missions">{shownMissions.length ? shownMissions.slice(0,1).map(tile) : <button className="mission-card" onClick={() => navigate('create')}>Create the first mission →</button>}</div><div className="native-quote"><span>♧</span>Real-world proof, captured where it happens.</div></> :
      page === 'missions' ? <><div className="eyebrow">DISCOVER</div><div className="section-head"><h1>Missions</h1><button className="primary small" onClick={() => navigate('create')}>+ Create mission</button></div><div className="filters">{['Nearby','Reward','New'].map(x => <button key={x} className={filter===x?'chosen':''} onClick={() => setFilter(x as MissionSort)}>{x}</button>)}</div><div className="missions">{sorted.map(tile)}</div></> :
      page === 'create' ? <><div className="eyebrow">NEW REQUEST</div><h1>Create mission</h1><div className="native-create-form"><label className="native-question">What do you need checked?<textarea value={question} onChange={e => setQuestion(e.target.value)} placeholder="Is the event happening right now?" /></label><label className="native-field-label">Location name<input value={place} onChange={e => setPlace(e.target.value)} placeholder="e.g. Conference Centre, Ibadan"/></label><button className={'native-pin '+(pin?'pinned':'')} onClick={pinLocation} disabled={busy}><span>◎</span><span><strong>{busy ? 'Finding your location…' : pin ? 'Mission point pinned' : 'Pin current GPS location'}</strong><small>{pin ? '±' + Math.round(pin.accuracy) + ' m accuracy' : 'Used as the centre of the verification zone'}</small></span></button><div className="native-form-section"><strong>Radius</strong><small>Scout must be inside</small></div><div className="native-radius">{MISSION_RADII.map(n => <button key={n} className={radius===n?'chosen':''} onClick={() => setRadius(n)}>{n} m</button>)}</div><div className="native-form-section"><strong>Proof</strong></div><div className="native-proof"><span>▣</span><div><strong>Live photo + GPS</strong><small>Captured inside CrowdLens Android</small></div><span>✓</span></div><label className="native-field-label">Reward <span className="native-reward"><strong>USDC</strong><input type="number" min="0.01" step="0.01" value={reward} onChange={e => setReward(e.target.value)} placeholder="3.00"/><em>TEST</em></span></label>{message && <p role="alert" className="feedback">{message}</p>}<button className="native-publish" disabled={busy} onClick={() => void publish()}>{busy ? 'Publishing…' : cloudSession ? 'Publish shared mission' : 'Publish local mission'} <span>→</span></button><p className="native-form-note">{cloudSession ? 'Signed in: this mission will be saved to the shared database.' : 'Not signed into cloud: this mission will be saved only in this browser.'}</p></div></> :
      page === 'activity' ? <><BrowserReviewSession submissions={sessionSubmissions} onDecision={decideBrowserDemo} onClear={() => setSessionSubmissions([])} onExplore={() => navigate('missions')} />{cloudSession && <CloudReviewInbox session={cloudSession} submissions={cloudSubmissions} onRefresh={refreshCloudActivity} onReviewed={refreshCloudActivity} missionOwners={Object.fromEntries(cloudMissions.map((m) => [m.id, m.cloudRequesterId || '']))} />}{cloudActivityError && <p role="alert" className="feedback">{cloudActivityError}</p>}</> :
      <><div className="eyebrow">SCOUT</div><h1>Profile</h1><div className="web-profile-banner"><div className="web-profile-avatar">FO</div><div><strong>Scout profile</strong><small>CrowdLens web preview</small></div><span>◎</span></div><section className="panel web-wallet-panel">
        <div className="web-profile-section-title"><h3>Wallet</h3><span>{walletAddress ? 'Connected · ' + WALLET_LABELS[walletProvider] : 'Not connected'}</span></div>
        {walletAddress ? <>
          <DevnetWalletInspector key={walletAddress} address={walletAddress} />
          <div className="web-wallet-address"><span className="online-dot"/> <code title={walletAddress}>{compactAddress(walletAddress)}</code></div>
          <details className="web-profile-options"><summary>Wallet options</summary>
            <div className="web-wallet-actions"><button className="secondary-action" onClick={() => void testWalletSignature()} disabled={walletBusy}>{walletBusy ? 'Waiting for wallet…' : 'Sign test message'}</button><button className="secondary-action" onClick={() => void disconnectWallet()} disabled={walletBusy}>Disconnect</button></div>
            <small className="web-wallet-disclaimer">Test message signing sends no transaction. Never share a wallet recovery phrase.</small>
          </details>
        </> : <>
          <p>Connect a Solana wallet to see your Devnet balance automatically.</p>
          <button className="primary" onClick={() => { setWalletChooserOpen((open) => !open); setWalletMessage('') }} disabled={walletBusy}>{walletBusy ? 'Connecting…' : 'Connect Solana wallet'}</button>
          {walletChooserOpen && <div className="wallet-chooser" aria-label="Choose a Solana wallet"><p>Detected here: {availableBrowserWallets().map((choice) => WALLET_LABELS[choice]).join(', ') || 'No wallet providers'}</p><div className="capture-controls">{(['trust', 'phantom', 'solflare'] as WalletChoice[]).map((choice) => <button type="button" key={choice} className={getBrowserWallet(choice) ? 'primary' : 'secondary-action'} disabled={walletBusy} onClick={() => void connectWallet(choice)}>{WALLET_LABELS[choice]} {getBrowserWallet(choice) ? '· detected' : ''}</button>)}</div><a className="wallet-open-link" href={TRUST_WALLET_DAPP_URL} target="_blank" rel="noopener noreferrer">Open in Trust Wallet ↗</a><small>On a phone, use a supported wallet's in-app browser. WalletConnect pairing is not yet available.</small></div>}
        </>}
        {walletMessage && <p role="status" className={signatureComplete ? 'web-wallet-success' : 'web-wallet-feedback'}>{walletMessage}</p>}
      </section>{authCallbackError && <p role="alert" className="feedback">{authCallbackError}</p>}<CloudWorkspace session={cloudSession} onSession={(next) => { setCloudSession(next); if (!next) { setCloudMissions([]); setCloudSubmissions([]) }; setAuthCallbackError('') }} onMissions={(items) => setCloudMissions(items.map(fromCloud))} /></>}
      <footer className="footer">CrowdLens · Hackathon web preview · Demo rewards are simulated · Android remains the verified proof experience.</footer>
      </div>
    </main>
    <nav className="mobile-nav">{NAV.map(item => <button key={item.id} className={page === item.id?'active':''} onClick={() => navigate(item.id)}><span>{item.icon}</span>{item.label}</button>)}</nav>
  </div>
}
