import { atom } from 'nanostores'
import { createMMKV } from 'react-native-mmkv'

import { DEFAULT_MISSIONS } from './mission-model'
import type { Mission } from './mission-model'

export type { Mission, MissionIcon } from './mission-model'

const STORAGE_KEY = 'missions:v1'
const storage = createMMKV({ id: 'crowdlens-missions' })


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
