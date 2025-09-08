import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { useSessionManager } from '../hooks/useSessionManager'
import { authService } from '../services/auth'
import { User } from '../types'
import { tokenStorage } from '../utils/tokenStorage'

interface AuthContextType {
	user: User | null
	loading: boolean
	login: (emailOrUsername: string, password: string) => Promise<void>
	loginWithGoogle: () => Promise<void>
	setAuthenticatedUser: (user: User, token: string) => void
	register: (userData: RegisterData) => Promise<void>
	logout: () => void
	updateUser: (userData: Partial<User>) => Promise<void>
}

interface RegisterData {
	email: string
	username: string
	password: string
	displayName: string
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
	const context = useContext(AuthContext)
	if (context === undefined) {
		throw new Error('useAuth must be used within an AuthProvider')
	}
	return context
}

interface AuthProviderProps {
	children: ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
	const [user, setUser] = useState<User | null>(null)
	const [loading, setLoading] = useState(true)

	const logout = () => {
		setUser(null)
		tokenStorage.clearAll()
		authService.setToken('')
		toast.success('Logged out successfully')
	}

	// Initialize session manager with logout callback
	useSessionManager(logout)

	useEffect(() => {
		// Check for existing token on app load
		const token = tokenStorage.getToken()
		if (token) {
			authService.setToken(token)
			// Verify token and get user data
			authService.getCurrentUser()
				.then(userData => {
					setUser(userData)
					tokenStorage.setUser(userData)
				})
				.catch(() => {
					tokenStorage.clearAll()
					authService.setToken('')
				})
				.finally(() => {
					setLoading(false)
				})
		} else {
			setLoading(false)
		}
	}, [])

	const login = async (emailOrUsername: string, password: string) => {
		try {
			const response = await authService.login(emailOrUsername, password)
			setUser(response.user)
			tokenStorage.setToken(response.token)
			tokenStorage.setUser(response.user)
			authService.setToken(response.token)
			toast.success('Welcome back!')
		} catch (error: any) {
			toast.error(error.message || 'Login failed')
			throw error
		}
	}

	const register = async (userData: RegisterData) => {
		try {
			const response = await authService.register(userData)
			setUser(response.user)
			tokenStorage.setToken(response.token)
			tokenStorage.setUser(response.user)
			authService.setToken(response.token)
			toast.success('Welcome to Wardrobe AI!')
		} catch (error: any) {
			toast.error(error.message || 'Registration failed')
			throw error
		}
	}

	const loginWithGoogle = async () => {
		try {
			// Redirect to Google OAuth URL
			const authUrl = await authService.getGoogleAuthUrl()
			window.location.href = authUrl
		} catch (error: any) {
			toast.error(error.message || 'Google authentication failed')
			throw error
		}
	}

	const setAuthenticatedUser = (userData: User, token: string) => {
		setUser(userData)
		tokenStorage.setToken(token)
		tokenStorage.setUser(userData)
		authService.setToken(token)
	}

	const updateUser = async (userData: Partial<User>) => {
		try {
			const updatedUser = await authService.updateProfile(userData)
			setUser(prevUser => ({ ...prevUser, ...updatedUser }))
			toast.success('Profile updated successfully')
		} catch (error: any) {
			toast.error(error.message || 'Failed to update profile')
			throw error
		}
	}

	const value: AuthContextType = {
		user,
		loading,
		login,
		loginWithGoogle,
		setAuthenticatedUser,
		register,
		logout,
		updateUser
	}

	return (
		<AuthContext.Provider value={value}>
			{children}
		</AuthContext.Provider>
	)
}
