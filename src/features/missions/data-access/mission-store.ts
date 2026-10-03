import { atom } from 'nanostores'
import { createMMKV } from 'react-native-mmkv'

export type MissionIcon = 'radio-outline' | 'cube-outline' | 'camera-outline' | 'people-outline' | 'location-outline'

export interface Mission {
  id: string
  title: string
  place: string
  reward: number
  radius: number
  targetLat: number
  targetLon: number
  distanceLabel: string
  icon: MissionIcon
  createdAt: string
  source: 'seed' | 'local'
}

const STORAGE_KEY = 'missions:v1'
const storage = createMMKV({ id: 'crowdlens-missions' })

const DEFAULT_MISSIONS: Mission[] = [
  {
    id: 'web3-meetup-bodija',
    title: 'Is the Web3 meetup live?',
    place: 'Bodija, Ibadan',
    reward: 3,
    radius: 50,
    targetLat: 7.4356,
    targetLon: 3.9143,
    distanceLabel: '1.2 km',
    icon: 'radio-outline',
    createdAt: '2026-10-03T00:00:00.000Z',
    source: 'seed',
  },
  {
    id: 'laptop-stock-ring-road',
    title: 'Is this laptop still in stock?',
    place: 'Ring Road, Ibadan',
    reward: 5,
    radius: 50,
    targetLat: 7.3739,
    targetLon: 3.8677,
    distanceLabel: '2.8 km',
    icon: 'cube-outline',
    createdAt: '2026-10-02T21:00:00.000Z',
    source: 'seed',
  },
  {
    id: 'billboard-iwo-road',
    title: 'Confirm this billboard is up',
    place: 'Iwo Road, Ibadan',
    reward: 4,
    radius: 50,
    targetLat: 7.4015,
    targetLon: 3.9392,
    distanceLabel: '4.1 km',
    icon: 'camera-outline',
    createdAt: '2026-10-02T18:00:00.000Z',
    source: 'seed',
  },
  {
    id: 'queue-dugbe',
    title: 'How long is the queue here?',
    place: 'Dugbe, Ibadan',
    reward: 2,
    radius: 50,
    targetLat: 7.3867,
    targetLon: 3.8964,
    distanceLabel: '5.4 km',
    icon: 'people-outline',
    createdAt: '2026-10-02T15:00:00.000Z',
    source: 'seed',
  },
]

function readMissions(): Mission[] {
  const raw = storage.getString(STORAGE_KEY)
  if (!raw) return DEFAULT_MISSIONS

  try {
    const parsed = JSON.parse(raw) as Mission[]
    return Array.isArray(parsed) && parsed.length ? parsed : DEFAULT_MISSIONS
  } catch {
    return DEFAULT_MISSIONS
  }
}

export const $missions = atom<Mission[]>(readMissions())

function persist(missions: Mission[]) {
  storage.set(STORAGE_KEY, JSON.stringify(missions))
  $missions.set(missions)
}

export function addMission(input: Omit<Mission, 'id' | 'createdAt' | 'source' | 'distanceLabel' | 'icon'>) {
  const mission: Mission = {
    ...input,
    id: `mission-${Date.now()}`,
    createdAt: new Date().toISOString(),
    source: 'local',
    distanceLabel: 'Pinned here',
    icon: 'location-outline',
  }

  persist([mission, ...$missions.get()])
  return mission
}

export function resetDemoMissions() {
  storage.remove(STORAGE_KEY)
  $missions.set(DEFAULT_MISSIONS)
}
