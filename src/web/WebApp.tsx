import { useEffect, useMemo, useState } from 'react'
import { DEFAULT_MISSIONS } from '../features/missions/data-access/mission-model'
import type { Mission as SharedMission } from '../features/missions/data-access/mission-model'

type Mission = SharedMission & { local?: boolean }
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
    const mission: Mission = { id: 'web-' + Date.now(), title: question.trim(), place: place.trim(), reward: amount, radius, targetLat: pin.latitude, targetLon: pin.longitude, createdAt: new Date().toISOString(), distanceLabel: 'Pinned here', icon: 'location-outline', source: 'local', local: true }
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
      page === 'home' ? <><div className="eyebrow">CROWDLENS</div><div className="native-greeting"><h1>Hi Faith</h1><button className="native-avatar" aria-label="Open profile" onClick={() => navigate('profile')}>F</button></div><div className="native-orange-panel"><div className="native-panel-top"><div><span className="native-small">NEARBY NOW</span><div className="native-count">{missions.length}</div><span className="native-count-caption">missions waiting</span></div><div className="native-radar"><div>◎</div></div></div><div className="native-quick-actions"><button onClick={() => navigate('missions')}><span>➤</span>Nearby</button><button onClick={() => navigate('create')}><span>＋</span>Create</button><button onClick={() => navigate('activity')}><span>◷</span>Active</button><button onClick={() => navigate('profile')}><span>◇</span>Wallet</button></div></div><button className="native-search" onClick={() => navigate('missions')}><span>⌕</span>Browse missions<span className="native-options">☷</span></button><div className="section-head"><h3>Closest mission</h3></div><div className="missions">{missions.length ? missions.slice(0,1).map(tile) : <button className="mission-card" onClick={() => navigate('create')}>Create the first mission →</button>}</div><div className="native-quote"><span>♧</span>Real-world proof, captured where it happens.</div></> :
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
