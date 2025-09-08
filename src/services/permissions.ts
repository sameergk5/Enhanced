import { apiRequest } from './api'

export interface WardrobePermissions {
	shareWardrobePublic: boolean
	allowOutfitSharing: boolean
	allowAvatarDownloads: boolean
	allowLookRating: boolean
	allowAnonymousViews: boolean
	advancedRules?: Record<string, any> | null
}

export interface WardrobePermissionsResponse {
	permissions: WardrobePermissions
	initialized: boolean
}

export async function fetchPermissions(): Promise<WardrobePermissionsResponse> {
	return apiRequest('/api/permissions', { method: 'GET' })
}

export async function updatePermissions(update: Partial<WardrobePermissions>): Promise<WardrobePermissions> {
	const res = await apiRequest<{ permissions: WardrobePermissions }>('/api/permissions', {
		method: 'PUT',
		body: JSON.stringify(update)
	})
	return res.permissions
}
