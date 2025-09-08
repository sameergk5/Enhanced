// Virtual Try-On Service - Combines Wardrobe and Avatar Data
import { avatarService, type AvatarMetadata } from './avatar'
import { wardrobeService, type Garment } from './wardrobe'

export interface OutfitCombination {
	id: string
	name?: string
	items: OutfitItem[]
	compatibility: number // 0-1 score
	styleCategory: 'casual' | 'formal' | 'business' | 'sporty' | 'party' | 'everyday'
	season?: 'spring' | 'summer' | 'fall' | 'winter' | 'all'
	createdAt: string
}

export interface OutfitItem {
	garmentId: string
	garment: Garment
	layer: number // Layering order (0 = base layer, higher = outer layers)
	position: 'top' | 'bottom' | 'feet' | 'accessories' | 'outerwear'
	renderData?: {
		meshUrl?: string
		textureUrl?: string
		materialProperties?: any
	}
}

export interface TryOnSession {
	avatarData: AvatarMetadata
	wardrobeItems: Garment[]
	currentOutfit: OutfitCombination | null
	suggestedOutfits: OutfitCombination[]
	availableCategories: string[]
}

export interface TryOnPreview {
	id: string
	avatarWithOutfit: string // URL to rendered image/3D model
	outfitId: string
	pose?: string
	lighting?: 'natural' | 'studio' | 'golden' | 'dramatic'
	timestamp: string
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

/**
 * Helper function to make authenticated API requests
 */
async function makeRequest(url: string, options: RequestInit = {}): Promise<any> {
	const token = localStorage.getItem('token')

	const config: RequestInit = {
		...options,
		headers: {
			'Content-Type': 'application/json',
			...(token && { 'Authorization': `Bearer ${token}` }),
			...options.headers
		}
	}

	const response = await fetch(`${API_BASE_URL}${url}`, config)

	if (!response.ok) {
		const errorData = await response.json().catch(() => ({ message: 'Request failed' }))
		throw new Error(errorData.message || `HTTP ${response.status}`)
	}

	return response.json()
}

class VirtualTryOnService {
	private baseUrl = '/api/try-on'

	/**
	 * Initialize a try-on session with user's avatar and wardrobe
	 */
	async initializeTryOnSession(): Promise<TryOnSession> {
		try {
			// Fetch avatar data - get the first available avatar
			const avatars = await avatarService.getUserAvatars()
			const avatarData = avatars.length > 0 ? avatars[0] : null
			if (!avatarData) {
				throw new Error('No avatar found. Please create an avatar first.')
			}

			// Fetch wardrobe items
			const wardrobeItems = await wardrobeService.getGarments()

			// Get suggested outfits
			const suggestedOutfits = await this.generateOutfitSuggestions(wardrobeItems)

			// Get available categories
			const availableCategories: string[] = [...new Set(wardrobeItems.map((item: Garment) => item.category))]

			return {
				avatarData,
				wardrobeItems,
				currentOutfit: null,
				suggestedOutfits,
				availableCategories
			}
		} catch (error) {
			console.error('Failed to initialize try-on session:', error)
			throw error
		}
	}

	/**
	 * Generate outfit suggestions based on available wardrobe items
	 */
	async generateOutfitSuggestions(wardrobeItems: Garment[]): Promise<OutfitCombination[]> {
		// For now, implement basic rule-based outfit generation
		// Later this can be enhanced with AI-powered suggestions

		const outfits: OutfitCombination[] = []

		// Group items by category
		const itemsByCategory = wardrobeItems.reduce((acc, item) => {
			if (!acc[item.category]) {
				acc[item.category] = []
			}
			acc[item.category].push(item)
			return acc
		}, {} as Record<string, Garment[]>)

		const tops = itemsByCategory.top || []
		const bottoms = itemsByCategory.bottom || []
		const dresses = itemsByCategory.dress || []
		const shoes = itemsByCategory.shoes || []
		const outerwear = itemsByCategory.outerwear || []

		// Generate top + bottom combinations
		tops.forEach((top, topIndex) => {
			bottoms.forEach((bottom, bottomIndex) => {
				const items: OutfitItem[] = [
					{
						garmentId: top.id,
						garment: top,
						layer: 1,
						position: 'top'
					},
					{
						garmentId: bottom.id,
						garment: bottom,
						layer: 0,
						position: 'bottom'
					}
				]

				// Add shoes if available
				if (shoes.length > 0) {
					items.push({
						garmentId: shoes[0].id,
						garment: shoes[0],
						layer: 0,
						position: 'feet'
					})
				}

				// Add outerwear for some combinations
				if (outerwear.length > 0 && Math.random() > 0.7) {
					items.push({
						garmentId: outerwear[0].id,
						garment: outerwear[0],
						layer: 2,
						position: 'outerwear'
					})
				}

				outfits.push({
					id: `outfit_${topIndex}_${bottomIndex}`,
					name: `${top.name} + ${bottom.name}`,
					items,
					compatibility: this.calculateCompatibility(items),
					styleCategory: this.determineStyleCategory(items),
					createdAt: new Date().toISOString()
				})
			})
		})

		// Generate dress combinations
		dresses.forEach((dress, dressIndex) => {
			const items: OutfitItem[] = [
				{
					garmentId: dress.id,
					garment: dress,
					layer: 1,
					position: 'top'
				}
			]

			// Add shoes if available
			if (shoes.length > 0) {
				items.push({
					garmentId: shoes[0].id,
					garment: shoes[0],
					layer: 0,
					position: 'feet'
				})
			}

			outfits.push({
				id: `dress_outfit_${dressIndex}`,
				name: dress.name,
				items,
				compatibility: this.calculateCompatibility(items),
				styleCategory: this.determineStyleCategory(items),
				createdAt: new Date().toISOString()
			})
		})

		// Sort by compatibility score and return top suggestions
		return outfits
			.sort((a, b) => b.compatibility - a.compatibility)
			.slice(0, 10) // Return top 10 suggestions
	}

	/**
	 * Calculate compatibility score for outfit items
	 */
	private calculateCompatibility(items: OutfitItem[]): number {
		// Basic compatibility scoring based on color harmony and style matching
		// This is a simplified version - could be enhanced with ML models

		let score = 0.7 // Base score

		// Color harmony check
		const colors = items.map(item => item.garment.color?.toLowerCase()).filter(Boolean)
		if (colors.length >= 2) {
			// Simple color matching rules
			const neutralColors = ['black', 'white', 'gray', 'beige', 'navy']
			const hasNeutral = colors.some(color => neutralColors.some(neutral => color.includes(neutral)))

			if (hasNeutral) {
				score += 0.2 // Neutrals generally match well
			}

			// Bonus for matching colors
			const uniqueColors = new Set(colors)
			if (uniqueColors.size <= 2) {
				score += 0.1 // Limited color palette is usually good
			}
		}

		// Style consistency
		const styles = items.flatMap(item => item.garment.tags || [])
		const casualKeywords = ['casual', 'everyday', 'relaxed']
		const formalKeywords = ['formal', 'business', 'dressy']

		const hasCasual = styles.some(tag => casualKeywords.some(keyword => tag.toLowerCase().includes(keyword)))
		const hasFormal = styles.some(tag => formalKeywords.some(keyword => tag.toLowerCase().includes(keyword)))

		if (hasCasual && !hasFormal) {
			score += 0.1 // Consistent casual style
		} else if (hasFormal && !hasCasual) {
			score += 0.1 // Consistent formal style
		}

		return Math.min(score, 1.0) // Cap at 1.0
	}

	/**
	 * Determine style category for an outfit
	 */
	private determineStyleCategory(items: OutfitItem[]): OutfitCombination['styleCategory'] {
		const allTags = items.flatMap(item => item.garment.tags || []).map(tag => tag.toLowerCase())

		if (allTags.some(tag => tag.includes('formal') || tag.includes('business'))) {
			return 'business'
		}
		if (allTags.some(tag => tag.includes('party') || tag.includes('evening'))) {
			return 'party'
		}
		if (allTags.some(tag => tag.includes('sport') || tag.includes('athletic'))) {
			return 'sporty'
		}
		if (allTags.some(tag => tag.includes('formal') || tag.includes('dressy'))) {
			return 'formal'
		}
		if (allTags.some(tag => tag.includes('casual') || tag.includes('everyday'))) {
			return 'casual'
		}

		return 'everyday' // Default
	}

	/**
	 * Create a custom outfit from selected items
	 */
	async createCustomOutfit(garmentIds: string[], name?: string): Promise<OutfitCombination> {
		try {
			// Fetch full garment data
			const garments = await Promise.all(
				garmentIds.map(id => wardrobeService.getGarment(id))
			)

			// Create outfit items with appropriate layering
			const items: OutfitItem[] = garments.map((garment) => ({
				garmentId: garment.id,
				garment,
				layer: this.getLayerForCategory(garment.category),
				position: this.getPositionForCategory(garment.category)
			}))

			// Sort items by layer (base layer first)
			items.sort((a, b) => a.layer - b.layer)

			const outfit: OutfitCombination = {
				id: `custom_${Date.now()}`,
				name: name || `Custom Outfit ${new Date().toLocaleString()}`,
				items,
				compatibility: this.calculateCompatibility(items),
				styleCategory: this.determineStyleCategory(items),
				createdAt: new Date().toISOString()
			}

			return outfit
		} catch (error) {
			console.error('Failed to create custom outfit:', error)
			throw error
		}
	}

	/**
	 * Get layer number for clothing category
	 */
	private getLayerForCategory(category: string): number {
		const layerMap: Record<string, number> = {
			'shoes': 0,
			'bottom': 0,
			'dress': 1,
			'top': 1,
			'accessory': 2,
			'outerwear': 3
		}
		return layerMap[category] || 1
	}

	/**
	 * Get position for clothing category
	 */
	private getPositionForCategory(category: string): OutfitItem['position'] {
		const positionMap: Record<string, OutfitItem['position']> = {
			'top': 'top',
			'dress': 'top',
			'bottom': 'bottom',
			'shoes': 'feet',
			'accessory': 'accessories',
			'outerwear': 'outerwear'
		}
		return positionMap[category] || 'top'
	}

	/**
	 * Generate preview of avatar wearing an outfit
	 */
	async generateOutfitPreview(
		outfit: OutfitCombination,
		options: {
			pose?: string
			lighting?: TryOnPreview['lighting']
		} = {}
	): Promise<TryOnPreview> {
		try {
			const garmentIds = outfit.items.map(item => item.garmentId)

			// For now, we'll use a mock preview URL
			// In a real implementation, this would call a 3D rendering service
			const previewUrl = await this.mockGeneratePreview(garmentIds, options)

			return {
				id: `preview_${Date.now()}`,
				avatarWithOutfit: previewUrl,
				outfitId: outfit.id,
				pose: options.pose || 'default',
				lighting: options.lighting || 'natural',
				timestamp: new Date().toISOString()
			}
		} catch (error) {
			console.error('Failed to generate outfit preview:', error)
			throw error
		}
	}

	/**
	 * Mock preview generation (replace with actual 3D rendering)
	 */
	private async mockGeneratePreview(
		garmentIds: string[],
		options: { pose?: string; lighting?: string }
	): Promise<string> {
		// This is a mock implementation
		// In production, this would integrate with a 3D rendering service
		return `/api/placeholder/avatar-with-outfit?items=${garmentIds.join(',')}&pose=${options.pose || 'default'}`
	}

	/**
	 * Save an outfit to the user's collection
	 */
	async saveOutfit(outfit: OutfitCombination): Promise<OutfitCombination> {
		try {
			const response = await makeRequest(`${this.baseUrl}/outfits`, {
				method: 'POST',
				body: JSON.stringify(outfit)
			})
			return response.outfit
		} catch (error) {
			console.error('Failed to save outfit:', error)
			throw error
		}
	}

	/**
	 * Get saved outfits
	 */
	async getSavedOutfits(): Promise<OutfitCombination[]> {
		try {
			const response = await makeRequest(`${this.baseUrl}/outfits`)
			return response.outfits || []
		} catch (error) {
			console.error('Failed to get saved outfits:', error)
			return []
		}
	}

	/**
	 * Delete a saved outfit
	 */
	async deleteOutfit(outfitId: string): Promise<void> {
		try {
			await makeRequest(`${this.baseUrl}/outfits/${outfitId}`, {
				method: 'DELETE'
			})
		} catch (error) {
			console.error('Failed to delete outfit:', error)
			throw error
		}
	}
}

// Create and export singleton instance
export const virtualTryOnService = new VirtualTryOnService()
export default virtualTryOnService
