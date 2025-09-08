export interface Garment {
	id: string
	name: string
	category: 'top' | 'bottom' | 'dress' | 'shoes' | 'accessory' | 'outerwear'
	subcategory?: string
	description?: string
	brand?: string
	color: string
	pattern?: string
	material?: string
	tags: string[]
	images: string[]
	thumbnailUrl?: string
	isFavorite?: boolean
	wearCount?: number
	lastWorn?: string
	arMetadata?: any
	createdAt: string
	updatedAt: string
}

export interface GarmentUploadData {
	name?: string
	category?: string
	primaryColor?: string
	colors?: string[]
	brand?: string
	description?: string
	tags?: string[]
}

export interface GarmentFilters {
	category?: string
	color?: string
	search?: string
	tags?: string[]
}

export interface UploadResponse {
	success: boolean
	message: string
	garment: Garment
	processing: {
		imageProcessed: boolean
		thumbnailGenerated: boolean
		aiAnalysisPending: boolean
	}
}

export interface AIAnalysisStatus {
	garmentId: string
	status: 'pending' | 'processing' | 'completed' | 'failed'
	hasError: boolean
	error?: string
	category?: string
	subcategory?: string
	primaryColor?: string
	pattern?: string
	material?: string
	brand?: string
	style?: string
	confidence?: number
	lastUpdated: string
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

/**
 * Helper function to make authenticated API requests
 */
async function makeRequest<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
	const token = localStorage.getItem('token')

	const response = await fetch(`${API_BASE_URL}${endpoint}`, {
		...options,
		headers: {
			'Content-Type': 'application/json',
			...(token && { 'Authorization': `Bearer ${token}` }),
			...options.headers
		}
	})

	if (!response.ok) {
		const error = await response.json().catch(() => ({ error: 'Request failed' }))
		throw new Error(error.error || error.message || `HTTP ${response.status}`)
	}

	return response.json()
}

class WardrobeService {
	private baseUrl = '/api/wardrobe'

	/**
	 * Upload a new garment with image and metadata
	 */
	async uploadGarment(image: File, metadata: GarmentUploadData): Promise<UploadResponse> {
		const formData = new FormData()
		formData.append('image', image)

		// Add metadata fields
		Object.entries(metadata).forEach(([key, value]) => {
			if (value !== undefined && value !== null) {
				if (Array.isArray(value)) {
					formData.append(key, value.join(','))
				} else {
					formData.append(key, String(value))
				}
			}
		})

		const token = localStorage.getItem('token')
		const response = await fetch(`${API_BASE_URL}${this.baseUrl}/items`, {
			method: 'POST',
			headers: {
				...(token && { 'Authorization': `Bearer ${token}` })
			},
			body: formData
		})

		if (!response.ok) {
			const error = await response.json()
			throw new Error(error.error || 'Upload failed')
		}

		return response.json()
	}

	/**
	 * Get all garments with optional filters
	 */
	async getGarments(filters: GarmentFilters = {}): Promise<Garment[]> {
		const params = new URLSearchParams()

		if (filters.category) params.append('category', filters.category)
		if (filters.color) params.append('color', filters.color)
		if (filters.search) params.append('search', filters.search)
		if (filters.tags?.length) params.append('tags', filters.tags.join(','))

		const response = await makeRequest(`${this.baseUrl}/items?${params}`)
		return response.garments || []
	}

	/**
	 * Get a single garment by ID
	 */
	async getGarment(id: string): Promise<Garment> {
		const response = await makeRequest(`${this.baseUrl}/items/${id}`)
		return response.garment
	}

	/**
	 * Update garment metadata
	 */
	async updateGarment(id: string, updates: Partial<GarmentUploadData>): Promise<Garment> {
		const response = await makeRequest(`${this.baseUrl}/items/${id}`, {
			method: 'PUT',
			body: JSON.stringify(updates)
		})
		return response.garment
	}

	/**
	 * Delete a garment
	 */
	async deleteGarment(id: string): Promise<void> {
		await makeRequest(`${this.baseUrl}/items/${id}`, {
			method: 'DELETE'
		})
	}

	/**
	 * Get wardrobe statistics
	 */
	async getStatistics(): Promise<any> {
		const response = await makeRequest(`${this.baseUrl}/statistics`)
		return response.statistics
	}

	/**
	 * Check AI analysis status for a garment
	 */
	async getAIAnalysisStatus(id: string): Promise<AIAnalysisStatus> {
		const response = await makeRequest(`${this.baseUrl}/items/${id}/ai-status`)
		return response
	}

	/**
	 * Trigger AI re-analysis for a garment
	 */
	async triggerAIReanalysis(id: string): Promise<{ message: string; status: string }> {
		const response = await makeRequest(`${this.baseUrl}/items/${id}/reanalyze`, {
			method: 'POST'
		})
		return response
	}

	/**
	 * Get categories with counts
	 */
	async getCategories(): Promise<Array<{ category: string; count: number }>> {
		const garments = await this.getGarments()
		const categoryCounts = garments.reduce((acc, garment) => {
			acc[garment.category] = (acc[garment.category] || 0) + 1
			return acc
		}, {} as Record<string, number>)

		return Object.entries(categoryCounts).map(([category, count]) => ({
			category,
			count
		}))
	}

	/**
	 * Get color palette from wardrobe
	 */
	async getColorPalette(): Promise<Array<{ color: string; count: number }>> {
		const garments = await this.getGarments()
		const colorCounts = garments.reduce((acc, garment) => {
			acc[garment.color] = (acc[garment.color] || 0) + 1
			return acc
		}, {} as Record<string, number>)

		return Object.entries(colorCounts)
			.map(([color, count]) => ({ color, count }))
			.sort((a, b) => b.count - a.count)
	}

	/**
	 * Search garments with text query
	 */
	async searchGarments(query: string): Promise<Garment[]> {
		return this.getGarments({ search: query })
	}

	/**
	 * Get recently added garments
	 */
	async getRecentGarments(limit: number = 10): Promise<Garment[]> {
		const garments = await this.getGarments()
		return garments
			.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
			.slice(0, limit)
	}

	/**
	 * Get most worn garments
	 */
	async getMostWornGarments(limit: number = 10): Promise<Garment[]> {
		const garments = await this.getGarments()
		return garments
			.filter(g => g.wearCount && g.wearCount > 0)
			.sort((a, b) => (b.wearCount || 0) - (a.wearCount || 0))
			.slice(0, limit)
	}

	/**
	 * Record garment wear
	 */
	async recordWear(id: string): Promise<Garment> {
		const response = await makeRequest(`${this.baseUrl}/garments/${id}/wear`, {
			method: 'POST'
		})
		return response.garment
	}

	/**
	 * Toggle favorite status of a garment
	 */
	async toggleFavorite(id: string): Promise<Garment> {
		const response = await makeRequest(`${this.baseUrl}/items/${id}/favorite`, {
			method: 'POST'
		})
		return response.garment
	}

	/**
	 * Trigger AI reanalysis of a garment
	 */
	async reanalyzeGarment(id: string): Promise<void> {
		await makeRequest(`${this.baseUrl}/items/${id}/reanalyze`, {
			method: 'POST'
		})
	}
}

// Create and export singleton instance
export const wardrobeService = new WardrobeService()
export default wardrobeService
