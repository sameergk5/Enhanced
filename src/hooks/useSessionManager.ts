import { useEffect } from 'react'
import { authService } from '../services/auth'
import { tokenStorage } from '../utils/tokenStorage'

/**
 * Hook to manage session persistence and automatic token refresh
 */
export const useSessionManager = (logoutCallback?: () => void) => {

	useEffect(() => {
		// Check token validity on app start and periodically
		const checkTokenValidity = async () => {
			if (!tokenStorage.hasToken()) {
				return
			}

			try {
				// Try to refresh the token to ensure it's still valid
				const newToken = await authService.refreshToken()
				tokenStorage.setToken(newToken)
				authService.setToken(newToken)
			} catch (error) {
				// Token is invalid or expired, logout user
				console.log('Token expired, logging out')
				if (logoutCallback) {
					logoutCallback()
				}
			}
		}

		// Check token validity immediately
		checkTokenValidity()

		// Set up periodic token refresh (every 15 minutes)
		const interval = setInterval(checkTokenValidity, 15 * 60 * 1000)

		return () => clearInterval(interval)
	}, [logoutCallback])

	// Listen for storage changes (logout from another tab)
	useEffect(() => {
		const handleStorageChange = (e: StorageEvent) => {
			if (e.key === 'wardrobe_ai_token' && !e.newValue && logoutCallback) {
				// Token was removed in another tab, logout this tab too
				logoutCallback()
			}
		}

		window.addEventListener('storage', handleStorageChange)
		return () => window.removeEventListener('storage', handleStorageChange)
	}, [logoutCallback])

	// Auto-logout on browser close (optional - remove if you want persistent sessions)
	useEffect(() => {
		const handleBeforeUnload = () => {
			// Optional: You can remove this if you want sessions to persist across browser restarts
			// tokenStorage.clearAll()
		}

		window.addEventListener('beforeunload', handleBeforeUnload)
		return () => window.removeEventListener('beforeunload', handleBeforeUnload)
	}, [])
}
