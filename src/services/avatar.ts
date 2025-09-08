import axios, { AxiosInstance, AxiosResponse } from 'axios'

export interface AvatarCreationOptions {
	imageUrl: string
	gender?: 'male' | 'female'
	bodyType?: 'average' | 'slim' | 'athletic' | 'curvy'
	style?: 'realistic' | 'stylized'
}

export interface AvatarGenerationResponse {
	avatarId: string
	status: 'processing' | 'completed' | 'failed'
	avatarUrl?: string
	thumbnailUrl?: string
	estimatedTime?: number
	error?: string
}

export interface AvatarMetadata {
	id: string
	userId: string
	status: 'processing' | 'completed' | 'failed'
	avatarUrl?: string
	thumbnailUrl?: string
	createdAt: string
	updatedAt: string
	metadata?: {
		originalImageUrl?: string
		style?: string
		bodyType?: string
	}
}

class AvatarService {
	private api: AxiosInstance

	constructor() {
		this.api = axios.create({
			baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001/api',
			headers: {
				'Content-Type': 'application/json',
			},
		})

		// Add auth token to requests
		this.api.interceptors.request.use(
			(config) => {
				const token = localStorage.getItem('wardrobe_ai_token')
				if (token) {
					config.headers.Authorization = `Bearer ${token}`
				}
				return config
			},
			(error) => Promise.reject(error)
		)
	}

	/**
	 * Upload selfie image and get a temporary URL for processing
	 */
	async uploadSelfie(file: File): Promise<{ imageUrl: string }> {
		const formData = new FormData()
		formData.append('selfie', file)

		try {
			const response: AxiosResponse<{ imageUrl: string }> = await this.api.post(
				'/avatars/upload-selfie',
				formData,
				{
					headers: {
						'Content-Type': 'multipart/form-data',
					},
				}
			)
			return response.data
		} catch (error: any) {
			throw new Error(error.response?.data?.error || 'Failed to upload selfie')
		}
	}

	/**
	 * Create avatar from uploaded selfie
	 */
	async createAvatar(options: AvatarCreationOptions): Promise<AvatarGenerationResponse> {
		try {
			const response: AxiosResponse<AvatarGenerationResponse> = await this.api.post(
				'/avatars/create',
				options
			)
			return response.data
		} catch (error: any) {
			throw new Error(error.response?.data?.error || 'Failed to create avatar')
		}
	}

	/**
	 * Check avatar generation status
	 */
	async getAvatarStatus(avatarId: string): Promise<AvatarGenerationResponse> {
		try {
			const response: AxiosResponse<AvatarGenerationResponse> = await this.api.get(
				`/avatars/status/${avatarId}`
			)
			return response.data
		} catch (error: any) {
			throw new Error(error.response?.data?.error || 'Failed to get avatar status')
		}
	}

	/**
	 * Get user's avatars
	 */
	async getUserAvatars(): Promise<AvatarMetadata[]> {
		try {
			const response: AxiosResponse<{ avatars: AvatarMetadata[] }> = await this.api.get(
				'/avatars/user'
			)
			return response.data.avatars
		} catch (error: any) {
			throw new Error(error.response?.data?.error || 'Failed to get user avatars')
		}
	}

	/**
	 * Get specific avatar details
	 */
	async getAvatar(avatarId: string): Promise<AvatarMetadata> {
		try {
			const response: AxiosResponse<{ avatar: AvatarMetadata }> = await this.api.get(
				`/avatars/${avatarId}`
			)
			return response.data.avatar
		} catch (error: any) {
			throw new Error(error.response?.data?.error || 'Failed to get avatar')
		}
	}

	/**
	 * Delete avatar
	 */
	async deleteAvatar(avatarId: string): Promise<void> {
		try {
			await this.api.delete(`/avatars/${avatarId}`)
		} catch (error: any) {
			throw new Error(error.response?.data?.error || 'Failed to delete avatar')
		}
	}

	/**
	 * Set active avatar for user
	 */
	async setActiveAvatar(avatarId: string): Promise<void> {
		try {
			await this.api.post(`/avatars/${avatarId}/set-active`)
		} catch (error: any) {
			throw new Error(error.response?.data?.error || 'Failed to set active avatar')
		}
	}

	/**
	 * Poll avatar generation status until completion
	 */
	async waitForAvatarCompletion(
		avatarId: string,
		onProgress?: (status: AvatarGenerationResponse) => void,
		timeout: number = 300000 // 5 minutes
	): Promise<AvatarGenerationResponse> {
		const startTime = Date.now()
		const pollInterval = 2000 // Poll every 2 seconds

		return new Promise((resolve, reject) => {
			const poll = async () => {
				try {
					if (Date.now() - startTime > timeout) {
						reject(new Error('Avatar generation timed out'))
						return
					}

					const status = await this.getAvatarStatus(avatarId)

					if (onProgress) {
						onProgress(status)
					}

					if (status.status === 'completed') {
						resolve(status)
					} else if (status.status === 'failed') {
						reject(new Error(status.error || 'Avatar generation failed'))
					} else {
						// Still processing, continue polling
						setTimeout(poll, pollInterval)
					}
				} catch (error) {
					reject(error)
				}
			}

			poll()
		})
	}
}

export const avatarService = new AvatarService()
