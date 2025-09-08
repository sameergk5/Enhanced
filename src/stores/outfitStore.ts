// Outfit State Management using Zustand
import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import { type OutfitCombination, type OutfitItem } from '../services/virtualTryOn'
import { type Garment } from '../services/wardrobe'

// Core state interfaces
export interface OutfitSelection {
	garmentId: string
	garment: Garment
	category: string
	position: OutfitItem['position']
	priority: number // For layering and conflict resolution
}

export interface OutfitCombinationRule {
	id: string
	name: string
	requiredCategories: string[]
	optionalCategories: string[]
	conflictingCategories: string[][]
	maxItemsPerCategory: Record<string, number>
	minItems: number
	maxItems: number
}

export interface OutfitGenerationOptions {
	includeOptional: boolean
	prioritizeFavorites: boolean
	respectSeasonality: boolean
	stylePreference?: 'casual' | 'formal' | 'business' | 'sporty' | 'party'
	maxCombinations: number
}

export interface OutfitState {
	// Current selections
	selectedItems: Record<string, OutfitSelection>
	currentCombination: OutfitCombination | null

	// Generated combinations
	generatedCombinations: OutfitCombination[]
	combinationIndex: number

	// State flags
	isGenerating: boolean
	lastGeneratedAt: number | null

	// Preferences
	combinationRules: OutfitCombinationRule[]
	generationOptions: OutfitGenerationOptions

	// Actions
	addItem: (garment: Garment) => void
	removeItem: (garmentId: string) => void
	clearSelection: () => void
	generateCombinations: () => Promise<void>
	selectCombination: (index: number) => void
	nextCombination: () => void
	previousCombination: () => void
	updateGenerationOptions: (options: Partial<OutfitGenerationOptions>) => void
	addCombinationRule: (rule: OutfitCombinationRule) => void
	removeCombinationRule: (ruleId: string) => void

	// Computed getters
	getSelectedByCategory: (category: string) => OutfitSelection[]
	getTotalSelectedCount: () => number
	getValidCombinations: () => OutfitCombination[]
	canGenerateCombinations: () => boolean
}

// Default combination rules
const defaultCombinationRules: OutfitCombinationRule[] = [
	{
		id: 'casual-complete',
		name: 'Casual Complete',
		requiredCategories: ['top', 'bottom', 'shoes'],
		optionalCategories: ['outerwear', 'accessory'],
		conflictingCategories: [['dress', 'top'], ['dress', 'bottom']],
		maxItemsPerCategory: { top: 2, bottom: 1, dress: 1, shoes: 1, outerwear: 1, accessory: 3 },
		minItems: 3,
		maxItems: 8
	},
	{
		id: 'dress-outfit',
		name: 'Dress Outfit',
		requiredCategories: ['dress', 'shoes'],
		optionalCategories: ['outerwear', 'accessory'],
		conflictingCategories: [['dress', 'top'], ['dress', 'bottom']],
		maxItemsPerCategory: { dress: 1, shoes: 1, outerwear: 1, accessory: 3 },
		minItems: 2,
		maxItems: 6
	},
	{
		id: 'layered-look',
		name: 'Layered Look',
		requiredCategories: ['top', 'bottom', 'outerwear', 'shoes'],
		optionalCategories: ['accessory'],
		conflictingCategories: [['dress', 'top'], ['dress', 'bottom']],
		maxItemsPerCategory: { top: 2, bottom: 1, outerwear: 1, shoes: 1, accessory: 2 },
		minItems: 4,
		maxItems: 7
	}
]

// Default generation options
const defaultGenerationOptions: OutfitGenerationOptions = {
	includeOptional: true,
	prioritizeFavorites: false,
	respectSeasonality: false,
	maxCombinations: 20
}

/**
 * Create the outfit state store
 */
export const useOutfitStore = create<OutfitState>()(
	devtools(
		persist(
			immer((set, get) => ({
				// Initial state
				selectedItems: {},
				currentCombination: null,
				generatedCombinations: [],
				combinationIndex: 0,
				isGenerating: false,
				lastGeneratedAt: null,
				combinationRules: defaultCombinationRules,
				generationOptions: defaultGenerationOptions,

				// Actions
				addItem: (garment: Garment) => {
					set((state) => {
						const selection: OutfitSelection = {
							garmentId: garment.id,
							garment,
							category: garment.category,
							position: getCategoryPosition(garment.category),
							priority: getCategoryPriority(garment.category)
						}

						// Check for category conflicts and limits
						const existingInCategory = (Object.values(state.selectedItems) as OutfitSelection[])
							.filter(item => item.category === garment.category)

						const activeRule = state.combinationRules[0] // Use first rule for now
						const maxForCategory = activeRule.maxItemsPerCategory[garment.category] || 1

						if (existingInCategory.length >= maxForCategory) {
							// Remove oldest item in category if at limit
							const oldestItem = existingInCategory
								.sort((a, b) => a.priority - b.priority)[0]
							if (oldestItem) {
								delete state.selectedItems[oldestItem.garmentId]
							}
						}

						state.selectedItems[garment.id] = selection

						// Clear generated combinations to force regeneration
						state.generatedCombinations = []
						state.currentCombination = null
						state.combinationIndex = 0
					})
				},

				removeItem: (garmentId: string) => {
					set((state) => {
						delete state.selectedItems[garmentId]

						// Clear generated combinations
						state.generatedCombinations = []
						state.currentCombination = null
						state.combinationIndex = 0
					})
				},

				clearSelection: () => {
					set((state) => {
						state.selectedItems = {}
						state.generatedCombinations = []
						state.currentCombination = null
						state.combinationIndex = 0
					})
				},

				generateCombinations: async () => {
					const state = get()
					if (!state.canGenerateCombinations()) return

					set((state) => {
						state.isGenerating = true
					})

					try {
						const combinations = await generateValidCombinations(
							Object.values(state.selectedItems),
							state.combinationRules,
							state.generationOptions
						)

						set((state) => {
							state.generatedCombinations = combinations
							state.currentCombination = combinations[0] || null
							state.combinationIndex = 0
							state.lastGeneratedAt = Date.now()
							state.isGenerating = false
						})

					} catch (error) {
						console.error('Failed to generate combinations:', error)
						set((state) => {
							state.isGenerating = false
						})
					}
				},

				selectCombination: (index: number) => {
					set((state) => {
						const combinations = state.generatedCombinations
						if (index >= 0 && index < combinations.length) {
							state.combinationIndex = index
							state.currentCombination = combinations[index]
						}
					})
				},

				nextCombination: () => {
					const state = get()
					const nextIndex = (state.combinationIndex + 1) % state.generatedCombinations.length
					state.selectCombination(nextIndex)
				},

				previousCombination: () => {
					const state = get()
					const prevIndex = state.combinationIndex === 0
						? state.generatedCombinations.length - 1
						: state.combinationIndex - 1
					state.selectCombination(prevIndex)
				},

				updateGenerationOptions: (options: Partial<OutfitGenerationOptions>) => {
					set((state) => {
						state.generationOptions = { ...state.generationOptions, ...options }
					})
				},

				addCombinationRule: (rule: OutfitCombinationRule) => {
					set((state) => {
						state.combinationRules.push(rule)
					})
				},

				removeCombinationRule: (ruleId: string) => {
					set((state) => {
						state.combinationRules = state.combinationRules.filter((rule: OutfitCombinationRule) => rule.id !== ruleId)
					})
				},

				// Computed getters
				getSelectedByCategory: (category: string) => {
					const state = get()
					return Object.values(state.selectedItems)
						.filter(item => item.category === category)
				},

				getTotalSelectedCount: () => {
					const state = get()
					return Object.keys(state.selectedItems).length
				},

				getValidCombinations: () => {
					const state = get()
					return state.generatedCombinations
				},

				canGenerateCombinations: () => {
					const state = get()
					const totalItems = state.getTotalSelectedCount()
					const minRequired = Math.min(...state.combinationRules.map(rule => rule.minItems))
					return totalItems >= minRequired
				}
			})),
			{
				name: 'outfit-store',
				partialize: (state) => ({
					selectedItems: state.selectedItems,
					generationOptions: state.generationOptions,
					combinationRules: state.combinationRules
				})
			}
		),
		{ name: 'OutfitStore' }
	)
)

/**
 * Generate valid outfit combinations from selected items
 */
async function generateValidCombinations(
	selections: OutfitSelection[],
	rules: OutfitCombinationRule[],
	options: OutfitGenerationOptions
): Promise<OutfitCombination[]> {
	const combinations: OutfitCombination[] = []

	// Group selections by category
	const byCategory = selections.reduce((acc, selection) => {
		if (!acc[selection.category]) acc[selection.category] = []
		acc[selection.category].push(selection)
		return acc
	}, {} as Record<string, OutfitSelection[]>)

	// Generate combinations for each rule
	for (const rule of rules) {
		const ruleCombinations = generateCombinationsForRule(byCategory, rule, options)
		combinations.push(...ruleCombinations)

		if (combinations.length >= options.maxCombinations) break
	}

	// Sort combinations by compatibility score
	return combinations
		.slice(0, options.maxCombinations)
		.sort((a, b) => b.compatibility - a.compatibility)
}

/**
 * Generate combinations for a specific rule
 */
function generateCombinationsForRule(
	byCategory: Record<string, OutfitSelection[]>,
	rule: OutfitCombinationRule,
	options: OutfitGenerationOptions
): OutfitCombination[] {
	const combinations: OutfitCombination[] = []

	// Check if we have required categories
	const hasRequiredCategories = rule.requiredCategories.every(cat => byCategory[cat]?.length > 0)
	if (!hasRequiredCategories) return combinations

	// Generate all possible combinations
	const requiredCombos = generateCategoryCombinations(byCategory, rule.requiredCategories, rule)

	for (const requiredCombo of requiredCombos) {
		// Add optional items if requested
		if (options.includeOptional) {
			const optionalCombos = generateCategoryCombinations(byCategory, rule.optionalCategories, rule)

			for (const optionalCombo of optionalCombos) {
				const fullCombo = [...requiredCombo, ...optionalCombo]

				if (isValidCombination(fullCombo, rule)) {
					const combination = createOutfitCombination(fullCombo, rule, options)
					combinations.push(combination)
				}
			}
		} else {
			if (isValidCombination(requiredCombo, rule)) {
				const combination = createOutfitCombination(requiredCombo, rule, options)
				combinations.push(combination)
			}
		}
	}

	return combinations
}

/**
 * Generate combinations for specific categories
 */
function generateCategoryCombinations(
	byCategory: Record<string, OutfitSelection[]>,
	categories: string[],
	rule: OutfitCombinationRule
): OutfitSelection[][] {
	if (categories.length === 0) return [[]]

	const [firstCategory, ...restCategories] = categories
	const itemsInCategory = byCategory[firstCategory] || []
	const maxItems = rule.maxItemsPerCategory[firstCategory] || 1

	const combinations: OutfitSelection[][] = []

	// Generate combinations for this category (0 to maxItems)
	for (let i = 0; i <= Math.min(itemsInCategory.length, maxItems); i++) {
		const categoryCombo = generateItemCombinations(itemsInCategory, i)
		const restCombos = generateCategoryCombinations(byCategory, restCategories, rule)

		for (const catCombo of categoryCombo) {
			for (const restCombo of restCombos) {
				combinations.push([...catCombo, ...restCombo])
			}
		}
	}

	return combinations
}

/**
 * Generate combinations of items (choose k from n)
 */
function generateItemCombinations<T>(items: T[], k: number): T[][] {
	if (k === 0) return [[]]
	if (k > items.length) return []

	const combinations: T[][] = []

	for (let i = 0; i <= items.length - k; i++) {
		const first = items[i]
		const rest = items.slice(i + 1)
		const restCombos = generateItemCombinations(rest, k - 1)

		for (const restCombo of restCombos) {
			combinations.push([first, ...restCombo])
		}
	}

	return combinations
}

/**
 * Check if a combination is valid according to rule
 */
function isValidCombination(selections: OutfitSelection[], rule: OutfitCombinationRule): boolean {
	// Check item count limits
	if (selections.length < rule.minItems || selections.length > rule.maxItems) {
		return false
	}

	// Check category conflicts
	const categories = selections.map(s => s.category)
	for (const conflictGroup of rule.conflictingCategories) {
		const conflictCount = conflictGroup.filter(cat => categories.includes(cat)).length
		if (conflictCount > 1) return false
	}

	// Check category limits
	const categoryCounts = categories.reduce((acc, cat) => {
		acc[cat] = (acc[cat] || 0) + 1
		return acc
	}, {} as Record<string, number>)

	for (const [category, count] of Object.entries(categoryCounts)) {
		const maxAllowed = rule.maxItemsPerCategory[category] || 1
		if (count > maxAllowed) return false
	}

	return true
}

/**
 * Create outfit combination from selections
 */
function createOutfitCombination(
	selections: OutfitSelection[],
	rule: OutfitCombinationRule,
	options: OutfitGenerationOptions
): OutfitCombination {
	const items: OutfitItem[] = selections.map((selection, index) => ({
		garmentId: selection.garmentId,
		garment: selection.garment,
		layer: calculateLayer(selection.category, index),
		position: selection.position
	}))

	// Calculate compatibility score
	const compatibility = calculateCompatibilityScore(items, options)

	return {
		id: generateCombinationId(items),
		name: `${rule.name} ${selections.length} items`,
		items: items.sort((a, b) => a.layer - b.layer),
		compatibility,
		styleCategory: determineStyleCategory(items, options),
		createdAt: new Date().toISOString()
	}
}

/**
 * Calculate layer for item positioning
 */
function calculateLayer(category: string, index: number): number {
	const baseLayers: Record<string, number> = {
		dress: 0,
		bottom: 1,
		top: 2,
		outerwear: 4,
		shoes: 0,
		accessory: 5
	}
	return (baseLayers[category] || 0) + index
}

/**
 * Calculate compatibility score for combination
 */
function calculateCompatibilityScore(items: OutfitItem[], options: OutfitGenerationOptions): number {
	let score = 0.8 // Base score

	// Bonus for favorites
	if (options.prioritizeFavorites) {
		const favoriteCount = items.filter(item => item.garment.isFavorite).length
		score += (favoriteCount / items.length) * 0.2
	}

	// Color harmony bonus (simplified)
	const colors = items.map(item => item.garment.color.toLowerCase())
	const uniqueColors = new Set(colors)
	if (uniqueColors.size <= 3) score += 0.1 // Good color coordination

	// Category balance bonus
	const categories = new Set(items.map(item => item.garment.category))
	if (categories.has('top') && categories.has('bottom') && categories.has('shoes')) {
		score += 0.1 // Complete outfit bonus
	}

	return Math.min(1.0, score)
}

/**
 * Determine style category for combination
 */
function determineStyleCategory(items: OutfitItem[], options: OutfitGenerationOptions): OutfitCombination['styleCategory'] {
	if (options.stylePreference) return options.stylePreference

	// Simple heuristic based on items
	const hasOuterwear = items.some(item => item.garment.category === 'outerwear')
	const hasDress = items.some(item => item.garment.category === 'dress')
	const formalKeywords = ['formal', 'business', 'dress', 'suit']

	const formalItems = items.filter(item =>
		formalKeywords.some(keyword =>
			item.garment.name.toLowerCase().includes(keyword) ||
			item.garment.tags?.some(tag => tag.toLowerCase().includes(keyword))
		)
	)

	if (formalItems.length > 0) return 'formal'
	if (hasDress) return 'party'
	if (hasOuterwear) return 'business'

	return 'casual'
}

/**
 * Generate unique ID for combination
 */
function generateCombinationId(items: OutfitItem[]): string {
	const sortedIds = items.map(item => item.garmentId).sort()
	return `combo-${sortedIds.join('-')}`
}

/**
 * Get position mapping for category
 */
function getCategoryPosition(category: string): OutfitItem['position'] {
	const positionMap: Record<string, OutfitItem['position']> = {
		top: 'top',
		dress: 'top',
		bottom: 'bottom',
		shoes: 'feet',
		outerwear: 'outerwear',
		accessory: 'accessories'
	}
	return positionMap[category] || 'accessories'
}

/**
 * Get priority for category (for conflict resolution)
 */
function getCategoryPriority(category: string): number {
	const priorities: Record<string, number> = {
		dress: 1,
		top: 2,
		bottom: 3,
		outerwear: 4,
		shoes: 5,
		accessory: 6
	}
	return priorities[category] || 10
}

export default useOutfitStore
