// Thin client for the resident-brain server (server/) — a separate Railway
// service. All cognition and the OpenRouter key live there; this just calls
// it. Override with VITE_BRAIN_URL for local dev against `npm run dev` in
// server/ instead of the deployed brain service.

const BRAIN_URL = import.meta.env.VITE_BRAIN_URL || 'https://simtown-brain-production.up.railway.app'

export interface ResidentSummary {
  id: string
  name: string
}

async function postJSON<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${BRAIN_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || `request to ${path} failed`)
  return data as T
}

let talkableCache: Promise<ResidentSummary[]> | null = null

/** Which residents actually have a brain online right now — fetched once and cached. */
export function talkableResidents(): Promise<ResidentSummary[]> {
  if (!talkableCache) {
    talkableCache = fetch(`${BRAIN_URL}/api/residents`)
      .then((res) => res.json())
      .catch(() => {
        talkableCache = null // let a later attempt retry rather than caching a failure forever
        return []
      })
  }
  return talkableCache
}

export function greet(residentId: string, visitorId: string): Promise<{ reply: string }> {
  return postJSON('/api/greet', { residentId, visitorId })
}

export function chat(residentId: string, visitorId: string, message: string): Promise<{ reply: string }> {
  return postJSON('/api/chat', { residentId, visitorId, message })
}
