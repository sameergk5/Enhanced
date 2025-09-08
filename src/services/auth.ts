import axios, { AxiosInstance, AxiosResponse } from 'axios'
import { User } from '../types'
import { tokenStorage } from '../utils/tokenStorage'

class AuthService {
	private api: AxiosInstance

	constructor() {
		this.api = axios.create({
			baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001/api',
			headers: {
				'Content-Type': 'application/json',
			},
		})

		// Request interceptor to add auth token
		this.api.interceptors.request.use(
			(config) => {
				const token = tokenStorage.getToken()
				if (token) {
					config.headers.Authorization = `Bearer ${token}`
				}
				return config
			},
			(error) => Promise.reject(error)
		)

		// Response interceptor to handle errors
		this.api.interceptors.response.use(
			(response) => response,
			(error) => {
				if (error.response?.status === 401) {
					// Token expired or invalid
					tokenStorage.clearAll()
					window.location.href = '/login'
				}
				return Promise.reject(error)
			}
		)
	}

	setToken(token: string): void {
		if (token) {
			this.api.defaults.headers.common['Authorization'] = `Bearer ${token}`
		} else {
			delete this.api.defaults.headers.common['Authorization']
		}
	}

	async login(emailOrUsername: string, password: string): Promise<{ user: User; token: string }> {
		try {
			const response: AxiosResponse<{ user: User; token: string }> = await this.api.post('/auth/login', {
				emailOrUsername,
				password,
			})
			return response.data
		} catch (error: any) {
			throw new Error(error.response?.data?.error || 'Login failed')
		}
	}

	async register(userData: {
		email: string
		username: string
		password: string
		displayName: string
	}): Promise<{ user: User; token: string }> {
		try {
			const response: AxiosResponse<{ user: User; token: string }> = await this.api.post('/auth/register', userData)
			return response.data
		} catch (error: any) {
			throw new Error(error.response?.data?.error || 'Registration failed')
		}
	}

	async getGoogleAuthUrl(): Promise<string> {
		try {
			const response: AxiosResponse<{ url: string }> = await this.api.get('/auth/google')
			return response.data.url
		} catch (error: any) {
			throw new Error(error.response?.data?.error || 'Failed to get Google auth URL')
		}
	}

	async handleGoogleCallback(code: string): Promise<{ user: User; token: string }> {
		try {
			const response: AxiosResponse<{ user: User; token: string }> = await this.api.post('/auth/google/callback', {
				code
			})
			return response.data
		} catch (error: any) {
			throw new Error(error.response?.data?.error || 'Google authentication failed')
		}
	}

	async verifyGoogleToken(idToken: string): Promise<{ user: User; token: string }> {
		try {
			const response: AxiosResponse<{ user: User; token: string }> = await this.api.post('/auth/google/verify', {
				idToken
			})
			return response.data
		} catch (error: any) {
			throw new Error(error.response?.data?.error || 'Google token verification failed')
		}
	}

	async getCurrentUser(): Promise<User> {
		try {
			const response: AxiosResponse<{ user: User }> = await this.api.get('/users/profile')
			return response.data.user
		} catch (error: any) {
			throw new Error(error.response?.data?.error || 'Failed to get user data')
		}
	}

	async updateProfile(userData: Partial<User>): Promise<User> {
		try {
			const response: AxiosResponse<{ user: User }> = await this.api.put('/users/profile', userData)
			return response.data.user
		} catch (error: any) {
			throw new Error(error.response?.data?.error || 'Failed to update profile')
		}
	}

	async updateMeasurements(measurements: {
		height?: number
		weight?: number
		chestBust?: number
		waist?: number
		hips?: number
		shoulderWidth?: number
	}): Promise<any> {
		try {
			const response = await this.api.put('/users/profile/measurements', measurements)
			return response.data.profile
		} catch (error: any) {
			throw new Error(error.response?.data?.error || 'Failed to update measurements')
		}
	}

	async refreshToken(): Promise<string> {
		try {
			const currentToken = tokenStorage.getToken()
			const response: AxiosResponse<{ token: string }> = await this.api.post('/auth/refresh', {
				token: currentToken,
			})
			return response.data.token
		} catch (error: any) {
			throw new Error(error.response?.data?.error || 'Failed to refresh token')
		}
	}

	logout(): void {
		tokenStorage.clearAll()
		this.setToken('')
	}
}

export const authService = new AuthService()
