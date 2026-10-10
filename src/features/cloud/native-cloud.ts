import { atom } from 'nanostores'
import { createMMKV } from 'react-native-mmkv'

import {
  createCrowdLensCloud, type CloudMission, type CrowdLensSession,
} from './crowdlens-cloud'
import type { Mission } from '../missions/data-access/mission-model'

const url = process.env.EXPO_PUBLIC_SUPABASE_URL
const key = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY

export const nativeCloud = url && key && !url.includes('your-project') && !key.includes('your_key')
  ? createCrowdLensCloud({ url, publishableKey: key })
  : null

const storage = createMMKV({ id: 'crowdlens-cloud-session' })
const KEY = 'auth:v1'

function savedSession(): CrowdLensSession | null {
  try {
    const raw = storage.getString(KEY)
    if (!raw) return null
    const parsed: unknown = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object') return null
    const value = parsed as Partial<CrowdLensSession>
    if (typeof value.accessToken !== 'string' || typeof value.refreshToken !== 'string' ||
      typeof value.userId !== 'string' || typeof value.expiresAt !== 'number') return null
    return value as CrowdLensSession
  } catch { return null }
}

export const $nativeSession = atom<CrowdLensSession | null>(savedSession())
export const $sharedMissions = atom<Mission[]>([])

export function setNativeSession(value: CrowdLensSession | null) {
  if (value) storage.set(KEY, JSON.stringify(value))
  else storage.remove(KEY)
  $nativeSession.set(value)
  if (!value) $sharedMissions.set([])
}

export async function activeNativeSession(): Promise<CrowdLensSession> {
  if (!nativeCloud) throw new Error('Cloud access is not configured in this Android build.')
  const session = $nativeSession.get()
  if (!session) throw new Error('Sign in from Profile to use shared missions.')
  if (Date.now() < session.expiresAt - 60000) return session
  try {
    const next = await nativeCloud.refreshSession(session)
    setNativeSession(next)
    return next
  } catch {
    setNativeSession(null)
    throw new Error('Your cloud session expired. Sign in again from Profile.')
  }
}

export function fromNativeCloudMission(m: CloudMission): Mission {
  return {
    id: m.id, title: m.title, place: m.place,
    reward: m.reward_test_usdc, radius: m.radius_m,
    targetLat: m.target_lat, targetLon: m.target_lon,
    createdAt: m.created_at, source: 'local',
    icon: 'location-outline', distanceLabel: 'SHARED CLOUD MISSION',
  }
}

export async function refreshNativeSharedMissions(): Promise<number> {
  if (!nativeCloud || !$nativeSession.get()) {
    $sharedMissions.set([])
    return 0
  }
  const session = await activeNativeSession()
  const missions = await nativeCloud.listMissions(session)
  $sharedMissions.set(missions.map(fromNativeCloudMission))
  return missions.length
}

export async function signOutNativeCloud(): Promise<void> {
  const session = $nativeSession.get()
  setNativeSession(null)
  if (session && nativeCloud) {
    try { await nativeCloud.signOut(session) } catch { /* Offline sign-out still clears local credentials. */ }
  }
}
