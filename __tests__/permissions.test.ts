import { beforeEach, describe, expect, it, vi } from 'vitest'
import * as api from '../src/services/api'
import { fetchPermissions, updatePermissions } from '../src/services/permissions'

describe('permissions service', () => {
	const mockRequest = vi.spyOn(api, 'apiRequest')

	beforeEach(() => {
		mockRequest.mockReset()
	})

	it('fetchPermissions returns data', async () => {
		mockRequest.mockResolvedValue({ permissions: { shareWardrobePublic: false, allowOutfitSharing: true, allowAvatarDownloads: false, allowLookRating: true, allowAnonymousViews: false, advancedRules: null }, initialized: false })
		const res = await fetchPermissions()
		expect(res.permissions.allowOutfitSharing).toBe(true)
	})

	it('updatePermissions sends PUT', async () => {
		mockRequest.mockResolvedValue({ permissions: { shareWardrobePublic: true, allowOutfitSharing: true, allowAvatarDownloads: false, allowLookRating: true, allowAnonymousViews: false, advancedRules: null } })
		const saved = await updatePermissions({ shareWardrobePublic: true })
		expect(saved.shareWardrobePublic).toBe(true)
		expect(mockRequest).toHaveBeenCalled()
	})
})
