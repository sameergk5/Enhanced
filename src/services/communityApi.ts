import { tokenStorage } from '../utils/tokenStorage'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000/api'

export interface SubmitCommunityLookPayload {
	avatarImageUrl?: string
	lookData?: any
	outfitId?: string
}

export async function submitCommunityLook(payload: SubmitCommunityLookPayload) {
	const token = tokenStorage.getToken()
	if (!token) throw new Error('Not authenticated')
	const res = await fetch(`${API_BASE}/community/looks`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'Authorization': `Bearer ${token}`
		},
		body: JSON.stringify(payload)
	})
	if (!res.ok) {
		const err = await res.json().catch(() => ({}))
		throw new Error(err.error || 'Submit failed')
	}
	return res.json()
}
