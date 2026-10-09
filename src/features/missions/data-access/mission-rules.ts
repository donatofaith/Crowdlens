import type { Mission } from './mission-model'

export type MissionDraft = Pick<Mission, 'title' | 'place' | 'reward' | 'radius' | 'targetLat' | 'targetLon'>

export const MISSION_RADII = [25, 50, 100] as const

export function validateMissionDraft(draft: MissionDraft): string | null {
  if (!draft.title.trim() || !draft.place.trim()) return 'Mission and location name are required.'
  if (!Number.isFinite(draft.reward) || draft.reward <= 0) return 'Enter a valid positive test reward.'
  if (!MISSION_RADII.some((radius) => radius === draft.radius)) return 'Select a supported verification radius.'
  if (!Number.isFinite(draft.targetLat) || !Number.isFinite(draft.targetLon)) return 'Pin a valid GPS location.'
  if (Math.abs(draft.targetLat) > 90 || Math.abs(draft.targetLon) > 180) return 'GPS coordinates are out of range.'
  return null
}

export type MissionSort = 'Nearby' | 'Reward' | 'New'

export function sortMissions(missions: readonly Mission[], filter: MissionSort): Mission[] {
  const copy = [...missions]
  if (filter === 'Reward') return copy.sort((a, b) => b.reward - a.reward)
  if (filter === 'New') return copy.sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt))
  return copy
}
