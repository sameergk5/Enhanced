// Style Rule Engine Utilities - Simplified Version
// Task 8.1: Utilities for applying style rules

import { CompatibilityScore, GarmentAttributes, OutfitContext, RecommendationReasoning, StyleRecommendationResult, StyleRule } from '../types/stylist'

/**
 * Apply style rules to evaluate garment compatibility
 */
export class StyleRuleEngine {
	constructor(_customRules?: StyleRule[]) {
		// Rules will be used in future iterations
	}

	/**
	 * Evaluate compatibility between two garments
	 */
	evaluateCompatibility(
		garment1: GarmentAttributes,
		garment2: GarmentAttributes,
		_context?: OutfitContext
	): CompatibilityScore {
		// Basic compatibility evaluation
		let colorScore = this.evaluateColorCompatibility(garment1, garment2)
		let styleScore = this.evaluateStyleCompatibility(garment1, garment2)
		let formalityScore = this.evaluateFormalityCompatibility(garment1, garment2)

		// Weight the scores
		return (colorScore * 0.4) + (styleScore * 0.3) + (formalityScore * 0.3)
	}

	/**
	 * Get style recommendations for a garment against a wardrobe
	 */
	getRecommendations(
		targetGarment: GarmentAttributes,
		wardrobeGarments: GarmentAttributes[],
		context?: OutfitContext,
		limit: number = 5
	): StyleRecommendationResult[] {
		const recommendations = wardrobeGarments
			.filter(g => g.id !== targetGarment.id)
			.map(garment => {
				const compatibilityScore = this.evaluateCompatibility(targetGarment, garment, context)
				const reasoning = this.getRecommendationReasoning(targetGarment, garment, context)

				return {
					garmentId: garment.id,
					garment,
					compatibilityScore,
					reasoning,
					styleNotes: this.generateStyleNotes(targetGarment, garment),
					alternatives: [],
					confidence: this.calculateConfidence(compatibilityScore, reasoning)
				} as StyleRecommendationResult
			})
			.sort((a, b) => b.compatibilityScore - a.compatibilityScore)
			.slice(0, limit)

		return recommendations
	}

	/**
	 * Evaluate color compatibility
	 */
	private evaluateColorCompatibility(garment1: GarmentAttributes, garment2: GarmentAttributes): number {
		const color1 = garment1.color.colorFamily
		const color2 = garment2.color.colorFamily

		// Same color family (monochromatic)
		if (color1 === color2) {
			return 0.8
		}

		// Neutral colors are highly compatible
		const neutrals = ['black', 'white', 'gray', 'beige', 'cream', 'brown']
		if (neutrals.includes(color1) || neutrals.includes(color2)) {
			return 0.9
		}

		// Basic color harmony (simplified)
		const complementaryPairs = [
			['red', 'green'], ['blue', 'orange'], ['purple', 'yellow']
		]

		for (const pair of complementaryPairs) {
			if ((pair.includes(color1) && pair.includes(color2))) {
				return 0.85
			}
		}

		// Default for other combinations
		return 0.6
	}

	/**
	 * Evaluate style compatibility
	 */
	private evaluateStyleCompatibility(garment1: GarmentAttributes, garment2: GarmentAttributes): number {
		// Check for common style keywords
		const commonStyles = garment1.styleKeywords.filter(s => garment2.styleKeywords.includes(s))
		if (commonStyles.length > 0) {
			return 0.9
		}

		// Check for compatible styles (simplified)
		const compatibleStyles = [
			['minimalist', 'modern'], ['bohemian', 'vintage'], ['classic', 'preppy']
		]

		for (const pair of compatibleStyles) {
			const hasStyle1 = garment1.styleKeywords.some(s => pair.includes(s))
			const hasStyle2 = garment2.styleKeywords.some(s => pair.includes(s))
			if (hasStyle1 && hasStyle2) {
				return 0.8
			}
		}

		return 0.5
	}

	/**
	 * Evaluate formality compatibility
	 */
	private evaluateFormalityCompatibility(garment1: GarmentAttributes, garment2: GarmentAttributes): number {
		const formalityLevels = {
			'very-casual': 1, 'casual': 2, 'smart-casual': 3,
			'business': 4, 'formal': 5, 'black-tie': 6
		}

		const level1 = formalityLevels[garment1.formality] || 3
		const level2 = formalityLevels[garment2.formality] || 3
		const difference = Math.abs(level1 - level2)

		// Same level = perfect match
		if (difference === 0) return 1.0
		// One level difference = good match
		if (difference === 1) return 0.8
		// Two level difference = okay match
		if (difference === 2) return 0.6
		// More than two levels = poor match
		return 0.3
	}

	/**
	 * Generate detailed reasoning for recommendation
	 */
	private getRecommendationReasoning(
		garment1: GarmentAttributes,
		garment2: GarmentAttributes,
		_context?: OutfitContext
	): RecommendationReasoning {
		return {
			colorHarmony: this.evaluateColorCompatibility(garment1, garment2),
			styleCoherence: this.evaluateStyleCompatibility(garment1, garment2),
			occasionFit: 0.5, // Simplified
			personalMatch: garment1.isFavorite || garment2.isFavorite ? 0.8 : 0.5,
			trendRelevance: 0.5, // Simplified
			versatility: (garment1.versatility + garment2.versatility) / 20
		}
	}

	/**
	 * Generate style notes for pairing
	 */
	private generateStyleNotes(garment1: GarmentAttributes, garment2: GarmentAttributes): string[] {
		const notes: string[] = []

		// Color notes
		if (garment1.color.colorFamily === garment2.color.colorFamily) {
			notes.push('Monochromatic color scheme creates elegant cohesion')
		}

		// Pattern notes
		if (garment1.pattern === 'solid' && garment2.pattern !== 'solid') {
			notes.push('Solid piece balances the patterned item perfectly')
		}

		// Style notes
		const commonStyles = garment1.styleKeywords.filter(s => garment2.styleKeywords.includes(s))
		if (commonStyles.length > 0) {
			notes.push(`Shared ${commonStyles[0]} style creates visual harmony`)
		}

		// Formality notes
		if (garment1.formality === garment2.formality) {
			notes.push('Matching formality levels ensure appropriate look')
		}

		return notes
	}

	/**
	 * Calculate confidence score
	 */
	private calculateConfidence(score: CompatibilityScore, reasoning: RecommendationReasoning): number {
		// Higher confidence for extreme scores (very good or very bad)
		const extremeness = Math.abs(score - 0.5) * 2

		// Higher confidence when multiple factors align
		const factorAlignment = Object.values(reasoning).reduce((sum, val) => sum + Math.abs(val - 0.5), 0) / 6

		return Math.min(1, 0.5 + extremeness * 0.3 + factorAlignment * 0.2)
	}
}

/**
 * Utility functions for style analysis
 */
export const StyleUtils = {
	/**
	 * Get color harmony type between two colors
	 */
	getColorHarmonyType(color1: string, color2: string): 'complementary' | 'analogous' | 'triadic' | 'monochromatic' | 'none' {
		if (color1 === color2) return 'monochromatic'

		// Simplified complementary check
		const complementaryPairs = [
			['red', 'green'], ['blue', 'orange'], ['purple', 'yellow']
		]

		for (const pair of complementaryPairs) {
			if (pair.includes(color1) && pair.includes(color2)) {
				return 'complementary'
			}
		}

		return 'none'
	},

	/**
	 * Check pattern compatibility
	 */
	arePatternsCompatible(pattern1: string, pattern2: string): boolean {
		if (pattern1 === 'solid' || pattern2 === 'solid') return true
		if (pattern1 === pattern2) return false // Avoid same patterns
		return true // Simplified - most patterns can work together
	},

	/**
	 * Calculate formality difference
	 */
	getFormalityDifference(formality1: string, formality2: string): number {
		const levels = {
			'very-casual': 1, 'casual': 2, 'smart-casual': 3,
			'business': 4, 'formal': 5, 'black-tie': 6
		}

		const level1 = levels[formality1 as keyof typeof levels] || 3
		const level2 = levels[formality2 as keyof typeof levels] || 3
		return Math.abs(level1 - level2)
	},

	/**
	 * Check seasonal appropriateness
	 */
	isSeasonallyAppropriate(color: string, season: string): boolean {
		const seasonalColors = {
			spring: ['pink', 'green', 'yellow', 'white', 'cream'],
			summer: ['white', 'cream', 'yellow', 'blue', 'pink'],
			fall: ['brown', 'orange', 'red', 'burgundy'],
			winter: ['black', 'gray', 'navy', 'burgundy', 'white']
		}

		const colors = seasonalColors[season as keyof typeof seasonalColors] || []
		return colors.includes(color)
	}
}

export default StyleRuleEngine
