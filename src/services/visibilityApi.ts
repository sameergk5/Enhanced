// Backend visibility integration (Task 5.3)
// Provides fetch & update helpers with abort + error normalization.

import type { WardrobeVisibility } from './profilePreferences'

export interface VisibilityResponse { visibility: WardrobeVisibility }

function authHeaders(): Record<string, string> {
	const token = (typeof window !== 'undefined') ? window.localStorage.getItem('auth_token') : null
	return token ? { Authorization: `Bearer ${token}` } : {}
}

export async function fetchVisibility(signal?: AbortSignal): Promise<WardrobeVisibility> {
	const headers: Record<string, string> = { 'Accept': 'application/json', ...authHeaders() }
	const res = await fetch('/api/visibility', { headers, signal })
	if (!res.ok) throw new Error(`Fetch visibility failed: ${res.status}`)
	const data = await res.json() as VisibilityResponse
	return data.visibility
}

export async function updateVisibility(visibility: WardrobeVisibility, signal?: AbortSignal): Promise<WardrobeVisibility> {
	const headers: Record<string, string> = { 'Content-Type': 'application/json', 'Accept': 'application/json', ...authHeaders() }
	const res = await fetch('/api/visibility', { method: 'PUT', headers, body: JSON.stringify({ visibility }), signal })
	if (!res.ok) throw new Error(`Update visibility failed: ${res.status}`)
	const data = await res.json() as VisibilityResponse & { message?: string }
	return data.visibility
}
