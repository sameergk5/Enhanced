// Temporary frontend-only profile preferences service (Task 5.1)
// Will be replaced / integrated with backend API in Task 5.3

export type WardrobeVisibility = 'private' | 'friends' | 'public'

export interface ProfilePreferences {
	wardrobeVisibility: WardrobeVisibility
	displayName?: string
	bio?: string
}

const LS_KEY = 'wardrobe_profile_prefs_v1'

const defaultPrefs: ProfilePreferences = {
	wardrobeVisibility: 'private'
}

export function loadProfilePreferences(): ProfilePreferences {
	try {
		const raw = window.localStorage.getItem(LS_KEY)
		if (!raw) return { ...defaultPrefs }
		const parsed = JSON.parse(raw)
		return { ...defaultPrefs, ...parsed }
	} catch (_e) {
		return { ...defaultPrefs }
	}
}

export function saveProfilePreferences(prefs: ProfilePreferences): void {
	try {
		window.localStorage.setItem(LS_KEY, JSON.stringify(prefs))
	} catch (_e) {
		// ignore write errors (quota, etc.)
	}
}
