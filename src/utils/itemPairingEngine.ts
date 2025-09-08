// Rule-Based Item Pairing Engine
// Task 8.3: Backend service for intelligent garment pairing

import { CompatibilityScore, GarmentAttributes, OutfitContext } from '../types/stylist'
import { SkinToneAnalysis, SkinToneColorMatcher } from './skinToneColorMatching'
import { StyleRuleEngine } from './styleRuleEngine'

export interface PairingResult {
	targetItem: GarmentAttributes
	pairedItem: GarmentAttributes
	compatibilityScore: CompatibilityScore
	ruleBreakdowns: RuleBreakdown[]
	recommendation: 'excellent' | 'good' | 'fair' | 'avoid'
	stylingTips: string[]
	confidence: number
}

export interface RuleBreakdown {
	ruleName: string
	category: string
	score: number
	impact: 'positive' | 'negative' | 'neutral'
	explanation: string
}

export interface PairingOptions {
	context?: OutfitContext
	userSkinTone?: SkinToneAnalysis
	preferredStyles?: string[]
	avoidPatterns?: string[]
	occasionPriority?: number // 0-1, how important occasion matching is
	colorHarmonyPriority?: number // 0-1, how important color harmony is
	styleCoherencePriority?: number // 0-1, how important style coherence is
}

/**
 * Main engine for rule-based garment pairing
 */
export class ItemPairingEngine {
	private styleEngine: StyleRuleEngine
	private colorMatcher: SkinToneColorMatcher

	constructor() {
		this.styleEngine = new StyleRuleEngine()
		this.colorMatcher = new SkinToneColorMatcher()
	}

	/**
	 * Find best pairing items for a target garment from a wardrobe collection
	 */
	findBestPairings(
		targetItem: GarmentAttributes,
		wardrobeItems: GarmentAttributes[],
		options: PairingOptions = {},
		maxResults: number = 10
	): PairingResult[] {
		const results: PairingResult[] = []

		// Filter compatible categories (don't pair tops with tops, etc.)
		const compatibleItems = this.filterCompatibleCategories(targetItem, wardrobeItems)

		for (const item of compatibleItems) {
			const pairingResult = this.evaluatePairing(targetItem, item, options)
			results.push(pairingResult)
		}

		// Sort by compatibility score and return top results
		return results
			.sort((a, b) => b.compatibilityScore - a.compatibilityScore)
			.slice(0, maxResults)
	}

	/**
	 * Evaluate compatibility between two specific items
	 */
	evaluatePairing(
		targetItem: GarmentAttributes,
		candidateItem: GarmentAttributes,
		options: PairingOptions = {}
	): PairingResult {
		const ruleBreakdowns: RuleBreakdown[] = []
		let totalScore = 0
		let totalWeight = 0

		// Apply all pairing rules
		const rules = this.getPairingRules()

		for (const rule of rules) {
			const result = this.applyPairingRule(rule, targetItem, candidateItem, options)
			ruleBreakdowns.push({
				ruleName: rule.name,
				category: rule.category,
				score: result.score,
				impact: result.score > 0.6 ? 'positive' : result.score < 0.4 ? 'negative' : 'neutral',
				explanation: result.explanation
			})

			totalScore += result.score * result.weight
			totalWeight += result.weight
		}

		const compatibilityScore = totalWeight > 0 ? totalScore / totalWeight : 0.5

		return {
			targetItem,
			pairedItem: candidateItem,
			compatibilityScore,
			ruleBreakdowns,
			recommendation: this.getRecommendationLevel(compatibilityScore),
			stylingTips: this.generateStylingTips(targetItem, candidateItem, ruleBreakdowns),
			confidence: this.calculateConfidence(ruleBreakdowns, options)
		}
	}

	/**
	 * Get outfit recommendations for multiple items
	 */
	createCompleteOutfit(
		anchorItem: GarmentAttributes,
		wardrobeItems: GarmentAttributes[],
		options: PairingOptions = {}
	): GarmentAttributes[] {
		const outfit: GarmentAttributes[] = [anchorItem]
		const remainingItems = wardrobeItems.filter(item => item.id !== anchorItem.id)

		// Find best pairing for each major category
		const categories = ['top', 'bottom', 'outerwear', 'shoes', 'accessory']

		for (const category of categories) {
			if (anchorItem.category === category) continue // Skip if anchor item is this category

			const categoryItems = remainingItems.filter(item => item.category === category)
			if (categoryItems.length === 0) continue

			const bestPairing = this.findBestPairings(anchorItem, categoryItems, options, 1)[0]
			if (bestPairing && bestPairing.compatibilityScore > 0.6) {
				outfit.push(bestPairing.pairedItem)
			}
		}

		return outfit
	}

	/**
	 * Filter items by compatible categories
	 */
	private filterCompatibleCategories(
		targetItem: GarmentAttributes,
		items: GarmentAttributes[]
	): GarmentAttributes[] {
		const compatibilityMatrix: Record<string, string[]> = {
			'top': ['bottom', 'outerwear', 'shoes', 'accessory'],
			'bottom': ['top', 'outerwear', 'shoes', 'accessory'],
			'dress': ['outerwear', 'shoes', 'accessory'],
			'outerwear': ['top', 'bottom', 'dress', 'shoes', 'accessory'],
			'shoes': ['top', 'bottom', 'dress', 'outerwear', 'accessory'],
			'accessory': ['top', 'bottom', 'dress', 'outerwear', 'shoes'],
			'undergarment': [] // Undergarments don't pair with other visible items
		}

		const compatibleCategories = compatibilityMatrix[targetItem.category] || []
		return items.filter(item =>
			item.id !== targetItem.id &&
			compatibleCategories.includes(item.category)
		)
	}

	/**
	 * Get all pairing rules
	 */
	private getPairingRules() {
		return [
			{
				name: 'color-harmony',
				category: 'color',
				weight: 0.25,
				description: 'Colors should harmonize well together'
			},
			{
				name: 'formality-matching',
				category: 'style',
				weight: 0.20,
				description: 'Formality levels should be compatible'
			},
			{
				name: 'pattern-compatibility',
				category: 'pattern',
				weight: 0.15,
				description: 'Patterns should not clash'
			},
			{
				name: 'style-coherence',
				category: 'style',
				weight: 0.15,
				description: 'Style keywords should align'
			},
			{
				name: 'occasion-appropriateness',
				category: 'occasion',
				weight: 0.10,
				description: 'Items should suit the same occasions'
			},
			{
				name: 'season-matching',
				category: 'season',
				weight: 0.10,
				description: 'Items should be appropriate for the same season'
			},
			{
				name: 'proportion-balance',
				category: 'fit',
				weight: 0.05,
				description: 'Fits should create balanced proportions'
			}
		]
	}

	/**
	 * Apply a specific pairing rule
	 */
	private applyPairingRule(
		rule: any,
		targetItem: GarmentAttributes,
		candidateItem: GarmentAttributes,
		options: PairingOptions
	): { score: number; weight: number; explanation: string } {
		let score = 0.5
		let explanation = ''

		switch (rule.name) {
			case 'color-harmony':
				score = this.evaluateColorHarmony(targetItem, candidateItem, options)
				explanation = `Color compatibility between ${targetItem.color.colorFamily} and ${candidateItem.color.colorFamily}`
				break

			case 'formality-matching':
				score = this.evaluateFormalityMatching(targetItem, candidateItem)
				explanation = `Formality match: ${targetItem.formality} with ${candidateItem.formality}`
				break

			case 'pattern-compatibility':
				score = this.evaluatePatternCompatibility(targetItem, candidateItem)
				explanation = `Pattern compatibility: ${targetItem.pattern} with ${candidateItem.pattern}`
				break

			case 'style-coherence':
				score = this.evaluateStyleCoherence(targetItem, candidateItem)
				explanation = `Style coherence based on shared keywords`
				break

			case 'occasion-appropriateness':
				score = this.evaluateOccasionMatch(targetItem, candidateItem, options)
				explanation = `Occasion compatibility for specified context`
				break

			case 'season-matching':
				score = this.evaluateSeasonMatch(targetItem, candidateItem, options)
				explanation = `Seasonal appropriateness match`
				break

			case 'proportion-balance':
				score = this.evaluateProportionBalance(targetItem, candidateItem)
				explanation = `Fit balance between items`
				break
		}

		// Apply user preferences
		const weight = this.adjustWeightByPreferences(rule.weight, rule.category, options)

		return { score, weight, explanation }
	}

	/**
	 * Evaluate color harmony between items
	 */
	private evaluateColorHarmony(
		item1: GarmentAttributes,
		item2: GarmentAttributes,
		options: PairingOptions
	): number {
		// Use existing style engine for basic color evaluation
		let baseScore = this.styleEngine.evaluateCompatibility(item1, item2, options.context)

		// Apply skin tone preferences if available
		if (options.userSkinTone) {
			// Use colorFamily for basic scoring since hex might not be available
			const skinScore1 = this.colorMatcher.scoreGarmentColor(item1.color.colorFamily, options.userSkinTone)
			const skinScore2 = this.colorMatcher.scoreGarmentColor(item2.color.colorFamily, options.userSkinTone)
			const avgSkinScore = (skinScore1 + skinScore2) / 2

			// Blend base compatibility with skin tone compatibility
			baseScore = (baseScore * 0.7) + (avgSkinScore * 0.3)
		}

		return baseScore
	}

	/**
	 * Evaluate formality matching
	 */
	private evaluateFormalityMatching(item1: GarmentAttributes, item2: GarmentAttributes): number {
		const formalityLevels = {
			'very-casual': 1, 'casual': 2, 'smart-casual': 3,
			'business': 4, 'formal': 5, 'black-tie': 6
		}

		const level1 = formalityLevels[item1.formality] || 3
		const level2 = formalityLevels[item2.formality] || 3
		const difference = Math.abs(level1 - level2)

		// Same level = perfect, 1 level diff = good, 2+ = poor
		if (difference === 0) return 0.95
		if (difference === 1) return 0.8
		if (difference === 2) return 0.6
		return 0.3
	}

	/**
	 * Evaluate pattern compatibility
	 */
	private evaluatePatternCompatibility(item1: GarmentAttributes, item2: GarmentAttributes): number {
		const pattern1 = item1.pattern
		const pattern2 = item2.pattern

		// Solid with anything is usually good
		if (pattern1 === 'solid' || pattern2 === 'solid') {
			return 0.9
		}

		// Same patterns can work if different scales/colors
		if (pattern1 === pattern2) {
			return 0.6 // Moderately risky but can work
		}

		// Compatible pattern combinations
		const compatiblePatterns: Record<string, string[]> = {
			'stripes': ['polka-dots', 'solid'],
			'polka-dots': ['stripes', 'solid'],
			'floral': ['solid'],
			'geometric': ['solid'],
			'abstract': ['solid'],
			'plaid': ['solid'],
			'checkered': ['solid'],
			'animal-print': ['solid'],
			'paisley': ['solid'],
			'tie-dye': ['solid']
		}

		if (compatiblePatterns[pattern1]?.includes(pattern2) ||
			compatiblePatterns[pattern2]?.includes(pattern1)) {
			return 0.75
		}

		// Different complex patterns are usually risky
		return 0.3
	}

	/**
	 * Evaluate style coherence
	 */
	private evaluateStyleCoherence(item1: GarmentAttributes, item2: GarmentAttributes): number {
		const styles1 = item1.styleKeywords
		const styles2 = item2.styleKeywords

		// Check for shared styles
		const sharedStyles = styles1.filter(style => styles2.includes(style))
		if (sharedStyles.length > 0) {
			return 0.9
		}

		// Check for compatible styles
		const compatibleStylePairs = [
			['minimalist', 'modern'],
			['bohemian', 'vintage'],
			['classic', 'preppy'],
			['edgy', 'rock'],
			['romantic', 'feminine']
		]

		for (const pair of compatibleStylePairs) {
			const hasStyle1 = styles1.some(s => pair.includes(s))
			const hasStyle2 = styles2.some(s => pair.includes(s))
			if (hasStyle1 && hasStyle2) {
				return 0.8
			}
		}

		// Check for conflicting styles
		const conflictingStyles = [
			['formal', 'athletic'],
			['minimalist', 'maximalist'],
			['classic', 'avant-garde']
		]

		for (const conflict of conflictingStyles) {
			const hasConflict1 = styles1.some(s => conflict[0] === s) && styles2.some(s => conflict[1] === s)
			const hasConflict2 = styles1.some(s => conflict[1] === s) && styles2.some(s => conflict[0] === s)
			if (hasConflict1 || hasConflict2) {
				return 0.2
			}
		}

		return 0.5
	}

	/**
	 * Evaluate occasion matching
	 */
	private evaluateOccasionMatch(
		item1: GarmentAttributes,
		item2: GarmentAttributes,
		options: PairingOptions
	): number {
		if (!options.context?.occasion) {
			return 0.5 // Neutral if no occasion specified
		}

		const occasion = options.context.occasion
		const item1Suitable = item1.occasion.includes(occasion)
		const item2Suitable = item2.occasion.includes(occasion)

		if (item1Suitable && item2Suitable) return 0.95
		if (item1Suitable || item2Suitable) return 0.7
		return 0.3
	}

	/**
	 * Evaluate season matching
	 */
	private evaluateSeasonMatch(
		item1: GarmentAttributes,
		item2: GarmentAttributes,
		options: PairingOptions
	): number {
		if (!options.context?.season) {
			return 0.5 // Neutral if no season specified
		}

		const season = options.context.season
		const item1Suitable = item1.season.includes(season) || item1.season.includes('all-season')
		const item2Suitable = item2.season.includes(season) || item2.season.includes('all-season')

		if (item1Suitable && item2Suitable) return 0.95
		if (item1Suitable || item2Suitable) return 0.7
		return 0.3
	}

	/**
	 * Evaluate proportion balance
	 */
	private evaluateProportionBalance(item1: GarmentAttributes, item2: GarmentAttributes): number {
		// Only applies to top-bottom combinations
		const isTopBottom = (
			(item1.category === 'top' && item2.category === 'bottom') ||
			(item1.category === 'bottom' && item2.category === 'top')
		)

		if (!isTopBottom) return 0.7 // Neutral for other combinations

		const fit1 = item1.fit
		const fit2 = item2.fit

		// Balanced combinations
		const balancedCombos = [
			['loose', 'fitted'], ['fitted', 'loose'],
			['oversized', 'slim'], ['slim', 'oversized'],
			['regular', 'regular']
		]

		for (const [f1, f2] of balancedCombos) {
			if ((fit1 === f1 && fit2 === f2) || (fit1 === f2 && fit2 === f1)) {
				return 0.9
			}
		}

		// Avoid both very loose or both very tight
		if ((fit1 === 'oversized' && fit2 === 'oversized') ||
			(fit1 === 'skinny' && fit2 === 'skinny')) {
			return 0.2
		}

		return 0.6
	}

	/**
	 * Adjust rule weight based on user preferences
	 */
	private adjustWeightByPreferences(baseWeight: number, category: string, options: PairingOptions): number {
		const priorityMap: Record<string, number> = {
			'occasion': options.occasionPriority || 1,
			'color': options.colorHarmonyPriority || 1,
			'style': options.styleCoherencePriority || 1
		}

		const priority = priorityMap[category] || 1
		return baseWeight * priority
	}

	/**
	 * Get recommendation level from score
	 */
	private getRecommendationLevel(score: number): 'excellent' | 'good' | 'fair' | 'avoid' {
		if (score >= 0.8) return 'excellent'
		if (score >= 0.65) return 'good'
		if (score >= 0.4) return 'fair'
		return 'avoid'
	}

	/**
	 * Generate styling tips based on pairing analysis
	 */
	private generateStylingTips(
		item1: GarmentAttributes,
		item2: GarmentAttributes,
		breakdowns: RuleBreakdown[]
	): string[] {
		const tips: string[] = []

		// Color tips
		const colorBreakdown = breakdowns.find(b => b.category === 'color')
		if (colorBreakdown && colorBreakdown.score > 0.8) {
			tips.push(`Great color harmony between ${item1.color.colorFamily} and ${item2.color.colorFamily}`)
		} else if (colorBreakdown && colorBreakdown.score < 0.4) {
			tips.push(`Consider adding a neutral accessory to bridge the color gap`)
		}

		// Pattern tips
		const patternBreakdown = breakdowns.find(b => b.category === 'pattern')
		if (patternBreakdown && patternBreakdown.score < 0.4) {
			tips.push(`Mix patterns carefully - try adding a solid piece to balance`)
		}

		// Style tips
		const styleBreakdown = breakdowns.find(b => b.category === 'style')
		if (styleBreakdown && styleBreakdown.score > 0.8) {
			tips.push(`Perfect style match - this creates a cohesive look`)
		}

		// Fit tips
		const fitBreakdown = breakdowns.find(b => b.category === 'fit')
		if (fitBreakdown && fitBreakdown.score > 0.8) {
			tips.push(`Excellent proportion balance - flattering silhouette`)
		}

		return tips
	}

	/**
	 * Calculate confidence in the pairing recommendation
	 */
	private calculateConfidence(breakdowns: RuleBreakdown[], options: PairingOptions): number {
		// Higher confidence when more rules agree
		const positiveRules = breakdowns.filter(b => b.impact === 'positive').length
		const negativeRules = breakdowns.filter(b => b.impact === 'negative').length
		const totalRules = breakdowns.length

		const agreementScore = (positiveRules - negativeRules) / totalRules

		// Higher confidence with user context
		const contextBonus = (options.context || options.userSkinTone) ? 0.1 : 0

		return Math.max(0, Math.min(1, 0.5 + agreementScore * 0.4 + contextBonus))
	}
}

/**
 * Utility functions for item pairing
 */
export const PairingUtils = {
	/**
	 * Quick compatibility check between two items
	 */
	quickCompatibilityCheck(item1: GarmentAttributes, item2: GarmentAttributes): boolean {
		const engine = new ItemPairingEngine()
		const result = engine.evaluatePairing(item1, item2)
		return result.compatibilityScore >= 0.6
	},

	/**
	 * Get pairing suggestions for a specific item
	 */
	getPairingSuggestions(
		targetItem: GarmentAttributes,
		wardrobe: GarmentAttributes[],
		maxSuggestions: number = 5
	): GarmentAttributes[] {
		const engine = new ItemPairingEngine()
		const pairings = engine.findBestPairings(targetItem, wardrobe, {}, maxSuggestions)
		return pairings.map(p => p.pairedItem)
	},

	/**
	 * Validate an outfit combination
	 */
	validateOutfit(outfit: GarmentAttributes[]): { isValid: boolean; issues: string[]; score: number } {
		if (outfit.length < 2) {
			return { isValid: false, issues: ['Outfit must contain at least 2 items'], score: 0 }
		}

		const engine = new ItemPairingEngine()
		const issues: string[] = []
		let totalScore = 0
		let pairCount = 0

		// Check all pairs in the outfit
		for (let i = 0; i < outfit.length - 1; i++) {
			for (let j = i + 1; j < outfit.length; j++) {
				const result = engine.evaluatePairing(outfit[i], outfit[j])
				totalScore += result.compatibilityScore
				pairCount++

				if (result.compatibilityScore < 0.4) {
					issues.push(`${outfit[i].name} and ${outfit[j].name} may not work well together`)
				}
			}
		}

		const avgScore = pairCount > 0 ? totalScore / pairCount : 0
		const isValid = avgScore >= 0.5 && issues.length === 0

		return { isValid, issues, score: avgScore }
	}
}

export default ItemPairingEngine
