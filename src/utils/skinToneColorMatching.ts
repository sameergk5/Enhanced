// Skin-Tone to Garment Color Matching Algorithm
// Task 8.2: Core algorithm for skin tone based color recommendations

export interface SkinToneAnalysis {
	undertone: 'warm' | 'cool' | 'neutral'
	depth: 'light' | 'medium' | 'deep'
	rgb: { r: number; g: number; b: number }
	hex: string
	confidence: number
}

export interface ColorRecommendation {
	colorFamily: string
	hex: string
	rgb: { r: number; g: number; b: number }
	suitabilityScore: number
	category: 'excellent' | 'good' | 'fair' | 'avoid'
	reasoning: string
}

export interface ColorPalette {
	excellent: ColorRecommendation[]
	good: ColorRecommendation[]
	fair: ColorRecommendation[]
	avoid: ColorRecommendation[]
}

/**
 * Main class for skin tone color matching
 */
export class SkinToneColorMatcher {
	/**
	 * Analyze skin tone from RGB values
	 */
	analyzeSkinTone(rgb: { r: number; g: number; b: number }): SkinToneAnalysis {
		const { r, g, b } = rgb

		// Calculate undertone based on color ratios
		const undertone = this.determineUndertone(r, g, b)

		// Calculate depth based on overall brightness
		const depth = this.determineDepth(r, g, b)

		// Calculate confidence based on color separation
		const confidence = this.calculateAnalysisConfidence(r, g, b, undertone)

		return {
			undertone,
			depth,
			rgb,
			hex: this.rgbToHex(r, g, b),
			confidence
		}
	}

	/**
	 * Generate color recommendations for a skin tone
	 */
	generateColorRecommendations(skinTone: SkinToneAnalysis): ColorPalette {
		const recommendations = this.getBaseColorRecommendations(skinTone)

		return {
			excellent: recommendations.filter(rec => rec.category === 'excellent'),
			good: recommendations.filter(rec => rec.category === 'good'),
			fair: recommendations.filter(rec => rec.category === 'fair'),
			avoid: recommendations.filter(rec => rec.category === 'avoid')
		}
	}

	/**
	 * Score how well a garment color suits a skin tone
	 */
	scoreGarmentColor(
		garmentColorHex: string,
		skinTone: SkinToneAnalysis
	): number {
		const garmentRgb = this.hexToRgb(garmentColorHex)
		if (!garmentRgb) return 0.5

		const recommendations = this.generateColorRecommendations(skinTone)

		// Check if color is in recommendations
		const allRecommendations = [
			...recommendations.excellent,
			...recommendations.good,
			...recommendations.fair,
			...recommendations.avoid
		]

		// Find closest matching recommendation
		let bestMatch = allRecommendations[0]
		let minDistance = Infinity

		for (const rec of allRecommendations) {
			const distance = this.calculateColorDistance(garmentRgb, rec.rgb)
			if (distance < minDistance) {
				minDistance = distance
				bestMatch = rec
			}
		}

		// Return the suitability score of the best match
		return bestMatch ? bestMatch.suitabilityScore : 0.5
	}

	/**
	 * Get color recommendations that work well with a skin tone
	 */
	getBestColorsForSkinTone(skinTone: SkinToneAnalysis): string[] {
		const palette = this.generateColorRecommendations(skinTone)
		return [
			...palette.excellent.map(c => c.colorFamily),
			...palette.good.map(c => c.colorFamily)
		]
	}

	/**
	 * Determine undertone from RGB values
	 */
	private determineUndertone(r: number, g: number, b: number): 'warm' | 'cool' | 'neutral' {
		// Calculate color temperature indicators
		const yellowish = r > b && g > b // More red and green than blue
		const pinkish = r > g && b > g   // More red and blue than green
		const balanced = Math.abs(r - g) < 10 && Math.abs(g - b) < 10 && Math.abs(r - b) < 10

		// Calculate ratios for more precise analysis
		const warmRatio = (r + g) / (b + 1) // Avoid division by zero
		const coolRatio = (r + b) / (g + 1)

		if (balanced) {
			return 'neutral'
		} else if (yellowish && warmRatio > 1.2) {
			return 'warm'
		} else if (pinkish && coolRatio > 1.2) {
			return 'cool'
		} else if (warmRatio > coolRatio) {
			return 'warm'
		} else {
			return 'cool'
		}
	}

	/**
	 * Determine skin depth from RGB values
	 */
	private determineDepth(r: number, g: number, b: number): 'light' | 'medium' | 'deep' {
		const average = (r + g + b) / 3

		if (average > 180) {
			return 'light'
		} else if (average > 120) {
			return 'medium'
		} else {
			return 'deep'
		}
	}

	/**
	 * Calculate confidence in skin tone analysis
	 */
	private calculateAnalysisConfidence(
		r: number,
		g: number,
		b: number,
		undertone: 'warm' | 'cool' | 'neutral'
	): number {
		// Higher confidence when colors are more separated
		const colorSeparation = Math.abs(r - g) + Math.abs(g - b) + Math.abs(r - b)
		const separationScore = Math.min(1, colorSeparation / 150)

		// Higher confidence for clear warm/cool indicators
		const undertoneClarity = undertone === 'neutral' ? 0.7 : 0.9

		return (separationScore * 0.6) + (undertoneClarity * 0.4)
	}

	/**
	 * Get base color recommendations for a skin tone
	 */
	private getBaseColorRecommendations(skinTone: SkinToneAnalysis): ColorRecommendation[] {
		const { undertone, depth } = skinTone
		const recommendations: ColorRecommendation[] = []

		// Define color databases for different undertones and depths
		const colorDatabase = {
			warm: {
				light: {
					excellent: [
						{ family: 'coral', hex: '#FF7F7F', reasoning: 'Coral complements warm, light skin beautifully' },
						{ family: 'peach', hex: '#FFCBA4', reasoning: 'Peach enhances warm undertones' },
						{ family: 'warm-beige', hex: '#F5E6D3', reasoning: 'Warm beige creates harmonious neutrals' },
						{ family: 'golden-yellow', hex: '#FFD700', reasoning: 'Golden yellow brightens warm complexions' }
					],
					good: [
						{ family: 'burnt-orange', hex: '#CC5500', reasoning: 'Burnt orange is flattering but bold' },
						{ family: 'rust', hex: '#B7410E', reasoning: 'Rust tones complement without overwhelming' },
						{ family: 'warm-brown', hex: '#8B4513', reasoning: 'Warm brown provides grounding neutrals' }
					],
					fair: [
						{ family: 'olive-green', hex: '#808000', reasoning: 'Can work with careful styling' },
						{ family: 'mustard', hex: '#FFDB58', reasoning: 'Interesting but needs consideration' }
					],
					avoid: [
						{ family: 'cool-blue', hex: '#0066CC', reasoning: 'Cool blues clash with warm undertones' },
						{ family: 'bright-pink', hex: '#FF1493', reasoning: 'Too cool and harsh for warm, light skin' },
						{ family: 'icy-gray', hex: '#B8C6D6', reasoning: 'Cool grays wash out warm skin' }
					]
				},
				medium: {
					excellent: [
						{ family: 'terracotta', hex: '#E2725B', reasoning: 'Terracotta is perfect for warm, medium skin' },
						{ family: 'rich-gold', hex: '#FFD700', reasoning: 'Rich gold enhances natural warmth' },
						{ family: 'warm-burgundy', hex: '#800020', reasoning: 'Warm burgundy adds sophisticated depth' },
						{ family: 'burnt-sienna', hex: '#E97451', reasoning: 'Burnt sienna harmonizes beautifully' }
					],
					good: [
						{ family: 'olive', hex: '#808000', reasoning: 'Olive tones work well with medium warmth' },
						{ family: 'copper', hex: '#B87333', reasoning: 'Copper creates stunning contrast' },
						{ family: 'cream', hex: '#FFFDD0', reasoning: 'Cream provides elegant neutrals' }
					],
					fair: [
						{ family: 'forest-green', hex: '#228B22', reasoning: 'Can be striking with right styling' },
						{ family: 'plum', hex: '#8E4585', reasoning: 'Deep plum needs careful consideration' }
					],
					avoid: [
						{ family: 'electric-blue', hex: '#7DF9FF', reasoning: 'Too cool and bright' },
						{ family: 'neon-green', hex: '#39FF14', reasoning: 'Overwhelms natural skin warmth' },
						{ family: 'stark-white', hex: '#FFFFFF', reasoning: 'Can create harsh contrast' }
					]
				},
				deep: {
					excellent: [
						{ family: 'rich-emerald', hex: '#50C878', reasoning: 'Rich emerald creates stunning contrast' },
						{ family: 'deep-burgundy', hex: '#800020', reasoning: 'Deep burgundy enhances richness' },
						{ family: 'golden-bronze', hex: '#CD7F32', reasoning: 'Golden bronze complements deep warmth' },
						{ family: 'burnt-orange', hex: '#CC5500', reasoning: 'Burnt orange is vibrant and flattering' }
					],
					good: [
						{ family: 'deep-teal', hex: '#008080', reasoning: 'Deep teal provides rich contrast' },
						{ family: 'chocolate', hex: '#7B3F00', reasoning: 'Chocolate tones are naturally harmonious' },
						{ family: 'mustard', hex: '#FFDB58', reasoning: 'Mustard adds interesting warmth' }
					],
					fair: [
						{ family: 'navy', hex: '#000080', reasoning: 'Classic but may be too cool' },
						{ family: 'charcoal', hex: '#36454F', reasoning: 'Neutral but can be stark' }
					],
					avoid: [
						{ family: 'pastel-pink', hex: '#FFB6C1', reasoning: 'Too light and cool' },
						{ family: 'baby-blue', hex: '#89CFF0', reasoning: 'Washes out deep, warm skin' },
						{ family: 'light-gray', hex: '#D3D3D3', reasoning: 'Too light and cool-toned' }
					]
				}
			},
			cool: {
				light: {
					excellent: [
						{ family: 'soft-pink', hex: '#FFB6C1', reasoning: 'Soft pink enhances cool undertones' },
						{ family: 'lavender', hex: '#E6E6FA', reasoning: 'Lavender complements cool, light skin' },
						{ family: 'cool-gray', hex: '#8C92AC', reasoning: 'Cool gray provides perfect neutrals' },
						{ family: 'icy-blue', hex: '#B0E0E6', reasoning: 'Icy blue harmonizes with cool tones' }
					],
					good: [
						{ family: 'emerald', hex: '#50C878', reasoning: 'Emerald creates beautiful contrast' },
						{ family: 'rose', hex: '#FF007F', reasoning: 'Rose tones are naturally flattering' },
						{ family: 'slate-blue', hex: '#6A5ACD', reasoning: 'Slate blue is sophisticated' }
					],
					fair: [
						{ family: 'mint-green', hex: '#98FB98', reasoning: 'Fresh but can be overpowering' },
						{ family: 'burgundy', hex: '#800020', reasoning: 'Rich but may be too warm' }
					],
					avoid: [
						{ family: 'orange', hex: '#FFA500', reasoning: 'Orange clashes with cool undertones' },
						{ family: 'yellow', hex: '#FFFF00', reasoning: 'Yellow is too warm and harsh' },
						{ family: 'warm-brown', hex: '#8B4513', reasoning: 'Warm browns compete with cool skin' }
					]
				},
				medium: {
					excellent: [
						{ family: 'royal-blue', hex: '#4169E1', reasoning: 'Royal blue enhances cool medium skin' },
						{ family: 'deep-purple', hex: '#663399', reasoning: 'Deep purple is sophisticated and flattering' },
						{ family: 'cool-red', hex: '#DC143C', reasoning: 'Cool red provides vibrant contrast' },
						{ family: 'charcoal', hex: '#36454F', reasoning: 'Charcoal offers elegant neutrals' }
					],
					good: [
						{ family: 'teal', hex: '#008080', reasoning: 'Teal complements cool undertones well' },
						{ family: 'plum', hex: '#8E4585', reasoning: 'Plum adds depth and richness' },
						{ family: 'cool-beige', hex: '#F5F5DC', reasoning: 'Cool beige provides soft neutrals' }
					],
					fair: [
						{ family: 'forest-green', hex: '#228B22', reasoning: 'Can work but may be too warm' },
						{ family: 'maroon', hex: '#800000', reasoning: 'Deep enough but leans warm' }
					],
					avoid: [
						{ family: 'peach', hex: '#FFCBA4', reasoning: 'Peach is too warm for cool skin' },
						{ family: 'golden-yellow', hex: '#FFD700', reasoning: 'Golden tones clash with cool undertones' },
						{ family: 'rust', hex: '#B7410E', reasoning: 'Rust is overwhelmingly warm' }
					]
				},
				deep: {
					excellent: [
						{ family: 'electric-blue', hex: '#7DF9FF', reasoning: 'Electric blue creates striking contrast' },
						{ family: 'deep-magenta', hex: '#8B008B', reasoning: 'Deep magenta is bold and flattering' },
						{ family: 'true-white', hex: '#FFFFFF', reasoning: 'True white provides elegant contrast' },
						{ family: 'jet-black', hex: '#000000', reasoning: 'Black creates sophisticated depth' }
					],
					good: [
						{ family: 'deep-teal', hex: '#004D4D', reasoning: 'Deep teal is rich and complementary' },
						{ family: 'cool-burgundy', hex: '#722F37', reasoning: 'Cool burgundy adds sophistication' },
						{ family: 'silver-gray', hex: '#C0C0C0', reasoning: 'Silver provides elegant neutrals' }
					],
					fair: [
						{ family: 'deep-green', hex: '#006400', reasoning: 'Rich but may lean slightly warm' },
						{ family: 'deep-brown', hex: '#654321', reasoning: 'Neutral but can be muddy' }
					],
					avoid: [
						{ family: 'orange', hex: '#FFA500', reasoning: 'Orange is too warm and jarring' },
						{ family: 'gold', hex: '#FFD700', reasoning: 'Gold competes with cool undertones' },
						{ family: 'warm-beige', hex: '#F5E6D3', reasoning: 'Warm beige looks muddy on cool, deep skin' }
					]
				}
			},
			neutral: {
				light: {
					excellent: [
						{ family: 'soft-white', hex: '#FFFAF0', reasoning: 'Soft white is universally flattering' },
						{ family: 'taupe', hex: '#483C32', reasoning: 'Taupe provides perfect neutrals' },
						{ family: 'dusty-rose', hex: '#DCAE96', reasoning: 'Dusty rose adds gentle warmth' },
						{ family: 'sage-green', hex: '#9CAF88', reasoning: 'Sage green is naturally harmonious' }
					],
					good: [
						{ family: 'navy', hex: '#000080', reasoning: 'Navy is classic and versatile' },
						{ family: 'camel', hex: '#C19A6B', reasoning: 'Camel provides warm neutrals' },
						{ family: 'soft-blue', hex: '#6495ED', reasoning: 'Soft blue is gentle and flattering' }
					],
					fair: [
						{ family: 'bright-red', hex: '#FF0000', reasoning: 'Bold but can be overwhelming' },
						{ family: 'purple', hex: '#800080', reasoning: 'Interesting but needs careful styling' }
					],
					avoid: [
						{ family: 'neon-colors', hex: '#39FF14', reasoning: 'Neon colors are too harsh' },
						{ family: 'muddy-brown', hex: '#654321', reasoning: 'Muddy tones wash out neutral skin' }
					]
				},
				medium: {
					excellent: [
						{ family: 'true-red', hex: '#FF0000', reasoning: 'True red is striking on neutral skin' },
						{ family: 'deep-navy', hex: '#191970', reasoning: 'Deep navy is sophisticated and versatile' },
						{ family: 'rich-brown', hex: '#654321', reasoning: 'Rich brown provides elegant grounding' },
						{ family: 'emerald-green', hex: '#50C878', reasoning: 'Emerald green creates beautiful contrast' }
					],
					good: [
						{ family: 'burgundy', hex: '#800020', reasoning: 'Burgundy adds depth and richness' },
						{ family: 'charcoal', hex: '#36454F', reasoning: 'Charcoal is versatile and modern' },
						{ family: 'dusty-pink', hex: '#D8BFD8', reasoning: 'Dusty pink is soft and feminine' }
					],
					fair: [
						{ family: 'bright-orange', hex: '#FF8C00', reasoning: 'Bold but may be too intense' },
						{ family: 'electric-purple', hex: '#8A2BE2', reasoning: 'Striking but challenging to style' }
					],
					avoid: [
						{ family: 'washed-out-pastels', hex: '#F0F8FF', reasoning: 'Too pale for medium neutral skin' },
						{ family: 'muddy-greens', hex: '#556B2F', reasoning: 'Muddy tones look dull' }
					]
				},
				deep: {
					excellent: [
						{ family: 'crisp-white', hex: '#FFFFFF', reasoning: 'Crisp white creates stunning contrast' },
						{ family: 'bright-red', hex: '#FF0000', reasoning: 'Bright red is bold and beautiful' },
						{ family: 'royal-purple', hex: '#7851A9', reasoning: 'Royal purple is regal and flattering' },
						{ family: 'deep-turquoise', hex: '#008B8B', reasoning: 'Deep turquoise adds vibrant contrast' }
					],
					good: [
						{ family: 'gold', hex: '#FFD700', reasoning: 'Gold creates luxurious warmth' },
						{ family: 'deep-forest', hex: '#013220', reasoning: 'Deep forest is rich and grounding' },
						{ family: 'chocolate', hex: '#7B3F00', reasoning: 'Chocolate provides elegant neutrals' }
					],
					fair: [
						{ family: 'olive', hex: '#808000', reasoning: 'Sophisticated but can be muted' },
						{ family: 'burgundy', hex: '#800020', reasoning: 'Classic but may need bright accents' }
					],
					avoid: [
						{ family: 'pale-pastels', hex: '#E6E6FA', reasoning: 'Pale colors wash out deep skin' },
						{ family: 'light-gray', hex: '#D3D3D3', reasoning: 'Light grays create poor contrast' }
					]
				}
			}
		}

		const undertoneColors = colorDatabase[undertone]
		const depthColors = undertoneColors[depth]

		// Process each category
		Object.entries(depthColors).forEach(([category, colors]) => {
			colors.forEach(color => {
				const rgb = this.hexToRgb(color.hex)
				if (rgb) {
					recommendations.push({
						colorFamily: color.family,
						hex: color.hex,
						rgb,
						suitabilityScore: this.getSuitabilityScore(category as 'excellent' | 'good' | 'fair' | 'avoid'),
						category: category as 'excellent' | 'good' | 'fair' | 'avoid',
						reasoning: color.reasoning
					})
				}
			})
		})

		return recommendations
	}

	/**
	 * Convert suitability category to numerical score
	 */
	private getSuitabilityScore(category: 'excellent' | 'good' | 'fair' | 'avoid'): number {
		switch (category) {
			case 'excellent': return 0.95
			case 'good': return 0.8
			case 'fair': return 0.6
			case 'avoid': return 0.2
			default: return 0.5
		}
	}

	/**
	 * Calculate color distance between two RGB colors
	 */
	private calculateColorDistance(
		rgb1: { r: number; g: number; b: number },
		rgb2: { r: number; g: number; b: number }
	): number {
		const rDiff = rgb1.r - rgb2.r
		const gDiff = rgb1.g - rgb2.g
		const bDiff = rgb1.b - rgb2.b
		return Math.sqrt(rDiff * rDiff + gDiff * gDiff + bDiff * bDiff)
	}

	/**
	 * Convert RGB to hex
	 */
	private rgbToHex(r: number, g: number, b: number): string {
		return '#' + [r, g, b].map(x => {
			const hex = Math.round(x).toString(16)
			return hex.length === 1 ? '0' + hex : hex
		}).join('')
	}

	/**
	 * Convert hex to RGB
	 */
	hexToRgb(hex: string): { r: number; g: number; b: number } | null {
		const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
		return result ? {
			r: parseInt(result[1], 16),
			g: parseInt(result[2], 16),
			b: parseInt(result[3], 16)
		} : null
	}
}

/**
 * Utility functions for color analysis
 */
export const ColorAnalysisUtils = {
	/**
	 * Convert skin tone from avatar system to analysis format
	 */
	avatarSkinToAnalysis(avatarSkinHex: string): SkinToneAnalysis | null {
		const matcher = new SkinToneColorMatcher()
		const rgb = matcher.hexToRgb(avatarSkinHex)
		if (!rgb) return null

		return matcher.analyzeSkinTone(rgb)
	},

	/**
	 * Get quick color recommendation for a skin tone
	 */
	quickColorMatch(skinToneHex: string, garmentColorHex: string): number {
		const matcher = new SkinToneColorMatcher()
		const rgb = matcher.hexToRgb(skinToneHex)
		if (!rgb) return 0.5

		const skinTone = matcher.analyzeSkinTone(rgb)
		return matcher.scoreGarmentColor(garmentColorHex, skinTone)
	},

	/**
	 * Generate basic color palette for skin tone
	 */
	generateBasicPalette(skinToneHex: string): string[] {
		const matcher = new SkinToneColorMatcher()
		const rgb = matcher.hexToRgb(skinToneHex)
		if (!rgb) return []

		const skinTone = matcher.analyzeSkinTone(rgb)
		return matcher.getBestColorsForSkinTone(skinTone)
	},

	/**
	 * Check if a color is flattering for a skin tone
	 */
	isColorFlattering(skinToneHex: string, garmentColorHex: string): boolean {
		const score = ColorAnalysisUtils.quickColorMatch(skinToneHex, garmentColorHex)
		return score >= 0.7 // Good or excellent rating
	}
}

export default SkinToneColorMatcher
