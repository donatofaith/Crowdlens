/**
 * Portable Supabase REST client shared by browser and Android.
 * Never put a service-role/secret key in an Expo PUBLIC environment variable.
 * Caller provides a Supabase Auth user access token, not a wallet signature.
 */
export interface CrowdLensCloudConfig {
  url: string
  publishableKey: string
}

export interface CrowdLensSession {
  accessToken: string
  userId: string
  expiresAt: number
}

export interface CloudMission {
  id: string
  requester_id: string
  title: string
  place: string
  reward_test_usdc: number
  radius_m: 25 | 50 | 100
  target_lat: number
  target_lon: number
  status: 'open' | 'closed'
  created_at: string
}

export interface CloudSubmission {
  id: string
  mission_id: string
  scout_id: string
  photo_path: string
  browser_reported_lat: number
  browser_reported_lon: number
  browser_reported_accuracy_m: number
  browser_reported_distance_m: number
  capture_source: 'browser_unverified' | 'android_unverified'
  status: 'pending' | 'accepted_demo' | 'rejected_demo'
  created_at: string
  reviewed_at: string | null
}

function configHeaders(config: CrowdLensCloudConfig, token?: string): Record<string, string> {
  return {
    apikey: config.publishableKey,
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

async function request<T>(url: string, init: RequestInit): Promise<T> {
  const response = await fetch(url, init)
  if (!response.ok) {
    let description = `Cloud request failed (HTTP ${response.status}).`
    try {
      const body = await response.json() as { msg?: string; error_description?: string; message?: string }
      description = body.error_description ?? body.msg ?? body.message ?? description
    } catch { /* Keep the HTTP status if server returned no JSON. */ }
    throw new Error(description)
  }
  if (response.status === 204) return undefined as T
  return await response.json() as T
}

export function createCrowdLensCloud(config: CrowdLensCloudConfig) {
  const base = config.url.replace(/\/+$/, '')
  if (!/^https:\/\/[\w.-]+$/.test(base)) throw new Error('Cloud URL must be an HTTPS origin.')
  if (!config.publishableKey) throw new Error('Supabase publishable key is required.')

  return {
    async requestEmailCode(email: string, redirectTo?: string): Promise<void> {
      const destination = redirectTo ? `?redirect_to=${encodeURIComponent(redirectTo)}` : ''
      await request<unknown>(`${base}/auth/v1/otp${destination}`, {
        method: 'POST', headers: configHeaders(config),
        body: JSON.stringify({ email, create_user: true }),
      })
    },
    async completeEmailLinkFromUrl(): Promise<CrowdLensSession | null> {
      if (typeof window === 'undefined') return null
      const fragment = new URLSearchParams(window.location.hash.slice(1))
      const accessToken = fragment.get('access_token')
      if (!accessToken) return null
      // Clean tokens out of browser history as soon as they are read.
      window.history.replaceState(null, '', window.location.pathname + window.location.search)
      if (fragment.get('token_type') !== 'bearer') throw new Error('Unexpected email link token type.')
      const user = await request<{ id: string }>(`${base}/auth/v1/user`, {
        headers: configHeaders(config, accessToken),
      })
      if (!user.id) throw new Error('Email link did not return an authenticated user.')
      const expiresSeconds = Number(fragment.get('expires_in') || '0')
      if (!Number.isFinite(expiresSeconds) || expiresSeconds <= 0) throw new Error('Email link is expired.')
      return { accessToken, userId: user.id, expiresAt: Date.now() + expiresSeconds * 1000 }
    },
    async verifyEmailCode(email: string, code: string): Promise<CrowdLensSession> {
      const body = await request<{
        access_token: string
        expires_in: number
        user: { id: string }
      }>(`${base}/auth/v1/verify`, {
        method: 'POST', headers: configHeaders(config),
        body: JSON.stringify({ email, token: code, type: 'email' }),
      })
      if (!body.access_token || !body.user?.id) throw new Error('Authentication did not return a valid session.')
      return { accessToken: body.access_token, userId: body.user.id, expiresAt: Date.now() + body.expires_in * 1000 }
    },
    async listMissions(session: CrowdLensSession): Promise<CloudMission[]> {
      return request<CloudMission[]>(`${base}/rest/v1/crowdlens_missions?select=*&status=eq.open&order=created_at.desc&limit=100`, {
        headers: configHeaders(config, session.accessToken),
      })
    },
    async createMission(session: CrowdLensSession, input: {
      title: string; place: string; reward: number; radius: 25 | 50 | 100; latitude: number; longitude: number
    }): Promise<CloudMission> {
      const rows = await request<CloudMission[]>(`${base}/rest/v1/crowdlens_missions?select=*`, {
        method: 'POST',
        headers: { ...configHeaders(config, session.accessToken), Prefer: 'return=representation' },
        body: JSON.stringify({
          requester_id: session.userId, title: input.title.trim(), place: input.place.trim(),
          reward_test_usdc: input.reward, radius_m: input.radius,
          target_lat: input.latitude, target_lon: input.longitude,
        }),
      })
      if (!rows[0]) throw new Error('Cloud did not return the new mission.')
      return rows[0]
    },
    async listSubmissions(session: CrowdLensSession): Promise<CloudSubmission[]> {
      return request<CloudSubmission[]>(`${base}/rest/v1/crowdlens_submissions?select=*&order=created_at.desc&limit=100`, {
        headers: configHeaders(config, session.accessToken),
      })
    },
    async uploadPrivateJpeg(session: CrowdLensSession, bytes: Blob, filename: string): Promise<string> {
      if (bytes.type !== 'image/jpeg' || bytes.size > 5 * 1024 * 1024) {
        throw new Error('Proof must be a JPEG smaller than 5 MB.')
      }
      if (!/^[a-zA-Z0-9_-]+\.jpg$/.test(filename)) throw new Error('Invalid proof image filename.')
      const path = `${session.userId}/${filename}`
      const response = await fetch(`${base}/storage/v1/object/crowdlens-proofs/${path}`, {
        method: 'POST',
        headers: { apikey: config.publishableKey, Authorization: `Bearer ${session.accessToken}`, 'Content-Type': 'image/jpeg', 'x-upsert': 'false' },
        body: bytes,
      })
      if (!response.ok) throw new Error(`Private photo upload failed (HTTP ${response.status}).`)
      return path
    },
    async createBrowserSubmission(session: CrowdLensSession, input: {
      missionId: string; photoPath: string; latitude: number; longitude: number; accuracy: number; distance: number
    }): Promise<CloudSubmission> {
      const rows = await request<CloudSubmission[]>(`${base}/rest/v1/crowdlens_submissions?select=*`, {
        method: 'POST', headers: { ...configHeaders(config, session.accessToken), Prefer: 'return=representation' },
        body: JSON.stringify({
          mission_id: input.missionId, scout_id: session.userId, photo_path: input.photoPath,
          browser_reported_lat: input.latitude, browser_reported_lon: input.longitude,
          browser_reported_accuracy_m: input.accuracy, browser_reported_distance_m: input.distance,
          capture_source: 'browser_unverified',
        }),
      })
      if (!rows[0]) throw new Error('Submission did not return a record.')
      return rows[0]
    },
    async reviewSubmission(session: CrowdLensSession, id: string, decision: 'accepted_demo' | 'rejected_demo'): Promise<CloudSubmission> {
      return request<CloudSubmission>(`${base}/rest/v1/rpc/crowdlens_review_submission`, {
        method: 'POST', headers: configHeaders(config, session.accessToken),
        body: JSON.stringify({ p_submission_id: id, p_decision: decision }),
      })
    },
  }
}
