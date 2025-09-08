import { PrismaClient } from '@prisma/client'
import FreeTextAnalyzer from './freeTextAnalyzer.js'

const prisma = new PrismaClient()
const textAnalyzer = new FreeTextAnalyzer()

// Color and style types (backend versions of frontend types)
const SKIN_TONE_TYPES = {
	COOL: 'cool',
	WARM: 'warm',
	NEUTRAL: 'neutral'
}

const GARMENT_CATEGORIES = {
	TOP: 'top',
	BOTTOM: 'bottom',
	DRESS: 'dress',
	OUTERWEAR: 'outerwear',
	SHOES: 'shoes',
	ACCESSORY: 'accessory'
}

const FORMALITY_LEVELS = {
	VERY_CASUAL: 1,
	CASUAL: 2,
	SMART_CASUAL: 3,
	BUSINESS_CASUAL: 4,
	FORMAL: 5,
	BLACK_TIE: 6
}

/**
 * Skin Tone Color Matching Service
 * Analyzes skin tones and provides color recommendations
 */
class SkinToneColorMatcher {
	constructor() {
		// Comprehensive color database with skin tone compatibility
		this.colorDatabase = {
			// Cool skin tone recommendations
			cool: {
				excellent: [
					{ name: 'Royal Blue', hex: '#4169E1', category: 'blue' },
					{ name: 'Emerald Green', hex: '#50C878', category: 'green' },
					{ name: 'True Red', hex: '#FF0000', category: 'red' },
					{ name: 'Hot Pink', hex: '#FF69B4', category: 'pink' },
					{ name: 'Pure White', hex: '#FFFFFF', category: 'white' },
					{ name: 'Black', hex: '#000000', category: 'black' },
					{ name: 'Silver', hex: '#C0C0C0', category: 'metallic' },
					{ name: 'Cool Gray', hex: '#808080', category: 'neutral' },
					{ name: 'Navy Blue', hex: '#000080', category: 'blue' },
					{ name: 'Burgundy', hex: '#800020', category: 'red' }
				],
				good: [
					{ name: 'Teal', hex: '#008080', category: 'blue' },
					{ name: 'Purple', hex: '#800080', category: 'purple' },
					{ name: 'Magenta', hex: '#FF00FF', category: 'pink' },
					{ name: 'Cool Brown', hex: '#8B4513', category: 'brown' },
					{ name: 'Lavender', hex: '#E6E6FA', category: 'purple' },
					{ name: 'Ice Blue', hex: '#87CEEB', category: 'blue' },
					{ name: 'Charcoal', hex: '#36454F', category: 'neutral' }
				],
				avoid: [
					{ name: 'Orange', hex: '#FFA500', category: 'orange' },
					{ name: 'Warm Yellow', hex: '#FFD700', category: 'yellow' },
					{ name: 'Rust', hex: '#B7410E', category: 'orange' },
					{ name: 'Warm Beige', hex: '#F5DEB3', category: 'beige' }
				]
			},
			// Warm skin tone recommendations
			warm: {
				excellent: [
					{ name: 'Golden Yellow', hex: '#FFD700', category: 'yellow' },
					{ name: 'Coral', hex: '#FF7F50', category: 'orange' },
					{ name: 'Peach', hex: '#FFCBA4', category: 'orange' },
					{ name: 'Warm Brown', hex: '#A0522D', category: 'brown' },
					{ name: 'Olive Green', hex: '#808000', category: 'green' },
					{ name: 'Rust Orange', hex: '#B7410E', category: 'orange' },
					{ name: 'Gold', hex: '#FFD700', category: 'metallic' },
					{ name: 'Cream', hex: '#FFFDD0', category: 'white' },
					{ name: 'Camel', hex: '#C19A6B', category: 'brown' },
					{ name: 'Terracotta', hex: '#E2725B', category: 'red' }
				],
				good: [
					{ name: 'Forest Green', hex: '#228B22', category: 'green' },
					{ name: 'Warm Red', hex: '#DC143C', category: 'red' },
					{ name: 'Amber', hex: '#FFBF00', category: 'yellow' },
					{ name: 'Chocolate Brown', hex: '#7B3F00', category: 'brown' },
					{ name: 'Warm Gray', hex: '#8B8680', category: 'neutral' },
					{ name: 'Brick Red', hex: '#CB4154', category: 'red' }
				],
				avoid: [
					{ name: 'Cool Blue', hex: '#0000FF', category: 'blue' },
					{ name: 'Pure White', hex: '#FFFFFF', category: 'white' },
					{ name: 'Black', hex: '#000000', category: 'black' },
					{ name: 'Hot Pink', hex: '#FF69B4', category: 'pink' }
				]
			},
			// Neutral skin tone recommendations
			neutral: {
				excellent: [
					{ name: 'Soft Pink', hex: '#FFB6C1', category: 'pink' },
					{ name: 'Sage Green', hex: '#9CAF88', category: 'green' },
					{ name: 'Dusty Blue', hex: '#6B8CAE', category: 'blue' },
					{ name: 'Mauve', hex: '#E0B0FF', category: 'purple' },
					{ name: 'Off White', hex: '#FAF0E6', category: 'white' },
					{ name: 'Taupe', hex: '#483C32', category: 'brown' },
					{ name: 'Rose Gold', hex: '#E8B4A0', category: 'metallic' },
					{ name: 'Soft Gray', hex: '#C0C0C0', category: 'neutral' },
					{ name: 'Nude', hex: '#F2D2A9', category: 'beige' },
					{ name: 'Muted Coral', hex: '#F88379', category: 'coral' }
				],
				good: [
					{ name: 'Navy Blue', hex: '#000080', category: 'blue' },
					{ name: 'Burgundy', hex: '#800020', category: 'red' },
					{ name: 'Emerald Green', hex: '#50C878', category: 'green' },
					{ name: 'Camel', hex: '#C19A6B', category: 'brown' },
					{ name: 'Charcoal', hex: '#36454F', category: 'neutral' },
					{ name: 'Soft Yellow', hex: '#FFFFE0', category: 'yellow' }
				],
				avoid: []
			}
		}
	}

	/**
	 * Analyze skin tone from user profile or image
	 * @param {Object} userProfile - User profile with skin tone data
	 * @returns {Object} Skin tone analysis
	 */
	analyzeSkinTone(userProfile) {
		// For now, use provided skin tone or default to neutral
		const skinTone = userProfile?.skinTone || SKIN_TONE_TYPES.NEUTRAL

		return {
			primaryTone: skinTone,
			confidence: userProfile?.skinToneConfidence || 0.8,
			undertone: this.getUndertone(skinTone),
			recommendations: this.getColorRecommendations(skinTone)
		}
	}

	/**
	 * Get undertone classification
	 * @param {string} skinTone - Primary skin tone
	 * @returns {string} Undertone classification
	 */
	getUndertone(skinTone) {
		const undertones = {
			[SKIN_TONE_TYPES.COOL]: 'pink/blue',
			[SKIN_TONE_TYPES.WARM]: 'yellow/golden',
			[SKIN_TONE_TYPES.NEUTRAL]: 'balanced'
		}
		return undertones[skinTone] || 'unknown'
	}

	/**
	 * Get color recommendations for skin tone
	 * @param {string} skinTone - Skin tone type
	 * @returns {Object} Color recommendations
	 */
	getColorRecommendations(skinTone) {
		return this.colorDatabase[skinTone] || this.colorDatabase.neutral
	}

	/**
	 * Calculate color compatibility score for garment
	 * @param {Object} garment - Garment with color information
	 * @param {string} skinTone - User's skin tone
	 * @returns {number} Compatibility score (0-1)
	 */
	getColorCompatibilityScore(garment, skinTone) {
		const recommendations = this.getColorRecommendations(skinTone)
		const garmentColors = garment.colors || [garment.primaryColor]

		let totalScore = 0
		let colorCount = 0

		for (const garmentColor of garmentColors) {
			if (!garmentColor) continue

			colorCount++
			const colorScore = this.calculateSingleColorScore(garmentColor, recommendations)
			totalScore += colorScore
		}

		return colorCount > 0 ? totalScore / colorCount : 0.5
	}

	/**
	 * Calculate compatibility score for a single color
	 * @param {string} color - Color to evaluate
	 * @param {Object} recommendations - Skin tone color recommendations
	 * @returns {number} Score (0-1)
	 */
	calculateSingleColorScore(color, recommendations) {
		const colorLower = color.toLowerCase()

		// Check excellent matches
		for (const excellentColor of recommendations.excellent) {
			if (this.colorMatches(colorLower, excellentColor)) {
				return 1.0
			}
		}

		// Check good matches
		for (const goodColor of recommendations.good) {
			if (this.colorMatches(colorLower, goodColor)) {
				return 0.75
			}
		}

		// Check colors to avoid
		for (const avoidColor of recommendations.avoid) {
			if (this.colorMatches(colorLower, avoidColor)) {
				return 0.2
			}
		}

		// Default neutral score
		return 0.5
	}

	/**
	 * Check if colors match (fuzzy matching)
	 * @param {string} color1 - First color
	 * @param {Object} colorObj - Color object with name and category
	 * @returns {boolean} Whether colors match
	 */
	colorMatches(color1, colorObj) {
		const name = colorObj.name.toLowerCase()
		const category = colorObj.category.toLowerCase()

		return color1.includes(name) ||
			color1.includes(category) ||
			name.includes(color1) ||
			category.includes(color1)
	}
}

/**
 * Rule-Based Item Pairing Engine
 * Provides intelligent garment pairing based on multiple factors
 */
class ItemPairingEngine {
	constructor() {
		this.skinToneColorMatcher = new SkinToneColorMatcher()

		// Style compatibility rules
		this.styleRules = {
			casual: {
				compatible: ['casual', 'smart_casual', 'streetwear'],
				formality: [1, 2, 3],
				patterns: ['solid', 'stripes', 'graphic']
			},
			formal: {
				compatible: ['formal', 'business_casual', 'smart_casual'],
				formality: [3, 4, 5, 6],
				patterns: ['solid', 'subtle_stripes', 'small_patterns']
			},
			business_casual: {
				compatible: ['business_casual', 'smart_casual', 'formal'],
				formality: [3, 4, 5],
				patterns: ['solid', 'subtle_stripes', 'small_checks']
			},
			smart_casual: {
				compatible: ['smart_casual', 'casual', 'business_casual'],
				formality: [2, 3, 4],
				patterns: ['solid', 'stripes', 'small_patterns']
			}
		}

		// Color harmony rules
		this.colorHarmonyRules = {
			complementary: ['red-green', 'blue-orange', 'yellow-purple'],
			analogous: ['blue-green', 'red-orange', 'yellow-green'],
			triadic: ['red-yellow-blue', 'orange-green-purple'],
			neutral: ['black', 'white', 'gray', 'beige', 'navy']
		}
	}

	/**
	 * Score potential pairing between two garments
	 * @param {Object} item1 - First garment
	 * @param {Object} item2 - Second garment
	 * @param {Object} context - Styling context (occasion, weather, etc.)
	 * @param {string} userSkinTone - User's skin tone
	 * @returns {Object} Pairing score and analysis
	 */
	scorePairing(item1, item2, context = {}, userSkinTone = 'neutral') {
		// Prevent pairing items of the same category (except accessories)
		if (this.isSameCategory(item1, item2)) {
			return { score: 0, reason: 'Same category items cannot be paired' }
		}

		let totalScore = 0
		const breakdown = {}

		// 1. Formality Matching (40% weight)
		const formalityScore = this.calculateFormalityScore(item1, item2, context)
		breakdown.formality = formalityScore
		totalScore += formalityScore * 0.4

		// 2. Color Harmony (25% weight)
		const colorScore = this.calculateColorHarmonyScore(item1, item2, userSkinTone)
		breakdown.colorHarmony = colorScore
		totalScore += colorScore * 0.25

		// 3. Style Coherence (20% weight)
		const styleScore = this.calculateStyleCoherence(item1, item2)
		breakdown.styleCoherence = styleScore
		totalScore += styleScore * 0.2

		// 4. Pattern Compatibility (15% weight)
		const patternScore = this.calculatePatternCompatibility(item1, item2)
		breakdown.patternCompatibility = patternScore
		totalScore += patternScore * 0.15

		return {
			score: Math.min(totalScore, 1.0),
			breakdown,
			recommendation: this.getRecommendationLevel(totalScore)
		}
	}

	/**
	 * Check if items are from the same category
	 * @param {Object} item1 - First item
	 * @param {Object} item2 - Second item
	 * @returns {boolean} Whether items are same category
	 */
	isSameCategory(item1, item2) {
		const cat1 = item1.category?.toLowerCase()
		const cat2 = item2.category?.toLowerCase()

		// Allow multiple accessories
		if (cat1 === 'accessory' && cat2 === 'accessory') {
			return false
		}

		return cat1 === cat2
	}

	/**
	 * Calculate formality matching score
	 * @param {Object} item1 - First item
	 * @param {Object} item2 - Second item
	 * @param {Object} context - Styling context
	 * @returns {number} Formality score (0-1)
	 */
	calculateFormalityScore(item1, item2, context) {
		const formality1 = this.getItemFormality(item1)
		const formality2 = this.getItemFormality(item2)
		const targetFormality = this.getTargetFormality(context.occasion)

		// Check if both items match target formality
		const diff1 = Math.abs(formality1 - targetFormality)
		const diff2 = Math.abs(formality2 - targetFormality)
		const avgDiff = (diff1 + diff2) / 2

		// Score decreases with formality mismatch
		return Math.max(0, 1 - (avgDiff / 3))
	}

	/**
	 * Get formality level for an item
	 * @param {Object} item - Garment item
	 * @returns {number} Formality level (1-6)
	 */
	getItemFormality(item) {
		const style = item.style?.toLowerCase() || ''
		const category = item.category?.toLowerCase() || ''

		// Map styles to formality levels
		if (style.includes('formal') || style.includes('business')) return 5
		if (style.includes('smart') || category === 'blazer') return 4
		if (style.includes('casual') && !style.includes('smart')) return 2
		if (style.includes('streetwear') || style.includes('sporty')) return 1

		return 3 // Default smart casual
	}

	/**
	 * Get target formality for occasion
	 * @param {string} occasion - Event occasion
	 * @returns {number} Target formality level
	 */
	getTargetFormality(occasion = '') {
		const occ = occasion.toLowerCase()

		if (occ.includes('formal') || occ.includes('wedding') || occ.includes('business')) return 5
		if (occ.includes('work') || occ.includes('office')) return 4
		if (occ.includes('date') || occ.includes('dinner')) return 3
		if (occ.includes('casual') || occ.includes('weekend')) return 2
		if (occ.includes('gym') || occ.includes('sports')) return 1

		return 3 // Default
	}

	/**
	 * Calculate color harmony score
	 * @param {Object} item1 - First item
	 * @param {Object} item2 - Second item
	 * @param {string} userSkinTone - User's skin tone
	 * @returns {number} Color harmony score (0-1)
	 */
	calculateColorHarmonyScore(item1, item2, userSkinTone) {
		// Get skin tone compatibility for both items
		const skinToneScore1 = this.skinToneColorMatcher.getColorCompatibilityScore(item1, userSkinTone)
		const skinToneScore2 = this.skinToneColorMatcher.getColorCompatibilityScore(item2, userSkinTone)
		const avgSkinToneScore = (skinToneScore1 + skinToneScore2) / 2

		// Calculate color harmony between items
		const harmonyScore = this.calculateItemColorHarmony(item1, item2)

		// Combine skin tone compatibility (60%) and color harmony (40%)
		return (avgSkinToneScore * 0.6) + (harmonyScore * 0.4)
	}

	/**
	 * Calculate color harmony between two items
	 * @param {Object} item1 - First item
	 * @param {Object} item2 - Second item
	 * @returns {number} Harmony score (0-1)
	 */
	calculateItemColorHarmony(item1, item2) {
		const color1 = (item1.primaryColor || '').toLowerCase()
		const color2 = (item2.primaryColor || '').toLowerCase()

		if (!color1 || !color2) return 0.5

		// Neutral colors work with everything
		if (this.isNeutralColor(color1) || this.isNeutralColor(color2)) {
			return 0.9
		}

		// Check for complementary colors
		if (this.areComplementaryColors(color1, color2)) {
			return 0.85
		}

		// Check for analogous colors
		if (this.areAnalogousColors(color1, color2)) {
			return 0.8
		}

		// Same color family
		if (this.isSameColorFamily(color1, color2)) {
			return 0.75
		}

		return 0.4 // Default for unmatched colors
	}

	/**
	 * Check if color is neutral
	 * @param {string} color - Color name
	 * @returns {boolean} Whether color is neutral
	 */
	isNeutralColor(color) {
		const neutrals = ['black', 'white', 'gray', 'grey', 'beige', 'navy', 'brown', 'tan', 'cream']
		return neutrals.some(neutral => color.includes(neutral))
	}

	/**
	 * Check if colors are complementary
	 * @param {string} color1 - First color
	 * @param {string} color2 - Second color
	 * @returns {boolean} Whether colors are complementary
	 */
	areComplementaryColors(color1, color2) {
		const complementaryPairs = [
			['red', 'green'], ['blue', 'orange'], ['yellow', 'purple'],
			['pink', 'green'], ['teal', 'coral']
		]

		return complementaryPairs.some(([c1, c2]) =>
			(color1.includes(c1) && color2.includes(c2)) ||
			(color1.includes(c2) && color2.includes(c1))
		)
	}

	/**
	 * Check if colors are analogous
	 * @param {string} color1 - First color
	 * @param {string} color2 - Second color
	 * @returns {boolean} Whether colors are analogous
	 */
	areAnalogousColors(color1, color2) {
		const analogousPairs = [
			['blue', 'green'], ['red', 'orange'], ['yellow', 'green'],
			['purple', 'blue'], ['orange', 'red']
		]

		return analogousPairs.some(([c1, c2]) =>
			(color1.includes(c1) && color2.includes(c2)) ||
			(color1.includes(c2) && color2.includes(c1))
		)
	}

	/**
	 * Check if colors are from same family
	 * @param {string} color1 - First color
	 * @param {string} color2 - Second color
	 * @returns {boolean} Whether colors are same family
	 */
	isSameColorFamily(color1, color2) {
		const colorFamilies = [
			['red', 'pink', 'burgundy', 'crimson'],
			['blue', 'navy', 'teal', 'turquoise'],
			['green', 'olive', 'forest', 'mint'],
			['yellow', 'gold', 'cream', 'ivory'],
			['purple', 'lavender', 'violet', 'plum'],
			['orange', 'coral', 'peach', 'salmon']
		]

		return colorFamilies.some(family =>
			family.some(c => color1.includes(c)) && family.some(c => color2.includes(c))
		)
	}

	/**
	 * Calculate style coherence score
	 * @param {Object} item1 - First item
	 * @param {Object} item2 - Second item
	 * @returns {number} Style coherence score (0-1)
	 */
	calculateStyleCoherence(item1, item2) {
		const style1 = (item1.style || '').toLowerCase()
		const style2 = (item2.style || '').toLowerCase()

		if (!style1 || !style2) return 0.5

		// Check if styles are compatible
		for (const [baseStyle, rules] of Object.entries(this.styleRules)) {
			if (style1.includes(baseStyle)) {
				if (rules.compatible.some(compat => style2.includes(compat))) {
					return 0.9
				}
			}
		}

		// Exact match
		if (style1 === style2) return 1.0

		return 0.3 // Incompatible styles
	}

	/**
	 * Calculate pattern compatibility score
	 * @param {Object} item1 - First item
	 * @param {Object} item2 - Second item
	 * @returns {number} Pattern compatibility score (0-1)
	 */
	calculatePatternCompatibility(item1, item2) {
		const pattern1 = (item1.pattern || 'solid').toLowerCase()
		const pattern2 = (item2.pattern || 'solid').toLowerCase()

		// Both solid is perfect
		if (pattern1 === 'solid' && pattern2 === 'solid') return 1.0

		// One solid, one patterned is good
		if (pattern1 === 'solid' || pattern2 === 'solid') return 0.8

		// Both patterned - depends on pattern types
		if (this.arePatternsCompatible(pattern1, pattern2)) return 0.6

		return 0.2 // Clashing patterns
	}

	/**
	 * Check if patterns are compatible
	 * @param {string} pattern1 - First pattern
	 * @param {string} pattern2 - Second pattern
	 * @returns {boolean} Whether patterns are compatible
	 */
	arePatternsCompatible(pattern1, pattern2) {
		// Small patterns with different types can work
		const smallPatterns = ['dots', 'small_checks', 'pinstripe']
		const isSmall1 = smallPatterns.some(p => pattern1.includes(p))
		const isSmall2 = smallPatterns.some(p => pattern2.includes(p))

		return isSmall1 && isSmall2 && pattern1 !== pattern2
	}

	/**
	 * Get recommendation level based on score
	 * @param {number} score - Pairing score
	 * @returns {string} Recommendation level
	 */
	getRecommendationLevel(score) {
		if (score >= 0.8) return 'excellent'
		if (score >= 0.6) return 'good'
		if (score >= 0.4) return 'fair'
		return 'poor'
	}

	/**
	 * Generate outfit recommendations for given items
	 * @param {Array} wardrobeItems - Available wardrobe items
	 * @param {Object} context - Styling context
	 * @param {string} userSkinTone - User's skin tone
	 * @param {number} maxRecommendations - Maximum recommendations to return
	 * @returns {Array} Ranked outfit recommendations
	 */
	generateOutfitRecommendations(wardrobeItems, context = {}, userSkinTone = 'neutral', maxRecommendations = 5) {
		const outfits = []

		// Find tops and bottoms for basic outfit combinations
		const tops = wardrobeItems.filter(item => item.category?.toLowerCase() === 'top')
		const bottoms = wardrobeItems.filter(item => item.category?.toLowerCase() === 'bottom')
		const shoes = wardrobeItems.filter(item => item.category?.toLowerCase() === 'shoes')
		const accessories = wardrobeItems.filter(item => item.category?.toLowerCase() === 'accessory')
		const outerwear = wardrobeItems.filter(item => item.category?.toLowerCase() === 'outerwear')

		// Generate top + bottom combinations
		for (const top of tops) {
			for (const bottom of bottoms) {
				const pairing = this.scorePairing(top, bottom, context, userSkinTone)

				if (pairing.score > 0.3) { // Only include reasonable pairings
					const outfit = {
						items: [top, bottom],
						score: pairing.score,
						breakdown: pairing.breakdown,
						recommendation: pairing.recommendation
					}

					// Add shoes if available
					if (shoes.length > 0) {
						const bestShoe = this.findBestAccessory(shoes, outfit.items, context, userSkinTone)
						if (bestShoe) {
							outfit.items.push(bestShoe.item)
							outfit.score = (outfit.score + bestShoe.score) / 2
						}
					}

					// Add accessories if available
					if (accessories.length > 0) {
						const bestAccessory = this.findBestAccessory(accessories, outfit.items, context, userSkinTone)
						if (bestAccessory && bestAccessory.score > 0.5) {
							outfit.items.push(bestAccessory.item)
						}
					}

					outfits.push(outfit)
				}
			}
		}

		// Sort by score and return top recommendations
		return outfits
			.sort((a, b) => b.score - a.score)
			.slice(0, maxRecommendations)
			.map((outfit, index) => ({
				...outfit,
				rank: index + 1,
				id: `outfit_${index + 1}`,
				context
			}))
	}

	/**
	 * Find best accessory/shoe for existing outfit
	 * @param {Array} accessories - Available accessories
	 * @param {Array} outfitItems - Current outfit items
	 * @param {Object} context - Styling context
	 * @param {string} userSkinTone - User's skin tone
	 * @returns {Object|null} Best accessory with score
	 */
	findBestAccessory(accessories, outfitItems, context, userSkinTone) {
		let bestAccessory = null
		let bestScore = 0

		for (const accessory of accessories) {
			let totalScore = 0
			let validPairings = 0

			// Score against each outfit item
			for (const outfitItem of outfitItems) {
				const pairing = this.scorePairing(accessory, outfitItem, context, userSkinTone)
				if (pairing.score > 0) {
					totalScore += pairing.score
					validPairings++
				}
			}

			if (validPairings > 0) {
				const avgScore = totalScore / validPairings
				if (avgScore > bestScore) {
					bestScore = avgScore
					bestAccessory = { item: accessory, score: avgScore }
				}
			}
		}

		return bestAccessory
	}
}

/**
 * Main Fashion AI Service
 * Coordinates all fashion AI functionality
 */
export class FashionAIService {
	constructor() {
		this.skinToneColorMatcher = new SkinToneColorMatcher()
		this.itemPairingEngine = new ItemPairingEngine()
	}

	/**
	 * Get comprehensive outfit recommendations
	 * @param {Object} params - Parameters for recommendations
	 * @returns {Object} Outfit recommendations with analysis
	 */
	async getOutfitRecommendations({
		userId,
		itemId = null,
		occasion = 'casual',
		weather = 'mild',
		skinTone = 'neutral',
		maxRecommendations = 5
	}) {
		try {
			// Fetch user's wardrobe items from database
			const wardrobeItems = await this.fetchUserWardrobe(userId)

			if (wardrobeItems.length === 0) {
				return {
					success: false,
					error: 'No wardrobe items found for user',
					recommendations: []
				}
			}

			// Build context for recommendations
			const context = {
				occasion,
				weather,
				season: this.getCurrentSeason(),
				timeOfDay: this.getTimeOfDay()
			}

			// Analyze user's skin tone if needed
			const userProfile = await this.getUserProfile(userId)
			const skinToneAnalysis = this.skinToneColorMatcher.analyzeSkinTone({
				skinTone: userProfile?.skinTone || skinTone
			})

			// Generate outfit recommendations
			const recommendations = this.itemPairingEngine.generateOutfitRecommendations(
				wardrobeItems,
				context,
				skinToneAnalysis.primaryTone,
				maxRecommendations
			)

			// If specific item requested, filter recommendations that include it
			let filteredRecommendations = recommendations
			if (itemId) {
				filteredRecommendations = recommendations.filter(outfit =>
					outfit.items.some(item => item.id === itemId)
				)
			}

			return {
				success: true,
				recommendations: filteredRecommendations,
				context,
				skinToneAnalysis: {
					primaryTone: skinToneAnalysis.primaryTone,
					undertone: skinToneAnalysis.undertone,
					colorRecommendations: skinToneAnalysis.recommendations
				},
				totalWardrobeItems: wardrobeItems.length,
				generatedAt: new Date().toISOString()
			}

		} catch (error) {
			console.error('Error generating outfit recommendations:', error)
			return {
				success: false,
				error: 'Failed to generate recommendations',
				details: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
			}
		}
	}

	/**
	 * Fetch user's wardrobe items from database
	 * @param {string} userId - User ID
	 * @returns {Array} Wardrobe items
	 */
	async fetchUserWardrobe(userId) {
		try {
			// Fetch garments from database with relevant fields
			const garments = await prisma.garment.findMany({
				where: {
					userId: userId
				},
				select: {
					id: true,
					name: true,
					category: true,
					subcategory: true,
					color: true,
					pattern: true,
					material: true,
					brand: true,
					images: true,
					tags: true,
					size: true,
					description: true
				}
			})

			// Filter out items without required fields and transform to expected format
			return garments
				.filter(garment => garment.category && garment.color)
				.map(garment => ({
					id: garment.id,
					name: garment.name,
					category: garment.category,
					subcategory: garment.subcategory,
					primaryColor: garment.color,
					colors: [garment.color], // Single color for now, can be extended
					style: this.extractStyleFromTags(garment.tags) || 'casual',
					pattern: garment.pattern || 'solid',
					material: garment.material,
					brand: garment.brand,
					formality: this.calculateFormality(garment.category, garment.subcategory, garment.tags),
					season: this.extractSeasonFromTags(garment.tags) || ['spring', 'summer', 'fall', 'winter'],
					imageUrl: garment.images?.[0] || null,
					size: garment.size,
					description: garment.description
				}))

		} catch (error) {
			console.error('Error fetching user wardrobe:', error)
			return []
		}
	}

	/**
	 * Get user profile with skin tone information
	 * @param {string} userId - User ID
	 * @returns {Object|null} User profile
	 */
	async getUserProfile(userId) {
		try {
			const user = await prisma.user.findUnique({
				where: { id: userId },
				include: {
					profile: true,
					styleProfile: true,
					avatars: {
						where: { isDefault: true },
						take: 1
					}
				}
			})

			if (!user) return null

			// Extract skin tone from avatar or default to neutral
			const skinTone = user.avatars?.[0]?.skinTone || 'neutral'

			return {
				skinTone,
				stylePreferences: user.styleProfile?.preferredStyles || [],
				colorPreferences: user.styleProfile?.preferredColors || [],
				measurements: {
					height: user.profile?.height,
					weight: user.profile?.weight,
					chestBust: user.profile?.chestBust,
					waist: user.profile?.waist,
					hips: user.profile?.hips
				}
			}
		} catch (error) {
			console.error('Error fetching user profile:', error)
			return null
		}
	}

	/**
	 * Get current season based on date
	 * @returns {string} Current season
	 */
	getCurrentSeason() {
		const month = new Date().getMonth() + 1
		if (month >= 3 && month <= 5) return 'spring'
		if (month >= 6 && month <= 8) return 'summer'
		if (month >= 9 && month <= 11) return 'autumn'
		return 'winter'
	}

	/**
	 * Get current time of day
	 * @returns {string} Time of day
	 */
	getTimeOfDay() {
		const hour = new Date().getHours()
		if (hour < 12) return 'morning'
		if (hour < 17) return 'afternoon'
		if (hour < 21) return 'evening'
		return 'night'
	}

	/**
	 * Extract style from garment tags
	 * @param {Array} tags - Garment tags
	 * @returns {string} Style classification
	 */
	extractStyleFromTags(tags = []) {
		const styleMap = {
			'professional': 'formal',
			'formal': 'formal',
			'business': 'business_casual',
			'smart-casual': 'smart_casual',
			'casual': 'casual',
			'athletic': 'casual',
			'sporty': 'casual',
			'elegant': 'formal',
			'minimalist': 'smart_casual'
		}

		for (const tag of tags) {
			const style = styleMap[tag.toLowerCase()]
			if (style) return style
		}

		return 'casual'
	}

	/**
	 * Calculate formality level based on garment attributes
	 * @param {string} category - Garment category
	 * @param {string} subcategory - Garment subcategory
	 * @param {Array} tags - Garment tags
	 * @returns {number} Formality level (1-6)
	 */
	calculateFormality(category, subcategory, tags = []) {
		// Tag-based formality
		const formalTags = ['formal', 'professional', 'business', 'elegant']
		const casualTags = ['casual', 'athletic', 'sporty', 'comfortable']

		if (tags.some(tag => formalTags.includes(tag.toLowerCase()))) {
			return 5
		}
		if (tags.some(tag => casualTags.includes(tag.toLowerCase()))) {
			return 2
		}

		// Category and subcategory based formality
		const formalityMap = {
			'shoes': {
				'dress-shoes': 5,
				'heels': 5,
				'boots': 3,
				'sneakers': 2,
				'sandals': 1
			},
			'bottom': {
				'trousers': 5,
				'chinos': 4,
				'jeans': 2,
				'shorts': 1,
				'joggers': 1
			},
			'top': {
				'button-down': 4,
				'blouse': 4,
				'turtleneck': 4,
				't-shirt': 2,
				'tank-top': 1
			},
			'outerwear': {
				'blazer': 5,
				'suit-jacket': 6,
				'coat': 4,
				'jacket': 3,
				'cardigan': 3
			},
			'dress': {
				'formal-dress': 5,
				'cocktail-dress': 4,
				'casual-dress': 2,
				'summer-dress': 2
			}
		}

		return formalityMap[category]?.[subcategory] || 3
	}

	/**
	 * Extract season suitability from garment tags
	 * @param {Array} tags - Garment tags
	 * @returns {Array} Suitable seasons
	 */
	extractSeasonFromTags(tags = []) {
		const seasonTags = {
			'summer': ['summer'],
			'winter': ['winter', 'warm'],
			'spring': ['spring'],
			'fall': ['fall', 'autumn']
		}

		const seasons = []
		for (const tag of tags) {
			for (const [season, keywords] of Object.entries(seasonTags)) {
				if (keywords.includes(tag.toLowerCase())) {
					seasons.push(season)
				}
			}
		}

		// Default to all seasons if none specified
		return seasons.length > 0 ? seasons : ['spring', 'summer', 'fall', 'winter']
	}
}

export default FashionAIService
