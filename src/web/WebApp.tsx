import { useEffect, useMemo, useState } from 'react'

type Mission = { id: string; title: string; place: string; reward: number; radius: number; targetLat: number; targetLon: number; createdAt: string; local?: boolean }
type Page = 'home' | 'missions' | 'create' | 'activity' | 'profile'
const KEY = 'crowdlens:web-missions:v1'
const seeds: Mission[] = [
  { id: 'web3-meetup-bodija', title: 'Is the Web3 meetup live?', place: 'Bodija, Ibadan', reward: 3, radius: 50, targetLat: 7.4356, targetLon: 3.9143, createdAt: '2026-10-03T00:00:00Z' },
  { id: 'laptop-stock-ring-road', title: 'Is this laptop still in stock?', place: 'Ring Road, Ibadan', reward: 5, radius: 50, targetLat: 7.3739, targetLon: 3.8677, createdAt: '2026-10-02T21:00:00Z' },
  { id: 'billboard-iwo-road', title: 'Confirm this billboard is up', place: 'Iwo Road, Ibadan', reward: 4, radius: 50, targetLat: 7.4015, targetLon: 3.9392, createdAt: '2026-10-02T18:00:00Z' },
  { id: 'queue-dugbe', title: 'How long is the queue here?', place: 'Dugbe, Ibadan', reward: 2, radius: 50, targetLat: 7.3867, targetLon: 3.8964, createdAt: '2026-10-02T15:00:00Z' },
]
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
  const [selected, setSelected] = useState<Mission | null>(null)
  const [filter, setFilter] = useState('Nearby')
  const [question, setQuestion] = useState('')
  const [place, setPlace] = useState('')
  const [reward, setReward] = useState('')
  const [radius, setRadius] = useState(50)
  const [pin, setPin] = useState<{ latitude: number; longitude: number; accuracy: number } | null>(null)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  useEffect(() => { try { localStorage.setItem(KEY, JSON.stringify(missions.filter(m => m.local))) } catch {} }, [missions])
  const sorted = useMemo(() => { const copy = [...missions]; if (filter === 'Reward') copy.sort((a,b) => b.reward-a.reward); if (filter === 'New') copy.sort((a,b) => b.createdAt.localeCompare(a.createdAt)); return copy }, [missions, filter])
  const navigate = (next: Page) => { setSelected(null); setMessage(''); setPage(next) }
  function pinLocation() {
    if (!navigator.geolocation) { setMessage('This browser does not support geolocation.'); return }
    setBusy(true); setMessage('')
    navigator.geolocation.getCurrentPosition(
      pos => { setPin({ latitude: pos.coords.latitude, longitude: pos.coords.longitude, accuracy: pos.coords.accuracy }); setBusy(false) },
      err => { setMessage(err.message || 'Could not access your location.'); setBusy(false) },
      { enableHighAccuracy: true, timeout: 15000 },
    )
  }
  function publish() {
    const amount = Number(reward)
    if (!question.trim() || !place.trim() || !(amount > 0)) { setMessage('Enter a mission, location name and valid test reward.'); return }
    if (!pin) { setMessage('Pin your location first so the mission has a verification point.'); return }
    const mission: Mission = { id: 'web-' + Date.now(), title: question.trim(), place: place.trim(), reward: amount, radius, targetLat: pin.latitude, targetLon: pin.longitude, createdAt: new Date().toISOString(), local: true }
    setMissions(old => [mission,...old]); setQuestion(''); setPlace(''); setReward(''); setPin(null); navigate('missions')
  }
  const tile = (mission: Mission, i: number) => (
    <button key={mission.id} type="button" className={'mission-card ' + (i === 0 ? 'featured' : '')} onClick={() => setSelected(mission)}>
      <span className="mission-symbol">{i === 0 ? '◉' : '◎'}</span>
      <span className="mission-copy"><strong>{mission.title}</strong><small>{mission.place} · {mission.radius} m zone</small>{mission.local && <em>CREATED IN THIS BROWSER</em>}</span>
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
      {selected ? <><button className="back" onClick={() => setSelected(null)}>← Back to missions</button><div className="eyebrow">MISSION DETAILS</div><h1>{selected.title}</h1><div className="hero"><span className="hero-tag">● LIVE REQUEST</span><h2>{selected.title}</h2><p>{selected.place}</p><div className="hero-footer"><strong>{selected.reward} <small>TEST USDC</small></strong><span>{selected.radius} m verification zone</span></div></div><div className="panel"><h3>Proof of Presence</h3><p>The Android app verifies repeated GPS readings, captures a live photo, and signs the proof with a Solana Mobile wallet. This browser preview does not claim to verify physical presence.</p><button className="primary" onClick={() => setSelected(null)}>Browse other missions →</button></div></> :
      page === 'home' ? <><div className="eyebrow">LIVE INTELLIGENCE, VERIFIED</div><h1>Know what's happening.<br/><span>Right now.</span></h1><p className="lead">Create requests for real-world information. Nearby scouts verify what is happening on the ground.</p><div className="hero"><span className="hero-tag">● FEATURED MISSION</span><h2>{missions[0]?.title || 'Explore CrowdLens'}</h2><p>{missions[0]?.place || 'Browse missions'}</p><div className="hero-footer"><strong>{missions[0]?.reward ?? 0} <small>TEST USDC</small></strong><button onClick={() => navigate('missions')}>Explore missions ↗</button></div></div><div className="section-head"><h3>Open missions</h3><button onClick={() => navigate('missions')}>View all →</button></div><div className="missions">{missions.slice(0,3).map(tile)}</div></> :
      page === 'missions' ? <><div className="eyebrow">DISCOVER</div><div className="section-head"><h1>Missions</h1><button className="primary small" onClick={() => navigate('create')}>+ Create mission</button></div><div className="filters">{['Nearby','Reward','New'].map(x => <button key={x} className={filter===x?'chosen':''} onClick={() => setFilter(x)}>{x}</button>)}</div><div className="missions">{sorted.map(tile)}</div></> :
      page === 'create' ? <><div className="eyebrow">NEW REQUEST</div><h1>Create mission</h1><p className="lead">Publish a local test mission in your browser. It will not automatically sync with Android.</p><div className="form-card"><label>What do you need checked?<textarea value={question} onChange={e => setQuestion(e.target.value)} placeholder="Is the event happening right now?" /></label><label>Location name<input value={place} onChange={e => setPlace(e.target.value)} placeholder="e.g. Conference Centre, Ibadan"/></label><button className="location" onClick={pinLocation} disabled={busy}>{busy ? 'Finding your location…' : pin ? '✓ GPS point pinned (±' + Math.round(pin.accuracy) + ' m)' : '◎ Pin current GPS location'}</button><div className="field-title">Verification radius</div><div className="filters">{[25,50,100].map(n => <button key={n} className={radius===n?'chosen':''} onClick={() => setRadius(n)}>{n} m</button>)}</div><label>Test reward (USDC)<input type="number" min="0.01" step="0.01" value={reward} onChange={e => setReward(e.target.value)} placeholder="3.00"/></label>{message && <p className="feedback">{message}</p>}<button className="primary" onClick={publish}>Publish mission →</button></div></> :
      page === 'activity' ? <><div className="eyebrow">TRACKING</div><h1>Activity</h1><div className="panel"><h3>No verified activity yet</h3><p>Your browser missions are saved locally. Live proof submissions and approval receipts are available only in the Android experience for this hackathon preview.</p><button className="primary" onClick={() => navigate('missions')}>Explore missions →</button></div></> :
      <><div className="eyebrow">SCOUT</div><h1>Profile</h1><div className="panel"><h3>Solana wallet</h3><p>Mobile Wallet Adapter and wallet-signed Proof of Presence are available through the CrowdLens Android APK. Web wallet support is not connected in this preview.</p><button className="primary" onClick={() => navigate('missions')}>Explore missions →</button></div></>}
      <footer className="footer">CrowdLens · Hackathon web preview · Demo rewards are simulated · Android remains the verified proof experience.</footer>
      </div>
    </main>
    <nav className="mobile-nav">{NAV.map(item => <button key={item.id} className={page === item.id?'active':''} onClick={() => navigate(item.id)}><span>{item.icon}</span>{item.label}</button>)}</nav>
  </div>
}
