import type { CrowdLensSession } from '../features/cloud/crowdlens-cloud'

const SESSION_KEY = 'crowdlens:supabase-session:v1'

/**
 * Supabase auth sessions are stored on this device, unlike camera/GPS evidence.
 * Local storage persists across browser restarts, but never store recovery phrases.
 * Use a strict Content Security Policy and prevent script injection in production.
 */
export function readSavedCloudSession(): CrowdLensSession | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(SESSION_KEY)
    if (!raw) return null
    const value: unknown = JSON.parse(raw)
    if (!value || typeof value !== 'object') return null
    const s = value as Partial<CrowdLensSession>
    if (typeof s.accessToken !== 'string' || typeof s.refreshToken !== 'string' ||
        typeof s.userId !== 'string' || typeof s.expiresAt !== 'number') return null
    return { accessToken: s.accessToken, refreshToken: s.refreshToken, userId: s.userId, expiresAt: s.expiresAt }
  } catch { return null }
}

export function persistCloudSession(session: CrowdLensSession | null): void {
  if (typeof window === 'undefined') return
  try {
    if (session) window.localStorage.setItem(SESSION_KEY, JSON.stringify(session))
    else window.localStorage.removeItem(SESSION_KEY)
  } catch { /* Storage may be disabled. In-memory sign-in still works. */ }
}
