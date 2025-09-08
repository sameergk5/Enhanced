import { useCallback, useEffect, useState } from 'react'
import { fetchPermissions, updatePermissions, WardrobePermissions } from '../services/permissions'

interface UsePermissionsState {
	permissions: WardrobePermissions | null
	loading: boolean
	saving: boolean
	initialized: boolean
	error: string | null
	refresh: () => Promise<void>
	save: (update: Partial<WardrobePermissions>) => Promise<void>
}

const defaultPerms: WardrobePermissions = {
	shareWardrobePublic: false,
	allowOutfitSharing: true,
	allowAvatarDownloads: false,
	allowLookRating: true,
	allowAnonymousViews: false,
	advancedRules: null
}

export function usePermissions(): UsePermissionsState {
	const [permissions, setPermissions] = useState<WardrobePermissions | null>(null)
	const [loading, setLoading] = useState(true)
	const [saving, setSaving] = useState(false)
	const [initialized, setInitialized] = useState(false)
	const [error, setError] = useState<string | null>(null)

	const load = useCallback(async () => {
		setLoading(true)
		setError(null)
		try {
			const res = await fetchPermissions()
			setPermissions({ ...defaultPerms, ...res.permissions })
			setInitialized(res.initialized)
		} catch (e: any) {
			setError(e.message || 'Failed to load permissions')
		} finally {
			setLoading(false)
		}
	}, [])

	const save = useCallback(async (update: Partial<WardrobePermissions>) => {
		setSaving(true)
		setError(null)
		try {
			const saved = await updatePermissions(update)
			setPermissions(saved)
			setInitialized(true)
			// Return merged for callers if needed
		} catch (e: any) {
			setError(e.message || 'Failed to save permissions')
		} finally {
			setSaving(false)
		}
	}, [permissions])

	useEffect(() => { load() }, [load])

	return { permissions, loading, saving, initialized, error, refresh: load, save }
}
