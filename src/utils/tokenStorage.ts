/**
 * Token storage utilities with secure practices
 */

const TOKEN_KEY = 'wardrobe_ai_token'
const USER_KEY = 'wardrobe_ai_user'

export const tokenStorage = {
	/**
	 * Store token securely
	 * Note: In production, consider using httpOnly cookies set by the server
	 */
	setToken: (token: string): void => {
		try {
			localStorage.setItem(TOKEN_KEY, token)
		} catch (error) {
			console.error('Failed to store token:', error)
		}
	},

	/**
	 * Get stored token
	 */
	getToken: (): string | null => {
		try {
			return localStorage.getItem(TOKEN_KEY)
		} catch (error) {
			console.error('Failed to retrieve token:', error)
			return null
		}
	},

	/**
	 * Remove token from storage
	 */
	removeToken: (): void => {
		try {
			localStorage.removeItem(TOKEN_KEY)
		} catch (error) {
			console.error('Failed to remove token:', error)
		}
	},

	/**
	 * Store user data temporarily (for offline access)
	 */
	setUser: (user: any): void => {
		try {
			localStorage.setItem(USER_KEY, JSON.stringify(user))
		} catch (error) {
			console.error('Failed to store user data:', error)
		}
	},

	/**
	 * Get stored user data
	 */
	getUser: (): any | null => {
		try {
			const userData = localStorage.getItem(USER_KEY)
			return userData ? JSON.parse(userData) : null
		} catch (error) {
			console.error('Failed to retrieve user data:', error)
			return null
		}
	},

	/**
	 * Remove user data from storage
	 */
	removeUser: (): void => {
		try {
			localStorage.removeItem(USER_KEY)
		} catch (error) {
			console.error('Failed to remove user data:', error)
		}
	},

	/**
	 * Clear all auth-related data
	 */
	clearAll(): void {
		tokenStorage.removeToken()
		tokenStorage.removeUser()
	},

	/**
	 * Check if token exists and is not empty
	 */
	hasToken(): boolean {
		const token = tokenStorage.getToken()
		return Boolean(token && token.trim())
	}
}
