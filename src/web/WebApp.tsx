import { useEffect, useMemo, useState } from 'react'
import BrowserCapture from './BrowserCapture'
import CloudWorkspace, { cloudClient } from './CloudWorkspace'
import type { CloudMission, CrowdLensSession } from '../features/cloud/crowdlens-cloud'
import BrowserReviewSession from './BrowserReviewSession'
import { newBrowserDemoSubmission, reviewBrowserDemoSubmission } from './browser-demo-submissions'
import type { BrowserDemoSubmission, BrowserEvidenceDraft } from './browser-demo-submissions'
import { compactAddress, encodeWebMessage, friendlyWalletMessage, getPhantomWallet } from './browser-wallet'
import { DEFAULT_MISSIONS } from '../features/missions/data-access/mission-model'
import { MISSION_RADII, sortMissions, validateMissionDraft, type MissionSort } from '../features/missions/data-access/mission-rules'
import type { Mission as SharedMission } from '../features/missions/data-access/mission-model'

type Mission = SharedMission & { local?: boolean; cloud?: boolean }
function fromCloud(m: CloudMission): Mission {
  return { id: m.id, title: m.title, place: m.place, reward: m.reward_test_usdc, radius: m.radius_m,
    targetLat: m.target_lat, targetLon: m.target_lon, distanceLabel: 'Shared mission', icon: 'location-outline',
    createdAt: m.created_at, source: 'local', cloud: true }
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
  const [cloudSession, setCloudSession] = useState<CrowdLensSession | null>(null)
  const [cloudMissions, setCloudMissions] = useState<Mission[]>([])
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
  const [walletAddress, setWalletAddress] = useState<string | null>(() => { const wallet = getPhantomWallet(); return wallet?.isConnected ? wallet.publicKey?.toString() ?? null : null })
  const [walletBusy, setWalletBusy] = useState(false)
  const [walletMessage, setWalletMessage] = useState('')
  const [signatureComplete, setSignatureComplete] = useState(false)
  useEffect(() => {
    const wallet = getPhantomWallet()
    if (!wallet) return
    const disconnected = () => { setWalletAddress(null); setSignatureComplete(false) }
    const connected = () => setWalletAddress(wallet.publicKey?.toString() ?? null)
    wallet.on?.('disconnect', disconnected)
    wallet.on?.('connect', connected)
    return () => { wallet.off?.('disconnect', disconnected); wallet.off?.('connect', connected) }
  }, [])
  async function connectWallet() {
    const wallet = getPhantomWallet()
    if (!wallet) { setWalletMessage('Phantom browser wallet was not detected. Open CrowdLens in a browser with Phantom installed.'); return }
    setWalletBusy(true); setWalletMessage(''); setSignatureComplete(false)
    try {
      const result = await wallet.connect()
      setWalletAddress(result.publicKey.toString())
    } catch (error) { setWalletMessage(friendlyWalletMessage(error)) }
    finally { setWalletBusy(false) }
  }
  async function disconnectWallet() {
    const wallet = getPhantomWallet()
    if (!wallet) { setWalletAddress(null); return }
    setWalletBusy(true); setWalletMessage('')
    try {
      await wallet.disconnect()
      setWalletAddress(null); setSignatureComplete(false)
    } catch (error) { setWalletMessage(friendlyWalletMessage(error)) }
    finally { setWalletBusy(false) }
  }
  async function testWalletSignature() {
    const wallet = getPhantomWallet()
    if (!wallet || !walletAddress || !wallet.signMessage) {
      setWalletMessage('Connect a compatible Phantom wallet with message-signing support first.')
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
  const sorted = useMemo(() => sortMissions(shownMissions, filter), [shownMissions, filter])
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
      {selected && capturePreview ? <BrowserCapture mission={selected} onBack={() => setCapturePreview(false)} onQueueReview={queueBrowserDemo} /> : selected ? <><button className="back" onClick={() => setSelected(null)}>← Back to missions</button><div className="eyebrow">MISSION DETAILS</div><h1>{selected.title}</h1><div className="hero"><span className="hero-tag">● LIVE REQUEST</span><h2>{selected.title}</h2><p>{selected.place}</p><div className="hero-footer"><strong>{selected.reward} <small>TEST USDC</small></strong><span>{selected.radius} m verification zone</span></div></div><div className="panel"><h3>Proof of Presence</h3><p>The Android app verifies repeated GPS readings, captures a live photo, and signs the proof with a Solana Mobile wallet. This browser preview does not claim to verify physical presence.</p><div className="capture-controls"><button className="primary" onClick={() => setCapturePreview(true)}>Try browser GPS + camera →</button><button className="secondary-action" onClick={() => setSelected(null)}>Browse other missions</button></div></div></> :
      page === 'home' ? <><div className="eyebrow">CROWDLENS</div><div className="native-greeting"><h1>Hi Faith</h1><button className="native-avatar" aria-label="Open profile" onClick={() => navigate('profile')}>F</button></div><div className="native-orange-panel"><div className="native-panel-top"><div><span className="native-small">NEARBY NOW</span><div className="native-count">{shownMissions.length}</div><span className="native-count-caption">missions waiting</span></div><div className="native-radar"><div>◎</div></div></div><div className="native-quick-actions"><button onClick={() => navigate('missions')}><span>➤</span>Nearby</button><button onClick={() => navigate('create')}><span>＋</span>Create</button><button onClick={() => navigate('activity')}><span>◷</span>Active</button><button onClick={() => navigate('profile')}><span>◇</span>Wallet</button></div></div><button className="native-search" onClick={() => navigate('missions')}><span>⌕</span>Browse missions<span className="native-options">☷</span></button><div className="section-head"><h3>Closest mission</h3></div><div className="missions">{shownMissions.length ? shownMissions.slice(0,1).map(tile) : <button className="mission-card" onClick={() => navigate('create')}>Create the first mission →</button>}</div><div className="native-quote"><span>♧</span>Real-world proof, captured where it happens.</div></> :
      page === 'missions' ? <><div className="eyebrow">DISCOVER</div><div className="section-head"><h1>Missions</h1><button className="primary small" onClick={() => navigate('create')}>+ Create mission</button></div><div className="filters">{['Nearby','Reward','New'].map(x => <button key={x} className={filter===x?'chosen':''} onClick={() => setFilter(x as MissionSort)}>{x}</button>)}</div><div className="missions">{sorted.map(tile)}</div></> :
      page === 'create' ? <><div className="eyebrow">NEW REQUEST</div><h1>Create mission</h1><div className="native-create-form"><label className="native-question">What do you need checked?<textarea value={question} onChange={e => setQuestion(e.target.value)} placeholder="Is the event happening right now?" /></label><label className="native-field-label">Location name<input value={place} onChange={e => setPlace(e.target.value)} placeholder="e.g. Conference Centre, Ibadan"/></label><button className={'native-pin '+(pin?'pinned':'')} onClick={pinLocation} disabled={busy}><span>◎</span><span><strong>{busy ? 'Finding your location…' : pin ? 'Mission point pinned' : 'Pin current GPS location'}</strong><small>{pin ? '±' + Math.round(pin.accuracy) + ' m accuracy' : 'Used as the centre of the verification zone'}</small></span></button><div className="native-form-section"><strong>Radius</strong><small>Scout must be inside</small></div><div className="native-radius">{MISSION_RADII.map(n => <button key={n} className={radius===n?'chosen':''} onClick={() => setRadius(n)}>{n} m</button>)}</div><div className="native-form-section"><strong>Proof</strong></div><div className="native-proof"><span>▣</span><div><strong>Live photo + GPS</strong><small>Captured inside CrowdLens Android</small></div><span>✓</span></div><label className="native-field-label">Reward <span className="native-reward"><strong>USDC</strong><input type="number" min="0.01" step="0.01" value={reward} onChange={e => setReward(e.target.value)} placeholder="3.00"/><em>TEST</em></span></label>{message && <p role="alert" className="feedback">{message}</p>}<button className="native-publish" disabled={busy} onClick={() => void publish()}>{busy ? 'Publishing…' : cloudSession ? 'Publish shared mission' : 'Publish local mission'} <span>→</span></button><p className="native-form-note">{cloudSession ? 'Signed in: this mission will be saved to the shared database.' : 'Not signed into cloud: this mission will be saved only in this browser.'}</p></div></> :
      page === 'activity' ? <BrowserReviewSession submissions={sessionSubmissions} onDecision={decideBrowserDemo} onClear={() => setSessionSubmissions([])} onExplore={() => navigate('missions')} /> :
      <><div className="eyebrow">SCOUT</div><h1>Profile</h1><div className="web-profile-banner"><div className="web-profile-avatar">FO</div><div><strong>Scout profile</strong><small>CrowdLens web preview</small></div><span>◎</span></div><div className="panel web-wallet-panel"><h3>Solana wallet</h3><p>{walletAddress ? 'Your Phantom wallet is connected in this browser.' : 'Connect a Phantom browser wallet to test wallet authorization. Android continues using Mobile Wallet Adapter.'}</p>{walletAddress && <div className="web-wallet-address"><span className="online-dot"/> Connected · <code title={walletAddress}>{compactAddress(walletAddress)}</code></div>}<div className="web-wallet-actions">{!walletAddress ? <button className="primary" onClick={() => void connectWallet()} disabled={walletBusy}>{walletBusy ? 'Connecting…' : 'Connect Phantom wallet'}</button> : <><button className="primary" onClick={() => void testWalletSignature()} disabled={walletBusy}>{walletBusy ? 'Waiting for wallet…' : 'Sign test message'}</button><button className="secondary-action" onClick={() => void disconnectWallet()} disabled={walletBusy}>Disconnect</button></>}</div>{walletMessage && <p role="status" className={signatureComplete ? 'web-wallet-success' : 'web-wallet-feedback'}>{walletMessage}</p>}<small className="web-wallet-disclaimer">Signing a test message is not Proof of Presence, a Devnet receipt, or a payment. Never enter your recovery phrase into CrowdLens.</small></div><CloudWorkspace session={cloudSession} onSession={(next) => { setCloudSession(next); if (!next) setCloudMissions([]) }} onMissions={(items) => setCloudMissions(items.map(fromCloud))} /></>}
      <footer className="footer">CrowdLens · Hackathon web preview · Demo rewards are simulated · Android remains the verified proof experience.</footer>
      </div>
    </main>
    <nav className="mobile-nav">{NAV.map(item => <button key={item.id} className={page === item.id?'active':''} onClick={() => navigate(item.id)}><span>{item.icon}</span>{item.label}</button>)}</nav>
  </div>
}
